# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 3: BUILD SPEC PER MODULE
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> Build spec ini adalah "kontrak teknis" antara Founder dan developer (AI maupun manusia).
> Setiap modul harus memenuhi acceptance criteria sebelum dianggap DONE.

---

## MODULE 1: AUTH GATE (PIN + JWT + Device ID)

| Atribut | Detail |
|---------|--------|
| **Nama** | Auth Gate Module |
| **Status** | ✅ LIVE (PIN + JWT) / 🔴 TODO (Device ID) |
| **Fungsi** | Menjaga seluruh system dari akses publik |

### Dependencies
- `JWT_SECRET` env var
- `MASTER_PIN` env var  
- Supabase (untuk log attempt, opsional)

### Routes
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `/api/auth/login` | POST | None | Verify PIN → Return JWT |
| `/api/auth/verify` | GET | JWT | Verify token masih valid |

### Input/Output
```typescript
// POST /api/auth/login
Input:  { pin: "1945" }
Output: { token: "eyJ...", expiresIn: 604800 }

// GET /api/auth/verify
Input:  Header: Authorization: Bearer eyJ...
Output: { valid: true, userId: "founder" }
```

### Acceptance Criteria
- [x] PIN yang benar → JWT dikeluarkan
- [x] PIN salah → 401 error setelah max 5 attempt
- [x] JWT expired → redirect ke login
- [x] Semua `/api/*` routes protected (kecuali `/api/auth/login`)
- [ ] Device ID cookie — fingerprint browser, tolak device asing

### Edge Cases
- Jika MASTER_PIN tidak ada di env → system error 500 (jangan expose detail)
- JWT harus HS256, bukan RS256 (CF Workers tidak support file system untuk key)
- Cookie Device ID harus HttpOnly + Secure + SameSite=Strict

---

## MODULE 2: SCOUT AGENT (Lead Discovery + AI Scoring)

| Atribut | Detail |
|---------|--------|
| **Nama** | Scout Agent Module |
| **Status** | 🟡 PARTIAL — Manual entry live, AI scoring TODO |
| **Fungsi** | Temukan, enriched, dan score leads dari Instagram |

### Dependencies
- `SCRAPER_API_KEY` — untuk IG scraping
- `OPENAI_API_KEY` — untuk LangGraph.js AI scoring
- `LANGCHAIN_API_KEY` — untuk LangSmith monitoring
- Supabase table: `leads`
- LangGraph.js installed: `@langchain/langgraph`, `@langchain/openai`

### Routes
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `GET /api/scout/leads` | GET | JWT | List semua leads + filters |
| `POST /api/scout/leads` | POST | JWT | Manual tambah lead |
| `PUT /api/scout/leads/:id` | PUT | JWT | Update lead data |
| `DELETE /api/scout/leads/:id` | DELETE | JWT | Hapus lead |
| `POST /api/scout/score` | POST | JWT | Algorithm score (deterministic) |
| `POST /api/scout/gather` | POST | JWT | **[NEW]** Trigger ScraperAPI IG scraping |
| `POST /api/scout/ai-score` | POST | JWT | **[NEW]** AI score via LangGraph.js |
| `POST /api/scout/enrich` | POST | JWT | **[NEW]** AI enrich lead data |

### Input/Output
```typescript
// POST /api/scout/gather
Input:  { query: "reseller fashion jakarta", limit: 20 }
Output: { scraped: 20, leads_added: 18, duplicates: 2 }

// POST /api/scout/ai-score
Input:  { lead_id: "uuid-123" }
Output: {
  score: 87,
  label: "HOT",
  reasoning: "High follower count (8K), active posting, sells fashion, strong engagement",
  confidence: 0.85
}

// POST /api/scout/enrich
Input:  { lead_id: "uuid-123", username: "tokobaju_official" }
Output: {
  bio: "Toko baju murah kualitas premium",
  post_count: 234,
  engagement_rate: 4.2,
  avg_likes: 180,
  niche: "fashion_retail",
  has_catalog_link: true
}
```

### Scoring Algorithm (Hybrid: Deterministic Base + AI Overlay)
```
Base Score (Deterministic):
  Followers > 1.000:    +20 pts
  Followers > 5.000:    +15 pts bonus
  Followers > 10.000:   +10 pts bonus
  Digital Gap = High:   +25 pts
  Digital Gap = Medium: +15 pts
  Phone exists:         +10 pts
  Bio has keywords:     +10 pts
  Engagement > 3%:      +15 pts
  Niche relevance:      +10 pts

AI Overlay (LangGraph.js):
  Holistic judgment:    +/- 20 pts

Final Score: 0-100 (capped)
Labels: HOT (80+), WARM (60-79), COOL (40-59), COLD (<40)
```

