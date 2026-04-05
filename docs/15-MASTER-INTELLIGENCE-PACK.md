# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 15: MASTER INTELLIGENCE PACK — DEEP RESEARCH EDITION
# (Framework 4-Pack: Core Official → Distilled Rules → Project OS → Task Prompts)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02 | Versi: 4.0

---

> *"Build × Certify × Scale. Target: Rp 75 Jt/bulan (Fase 3) | CCA-F: Minggu 12 | Live: sovereign-orchestrator.pages.dev"*

---

## 🗺️ MENGAPA DOKUMEN INI ADA

Dokumen ini adalah **meta-dokumen** — panduan untuk memahami bagaimana seluruh 17 dokumen
Sovereign Business Engine saling terhubung dan cara menggunakannya secara optimal.

Setiap kali kamu duduk untuk build, certify, atau pitch — dokumen ini adalah **entry point pertama**.

```
PROBLEM:
  17+ dokumen bisa overwhelming
  Tidak tahu dokumen mana dipakai untuk tujuan apa

SOLUSI — FRAMEWORK 4-PACK:
  A. Core Official Pack     → SUMBER KEBENARAN EKSTERNAL (Anthropic)
  B. Distilled Build Rules  → ATURAN INTERNAL (abstraksi dari A)
  C. Project Operating Pack → STATE MESIN SEKARANG (snapshot)
  D. Task-Specific Prompts  → INPUT KE AI DEVELOPER (per build session)
```

---

## 📦 PACK A: CORE OFFICIAL PACK
### Sumber Kebenaran Eksternal — Anthropic & Tools

> *"Ini yang diajarkan Anthropic. Semua build rule kita harus berakar di sini."*

### A.1 — Anthropic Academy Courses

| Course | Relevansi | Prioritas |
|--------|-----------|-----------|
| Building with Claude API | Core — seluruh agent | 🔴 P0 |
| Claude Code in Action | Domain 3 CCA-F — 47% soal | 🔴 P0 |
| Intro to MCP | Tool schema untuk agen | 🟡 P1 |
| MCP Advanced | Multi-tool orchestration | 🟡 P1 |
| CCA-F Exam Guide | Ujian $99, 60 soal, 120 menit | 🔴 P0 |

Link registrasi: https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
Claude Code course: https://anthropic.skilljar.com/claude-code-in-action

### A.2 — CCA-F Exam Domain Map

```
5 DOMAIN UJIAN CCA-F (60 Questions, 120 Minutes):

Domain 1: Agentic Architecture Design          ~27% (~16 soal)
  - Single vs multi-agent decision
  - Tool design & schema
  - Orchestration patterns
  - Failure handling & fallback

Domain 2: Effective Prompting & Context Mgmt   ~20% (~12 soal)
  - System prompt structure
  - Context window management
  - Output schema enforcement
  - Anti-patterns (hallucination, scope creep)

Domain 3: Claude Code & Developer Workflow     ~20% (~12 soal)
  - Claude Code CLI commands
  - Slash commands & custom tools
  - Memory & context persistence
  - Code generation patterns

Domain 4: MCP Design & Integration             ~17% (~10 soal)
  - Server & client setup
  - Tool schema design
  - Permission boundaries
  - MCP vs API decision

Domain 5: Safety, Trust & Production           ~16% (~10 soal)
  - Human-in-the-loop design
  - Permission levels
  - Audit & monitoring
  - Guardrails & rate limiting

KEY INSIGHT:
  "47% soal ada di Domain 1 + Domain 3"
  Mental model terpenting: PROGRAMMATIC ENFORCEMENT > PROMPT GUIDANCE
  Kalau system behavior perlu dijamin → kode, BUKAN prompt
```

### A.3 — Official Anthropic Principles

```
PRINSIP 1: Minimal Footprint
  Agent hanya request scope yang dibutuhkan, tidak lebih
  Engine: ScoutScorer hanya read leads, TIDAK write/delete

PRINSIP 2: Prefer Reversible Actions
  Default ke aksi yang bisa di-undo
  Engine: WA send = tidak reversible → butuh human confirmation

PRINSIP 3: Explicit Over Implicit
  Jangan biarkan agent assume — harus explicit di schema
  Engine: Semua output agent harus JSON schema terdefinisi

PRINSIP 4: Fail Loudly (Not Silently)
  Error harus jelas, bukan diam-diam fallback ke behavior salah
  Engine: ScraperAPI timeout → throw error, bukan return empty array

PRINSIP 5: Scope Boundaries
  Setiap agent punya allowed_tools dan forbidden_tools
  Engine: MessageComposer TIDAK bisa send WA langsung
```

