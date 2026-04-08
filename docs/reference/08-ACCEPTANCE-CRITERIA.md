# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 8: ACCEPTANCE CRITERIA & KPI TESTING MATRIX
# (Standar "DONE" untuk Setiap Modul — Tidak Ada Tawar-Menawar)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Sebuah modul belum DONE sampai semua checkbox di dokumen ini tercentang. Bukan saat AI Developer bilang selesai. Bukan saat kode ter-commit. DONE = semua test pass + KPI tercapai."*

---

## 📋 CARA BACA DOKUMEN INI

```
Setiap modul punya 3 bagian:
  1. FUNCTIONAL TESTS — test curl/manual untuk verifikasi endpoint bekerja
  2. ACCEPTANCE CRITERIA — checklist binary (pass/fail)
  3. QUALITY GATES — metrik yang harus terpenuhi sebelum advance ke sprint berikutnya

Status tracking:
  ✅ PASS  — Verified bekerja
  ❌ FAIL  — Gagal, perlu fix
  ⏳ SKIP  — Belum bisa test (missing dependency)
  🔴 BLOCKER — Gagal = tidak boleh lanjut ke sprint berikutnya
```

---

## ══════════════════════════════════════════
## MODULE 1: AUTH GATE
## ══════════════════════════════════════════

### 1A. Functional Tests

```bash
# Test 1: Login dengan PIN benar
curl -X POST https://sovereign-orchestrator.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "1945"}'

# Expected response:
# { "token": "eyJ...", "expiresIn": 604800 }
# Status: 200

# Test 2: Login dengan PIN salah
curl -X POST https://sovereign-orchestrator.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "0000"}'

# Expected response:
# { "error": "Invalid PIN", "code": "INVALID_PIN" }
# Status: 401

# Test 3: Verify token valid
TOKEN="eyJ..."  # dari Test 1
curl -X GET https://sovereign-orchestrator.pages.dev/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# { "valid": true, "userId": "founder" }
# Status: 200

# Test 4: Akses protected route tanpa token
curl -X GET https://sovereign-orchestrator.pages.dev/api/dashboard/stats

# Expected response:
# { "error": "Unauthorized", "code": "AUTH_REQUIRED" }
# Status: 401

# Test 5: Token expired (manual — set JWT expiry ke 1 detik, tunggu 2 detik)
# Expected: redirect ke login atau 401 response
```

### 1B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-01 | PIN "1945" → JWT token dikeluarkan dalam 200ms 🔴 | ⏳ |
| AC-02 | PIN salah → 401 dengan pesan "Invalid PIN" 🔴 | ⏳ |
| AC-03 | 5 kali PIN salah → akun terkunci 5 menit 🔴 | ⏳ |
| AC-04 | JWT valid selama 7 hari (604800 detik) 🔴 | ⏳ |
| AC-05 | JWT expired → response 401, bukan 500 🔴 | ⏳ |
| AC-06 | Semua `/api/*` routes (kecuali `/api/auth/login`) butuh JWT 🔴 | ⏳ |
| AC-07 | JWT tidak valid (manipulated) → 401 🔴 | ⏳ |
| AC-08 | Device ID cookie di-set saat login ✅ (P1) | ⏳ |
| AC-09 | Request dari device tidak terdaftar → 401 ✅ (P1) | ⏳ |

**🔴 = BLOCKER: Sistem tidak aman jika AC ini tidak pass**

### 1C. Quality Gates Auth

```
GATE 1 (Minimum Viable Security):
  ✅ AC-01, AC-02, AC-04, AC-05, AC-06, AC-07 harus PASS
  → Baru boleh lanjut ke Sprint 2

GATE 2 (Enhanced Security):
  ✅ AC-03, AC-08, AC-09
  → Selesaikan sebelum deployment ke production baru
```

---

## ══════════════════════════════════════════
## MODULE 2: SCOUT AGENT (Lead Discovery + AI Scoring)
## ══════════════════════════════════════════

### 2A. Functional Tests

