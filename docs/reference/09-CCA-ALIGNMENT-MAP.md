# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 9: CCA-F ALIGNMENT MAP
# (Peta Sertifikasi Claude Certified Architect — Bagaimana Sovereign Engine Membuktikan Kompetensi)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Setiap baris kode di Sovereign Engine adalah bukti kompetensi CCA-F. Dokumen ini adalah peta yang menunjukkan di mana setiap domain exam dibuktikan di dalam proyek nyata."*

---

## BAGIAN 1: EXAM OVERVIEW & SOVEREIGN STRATEGY

### 1.1 CCA-F Exam Snapshot

```
Nama:          Claude Certified Architect — Foundations (CCA-F)
Tanggal Rilis: 12 Maret 2026
Format:        60 pertanyaan multiple choice
Durasi:        120 menit
Passing Score: 720 / 1000
Biaya:         $99 USD (free untuk Anthropic Partners)
Platform:      Pearson VUE / Skilljar (proctored, laptop/desktop)
Retake:        Diperbolehkan

Link Registrasi: https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
```

### 1.2 Domain Breakdown

```
╔══════════════════════════════════════════════════════════════════╗
║  DOMAIN                                    BOBOT   SOAL (~)      ║
╠══════════════════════════════════════════════════════════════════╣
║  D1: Agentic Architecture & Orchestration   27%    16 soal       ║
║  D2: Tool Design & MCP Integration          18%    11 soal       ║
║  D3: Claude Code Config & Workflows         20%    12 soal       ║
║  D4: Prompt Engineering & Structured Output 20%    12 soal       ║
║  D5: Context Management & Reliability       15%     9 soal       ║
╚══════════════════════════════════════════════════════════════════╝

KEY INSIGHT: Domain 1 + Domain 3 = 47% dari semua soal.
Fokus utama belajar: D1 → D3 → D4/D2 → D5
```

### 1.3 Sovereign Engine sebagai Portfolio CCA-F

```
STRATEGI:
  Sovereign Engine bukan hanya produk bisnis.
  Ini adalah living proof-of-competency untuk CCA-F.
  
  Setiap fitur yang dibangun = demonstrasi satu atau lebih domain CCA-F.
  
  BENEFIT:
  ✅ Portfolio nyata yang bisa ditunjukkan saat interview
  ✅ Pemahaman mendalam karena implementasi real (bukan teori)
  ✅ Bug dan error di produksi = pelajaran anti-pattern
  ✅ Accelerate exam readiness karena belajar sambil build
```

---

## BAGIAN 2: DOMAIN 1 — AGENTIC ARCHITECTURE & ORCHESTRATION (27%)

### 2.1 Apa yang Diuji (Exam Perspective)

```
Topik yang sering keluar:
  a) State machine design untuk multi-step agent workflows
  b) Orchestrator-worker architecture
  c) Tool call sequencing dan prerequisites
  d) When to use LLM vs deterministic code
  e) Handling agent failures dan fallback strategies
  f) Multi-agent coordination patterns
```

### 2.2 Sovereign Engine Implementation (Bukti Kompetensi)

| Sub-topik | Implementasi di Sovereign Engine | File | Status |
|-----------|----------------------------------|------|--------|
| **State machine design** | ScoutScorer LangGraph graph (INIT→FETCH→SCORE→VALIDATE→SAVE) | `src/agents/scout-scorer.ts` | 🔴 TODO |
| **Orchestrator-worker** | Hono route sebagai orchestrator → LangGraph agents sebagai workers | `src/routes/*.ts` | ✅ PATTERN READY |
| **Multi-agent coord** | Hono orchestrates LangGraph (sync) + CrewAI (async) simultaneously | `src/agents/crewai-client.ts` | 🔴 TODO |
| **LLM vs deterministic** | Base score = deterministic algo; AI overlay = LLM (±20 pts) | `src/agents/scout-scorer.ts` | 🔴 TODO |
| **Fallback strategy** | AI fail → algo score → manual review escalation | `src/agents/scout-scorer.ts` | 🔴 TODO |
| **Parallel execution** | CrewAI kickoff + LangGraph concurrent untuk dashboard refresh | Future | ⏳ P2 |

### 2.3 Exam-Relevant Code Patterns