### A.4 — MCP Tool Schema Template

```json
{
  "name": "get_lead_profile",
  "description": "Retrieve Instagram lead profile from Supabase leads table",
  "input_schema": {
    "type": "object",
    "properties": {
      "lead_id": { "type": "string", "description": "UUID of the lead" },
      "include_history": { "type": "boolean", "default": false }
    },
    "required": ["lead_id"]
  }
}

KAPAN PAKAI MCP vs REST:
  Pakai MCP: tools yang dipakai berulang, butuh schema validation,
             perlu permission model per tool, bisa di-reuse multi-agent
  Pakai REST: one-off integration, simple CRUD, tidak butuh agent access

PERMISSION LEVELS:
  read_only → ScoutScorer, InsightGenerator
  write     → MessageComposer (outreach_logs only)
  admin     → Founder only (direct Supabase)
```

---

## 📐 PACK B: DISTILLED BUILD RULES
### Aturan Internal — Abstraksi dari Anthropic Prinsip ke Engine Spesifik

> *"Rules of Engagement kita. Setiap keputusan arsitektur harus bisa di-justify dengan rule di bawah."*

### B.1 — Single vs Multi-Agent Decision

```
RULE B1: Kapan Perlu Multi-Agent?

  Pertanyaan → Apakah task bisa di-parallelkan?
    YES → Multi-agent (parallel)

  Pertanyaan → Apakah task terlalu panjang untuk 1 context window?
    YES → Pipeline agents

  Pertanyaan → Apakah perlu specialization berbeda?
    YES → Specialized agents per role

  Kalau tidak ada YES → Single agent cukup

ENGINE IMPLEMENTATION:
  Gather → ScoutScorer → MessageComposer → Fonnte
  = PIPELINE (output satu jadi input berikutnya)

  InsightGenerator + AnomalyDetector
  = PARALLEL (data yang sama, output berbeda, jalan bersamaan)
```

### B.2 — Structured Output Rule

```
RULE B2: Kapan Pakai Structured Output?

  WAJIB JSON kalau:
    - Output dipakai oleh kode lain
    - Output disimpan ke database
    - Output dirender di UI
    - Output jadi input agent berikutnya

  Boleh prose kalau:
    - Output hanya dibaca manusia (summary report founder)
    - Email/pesan informal

ENGINE:
  ScoutScorer        → WAJIB JSON { score, label, reasoning, ... }
  MessageComposer    → WAJIB JSON { message, personalization_elements, ... }
  InsightGenerator   → WAJIB JSON { insights: [...] }
  MarketValidationCrew → boleh prose executive summary
```

### B.3 — Programmatic vs Prompt Enforcement

```
RULE B3: KUNCI UTAMA CCA-F DAN ENGINE

  PROMPT GUIDANCE = "tolong jangan kirim lebih dari 1 WA per nomor per hari"
  → TIDAK reliable, bisa di-bypass, tidak deterministik

  PROGRAMMATIC  = cek database, kalau sudah ada record hari ini → block
  → 100% reliable, audit trail ada, tidak bisa di-bypass

  ATURAN: Kalau behavior PERLU dijamin 100% → PROGRAMMATIC

ENGINE APPLICATION:
  Rate limit WA (24h)  → CHECK DB (wa_logs), BUKAN prompt instruction
  Auth gate            → JWT verify kode, BUKAN "please authenticate first"
  Supabase RLS         → Row Level Security policy, BUKAN "jangan akses data orang lain"
  Score range 0-100    → Math.max(0, Math.min(100, score)), BUKAN "skor harus 0-100"
  Allowed tools        → tool schema list, BUKAN "kamu tidak boleh akses orders"
```

### B.4 — Context Window Management

```
RULE B4: Token Budget per Agent

  ScoutScorer:       max 4K tokens input, 500 tokens output
  MessageComposer:   max 2K tokens input, 300 tokens output
  InsightGenerator:  max 6K tokens input, 800 tokens output
  CrewAI reports:    max 8K tokens input, 2K tokens output

  RULES:
  1. Inject summary, BUKAN raw data
     BAD:  "Ini 500 leads dari database: [500 rows JSON]"
     GOOD: "Ada 500 leads. 45 HOT (45%), avg score 72. Top 5: [list 5 leads]"

  2. Progressive loading — ambil detail hanya kalau perlu
     ScoutScorer: load profile dulu → baru load history kalau score > 60

  3. Cache recurring data
     Product list, pricing, brand info → cache di KV, bukan re-query setiap request
```

