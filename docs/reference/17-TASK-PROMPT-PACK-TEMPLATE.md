# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 17: TASK PROMPT PACK — TEMPLATE SIAP PAKAI PER BUILD SESSION
# (Copy-Paste Template untuk Setiap Request ke AI Developer)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Konsistensi input = konsistensi output. Setiap sesi AI Developer harus dimulai dengan template ini."*

---

## 🎯 CARA PAKAI DOKUMEN INI

```
LANGKAH PENGGUNAAN:
  1. Pilih template yang sesuai (Full / Module / Quick)
  2. Isi bagian dalam [KURUNG KOTAK]
  3. Hapus bagian yang tidak relevan
  4. Paste ke AI Developer sebagai pesan pertama
  5. Setelah selesai, cek DONE DEFINITION
  6. Simpan hasil ke folder /sovereign-docs/task-logs/ (opsional)
```

---

## 📝 TEMPLATE 1: FULL BUILD TASK (Sprint Task Baru)

Gunakan untuk: Task baru yang belum pernah dikerjakan, fitur baru, atau modul baru.

```
═══════════════════════════════════════════════════════════════════
TASK [NOMOR]: [NAMA TASK SINGKAT]
Sprint: [1-6] | Estimasi: [X jam] | Status: [TODO]
═══════════════════════════════════════════════════════════════════

KONTEKS SISTEM
Kamu adalah AI Developer untuk Sovereign Business Engine v4.0.

Platform Stack:
- Backend: Cloudflare Pages + Hono.js (TypeScript)
- Database: Supabase (PostgreSQL + RLS)
- AI Agents: LangGraph.js + OpenAI GPT-4o-mini
- WA Automation: Fonnte API
- Deep Analysis: CrewAI Enterprise
- Auth: PIN + JWT HS256 (7-day)

TIDAK ADA: public user, registrasi, social login, atau auth selain PIN+JWT.
SEMUA endpoint di-protect JWT kecuali POST /api/auth/login.

State sistem saat ini:
[DESKRIPSIKAN APA YANG SUDAH ADA - copy dari C.1 di doc 15]

Repo: https://github.com/ganihypha/Sovereign.private.real.busines.orchest
Live: https://sovereign-orchestrator.pages.dev
DB:   https://lfohzibcsafqthupcvdg.supabase.co

───────────────────────────────────────────────────────────────────
TUJUAN TASK
[SATU KALIMAT yang jelas dan spesifik]
Contoh: "Build route POST /api/wa/send yang kirim WA single via Fonnte API
         dengan rate limiting 24h dan logging ke tabel wa_logs"

───────────────────────────────────────────────────────────────────
BLOCKING (pastikan ini ada sebelum mulai)
- [ ] [credential/dependency 1]
- [ ] [credential/dependency 2]

───────────────────────────────────────────────────────────────────
FILE YANG RELEVAN
Buat baru:
- [path/file.ts] → [deskripsi]

Modifikasi:
- [path/file.ts] → [apa yang diubah]

───────────────────────────────────────────────────────────────────
SPESIFIKASI INPUT
[Endpoint/function yang dibuat]

Request schema (TypeScript):
interface [NamaRequest] {
  [field]: [type],  // [keterangan]
  [field]?: [type]  // optional
}

Validasi wajib:
- [validasi 1]
- [validasi 2]

───────────────────────────────────────────────────────────────────
SPESIFIKASI OUTPUT

// Response sukses:
{
  success: true,
  data: {
    [field]: [type],
    [field]: [type]
  },
  meta: { timestamp: string }
}

// Response error:
{
  success: false,
  error: "[ERROR_CODE]",
  message: "[human readable message]"
}

Error codes yang mungkin:
- [ERROR_CODE_1]: [kapan terjadi]
- [ERROR_CODE_2]: [kapan terjadi]

───────────────────────────────────────────────────────────────────
BUSINESS RULES
1. [Rule bisnis 1 — kapan allowed, kapan blocked]
2. [Rule bisnis 2]
3. [Rate limiting / quota jika ada]

───────────────────────────────────────────────────────────────────
CONSTRAINTS (JANGAN LAKUKAN INI)
- JANGAN [larangan 1]
- JANGAN [larangan 2]
- JANGAN skip JWT auth middleware
- JANGAN hardcode credential di kode
- JANGAN return blank/null kalau error — selalu return error message

───────────────────────────────────────────────────────────────────
ACCEPTANCE TEST

Test 1: [Nama test - happy path]
curl -X [METHOD] http://localhost:3000/[endpoint] \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '[JSON_BODY]'
Expected: [response yang diharapkan]

Test 2: [Nama test - edge case]
[command]
Expected: [response yang diharapkan]

Test 3: [Nama test - error case]
[command]
Expected: [error response]

Database verification:
SELECT [columns] FROM [table] WHERE [kondisi];
Expected: [hasil yang diharapkan]

───────────────────────────────────────────────────────────────────
DONE DEFINITION (checklist)
- [ ] [Fitur utama berjalan]
- [ ] [Error handling implemented]
- [ ] [Logging/audit trail ada]
- [ ] [JWT auth terpasang]
- [ ] [Input validation bekerja]
- [ ] [Acceptance test 1 pass]
- [ ] [Acceptance test 2 pass]
- [ ] [Acceptance test 3 pass]
═══════════════════════════════════════════════════════════════════
```