```bash
# Test 1: Manual add lead
curl -X POST https://sovereign-orchestrator.pages.dev/api/scout/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_name": "Toko Test",
    "instagram_username": "test_toko_123",
    "followers_count": 5000,
    "platform": "instagram"
  }'

# Expected: { "id": "uuid-...", "shop_name": "Toko Test", "score": 0 }
# Status: 201

# Test 2: Algorithm score
curl -X POST https://sovereign-orchestrator.pages.dev/api/scout/score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "uuid-..."}'

# Expected: { "score": 35, "label": "WARM", "source": "algorithm" }
# Status: 200

# Test 3: AI score (butuh OPENAI_API_KEY)
curl -X POST https://sovereign-orchestrator.pages.dev/api/scout/ai-score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "uuid-..."}'

# Expected: { "score": 42, "label": "WARM", "reasoning": "...", "confidence": 0.82 }
# Timing: response dalam < 5 detik
# Status: 200

# Test 4: Gather dari IG (butuh SCRAPER_API_KEY)
curl -X POST https://sovereign-orchestrator.pages.dev/api/scout/gather \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "reseller fashion", "limit": 10}'

# Expected: { "scraped": 10, "added": 9, "duplicates": 1 }
# Timing: response dalam < 15 detik
# Status: 200

# Test 5: Duplicate detection
# Jalankan Test 4 dua kali dengan query yang sama
# Expected di request kedua: { "scraped": 10, "added": 0, "duplicates": 10 }

# Test 6: List leads dengan filter
curl -X GET "https://sovereign-orchestrator.pages.dev/api/scout/leads?label=HOT" \
  -H "Authorization: Bearer $TOKEN"

# Expected: array leads dengan label=HOT saja
# Status: 200
```

### 2B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-S01 | Manual lead entry → record tersimpan di Supabase 🔴 | ⏳ |
| AC-S02 | Algorithm scoring → score 0-100, label HOT/WARM/COOL/COLD 🔴 | ⏳ |
| AC-S03 | AI scoring returns dalam < 5 detik 🔴 | ⏳ |
| AC-S04 | AI reasoning tersimpan di leads.notes 🔴 | ⏳ |
| AC-S05 | Gather endpoint → batch scrape 10+ leads berhasil 🔴 | ⏳ |
| AC-S06 | Duplicate detection — username yang sama tidak di-insert dua kali 🔴 | ⏳ |
| AC-S07 | ScraperAPI timeout → partial results dikembalikan (bukan error 500) | ⏳ |
| AC-S08 | OpenAI failure → fallback ke algorithm score, bukan error 500 | ⏳ |
| AC-S09 | Private IG account → score berdasarkan data tersedia, tidak error | ⏳ |
| AC-S10 | Filter HOT/WARM/COOL/COLD di UI bekerja | ⏳ |
| AC-S11 | Skor tidak bisa 0 — minimum 1 jika ada data | ⏳ |

### 2C. Scout Performance KPIs

```
KPI-S1: Throughput
  Target: 50 leads di-score dalam < 5 menit
  Cara ukur: Time batch scoring 50 leads
  Pass criteria: < 300 detik total

KPI-S2: AI Score Accuracy (subjective validation)
  Target: Founder setuju dengan >= 70% AI scores
  Cara ukur: Review manual 20 sample scores
  Pass criteria: >= 14 dari 20 dianggap "makes sense"

KPI-S3: Gather Success Rate
  Target: >= 80% leads yang di-scrape berhasil di-parse
  Cara ukur: added / scraped ratio
  Pass criteria: added / scraped >= 0.8

KPI-S4: Duplicate Rate
  Target: < 5% duplicate di batch gathering
  Cara ukur: duplicates / scraped ratio
  Pass criteria: duplicates / scraped < 0.05 (setelah clean run)
```

---

## ══════════════════════════════════════════
## MODULE 3: CLOSER AGENT (WhatsApp Outreach)
## ══════════════════════════════════════════

### 3A. Functional Tests