### B.5 — Validation & Retry Pattern

```
RULE B5: Setiap External API Call Harus Punya:

  1. Timeout   : ScraperAPI 10s | OpenAI 30s | Fonnte 5s
  2. Retry     : max 2x, exponential backoff (1s, 3s)
  3. Fallback  : ScraperAPI fail → manual entry, TIDAK crash
  4. Error log : ke Supabase ai_tasks (status='failed')

  PATTERN:
  try {
    result = await callAPI(data, { timeout: 10000 })
  } catch (e) {
    if (attempt < 2) return retry(attempt + 1, delay * 3)
    else return { error: e.message, fallback: 'manual_entry' }
  }
```

### B.6 — Human-in-the-Loop Gates

```
RULE B6: Kapan Sistem Harus Stop dan Tunggu Founder Approve?

  WAJIB HUMAN GATE:
    - Kirim WA bulk (>5 nomor sekaligus) → konfirmasi founder
    - Kickoff LeadResearchCrew (on-demand, costly API call)
    - Update status lead ke "SKIP" secara massal
    - Trigger outreach sequence Day 0 pertama kali

  TIDAK PERLU HUMAN GATE:
    - AI scoring lead (hanya read + compute)
    - Generate insights (hanya analysis)
    - Status check Fonnte device
    - Refresh dashboard stats
    - Single WA send yang sudah dikonfirmasi manual
```

### B.7 — Fallback & Graceful Degradation

```
RULE B7: Hierarchy Fallback

  Level 1 (Full AI):      OpenAI + LangGraph + CrewAI available ✅
  Level 2 (Degraded AI):  OpenAI rate-limited → pakai template statis
  Level 3 (Manual):       OpenAI/Fonnte down → UI tetap, features disabled
                          dengan error message yang jelas
  Level 4 (Emergency):    Supabase down → static page "System maintenance"

  JANGAN PERNAH:
    - Blank screen tanpa pesan
    - HTTP 500 tanpa error message
    - Silent failure (berhasil padahal gagal)
    - Crash loop
```

### B.8 — Database Best Practices

```
RULE B8: Supabase Standards

  WAJIB di semua tabel:
    - id UUID DEFAULT gen_random_uuid() PRIMARY KEY
    - created_at TIMESTAMPTZ DEFAULT NOW()
    - RLS aktif (ALTER TABLE x ENABLE ROW LEVEL SECURITY)

  FOREIGN KEYS:
    - leads.customer_id → customers.id ON DELETE SET NULL
    - order_items.order_id → orders.id ON DELETE CASCADE
    - wa_logs.lead_id → leads.id ON DELETE SET NULL

  INDEXES (wajib untuk kolom yang di-filter):
    - status, score, created_at, lead_id, order_id

  SOFT DELETE:
    - Gunakan is_deleted BOOLEAN DEFAULT FALSE
    - Jangan DELETE fisik untuk data bisnis penting

  AUDIT TRAIL:
    - wa_logs dan ai_tasks TIDAK boleh dihapus manual
    - Ini adalah evidence untuk validasi bisnis dan debugging
```

### B.9 — API Route Standards

```
RULE B9: Setiap Route Harus:

  1. Validasi input (Hono validator atau zod schema)
  2. Auth check (JWT verify middleware) — SEMUA kecuali /api/auth/login
  3. Rate limit consideration (WA: 1 per phone per 24h)
  4. Consistent response format:
     SUCCESS: { success: true, data: {...}, meta: { timestamp } }
     ERROR:   { success: false, error: "message", code: "ERROR_CODE" }
  5. Log ke ai_tasks untuk semua AI-triggered routes
```

### B.10 — Anti-Pattern Master List