---

## 📝 TEMPLATE 2: MODULE FIX / IMPROVEMENT (Bug atau Enhancement)

Gunakan untuk: Perbaikan bug, improvement fitur yang sudah ada, atau UI update.

```
═══════════════════════════════════════════════════════════════════
FIX/IMPROVE: [NAMA ISSUE SINGKAT]
Type: [BUG / IMPROVEMENT / UI_UPDATE]
Modul: [Scout / Closer / Dashboard / Auth / AI / Validation]
═══════════════════════════════════════════════════════════════════

KONTEKS SINGKAT
Kamu sedang bekerja di Sovereign Business Engine v4.0.
Platform: Cloudflare Pages + Hono.js TypeScript + Supabase

ISSUE YANG PERLU DIPERBAIKI:
[Deskripsi masalah yang jelas]
[Kalau bug: "Ketika X dilakukan, Y terjadi. Seharusnya Z."]
[Kalau improvement: "Saat ini X. Kita ingin Y."]

FILE YANG PERLU DIUBAH:
- [path/file] → [apa yang diubah]

BEHAVIOR YANG DIINGINKAN:
[Deskripsi singkat apa yang harus terjadi setelah fix]

ACCEPTANCE:
[1-2 cara verify bahwa fix berhasil]

CONSTRAINTS:
- JANGAN ubah behavior fitur lain
- JANGAN hapus data yang sudah ada
- [constraint spesifik lainnya]

DONE WHEN:
- [ ] [kondisi 1 terpenuhi]
- [ ] [kondisi 2 terpenuhi]
═══════════════════════════════════════════════════════════════════
```

---

## 📝 TEMPLATE 3: DATABASE TASK (Schema / Migration)

Gunakan untuk: Buat tabel baru, alter schema, add index, update RLS policy.

```
═══════════════════════════════════════════════════════════════════
DB TASK: [NAMA TASK]
Target: [Supabase SQL Editor / Migration file]
═══════════════════════════════════════════════════════════════════

KONTEKS DB
Database: Supabase PostgreSQL
Instance: https://lfohzibcsafqthupcvdg.supabase.co
Tables sudah ada: products, customers, orders, leads, outreach_campaigns,
                  outreach_logs, validation_events, validation_metrics

YANG PERLU DIBUAT/DIUBAH:
[Deskripsi perubahan schema]

SQL YANG AKAN DIJALANKAN:
[SQL lengkap dengan CREATE TABLE / ALTER TABLE / CREATE INDEX / etc.]

WAJIB ADA DI SEMUA TABEL BARU:
- id UUID DEFAULT gen_random_uuid() PRIMARY KEY
- created_at TIMESTAMPTZ DEFAULT NOW()
- ALTER TABLE x ENABLE ROW LEVEL SECURITY

FOREIGN KEY RULES:
- Ke leads: ON DELETE SET NULL (leads bisa dihapus tanpa cascade)
- Ke orders: ON DELETE CASCADE (kalau order dihapus, items ikut)
- Ke products: ON DELETE SET NULL (produk bisa dihapus, order history tetap)

ACCEPTANCE:
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name='[nama_tabel]';
-- Expected: 1 row
═══════════════════════════════════════════════════════════════════
```

---

## 📝 TEMPLATE 4: AI AGENT TASK (LangGraph / CrewAI)