```bash
# Test 1: Cek Fonnte device status
curl -X GET https://sovereign-orchestrator.pages.dev/api/wa/status \
  -H "Authorization: Bearer $TOKEN"

# Expected: { "connected": true, "phone_number": "628xxx", "device_name": "..." }
# Status: 200

# Test 2: Send single WA (test ke nomor sendiri dulu!)
curl -X POST https://sovereign-orchestrator.pages.dev/api/wa/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "628XXXXXXXXX", "message": "Test dari Sovereign Engine ✅"}'

# Expected: { "success": true, "message_id": "fonnte-xxx" }
# Verify: cek apakah WA benar-benar terkirim ke nomor
# Status: 200

# Test 3: Rate limit enforcement
# Jalankan Test 2 dua kali ke nomor yang sama dalam < 24 jam
# Expected di request kedua: { "success": false, "code": "RATE_LIMIT" }
# Status: 429

# Test 4: AI compose message
curl -X POST https://sovereign-orchestrator.pages.dev/api/closer/ai-compose \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "uuid-...", "template_type": "day0"}'

# Expected: { "composed_message": "Halo kak [Nama]! ...", "personalization_score": 0.85 }
# Verify: pesan mengandung nama lead yang benar
# Verify: pesan < 500 karakter

# Test 5: Broadcast (max 5 targets untuk test)
curl -X POST https://sovereign-orchestrator.pages.dev/api/wa/broadcast \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targets": [
      {"phone": "628xxx1", "message": "Test broadcast 1"},
      {"phone": "628xxx2", "message": "Test broadcast 2"}
    ]
  }'

# Expected: { "success": true, "sent": 2, "failed": 0 }
# Status: 200

# Test 6: Invalid phone format
curl -X POST https://sovereign-orchestrator.pages.dev/api/wa/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "abc123", "message": "test"}'

# Expected: { "success": false, "error": "Invalid phone format", "code": "INVALID_PHONE" }
# Status: 400
```

### 3B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-C01 | Fonnte single send berhasil — WA benar-benar terkirim 🔴 | ⏳ |
| AC-C02 | wa_logs mencatat setiap pesan yang dikirim 🔴 | ⏳ |
| AC-C03 | Rate limit: max 1 pesan per nomor per 24 jam 🔴 | ⏳ |
| AC-C04 | Invalid phone format → 400 error, tidak mencoba kirim 🔴 | ⏳ |
| AC-C05 | AI compose menghasilkan pesan yang mengandung nama lead 🔴 | ⏳ |
| AC-C06 | AI compose pesan < 500 karakter 🔴 | ⏳ |
| AC-C07 | Broadcast ke 5+ nomor berhasil (dengan chunking) | ⏳ |
| AC-C08 | Fonnte device status bisa dicek dari endpoint | ⏳ |
| AC-C09 | Day 0/3/7/14 sequence terscheduled setelah trigger | ⏳ |
| AC-C10 | 3+ unanswered messages → escalate to manual (tidak compose lagi) | ⏳ |
| AC-C11 | Fonnte token expired → error 401 dengan instruksi, bukan 500 | ⏳ |

### 3C. Closer Performance KPIs

```
KPI-C1: Send Success Rate
  Target: >= 95% pesan terkirim jika Fonnte connected
  Cara ukur: wa_logs.status='sent' / wa_logs.status='failed'
  Pass criteria: sent_count / total_count >= 0.95

KPI-C2: AI Personalization Quality
  Target: >= 80% pesan mengandung nama lead yang benar
  Cara ukur: review 10 sample composed messages
  Pass criteria: 8 dari 10 mengandung nama spesifik

KPI-C3: WA Response Rate (setelah 7 hari operational)
  Target: > 20% leads yang di-outreach reply
  Cara ukur: wa_logs.status='replied' / total sent
  Pass criteria: > 20% reply rate

KPI-C4: Rate Limit Compliance
  Target: 0 pesan duplikasi dalam 24 jam ke nomor yang sama
  Cara ukur: query wa_logs untuk nomor yang sama di hari yang sama
  Pass criteria: COUNT = 1 per phone per day
```

---

## ══════════════════════════════════════════
## MODULE 4: AI INTELLIGENCE CENTER
## ══════════════════════════════════════════

### 4A. Functional Tests