```
ANTI-PATTERN #1: God Agent
  BAD: 1 agent yang bisa scrape, score, compose WA, kirim, dan generate report
  GOOD: Pisah → ScoutScorer | MessageComposer | InsightGenerator | AnomalyDetector

ANTI-PATTERN #2: Prompt-Only Security
  BAD: System prompt: "Kamu tidak boleh mengakses data orders"
  GOOD: Allowed tools list: exclude orders_read dari ScoutScorer tool schema

ANTI-PATTERN #3: Context Stuffing
  BAD: Kirim 500 leads sebagai JSON ke prompt (mahal + lambat + error)
  GOOD: Kirim summary stats + top 5 leads saja

ANTI-PATTERN #4: Silent Fallback
  BAD: ScraperAPI gagal → return empty array tanpa error
  GOOD: ScraperAPI gagal → throw error "ScraperAPI timeout after 10s"

ANTI-PATTERN #5: Stateless Workflow
  BAD: Tidak log task yang sedang berjalan
  GOOD: Setiap AI task → insert ai_tasks BEFORE start, update AFTER done

ANTI-PATTERN #6: Hardcoded Thresholds
  BAD: if (score > 80) { label = 'HOT' }
  GOOD: const THRESHOLDS = { HOT: 80, WARM: 60, COOL: 40 }

ANTI-PATTERN #7: Blocking LangGraph in Worker
  BAD: Jalankan 5-agent pipeline di Cloudflare Worker (10ms CPU limit!)
  GOOD: Worker trigger + return task_id; polling endpoint untuk result

ANTI-PATTERN #8: Unvalidated Agent Output
  BAD: Langsung simpan output LLM ke database
  GOOD: Validasi JSON schema output sebelum simpan ke Supabase
```

---

## 🗂️ PACK C: PROJECT OPERATING PACK
### State Mesin Sekarang — Snapshot April 2026

> *"Sebelum setiap sesi build, baca Pack C untuk tahu posisi kita."*

### C.1 — Current System State

```
LIVE:  https://sovereign-orchestrator.pages.dev
REPO:  https://github.com/ganihypha/Sovereign.private.real.busines.orchest
DB:    https://lfohzibcsafqthupcvdg.supabase.co
CO:    PT WASKITA CAKRAWARTI DIGITAL

SUDAH ADA (v3.0):
  Auth Gate — PIN (bcrypt) + JWT (HS256, 7-day)
  Dashboard — stat cards, engine status, recent activity
  Scout Agent — manual entry, algorithm-based scoring
  Closer Agent — template display (Fonnte NOT connected)
  Products / Orders / Customers — full CRUD
  Market Validation — 3-layer event logging
  8 Supabase tables — active

YANG MISSING (v4.0 target):
  AI Scoring (ScoutScorer LangGraph)    — butuh OpenAI key
  WA Automation (Fonnte)                — butuh Fonnte token
  4 new tables: wa_logs, ai_tasks, ai_insights, order_items
  MessageComposer agent
  InsightGenerator agent
  AnomalyDetector agent
  CrewAI integration
  AI Intelligence page (/app/ai)
  Revenue growth tracking
  Unpaid invoice calculation
```

### C.2 — Credential Tracker

| Credential | Status | Lokasi | Catatan |
|-----------|--------|--------|---------|
| SUPABASE_URL | ✅ CONFIGURED | .dev.vars + CF Secrets | Active |
| SUPABASE_ANON_KEY | ✅ CONFIGURED | .dev.vars + CF Secrets | Active |
| SUPABASE_SERVICE_KEY | ✅ CONFIGURED | .dev.vars + CF Secrets | Server-only |
| JWT_SECRET | ✅ CONFIGURED | .dev.vars + CF Secrets | HS256 |
| MASTER_PIN | ✅ CONFIGURED | .dev.vars + CF Secrets | bcrypt hash |
| SCRAPER_API_KEY | ✅ CONFIGURED | .dev.vars | IG scraping |
| CLOUDFLARE_API_TOKEN | ✅ CONFIGURED | .dev.vars | Deploy |
| LANGCHAIN_API_KEY | ✅ PROVIDED | Add to .dev.vars | LangSmith tracing |
| CREWAI_PAT | ✅ PROVIDED | Add to .dev.vars | CrewAI Enterprise |
| SERPAPI_KEY | ✅ PROVIDED | Add to .dev.vars | Web search agents |
| **OPENAI_API_KEY** | 🔴 **NEEDED** | platform.openai.com | **BLOCKING semua AI** |
| **FONNTE_TOKEN** | 🔴 **NEEDED** | fonnte.com | **BLOCKING semua WA** |

