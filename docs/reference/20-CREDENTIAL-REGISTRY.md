# 20 – CREDENTIAL / ENVIRONMENT REGISTRY
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** LIVING DOCUMENT – Update setiap credential berubah
**Repo:** https://github.com/ganihypha/Sovereign.private.real.busines.orchest

---

> ⚠️ **SECURITY NOTICE:** Dokumen ini mencatat METADATA kredensial (service, status, lokasi penyimpanan).
> **NILAI ASLI TOKEN/KEY TIDAK DISIMPAN DI SINI.**
> Nilai asli disimpan di: `.dev.vars` (lokal, tidak di-commit), Cloudflare Secrets (produksi), Supabase Vault (jika perlu).

---

## CARA PAKAI DOKUMEN INI

**Tujuan:**
1. Inventory semua credential yang dibutuhkan sistem
2. Track mana yang sudah configured, mana yang masih missing
3. Map credential ke environment (dev/prod) dan service yang memakainya
4. Panduan rotasi/renewal saat token expired

**Lokasi penyimpanan resmi:**
- **Dev:** `/home/user/sovereign-orchestrator/.dev.vars` (JANGAN commit ke git)
- **Prod:** Cloudflare Pages Secrets → `npx wrangler pages secret put KEY_NAME --project-name sovereign-orchestrator`
- **Referensi lokal:** Di luar repo (encrypted notes, password manager)

---

## MASTER CREDENTIAL TABLE

| # | Service | Key Name | Environment | Status | Terakhir Diperbarui | Dipakai Oleh |
|---|---------|----------|-------------|--------|---------------------|--------------|
| 1 | Supabase | `SUPABASE_URL` | Dev + Prod | ✅ CONFIGURED | 2026-04-05 | Semua routes DB |
| 2 | Supabase | `SUPABASE_ANON_KEY` | Dev + Prod | ✅ CONFIGURED | 2026-04-05 | Frontend calls |
| 3 | Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Prod only | ✅ CONFIGURED | 2026-04-05 | Admin routes |
| 4 | Supabase | `SUPABASE_JWT_SECRET` | Prod only | ✅ CONFIGURED | 2026-03-01 | Auth middleware |
| 5 | App Auth | `DASHBOARD_PIN` | Dev + Prod | ✅ CONFIGURED | 2026-03-01 | PIN login |
| 6 | App Auth | `JWT_SECRET` | Dev + Prod | ✅ CONFIGURED | 2026-04-05 | JWT middleware |
| 7 | ScraperAPI | `SCRAPER_API_KEY` | Dev + Prod | ✅ CONFIGURED | 2026-03-15 | Scout module |
| 8 | Cloudflare | `CF_ACCOUNT_ID` | Prod | ✅ CONFIGURED | 2026-04-05 | Wrangler deploy |
| 9 | Cloudflare | `CF_API_TOKEN` | Prod | ✅ CONFIGURED | 2026-04-05 | Wrangler deploy |
| 10 | Fonnte | `FONNTE_ACCOUNT_TOKEN` | Prod | ✅ CONFIGURED | 2026-04-05 | WA device status check |
| 11 | Fonnte | `FONNTE_DEVICE_TOKEN` | Prod | ✅ CONFIGURED | 2026-04-05 | WA send (device token) |
| 12 | GROQ | `GROQ_CONSOLE` / `LLM_API_KEY` | Dev + Prod | ✅ CONFIGURED | 2026-04-05 | AI agents (Sprint 2+) |
| 13 | LangChain | `LANGCHAIN_API_KEY` | Dev + Prod | 🟡 PROVIDED | 2026-04-01 | LangSmith tracing |
| 14 | CrewAI | `CREWAI_PAT` | Prod | 🟡 PROVIDED | 2026-04-01 | Multi-agent phase |
| 15 | SerpAPI | `SERP_API_KEY` | Dev + Prod | 🟡 PROVIDED | 2026-04-01 | Web search tool |
| 16 | R2 Storage | `R2_ACCESS_KEY` | Prod | ✅ CONFIGURED | 2026-03-01 | File storage |
| 17 | R2 Storage | `R2_ENDPOINT` | Prod | ✅ CONFIGURED | 2026-03-01 | File storage |
| 18 | GitHub | `GITHUB_TOKEN` | Dev | ✅ CONFIGURED | 2026-04-05 | Git push dari sandbox |

**Legend:** ✅ CONFIGURED = aktif dan tersimpan | 🔴 MISSING = harus segera didapat | 🟡 PROVIDED = ada nilainya, belum ditest

---

## DETAIL PER SERVICE

