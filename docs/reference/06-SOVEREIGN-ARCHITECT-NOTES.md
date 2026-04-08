# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 6: SOVEREIGN ARCHITECT NOTES
# (Catatan Internal Arsitek — Distilasi dari Materi Anthropic + CCA-F)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Dokumen ini adalah terjemahan dari materi resmi Anthropic Academy, roadmap CCA-F, dan battle-tested patterns menjadi prinsip operasional yang langsung bisa diterapkan di Sovereign Engine."*
> — Internal architect note

---

## BAGIAN A: PRINSIP FUNDAMENTAL ANTHROPIC API

### A.1 — Claude adalah Stateless: Implikasi untuk Sovereign Engine

**Apa artinya:**
Claude tidak menyimpan memori antar API call. Setiap request = fresh context.

**Implikasi langsung untuk kita:**
```
❌ SALAH: Mengandalkan Claude "ingat" percakapan sebelumnya tanpa kirim history
✅ BENAR: Kirim conversation history eksplisit setiap request

// Pattern yang benar untuk LangGraph.js agents:
const messages = [
  { role: "user",      content: systemPrompt },
  { role: "assistant", content: previousResponse }, // inject history
  { role: "user",      content: currentInput }
];
```

**Aplikasi di Sovereign Engine:**
- ScoutScorer: Inject `lead_context` + `past_scores` di setiap call
- MessageComposer: Inject `outreach_history` dari `outreach_logs` tabel
- InsightGenerator: Inject `recent_insights` (last 7 days) untuk hindari duplikasi

---

### A.2 — Temperature & Sampling: Kapan Pakai Apa

| Nilai | Karakter | Gunakan Untuk |
|-------|----------|---------------|
| `temperature: 0` | Deterministik, repetable | Scoring (ScoutScorer), JSON extraction |
| `temperature: 0.3` | Stabil, sedikit variasi | MessageComposer (Day 0/3) |
| `temperature: 0.7` | Kreatif, natural | MessageComposer (custom), InsightGenerator |
| `temperature: 1.0+` | Sangat kreatif | JANGAN di production agents |

**Aturan Sovereign Engine:**
```typescript
// ScoutScorer — konsistensi penting
const scorerConfig = { temperature: 0, max_tokens: 500 };

// MessageComposer — perlu rasa personal
const composerConfig = { temperature: 0.4, max_tokens: 800 };

// InsightGenerator — perlu insight segar tapi akurat
const insightConfig = { temperature: 0.6, max_tokens: 1200 };
```

---

### A.3 — Structured Output: Wajib untuk Semua Agents

**Prinsip:** Jangan andalkan Claude untuk format output — ENFORCE secara programmatic.

```typescript
// ❌ ANTI-PATTERN: Andalkan prompt untuk JSON compliance
const prompt = "Respond in JSON format with score and reasoning";

// ✅ BENAR: Gunakan JSON mode + schema validation + retry loop
const response = await claude.messages.create({
  model: "claude-opus-4-5",
  max_tokens: 1024,
  messages: [...],
  tools: [{
    name: "submit_score",
    description: "Submit the lead score result",
    input_schema: {
      type: "object",
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        label: { type: "string", enum: ["HOT", "WARM", "COOL", "COLD"] },
        reasoning: { type: "string", maxLength: 200 },
        confidence: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["score", "label", "reasoning", "confidence"]
    }
  }],
  tool_choice: { type: "tool", name: "submit_score" }
});

// Validasi schema setelah terima response
function validateScoreOutput(output: any): boolean {
  return (
    typeof output.score === 'number' &&
    output.score >= 0 && output.score <= 100 &&
    ['HOT', 'WARM', 'COOL', 'COLD'].includes(output.label) &&
    typeof output.reasoning === 'string' &&
    output.reasoning.length <= 200
  );
}
```

---

### A.4 — Tool Use Architecture: Prinsip Paling Penting

**THE GOLDEN RULE (dari CCA-F exam material):**
> "Berikan setiap agent HANYA tools yang dibutuhkan untuk tugas spesifiknya. Maksimum 4-5 tools per agent."