### C.3 — Database Schema Target (12 Tables)

```sql
-- EXISTING 8 TABLES (live):
products         (id, name, sku, price, stock, category, created_at)
customers        (id, name, phone, email, tier, ig_handle, created_at)
orders           (id, customer_id, status, total, notes, created_at)
leads            (id, ig_username, shop_name, phone, score, label, status, notes)
outreach_campaigns (id, name, template, status, created_at)
outreach_logs    (id, lead_id, campaign_id, message, status, sent_at)
validation_events (id, brand, layer, event_type, value, notes, created_at)
validation_metrics (id, brand, layer, metric_name, value, period, created_at)

-- TODO 4 TABLES (Sprint 1):
wa_logs    (id, phone, message, status, fonnte_id, lead_id, error_message, created_at)
ai_tasks   (id, task_type, agent, status, input, output, error, duration_ms, created_at)
ai_insights (id, type, layer, title, body, action, confidence, urgency, data_basis,
             is_actioned, expires_at, created_at)
order_items (id, order_id, product_id, product_name, qty, unit_price, subtotal, created_at)
```

### C.4 — Build Sprint Map

```
SPRINT 1 (Minggu 1-2): Foundation
  T1.1 — Buat 4 tabel baru di Supabase
  T1.2 — Build Fonnte WA routes (send, broadcast, status)
  T1.3 — Test kirim WA ke nomor sendiri
  BLOCKING: FONNTE_TOKEN

SPRINT 2 (Minggu 3-4): Scout AI
  T2.1 — Install @langchain/langgraph + @langchain/openai
  T2.2 — Build ScoutScorer agent (deterministic + AI overlay)
  T2.3 — Build /api/scout/ai-score route
  BLOCKING: OPENAI_API_KEY

SPRINT 3 (Minggu 5-6): Closer AI
  T3.1 — Build MessageComposer agent
  T3.2 — Build /api/closer/ai-compose route
  T3.3 — Build sequence automation (Day 0/3/7/14)
  REQUIRES: Sprint 1 + 2 complete

SPRINT 4 (Minggu 7-8): AI Intelligence
  T4.1 — Build InsightGenerator + AnomalyDetector agents
  T4.2 — Build CrewAI client (kickoff, polling, result)
  T4.3 — Build /api/ai/* routes + AI Intelligence page
  REQUIRES: Sprint 2 + 3 complete

SPRINT 5 (Minggu 9-10): Dashboard Upgrade
  T5.1 — AI insights widget di dashboard homepage
  T5.2 — Revenue growth % calculation
  T5.3 — Unpaid invoice calculation + alert
  REQUIRES: Sprint 4 complete

SPRINT 6 (Minggu 11-12): Polish & Deploy v4.0
  T6.1 — Mobile responsive final polish
  T6.2 — Security audit (RLS, JWT, rate limits)
  T6.3 — Deploy v4.0 ke production
  REQUIRES: Sprint 5 complete
```

### C.5 — Revenue KPI Targets

```
FASE 1 (Minggu 1-12):
  Minggu 1-2:   20 leads, Rp 0.5-1.5 Jt/minggu
  Minggu 3-4:   30 leads, Rp 1.5-3 Jt/minggu
  Minggu 5-8:   50 leads, Rp 3-7 Jt/minggu
  Minggu 9-12:  50 leads, Rp 7-15 Jt/minggu
  END GOAL:     20 active resellers, ≥Rp 15 Jt/minggu

SCALE TRIGGERS:
  → Phase 2: ≥20 resellers + Rp 10Jt/week + AI automation ≥50%
  → Phase 3: ≥100 resellers + Rp 100Jt/month + uptime ≥99.9%

FASE 3 SaaS (Bulan 12-24):
  Tier 1 Starter (Rp 500K/bln × 20):  Rp 10 Jt/bln
  Tier 2 Growth (Rp 1.5Jt/bln × 10):  Rp 15 Jt/bln
  Tier 3 Enterprise (Rp 5-15Jt × 3-5): Rp 25-50 Jt/bln
  TOTAL TARGET: Rp 50-75 Jt/bulan
```

---

## 📝 PACK D: TASK-SPECIFIC PROMPT PACK
### Input ke AI Developer — Per Build Request

> *"Format ini WAJIB dipakai setiap kali minta AI Developer build sesuatu."*

### D.1 — Full Prompt Contract Template