### 1. SUPABASE
```
Project Name : Sovereign Business Engine
Project URL  : https://lfohzibcsafqthupcvdg.supabase.co
Region       : Southeast Asia
Plan         : Free / Pro (cek di dashboard)

Keys yang perlu disimpan:
  - SUPABASE_URL         = https://lfohzibcsafqthupcvdg.supabase.co
  - SUPABASE_ANON_KEY    = eyJ... (lihat di Supabase Settings > API)
  - SUPABASE_SERVICE_KEY = eyJ... (lihat di Supabase Settings > API > service_role)
  - SUPABASE_JWT_SECRET  = cCZ/... (lihat di Supabase Settings > API > JWT Settings)

Cara rotate: Supabase Dashboard → Settings → API → "Reset" (perlu update semua env)
Tabel aktif saat ini: 8 tabel (v3.0), +4 tabel baru di Sprint 1
```

### 2. CLOUDFLARE
```
Account ID   : 618d52f63c689422eacf6638436c3e8b
Project Name : sovereign-orchestrator
Pages URL    : https://sovereign-orchestrator.pages.dev

Keys yang perlu disimpan:
  - CF_ACCOUNT_ID = 618d52f63c689422eacf6638436c3e8b
  - CF_API_TOKEN  = [User API Token - lihat Cloudflare Dashboard > My Profile > API Tokens]

R2 Storage:
  - R2_ENDPOINT    = https://618d52f63c689422eacf6638436c3e8b.r2.cloudflarestorage.com
  - R2_ACCESS_KEY  = [lihat R2 bucket settings]
  - R2_SECRET_KEY  = [lihat R2 bucket settings]

Cara update secret ke CF Pages:
  npx wrangler pages secret put SUPABASE_URL --project-name sovereign-orchestrator
  npx wrangler pages secret put FONNTE_TOKEN --project-name sovereign-orchestrator
  (ulangi untuk tiap key)

Cara list secrets yang sudah ada:
  npx wrangler pages secret list --project-name sovereign-orchestrator
```

### 3. FONNTE (WhatsApp Gateway)
```
Status       : ✅ CONFIGURED — LIVE (Session 3f verified 2026-04-05)
Website      : https://fonnte.com
Device       : Sovereign-ecosystem (6281558098096) — status: connect ✅
E2E Test     : ✅ CONFIRMED — fonnte_message_id: 150273541 (delivery_status: CONFIRMED)

Keys yang sudah dikonfigurasi di Cloudflare Secrets (sovereign-tower):
  - FONNTE_ACCOUNT_TOKEN = ✅ Present — digunakan untuk /get-devices check
  - FONNTE_DEVICE_TOKEN  = ✅ Present — digunakan untuk /send (device-specific token)
    Note: FONNTE_DEVICE_TOKEN ≠ FONNTE_ACCOUNT_TOKEN — keduanya berbeda dan keduanya wajib ada

Routes yang sudah live:
  GET  /api/wa/status  → cek device connect + wa_logs ready
  GET  /api/wa/logs    → list wa_logs entries
  POST /api/wa/test    → test send + log ke wa_logs
  POST /api/wa/send    → production send + log ke wa_logs (dry_run option available)

wa_logs table: ✅ LIVE di Supabase — 3 entries (1 sent, 2 failed pre-fix)

Cara update secret ke CF Pages (jika perlu rotate):
  npx wrangler pages secret put FONNTE_ACCOUNT_TOKEN --project-name sovereign-tower
  npx wrangler pages secret put FONNTE_DEVICE_TOKEN --project-name sovereign-tower

Referensi: ADR-012 | Session 3f summary | wa-adapter.ts
```

### 4. LLM PROVIDER (GROQ → OpenAI Migration Path)
```
Status Dev   : 🟡 Pakai GROQ (gratis, rate limited)
Status Prod  : 🔴 MISSING OpenAI key

GROQ (Dev/Test):
  Website  : https://console.groq.com
  Model    : llama3-8b-8192 (cepat, gratis)
  Key name : LLM_API_KEY
  Base URL : https://api.groq.com/openai/v1
  Cara dapat: Daftar → Console → API Keys → Create

OpenAI (Prod):
  Website  : https://platform.openai.com
  Model    : gpt-4o-mini (cost efficient) / gpt-4o (quality)
  Key name : LLM_API_KEY (sama, cukup ganti value)
  Cara dapat: Login → API Keys → Create new secret key

Abstraksi di kode (src/lib/llm.ts):
  const client = new OpenAI({
    apiKey: env.LLM_API_KEY,
    baseURL: env.LLM_BASE_URL || 'https://api.openai.com/v1'
  })
  // Untuk GROQ: set LLM_BASE_URL=https://api.groq.com/openai/v1
```

