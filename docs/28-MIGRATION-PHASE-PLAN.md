# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 28: MIGRATION PHASE PLAN
# (Urutan Kerja 8 Phase — Evidence-Based, Incremental, Tidak Chaos)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"Kalau cuma satu doc yang bikin execution jadi waras, ini dia. Bukan sekadar urutan kerja — ini kontrak bertahap antara Founder dan sistem. Setiap phase ada objective, input, output, risk, dan done criteria."*

---

## 🎯 PRINSIP UTAMA MIGRASI

```
STRATEGI: Integrate First, Rebuild Later Only If Needed

Yang TIDAK dilakukan:
  ❌ Rebuild semua dari nol
  ❌ Merge semua repo sekaligus
  ❌ Merge semua database sekaligus
  ❌ Ganti semua deployment sekaligus
  ❌ Dump semua file ke AI Dev tanpa prioritas

Yang DILAKUKAN:
  ✅ Bikin canonical mother repo dulu
  ✅ Audit semua yang ada sebelum ubah apa pun
  ✅ Migrasi domain-by-domain, phase-by-phase
  ✅ Repo lama tetap jalan selama transisi
  ✅ Catat setiap keputusan di Decision Log
  ✅ Validate setiap output sebelum lanjut ke phase berikutnya
```

---

## 🗺️ PHASE OVERVIEW

| Phase | Nama | Fokus | Estimasi | Status |
|-------|------|-------|----------|--------|
| **Phase 0** | Repo & System Audit | Audit semua yang ada sebelum ubah apa pun | 1 sesi (2-3 jam) | 🔴 NOT STARTED |
| **Phase 1** | Mother Repo Skeleton | Buat canonical integration home | 1 sesi (3-4 jam) | 🔴 NOT STARTED |
| **Phase 2** | Shared Core Packages | Extract + build shared packages | 2-3 sesi | 🔴 NOT STARTED |
| **Phase 3** | Sovereign Tower Hardening | Upgrade private command center ke v4.0 | 2-3 sesi (Sprint 1-2) | 🔴 NOT STARTED |
| **Phase 4** | Public Surface Integration | Sambungkan Fashionkas + Resellerkas ke shared core | 2-3 sesi | 🔴 NOT STARTED |
| **Phase 5** | DB Consolidation | Migrasi domain data ke canonical bridge | 2-3 sesi | 🔴 NOT STARTED |
| **Phase 6** | Agent Orchestration | Build + integrate agent layer | 4-6 sesi (Sprint 2-5) | 🔴 NOT STARTED |
| **Phase 7** | CCA Evidence Layer | Structured CCA evidence vault | 1-2 sesi | 🔴 NOT STARTED |

---

## 📋 PHASE 0 — REPO & SYSTEM AUDIT

### Objective
Pahami current state secara menyeluruh SEBELUM ubah apa pun.
Tidak ada kode yang ditulis di phase ini — hanya audit dan dokumentasi.

### Input Docs
- `23-REPO-INVENTORY.md` (isi kolom yang kosong)
- `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` (isi kolom yang kosong)
- `25-DEPLOYMENT-INVENTORY.md` (isi kolom yang kosong)

### Tasks
```
[ ] Audit semua GitHub repos (akses, branch, stack, README)
[ ] Cek semua deployment (URL, status, env vars)
[ ] List semua Supabase projects + tables
[ ] Identifikasi overlap / redundansi antar DB
[ ] List semua credentials yang ada vs yang missing
[ ] Update 23, 24, 25 dengan data aktual
[ ] Catat semua temuan di 19-DECISION-LOG.md sebagai ADR
```

### Output
- `23-REPO-INVENTORY.md` — fully filled
- `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` — fully filled
- `25-DEPLOYMENT-INVENTORY.md` — fully filled
- ADR entries di `19-DECISION-LOG.md`

### Risk
| Risk | Mitigasi |
|------|---------|
| Repo tidak bisa diakses | Cek GitHub permissions dulu |
| DB production berisi data penting | JANGAN ubah apa pun di phase ini |
| Deployment aktif mungkin break | HANYA AUDIT, tidak deploy apa pun |

### Done Criteria
```
✅ Semua tabel di 23, 24, 25 sudah terisi lengkap
✅ Tidak ada repo, DB, atau deployment yang "unknown"
✅ Decision log diupdate dengan temuan audit
✅ Founder sudah approve canonical target sebelum Phase 1
```