```
❌ ANTI-PATTERN: Beri semua agents akses ke semua tools
  ScoutScorer dapat: read_leads, write_leads, send_wa, get_orders, run_crew...

✅ BENAR: Scope tools per role
  ScoutScorer dapat:     scraper_api.get_profile, serpapi.search, supabase.read_leads
  MessageComposer dapat: supabase.get_lead, supabase.get_history, supabase.get_count
  InsightGenerator dapat: supabase.get_stats, supabase.get_metrics, supabase.get_insights
```

**Tool Design Checklist (per CCA-F Domain 2):**
- [ ] Nama tool: verb_noun format (e.g., `get_lead_profile`, `search_web`)
- [ ] Description: singkat, spesifik, ada contoh input/output
- [ ] Input schema: typed, semua field ada description
- [ ] Error handling: setiap tool return structured error jika gagal
- [ ] Side effects: tools yang write data harus ada di whitelist eksplisit

---

### A.5 — Context Management: Hindari Attention Dilution

**Masalah:** Context window besar BUKAN solusi untuk kompleksitas.

**Prinsip dari Anthropic:**
> "Pisahkan context ke focused passes. Context panjang + pertanyaan spesifik = attention dilution."

```
❌ ANTI-PATTERN: Inject semua data ke satu prompt
  "Berikut data 50 leads, 100 orders, validation metrics, WA logs...
   Sekarang berikan insight terbaik."

✅ BENAR: Focused passes dengan data minimal yang relevan
  Pass 1 (InsightGenerator):
    Input: summary stats only (revenue_7d, hot_leads_count, wa_response_rate)
    Output: which areas need deeper analysis
  
  Pass 2 (targeted):
    Input: detailed data HANYA untuk area yang flagged
    Output: specific insights dengan data basis
```

**Implementasi di Sovereign Engine:**
```typescript
// InsightGenerator: 2-pass approach
async function generateInsights(env: Env) {
  // Pass 1: Summary only
  const summary = await supabase.getDashboardSummary(); // lightweight
  const areasToAnalyze = await claude.identifyFocusAreas(summary);
  
  // Pass 2: Deep dive hanya area yang flagged
  const detailData = await supabase.getDetailedData(areasToAnalyze);
  const insights = await claude.generateDetailedInsights(detailData);
  
  return insights;
}
```

---

## BAGIAN B: AGENTIC ARCHITECTURE — PRINSIP CCA-F DOMAIN 1

### B.1 — Agentic Loop Pattern

**Framework yang digunakan Sovereign Engine: LangGraph.js State Machine**

```
State → Tool Call → Tool Result → Next State → [Loop or Exit]

Untuk ScoutScorer:
  INIT_STATE
      │
      ▼
  FETCH_PROFILE (tool: scraper_api)
      │
      ▼
  ENRICH_DATA (tool: serpapi, optional)
      │
      ▼
  COMPUTE_BASE_SCORE (deterministic)
      │
      ▼
  AI_OVERLAY (Claude call)
      │
      ▼
  VALIDATE_OUTPUT (schema check)
      │
  [pass]  [fail → retry max 2x]
      │
      ▼
  RETURN_RESULT
```

### B.2 — Error Handling di Agentic Loop

**Prinsip CCA-F:** Silent sub-agent failure adalah anti-pattern berbahaya.

```typescript
// ❌ ANTI-PATTERN: Silent failure
async function scoreLeadAgent(leadId: string) {
  try {
    const result = await claude.score(leadId);
    return result;
  } catch (e) {
    return null; // ← BERBAHAYA: caller tidak tahu ada masalah
  }
}

// ✅ BENAR: Structured error context
async function scoreLeadAgent(leadId: string): Promise<AgentResult> {
  try {
    const result = await claude.score(leadId);
    if (!validateScoreOutput(result)) {
      return {
        success: false,
        error: "SCHEMA_VALIDATION_FAILED",
        partial_result: result,
        retry_allowed: true
      };
    }
    return { success: true, data: result };
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
      error_type: classifyError(e), // "rate_limit" | "timeout" | "api_error"
      fallback_available: true,
      retry_allowed: e.status !== 400
    };
  }
}
```