```typescript
// PATTERN 1: State Machine dengan LangGraph.js
// (CCA-F soal sering tanya: "What's the correct state transition for X scenario?")

// Sovereign Engine demonstrates:
const scoutWorkflow = new StateGraph<ScoutState>({
  channels: scoutStateSchema
});

// Nodes dengan clear single responsibility
scoutWorkflow.addNode("fetchProfile", fetchProfileNode);
scoutWorkflow.addNode("computeBaseScore", computeBaseScoreNode);
scoutWorkflow.addNode("aiOverlay", aiOverlayNode);
scoutWorkflow.addNode("validateOutput", validateOutputNode);
scoutWorkflow.addNode("saveScore", saveScoreNode);

// Conditional routing (CCA-F loves these patterns)
scoutWorkflow.addConditionalEdges("validateOutput", (state) => {
  if (state.validationPassed) return "saveScore";
  if (state.retryCount < 2) return "aiOverlay";
  return "saveScore"; // fallback ke base score
});

// PATTERN 2: Programmatic prerequisites (PALING SERING KELUAR)
// Wrong: put prerequisite check in prompt
// Right: put in code

async function scoreLeadWithPrerequisites(leadId: string) {
  // PREREQUISITE 1: Lead harus exist
  const lead = await db.getLead(leadId);
  if (!lead) throw new Error("LEAD_NOT_FOUND");
  
  // PREREQUISITE 2: Lead belum di-score hari ini
  if (lead.last_scored_at && isToday(lead.last_scored_at)) {
    return { cached: true, score: lead.score };
  }
  
  // PREREQUISITE 3: Semua dependencies available
  if (!process.env.OPENAI_API_KEY) {
    return await algorithmScoreOnly(lead);
  }
  
  // ONLY THEN: run AI scoring
  return await runScoutScorerAgent(lead);
}
```

### 2.4 Study Questions (D1)

```
Q1: Sebuah agent perlu melakukan web search, kemudian berdasarkan hasilnya 
    melakukan database query, kemudian menulis ke database.
    Bagaimana cara terbaik mengenforce urutan ini?
    
    A) Tulis di system prompt: "First search, then query, then write"
    B) Gunakan conditional state machine: search_state → query_state → write_state
    C) Berikan semua 3 tools sekaligus dan biarkan LLM memilih urutannya
    D) Gunakan 3 API calls terpisah dengan manual sequencing di kode
    
    JAWABAN: B — state machine memastikan urutan eksekusi programmatically

Q2: Sovereign Engine punya ScoutScorer (LangGraph.js) dan MarketValidationCrew (CrewAI).
    Mana yang lebih tepat untuk real-time dashboard insight?
    
    A) CrewAI karena lebih powerful
    B) LangGraph.js karena low latency di edge
    C) Keduanya secara parallel
    D) Buat custom LLM call tanpa framework
    
    JAWABAN: B — CCA-F menekankan pilihan tools berdasarkan latency requirements

Q3: ScoutScorer mengalami API timeout dari ScraperAPI. Apa response yang benar?
    
    A) Throw error dan return 500
    B) Retry sampai berhasil (unlimited)
    C) Return partial result: base score saja, note "enrichment_unavailable: true"
    D) Return null dan log di background
    
    JAWABAN: C — graceful degradation adalah pattern yang ditekankan
```

---

## BAGIAN 3: DOMAIN 2 — TOOL DESIGN & MCP INTEGRATION (18%)

### 3.1 Apa yang Diuji

```
Topik yang sering keluar:
  a) Tool schema design — nama, description, input_schema
  b) Tool boundary design — single responsibility
  c) Read vs write vs execute separation
  d) MCP protocol basics
  e) Tool scoping per agent role
  f) Side effect documentation
```

### 3.2 Sovereign Engine Implementation

| Sub-topik | Implementasi | Lokasi |
|-----------|-------------|--------|
| **Typed tool schemas** | 8 tools dengan JSON Schema strict | `src/agents/tool-registry.ts` |
| **Read/write/execute separation** | 3-tier tool classification | `src/agents/tool-registry.ts` |
| **Tool scoping per agent** | AGENT_TOOLS mapping | `src/agents/tool-registry.ts` |
| **Rate limiting in tools** | `send_wa_message` tool: 1/phone/24h | `src/routes/wa.ts` |
| **MCP-ready pattern** | Tool interfaces match MCP spec | Dokumen ini |

### 3.3 Tool Design Showcase