### What NOT to Touch Yet
```
❌ Jangan edit kode di repo manapun
❌ Jangan hapus tabel atau data DB
❌ Jangan matiin deployment yang sedang live
```

---

## 📋 PHASE 1 — MOTHER REPO SKELETON

### Objective
Buat canonical mother repo sebagai governance center dan integration home.
Di phase ini, isinya hanya skeleton (folder + placeholder) — belum ada kode app.

### Input Docs
- `27-MOTHER-REPO-STRUCTURE.md` — folder tree target
- `26-CANONICAL-ARCHITECTURE-MAP.md` — ecosystem target
- Phase 0 audit results

### Tasks
```
[ ] Buat GitHub repo baru: sovereign-ecosystem (private)
[ ] Init dengan Turborepo: npx create-turbo@latest
[ ] Setup folder structure sesuai 27-MOTHER-REPO-STRUCTURE.md
[ ] Buat placeholder untuk semua packages dengan package.json kosong
[ ] Setup tsconfig.base.json
[ ] Setup root .gitignore (penting! termasuk .dev.vars)
[ ] Copy semua docs 00-29 ke /docs folder
[ ] Setup /infra/env-templates dengan .env.example
[ ] Buat README.md ecosystem overview
[ ] Setup /migration folder dengan phase-tracker.md
[ ] Setup /evidence folder dengan CCA subdirectory
[ ] Initial commit + push ke GitHub
```

### Output
- GitHub repo `sovereign-ecosystem` (private) ✅
- Folder tree sesuai doc 27 ✅
- Semua docs 00-29 ada di /docs ✅
- Turborepo pipeline configured ✅

### Risk
| Risk | Mitigasi |
|------|---------|
| Turborepo setup kompleks | Pakai `create-turbo` template, jangan custom dari nol |
| Naming konflik dengan repo lama | Ikuti naming convention di doc 27 |

### Done Criteria
```
✅ Repo bisa di-clone dan struktur folder sesuai target
✅ npx turbo build jalan (walaupun output kosong)
✅ Semua docs ada di /docs
✅ .gitignore benar (cek: .dev.vars tidak ke-commit)
✅ README ecosystem sudah ada
```

### What NOT to Touch Yet
```
❌ Jangan integrasi kode app existing ke sini
❌ Jangan setup DB schema dulu (Phase 2)
❌ Jangan setup GitHub Actions dulu (Phase 3+)
```

---

## 📋 PHASE 2 — SHARED CORE PACKAGES

### Objective
Extract dan build shared packages yang akan dipakai semua app.
Ini pondasi teknis yang bikin semua app tidak duplicate logic.

### Input Docs
- `26-CANONICAL-ARCHITECTURE-MAP.md` — layer definitions
- `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` — schema domains
- `04-PROMPT-CONTRACT.md` — agent contracts yang akan jadi packages
- `03-BUILD-SPEC-PER-MODULE.md` — existing types + structures

### Tasks
```
[ ] Build packages/types — TypeScript types dari kode existing
    → Extract dari sovereign-tower codebase
    → Types: Lead, Customer, Order, Product, WALog, AITask

[ ] Build packages/db — DB schema + query helpers
    → Schema based on 24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
    → Supabase client wrapper
    → Type-safe query helpers per domain

[ ] Build packages/auth — JWT validation
    → Extract dari sovereign-tower auth logic
    → Middleware functions (Hono compatible)

[ ] Build packages/integrations — External API clients
    → Supabase client (re-export dengan type safety)
    → Fonnte client
    → ScraperAPI client
    → OpenAI / Groq client

[ ] Build packages/prompt-contracts — Agent prompts
    → Extract dari 04-PROMPT-CONTRACT.md
    → Type the output schemas

[ ] Test: semua packages build tanpa error
[ ] Publish packages ke private npm registry atau workspace
```

### Output
- `@sovereign/types` ✅ built
- `@sovereign/db` ✅ built
- `@sovereign/auth` ✅ built
- `@sovereign/integrations` ✅ built
- `@sovereign/prompt-contracts` ✅ built

### Risk
| Risk | Mitigasi |
|------|---------|
| Type mismatch dengan kode existing | Start dari existing types, bukan redesign total |
| Supabase client config berbeda per app | Buat factory function yang terima config |

