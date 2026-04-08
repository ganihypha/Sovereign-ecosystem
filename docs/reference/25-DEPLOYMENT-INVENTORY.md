# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 25: DEPLOYMENT INVENTORY
# (Inventory Cloudflare Pages/Workers + Domain + Env + CI/CD)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"Sebelum migrasi deployment, kamu harus tahu: apa yang sekarang hidup, deploy dari mana, env apa yang dipakai, dan dependency ke service apa. Tanpa ini, migration bisa mematikan sistem yang seharusnya tetap jalan."*

---

## 🎯 TUJUAN DOKUMEN INI

Dokumen ini menjawab:
- App/service apa yang sekarang live?
- Deploy dari repo mana ke platform mana?
- Domain/subdomain apa yang dipakai?
- Env vars kritis apa yang dibutuhkan?
- CI/CD sudah ada atau masih manual?
- Dependency ke service lain apa?
- Target deployment pattern ke depannya?

**AI Dev WAJIB cek dokumen ini sebelum membuat deployment baru atau mengubah yang existing.**

---

## 📋 DEPLOYMENT INVENTORY TABLE

| # | App Name | Repo Source | Platform | Domain / URL | Branch | Status | Env Vars Kritis | CI/CD | Dependency |
|---|----------|-------------|----------|-------------|--------|--------|-----------------|-------|------------|
| 1 | **sovereign-orchestrator** | ganihypha/Sovereign.private.real.busines.orchest | Cloudflare Pages | https://sovereign-orchestrator.pages.dev | main | ✅ LIVE (v3.0) | SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, MASTER_PIN, SCRAPERAPI_KEY | Manual deploy (wrangler) | Supabase, ScraperAPI |
| 2 | **sovereign-command-center** | TBD — audit Phase 0 | Cloudflare Pages | https://sovereign-command-center.pages.dev | main | ✅ LIVE | TBD | Manual deploy | TBD |
| 3 | **fashionkas** | ganihypha/Fashionkas | TBD | TBD | main | ⚠️ PERLU AUDIT | TBD | TBD | TBD |
| 4 | **resellerkas** | ganihypha/Resellerkas | TBD | TBD | main | ⚠️ PERLU AUDIT | TBD | TBD | TBD |
| 5 | **mother-repo** (new) | NEW canonical repo | Cloudflare Pages (target) | TBD | main | 🔴 BELUM ADA | TBD | GitHub Actions (target) | All services |

---

## 🔧 DETAIL DEPLOYMENT — SOVEREIGN ORCHESTRATOR (PRIMARY)

```
App Name:        sovereign-orchestrator
Repo:            ganihypha/Sovereign.private.real.busines.orchest
Platform:        Cloudflare Pages
URL Production:  https://sovereign-orchestrator.pages.dev
Branch:          main
Build Command:   npm run build
Build Output:    dist/
Deploy Method:   wrangler pages deploy dist --project-name sovereign-orchestrator
Status:          ✅ LIVE v3.0

Framework:       Hono + TypeScript + Vite
Runtime:         Cloudflare Workers (edge)
DB:              Supabase (via fetch API)
Auth:            PIN 4-digit → JWT 7-day → Cloudflare Secret

ENV VARS (Cloudflare Secrets):
  SUPABASE_URL          ✅ Configured
  SUPABASE_SERVICE_KEY  ✅ Configured (server-side only)
  JWT_SECRET            ✅ Configured
  MASTER_PIN            ✅ Configured
  SCRAPERAPI_KEY        ✅ Configured
  LANGCHAIN_API_KEY     ✅ Provided (perlu add ke Secrets)
  CREWAI_PAT            ✅ Provided (perlu add ke Secrets)
  CREWAI_ORG_ID         ✅ Provided (perlu add ke Secrets)
  SERPAPI_KEY           ✅ Provided (perlu add ke Secrets)
  OPENAI_API_KEY        🔴 MISSING — perlu dari user (atau ganti GROQ)
  FONNTE_TOKEN          🔴 MISSING — daftar di fonnte.com
  GROQ_API_KEY          🔴 NEEDED (alternatif OpenAI — gratis)

EXTERNAL DEPENDENCIES:
  Supabase              ✅ LIVE — canonical DB
  ScraperAPI            ✅ CONFIGURED — Instagram data
  Fonnte WA API         🔴 PENDING — belum ada token
  LangChain / LangGraph 🟡 READY — key tersedia
  CrewAI                🟡 READY — PAT tersedia
  OpenAI / Groq         🔴 MISSING LLM key
```

---

## 🌐 ENV VARS MASTER MAP

### Wajib untuk Semua Deployment

| Env Var | Purpose | Dev (.dev.vars) | Prod (CF Secrets) | Status |
|---------|---------|-----------------|-------------------|--------|
| `SUPABASE_URL` | Database connection | ✅ | ✅ | CONFIGURED |
| `SUPABASE_SERVICE_KEY` | Server-side DB auth | ✅ | ✅ | CONFIGURED |
| `JWT_SECRET` | Auth token signing | ✅ | ✅ | CONFIGURED |
| `MASTER_PIN` | Founder PIN | ✅ | ✅ | CONFIGURED |