```typescript
// SOVEREIGN ENGINE TOOL REGISTRY
// Ini adalah demonstrasi lengkap Tool Design untuk CCA-F

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  
  // ── READ-ONLY TOOLS (Safe for all agents) ──
  
  "get_lead_profile": {
    name: "get_lead_profile",
    description: "Retrieve complete lead profile from database for scoring analysis. Returns profile data including follower count, engagement rate, bio, and digital gap assessment. READ-ONLY - does not modify any data.",
    input_schema: {
      type: "object",
      properties: {
        lead_id: {
          type: "string",
          description: "UUID of the lead to retrieve. Must be a valid UUID v4 format.",
          format: "uuid"
        },
        include_history: {
          type: "boolean",
          description: "Whether to include outreach history (last 10 contacts). Default: false to reduce context size.",
          default: false
        }
      },
      required: ["lead_id"]
    },
    side_effects: "none",
    scope: "read"
  },
  
  "search_instagram_profile": {
    name: "search_instagram_profile", 
    description: "Fetch live Instagram profile data via ScraperAPI for lead enrichment. Returns bio, follower count, post count, and recent engagement metrics. Uses ScraperAPI credits.",
    input_schema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Instagram username WITHOUT @ symbol. Example: 'tokobaju_official'",
          pattern: "^[a-zA-Z0-9._]{1,30}$"
        },
        include_recent_posts: {
          type: "boolean",
          description: "Fetch recent 12 posts for engagement rate calculation. Set false to save API credits when follower count alone is sufficient.",
          default: true
        }
      },
      required: ["username"]
    },
    side_effects: "consumes_scraperapi_credit",
    scope: "external_read",
    rate_limit: "100 requests/hour"
  },
  
  // ── WRITE TOOLS (Restricted) ──
  
  "save_lead_score": {
    name: "save_lead_score",
    description: "Save AI-generated score and reasoning to leads table. Should only be called after score validation passes. WRITES to database.",
    input_schema: {
      type: "object", 
      properties: {
        lead_id: { type: "string", format: "uuid" },
        score: { type: "integer", minimum: 1, maximum: 100 },
        label: { type: "string", enum: ["HOT", "WARM", "COOL", "COLD"] },
        reasoning: { type: "string", maxLength: 500 },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        ai_scored: { type: "boolean", default: true }
      },
      required: ["lead_id", "score", "label"]
    },
    side_effects: "writes_to_supabase_leads",
    scope: "write"
  },
  
  // ── EXECUTE TOOLS (Most Restricted) ──
  
  "send_whatsapp_message": {
    name: "send_whatsapp_message",
    description: "Send a WhatsApp message via Fonnte API. IRREVERSIBLE ACTION - message will be delivered to recipient immediately. Rate limited to 1 message per phone number per 24 hours.",
    input_schema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Recipient phone number in international format. Accept 628xxx or 08xxx (auto-normalized). Example: '628123456789'",
          pattern: "^(0|62)8[0-9]{8,11}$"
        },
        message: {
          type: "string",
          description: "WhatsApp message content. Maximum 500 characters. Should not contain more than 2 emojis or more than 1 URL.",
          maxLength: 500
        },
        delay_seconds: {
          type: "integer",
          description: "Delay before sending in seconds (Fonnte API parameter). Minimum 1, default 2.",
          minimum: 1,
          default: 2
        }
      },
      required: ["phone", "message"]
    },
    side_effects: "sends_whatsapp_message, writes_to_wa_logs, incurs_fonnte_cost",
    scope: "execute",
    rate_limit: "1 per phone per 24 hours",
    requires_explicit_approval: true
  }
};

// Tool assignment per agent (CRITICAL for CCA-F)
export const AGENT_TOOLS: Record<string, string[]> = {
  ScoutScorer:      ["search_instagram_profile", "get_lead_profile", "save_lead_score"],
  MessageComposer:  ["get_lead_profile", "get_outreach_history", "get_conversion_count"],
  InsightGenerator: ["get_dashboard_stats", "get_lead_pipeline", "get_validation_metrics", "save_insight"],
  AnomalyDetector:  ["get_dashboard_stats", "get_recent_metrics"],
  // Note: NO agent gets send_whatsapp_message directly — only via Closer Agent route with human oversight
};
```

### 3.4 Study Questions (D2)

```
Q1: Kamu punya tool "database_manager" yang bisa read, write, dan delete.
    Berapa banyak dan bagaimana sebaiknya didesain?
    
    A) 1 tool dengan "action" parameter: read/write/delete
    B) 3 tools terpisah: read_data, write_data, delete_data  
    C) 2 tools: read_data, modify_data (write + delete)
    D) Tidak perlu tool, inject data langsung ke context
    
    JAWABAN: B — Single responsibility per tool, side effects jelas

Q2: Bagaimana cara mencegah MessageComposer agent dari secara tidak sengaja
    mengirim WA message (yang hanya boleh dilakukan Closer Agent)?
    
    A) Tambahkan instruksi di system prompt "jangan kirim WA"
    B) Jangan include "send_whatsapp_message" dalam tool list MessageComposer
    C) Tambahkan permission check di dalam tool itself
    D) Gunakan separate API key untuk setiap agent
    
    JAWABAN: B — tool scoping per agent, programmatic not prompt-based

Q3: MCP (Model Context Protocol) digunakan untuk apa di agentic systems?
    
    A) Authentication antara agents
    B) Standardized interface untuk connecting AI ke external tools/resources
    C) Load balancing antara multiple LLM providers  
    D) Caching layer untuk LLM responses
    
    JAWABAN: B — MCP = protocol standar untuk tool/resource integration
```

---