```markdown
# TASK [NOMOR]: [NAMA TASK]
Sprint: [1-6] | Modul: [Scout/Closer/AI/Dashboard/Auth/Validation]
Estimasi: [X jam] | Blocking: [credential/dependency]

---
CONTEXT
Kamu adalah AI Developer untuk Sovereign Business Engine v4.0.
Platform: Cloudflare Pages + Hono.js TypeScript + Supabase + LangGraph.js
Semua code: TypeScript, clean error handling, consistent response format.
TIDAK ADA: public user, registrasi, auth selain PIN+JWT.

State saat ini: [apa yang sudah ada]
Repo: https://github.com/ganihypha/Sovereign.private.real.busines.orchest
Live: https://sovereign-orchestrator.pages.dev

---
TUJUAN TASK
[Satu kalimat: "Buat route POST /api/wa/send yang kirim WA via Fonnte API"]

---
FILE YANG RELEVAN
- src/routes/wa.ts → tambah/modifikasi route
- src/index.ts → register route baru
- migrations/000X_add_wa_logs.sql → kalau perlu tabel baru

---
INPUT SCHEMA
{
  phone: string,      // Format: 628xxx (tanpa +)
  message: string,    // Max 500 chars
  lead_id?: string    // Optional UUID
}

---
OUTPUT SCHEMA
// SUCCESS:
{ success: true, data: { fonnte_id, status: "sent", logged_at } }
// ERROR:
{ success: false, error: "FONNTE_DISCONNECTED|RATE_LIMITED|INVALID_PHONE", message }

---
BUSINESS RULES
- Rate limit: cek wa_logs, tidak bisa kirim ke nomor yang sama dalam 24 jam
- Log ke wa_logs setelah kirim (success maupun fail)
- Validasi format phone sebelum call Fonnte
- JWT auth wajib

---
CONSTRAINTS
- JANGAN expose FONNTE_TOKEN di response
- JANGAN kirim WA tanpa logging
- JANGAN crash kalau Fonnte down — return graceful error
- JANGAN skip JWT auth middleware

---
ACCEPTANCE TEST
curl -X POST http://localhost:3000/api/wa/send \
  -H "Authorization: Bearer [JWT]" \
  -H "Content-Type: application/json" \
  -d '{"phone":"628123456789","message":"Test","lead_id":"uuid"}'
# Expected: {"success":true,"data":{"fonnte_id":"...","status":"sent"}}

SELECT * FROM wa_logs ORDER BY created_at DESC LIMIT 1;
# Expected: row dengan phone=628123456789, status=sent

---
DONE DEFINITION
[ ] Route POST /api/wa/send bekerja end-to-end
[ ] Fonnte API dipanggil dengan benar
[ ] Log tersimpan di wa_logs
[ ] Rate limit berfungsi (cek dari DB, bukan memory)
[ ] Error handling untuk Fonnte down, invalid phone, rate limited
[ ] JWT auth middleware terpasang di route ini
```

### D.2 — Task Prompt Library (Sprint 1-6)

---
#### TASK 1.1 — Buat 4 Tabel Supabase Baru

```
TUJUAN: Tambah wa_logs, ai_tasks, ai_insights, order_items

JALANKAN DI SUPABASE SQL EDITOR:

CREATE TABLE wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','delivered')),
  fonnte_id TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL,
  agent TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  input JSONB,
  output JSONB,
  error TEXT,
  duration_ms INTEGER,
  triggered_by TEXT DEFAULT 'founder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  layer TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action TEXT NOT NULL,
  confidence DECIMAL(3,2),
  urgency TEXT CHECK (urgency IN ('HIGH','MEDIUM','LOW')),
  data_basis JSONB,
  is_actioned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wa_logs_phone ON wa_logs(phone);
CREATE INDEX idx_wa_logs_lead_id ON wa_logs(lead_id);
CREATE INDEX idx_wa_logs_created_at ON wa_logs(created_at);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_agent ON ai_tasks(agent);
CREATE INDEX idx_ai_insights_urgency ON ai_insights(urgency);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

ACCEPTANCE:
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name IN ('wa_logs','ai_tasks','ai_insights','order_items');
-- Expected: 4 rows
```

---
#### TASK 1.2 — Fonnte WA Routes