Gunakan untuk: Build atau modifikasi AI agent.

```
═══════════════════════════════════════════════════════════════════
AGENT TASK: [NAMA AGENT] — [BUILD / MODIFY / DEBUG]
Framework: [LangGraph.js / CrewAI]
Runtime: [Cloudflare Worker (async+polling) / External FastAPI]
═══════════════════════════════════════════════════════════════════

KONTEKS AGENT
Platform: Cloudflare Workers punya CPU limit 10ms.
LangGraph agent TIDAK BOLEH dijalankan synchronous di Worker.
Pattern wajib: trigger → return task_id → polling → show result

Agent yang sudah ada:
[list agents yang sudah diimplementasikan]

AGENT YANG AKAN DIBUAT/DIMODIFIKASI:
Nama: [AgentName]
Tujuan: [1 kalimat]
Latency target: [X detik]

INPUT SCHEMA:
{
  [field]: [type],  // [keterangan]
}

OUTPUT SCHEMA (JSON WAJIB):
{
  [field]: [type],
  [field]: [type],
}

ALLOWED TOOLS:
- [tool_name]: [bisa akses apa]
- [tool_name]: [bisa akses apa]

FORBIDDEN TOOLS:
- [tool_name]: alasan mengapa diblok

PROMPT SYSTEM:
Role: [deskripsi role agent]
Instruksi utama:
1. [instruksi 1]
2. [instruksi 2]

DO'S:
- [hal yang harus dilakukan]

DON'TS:
- [hal yang tidak boleh dilakukan]

FALLBACK (kalau OpenAI gagal):
[Apa yang dikembalikan kalau AI tidak available]

LOGGING:
- INSERT ke ai_tasks BEFORE start { agent, input, status: 'running' }
- UPDATE ai_tasks AFTER done { output, duration_ms, status: 'completed' }
- UPDATE ai_tasks ON error { error, status: 'failed' }

ACCEPTANCE:
[Cara test bahwa agent berjalan dengan benar]
- Output format valid (JSON schema match)
- Latency < [X] detik
- Fallback behavior benar kalau OpenAI down
═══════════════════════════════════════════════════════════════════
```

---

## 📝 TEMPLATE 5: UI COMPONENT TASK (Frontend)

Gunakan untuk: Buat halaman baru, update tampilan, atau tambah component.

```
═══════════════════════════════════════════════════════════════════
UI TASK: [NAMA HALAMAN/COMPONENT]
Halaman: [/app/[route]]
Tipe: [Halaman Baru / Update Existing / New Component]
═══════════════════════════════════════════════════════════════════

KONTEKS UI
Frontend: HTML + Tailwind CSS + Vanilla JS (CDN)
TIDAK ADA: React/Vue/Angular — semua pure HTML di Hono template
Backend APIs tersedia: [list API yang akan dipanggil]

YANG AKAN DIBUAT:
[Deskripsi halaman/component dengan layout sederhana]

WIREFRAME (text):
┌─────────────────────────────────┐
│ [HEADER]                        │
├─────────────────────────────────┤
│ [SECTION 1: nama, konten]       │
│                                 │
│ [SECTION 2: nama, konten]       │
└─────────────────────────────────┘

DATA SOURCE:
- [API endpoint] → [data yang ditampilkan]

INTERACTION:
- [User action] → [apa yang terjadi]
- [User action] → [API yang dipanggil]

STATES:
- Loading: [tampilan saat data dimuat]
- Empty: [tampilan saat tidak ada data]
- Error: [tampilan saat API error]
- Success: [tampilan normal]

RESPONSIVE:
- Mobile (375px): [layout mobile]
- Desktop (1024px+): [layout desktop]

CONSTRAINTS:
- JANGAN pakai framework JS (React/Vue/etc)
- JANGAN fetch data lebih dari sekali (cache di variable)
- HARUS ada loading state (jangan blank kalau data belum ada)
- HARUS ada error handling (jangan crash kalau API gagal)

ACCEPTANCE:
- [ ] Halaman muncul setelah login
- [ ] Data dari API ditampilkan dengan benar
- [ ] Loading state tampil saat fetch
- [ ] Mobile responsive (tidak ada horizontal scroll di 375px)
═══════════════════════════════════════════════════════════════════
```

---