## BAGIAN 4: DOMAIN 3 — CLAUDE CODE CONFIG & WORKFLOWS (20%)

### 4.1 Apa yang Diuji

```
Topik yang sering keluar:
  a) CLAUDE.md file structure dan best practices
  b) GitHub integration dengan Claude Code
  c) CI/CD workflow dengan Claude
  d) Local development vs production workflows
  e) Conversation management dalam build sessions
  f) SKILL.md pattern untuk session state
```

### 4.2 Sovereign Engine — CLAUDE.md Template (Portfolio Artifact)

```markdown
# CLAUDE.md — SOVEREIGN BUSINESS ENGINE v4.0
# Update file ini setiap ada perubahan arsitektur signifikan

## Project Overview
Private AI-orchestrated business engine untuk ekosistem FashionKas (3 brand Instagram).
Founder-only access. Deployed di Cloudflare Pages + Workers.

## Tech Stack
- Frontend: Hono.js SSR + HTML + TailwindCSS (CDN)
- API: Hono.js on Cloudflare Workers
- AI Layer: LangGraph.js (edge agents) + CrewAI (external FastAPI)
- Database: Supabase (PostgreSQL with RLS)
- WA: Fonnte API
- Scraping: ScraperAPI
- Auth: Custom JWT HS256 + 4-digit PIN

## Architecture Rules
1. CF Workers = stateless edge runtime. NO Node.js APIs (no fs, path, child_process)
2. All secrets in .dev.vars (local) or Cloudflare Secrets (production)
3. Supabase writes ONLY via service_role key, never anon key
4. LangGraph agents: <5 second timeout, fallback to deterministic on failure
5. CrewAI: async only, NEVER await in CF Workers request handler

## Code Conventions
- TypeScript strict mode enabled
- Zod for ALL schema validation (no manual type checks)
- Error format: { success: false, error: string, code: string }
- All routes need JWT middleware (except /api/auth/login)
- Console.error for CF Workers logs (not console.log)

## File Structure
src/
  index.tsx          → Hono app + routes registration
  middleware/
    auth.ts          → JWT verification middleware
  routes/
    auth.ts          → /api/auth/*
    scout.ts         → /api/scout/*
    closer.ts        → /api/closer/*
    wa.ts            → /api/wa/*
    dashboard.ts     → /api/dashboard/*
    ai.ts            → /api/ai/*
    validation.ts    → /api/validation/*
  agents/
    scout-scorer.ts     → LangGraph ScoutScorer
    message-composer.ts → LangGraph MessageComposer
    insight-generator.ts → LangGraph InsightGenerator
    crewai-client.ts    → CrewAI HTTP client
    tool-registry.ts    → All tool definitions

## Deployment
GitHub: ganihypha/Sovereign.private.real.busines.orchest
Production: https://sovereign-orchestrator.pages.dev
Deploy: git push → Cloudflare auto-deploy

## FORBIDDEN
- No direct DB access from frontend JS
- No secrets in git
- No console.log (use console.error)
- No synchronous loops > 10 items in Workers
- No CrewAI calls inside request handler (async only via queue)
```

### 4.3 SKILL.md Pattern (Session State Tracking)

```markdown
# SKILL.md — SESSION TRACKER
# Update setiap akhir sesi build

## Sesi: 2026-04-02

### ✅ Selesai & Verified
- wa_logs tabel → created + indexes
- ai_tasks tabel → created + indexes
- ai_insights tabel → created + indexes
- order_items tabel → created + indexes
- /api/wa/send → POST, Fonnte integration, rate limiting, wa_logs insert
- /api/wa/status → GET, Fonnte device check

### 🔄 In Progress
- /api/wa/broadcast → logic done, chunking belum di-test dengan real Fonnte

### ⏳ Blocked
- /api/scout/ai-score → BLOCKED: OPENAI_API_KEY belum ada
- ScoutScorer agent → BLOCKED: sama

### 📋 Next Session (prioritas urut)
1. Get OPENAI_API_KEY → unblock Scout AI
2. Install @langchain/langgraph + @langchain/openai
3. Build ScoutScorer agent (Task 2.2)
4. Build /api/scout/ai-score (Task 2.4)

### 🔑 Credential Status
FONNTE_TOKEN: ✅ Set di .dev.vars
OPENAI_API_KEY: ❌ Missing — user perlu dapatkan dari platform.openai.com
```

### 4.4 Study Questions (D3)