### B.3 — Orchestration: Kapan LangGraph vs CrewAI

| Kriteria | LangGraph.js (Edge) | CrewAI (External FastAPI) |
|---------|---------------------|--------------------------|
| **Latency requirement** | <5 detik | 1-15 menit |
| **Deployment** | Cloudflare Workers | External Docker/Python |
| **Complexity** | Single agent, simple flow | Multi-agent, complex reasoning |
| **Biaya** | Low (per token) | Higher (per crew run) |
| **Gunakan untuk** | ScoutScorer, Composer, InsightGen | MarketValidation, LeadResearch crew |
| **CF Workers 10ms limit** | ✅ Aman (async tool calls) | ✅ Aman (external HTTP call) |

**Sovereign Engine Decision Tree:**
```
Tugas masuk
    │
    ├── Butuh jawaban dalam detik?  → LangGraph.js
    ├── Butuh analisis multi-perspektif? → CrewAI
    ├── Ada data sensitif? → LangGraph.js (edge, no external storage)
    └── Jadwal mingguan? → CrewAI (async, tidak butuh realtime)
```

### B.4 — Programmatic Enforcement vs Prompt-Based Guidance

**PRINSIP TERPENTING CCA-F (47% soal dari Domain 1 & 3):**
> "Jika behavior sistem HARUS dijamin → gunakan KODE, bukan prompt."

| Apa yang Ingin Dijamin | Salah (Prompt) | Benar (Kode) |
|------------------------|-----------------|--------------|
| Agent tidak kirim WA dua kali | "Jangan kirim ulang kalau sudah dikirim 24 jam lalu" | `if (lastSentAt > 24h) throw new Error('RATE_LIMIT')` |
| Score di antara 0-100 | "Pastikan score antara 0 dan 100" | `Math.min(100, Math.max(0, score))` |
| JSON output valid | "Jawab selalu dalam JSON" | Schema tool + zod/joi validation |
| Agent tidak akses data sensitif | "Jangan akses tabel customers" | Tool list tidak include `read_customers` |
| Retry max 2x | "Kalau gagal coba lagi tapi jangan terlalu banyak" | `let attempts = 0; while(attempts < 2)` |

---

## BAGIAN C: CLAUDE CODE CONFIGURATION — CCA-F DOMAIN 3

### C.1 — CLAUDE.md: Project Memory File

**Apa ini:** File konfigurasi yang Claude Code baca otomatis di setiap sesi.

**Template untuk Sovereign Engine:**
```markdown
# SOVEREIGN BUSINESS ENGINE — CLAUDE.md

## Project Context
Private AI-orchestrated business engine untuk 3 brand fashion Instagram.
Tech stack: Hono.js + Cloudflare Workers + LangGraph.js + Supabase.

## Architecture Principles
1. Cloudflare Workers = edge runtime, NO Node.js APIs
2. LangGraph.js = edge AI agents (ScoutScorer, MessageComposer, InsightGenerator)
3. CrewAI = external FastAPI service (NEVER run on CF Workers)
4. Supabase = single source of truth, ALL writes via service_role

## Code Style
- TypeScript strict mode
- Zod untuk semua schema validation
- Error responses selalu { success: false, error: string, code: string }
- Logs ke console.error untuk CF Workers log viewer

## Prohibited Actions
- NEVER commit API keys or tokens to git
- NEVER use Node.js fs, path, child_process (CF Workers doesn't support)
- NEVER store state in memory (Workers = stateless)
- NEVER make synchronous HTTP calls (always async/await)

## File Locations
- src/index.ts → Main Hono app entry
- src/agents/ → LangGraph.js agent definitions
- src/routes/ → API route handlers
- migrations/ → Supabase D1 migration files (if any)
```

### C.2 — Workflow Otomasi dengan Claude Code

**Pattern yang benar untuk build session dengan AI Developer:**