## 📝 TEMPLATE 6: CONTEXT BRIEFING (Sesi Baru)

Gunakan untuk: Memulai sesi AI Developer baru (setelah break/lanjut besok).

```
═══════════════════════════════════════════════════════════════════
CONTEXT BRIEFING — SESI LANJUTAN
Tanggal: [TANGGAL HARI INI]
Sprint: [Sprint X — Nama Sprint]
═══════════════════════════════════════════════════════════════════

PROJECT OVERVIEW
Sovereign Business Engine v4.0 — Private AI-orchestrated sales ops system
Founder: Haidar Faras Maulia | PT WASKITA CAKRAWARTI DIGITAL

Tech stack: Cloudflare Pages + Hono.js + Supabase + LangGraph.js + Fonnte

STATUS TERAKHIR (dari sesi sebelumnya):
✅ Sudah selesai:
  - [task yang sudah done]

🔄 Sedang dikerjakan:
  - [task yang in-progress]

❌ Belum dimulai:
  - [task yang pending]

CREDENTIALS TERSEDIA:
  ✅ [credential 1]
  ✅ [credential 2]
  🔴 [credential yang masih kurang]

SESI INI KITA AKAN:
  1. [Objective 1]
  2. [Objective 2]

MULAI DARI:
[Task pertama yang akan dikerjakan — bisa paste TASK template di bawah ini]
═══════════════════════════════════════════════════════════════════
```

---

## 📦 TEMPLATE LENGKAP PER SPRINT (Copy-Paste Langsung)

### Sprint 1 — Foundation (Copy ini untuk Task 1.1)

```
═══════════════════════════════════════════════════════════════════
TASK 1.1: BUAT 4 TABEL SUPABASE BARU
Sprint: 1 | Estimasi: 30 menit | Status: TODO
═══════════════════════════════════════════════════════════════════

KONTEKS
Kamu adalah AI Developer untuk Sovereign Business Engine v4.0.
Supabase instance: https://lfohzibcsafqthupcvdg.supabase.co
Tabel yang sudah ada (8): products, customers, orders, leads,
outreach_campaigns, outreach_logs, validation_events, validation_metrics

TUJUAN
Tambahkan 4 tabel baru: wa_logs, ai_tasks, ai_insights, order_items

JALANKAN SQL INI DI SUPABASE SQL EDITOR:

CREATE TABLE wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending','sent','failed','delivered')),
  fonnte_id TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL,
  agent TEXT NOT NULL,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending','running','completed','failed')),
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
CREATE INDEX idx_wa_logs_created_at ON wa_logs(created_at);
CREATE INDEX idx_wa_logs_lead_id ON wa_logs(lead_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_agent ON ai_tasks(agent);
CREATE INDEX idx_ai_insights_urgency ON ai_insights(urgency);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

ACCEPTANCE TEST:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('wa_logs','ai_tasks','ai_insights','order_items')
ORDER BY table_name;
-- Expected: 4 rows

DONE WHEN:
- [ ] 4 tabel muncul di Supabase Table Editor
- [ ] SQL acceptance test return 4 rows
- [ ] RLS enabled di semua 4 tabel
═══════════════════════════════════════════════════════════════════
```

### Sprint 1 — Foundation (Copy ini untuk Task 1.2)