```
Q1: Apa fungsi utama CLAUDE.md dalam proyek yang menggunakan Claude Code?
    
    A) File konfigurasi untuk npm scripts
    B) Project memory — Claude otomatis baca untuk memahami konteks proyek
    C) Documentation untuk developer manusia
    D) Env variable definitions
    
    JAWABAN: B — CLAUDE.md adalah "brain" Claude Code untuk proyek spesifik

Q2: Best practice untuk CI/CD dengan Claude Code adalah:
    
    A) Biarkan Claude auto-deploy tanpa review
    B) Claude menghasilkan PR → human review → merge → auto-deploy
    C) Claude langsung push ke main tanpa PR
    D) Deploy hanya jika Claude memberikan confidence > 90%
    
    JAWABAN: B — human-in-the-loop untuk critical deployments

Q3: Developer punya build session yang sangat panjang dan Claude Code mulai
    kehilangan konteks. Solusi terbaik?
    
    A) Tambah semua kode ke context window sekaligus
    B) Start fresh session dengan CLAUDE.md + SKILL.md summary
    C) Gunakan Claude Pro untuk context window lebih besar
    D) Pisahkan ke sub-agents yang masing-masing handle satu file
    
    JAWABAN: B — SKILL.md pattern untuk context management antar sesi
```

---

## BAGIAN 5: DOMAIN 4 — PROMPT ENGINEERING & STRUCTURED OUTPUT (20%)

### 5.1 Apa yang Diuji

```
Topik yang sering keluar:
  a) System prompt structure (role, context, constraints, format)
  b) Few-shot examples — kapan dan bagaimana
  c) JSON schema enforcement via tool_choice
  d) Retry logic untuk schema validation
  e) Temperature settings untuk berbagai use cases
  f) Anti-hallucination techniques
```

### 5.2 Sovereign Engine Demonstrations

**Prompt Architecture Pattern (D4 Portfolio):**

```typescript
// SOVEREIGN ENGINE — System Prompt Architecture
// Ini adalah template yang digunakan oleh semua agents

function buildSystemPrompt(agentConfig: AgentConfig): string {
  return `
## ROLE
${agentConfig.role}
You are operating as part of the Sovereign Business Engine — a private AI-orchestrated 
command center for Haidar Faras Maulia's fashion business ecosystem in Indonesia.

## CONTEXT
${agentConfig.context}
Business context: 3 Instagram brands (FashionKas, ResellerKas, Founder account) 
operating as a Market Validation Lab. Target market: Indonesian fashion resellers.

## CAPABILITIES
${agentConfig.capabilities.map(c => `- ${c}`).join('\n')}

## CONSTRAINTS
${agentConfig.constraints.map(c => `- ${c}`).join('\n')}
- NEVER hallucinate data not present in the provided context
- NEVER output format other than specified in OUTPUT FORMAT section

## OUTPUT FORMAT
You MUST call the tool "${agentConfig.toolName}" with EXACTLY this schema:
${JSON.stringify(agentConfig.outputSchema, null, 2)}

## QUALITY CRITERIA
${agentConfig.qualityCriteria.map(q => `- ${q}`).join('\n')}
`;
}

// Usage:
const scoutScorerPrompt = buildSystemPrompt({
  role: "You are Lead Intelligence Scorer for Sovereign Business Engine",
  context: "Analyzing Indonesian Instagram fashion sellers as potential resellers",
  capabilities: ["Score leads 0-100", "Detect digital gaps", "Identify reseller bio signals"],
  constraints: ["Read-only access to existing data", "Cannot send messages"],
  toolName: "submit_score",
  outputSchema: scoreOutputSchema,
  qualityCriteria: ["Score reflects actual conversion potential", "Reasoning is actionable"]
});
```

**Few-Shot Pattern (D4 Portfolio):**

```typescript
// SOVEREIGN ENGINE — Few-Shot for ScoutScorer
// Grounding examples untuk reduce hallucination

const FEW_SHOT_EXAMPLES = [
  {
    role: "user",
    content: JSON.stringify({
      username: "wardrobe_id_shop",
      followers: 8200,
      bio: "Toko fashion online | Reseller open | COD area Jkt",
      engagement_rate: 4.1,
      digital_gap: "HIGH",
      has_catalog_link: false,
      avg_likes_per_post: 330
    })
  },
  {
    role: "assistant",
    content: "CALLING submit_score",
    tool_calls: [{
      name: "submit_score",
      input: {
        score: 84,
        label: "HOT",
        reasoning: "Follower 8.2K dengan engagement sangat baik (4.1%). Bio eksplisit: 'Reseller open' dan 'COD area Jkt'. Digital gap tinggi karena tidak punya katalog digital — ini peluang utama FashionKas. Engagement per post 330 menunjukkan komunitas aktif.",
        highlights: ["Engagement rate >4%", "Bio menyebut reseller", "Digital gap = opportunity"],
        concerns: ["Tidak ada website/catalog link"],
        recommended_action: "Outreach hari ini dengan Day 0 template. Fokus angle: sistem reseller otomatis.",
        confidence: 0.88
      }
    }]
  },
  {
    role: "user",
    content: JSON.stringify({
      username: "lifestyle_blogger_xyz",
      followers: 45000,
      bio: "Fashion lifestyle | Collab DM | Sponsored posts",
      engagement_rate: 0.6,
      digital_gap: "LOW",
      has_catalog_link: true,
      avg_likes_per_post: 270
    })
  },
  {
    role: "assistant",
    content: "CALLING submit_score",
    tool_calls: [{
      name: "submit_score",
      input: {
        score: 28,
        label: "COLD",
        reasoning: "Follower 45K terlihat besar tapi engagement 0.6% sangat rendah untuk fashion account. Bio 'Sponsored posts' menunjukkan ini influencer, bukan reseller. Digital gap rendah karena sudah punya link di bio. Bukan profil yang cocok untuk menjadi reseller FashionKas.",
        highlights: [],
        concerns: ["Engagement rate <1% (vanity metrics)", "Influencer, bukan reseller", "Digital gap rendah"],
        recommended_action: "Skip — tidak sesuai profil reseller target.",
        confidence: 0.92
      }
    }]
  }
];
```