```bash
# Test 1: Generate insights
curl -X POST https://sovereign-orchestrator.pages.dev/api/ai/generate-insights \
  -H "Authorization: Bearer $TOKEN"

# Expected: { "insights_generated": 3, "task_id": "uuid-..." }
# Timing: response dalam < 10 detik
# Status: 200

# Test 2: Get insights
curl -X GET https://sovereign-orchestrator.pages.dev/api/ai/insights \
  -H "Authorization: Bearer $TOKEN"

# Expected: array of insights, each with title, body, action, confidence, urgency
# Status: 200

# Test 3: Dashboard AI insights
curl -X GET https://sovereign-orchestrator.pages.dev/api/dashboard/ai-insights \
  -H "Authorization: Bearer $TOKEN"

# Expected: top 5 insights with all fields populated
# Verify: each insight has 'action' field (not empty)
# Status: 200

# Test 4: CrewAI kickoff
curl -X POST https://sovereign-orchestrator.pages.dev/api/ai/crew/kickoff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"crew_name": "MarketValidationCrew", "inputs": {"period": "7d"}}'

# Expected: { "task_id": "crew-task-xxx", "status": "queued" }
# Status: 200

# Test 5: Poll CrewAI status
curl -X GET https://sovereign-orchestrator.pages.dev/api/ai/crew/status/crew-task-xxx \
  -H "Authorization: Bearer $TOKEN"

# Expected: { "status": "running" | "done", "result": null | {...} }
# Status: 200

# Test 6: AI task queue
curl -X GET https://sovereign-orchestrator.pages.dev/api/ai/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected: array of recent tasks with status
# Status: 200
```

### 4B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-AI01 | InsightGenerator menghasilkan 3-5 insights 🔴 | ⏳ |
| AC-AI02 | Setiap insight punya field: title, body, action 🔴 | ⏳ |
| AC-AI03 | InsightGenerator tidak duplikasi insight yang sama dalam 24 jam 🔴 | ⏳ |
| AC-AI04 | InsightGenerator selesai dalam < 10 detik 🔴 | ⏳ |
| AC-AI05 | ScoutScorer agent selesai dalam < 5 detik | ⏳ |
| AC-AI06 | MessageComposer agent selesai dalam < 3 detik | ⏳ |
| AC-AI07 | CrewAI kickoff mengembalikan task_id | ⏳ |
| AC-AI08 | CrewAI status polling bekerja (queued → running → done) | ⏳ |
| AC-AI09 | AI agent failure tidak crash entire app (graceful) 🔴 | ⏳ |
| AC-AI10 | ai_tasks table mencatat semua AI task dengan status | ⏳ |
| AC-AI11 | ai_insights tersimpan setelah generation | ⏳ |
| AC-AI12 | HOT leads > 5 uncontacted → auto immediate insight 🔴 | ⏳ |

### 4C. AI Intelligence Performance KPIs

```
KPI-AI1: Insight Actionability Rate
  Target: >= 70% insights dinilai "actionable" oleh Founder
  Cara ukur: Founder review setiap insight, mark is_actioned=true yang relevan
  Pass criteria: is_actioned_count / total_insights >= 0.70
  Review period: 7 hari setelah InsightGenerator live

KPI-AI2: Agent Latency
  Target:
    ScoutScorer: p50 < 3s, p95 < 5s
    MessageComposer: p50 < 2s, p95 < 4s
    InsightGenerator: p50 < 8s, p95 < 12s
  Cara ukur: Timestamp dari ai_tasks.started_at ke ai_tasks.completed_at
  Pass criteria: Semua p50 di bawah target

KPI-AI3: Agent Reliability
  Target: < 5% task failure rate (tidak termasuk external API outage)
  Cara ukur: ai_tasks.status='failed' / total ai_tasks
  Pass criteria: failed_rate < 0.05

KPI-AI4: CrewAI Result Quality
  Target: Weekly report berisi minimal 3 konkret recommendations
  Cara ukur: Count distinct recommendations dalam crew result JSON
  Pass criteria: recommendations.length >= 3
```

---

## ══════════════════════════════════════════
## MODULE 5: DASHBOARD COMMAND CENTER
## ══════════════════════════════════════════

### 5A. Functional Tests