```
═══════════════════════════════════════════════════════════════════
TASK 1.2: FONNTE WA ROUTES
Sprint: 1 | Estimasi: 2 jam | Status: TODO
BLOCKING: FONNTE_TOKEN harus ada di .dev.vars
═══════════════════════════════════════════════════════════════════

KONTEKS
Platform: Cloudflare Pages + Hono.js TypeScript
Auth: JWT middleware sudah ada di semua routes
Tabel wa_logs sudah dibuat (Task 1.1)

FONNTE API REFERENCE:
  Base URL: https://api.fonnte.com
  Auth: header Authorization: token YOUR_TOKEN

  Send single WA:
  POST https://api.fonnte.com/send
  Body: { target: "628xxx", message: "text" }
  Response success: { status: true, id: "fonnte_id" }
  Response error:   { status: false, message: "error message" }

  Check device status:
  GET https://api.fonnte.com/device
  Headers: { Authorization: "token TOKEN" }

TUJUAN
Build 3 routes: POST /api/wa/send, POST /api/wa/broadcast, GET /api/wa/status

SPEC ROUTE 1: POST /api/wa/send
Input:  { phone: string, message: string, lead_id?: string }
Output success: { success: true, data: { fonnte_id, status: "sent", logged_at } }
Output error:   { success: false, error: "RATE_LIMITED|INVALID_PHONE|FONNTE_ERROR", message }

Business rules:
- Phone validation: must match /^628\d{8,12}$/
- Rate limit: SELECT FROM wa_logs WHERE phone=$1 AND created_at > NOW()-INTERVAL '24h'
  → kalau ada row → return RATE_LIMITED
- Log BEFORE send: INSERT wa_logs { phone, message, status:'pending', lead_id }
- Update log AFTER: UPDATE wa_logs SET status='sent', fonnte_id=? WHERE id=?
- Update log ON error: UPDATE wa_logs SET status='failed', error_message=?

SPEC ROUTE 2: POST /api/wa/broadcast
Input:  { phones: string[], message: string, campaign_id?: string }
Output: { success: true, data: { sent: number, failed: number, results: [...] } }
Rules:  Max 50 nomor per broadcast
        Rate limit check PER nomor
        Delay 1 detik antar kirim (Fonnte recommendation)

SPEC ROUTE 3: GET /api/wa/status
Output: { success: true, data: { connected: boolean, device_name: string, status: string } }
No rate limiting needed.

CONSTRAINTS:
- JANGAN expose FONNTE_TOKEN di response apapun
- JANGAN skip JWT auth di semua 3 routes
- JANGAN crash kalau Fonnte down — return graceful error

ACCEPTANCE TEST:
# 1. Test kirim WA (akan benar-benar kirim — pakai nomor sendiri dulu)
curl -X POST http://localhost:3000/api/wa/send \
  -H "Authorization: Bearer [JWT]" \
  -H "Content-Type: application/json" \
  -d '{"phone":"628[NOMOR_SENDIRI]","message":"Test dari Sovereign Engine"}'
# Expected: {"success":true,"data":{"fonnte_id":"...","status":"sent"}}

# 2. Test rate limit (kirim 2x ke nomor yang sama)
# Kirim lagi ke nomor yang sama
# Expected: {"success":false,"error":"RATE_LIMITED"}

# 3. Test invalid phone
curl -X POST http://localhost:3000/api/wa/send \
  -H "Authorization: Bearer [JWT]" \
  -H "Content-Type: application/json" \
  -d '{"phone":"08123","message":"test"}'
# Expected: {"success":false,"error":"INVALID_PHONE"}

# 4. Test device status
curl http://localhost:3000/api/wa/status \
  -H "Authorization: Bearer [JWT]"
# Expected: {"success":true,"data":{"connected":true,...}}

# 5. DB verification
SELECT phone, status, fonnte_id FROM wa_logs ORDER BY created_at DESC LIMIT 3;
-- Expected: rows dengan status 'sent' dan 'failed' sesuai test

DONE WHEN:
- [ ] POST /api/wa/send kirim WA dan WA benar-benar diterima
- [ ] Rate limit bekerja (cek dari DB, bukan memory)
- [ ] Phone validation menolak format salah
- [ ] wa_logs terisi setelah setiap send (success dan failed)
- [ ] GET /api/wa/status return koneksi Fonnte
- [ ] POST /api/wa/broadcast kirim ke multiple phones
- [ ] Error handling: Fonnte down → graceful error, bukan crash
═══════════════════════════════════════════════════════════════════
```

### Sprint 2 — Scout AI (Copy ini untuk Task 2.2)