```
TUJUAN: Build POST /api/wa/send, POST /api/wa/broadcast, GET /api/wa/status
BLOCKING: FONNTE_TOKEN harus ada di .dev.vars

Fonnte API:
  Base URL: https://api.fonnte.com
  Auth header: Authorization: token FONNTE_TOKEN

  POST /send  → { target: "628xxx", message: "text" }
  GET  /device → check connection status

Business Rules:
  Rate limit: SELECT id FROM wa_logs 
              WHERE phone=$1 AND created_at > NOW() - INTERVAL '24 hours'
              → kalau ada row → return RATE_LIMITED error

  Log sebelum kirim (status='pending')
  Update log setelah kirim (status='sent' atau 'failed')

Phone validation regex: /^628\d{8,12}$/

Error codes: FONNTE_DISCONNECTED | RATE_LIMITED | INVALID_PHONE | FONNTE_ERROR
```

---
#### TASK 2.1 — Install LangGraph + Base Agent

```
TUJUAN: Setup infrastructure untuk semua LangGraph agents
BLOCKING: OPENAI_API_KEY harus ada

Install:
  npm install @langchain/langgraph @langchain/openai @langchain/core

Buat: src/agents/base-agent.ts
  - BaseAgent class
  - model: ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 })
  - Logging ke ai_tasks (start/running/completed/failed)
  - Token budget enforcement
  - Timeout wrapper (Scout: 3s, Composer: 2s, Insight: 5s)
  - Standard error format
```

---
#### TASK 2.2 — ScoutScorer Agent

```
TUJUAN: LangGraph agent yang score lead Instagram 0-100
INPUT: { lead_id, ig_username, phone? }

Scoring (deterministic base):
  followers 1K-5K:    +15pts
  followers 5K-20K:   +25pts  
  followers 20K+:     +35pts
  engagement >3%:     +20pts
  engagement 1-3%:    +10pts
  has phone in bio:   +15pts
  keywords (reseller/dropship): +10pts
  niche match (fashion): +10pts
  digital gap:        +5pts
  
  AI overlay: +/-20pts dari OpenAI analysis
  Final: clamp(base + overlay, 1, 100)
  Label: HOT ≥80 | WARM 60-79 | COOL 40-59 | COLD <40

OUTPUT JSON:
  { lead_id, score, label, reasoning, highlights[], concerns[],
    recommended_action, confidence }

Constraints:
  Latency <3 detik
  Fallback kalau OpenAI gagal → return deterministic only, confidence=0.5
  READ ONLY — tidak boleh write ke database
```

---
#### TASK 3.1 — MessageComposer Agent

```
TUJUAN: Compose pesan WA personal per lead
INPUT: { lead_id, template_type: 'day0'|'day3'|'day7'|'day14' }

Context yang di-inject:
  Lead: nama_toko, ig_username, followers, score, label
  History: jumlah WA terkirim, kapan terakhir
  Conversion stats: X reseller aktif bulan ini (dari orders)

OUTPUT JSON:
  { lead_id, phone, message, template_used,
    personalization_elements[], tone, estimated_response_probability }

Rules:
  Bahasa Indonesia casual (bukan formal)
  Menyebut nama toko yang benar (dari data, BUKAN hallucinate)
  Max 500 karakter
  Max 2 emoji
  Max 1 link
  TIDAK boleh sebut harga
  TIDAK boleh kirim WA (hanya compose)
  
Day 0 template base:
  "Halo kak [NAMA_TOKO]! 👋
   Liat IG-nya, kontennya bagus banget.
   Kami lagi buka jaringan reseller fashion — 
   udah ada [X] reseller aktif bulan ini.
   Boleh sharing info-nya kak?"
```

---
#### TASK 4.1 — InsightGenerator Agent

```
TUJUAN: Generate 3-5 actionable daily business insights
FREKUENSI: On-demand manual trigger

Data di-analisis:
  Dashboard stats (revenue, orders, leads)
  ai_insights recent (deduplicate!)
  wa_logs (delivery rate, response rate)
  leads pipeline (HOT uncontacted count)
  outreach_logs (pattern)

OUTPUT (max 5 insights):
  insights: [{
    id, type, layer, title, body, action,
    confidence, urgency, data_basis
  }]
  summary: string

Type options:
  REVENUE_ALERT | LEAD_OPPORTUNITY | OUTREACH_PATTERN | SYSTEM_HEALTH | MARKET_SIGNAL

Quality rules:
  Setiap insight WAJIB ada 1 konkret action
  Harus berdasarkan data_basis (angka nyata)
  Tidak ada generic advice
  Prioritaskan anomali dan hot leads belum dihubungi
```