```bash
# Test 1: Dashboard stats
curl -X GET https://sovereign-orchestrator.pages.dev/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

# Expected: all fields populated (not null)
# Verify fields: revenue.today, revenue.growth_pct, orders.pending,
#               leads.hot, customers.total, engine_status.*
# Status: 200

# Test 2: Revenue growth calculation
# Prerequisite: ada orders minggu ini dan minggu lalu
# Expected: revenue.growth_pct ada nilai (positif atau negatif)

# Test 3: Unpaid invoices
# Prerequisite: ada orders dengan status 'pending'
# Expected: revenue.unpaid_total > 0, revenue.unpaid_count > 0

# Test 4: Activity feed
curl -X GET https://sovereign-orchestrator.pages.dev/api/dashboard/activity \
  -H "Authorization: Bearer $TOKEN"

# Expected: { orders: [...last 10], leads: [...last 10] }
# Status: 200

# Test 5: AI insights pada dashboard
curl -X GET https://sovereign-orchestrator.pages.dev/api/dashboard/ai-insights \
  -H "Authorization: Bearer $TOKEN"

# Expected: array insights (bisa empty jika belum pernah generate)
# Status: 200 (bukan 500 saat kosong)
```

### 5B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-D01 | Revenue today dihitung dari orders.status=completed hari ini 🔴 | ✅ |
| AC-D02 | Orders count per status benar (pending/processing/completed) 🔴 | ✅ |
| AC-D03 | Hot leads count benar (score >= 80) 🔴 | ✅ |
| AC-D04 | Customer count per tier benar 🔴 | ✅ |
| AC-D05 | 3-layer engine status menampilkan ACTIVE 🔴 | ✅ |
| AC-D06 | Unpaid invoice total dihitung (pending + processing orders) | ⏳ |
| AC-D07 | Revenue growth % vs minggu lalu ada | ⏳ |
| AC-D08 | AOV (Average Order Value) ada | ⏳ |
| AC-D09 | AI insights tampil di dashboard (top 3) | ⏳ |
| AC-D10 | Dashboard load < 2 detik | ⏳ |
| AC-D11 | Dashboard tidak error saat semua tabel kosong | ⏳ |

### 5C. Dashboard KPIs

```
KPI-D1: Data Freshness
  Target: Stats tidak lebih dari 1 menit stale
  Cara ukur: Buat order baru, cek berapa lama sampai muncul di dashboard
  Pass criteria: < 60 detik

KPI-D2: Load Performance
  Target: Initial page load < 3 detik
  Cara ukur: Chrome DevTools Network tab, DOMContentLoaded
  Pass criteria: < 3000ms

KPI-D3: Accuracy
  Target: 100% angka di dashboard sama dengan Supabase SQL query
  Cara ukur: Cross-check setiap angka di dashboard dengan direct Supabase query
  Pass criteria: 0 discrepancy
```

---

## ══════════════════════════════════════════
## MODULE 6: MARKET VALIDATION INTELLIGENCE
## ══════════════════════════════════════════

### 6A. Functional Tests

```bash
# Test 1: Validation stats
curl -X GET https://sovereign-orchestrator.pages.dev/api/validation/stats \
  -H "Authorization: Bearer $TOKEN"

# Expected: stats per layer (demand, system, trust) dengan scores
# Status: 200

# Test 2: Log validation event
curl -X POST https://sovereign-orchestrator.pages.dev/api/validation/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layer": "demand",
    "event_type": "reseller_signup",
    "value": 1,
    "notes": "Test signup dari IG"
  }'

# Expected: { "id": "uuid-...", "layer": "demand", "event_type": "reseller_signup" }
# Status: 201

# Test 3: Full validation report
curl -X GET https://sovereign-orchestrator.pages.dev/api/validation/report \
  -H "Authorization: Bearer $TOKEN"

# Expected: report dengan semua 3 layers, AI insights, overall score
# Status: 200

# Test 4: Validation metrics
curl -X POST https://sovereign-orchestrator.pages.dev/api/validation/metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layer": "system",
    "metric_name": "wa_response_rate",
    "value": 35.5,
    "unit": "percent"
  }'

# Expected: record created
# Status: 201
```

### 6B. Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| AC-V01 | Log validation events untuk 3 layer bekerja 🔴 | ✅ |
| AC-V02 | Display metrics per layer di dashboard bekerja 🔴 | ✅ |
| AC-V03 | Full validation report endpoint ada | ✅ |
| AC-V04 | AI insight per layer ditambahkan ke report | ⏳ |
| AC-V05 | Validation score overall (0-100) ada di report | ⏳ |
| AC-V06 | Trend chart 30 hari per layer | ⏳ |

