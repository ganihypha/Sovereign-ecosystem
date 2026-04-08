# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 2: SYSTEM ARCHITECTURE BRIEF
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

## 1. GAMBARAN SISTEM (Big Picture)

```
╔══════════════════════════════════════════════════════════════════════╗
║              SOVEREIGN BUSINESS ENGINE v4.0                         ║
║              ================================                        ║
║                                                                      ║
║  [FOUNDER: Haidar Faras]                                             ║
║         │                                                            ║
║         ▼                                                            ║
║  [AUTH GATE]                                                         ║
║  PIN 4-digit → JWT 7-day → Device ID Lock                            ║
║         │                                                            ║
║         ▼                                                            ║
║  [CLOUDFLARE PAGES — sovereign-orchestrator.pages.dev]               ║
║  (Terminal-Chic Glassmorphism UI)                                    ║
║         │                                                            ║
║         ▼                                                            ║
║  [HONO.JS API GATEWAY — Cloudflare Workers Edge]                     ║
║         │                                                            ║
║   ┌──────┴──────┬──────────────┬─────────────────┐                  ║
║   │             │              │                  │                  ║
║   ▼             ▼              ▼                  ▼                  ║
║ [LangGraph.js] [Supabase]  [CrewAI Service]  [External APIs]        ║
║ (Edge AI)      (PostgreSQL) (External FastAPI) (Fonnte, ScraperAPI)  ║
║   │                              │              │                    ║
║   └──────────────────────────────┴──────────────┘                   ║
║                        │                                             ║
║               [3-LAYER MARKET LAB]                                   ║
║         @fashionkas | @resellerkas | @haidar_faras_m                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 2. KOMPONEN SISTEM (Components)

### 2.1 Layer 1: Frontend (UI)
| Komponen | Teknologi | Input | Output |
|---------|-----------|-------|--------|
| Landing Page | HTML + Hono SSR | Visitor request | 3-layer brand display |
| Auth Gate | PIN form + JS | PIN 4-digit | JWT token |
| Command Dashboard | Glassmorphism UI | JWT + API data | Revenue/leads/orders stats |
| Scout Agent Page | Table + modal | Lead data | Scored lead list |
| Closer Agent Page | Compose + log | Phone + template | WA message sent |
| AI Intelligence Page | Cards + queue | API polling | AI insights display |
| Validation Dashboard | 3-layer metrics | Validation events | Market validation data |
| Reports Page | Charts + tables | DB queries | Revenue/conversion reports |

### 2.2 Layer 2: API Gateway (Hono.js)
| Komponen | Runtime | Input | Output |
|---------|---------|-------|--------|
| `/api/auth/*` | Cloudflare Workers | PIN / JWT | Token / Verification |
| `/api/scout/*` | Cloudflare Workers | Lead data / IG query | Leads + AI scores |
| `/api/closer/*` | Cloudflare Workers | Phone + template | WA sent confirmation |
| `/api/wa/*` | Cloudflare Workers | Phone + message | Fonnte API response |
| `/api/dashboard/*` | Cloudflare Workers | JWT | Stats + AI insights |
| `/api/ai/*` | Cloudflare Workers | Task request | AI task queue + results |
| `/api/validation/*` | Cloudflare Workers | Events + metrics | Validation data |

### 2.3 Layer 3: AI Intelligence (LangGraph.js)
| Agent | Trigger | Input | Output | Latency |
|-------|---------|-------|--------|---------|
| **ScoutScorer** | POST `/api/scout/ai-score` | Lead data JSON | Score (0-100) + reasoning | <3s |
| **MessageComposer** | POST `/api/closer/ai-compose` | Lead profile + template | Personalized WA message | <2s |
| **InsightGenerator** | GET `/api/dashboard/ai-insights` | Dashboard metrics | 3-5 actionable insights | <5s |
| **AnomalyDetector** | Cron (hourly) | Recent metrics | Anomaly alerts | <5s |

### 2.4 Layer 4: Deep Analysis (CrewAI)
| Crew | Agents | Schedule | Input | Output |
|------|--------|----------|-------|--------|
| **MarketValidationCrew** | MarketAnalyst, DataScientist, StrategyAdvisor | Daily | 3-layer validation data | Insights JSON |
| **LeadResearchCrew** | IGScraper, ProfileAnalyzer, ScoreComputer | On-demand | Lead username/URL | Deep lead profile |
| **RevenueAnalysisCrew** | FinanceAnalyst, ForecastAgent | Weekly | Orders + revenue data | Revenue forecast |
| **ContentStrategyCrew** | ContentPlanner, CaptionWriter | Weekly | Brand performance data | Content plan |

### 2.5 Layer 5: Data (Supabase)
| Tabel | Status | Fungsi |
|-------|--------|--------|
| `products` | ✅ LIVE | 8 SKU inventory |
| `customers` | ✅ LIVE | CRM + tier system |
| `orders` | ✅ LIVE | Transaksi + status tracking |
| `leads` | ✅ LIVE | Scout pipeline (10 leads) |
| `outreach_campaigns` | ✅ LIVE | Closer campaigns |
| `outreach_logs` | ✅ LIVE | WA message audit |
| `validation_events` | ✅ LIVE | Market validation events |
| `validation_metrics` | ✅ LIVE | Quantitative metrics |
| `wa_logs` | 🔴 TODO | Fonnte audit trail |
| `ai_tasks` | 🔴 TODO | AI agent task queue |
| `ai_insights` | 🔴 TODO | Generated AI insights |
| `order_items` | 🔴 TODO | Line items per order |
| `content_calendar` | 🟡 P2 | IG content schedule |
| `analytics_metrics` | 🟡 P2 | IG analytics per account |

### 2.6 Layer 6: External APIs
| Service | API Base URL | Fungsi | Credential |
|---------|-------------|--------|-----------|
| **Fonnte** | `https://api.fonnte.com` | WhatsApp send/broadcast | `FONNTE_TOKEN` |
| **ScraperAPI** | `https://api.scraperapi.com` | Instagram profile scraping | `SCRAPER_API_KEY` |
| **OpenAI** | `https://api.openai.com/v1` | LLM untuk LangGraph agents | `OPENAI_API_KEY` |
| **SerpAPI** | `https://serpapi.com/search` | Web search untuk lead research | `SERPAPI_KEY` |
| **LangSmith** | `https://api.smith.langchain.com` | Agent monitoring + tracing | `LANGCHAIN_API_KEY` |
| **CrewAI Enterprise** | `https://api.crewai.com` | Deep analysis crew execution | `CREWAI_PAT` |
| **Supabase** | `https://lfohzibcsafqthupcvdg.supabase.co` | Database + Auth | `SUPABASE_URL/KEY` |

---

## 3. DATA FLOW (Alur Data)

### 3.1 Lead Discovery Flow
```
[Founder klik "Gather from IG"]
         │
         ▼
[Hono: POST /api/scout/gather]
         │
         ▼
[ScraperAPI — Instagram profiles]
         │
         ▼
[Raw profile data JSON]
         │
         ▼
[LangGraph.js ScoutScorer agent]
   ├── Enrich node (ScraperAPI detail)
   ├── Score node (AI + algorithm)
   └── Decision node (hot/warm/cold)
         │
         ▼
[Store → Supabase: leads table]
         │
         ▼
[Dashboard update: Hot Lead Alert]
```

### 3.2 WhatsApp Outreach Flow
```
[Lead score >= 70 → Closer Agent]
         │
         ▼
[LangGraph.js MessageComposer]
   └── Personalized message generation
         │
         ▼
[Fonnte API: POST /send]
   Body: { target: phone, message: text, delay: 2 }
         │
         ▼
[Log → Supabase: wa_logs table]
         │
         ▼
[Cron: Day 3/7/14 auto-sequence]
   └── Repeat Fonnte send + log
```

### 3.3 AI Analysis Flow (CrewAI)
```
[Hono: POST /api/ai/crew/kickoff]
         │
         ▼
[Pull data dari Supabase]
   ├── validation_events
   ├── leads (dengan scores)
   └── orders (revenue data)
         │
         ▼
[HTTP POST → CrewAI Enterprise API]
   Body: { crew_name, inputs: { demand_data, system_data, trust_data } }
         │
         ▼
[CrewAI async processing]
   ├── MarketAnalyst agent
   ├── DataScientist agent
   └── StrategyAdvisor agent
         │
         ▼
[Poll: GET /api/ai/crew/status/:id]
         │
         ▼
[Store → Supabase: ai_insights table]
         │
         ▼
[Display di AI Intelligence page]
```

### 3.4 Market Validation Flow (3-Layer)
```
[Instagram Ekosistem]
   ├── @fashionkas.official (Demand Layer)
   ├── @resellerkas.official (System Layer)
   └── @haidar_faras_m (Trust Layer)
         │
         ▼ (Manual entry / ScraperAPI)
[Supabase: validation_events + validation_metrics]
         │
         ▼
[LangGraph.js InsightGenerator]
   └── Analyze 3-layer validation data
         │
         ▼
[AI Insights → ai_insights table]
         │
         ▼
[Market Validation Dashboard: /app/validation]
```

---

## 4. TOOLS / API / DATABASE (Inventory Lengkap)

### API Credentials Status
| Credential | Variable | Status |
|-----------|---------|--------|
| Supabase URL | `SUPABASE_URL` | ✅ CONFIGURED |
| Supabase Anon Key | `SUPABASE_ANON_KEY` | ✅ CONFIGURED |
| Supabase Service Key | `SUPABASE_SERVICE_KEY` | ✅ CONFIGURED |
| JWT Secret | `JWT_SECRET` | ✅ CONFIGURED |
| Master PIN | `MASTER_PIN` | ✅ CONFIGURED (1945) |
| ScraperAPI Key | `SCRAPER_API_KEY` | ✅ CONFIGURED |
| Cloudflare Account ID | `CF_ACCOUNT_ID` | ✅ CONFIGURED |
| LangChain API Key | `LANGCHAIN_API_KEY` | ✅ PROVIDED |
| LangChain Service Key | `LANGCHAIN_SERVICE_KEY` | ✅ PROVIDED |
| CrewAI Org ID | `CREWAI_ORG_ID` | ✅ PROVIDED |
| CrewAI PAT | `CREWAI_PAT` | ✅ PROVIDED |
| CrewAI Enterprise Token | `CREWAI_ENTERPRISE_TOKEN` | ✅ PROVIDED |
| SerpAPI Key | `SERPAPI_KEY` | ✅ PROVIDED |
| OpenAI API Key | `OPENAI_API_KEY` | 🔴 NEEDED |
| Fonnte Token | `FONNTE_TOKEN` | 🔴 NEEDED |

---

## 5. APA YANG WAJIB DETERMINISTIC (vs AI-driven)

| Aspek Sistem | Approach | Alasan |
|-------------|----------|--------|
| **Auth gate (PIN check)** | DETERMINISTIC | Keamanan tidak boleh AI-driven |
| **JWT verification** | DETERMINISTIC | Cryptographic — tidak bisa dikompromikan |
| **Lead score algorithm** | DETERMINISTIC base + AI overlay | Base score harus predictable |
| **Fonnte WA send** | DETERMINISTIC execution | Pengiriman pesan tidak boleh "mungkin" |
| **Supabase writes** | DETERMINISTIC | Data integrity |
| **Outreach sequence timing** | DETERMINISTIC schedule | Day 0/3/7/14 = exact timing |
| **Lead scoring AI overlay** | AI-driven (+/- 20 pts) | Holistic judgment OK untuk ini |
| **Message composition** | AI-driven | Personalisasi = AI ideal |
| **Market insights** | AI-driven | Interpretasi data = AI ideal |
| **Revenue forecast** | AI-driven | Prediksi = AI ideal |
| **Content strategy** | AI-driven | Kreativitas = AI ideal |

---

## 6. DEPLOYMENT ARCHITECTURE

```
[GitHub: ganihypha/Sovereign.private.real.busines.orchest]
         │
         ▼ (wrangler deploy)
[Cloudflare Pages: sovereign-orchestrator.pages.dev]
         │
         ▼
[Cloudflare Workers — Hono.js API Gateway]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Supabase] [External APIs]
(DB)       (Fonnte, ScraperAPI, CrewAI, OpenAI)
```

| Environment | URL |
|------------|-----|
| Production | https://sovereign-orchestrator.pages.dev |
| GitHub | https://github.com/ganihypha/Sovereign.private.real.busines.orchest |
| Supabase | https://lfohzibcsafqthupcvdg.supabase.co |

---

## 7. SECURITY ARCHITECTURE

```
ZERO-TRUST INTERNAL MODEL:

Internet → [Cloudflare DDoS + WAF]
                │
         [noindex/nofollow] ← robots meta, tidak bisa di-Google
                │
           [PIN Gate] ← 4-digit bcrypt PIN
                │
        [JWT Verification] ← HS256, 7-day expiry
                │
       [Device ID Lock] ← Browser fingerprint (TODO)
                │
       [Supabase RLS] ← service_role only, anon blocked
                │
         [Data Layer] ← Encrypted at rest
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | System Architecture Brief v4.0 — full component mapping |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