```bash
# Step 1: Context setting (WAJIB di awal setiap sesi)
"Baca CLAUDE.md ini dulu sebelum mulai:"
[paste CLAUDE.md content]

# Step 2: One task at a time (JANGAN batch)
"Tugas satu ini dulu: Build /api/wa/send endpoint menggunakan Fonnte API.
 Input schema: { phone: string, message: string }
 Output schema: { success: boolean, message_id: string }
 Error handling: return { success: false, error: string, code: 'FONNTE_ERROR' }
 Referensi: Fonnte docs di src/docs/fonnte-api.md"

# Step 3: Verifikasi sebelum lanjut
"Sebelum lanjut, test dulu endpoint ini dengan curl:
 curl -X POST localhost:3000/api/wa/send -d '{"phone":"628xxx","message":"test"}'
 Kalau error, perbaiki dulu."

# Step 4: Commit setelah verified
"Commit dengan pesan: 'feat: add Fonnte WA send endpoint with error handling'"
```

### C.3 — Context Management dalam Build Session

**Problem:** AI Developer kehilangan context saat sesi panjang.

**Solusi (CCA-F Domain 5 principle):**
```
Buat SKILL.md per sesi — snapshot apa yang sudah selesai

// SKILL.md format:
## Sesi Build 2026-04-02

### Selesai (Verified)
- [x] /api/wa/send → POST, Fonnte integration, logged ke wa_logs
- [x] /api/wa/broadcast → batch send, chunking 10 per batch
- [x] wa_logs table schema → id, phone, message, status, created_at

### In Progress
- [ ] /api/scout/gather → ScraperAPI integration (progress: route created, belum test)

### Blocked
- OPENAI_API_KEY belum ada → ScoutScorer agent tidak bisa ditest

### Next Session
1. Finish /api/scout/gather
2. Build ScoutScorer LangGraph agent (tunggu OpenAI key)
3. Update Scout UI
```

---

## BAGIAN D: PROMPT ENGINEERING — CCA-F DOMAIN 4

### D.1 — System Prompt Architecture

**Prinsip:** System prompt = "kontrak" yang mendefinisikan kapasitas agent.

**Template struktur untuk Sovereign Engine agents:**
```
ROLE (siapa agent ini)
CONTEXT (apa yang agent tahu tentang bisnis)
CAPABILITIES (apa yang bisa dilakukan)
CONSTRAINTS (apa yang TIDAK boleh dilakukan)
OUTPUT FORMAT (selalu sertakan JSON schema)
QUALITY CRITERIA (apa artinya output yang bagus)
```

**Contoh ScoutScorer System Prompt:**
```
ROLE: Kamu adalah Lead Intelligence Scorer untuk Sovereign Business Engine, sistem AI private milik Haidar Faras Maulia untuk bisnis fashion Indonesia.

CONTEXT: Bisnis ini memiliki 3 brand Instagram yang beroperasi sebagai Market Validation Lab. Target utama adalah menemukan reseller fashion potensial di Instagram yang bisa dikonversi.

CAPABILITIES: 
- Menganalisis profil Instagram untuk menilai potensi sebagai reseller
- Memberikan skor 0-100 dengan reasoning actionable
- Mendeteksi "digital gap" — toko yang belum punya sistem digital yang baik

CONSTRAINTS:
- Jangan hallucinate data yang tidak ada
- Jangan berikan skor tinggi hanya karena follower besar
- Confidence < 0.6 jika data tidak lengkap

OUTPUT FORMAT: [sertakan full JSON schema]

QUALITY CRITERIA: Output berkualitas tinggi jika:
1. Score mencerminkan potensi konversi nyata (bukan vanity metrics)
2. Reasoning bisa langsung dijadikan dasar keputusan outreach
3. Recommended_action spesifik dan dapat dikerjakan hari ini
```

### D.2 — Few-Shot Examples: Kapan dan Bagaimana