### Acceptance Criteria
- [x] Manual lead entry works
- [x] Algorithm scoring works
- [ ] ScraperAPI gather → store 20+ leads per batch
- [ ] LangGraph.js AI score returns within 3 seconds
- [ ] AI reasoning disimpan di leads.notes
- [ ] Duplicate detection (cek username sebelum insert)
- [ ] Filter UI: All / HOT / WARM / COLD bekerja

### Edge Cases
- ScraperAPI timeout: retry 1x, jika gagal return partial results
- OpenAI rate limit: fallback ke algorithm score saja
- Private IG account: skip enrichment, score berdasarkan available data
- Score = 0 tidak boleh masuk tabel (minimum 1)

---

## MODULE 3: CLOSER AGENT (WhatsApp Outreach via Fonnte)

| Atribut | Detail |
|---------|--------|
| **Nama** | Closer Agent Module |
| **Status** | 🟡 PARTIAL — Template display live, Fonnte TODO |
| **Fungsi** | AI-compose + kirim WA otomatis + sequence Day 0/3/7/14 |

### Dependencies
- `FONNTE_TOKEN` — untuk WA send (🔴 NEEDED dari user)
- `OPENAI_API_KEY` — untuk AI compose
- Supabase tables: `outreach_campaigns`, `outreach_logs`, `wa_logs`
- LangGraph.js MessageComposer agent

### Routes
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `GET /api/closer/campaigns` | GET | JWT | List campaigns |
| `POST /api/closer/campaigns` | POST | JWT | Buat campaign baru |
| `GET /api/closer/templates` | GET | JWT | List message templates |
| `POST /api/closer/send` | POST | JWT | Kirim manual WA ke 1 lead |
| `GET /api/closer/logs` | GET | JWT | Audit trail outreach |
| `POST /api/closer/ai-compose` | POST | JWT | **[NEW]** AI compose pesan personal |
| `POST /api/closer/sequence` | POST | JWT | **[NEW]** Trigger Day X sequence |
| `POST /api/wa/send` | POST | JWT | **[NEW]** Direct Fonnte send |
| `POST /api/wa/broadcast` | POST | JWT | **[NEW]** Bulk Fonnte send |
| `GET /api/wa/status` | GET | JWT | **[NEW]** Cek Fonnte device status |

### Input/Output
```typescript
// POST /api/wa/send (Fonnte wrapper)
Input:  { phone: "081234567890", message: "Halo kak...", delay: 2 }
Output: { 
  status: "sent", 
  fonnte_response: { status: true, id: "msg-xyz" },
  logged_at: "2026-04-02T10:00:00Z"
}

// POST /api/closer/ai-compose
Input:  { lead_id: "uuid-123", template_type: "day0" }
Output: {
  composed_message: "Halo kak Siti! Saya dari FashionKas...",
  template_used: "day0",
  personalization_score: 0.92
}

// POST /api/closer/sequence
Input:  { lead_id: "uuid-123", start_day: 0 }
Output: {
  sequence_id: "seq-abc",
  scheduled: ["day0: immediate", "day3: +3 days", "day7: +7 days", "day14: +14 days"]
}
```

### WhatsApp Templates
```
Day 0 — Introduction:
"Halo kak {name}! Saya dari FashionKas.
Kami lihat {shop_name} punya potensi besar di fashion.
Mau tau cara scale bisnis fashion dengan sistem reseller otomatis?
Info lengkap: https://fashionkas.pages.dev"

Day 3 — Demo Offer:
"Hai kak {name}, ini dari FashionKas.
Kami udah siapin demo khusus buat {shop_name}.
Ada harga khusus reseller yang bisa langsung jalan."

Day 7 — Social Proof:
"Kak {name}, tau gak kalau {converted_count} toko fashion
udah gabung jadi reseller FashionKas bulan ini?
{shop_name} bisa jadi selanjutnya. Yuk ngobrol!"

Day 14 — Final / Urgency:
"Last call kak {name}!
Slot reseller bulan ini tinggal {remaining_slots}.
Kalau {shop_name} mau gabung, bisa langsung konfirmasi ke sini."
```

### Acceptance Criteria
- [ ] Fonnte single send bekerja (test ke nomor sendiri dulu)
- [ ] Fonnte broadcast ke 5+ nomor bekerja
- [ ] AI compose menghasilkan pesan personal (bukan template mentah)
- [ ] wa_logs mencatat setiap pesan yang dikirim
- [ ] Day 0 sequence trigger otomatis setelah lead di-approve
- [ ] Fonnte device status bisa dicek dari dashboard
- [ ] Rate limiting: max 1 message per phone per 24 jam

### Edge Cases
- Fonnte token expired: return error 401 + instruksi refresh
- Invalid phone format: validate +62/08 format sebelum kirim
- WA tidak aktif di nomor target: log sebagai "undelivered"
- Broadcast terlalu banyak: chunk per 10 nomor, delay 5s antar chunk