### Done Criteria
```
✅ npx turbo build berhasil untuk semua packages
✅ Tidak ada type errors
✅ packages/db bisa generate Supabase query yang valid
✅ packages/auth bisa validate JWT dari sovereign-tower
✅ Unit test minimal untuk packages/auth dan packages/db
```

### What NOT to Touch Yet
```
❌ Jangan refactor app existing dulu
❌ Jangan migrate database dulu (Phase 5)
❌ Jangan setup GitHub Actions dulu
```

---

## 📋 PHASE 3 — SOVEREIGN TOWER HARDENING

### Objective
Upgrade private command center ke v4.0 dengan semua modul Sprint 1-2.
Ini adalah fase paling kritis karena ini pusat kontrol operasional.

### Input Docs
- `07-MODULE-TASK-BREAKDOWN.md` — Sprint 1 & 2 tasks
- `17-TASK-PROMPT-PACK-TEMPLATE.md` — prompt templates
- `08-ACCEPTANCE-CRITERIA.md` — done criteria
- `03-BUILD-SPEC-PER-MODULE.md` — module specs
- `20-CREDENTIAL-REGISTRY.md` — credentials needed

### Tasks (dari Sprint 1)
```
[ ] Buat 4 tabel baru: wa_logs, ai_tasks, ai_insights, order_items
[ ] Build /api/wa/send (Fonnte integration)
[ ] Build /api/wa/broadcast
[ ] Build /api/wa/status
[ ] Test kirim WA ke nomor sendiri
[ ] Update sovereign-tower untuk pakai @sovereign/integrations
[ ] Update sovereign-tower untuk pakai @sovereign/auth
```

### Tasks (dari Sprint 2 — Agent)
```
[ ] Install @langchain/langgraph + @langchain/openai
[ ] Build ScoutScorer agent (dari 04-PROMPT-CONTRACT.md)
[ ] Build /api/scout/gather
[ ] Build /api/scout/ai-score
[ ] Test full flow: Gather → Score → Store
[ ] Add GitHub Actions untuk auto-deploy sovereign-tower
```

### Output
- Sovereign Tower v4.0 LIVE ✅
- WA automation berjalan ✅
- Scout Agent berjalan ✅
- CI/CD untuk sovereign-tower ✅

### Risk
| Risk | Mitigasi |
|------|---------|
| LLM key missing | Pakai Groq (gratis) sebagai fallback |
| Fonnte token belum ada | Blocker! Must have sebelum Phase 3 WA tasks |
| DB migration bisa corrupt data | Test di dev dulu, backup sebelum migrate prod |

### Done Criteria
```
✅ Semua acceptance criteria dari 08 terpenuhi untuk Sprint 1
✅ WA test send sukses
✅ Scout Agent score lead dengan benar
✅ 19-DECISION-LOG.md diupdate dengan keputusan Sprint 1-2
✅ 21-PROOF-TRACKER-LIVE.md ada bukti nyata Sprint 1-2
```

### What NOT to Touch Yet
```
❌ Jangan integrate Fashionkas/Resellerkas ke shared DB dulu
❌ Jangan build Customer Workspace dulu (Phase 4+)
```

---

## 📋 PHASE 4 — PUBLIC SURFACE INTEGRATION

### Objective
Sambungkan Fashionkas dan Resellerkas ke shared packages dan canonical DB.
Brand identity masing-masing TETAP — yang diintegrasikan adalah backend plumbing.

### Input Docs
- `26-CANONICAL-ARCHITECTURE-MAP.md` — data flow target
- `23-REPO-INVENTORY.md` — repo info Fashionkas + Resellerkas
- Phase 2 results (shared packages ready)

### Tasks
```
[ ] Fashionkas:
    [ ] Install @sovereign/types, @sovereign/auth, @sovereign/integrations
    [ ] Replace existing DB calls dengan @sovereign/db
    [ ] Setup lead capture → POST ke canonical DB
    [ ] Setup CI/CD untuk fashionkas

[ ] Resellerkas:
    [ ] Install @sovereign/types, @sovereign/auth, @sovereign/integrations
    [ ] Replace existing DB calls dengan @sovereign/db
    [ ] Setup reseller signup + order → POST ke canonical DB
    [ ] Setup CI/CD untuk resellerkas

[ ] Verifikasi data dari kedua surface masuk ke canonical DB
```

### Output
- Fashionkas leads → sovereign-main.leads ✅
- Resellerkas orders → sovereign-main.orders ✅
- CI/CD untuk Fashionkas + Resellerkas ✅