```typescript
// Untuk ScoutScorer: gunakan 2-3 contoh grounding
const fewShotExamples = [
  {
    input: {
      username: "tokobaju_official",
      followers: 8500,
      bio: "Toko baju murah, bisa COD, reseller welcome",
      engagement_rate: 4.2,
      digital_gap: "HIGH" // tidak punya website/katalog digital
    },
    output: {
      score: 87,
      label: "HOT",
      reasoning: "Follower 8.5K dengan engagement 4.2% sangat kuat untuk toko fashion. Bio eksplisit menyebut 'reseller welcome' dan 'COD'. Digital gap HIGH berarti mereka butuh sistem — peluang besar untuk FashionKas.",
      recommended_action: "Outreach hari ini dengan Day 0 template"
    }
  },
  {
    input: {
      username: "influencer_kece",
      followers: 50000,
      bio: "Fashion blogger | collab DM",
      engagement_rate: 0.8,
      digital_gap: "LOW"
    },
    output: {
      score: 35,
      label: "COLD",
      reasoning: "Meski follower besar (50K), engagement rate 0.8% sangat rendah untuk akun fashion. Bio menunjukkan ini influencer, bukan reseller. Digital gap LOW berarti sudah punya sistem.",
      recommended_action: "Skip — bukan profil reseller"
    }
  }
];
```

### D.3 — Retry Logic & Validation Pipeline

```typescript
// CCA-F anti-pattern: prompt-only JSON compliance
// BENAR: schema validation + retry loop

async function runScoutScorer(leadData: LeadInput, maxRetries = 2): Promise<ScoreOutput> {
  let lastError: string = '';
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await callClaudeWithTool(leadData);
    
    // Validate schema
    const validation = scoreOutputSchema.safeParse(response);
    if (validation.success) {
      return validation.data;
    }
    
    lastError = validation.error.message;
    
    // Jika attempt terakhir, return structured error
    if (attempt === maxRetries) {
      return {
        success: false,
        error: `Schema validation failed after ${maxRetries + 1} attempts: ${lastError}`,
        code: 'VALIDATION_FAILED',
        fallback_score: computeBaseScore(leadData) // fallback ke deterministic
      };
    }
    
    // Tambah context untuk retry: "Response sebelumnya invalid karena..."
    injectRetryContext(lastError);
  }
}
```

---

## BAGIAN E: MCP (MODEL CONTEXT PROTOCOL) — CCA-F DOMAIN 2

### E.1 — Apa MCP dan Relevansinya untuk Sovereign Engine

**Definisi:** MCP adalah protocol standar untuk menghubungkan AI ke tools eksternal (database, files, APIs) dengan cara yang aman dan terkontrol.

**Relevansi untuk Sovereign Engine:**
```
Saat ini: Claude (LangGraph.js) memanggil Supabase, ScraperAPI, Fonnte via custom HTTP
Masa depan: Bungkus setiap layanan sebagai MCP server → standardized, testable, auditable

MCP Servers yang bisa dibuat untuk Sovereign Engine:
  1. supabase-mcp-server   → Read/write Supabase dengan RLS awareness
  2. scraper-mcp-server    → Instagram profile fetching
  3. fonnte-mcp-server     → WA send dengan rate limiting built-in
  4. analytics-mcp-server  → Read-only dashboard metrics
```

### E.2 — Tool Schema Design Principles (Domain 2)

```typescript
// ❌ ANTI-PATTERN: Vague tool description
const badTool = {
  name: "get_data",
  description: "Gets data",
  input_schema: { type: "object" }
};

// ✅ BENAR: Precise, typed, dengan constraints
const goodTool = {
  name: "get_lead_profile",
  description: "Fetches detailed Instagram profile data for a specific lead to support scoring. Returns follower count, bio, engagement rate, and digital gap assessment.",
  input_schema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "Instagram username without @ symbol. Example: 'tokobaju_official'",
        pattern: "^[a-zA-Z0-9._]+$"
      },
      include_posts: {
        type: "boolean",
        description: "Whether to fetch recent posts for engagement analysis. Default: true. Set false to reduce API cost if follower count is sufficient.",
        default: true
      }
    },
    required: ["username"]
  }
};
```

### E.3 — Tool Boundary Design

**Prinsip:** Setiap tool harus single responsibility + clear side effect declaration.

