# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOCS: CREDENTIAL MAP
# (Registry Credential — Nama, Env Var, Status, Lokasi — BUKAN Nilai Asli)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Session: 0 | Tanggal: 2026-04-03 | Versi: 1.0

---

> ⚠️ **ATURAN KERAS:**
> Dokumen ini hanya berisi **metadata credential** (nama, env var, status, lokasi simpan).
> **TIDAK BOLEH** ada nilai/token/key asli ditulis di sini.
> Nilai asli disimpan di: **Cloudflare Secrets** (prod) atau **`.dev.vars`** (lokal dev, TIDAK di-commit).

---

## 📋 CREDENTIAL REGISTRY TABLE

| # | Credential Name | Env Var | Purpose | Status | Storage Location | Used In | Notes |
|---|----------------|---------|---------|--------|-----------------|---------|-------|
| 1 | Supabase Project URL | `SUPABASE_URL` | DB endpoint (project URL) | ✅ READY | Local `.dev.vars` / CF Secret | Semua apps + agents | Format: `https://[ref].supabase.co` |
| 2 | Supabase Service Role Key | `SUPABASE_SERVICE_ROLE_KEY` | Privileged DB operations (admin) | ✅ READY | Local `.dev.vars` / CF Secret | Server-side routes, tower | **SANGAT SENSITIF — jangan expose ke client** |
| 3 | Supabase Anon Key | `SUPABASE_ANON_KEY` | Client DB access (public-safe) | ✅ READY | Local `.dev.vars` / CF Secret | Public-facing API | Verify RLS policy aktif sebelum pakai |
| 4 | JWT Secret | `JWT_SECRET` | Auth token signing + verification | ✅ READY | Local `.dev.vars` / CF Secret | Auth middleware, Sovereign Tower | Rotate setiap 90 hari |
| 5 | Master PIN | `MASTER_PIN` | Founder login gate (numeric PIN) | ✅ READY | Local `.dev.vars` / CF Secret | Sovereign Tower auth | Jangan buat numerik mudah ditebak |
| 6 | Cloudflare API Token | `CLOUDFLARE_API_TOKEN` | Deploy + infra management | ✅ READY | CF Dashboard / GitHub Secret | CI/CD, wrangler deploy | Scope: Pages Deploy |
| 7 | Cloudflare Account ID | `CLOUDFLARE_ACCOUNT_ID` | Target account untuk deploy | ✅ READY | CF Dashboard / GitHub Secret | CI/CD, wrangler | Non-secret tapi tetap manage |
| 8 | Groq API Key | `GROQ_API_KEY` | LLM inference (gratis, fast) | ✅ READY | Local `.dev.vars` / CF Secret | AI agents (LangGraph) | Gunakan ini sebagai primary LLM |
| 9 | ScraperAPI Key | `SCRAPERAPI_KEY` | Instagram scout scraping | ✅ READY | Local `.dev.vars` / CF Secret | Scout Agent | Verify plan limit |
| 10 | GitHub PAT | `GITHUB_PAT` | Repo automation (CI/CD, webhooks) | ✅ READY | GitHub Secret / Local | CI/CD, devops | Hanya buat jika dibutuhkan CI/CD |
| 11 | Fonnte Token | `FONNTE_TOKEN` | WhatsApp automation via Fonnte API | 🔴 MISSING | — | WA routes (/api/wa/*) | **BLOCKER untuk Phase 3 WA tasks** — Daftar di fonnte.com |
| 12 | OpenAI API Key | `OPENAI_API_KEY` | GPT-4 (opsional, backup Groq) | ⚠️ VERIFY | Local `.dev.vars` / CF Secret | AI agents (fallback) | Groq lebih diutamakan (gratis) |
| 13 | LangChain API Key | `LANGCHAIN_API_KEY` | LangSmith tracing + monitoring | ✅ READY | Local `.dev.vars` / CF Secret | Agent observability | Opsional tapi direkomendasikan |
| 14 | CrewAI PAT | `CREWAI_PAT` | CrewAI Enterprise API access | ✅ READY | Local `.dev.vars` / CF Secret | Market Validator agent | Phase 6 — deep analysis |
| 15 | CrewAI Org ID | `CREWAI_ORG_ID` | CrewAI organization identifier | ✅ READY | Local `.dev.vars` / CF Secret | Market Validator agent | Phase 6 |
| 16 | SerpAPI Key | `SERPAPI_KEY` | Web search untuk agents | ✅ READY | Local `.dev.vars` / CF Secret | Scout + Market agents | Verify quota |
| 17 | LLM Base URL | `LLM_BASE_URL` | Base URL LLM provider (Groq/OpenAI) | ✅ READY | Local `.dev.vars` / CF Secret | Semua AI agents | `https://api.groq.com/openai/v1` untuk Groq |

---

## 🔴 BLOCKER SUMMARY

| Credential | Blocker untuk | Aksi yang Dibutuhkan |
|-----------|--------------|---------------------|
| `FONNTE_TOKEN` | Phase 3 — WA Routes `/api/wa/*` | Daftar di fonnte.com, verify nomor WA, dapatkan token |
| `OPENAI_API_KEY` | Fallback LLM (jika Groq tidak cukup) | Opsional — Groq sudah cukup untuk Phase 3-4 |

---

## 📂 STORAGE LOCATION GUIDE

```
DEVELOPMENT (lokal):
  → Simpan di .dev.vars (di root project masing-masing)
  → .dev.vars WAJIB ada di .gitignore
  → JANGAN commit .dev.vars ke repo mana pun

PRODUCTION:
  → Simpan di Cloudflare Secrets (via wrangler pages secret put)
  → Atau via Cloudflare Dashboard → Settings → Environment Variables
  → Untuk CI/CD: simpan di GitHub Repository Secrets

TIDAK BOLEH:
  → Hardcode di kode
  → Commit ke repo (public atau private)
  → Print ke log / console
  → Expose di API response
```

---

## 🗓️ ROTATION SCHEDULE

| Credential | Kapan Rotate | Cara Rotate |
|-----------|-------------|-------------|
| JWT_SECRET | Setiap 90 hari | Generate baru → update di CF Secret + .dev.vars → re-deploy |
| CLOUDFLARE_API_TOKEN | Setiap 180 hari atau jika suspect leak | Buat token baru di CF Dashboard → update GitHub Secret |
| SUPABASE_SERVICE_ROLE_KEY | Hanya jika suspect leak | Rotate di Supabase Dashboard → update semua .dev.vars |
| GROQ_API_KEY | Hanya jika suspect leak | Rotate di console.groq.com |
| FONNTE_TOKEN | Sesuai Fonnte policy | Buat token baru di dashboard Fonnte |

---

## ⚡ CREDENTIAL STATUS UNTUK PHASE BERIKUTNYA

```
SESSION 0 (sekarang):
  READY: Supabase URL, Service Role Key, Anon Key, JWT Secret,
         Master PIN, Cloudflare Token, Account ID, Groq Key,
         ScraperAPI, GitHub PAT, LangChain, CrewAI, SerpAPI, LLM Base URL
  MISSING: Fonnte Token ← HARUS DIURUS sebelum Phase 3

PHASE 1 (Mother Repo Skeleton):
  NEEDED: Cloudflare Token (deploy), GitHub PAT (push)
  STATUS: ✅ READY

PHASE 2 (Shared Packages):
  NEEDED: Supabase URL + Service Role Key (packages/db)
  STATUS: ✅ READY

PHASE 3 (Sovereign Tower + WA):
  NEEDED: Supabase, JWT, Groq, Fonnte Token, ScraperAPI
  STATUS: 🔴 BLOCKED — tunggu Fonnte Token

PHASE 6 (Agent Orchestration):
  NEEDED: Groq/OpenAI, LangChain, CrewAI, ScraperAPI, Fonnte
  STATUS: 🔴 BLOCKED — tunggu Phase 3 + Fonnte
```

---

## 🔗 REFERENSI

| Butuh | Lihat |
|-------|-------|
| Env var names lengkap | `.env.example` + `.dev.vars.example` di `/infra/env-templates/` |
| Cara pakai credential di Hono | `docs/29-AI-DEV-HANDOFF-PACK.md` Rule 4 |
| Deployment env setup | `docs/25-DEPLOYMENT-INVENTORY.md` |
| Credential usage per module | `docs/20-CREDENTIAL-REGISTRY.md` (full registry) |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Session 0 — Credential Map v1.0 (metadata only, no secrets) |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
