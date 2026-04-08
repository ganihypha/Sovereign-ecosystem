# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 7: MODULE TASK BREAKDOWN
# (Pemecahan Tugas Operasional Per Modul — Siap Feed ke AI Developer)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Dokumen ini adalah operating manual untuk AI Developer. Setiap task sudah dipecah menjadi unit terkecil yang bisa dieksekusi dalam satu sesi tanpa ambiguitas."*

---

## ═══════════════════════════════════════════
## SPRINT 1: FOUNDATION HARDENING
## ═══════════════════════════════════════════
### Timeline: 1-2 sesi build | Priority: P0 CRITICAL

---

### TASK 1.1 — Buat 4 Tabel Supabase Baru

**Modul:** Data Layer  
**Estimasi:** 30 menit  
**Dependencies:** Akses Supabase Dashboard / SQL Editor  

**Instruksi untuk AI Developer:**
```
Buat 4 tabel baru di Supabase menggunakan SQL berikut.
Jalankan di Supabase SQL Editor atau via migration file.

-- Tabel 1: wa_logs (Audit trail semua WA yang dikirim)
CREATE TABLE IF NOT EXISTS wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('day0', 'day3', 'day7', 'day14', 'custom', 'broadcast')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'replied')),
  fonnte_message_id TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto', 'sequence')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 2: ai_tasks (Queue untuk semua AI task)
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('scout_score', 'compose_message', 'generate_insight', 'crew_kickoff', 'anomaly_detect')),
  agent TEXT NOT NULL CHECK (agent IN ('ScoutScorer', 'MessageComposer', 'InsightGenerator', 'AnomalyDetector', 'CrewAI')),
  input_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed')),
  result JSONB,
  error_message TEXT,
  external_task_id TEXT, -- untuk CrewAI task ID
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel 3: ai_insights (Insights yang dihasilkan AI)
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('demand', 'system', 'trust', 'revenue', 'lead', 'outreach', 'weekly_report')),
  layer TEXT CHECK (layer IN ('brand_machine', 'growth_engine', 'trust_engine', 'cross_layer')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action TEXT,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  urgency TEXT CHECK (urgency IN ('immediate', 'this_week', 'this_month')),
  data_basis TEXT,
  is_actioned BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Tabel 4: order_items (Line items per order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price > 0),
  subtotal INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_wa_logs_lead_id ON wa_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_phone ON wa_logs(phone);
CREATE INDEX IF NOT EXISTS idx_wa_logs_status ON wa_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON ai_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

**Verifikasi:**
```sql
-- Jalankan ini untuk verifikasi semua tabel ada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wa_logs', 'ai_tasks', 'ai_insights', 'order_items');
-- Expected: 4 rows
```

---

### TASK 1.2 — Build Fonnte WA API Routes

**Modul:** Closer Agent — WhatsApp Bridge  
**File:** `src/routes/wa.ts`  
**Estimasi:** 45 menit  
**Dependencies:** `FONNTE_TOKEN` di `.dev.vars`  

**Instruksi untuk AI Developer:**
```
Buat file src/routes/wa.ts dengan 3 endpoints berikut.
Pastikan semua routes protected dengan JWT middleware.
Fonnte API base URL: https://api.fonnte.com
Fonnte docs: endpoint /send untuk single, /send-bulk untuk broadcast.

ENDPOINT 1: POST /api/wa/send
Purpose: Kirim single WA message via Fonnte
Request body: { phone: string, message: string, delay?: number }
Response success: { success: true, message_id: string, logged_at: string }
Response error: { success: false, error: string, code: string }

Logic:
1. Validate phone format (08xxx atau 628xxx)
2. Normalize phone ke format 628xxx
3. Check rate limit: query wa_logs WHERE phone=? AND sent_at > NOW()-24h
4. Jika sudah ada → return { success: false, error: "Rate limit: 1 message per 24h", code: "RATE_LIMIT" }
5. POST ke https://api.fonnte.com/send dengan header Authorization: FONNTE_TOKEN
6. Body Fonnte: { target: phone, message: message, delay: delay||2 }
7. Parse response Fonnte
8. INSERT ke wa_logs dengan status dan fonnte_message_id
9. Return standardized response

ENDPOINT 2: POST /api/wa/broadcast
Purpose: Kirim WA ke multiple targets
Request body: { targets: Array<{phone, message}>, delay_between?: number }
Constraint: Max 50 targets per request, chunk per 10 dengan delay 5s antar chunk
Response: { success: true, sent: number, failed: number, results: Array }