---

## MODULE 4: AI INTELLIGENCE CENTER (LangGraph.js + CrewAI)

| Atribut | Detail |
|---------|--------|
| **Nama** | AI Intelligence Center Module |
| **Status** | 🔴 TODO — Belum ada implementation |
| **Fungsi** | Edge AI insights + deep analysis crew orchestration |

### Dependencies
- `OPENAI_API_KEY` — LLM untuk semua agents
- `LANGCHAIN_API_KEY` — LangSmith monitoring
- `CREWAI_ENTERPRISE_TOKEN` — CrewAI API
- `CREWAI_PAT` — Authentication
- `SERPAPI_KEY` — Web research untuk lead enrichment
- Supabase tables: `ai_tasks`, `ai_insights`

### Sub-Modul 4a: LangGraph.js Edge Agents
```typescript
// File: src/agents/langraph-agents.ts

// 4 agents yang perlu dibangun:
export const ScoutScorerAgent      // POST /api/scout/ai-score
export const MessageComposerAgent  // POST /api/closer/ai-compose
export const InsightGeneratorAgent // GET /api/dashboard/ai-insights
export const AnomalyDetectorAgent  // Cron trigger
```

### Sub-Modul 4b: CrewAI Integration
```typescript
// File: src/agents/crewai-client.ts

// 2 functions yang perlu dibangun:
export async function kickoffCrew(crewName, inputs)  // POST ke CrewAI API
export async function getCrewStatus(taskId)           // GET status dari CrewAI
export async function getCrewResult(taskId)           // GET result dari CrewAI
```

### Routes
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `GET /api/dashboard/ai-insights` | GET | JWT | Top 5 AI insights hari ini |
| `GET /api/ai/tasks` | GET | JWT | AI task queue |
| `POST /api/ai/tasks` | POST | JWT | Create AI task |
| `GET /api/ai/tasks/:id` | GET | JWT | Task status + result |
| `GET /api/ai/insights` | GET | JWT | All stored insights |
| `POST /api/ai/crew/kickoff` | POST | JWT | Kickoff CrewAI crew |
| `GET /api/ai/crew/status/:id` | GET | JWT | CrewAI task status |

### Input/Output
```typescript
// GET /api/dashboard/ai-insights
Output: {
  insights: [
    { type: "demand", title: "Revenue trend up 15%", action: "Scale outreach to 20+ leads/day", confidence: 0.87 },
    { type: "system", title: "3 HOT leads uncontacted", action: "Send Day 0 WA immediately", confidence: 0.95 },
    { type: "trust", title: "Engagement rate declining @haidar_faras_m", action: "Post more personal content", confidence: 0.72 }
  ],
  generated_at: "2026-04-02T08:00:00Z"
}

// POST /api/ai/crew/kickoff
Input:  { crew_name: "MarketValidationCrew", inputs: { period: "7d" } }
Output: { task_id: "task-abc-123", status: "queued", estimated_time: "3-5 minutes" }
```

### Acceptance Criteria
- [ ] InsightGenerator menghasilkan 3-5 insights actionable
- [ ] ScoutScorer bekerja dalam 3 detik
- [ ] MessageComposer menghasilkan pesan yang terasa personal (tidak generik)
- [ ] CrewAI kickoff berhasil kirim task dan dapat task_id
- [ ] CrewAI polling status bekerja (pending → running → done)
- [ ] ai_insights disimpan di Supabase setelah crew selesai
- [ ] AI Intelligence Page menampilkan insights terbaru

### Edge Cases
- LangGraph.js timeout di CF Workers (>30s): early return partial result
- CrewAI service down: graceful fallback ke LangGraph.js only
- OpenAI API error: log ke ai_tasks dengan status "failed", jangan crash
- Duplicate insights: deduplicate berdasarkan title + tanggal

---

## MODULE 5: DASHBOARD COMMAND CENTER

| Atribut | Detail |
|---------|--------|
| **Nama** | Dashboard Module |
| **Status** | ✅ LIVE — Core stats. AI insights TODO |
| **Fungsi** | Real-money stats + 3-layer engine status + AI insights |

### Dependencies
- Supabase (semua tabel)
- LangGraph.js InsightGenerator (untuk ai-insights endpoint)

### Routes
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `GET /api/dashboard/stats` | GET | JWT | Revenue, orders, leads, customers counts |
| `GET /api/dashboard/activity` | GET | JWT | Recent 10 orders + leads |
| `GET /api/dashboard/ai-insights` | GET | JWT | **[NEW]** AI-generated insights |