---

## ══════════════════════════════════════════
## SYSTEM-LEVEL ACCEPTANCE CRITERIA
## ══════════════════════════════════════════

### System Tests (End-to-End)

```bash
# E2E Test 1: Full Lead-to-Message Flow
# Step 1: Gather leads
curl -X POST .../api/scout/gather -d '{"query": "reseller fashion", "limit": 5}'
# Step 2: AI score the top lead
LEAD_ID=$(curl .../api/scout/leads | jq '.[0].id')
curl -X POST .../api/scout/ai-score -d "{\"lead_id\": \"$LEAD_ID\"}"
# Step 3: Compose WA message
curl -X POST .../api/closer/ai-compose -d "{\"lead_id\": \"$LEAD_ID\", \"template_type\": \"day0\"}"
# Step 4: Send WA (test nomor)
MSG=$(curl .../api/closer/ai-compose ... | jq '.composed_message')
curl -X POST .../api/wa/send -d "{\"phone\": \"628TESTPHONE\", \"message\": $MSG}"
# Step 5: Verify log
curl .../api/wa/status
curl .../api/dashboard/stats  # cek hot_leads berkurang

# EXPECTED: Full flow selesai tanpa error

# E2E Test 2: Full AI Intelligence Flow
# Step 1: Generate insights
curl -X POST .../api/ai/generate-insights
# Step 2: Verify insights tersimpan
curl .../api/ai/insights  # expect >= 3 insights
# Step 3: Dashboard shows insights
curl .../api/dashboard/ai-insights  # expect populated
# Step 4: Kickoff CrewAI
curl -X POST .../api/ai/crew/kickoff -d '{"crew_name": "MarketValidationCrew", "inputs": {}}'
# Step 5: Poll until done
TASK_ID=$(previous response | jq '.task_id')
curl .../api/ai/crew/status/$TASK_ID  # expect "done" after polling

# E2E Test 3: Security Test
# Step 1: Tanpa token → semua endpoint return 401
# Step 2: Token expired → 401
# Step 3: Token dari IP berbeda → tetap valid (no IP binding) ✅
# Step 4: noindex meta tag ada di HTML → Google tidak index
```

### System-Level Acceptance Criteria

| # | Kriteria | Status |
|---|---------|--------|
| SYS-01 | noindex/nofollow meta tag ada di semua pages 🔴 | ✅ |
| SYS-02 | Semua secrets di Cloudflare Secrets (tidak di git) 🔴 | ✅ |
| SYS-03 | Supabase RLS aktif — anon key tidak bisa akses data 🔴 | ✅ |
| SYS-04 | Full E2E Lead-to-Message flow bekerja 🔴 | ⏳ |
| SYS-05 | Full E2E AI Intelligence flow bekerja | ⏳ |
| SYS-06 | App tidak crash saat database kosong | ⏳ |
| SYS-07 | App tidak crash saat semua external APIs down | ⏳ |
| SYS-08 | Response time p95 < 3 detik untuk semua endpoints | ⏳ |
| SYS-09 | Cloudflare Workers memory < 128MB per request | ⏳ |
| SYS-10 | Deploy ke production tanpa downtime (zero-downtime deploy) | ⏳ |

---

## ══════════════════════════════════════════
## BUSINESS KPI SCORECARD
## (Metrics yang menentukan apakah Engine BENAR-BENAR bekerja)
## ══════════════════════════════════════════

### BIZ-01: Efisiensi Operasional

| Metrik | Baseline (Sekarang) | Target v4.0 | Target Tanggal |
|--------|---------------------|-------------|----------------|
| Waktu operasi harian | ~5 jam | < 30 menit | Bulan 3 |
| Lead discovery time | 30 menit / 10 leads | 2 menit / 50 leads | Bulan 2 |
| Outreach automation % | 0% | > 80% | Bulan 2 |
| Manual tasks per hari | ~20 tasks | < 2 tasks | Bulan 3 |