### 5. LANGCHAIN / LANGSMITH
```
Status       : 🟡 PROVIDED
Website      : https://smith.langchain.com
Purpose      : Agent execution tracing, debugging, prompt versioning

Key yang perlu disimpan:
  - LANGCHAIN_API_KEY    = [dari LangSmith dashboard]
  - LANGCHAIN_PROJECT    = sovereign-engine
  - LANGCHAIN_TRACING_V2 = true

Cara aktivasi: Sudah ada token, tinggal set ke .dev.vars dan CF Secrets
```

### 6. CREWAI
```
Status       : 🟡 PROVIDED (pakai di Sprint 4)
Website      : https://crewai.com
Purpose      : Multi-agent orchestration (Sprint 4+)

Key yang perlu disimpan:
  - CREWAI_PAT    = [Personal Access Token dari CrewAI dashboard]
  - CREWAI_ORG_ID = [Organization ID]

Catatan: Tidak urgent sampai Sprint 4. Simpan dulu, jangan pakai.
```

### 7. SERPAPI
```
Status       : 🟡 PROVIDED
Website      : https://serpapi.com
Purpose      : Web search untuk ScoutScorer agent (Google results)

Key yang perlu disimpan:
  - SERP_API_KEY = [dari SerpAPI dashboard]

Rate limit free tier: 100 searches/bulan
```

---

## .dev.vars TEMPLATE

Simpan file ini di root project (`/home/user/sovereign-orchestrator/.dev.vars`).
**JANGAN commit ke git** – sudah ada di `.gitignore`.

```bash
# .dev.vars – LOCAL DEV ENVIRONMENT
# JANGAN commit file ini ke git!
# Salin template ini, isi nilainya dari credential manager

# Supabase
SUPABASE_URL=https://lfohzibcsafqthupcvdg.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=cCZ/...

# App Auth
DASHBOARD_PIN=your_pin_here

# Cloudflare (hanya untuk wrangler CLI, tidak perlu di app)
CF_ACCOUNT_ID=618d52f63c689422eacf6638436c3e8b

# Fonnte WhatsApp
FONNTE_TOKEN=MISSING_GET_FROM_FONNTE
FONNTE_DEVICE=628xxxxxxxxxx

# LLM Provider (GROQ untuk dev, OpenAI untuk prod)
LLM_API_KEY=MISSING_GET_FROM_GROQ_OR_OPENAI
LLM_BASE_URL=https://api.groq.com/openai/v1

# LangChain Tracing
LANGCHAIN_API_KEY=your_langchain_key
LANGCHAIN_PROJECT=sovereign-engine
LANGCHAIN_TRACING_V2=true

# ScraperAPI
SCRAPER_API_KEY=your_scraper_key

# SerpAPI
SERP_API_KEY=your_serp_key

# CrewAI (Sprint 4+)
CREWAI_PAT=your_crewai_pat
CREWAI_ORG_ID=your_crewai_org

# R2 Storage
R2_ENDPOINT=https://618d52f63c689422eacf6638436c3e8b.r2.cloudflarestorage.com
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
```

---

## CHECKLIST PUSH SECRETS KE CLOUDFLARE PAGES

Jalankan setelah `.dev.vars` terisi penuh:

```bash
cd /path/to/sovereign-orchestrator
PROJECT=sovereign-orchestrator

# Loop semua key dari .dev.vars (exclude comments)
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  echo "Pushing $key..."
  echo "$value" | npx wrangler pages secret put "$key" --project-name $PROJECT
done < .dev.vars

# Atau manual satu per satu:
npx wrangler pages secret put SUPABASE_URL --project-name $PROJECT
npx wrangler pages secret put FONNTE_TOKEN --project-name $PROJECT
npx wrangler pages secret put LLM_API_KEY --project-name $PROJECT
# ... (ulangi untuk tiap key)

# Verifikasi:
npx wrangler pages secret list --project-name $PROJECT
```

---

## CREDENTIAL ROTATION SCHEDULE

| Service | Frekuensi Rotasi | Cara Rotasi | Reminder |
|---------|------------------|-------------|----------|
| Supabase JWT Secret | 6 bulan atau jika breach | Dashboard → Reset → Update CF Secrets | Set calendar reminder |
| Cloudflare API Token | Setiap 3 bulan | CF Dashboard → My Profile → API Tokens | Set calendar reminder |
| Fonnte Token | Jika device dicabut | Fonnte Dashboard → Regenerate | Setelah ganti HP WA |
| OpenAI API Key | Jika terekspos | platform.openai.com → API Keys → Delete + Create | Monitor usage anomali |
| GROQ API Key | Jika terekspos | console.groq.com → Regenerate | - |

---

*Document Control: v1.1 – 2026-04-06 – Living Document (Fonnte section updated: MISSING → CONFIGURED + LIVE, Session 3f verified, FONNTE_ACCOUNT_TOKEN + FONNTE_DEVICE_TOKEN both confirmed)*
*CLASSIFIED – FOUNDER ACCESS ONLY*