```typescript
// Tool inventory untuk Sovereign Engine:
const TOOL_REGISTRY = {
  // READ-ONLY tools (safe untuk semua agents)
  "get_lead_data":        { scope: "read",  tables: ["leads"] },
  "get_dashboard_stats":  { scope: "read",  tables: ["orders", "leads", "customers"] },
  "get_outreach_history": { scope: "read",  tables: ["outreach_logs", "wa_logs"] },
  "search_web":           { scope: "external", service: "serpapi" },
  "get_ig_profile":       { scope: "external", service: "scraperapi" },
  
  // WRITE tools (hanya untuk agents yang perlu)
  "save_lead_score":      { scope: "write", tables: ["leads"], fields: ["score", "label", "notes"] },
  "log_wa_message":       { scope: "write", tables: ["wa_logs"] },
  "save_insight":         { scope: "write", tables: ["ai_insights"] },
  
  // EXECUTE tools (berbahaya — limit ketat)
  "send_wa_message":      { scope: "execute", service: "fonnte", rateLimit: "1/phone/24h" },
  "broadcast_wa":         { scope: "execute", service: "fonnte", rateLimit: "50/hour" }
};

// Tool assignment per agent:
const AGENT_TOOLS = {
  ScoutScorer:      ["get_ig_profile", "search_web", "get_lead_data", "save_lead_score"],
  MessageComposer:  ["get_lead_data", "get_outreach_history", "get_dashboard_stats"],
  InsightGenerator: ["get_dashboard_stats", "get_outreach_history", "save_insight"],
  // Note: TIDAK ADA agent yang dapat "send_wa_message" langsung
  // WA send hanya via Closer Agent yang punya human review step
};
```

---

## BAGIAN F: CONTEXT MANAGEMENT & RELIABILITY — CCA-F DOMAIN 5

### F.1 — Conversation History Management

```typescript
// Pattern untuk agents yang butuh history (MessageComposer)
interface ConversationContext {
  lead: LeadProfile;
  outreach_history: OutreachLog[];
  current_template: TemplateType;
  max_history_messages: 10; // LIMIT! Jangan kirim semua history
}

function buildMessageComposerContext(leadId: string): ConversationContext {
  const lead = await supabase.getLead(leadId);
  const history = await supabase.getOutreachHistory(leadId, { limit: 10 }); // LIMIT
  
  return {
    lead,
    outreach_history: history,
    current_template: determineTemplate(history),
    max_history_messages: 10
  };
}
```

### F.2 — Graceful Degradation Pattern

**Prinsip:** Sistem harus tetap fungsional meskipun AI layer gagal.

```typescript
// Hierarchy of fallbacks untuk Sovereign Engine:

// Level 1: AI score
async function getLeadScore(leadId: string): Promise<ScoreResult> {
  try {
    return await ScoutScorerAgent.score(leadId); // AI score
  } catch (aiError) {
    console.error('AI scoring failed, falling back to algorithm', aiError);
    
    try {
      return await algorithmScore(leadId); // deterministic fallback
    } catch (algoError) {
      return {
        score: null,
        label: "UNSCORED",
        source: "error",
        error: "Both AI and algorithm scoring failed",
        manual_review_required: true
      };
    }
  }
}

// Level 2: Message compose
async function composeMessage(leadId: string, template: TemplateType): Promise<MessageResult> {
  try {
    return await MessageComposerAgent.compose(leadId, template); // AI personalized
  } catch (e) {
    return getDefaultTemplate(template); // static template fallback
  }
}
```

### F.3 — Rate Limiting & Backoff Strategy

```typescript
// Exponential backoff untuk API calls
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries) throw error;
      
      // Only retry on transient errors
      if (error.status === 429 || error.status >= 500) {
        const delay = baseDelay * Math.pow(2, i); // 1s, 2s, 4s, 8s
        await sleep(delay);
        continue;
      }
      
      throw error; // Non-retryable error
    }
  }
}

// Usage in ScoutScorer:
const profile = await callWithRetry(
  () => scraperApi.getProfile(username),
  3,  // max 3 retries
  1000 // start with 1s delay
);
```

---

## BAGIAN G: ANTI-PATTERNS CHEATSHEET (CCA-F Exam Critical)

### 7 Anti-Pattern Yang SERING Keluar di Ujian