### 5.3 Study Questions (D4)

```
Q1: Claude selalu menjawab dalam format yang berbeda-beda meskipun diminta
    "Please respond in JSON". Solusi yang paling reliable adalah:
    
    A) Beri contoh JSON yang lebih jelas di prompt
    B) Gunakan temperature 0 untuk konsistensi
    C) Gunakan tool_choice: "auto" agar Claude pilih format sendiri
    D) Gunakan tool dengan input_schema strict + tool_choice: {type:"tool"}
    
    JAWABAN: D — programmatic JSON enforcement, bukan prompt-based

Q2: Kamu punya system prompt 3000 token untuk ScoutScorer. Setelah testing,
    agent sering miss constraint penting di bagian akhir prompt. Apa penyebabnya?
    
    A) Token limit tidak cukup
    B) Temperature terlalu tinggi
    C) Informasi penting terkubur di tengah — "attention dilution" dalam long context
    D) Perlu lebih banyak few-shot examples
    
    JAWABAN: C — pindahkan constraints ke awal + akhir prompt

Q3: Untuk MessageComposer yang harus membuat pesan personal (nama toko, dll),
    temperature berapa yang optimal?
    
    A) 0.0 — perlu konsistensi mutlak
    B) 0.3-0.5 — cukup personal tapi tidak terlalu random
    C) 1.0 — butuh kreativitas maksimal
    D) 2.0 — paling kreatif
    
    JAWABAN: B — creative enough for personalization, stable enough for reliability
```

---

## BAGIAN 6: DOMAIN 5 — CONTEXT MANAGEMENT & RELIABILITY (15%)

### 6.1 Apa yang Diuji

```
Topik yang sering keluar:
  a) Conversation history management (limits)
  b) Graceful degradation patterns
  c) Retry logic dengan backoff
  d) Caching strategies
  e) Batch vs streaming
  f) Error taxonomy dan handling
```

### 6.2 Sovereign Engine Demonstrations

**Reliability Pattern (D5 Portfolio):**

```typescript
// SOVEREIGN ENGINE — Comprehensive Reliability Framework

// 1. Error Taxonomy (CCA-F menekankan structured error handling)
enum SovereignErrorCode {
  // Auth errors
  AUTH_INVALID_PIN      = "AUTH_001",
  AUTH_TOKEN_EXPIRED    = "AUTH_002",
  AUTH_DEVICE_MISMATCH  = "AUTH_003",
  
  // Scout errors
  SCOUT_LEAD_NOT_FOUND  = "SCOUT_001",
  SCOUT_SCRAPE_FAILED   = "SCOUT_002",
  SCOUT_AI_TIMEOUT      = "SCOUT_003",
  SCOUT_DUPLICATE_LEAD  = "SCOUT_004",
  
  // Closer errors
  CLOSER_RATE_LIMIT     = "CLOSER_001",
  CLOSER_INVALID_PHONE  = "CLOSER_002",
  CLOSER_FONNTE_ERROR   = "CLOSER_003",
  CLOSER_ESCALATE       = "CLOSER_004",
  
  // AI errors
  AI_SCHEMA_INVALID     = "AI_001",
  AI_TIMEOUT            = "AI_002",
  AI_RATE_LIMIT         = "AI_003",
  AI_CONTEXT_TOO_LONG   = "AI_004",
}

// 2. Graceful Degradation (D5 core pattern)
class SovereignFallbackChain<T> {
  private steps: Array<() => Promise<T | null>> = [];
  private finalFallback: T;
  
  constructor(finalFallback: T) {
    this.finalFallback = finalFallback;
  }
  
  addStep(fn: () => Promise<T | null>): this {
    this.steps.push(fn);
    return this;
  }
  
  async execute(): Promise<{ result: T; source: string }> {
    for (let i = 0; i < this.steps.length; i++) {
      try {
        const result = await this.steps[i]();
        if (result !== null) {
          return { result, source: `step_${i + 1}` };
        }
      } catch (e) {
        console.error(`Fallback step ${i + 1} failed:`, e);
      }
    }
    return { result: this.finalFallback, source: "final_fallback" };
  }
}

// Usage for ScoutScorer:
const scoringChain = new SovereignFallbackChain<ScoreResult>({
  score: 1,
  label: "COLD",
  source: "default",
  manual_review_required: true
});

scoringChain
  .addStep(() => runAIScoring(lead))           // Primary: AI scoring
  .addStep(() => runAlgorithmScoring(lead))    // Fallback 1: deterministic
  .addStep(() => getCachedScore(lead.username)); // Fallback 2: cached score

const { result, source } = await scoringChain.execute();

// 3. Context Window Management (D5 key topic)
function buildAgentContext<T extends Record<string, any>>(
  baseContext: T,
  maxTokenEstimate: number = 2000
): T {
  const contextSize = JSON.stringify(baseContext).length;
  
  if (contextSize > maxTokenEstimate * 4) { // rough char estimate
    // Trim arrays to most recent N items
    const trimmed = { ...baseContext };
    for (const key of Object.keys(trimmed)) {
      if (Array.isArray(trimmed[key]) && trimmed[key].length > 5) {
        trimmed[key] = trimmed[key].slice(-5); // keep last 5
        trimmed[`${key}_trimmed`] = true;
      }
    }
    return trimmed as T;
  }
  
  return baseContext;
}
```