### Risk
| Risk | Mitigasi |
|------|---------|
| Breaking changes di app existing | Test di feature branch dulu |
| Data format mismatch | Pakai adapter layer selama transisi |

### Done Criteria
```
✅ Lead dari Fashionkas muncul di sovereign-tower dashboard
✅ Order dari Resellerkas muncul di sovereign-tower dashboard
✅ Brand identity Fashionkas/Resellerkas tidak berubah
✅ CI/CD berjalan untuk kedua app
```

### What NOT to Touch Yet
```
❌ Jangan merge seluruh codebase kedua app ke mother repo
```

---

## 📋 PHASE 5 — DB CONSOLIDATION PER DOMAIN

### Objective
Konsolidasi database — migrasi domain yang mungkin masih di DB terpisah ke canonical bridge.
Domain-by-domain, bukan cut over semua sekaligus.

### Input Docs
- `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` — migration map
- Phase 0 audit results (DB inventory)

### Migration Order
```
Priority 1 (Sprint setelah Phase 3):
  [x] Auth / Users → sudah di sovereign-main (SKIP)
  [x] Core operational → sudah di sovereign-main (SKIP)
  [ ] WA logs → CREATE tabel baru (Sprint 1)
  [ ] AI tasks/insights → CREATE tabel baru (Sprint 1)

Priority 2 (setelah Phase 4):
  [ ] Fashionkas leads → pipe ke sovereign-main (dual-write dulu)
  [ ] Resellerkas data → pipe ke sovereign-main (dual-write dulu)

Priority 3 (optional — setelah Phase 4 stable):
  [ ] Proof entries
  [ ] Decision logs → dari living doc ke DB
  [ ] Weekly reviews → dari living doc ke DB
  [ ] Agent runs / logs
```

### Strategy: Dual-Write Transition
```
Step 1: Setup dual-write di app lama
  → Tulis ke DB lama + kirim copy ke canonical DB

Step 2: Monitor 1 minggu
  → Pastikan data match di kedua DB

Step 3: Switch read ke canonical DB
  → Tapi write masih ke keduanya

Step 4: Matikan write ke DB lama
  → Setelah yakin canonical DB stable
```

### Done Criteria
```
✅ Semua domain yang planned sudah ada di canonical DB
✅ Tidak ada data loss selama migrasi
✅ App existing masih berjalan normal
✅ Audit log migrasi tersimpan di /migration folder
```

---

## 📋 PHASE 6 — AGENT ORCHESTRATION

### Objective
Build dan integrate full agent layer: Scout, Closer, InsightGenerator, MarketValidator.
Agents terkoordinasi lewat canonical DB — bukan isolated.

### Input Docs
- `04-PROMPT-CONTRACT.md` — agent contracts
- `07-MODULE-TASK-BREAKDOWN.md` — Sprint 2-5 tasks
- `08-ACCEPTANCE-CRITERIA.md` — agent acceptance tests

### Tasks
```
[ ] Scout Agent full pipeline (Sprint 2)
    → LangGraph.js ScoutScorer
    → ScraperAPI integration
    → AI scoring + storage

[ ] Closer Agent automation (Sprint 3)
    → MessageComposer LangGraph
    → /api/closer/ai-compose
    → /api/closer/sequence (Day 0/3/7/14)

[ ] Insight Generator (Sprint 4)
    → InsightGenerator LangGraph
    → /api/dashboard/ai-insights
    → Weekly scheduled run

[ ] CrewAI Market Validator (Sprint 4)
    → CrewAI Enterprise API integration
    → /api/ai/crew/market-validation
    → Weekly deep analysis
```

### Done Criteria
```
✅ Semua agent acceptance tests di 08 terpenuhi
✅ Agent runs ter-log ke agent_runs table
✅ AI credits usage ter-track di credit_ledger table
✅ Sovereign Tower bisa monitor semua agent runs
✅ Human gate implemented untuk action irreversible (WA blast)
```

---

## 📋 PHASE 7 — CCA EVIDENCE LAYER

### Objective
Strukturkan semua evidence CCA-F ke dalam vault yang bisa dipakai untuk sertifikasi.
Phase ini berjalan paralel dengan Phase 3-6 — bukan setelah semua selesai.

### Input Docs
- `09-CCA-ALIGNMENT-MAP.md` — domain alignment
- Phase 3-6 outputs (kode, keputusan, acceptance results)