```
═══════════════════════════════════════════════════════════════════
TASK 2.2: SCOUTSCORER AGENT
Sprint: 2 | Estimasi: 3 jam | Status: TODO
BLOCKING: OPENAI_API_KEY + @langchain/langgraph installed (Task 2.1)
═══════════════════════════════════════════════════════════════════

KONTEKS
Platform: Cloudflare Pages + Hono.js TypeScript
PENTING: LangGraph agent tidak bisa run synchronous di Cloudflare Worker!
Pattern: POST /api/scout/ai-score → INSERT ai_tasks → return task_id
         GET /api/ai/tasks/:id → polling → return result ketika done

TUJUAN
Build ScoutScorer LangGraph agent yang score lead Instagram 0-100

SCORING ALGORITHM:
Deterministic base score (0-80 max):
  followers 1K-5K:      +15
  followers 5K-20K:     +25
  followers 20K+:       +35
  engagement rate >3%:  +20
  engagement rate 1-3%: +10
  phone in bio:         +15
  keywords (reseller/dropship/jual/agen): +10
  niche fashion:        +10
  digital gap (no WA link but has phone): +5
  
AI overlay (OpenAI): +/-20 dari analisis bio + 3 caption terbaru
Final score: clamp(base + ai_overlay, 1, 100)
Label: HOT=80-100 | WARM=60-79 | COOL=40-59 | COLD=1-39

INPUT ke agent:
{
  lead_id: string,
  ig_username: string,
  phone?: string,
  bio?: string,
  followers_count?: number,
  engagement_rate?: number,
  recent_captions?: string[]
}

OUTPUT JSON dari agent (WAJIB format ini):
{
  lead_id: string,
  score: number,          // 1-100
  label: "HOT"|"WARM"|"COOL"|"COLD",
  reasoning: string,      // 1-2 kalimat kenapa skor ini
  highlights: string[],   // max 3 positive signals
  concerns: string[],     // max 3 negative signals atau missing data
  recommended_action: string,
  confidence: number      // 0.0-1.0
}

ROUTE YANG DIBUTUHKAN:
POST /api/scout/ai-score
  Body: { lead_id: string }
  Action: 
    1. Ambil lead data dari Supabase
    2. INSERT ai_tasks { agent: 'ScoutScorer', status: 'running', input }
    3. Trigger agent (background, non-blocking)
    4. Return { success: true, data: { task_id } }

GET /api/ai/tasks/:task_id (polling endpoint)
  Return: { success: true, data: { status, output?, error? } }

FALLBACK kalau OpenAI gagal:
  Return deterministic score only (no AI overlay)
  Set confidence: 0.5
  Tambahkan flag: { ai_available: false }

CONSTRAINTS:
- Latency target: <3 detik untuk deterministic, <10 detik dengan AI
- READ ONLY — ScoutScorer TIDAK BOLEH write ke leads table
- Output HARUS di-validate JSON schema sebelum disimpan
- Log semua ke ai_tasks (start, done, failed)

ACCEPTANCE:
# 1. Trigger AI score
curl -X POST http://localhost:3000/api/scout/ai-score \
  -H "Authorization: Bearer [JWT]" \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"[UUID_LEAD_YANG_ADA]"}'
# Expected: {"success":true,"data":{"task_id":"uuid"}}

# 2. Poll untuk result
curl http://localhost:3000/api/ai/tasks/[TASK_ID] \
  -H "Authorization: Bearer [JWT]"
# Expected setelah beberapa detik: 
# {"success":true,"data":{"status":"completed","output":{"score":87,"label":"HOT",...}}}

# 3. Verify di database
SELECT agent, status, output->>'score' as score FROM ai_tasks 
WHERE agent='ScoutScorer' ORDER BY created_at DESC LIMIT 1;
-- Expected: status=completed, score=angka 1-100

DONE WHEN:
- [ ] ScoutScorer agent menghasilkan score 1-100
- [ ] Label HOT/WARM/COOL/COLD sesuai threshold
- [ ] Output JSON valid sesuai schema
- [ ] ai_tasks ter-log dengan benar
- [ ] Polling endpoint bekerja
- [ ] Fallback berjalan kalau OpenAI down
═══════════════════════════════════════════════════════════════════
```

---

## 🔖 MINI TEMPLATE (Quick Reference 1-Page)

```
NAMA TASK:
SPRINT: [1-6]
TUJUAN: [1 kalimat]
FILE: [file yang dibuat/diubah]
BLOCKING: [credential/dependency]

INPUT:  { [field]: type }
OUTPUT: { success: bool, data: {...} | error: "CODE" }

RULES:
  - [rule 1]
  - [rule 2]

JANGAN:
  - JANGAN [larangan 1]
  - JANGAN skip JWT auth

TEST:
  curl -X [METHOD] http://localhost:3000/[endpoint] \
    -H "Authorization: Bearer [JWT]" \
    -d '[JSON]'
  Expected: [response]

DONE WHEN:
  [ ] [kondisi 1]
  [ ] [kondisi 2]
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Task Prompt Pack Template v1.0 — 6 templates, Sprint 1-2 pre-filled, mini template |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