ENDPOINT 3: GET /api/wa/status
Purpose: Cek device status Fonnte (apakah WA terhubung)
GET https://api.fonnte.com/device dengan header Authorization: FONNTE_TOKEN
Response: { connected: boolean, phone_number: string, device_name: string }
```

**Context tambahan untuk AI Developer:**
```
Fonnte API reference (simpel):
  Base: https://api.fonnte.com
  Auth: Header "Authorization: BEARER_TOKEN" (format tanpa "Bearer", langsung token)
  
  POST /send
  Headers: { Authorization: process.env.FONNTE_TOKEN }
  Body: { target: "628xxx", message: "text", delay: 2 }
  Response: { status: true, id: "xxx" } atau { status: false, reason: "..." }
  
  GET /device  
  Headers: { Authorization: process.env.FONNTE_TOKEN }
  Response: { name: "...", status: "connect", device: "62xxx" }
```

---

### TASK 1.3 — Tambah .dev.vars Entries

**Modul:** Configuration  
**Estimasi:** 10 menit  
**Manual Task (bukan AI):** Founder perlu isi sendiri  

```bash
# Tambahkan ke file .dev.vars (JANGAN commit ke git!)
FONNTE_TOKEN=<isi dari fonnte.com setelah daftar>
OPENAI_API_KEY=<isi dari platform.openai.com>
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Tambahkan ke Cloudflare Secrets (untuk production)
npx wrangler pages secret put FONNTE_TOKEN
npx wrangler pages secret put OPENAI_API_KEY
```

---

### TASK 1.4 — Device ID Cookie Lock

**Modul:** Auth Gate  
**File:** `src/middleware/auth.ts`  
**Estimasi:** 30 menit  
**Note:** P1 — bisa dikerjakan paralel  

**Instruksi untuk AI Developer:**
```
Update src/middleware/auth.ts untuk tambahkan Device ID cookie locking.

Logic:
1. Saat login berhasil (PIN correct):
   a. Generate device_id = SHA256(userAgent + timestamp + random)
   b. Set cookie "sovereign_device" = device_id
      Options: HttpOnly: true, Secure: true, SameSite: Strict, MaxAge: 30 days
   c. Store device_id di JWT claims: { userId: "founder", deviceId: "xxx" }

2. Saat verify setiap request:
   a. Extract device_id dari JWT claims
   b. Read cookie "sovereign_device" dari request
   c. Jika cookie tidak ada atau tidak match → return 401 "Device not recognized"

3. Edge case: Jika device_id tidak ada di JWT (old tokens) → skip check, tidak reject
   (backward compatibility)

Gunakan Web Crypto API (bukan Node.js crypto):
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
```

---

## ═══════════════════════════════════════════
## SPRINT 2: SCOUT AGENT AI
## ═══════════════════════════════════════════
### Timeline: 2-3 sesi build | Priority: P0 CRITICAL

---

### TASK 2.1 — Install LangGraph.js Dependencies

**Modul:** AI Layer Setup  
**Estimasi:** 15 menit  

```bash
cd /path/to/sovereign-engine

# Install core AI packages
npm install @langchain/langgraph @langchain/openai @langchain/core langchain

# Install utility packages
npm install zod     # Schema validation
npm install @types/node --save-dev

# Verify install
cat package.json | grep langchain
```

---

### TASK 2.2 — Build ScoutScorer LangGraph Agent

**Modul:** Scout Agent AI  
**File:** `src/agents/scout-scorer.ts`  
**Estimasi:** 90 menit  
**Dependencies:** OPENAI_API_KEY, @langchain/langgraph, zod  

**Instruksi untuk AI Developer:**
```
Buat file src/agents/scout-scorer.ts dengan implementasi lengkap.

ARSITEKTUR (State Machine):
State type: {
  leadId: string;
  username: string;
  profileData: IGProfile | null;
  baseScore: number;
  aiOverlay: number;
  finalScore: number;
  label: 'HOT'|'WARM'|'COOL'|'COLD';
  reasoning: string;
  confidence: number;
  error: string | null;
  retryCount: number;
}

NODES:
1. fetchProfileNode → panggil ScraperAPI, simpan ke state.profileData
2. computeBaseScoreNode → deterministic scoring (lihat algorithm di doc 03)
3. aiOverlayNode → Claude API call dengan tool_choice untuk +/- 20 pts
4. validateOutputNode → Zod schema validation
5. saveScoreNode → Update leads table di Supabase

EDGES:
START → fetchProfile → computeBaseScore → aiOverlay → validateOutput
validateOutput → [pass: saveScore → END] | [fail & retry<2: aiOverlay]
                                          | [fail & retry>=2: saveScore dengan fallback]