### Tasks
```
[ ] Setup /evidence/cca struktur per domain
[ ] Isi domain-1-agentic.md dengan bukti dari Phase 3-6:
    → Agent architecture decisions
    → Tool use + human gate patterns
    → LangGraph multi-step implementations

[ ] Isi domain-2-responsible.md dengan bukti:
    → Error handling patterns
    → Rate limiting implementation
    → User data protection measures

[ ] Isi domain-3-claude-code.md dengan bukti:
    → Claude Code usage logs (jika ada)
    → MCP implementation (jika ada)

[ ] Isi domain-4-testing.md dengan bukti:
    → Acceptance criteria results
    → Test outputs dari 08-ACCEPTANCE-CRITERIA.md

[ ] Isi domain-5-architecture.md dengan bukti:
    → Multi-app architecture decisions
    → Canonical DB strategy
    → Monorepo governance

[ ] Export portfolio bullets dari evidence vault
[ ] Prepare untuk CCA-F exam Week 12
```

### Done Criteria
```
✅ Semua 5 domain ada evidence yang terdokumentasi
✅ Setiap evidence ada link ke: kode, keputusan, atau test result
✅ Portfolio bullets siap untuk exam
✅ 09-CCA-ALIGNMENT-MAP.md updated dengan evidence references
```

---

## 📊 PHASE DEPENDENCY MAP

```
Phase 0 (Audit)
    └── Phase 1 (Mother Repo Skeleton)
            └── Phase 2 (Shared Packages)
                    ├── Phase 3 (Sovereign Tower) ──── PARALEL ──► Phase 7 (CCA)
                    │       └── Phase 5 (DB Consolidation)
                    └── Phase 4 (Public Surface Integration)
                            └── Phase 5 (DB Consolidation)
                                    └── Phase 6 (Agent Orchestration) ──► Phase 7 (CCA)
```

---

## 🎯 MILESTONE CHECKPOINTS

| Milestone | Phase selesai | Target | Signifikansi |
|-----------|--------------|--------|-------------|
| M0: Audit Complete | Phase 0 | Week 1 | Kita tahu apa yang ada |
| M1: Mother Repo Live | Phase 1 | Week 1 | Canonical home tersedia |
| M2: Shared Core Ready | Phase 2 | Week 2 | Foundation packages siap |
| M3: Tower v4.0 Live | Phase 3 | Week 4 | Private OS upgrade selesai |
| M4: Surfaces Integrated | Phase 4 | Week 6 | Public surfaces nyambung |
| M5: DB Consolidated | Phase 5 | Week 7 | Single source of truth |
| M6: Agents Live | Phase 6 | Week 11 | Full AI automation |
| M7: CCA Evidence Ready | Phase 7 | Week 12 | Siap exam CCA-F |

---

## 📋 PROGRESS TRACKING

Update tabel ini setiap sesi:

| Phase | Start Date | End Date | Owner | Status | Blocker |
|-------|-----------|---------|-------|--------|---------|
| Phase 0 | — | — | Haidar | 🔴 NOT STARTED | — |
| Phase 1 | — | — | AI Dev | 🔴 NOT STARTED | Tunggu Phase 0 |
| Phase 2 | — | — | AI Dev | 🔴 NOT STARTED | Tunggu Phase 1 |
| Phase 3 | — | — | AI Dev | 🔴 NOT STARTED | Fonnte token + LLM key |
| Phase 4 | — | — | AI Dev | 🔴 NOT STARTED | Tunggu Phase 2 |
| Phase 5 | — | — | AI Dev | 🔴 NOT STARTED | Tunggu Phase 3+4 |
| Phase 6 | — | — | AI Dev | 🔴 NOT STARTED | Tunggu Phase 3+5 |
| Phase 7 | — | — | Haidar | 🔴 NOT STARTED | Paralel Phase 3-6 |

---

## 🔗 REFERENSI DOKUMEN TERKAIT

| Phase | Dokumen kunci |
|-------|-------------|
| Phase 0 | `23`, `24`, `25`, `19` |
| Phase 1 | `27`, `26` |
| Phase 2 | `24`, `04`, `03` |
| Phase 3 | `07`, `17`, `08`, `20` |
| Phase 4 | `23`, `26` |
| Phase 5 | `24` |
| Phase 6 | `04`, `07`, `08` |
| Phase 7 | `09` |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Migration Phase Plan v1.0 — 8 phases, milestones, done criteria |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