### 6.3 Study Questions (D5)

```
Q1: InsightGenerator perlu analyze 7 hari data orders, leads, WA logs, validation metrics.
    Cara terbaik untuk manage context?
    
    A) Inject semua raw data dalam satu call (context window besar)
    B) 2-pass approach: summary first → detail for flagged areas
    C) Gunakan streaming untuk process data bertahap
    D) Split ke 4 separate agent calls, satu per data type
    
    JAWABAN: B — focused context passes, prevent attention dilution

Q2: ScoutScorer call ke ScraperAPI timeout setelah 8 detik (CF Workers limit 10ms CPU).
    Apa yang seharusnya terjadi?
    
    A) Throw error dan return 500 ke frontend
    B) Retry 3 kali sebelum return error
    C) Return partial result: compute base score dari available data, flag enrichment_failed
    D) Simpan ke queue untuk diproses nanti
    
    JAWABAN: C — graceful degradation, always return something useful

Q3: Setelah Fonnte mengirim 429 rate limit, apa strategi retry yang benar?
    
    A) Retry segera (immediate retry)
    B) Retry setelah 1 menit flat delay
    C) Exponential backoff: 1s, 2s, 4s, 8s dengan max 3 retries
    D) Jangan retry, log error dan notifikasi Founder
    
    JAWABAN: C — exponential backoff adalah standard untuk rate limit handling
```

---

## BAGIAN 7: ANTI-PATTERN MASTER LIST (Wajib Hafal)

```
╔══════════════════════════════════════════════════════════════════════════╗
║  CCA-F ANTI-PATTERN CHEATSHEET — 7 Yang Paling Sering Keluar di Exam    ║
╚══════════════════════════════════════════════════════════════════════════╝

━━━ ANTI-PATTERN #1 ━━━
❌ Prompt-based ordering enforcement
"First search web, then check database, then write result"
✅ Programmatic state prerequisites
if (!webSearchDone) await searchWeb(); if (!dbChecked) await checkDb();

━━━ ANTI-PATTERN #2 ━━━
❌ Self-reported confidence escalation
"If you're not confident, say you need human review"
✅ Deterministic threshold-based escalation
if (score.confidence < 0.6) return { manual_review_required: true };

━━━ ANTI-PATTERN #3 ━━━
❌ Batch API untuk blocking workflows
await batchAPI.processAllLeads() → waits for ALL before returning
✅ Real-time API untuk individual, queue untuk batch
const score = await realTimeAPI.scoreOneLead(leadId);

━━━ ANTI-PATTERN #4 ━━━
❌ Larger context window myth
"Kalau pakai 200K context, Claude pasti bisa cari info yang relevan"
✅ Focused context passes
Pass 1: summary stats → identify focus areas
Pass 2: detailed data hanya untuk area yang flagged

━━━ ANTI-PATTERN #5 ━━━
❌ Silent sub-agent failures
try { await subAgent.run() } catch(e) { return null; }
✅ Structured error context
return { success: false, error: e.message, code: classifyError(e), retry_allowed: true }

━━━ ANTI-PATTERN #6 ━━━
❌ All tools to all agents
ScoutScorer gets: score, compose, send_wa, delete_lead, view_revenue...
✅ Scoped tools per role (max 4-5 per agent)
ScoutScorer gets: get_profile, search_web, get_lead, save_score (only these)

━━━ ANTI-PATTERN #7 ━━━
❌ Prompt-only JSON compliance
"Please respond in valid JSON format with fields: score, label, reasoning"
✅ Schema validation + retry loop
tool_choice: { type: "tool", name: "submit_score" } + zodSchema.parse(response)
```