**Test:** Founder melakukan time-tracking selama 3 hari konsekutif dan mencatat semua task
**Pass:** >= 2 dari 4 metrics mencapai target

### BIZ-02: Lead Pipeline Performance

| Metrik | Baseline | Target v4.0 | Target Tanggal |
|--------|----------|-------------|----------------|
| New leads per minggu | 10-15 (manual) | 50+ (auto) | Bulan 2 |
| HOT lead rate | ~60% (manual bias) | >= 40% (AI-scored) | Bulan 2 |
| Lead-to-contact rate | ~50% | >= 80% | Bulan 2 |
| Lead-to-reseller CVR | ~10% | >= 25% | Bulan 4 |

**Test:** Track lead pipeline selama 4 minggu setelah Scout AI live
**Pass:** 3 dari 4 metrics mencapai target

### BIZ-03: WA Outreach Performance

| Metrik | Baseline | Target v4.0 | Target Tanggal |
|--------|----------|-------------|----------------|
| WA delivery rate | N/A | >= 95% | Bulan 1 |
| WA open rate | N/A | >= 60% (asumsi) | Tidak terukur |
| WA reply rate | N/A | >= 25% | Bulan 2 |
| Day 0→Convert time | N/A | <= 14 hari | Bulan 3 |

**Test:** Track wa_logs selama 30 hari setelah Fonnte live
**Pass:** WA delivery >= 95% dan reply rate >= 20%

### BIZ-04: Revenue Performance

| Metrik | Baseline (April 2026) | Target Bulan 1 | Target Bulan 3 |
|--------|----------------------|----------------|----------------|
| Reseller aktif | ~5-8 | 10-15 | 20+ |
| Revenue per minggu | ~Rp 1-2 jt | Rp 3-5 jt | Rp 10-15 jt |
| Revenue growth MoM | Unknown | +20% | +30% |
| AOV | Unknown | Rp 500K | Rp 650K |

**Test:** Dashboard revenue tracking (bukan manual rekap)
**Pass:** Revenue data real-time tersedia di dashboard

### BIZ-05: AI Quality

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| AI score accuracy | >= 70% Founder approval | Review 20 sample scores |
| Insight actionability | >= 70% insights diact | is_actioned rate |
| Message personalization | >= 80% nama lead benar | Review 10 sample messages |
| CrewAI report quality | >= 3 concrete actions | Count recommendations |

---

## ══════════════════════════════════════════
## SPRINT GATE SUMMARY
## (Tidak boleh lanjut ke sprint berikutnya sebelum gate pass)
## ══════════════════════════════════════════

```
GATE S1 → Sprint 2 (Scout AI boleh mulai):
  ✅ Auth: AC-01 sampai AC-07 PASS
  ✅ wa_logs tabel ada di Supabase
  ✅ /api/wa/send bekerja (test ke nomor sendiri)
  ✅ FONNTE_TOKEN ada di .dev.vars

GATE S2 → Sprint 3 (Closer AI boleh mulai):
  ✅ ScoutScorer agent berjalan dalam < 5 detik
  ✅ /api/scout/ai-score PASS
  ✅ /api/scout/gather PASS (minimal 5 leads dari scrape)
  ✅ OPENAI_API_KEY ada di .dev.vars

GATE S3 → Sprint 4 (AI Intelligence boleh mulai):
  ✅ MessageComposer compose pesan personal (nama lead benar)
  ✅ /api/closer/ai-compose PASS
  ✅ /api/wa/send + /api/closer/sequence PASS
  ✅ wa_logs mencatat semua sends

GATE S4 → Sprint 5 (Dashboard upgrade boleh mulai):
  ✅ InsightGenerator menghasilkan >= 3 insights
  ✅ CrewAI kickoff mengembalikan task_id
  ✅ ai_insights table populated setelah generation
  ✅ AI Intelligence page bisa di-load

GATE S5 → Production Deploy:
  ✅ Full E2E Lead-to-Message flow bekerja
  ✅ Revenue dashboard real-time
  ✅ AI insights tampil di dashboard
  ✅ Mobile responsive di iPhone SE (375px)
  ✅ Security: semua SYS-01 sampai SYS-05 PASS
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Acceptance Criteria v1.0 — 6 modules + business KPIs + sprint gates |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