| # | Anti-Pattern | ❌ Salah | ✅ Benar |
|---|-------------|---------|---------|
| 1 | **Prompt-based ordering** | "Step 1: fetch data, Step 2: score..." | Programmatic prerequisites: `if (!profileFetched) await fetchProfile()` |
| 2 | **Self-reported confidence escalation** | "Jika AI tidak yakin, minta human" | `if (confidence < THRESHOLD) return { manual_review: true }` |
| 3 | **Batch API untuk blocking workflow** | `await batchAPI.scoreAllLeads()` | Real-time API per lead, async queue untuk batch |
| 4 | **Context window myth** | Inject 10.000 token data → "Claude akan cari yang relevan" | Split ke focused passes, inject minimal relevant context |
| 5 | **Silent sub-agent failure** | `try { ... } catch(e) { return null }` | Return structured error: `{ success: false, error, code, retry_allowed }` |
| 6 | **All tools to all agents** | ScoutScorer dapat `send_wa`, `delete_lead`, dll | Scope 4-5 tools per agent, least privilege |
| 7 | **Prompt-only JSON** | "Respond in JSON format" | Tool use + schema validation + retry |

---

## BAGIAN H: SOVEREIGN ENGINE ↔ CCA-F ALIGNMENT

### Proyek Sovereign Engine sebagai Portfolio CCA-F

```
Domain 1 (27%): Agentic Architecture & Orchestration
  Sovereign Engine demonstrates:
  ✅ LangGraph.js state machine (ScoutScorer flow)
  ✅ Multi-agent coordination (LangGraph + CrewAI)
  ✅ Tool scoping per agent role
  ✅ Fallback/degradation patterns

Domain 2 (18%): Tool Design & MCP Integration
  Sovereign Engine demonstrates:
  ✅ Typed tool schemas (get_ig_profile, send_wa, etc.)
  ✅ Read vs write vs execute separation
  ✅ Rate limiting in tool layer
  ✅ MCP-ready architecture pattern

Domain 3 (20%): Claude Code Configuration & Workflows
  Sovereign Engine demonstrates:
  ✅ CLAUDE.md project configuration
  ✅ SKILL.md session state tracking
  ✅ GitHub integration via Wrangler deploy
  ✅ Structured build workflow per module

Domain 4 (20%): Prompt Engineering & Structured Output
  Sovereign Engine demonstrates:
  ✅ System prompt architecture (Role/Context/Capabilities/Constraints)
  ✅ Few-shot examples for ScoutScorer
  ✅ JSON schema enforcement via tool_choice
  ✅ Retry loop with schema validation

Domain 5 (15%): Context Management & Reliability
  Sovereign Engine demonstrates:
  ✅ Conversation history limits (max 10 messages)
  ✅ Graceful degradation (AI → Algorithm → Manual)
  ✅ Exponential backoff strategy
  ✅ Structured error taxonomy
```

---

## BAGIAN I: QUICK REFERENCE — SOVEREIGN ENGINE DECISIONS

### Kapan Pakai Apa (Decision Matrix)

| Kebutuhan | Solusi |
|-----------|--------|
| Real-time scoring dalam <3 detik | LangGraph.js ScoutScorer |
| Weekly market analysis (multi-perspective) | CrewAI MarketValidationCrew |
| Simple template rendering | Deterministic string interpolation |
| Personalized WA message | LangGraph.js MessageComposer |
| Dashboard stats calculation | Supabase SQL query (deterministic) |
| Trend analysis dan anomaly | LangGraph.js InsightGenerator |
| Deep lead research (on-demand) | CrewAI LeadResearchCrew |
| JSON schema enforcement | Zod + Claude tool_choice |
| Rate limiting enforcement | Code, NOT prompt |
| Auth/security decisions | Code ONLY, NEVER AI |

### Key Numbers to Remember
```
LangGraph latency targets:
  ScoutScorer: <3 detik
  MessageComposer: <2 detik
  InsightGenerator: <5 detik

Tool limits per agent: MAX 4-5 tools
Retry attempts max: 2-3x dengan exponential backoff
History injection limit: MAX 10 messages
Temperature for production scoring: 0-0.3
Temperature for creative composition: 0.4-0.7
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Sovereign Architect Notes v1.0 — distilasi dari Anthropic Academy + CCA-F roadmap |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