---

## BAGIAN 8: 12-WEEK STUDY PLAN (Paralel dengan Build Sovereign Engine)

```
╔═══════════════════════════════════════════════════════════════════════╗
║          12-WEEK PLAN: BUILD SOVEREIGN + STUDY CCA-F PARALEL          ║
╠═══════════════════════════════════════════════════════════════════════╣
║  MINGGU   BUILD SOVEREIGN              STUDY CCA-F                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║  1-2      Sprint 1: Foundation         Claude 101 + AI Fluency        ║
║           (4 tabel + Fonnte routes)    (Domain overview, terminology) ║
╠═══════════════════════════════════════════════════════════════════════╣
║  3-5      Sprint 2: Scout AI           Building with Claude API        ║
║           (LangGraph + ScoutScorer)    (8.1 jam — core API course)    ║
║                                        Focus: D1, D2, D4               ║
╠═══════════════════════════════════════════════════════════════════════╣
║  6-7      Sprint 3: Closer AI          Intro MCP + MCP Advanced        ║
║           (MessageComposer + Seq)      Focus: D2 (Tool Design/MCP)    ║
╠═══════════════════════════════════════════════════════════════════════╣
║  8-9      Sprint 4: AI Intelligence    Claude Code in Action            ║
║           (InsightGen + CrewAI)        Focus: D3 (CLAUDE.md, CI/CD)   ║
╠═══════════════════════════════════════════════════════════════════════╣
║  10-11    Sprint 5: Dashboard Polish   Practice Questions              ║
║           (Revenue + Mobile)           6 scenario walkthroughs        ║
║                                        Mock exam (target: 900+/1000)  ║
╠═══════════════════════════════════════════════════════════════════════╣
║  12       Deploy v4.0                  Anti-pattern review             ║
║           Security audit              REGISTER EXAM                   ║
║                                        Submit portfolio + access req   ║
╚═══════════════════════════════════════════════════════════════════════╝

RESOURCES:
  ✅ Building with Claude API:      https://anthropic.skilljar.com
  ✅ Claude Code in Action:          https://anthropic.skilljar.com/claude-code-in-action
  ✅ MCP Documentation:              https://docs.anthropic.com/en/docs/claude-code/mcp
  ✅ Practice Questions:             https://claudecertified.com/cca-practice-questions
  ✅ CCA-F Registration:             https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
  ✅ Towards AI Study Guide:         (see uploaded docs)
  ✅ Udemy 360-question test:        (search "Claude Certified Architect")
```

---

## BAGIAN 9: PORTFOLIO ARTIFACTS CHECKLIST

```
Sebelum mendaftar exam, pastikan portfolio ini ada:

ARTIFACT 1: Agentic Architecture Demo (D1)
  ✅ ScoutScorer LangGraph state machine (kode + diagram)
  ✅ Multi-agent flow diagram (LangGraph + CrewAI)
  ✅ Fallback chain implementation

ARTIFACT 2: Tool Design Showcase (D2)
  ✅ tool-registry.ts dengan 8+ typed tools
  ✅ Agent-to-tool mapping dokumentasi
  ✅ Rate limiting implementation

ARTIFACT 3: Claude Code Configuration (D3)
  ✅ CLAUDE.md — comprehensive project context
  ✅ SKILL.md — session state tracking
  ✅ GitHub Actions for Cloudflare deploy

ARTIFACT 4: Prompt Engineering (D4)
  ✅ System prompt template dengan 6 sections
  ✅ Few-shot examples (ScoutScorer + 2 examples)
  ✅ JSON schema enforcement via tool_choice
  ✅ Retry loop dengan schema validation

ARTIFACT 5: Reliability Patterns (D5)
  ✅ SovereignFallbackChain implementation
  ✅ Error taxonomy (SovereignErrorCode enum)
  ✅ Context trimming utility
  ✅ Exponential backoff implementation

KESIAPAN EXAM:
  ✅ Semua 5 artifacts di GitHub
  ✅ Practice score >= 850/1000 di 2 mock exams berturut-turut
  ✅ Anti-pattern 7 items hafal luar kepala
  ✅ Semua domain study questions bisa dijawab tanpa referensi
  ✅ Device setup: laptop dengan webcam, mic, ID ready
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | CCA Alignment Map v1.0 — 5 domains, study plan, portfolio checklist |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