### Untuk WA Automation (Sprint 1)
| Env Var | Purpose | Dev (.dev.vars) | Prod (CF Secrets) | Status |
|---------|---------|-----------------|-------------------|--------|
| `FONNTE_TOKEN` | WhatsApp send API | 🔴 MISSING | 🔴 MISSING | **NEEDED ASAP** |

### Untuk AI/LLM (Sprint 2+)
| Env Var | Purpose | Dev (.dev.vars) | Prod (CF Secrets) | Status |
|---------|---------|-----------------|-------------------|--------|
| `OPENAI_API_KEY` atau `GROQ_API_KEY` | LLM API | 🔴 MISSING | 🔴 MISSING | **NEEDED** |
| `LLM_BASE_URL` | LLM endpoint | 🔴 MISSING | 🔴 MISSING | Set setelah pilih provider |
| `LANGCHAIN_API_KEY` | LangSmith tracing | ✅ Provided | 🟡 Add to Secrets | PENDING |
| `SCRAPERAPI_KEY` | Instagram scraper | ✅ | ✅ | CONFIGURED |

### Untuk Agent Framework (Sprint 3+)
| Env Var | Purpose | Dev (.dev.vars) | Prod (CF Secrets) | Status |
|---------|---------|-----------------|-------------------|--------|
| `CREWAI_PAT` | CrewAI auth | ✅ Provided | 🟡 Add to Secrets | PENDING |
| `CREWAI_ORG_ID` | CrewAI organization | ✅ Provided | 🟡 Add to Secrets | PENDING |
| `SERPAPI_KEY` | Search API | ✅ Provided | 🟡 Add to Secrets | PENDING |

---

## 🚀 DEPLOYMENT STANDARDS (Target untuk Semua App)

```
STANDARD YANG HARUS DITERAPKAN DI SEMUA DEPLOYMENT:

1. ENVIRONMENT SEPARATION
   Dev:  .dev.vars (JANGAN commit ke git)
   Prod: Cloudflare Pages Secrets (wrangler secret put)

2. BRANCH STRATEGY
   main     → production deployment
   develop  → staging/preview (opsional)
   feature/* → local only

3. BUILD STANDARD
   Command:   npm run build
   Output:    dist/
   Framework: Hono + Vite + Cloudflare Pages

4. SECRET HANDLING
   TIDAK PERNAH hardcode secret di kode
   TIDAK PERNAH commit .dev.vars ke git
   SELALU pakai env vars untuk semua credential

5. NAMING CONVENTION
   Cloudflare project: [app-name] (lowercase, dash separator)
   Workers: [app-name]-worker
   KV namespace: [APP_NAME]_KV

6. CI/CD TARGET (setelah mother repo terbentuk)
   GitHub Actions untuk semua app
   Auto-deploy ke Cloudflare Pages saat push ke main
   Preview deployment untuk PR
```

---

## 📊 CI/CD STATUS & TARGET

| App | CI/CD Sekarang | Target CI/CD | Priority |
|-----|---------------|-------------|----------|
| sovereign-orchestrator | Manual (wrangler CLI) | GitHub Actions auto-deploy | Phase 3 |
| sovereign-command-center | Manual | GitHub Actions | Phase 3 |
| fashionkas | Unknown — perlu audit | GitHub Actions | Phase 4 |
| resellerkas | Unknown — perlu audit | GitHub Actions | Phase 4 |
| mother-repo (new) | N/A | GitHub Actions dari awal | Phase 1 |

---

## 🔍 PHASE 0 AUDIT CHECKLIST

```
DEPLOYMENT AUDIT — LAKUKAN SEBELUM MIGRASI APA PUN:

[ ] Verifikasi sovereign-orchestrator.pages.dev — masih live? response OK?
[ ] Verifikasi sovereign-command-center.pages.dev — masih live?
[ ] Cek Cloudflare Pages dashboard — list semua project yang ada
[ ] Cek env secrets yang sudah ter-set di tiap Cloudflare project
[ ] Audit: Fashionkas deploy di mana? URL-nya apa?
[ ] Audit: Resellerkas deploy di mana? URL-nya apa?
[ ] Cek: CI/CD existing ada atau semua masih manual?
[ ] List semua domain/subdomain yang dipakai
[ ] Update tabel inventory di atas setelah audit
```

---

## ⚠️ MIGRATION DEPLOYMENT RULES

```
WAJIB DIIKUTI SAAT MIGRASI DEPLOYMENT:

1. JANGAN matiin deployment yang sedang live tanpa konfirmasi founder
2. Lakukan parallel deployment dulu (deploy baru jalan, lama tetap hidup)
3. Validate dulu deployment baru sebelum redirect traffic
4. Pastikan semua env vars sudah ter-set di deployment baru
5. Test semua endpoint kritis sebelum switch
6. Backup database sebelum cutover
7. Catat setiap keputusan deployment di 19-DECISION-LOG.md
```

---

## 🔗 REFERENSI DOKUMEN TERKAIT

| Butuh info tentang | Buka dokumen ini |
|-------------------|------------------|
| Semua credentials + status | `20-CREDENTIAL-REGISTRY.md` |
| Repo mana yang deploy ke mana | `23-REPO-INVENTORY.md` |
| Database yang dipakai tiap app | `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` |
| Urutan deployment dalam migrasi | `28-MIGRATION-PHASE-PLAN.md` |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Deployment Inventory v1.0 — initial inventory + deployment standards |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