### Input/Output
```typescript
// GET /api/dashboard/stats
Output: {
  revenue: { today: 1500000, this_month: 24500000, growth: "+15%" },
  orders: { total: 8, pending: 2, processing: 1, completed: 5 },
  leads: { total: 10, hot: 6, warm: 2, cold: 2 },
  customers: { total: 6, vip: 1, gold: 2, silver: 2, bronze: 1 },
  engine_status: {
    brand_machine: "ACTIVE",
    growth_engine: "ACTIVE",
    trust_engine: "ACTIVE"
  }
}
```

### Acceptance Criteria
- [x] Revenue total dari orders tabel (status=completed)
- [x] Orders count per status
- [x] Hot leads count
- [x] Customer count per tier
- [x] 3-layer engine status display
- [ ] AI insights di homepage dashboard (top 3 insights)
- [ ] Unpaid invoice calculation (pending + processing orders)
- [ ] Revenue growth % vs periode sebelumnya

---

## MODULE 6: MARKET VALIDATION INTELLIGENCE

| Atribut | Detail |
|---------|--------|
| **Nama** | Market Validation Module |
| **Status** | ✅ LIVE — Event logging works. AI insights TODO |
| **Fungsi** | 3-layer market validation dashboard + AI analysis |

### Dependencies
- Supabase: `validation_events`, `validation_metrics`, `ai_insights`

### Routes (Existing)
| Route | Method | Auth | Fungsi |
|-------|--------|------|--------|
| `GET /api/validation/stats` | GET | JWT | Validation dashboard stats |
| `GET /api/validation/events` | GET | JWT | List validation events |
| `POST /api/validation/events` | POST | JWT | Log new validation event |
| `GET /api/validation/metrics` | GET | JWT | Validation metrics |
| `POST /api/validation/metrics` | POST | JWT | Record new metric |
| `GET /api/validation/report` | GET | JWT | Full validation report |

### 3-Layer Validation Framework
```
Layer 1 — Demand Validation (@fashionkas.official):
  Mengukur: Product-Market Fit
  Metrik: Conversion rate form, catalog clicks, reseller signups
  AI question: "Apakah pasar mau bayar untuk otomasi ini?"

Layer 2 — System Validation (@resellerkas.official):
  Mengukur: Scalability Proof
  Metrik: Reseller retention, WA response rate, system uptime
  AI question: "Apakah sistem ini bisa scale ke 100+ reseller?"

Layer 3 — Trust Validation (@haidar_faras_m):
  Mengukur: Authority Building
  Metrik: Follower growth, engagement rate, DM conversion
  AI question: "Apakah pasar percaya pada Founder sebagai engineer?"
```

### Acceptance Criteria
- [x] Log validation events (clicks, signups, responses)
- [x] Display validation metrics per layer
- [ ] AI-powered insight per layer
- [ ] Trend chart per layer (30 hari)
- [ ] "Validation Score" overall (0-100)

---

## 📋 BUILD PRIORITY ORDER

```
Sprint 1 (Foundation — 1-2 sesi):
  ✅ Buat 4 tabel baru di Supabase: wa_logs, ai_tasks, ai_insights, order_items
  ✅ Tambah FONNTE_TOKEN ke .dev.vars + Cloudflare secrets
  ✅ Build /api/wa/send + /api/wa/broadcast (Fonnte wrapper)
  ✅ Build /api/wa/status (device check)

Sprint 2 (Scout AI — 2-3 sesi):
  ✅ Install @langchain/langgraph + @langchain/openai
  ✅ Tambah OPENAI_API_KEY ke .dev.vars
  ✅ Build ScoutScorer LangGraph agent
  ✅ Build /api/scout/gather (ScraperAPI)
  ✅ Build /api/scout/ai-score route
  ✅ Build /api/scout/enrich route
  ✅ Update Scout UI: "Gather from IG" + "AI Score" buttons

Sprint 3 (Closer AI — 2-3 sesi):
  ✅ Build MessageComposer LangGraph agent
  ✅ Build /api/closer/ai-compose route
  ✅ Build /api/closer/sequence (Day 0/3/7/14)
  ✅ Update Closer UI: AI compose + live Fonnte send

Sprint 4 (AI Intelligence Center — 2-3 sesi):
  ✅ Build InsightGenerator + AnomalyDetector agents
  ✅ Build /api/dashboard/ai-insights
  ✅ Build CrewAI client (kickoff + status + result)
  ✅ Build /api/ai/crew/* routes
  ✅ Create AI Intelligence page (/app/ai)

Sprint 5 (Dashboard Upgrade + Polish — 1-2 sesi):
  ✅ Unpaid invoice calculation
  ✅ Revenue growth vs periode sebelumnya
  ✅ AI insights di dashboard homepage
  ✅ Mobile responsive optimization
  ✅ Error boundaries + toast notifications
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Build Spec per Module v4.0 — 6 modules documented |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