---
#### TASK 4.2 — CrewAI Client

```
TUJUAN: Build client kickoff + polling untuk CrewAI crews

Crews:
  MarketValidationCrew (weekly)   → trigger manual
  LeadResearchCrew (on-demand)    → trigger per lead_id

CrewAI Enterprise API:
  POST /kickoff → { crew_name, inputs } → returns { task_id }
  GET  /status/:task_id → { status, result? }

Routes:
  POST /api/ai/crew/kickoff     → kickoff, return task_id
  GET  /api/ai/crew/status/:id  → polling
  GET  /api/ai/crew/result/:id  → get result

Polling frontend pattern:
  kickoff() 
  → setInterval(checkStatus, 5000) 
  → clearInterval + showResult()
  → timeout: 5 menit (CrewAI bisa lambat, ini wajar)
```

---
#### TASK 5.1 — AI Insights Widget di Dashboard

```
TUJUAN: Tampilkan 3 AI insights terbaru di /app/dashboard

Query:
  SELECT * FROM ai_insights
  WHERE expires_at > NOW() OR expires_at IS NULL
  ORDER BY urgency DESC, created_at DESC
  LIMIT 3

UI per card:
  - Badge urgency: HIGH=merah, MEDIUM=kuning, LOW=hijau
  - Title (bold, 1 baris)
  - Body (2 baris max, truncate dengan "...")
  - Action button "Lakukan →"
  - "Generated X jam lalu"

Empty state: "Belum ada insight. Klik tombol di halaman AI untuk generate."
Loading state: 3 skeleton cards
```

---
#### TASK 5.2 — Revenue Growth + Unpaid Invoice

```
TUJUAN: Tambah 2 metric penting ke dashboard stats

REVENUE GROWTH %:
  this_week = SUM(total) WHERE status='completed' 
              AND created_at >= DATE_TRUNC('week', NOW())
  last_week = SUM(total) WHERE status='completed'
              AND created_at >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days'
              AND created_at < DATE_TRUNC('week', NOW())
  growth = (this_week - last_week) / NULLIF(last_week, 0) * 100
  
  Display: "+15.2%" (hijau kalau positif) atau "-5.1%" (merah kalau negatif)
  Edge case: last_week = 0 → tampilkan "New" bukan Infinity

UNPAID INVOICE:
  total = SUM(total) WHERE status IN ('pending', 'processing')
  Display: "Rp X.XXX.XXX" (oranye kalau > Rp 2.000.000)
  Alert banner: muncul di atas dashboard kalau > threshold
```

---

### D.3 — Quick Task Format (untuk Task Sederhana)

```
FORMAT:
TUJUAN: [1 kalimat]
FILE: [file yang diubah]
INPUT: [schema singkat]
OUTPUT: [schema singkat]
RULES: [bullet poin]
TEST: [1 curl atau SQL]
JANGAN: [larangan terpenting]

CONTOH:
TUJUAN: Tambah filter score range di Scout page /app/scout
FILE: src/pages/scout.tsx
INPUT: query param ?score_min=80&score_max=100
OUTPUT: filtered leads sesuai range
RULES: filter tanpa page reload, URL update saat filter berubah
TEST: /app/scout?score_min=80 → hanya tampil leads dengan score ≥80
JANGAN: jangan ubah backend route, hanya frontend filtering
```

---

## 📊 HOW TO USE THIS PACK

```
SITUASI                  BUKA PACK   DOKUMEN
Mau build feature        C + D       C.4 sprint map + D.2 task prompt
Mau belajar CCA-F        A           A.2 domain map + 09-CCA-MAP.md
Ada arsitektur issue     B           B.1-B.10 rules + anti-patterns
Mau pitch ke klien       -           10, 11, 12, 13, 14
Mau onboard klien baru   -           14-OPERATIONAL-RUNBOOK.md
Kasih ke AI Developer    A+B+C       Kasih 06, 07, 15 ini
Review before deploy     B+C         B.8 DB rules + B.10 anti-patterns
Stuck / lost arah        Semua       Baca Pack C dulu (C.1 state saat ini)
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Master Intelligence Pack v1.0 — 4-pack framework, complete task prompt library Sprint 1-6, CCA-F domain map, anti-pattern list |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