TOOL untuk Claude (aiOverlayNode):
{
  name: "submit_score_adjustment",
  description: "Submit AI score adjustment (-20 to +20) based on holistic analysis",
  input_schema: {
    type: "object",
    properties: {
      adjustment: { type: "integer", minimum: -20, maximum: 20 },
      reasoning: { type: "string", maxLength: 200 },
      highlights: { type: "array", items: { type: "string" }, maxItems: 5 },
      concerns: { type: "array", items: { type: "string" }, maxItems: 3 },
      recommended_action: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["adjustment", "reasoning", "confidence"]
  }
}

Temperature: 0 (konsistensi penting untuk scoring)
Max tokens: 500
Model: claude-opus-4-5 atau claude-3-5-haiku-latest (lebih murah, cukup untuk scoring)

ERROR HANDLING:
- ScraperAPI fail → skip enrichment, compute base score dari data yang ada
- Claude API fail → return base score saja, note "ai_enrichment_unavailable"
- Schema validation fail → retry max 2x, lalu fallback

EXPORT:
export async function runScoutScorer(leadId: string, env: Env): Promise<ScoreResult>
```

---

### TASK 2.3 — Build /api/scout/gather Endpoint

**Modul:** Scout Agent — IG Scraping  
**File:** `src/routes/scout.ts` (tambah endpoint baru)  
**Estimasi:** 60 menit  
**Dependencies:** SCRAPER_API_KEY  

**Instruksi untuk AI Developer:**
```
Tambahkan endpoint POST /api/scout/gather ke src/routes/scout.ts.

REQUEST: { query: string, limit?: number (default 20, max 50) }
RESPONSE: { scraped: number, added: number, duplicates: number, leads: Array }

LOGIC:
1. Validate input (query required, limit 1-50)
2. Call ScraperAPI Instagram search:
   URL: https://api.scraperapi.com/?api_key=KEY&url=https://www.instagram.com/explore/search/keyword/?q=QUERY
   
   Alternative jika search tidak available — scrape user list:
   URL: https://api.scraperapi.com/?api_key=KEY&url=https://www.instagram.com/HASHTAG/
   
3. Parse response → extract list of usernames/profiles
4. For each profile:
   a. Check duplicate: SELECT id FROM leads WHERE instagram_username = ?
   b. If duplicate → skip, increment duplicates counter
   c. If new → INSERT to leads table with:
      instagram_username, shop_name (from fullName), followers_count,
      engagement_rate (calculated if available), status='new', score=0
5. Return summary + array of newly added leads

IMPORTANT:
- Handle ScraperAPI rate limit (429) → return partial results dengan note
- Handle empty results → return { scraped: 0, added: 0, message: "No profiles found" }
- Timeout guard: jika scraping > 10 detik → return partial
- Duplicate check HARUS ada sebelum INSERT
```

---

### TASK 2.4 — Build /api/scout/ai-score Endpoint

**Modul:** Scout Agent — AI Scoring Route  
**File:** `src/routes/scout.ts` (tambah endpoint)  
**Estimasi:** 30 menit  
**Dependencies:** ScoutScorer agent (Task 2.2), OPENAI_API_KEY  

**Instruksi untuk AI Developer:**
```
Tambahkan endpoint POST /api/scout/ai-score ke src/routes/scout.ts.

REQUEST: { lead_id: string }
RESPONSE: { 
  success: boolean,
  lead_id: string,
  score: number,
  label: string,
  reasoning: string,
  confidence: number,
  source: "ai" | "algorithm" | "fallback"
}

LOGIC:
1. Validate lead_id exists di Supabase
2. Call runScoutScorer(lead_id, env)
3. Update leads table: score, label, notes (reasoning), ai_scored=true
4. Return result

ERROR CASES:
- lead_id tidak ada → 404
- Agent fail completely → 500 dengan error details
- Partial success (algorithm only) → 200 dengan source: "algorithm"
```

---

### TASK 2.5 — Update Scout UI

**Modul:** Frontend — Scout Agent Page  
**File:** `src/index.tsx` atau `public/app.js`  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Update halaman /app/scout dengan tambahan dua tombol dan handling:

1. Tombol "Gather from IG"
   - Input: text field untuk query (contoh: "reseller fashion jakarta")
   - Tombol: "Gather Leads" → POST /api/scout/gather
   - Loading state: spinner + "Scraping Instagram..."
   - Success: toast "X leads added!" + reload table
   - Error: toast merah dengan error message

2. Tombol "AI Score" (per baris di tabel)
   - Icon robot/star di kolom Actions
   - Click → POST /api/scout/ai-score dengan lead_id
   - Loading: row highlight + spinner di tombol
   - Success: update score di tabel + label badge warna sesuai HOT/WARM/COOL/COLD
   - Error: toast merah

3. Tombol "AI Score All" (bulk)
   - Di header tabel
   - Click → loop POST /api/scout/ai-score untuk semua leads yang belum di-score
   - Progress: "Scoring X of Y..."
   - Delay 500ms antar request (jangan flood API)

Design reference: pakai warna dari design system (HOT=#22C55E, WARM=#F59E0B, COOL=#3B82F6, COLD=#6B7280)
```

---

## ═══════════════════════════════════════════
## SPRINT 3: CLOSER AGENT AUTOMATION
## ═══════════════════════════════════════════
### Timeline: 2-3 sesi build | Priority: P0 CRITICAL

---

### TASK 3.1 — Build MessageComposer LangGraph Agent

**Modul:** Closer Agent AI  
**File:** `src/agents/message-composer.ts`  
**Estimasi:** 75 menit  
**Dependencies:** OPENAI_API_KEY, @langchain/langgraph  

**Instruksi untuk AI Developer:**
```
Buat file src/agents/message-composer.ts.

INPUT STATE:
{
  leadId: string;
  templateType: 'day0' | 'day3' | 'day7' | 'day14' | 'custom';
  leadData: LeadProfile;
  outreachHistory: OutreachLog[];
  convertedCount?: number; // untuk day7
  remainingSlots?: number; // untuk day14
}

LOGIC (single-node, non-graph — lebih simpel dari ScoutScorer):
1. Build context dari leadData + outreachHistory
2. Select base template berdasarkan templateType
3. Call Claude API dengan:
   - System prompt: MessageComposer role (lihat doc 04)
   - User message: data lead + template yang harus dipersonalisasi
   - Tool: submit_composed_message (lihat schema di bawah)
   - Temperature: 0.4
   - Max tokens: 600

TOOL untuk Claude:
{
  name: "submit_composed_message",
  description: "Submit the personalized WhatsApp message ready to send",
  input_schema: {
    type: "object",
    properties: {
      message: { type: "string", maxLength: 500, description: "Final WhatsApp message, max 500 chars" },
      personalization_elements: { type: "array", items: { type: "string" } },
      tone: { type: "string", enum: ["friendly", "professional", "urgent", "casual"] },
      estimated_response_probability: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["message", "tone"]
  }
}

VALIDATION:
- message.length <= 500 (WhatsApp limit consideration)
- Tidak boleh ada lebih dari 1 link
- Tidak boleh ada emoji > 2

FALLBACK:
- Jika Claude fail → return static template dengan basic interpolation

EXPORT:
export async function composeMessage(input: ComposerInput, env: Env): Promise<ComposedMessage>
```

---

### TASK 3.2 — Build Outreach Sequence Engine

**Modul:** Closer Agent — Sequence  
**File:** `src/routes/closer.ts` (tambah endpoint)  
**Estimasi:** 60 menit  
**Dependencies:** MessageComposer agent, Fonnte WA routes  

**Instruksi untuk AI Developer:**
```
Tambahkan endpoint POST /api/closer/sequence ke src/routes/closer.ts.

REQUEST: { 
  lead_id: string,
  start_day: 0 | 3 | 7 | 14,
  auto_send?: boolean (default: false — compose saja, tidak langsung kirim)
}

RESPONSE: {
  sequence_id: string,
  lead_id: string,
  messages_scheduled: [
    { day: 0, scheduled_at: ISO_timestamp, status: "ready" | "sent" },
    ...
  ]
}

LOGIC (untuk start_day = 0):
1. Fetch lead data dari Supabase
2. Check: apakah sudah ada sequence aktif untuk lead ini?
   → SELECT id FROM outreach_campaigns WHERE lead_id = ? AND status = 'active'
3. Jika sudah ada → return error "Active sequence already exists"
4. Compose Day 0 message via MessageComposer agent
5. INSERT ke outreach_campaigns: { lead_id, name: "AutoSeq-{date}", status: "active" }
6. INSERT ke outreach_logs: { campaign_id, lead_id, day: 0, message, status: "ready" }
7. Jika auto_send = true:
   → POST /api/wa/send dengan message
   → Update outreach_logs status ke "sent"
8. Schedule Day 3/7/14: simpan ke ai_tasks sebagai future tasks
   (actual sending bisa via cron atau manual trigger)

CRON NOTE: 
Cloudflare Workers tidak punya native cron di free plan.
Workaround: Simpan scheduled messages di ai_tasks dengan scheduled_for timestamp.
Founder bisa trigger manual atau gunakan Cloudflare Cron Triggers (Workers paid).
```

---

### TASK 3.3 — Build /api/closer/ai-compose Endpoint

**Modul:** Closer Agent — AI Compose Route  
**File:** `src/routes/closer.ts`  
**Estimasi:** 25 menit  

**Instruksi untuk AI Developer:**
```
Tambahkan endpoint POST /api/closer/ai-compose ke src/routes/closer.ts.

REQUEST: { lead_id: string, template_type: "day0"|"day3"|"day7"|"day14"|"custom" }
RESPONSE: {
  success: boolean,
  composed_message: string,
  template_used: string,
  personalization_score: float,
  ready_to_send: boolean
}

LOGIC:
1. Fetch lead dari Supabase
2. Fetch outreach history dari wa_logs WHERE phone = lead.phone
3. Check: jika outreach_history menunjukkan 3+ unresponded messages
   → return { success: false, error: "ESCALATE_TO_MANUAL", requires_review: true }
4. Call composeMessage(input, env)
5. Return composed result

Note: Endpoint ini TIDAK kirim WA — hanya compose.
Kirim WA dilakukan terpisah via POST /api/wa/send dengan message dari response ini.
```

---

### TASK 3.4 — Update Closer UI

**Modul:** Frontend — Closer Agent Page  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Update halaman /app/closer dengan fitur berikut:

1. Tab "AI Compose"
   - Dropdown: pilih lead dari HOT leads (score >= 70)
   - Dropdown: template type (Day 0/3/7/14/Custom)
   - Tombol "Compose with AI" → POST /api/closer/ai-compose
   - Preview area: tampilkan pesan hasil compose
   - Tombol "Send via Fonnte" → POST /api/wa/send dengan pesan tersebut
   - Konfirmasi dialog sebelum send

2. Log tabel (update):
   - Tambah kolom "Source" (manual/auto/AI)
   - Tambah kolom "Template" (day0/day3/etc.)
   - Filter by status (sent/pending/failed)

3. Device Status widget:
   - GET /api/wa/status saat halaman load
   - Tampilkan: connected/disconnected dengan warna badge
   - "WhatsApp Connected ✅" atau "WhatsApp Disconnected ❌"
```

---

## ═══════════════════════════════════════════
## SPRINT 4: AI INTELLIGENCE CENTER
## ═══════════════════════════════════════════
### Timeline: 2-3 sesi build | Priority: P1 HIGH

---

### TASK 4.1 — Build InsightGenerator LangGraph Agent

**Modul:** AI Intelligence — Insight Generation  
**File:** `src/agents/insight-generator.ts`  
**Estimasi:** 90 menit  
**Dependencies:** OPENAI_API_KEY  

**Instruksi untuk AI Developer:**
```
Buat file src/agents/insight-generator.ts.

TWO-PASS APPROACH (context management pattern):

PASS 1 — Summary Analysis:
  Input: { revenue_7d, orders_7d, hot_leads_uncontacted, wa_response_rate_7d, validation_scores }
  Call Claude: "Berdasarkan summary ini, area mana yang butuh insight mendalam?"
  Output: areasToAnalyze: string[] (max 3 area)

PASS 2 — Deep Insight per area:
  For each area in areasToAnalyze:
    Fetch detailed data untuk area tersebut
    Call Claude dengan tool submit_insight untuk tiap insight
  Aggregate: max 5 insights total

TOOL untuk Pass 2:
{
  name: "submit_insight",
  description: "Submit one actionable business insight",
  input_schema: {
    type: "object",
    properties: {
      insight_type: { type: "string", enum: ["demand","system","trust","revenue","lead","outreach"] },
      layer: { type: "string", enum: ["brand_machine","growth_engine","trust_engine","cross_layer"] },
      title: { type: "string", maxLength: 60 },
      body: { type: "string", maxLength: 200 },
      action: { type: "string", maxLength: 100 },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      urgency: { type: "string", enum: ["immediate","this_week","this_month"] },
      data_basis: { type: "string" }
    },
    required: ["insight_type", "title", "body", "action", "confidence", "urgency"]
  }
}

Temperature: 0.6
Max tokens per call: 1000

DEDUPLICATION:
- Fetch recent_insights dari last 24 hours
- Jika title similarity > 80% → skip (jangan duplikasi)

ESCALATION:
IF hot_leads_uncontacted > 5 → auto-add insight dengan urgency "immediate"
IF revenue_this_week < 50% last_week → auto-add revenue drop insight

EXPORT:
export async function generateInsights(env: Env): Promise<InsightResult[]>
```

---

### TASK 4.2 — Build CrewAI Client

**Modul:** AI Intelligence — CrewAI Integration  
**File:** `src/agents/crewai-client.ts`  
**Estimasi:** 45 menit  
**Dependencies:** CREWAI_ENTERPRISE_TOKEN, CREWAI_PAT  

**Instruksi untuk AI Developer:**
```
Buat file src/agents/crewai-client.ts dengan 3 functions.

FUNCTION 1: kickoffCrew
async function kickoffCrew(crewName: string, inputs: Record<string, any>, env: Env): Promise<{task_id: string}>

Logic:
1. POST https://api.crewai.com/crewai/kickoff
   Headers: { Authorization: "Bearer " + CREWAI_ENTERPRISE_TOKEN, "X-Org-Id": CREWAI_ORG_ID }
   Body: { name: crewName, inputs: inputs }
2. Return { task_id: response.id }
3. INSERT ke ai_tasks: { task_type: "crew_kickoff", agent: "CrewAI", external_task_id: task_id, status: "running" }

FUNCTION 2: getCrewStatus
async function getCrewStatus(taskId: string, env: Env): Promise<{status: string, progress?: number}>

Logic:
1. GET https://api.crewai.com/crewai/status/{taskId}
   Headers: { Authorization: "Bearer " + CREWAI_ENTERPRISE_TOKEN }
2. Return normalized status: "queued" | "running" | "done" | "failed"

FUNCTION 3: getCrewResult
async function getCrewResult(taskId: string, env: Env): Promise<CrewResult>

Logic:
1. GET https://api.crewai.com/crewai/result/{taskId}
2. Parse result JSON
3. INSERT ke ai_insights dengan type "weekly_report"
4. Return parsed result

ERROR HANDLING:
- Network error → structured error response
- CrewAI 401 → { error: "CREWAI_AUTH_FAILED", message: "Check CREWAI tokens" }
- CrewAI 404 → { error: "TASK_NOT_FOUND", message: "Invalid task_id" }
```

---

### TASK 4.3 — Build AI Intelligence Routes

**Modul:** AI Intelligence — API Routes  
**File:** `src/routes/ai.ts` (file baru)  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Buat file src/routes/ai.ts dengan routes berikut.

1. GET /api/dashboard/ai-insights
   Fetch top 5 insights dari ai_insights WHERE expires_at > NOW() ORDER BY confidence DESC
   Return: { insights: array, generated_at: timestamp }

2. GET /api/ai/tasks
   Fetch recent 20 tasks dari ai_tasks ORDER BY created_at DESC
   Return: { tasks: array }

3. POST /api/ai/tasks
   Create new AI task
   Body: { task_type: string, agent: string, input_data: object }
   Return: { task_id: string, status: "queued" }

4. GET /api/ai/tasks/:id
   Fetch task + result
   Return: { task: object, result: object | null }

5. GET /api/ai/insights
   Fetch all active insights (tidak expired)
   Optional query params: ?type=demand&layer=brand_machine&limit=10

6. POST /api/ai/crew/kickoff
   Trigger CrewAI crew
   Body: { crew_name: string, inputs: object }
   Return: { task_id: string, status: "queued", estimated_time: "3-5 minutes" }

7. GET /api/ai/crew/status/:id
   Poll CrewAI task status
   Return: { status: string, result: object | null }

8. POST /api/ai/generate-insights
   Trigger InsightGenerator agent immediately
   Return: { insights_generated: number, task_id: string }
```

---

### TASK 4.4 — Build AI Intelligence Page

**Modul:** Frontend — AI Intelligence  
**File:** `src/index.tsx` (tambah route /app/ai)  
**Estimasi:** 60 menit  

**Instruksi untuk AI Developer:**
```
Buat halaman /app/ai dengan layout berikut (Terminal-Chic Glassmorphism):

SECTION 1: Engine Status Bar
  - LangGraph.js status: GET /api/health → check if agents loaded
    Badge: ONLINE (hijau) atau OFFLINE (merah)
  - CrewAI status: GET /api/ai/crew/status/latest atau check last task
    Badge: ACTIVE / STANDBY / ERROR
  - OpenAI: selalu tampil sebagai CONNECTED jika key ada

SECTION 2: AI Insights Cards (top 5)
  - GET /api/ai/insights?limit=5
  - Setiap card: icon, type badge, title, body, action button (copy/implement)
  - Color coding: immediate=red border, this_week=amber, this_month=blue
  - Tombol "Refresh Insights" → POST /api/ai/generate-insights

SECTION 3: AI Task Queue Table
  - GET /api/ai/tasks?limit=20
  - Kolom: Task Type, Agent, Status, Created At, Duration
  - Status badge: queued (abu), running (kuning animasi), done (hijau), failed (merah)
  - Auto-refresh setiap 10 detik jika ada task "running"

SECTION 4: CrewAI Manual Trigger
  - Dropdown: pilih crew (MarketValidationCrew / LeadResearchCrew / RevenueAnalysisCrew)
  - Input: additional context (optional)
  - Tombol "Run Analysis" → POST /api/ai/crew/kickoff
  - Progress bar + status polling setelah kickoff
```

---

## ═══════════════════════════════════════════
## SPRINT 5: DASHBOARD UPGRADE + POLISH
## ═══════════════════════════════════════════
### Timeline: 1-2 sesi build | Priority: P1 HIGH

---

### TASK 5.1 — Upgrade Dashboard Stats Endpoint

**Modul:** Dashboard — Real-Money Metrics  
**File:** `src/routes/dashboard.ts`  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Update GET /api/dashboard/stats untuk tambahkan:

1. Unpaid invoices:
   SELECT COALESCE(SUM(total_amount), 0) as unpaid_total,
          COUNT(*) as unpaid_count
   FROM orders WHERE status IN ('pending', 'processing')

2. Revenue growth %:
   revenue_this_week = SUM WHERE created_at >= NOW()-7d AND status='completed'
   revenue_last_week = SUM WHERE created_at BETWEEN NOW()-14d AND NOW()-7d
   growth_pct = ((this - last) / last) * 100
   
3. AOV (Average Order Value):
   SELECT AVG(total_amount) FROM orders WHERE status = 'completed'

4. Top product this week:
   SELECT p.name, COUNT(oi.id) as sold_count
   FROM order_items oi JOIN products p ON oi.product_id = p.id
   JOIN orders o ON oi.order_id = o.id
   WHERE o.created_at >= NOW()-7d AND o.status = 'completed'
   GROUP BY p.name ORDER BY sold_count DESC LIMIT 1

Updated response schema:
{
  revenue: {
    today: number,
    this_week: number,
    this_month: number,
    growth_pct: number,
    unpaid_total: number,
    unpaid_count: number,
    aov: number
  },
  ...existing fields...
}
```

---

### TASK 5.2 — Dashboard AI Insights Widget

**Modul:** Frontend — Dashboard Upgrade  
**Estimasi:** 30 menit  

**Instruksi untuk AI Developer:**
```
Di halaman /app/dashboard, tambahkan:

1. "AI Insights" section (di bawah stats cards):
   GET /api/ai/insights?limit=3 saat page load
   Tampilkan max 3 insight terbaru
   Setiap insight: icon, title, action
   Tombol kecil "See All" → link ke /app/ai

2. "Unpaid Invoices" warning card:
   Jika unpaid_total > 0 → tampilkan card amber dengan jumlah
   Link ke /app/orders?filter=pending

3. Revenue Growth indicator:
   Di revenue card: tambahkan "+X%" atau "-X%" dengan warna hijau/merah
   Berdasarkan growth_pct dari stats endpoint
```

---

### TASK 5.3 — Mobile Responsive Polish

**Modul:** Frontend — Responsive  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Pastikan semua halaman responsive di mobile (<768px):

1. Sidebar: hidden di mobile, toggle via hamburger menu
   Hamburger: fixed top-right, z-50
   Sidebar overlay: saat open, gunakan backdrop semi-transparent

2. Stats cards: stack vertical di mobile (grid-cols-1)
   Di desktop: grid-cols-2 atau grid-cols-4

3. Tables: horizontal scroll di mobile (overflow-x-auto)
   Di mobile: hide columns yang kurang penting (sertakan data-mobile="hide" attr)

4. Modals: full-screen di mobile (width: 100%, height: auto, top: 0)

5. Tombol-tombol: full-width di mobile, normal width di desktop

Test di: Chrome DevTools → iPhone SE (375px width)
```

---

## ═══════════════════════════════════════════
## SPRINT 6: VALIDATION & CONTENT (P2)
## ═══════════════════════════════════════════
### Timeline: 1-2 sesi build | Priority: P2 MEDIUM

---

### TASK 6.1 — Market Validation AI Insights

**Modul:** Market Validation — AI Layer  
**Estimasi:** 30 menit  

**Instruksi untuk AI Developer:**
```
Update GET /api/validation/report untuk tambahkan AI-powered analysis:

1. Setelah fetch validation_metrics, call InsightGenerator dengan context:
   { validation_events_summary, metrics_per_layer }
   
2. Hasilkan 1 insight per layer (demand/system/trust)

3. Tambahkan "validation_score" overall (0-100) berdasarkan:
   - Demand score (bobot 40%)
   - System score (bobot 35%)  
   - Trust score (bobot 25%)

4. Simpan ke ai_insights dengan type "demand"/"system"/"trust"
```

---

### TASK 6.2 — Content Calendar Basic Structure

**Modul:** Content Calendar  
**File:** `src/routes/content.ts` (file baru)  
**Estimasi:** 45 menit  

**Instruksi untuk AI Developer:**
```
Buat basic content calendar (CRUD saja, tidak perlu AI dulu):

1. Buat tabel content_calendar di Supabase:
   CREATE TABLE content_calendar (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     brand TEXT NOT NULL CHECK (brand IN ('fashionkas', 'resellerkas', 'founder')),
     scheduled_date DATE NOT NULL,
     content_type TEXT CHECK (content_type IN ('post', 'story', 'reel', 'carousel')),
     caption TEXT,
     hashtags TEXT[],
     visual_brief TEXT,
     status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'posted', 'skipped')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

2. Buat routes:
   GET /api/content → list entries, filter by brand dan date range
   POST /api/content → tambah entry baru
   PUT /api/content/:id → update
   DELETE /api/content/:id → delete

3. Basic UI di /app/content:
   Calendar view sederhana (tabel dengan kolom tanggal)
   Filter by brand
   Add/edit modal
```

---

## 📊 TASK PRIORITY SUMMARY

```
LEGEND: [P0] = Harus selesai | [P1] = Sangat penting | [P2] = Nice to have

Sprint 1 (Foundation):
  [P0] Task 1.1: 4 Tabel Supabase baru
  [P0] Task 1.2: Fonnte WA API routes
  [P0] Task 1.3: .dev.vars update (MANUAL — Founder)
  [P1] Task 1.4: Device ID locking

Sprint 2 (Scout AI):
  [P0] Task 2.1: Install LangGraph.js deps
  [P0] Task 2.2: ScoutScorer agent
  [P0] Task 2.3: /api/scout/gather
  [P0] Task 2.4: /api/scout/ai-score
  [P1] Task 2.5: Scout UI update

Sprint 3 (Closer AI):
  [P0] Task 3.1: MessageComposer agent
  [P0] Task 3.2: Sequence engine
  [P0] Task 3.3: /api/closer/ai-compose
  [P1] Task 3.4: Closer UI update

Sprint 4 (AI Intelligence):
  [P1] Task 4.1: InsightGenerator agent
  [P1] Task 4.2: CrewAI client
  [P1] Task 4.3: AI routes
  [P1] Task 4.4: AI Intelligence page

Sprint 5 (Dashboard):
  [P1] Task 5.1: Dashboard stats upgrade
  [P1] Task 5.2: AI insights widget
  [P1] Task 5.3: Mobile responsive

Sprint 6 (Validation + Content):
  [P2] Task 6.1: Validation AI insights
  [P2] Task 6.2: Content calendar
```

---

## 🔧 CARA PAKAI DOKUMEN INI DENGAN AI DEVELOPER

```
TEMPLATE UNTUK SETIAP TASK:
─────────────────────────────────────
"Kita lanjut ke [TASK X.Y — NAMA TASK].

Konteks sistem:
- Sovereign Business Engine — private AI command center
- Stack: Hono.js + Cloudflare Workers + LangGraph.js + Supabase
- Jangan pakai Node.js-specific APIs (no fs, no path)
- Error response selalu: { success: false, error: string, code: string }

Task ini:
[paste instruksi dari task yang relevan]

Setelah selesai:
1. Test dengan curl: [test command]
2. Confirm output sesuai schema
3. Commit: 'feat: [nama task]'
─────────────────────────────────────

ATURAN PENTING:
1. Feed SATU task per sesi — jangan minta banyak sekaligus
2. Test setiap task sebelum lanjut ke task berikutnya
3. Update status di SKILL.md setelah setiap task selesai
4. Jika blocked (missing key, dll) → catat di SKILL.md dan skip dulu
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Module Task Breakdown v1.0 — 6 sprints, 18 tasks |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
