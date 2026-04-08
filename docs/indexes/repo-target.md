# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOCS: REPO TARGET
# (Penetapan Canonical Repo, Boundary Kerja, Layer & Role)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Session: 0 | Tanggal: 2026-04-03 | Versi: 1.0

---

## 🎯 CANONICAL REPO

```
URL       : https://github.com/ganihypha/sovereign-ecosystem
Tipe      : Private GitHub Repository
Role      : Canonical Mother Repo / Governance Center / Integration Home
Owner     : ganihypha (Haidar Faras Maulia)
Status    : AKTIF — repo target seluruh session migrasi
```

---

## 🧠 ROLE REPO INI

Repo `sovereign-ecosystem` adalah **otak pusat** dari seluruh Sovereign Ecosystem.

Ini **bukan** app yang di-deploy sendiri.
Ini adalah **integration home + governance center + shared packages**.

```
sovereign-ecosystem/
│
├── docs/          ← Semua 29 dokumen strategis + operasional
├── packages/      ← Shared core packages (@sovereign/*)
├── apps/          ← Placeholder link ke semua app repos
├── infra/         ← Cloudflare config, GitHub Actions, env templates
├── migration/     ← Migration scripts, audit, phase tracker
└── evidence/      ← CCA-F evidence vault + architecture decisions
```

---

## 🗺️ ECOSYSTEM LAYER MAP

| Layer | Repo / Komponen | Role | Public/Private |
|-------|----------------|------|----------------|
| **Mother Repo** | `sovereign-ecosystem` (REPO INI) | Governance center + Integration home | Private |
| **Public Surface** | `ganihypha/Fashionkas` | Brand + Offer + Lead Capture | Public |
| **Public Surface** | `ganihypha/Resellerkas` | Reseller Ops + Onboarding | Public |
| **Private Tower** | `ganihypha/Sovereign.private.real.busines.orchest` | Founder-only Command Center | Private |
| **Access Gateway** | `sovereign-command-center` | Deployment + Access layer | Public Deploy |

---

## ✅ IN SCOPE — Yang Boleh Dikerjakan di Repo Ini

```
✅ /docs           → Semua 29 dokumen strategis (copy + update)
✅ /infra          → Env templates, GitHub Actions skeleton, wrangler base config
✅ /migration      → Phase tracker, audit logs, SQL migration scripts
✅ /evidence       → CCA-F domain evidence files, ADR (Architecture Decision Records)
✅ /packages       → Shared core package skeletons (placeholder dulu di Phase 0-1)
✅ /apps           → Placeholder folders saja (bukan kode app actual)
✅ README.md       → Ecosystem overview
✅ .gitignore      → Root gitignore (WAJIB: .dev.vars tidak boleh commit)
✅ turbo.json      → Turborepo pipeline config (Phase 1)
✅ tsconfig.base   → Base TypeScript config (Phase 1)
```

---

## ❌ OUT OF SCOPE — Yang TIDAK Boleh Disentuh di Repo Ini

```
❌ Kode app production dari Fashionkas / Resellerkas
❌ Kode app production dari sovereign-orchestrator (Sovereign Tower)
❌ Live DB mutations (INSERT/UPDATE/DELETE ke production Supabase)
❌ Deploy app baru ke Cloudflare Pages dari repo ini (belum Phase 3+)
❌ Credential/secret asli (tidak boleh commit ke repo mana pun)
❌ Merge / overwrite repo lama sebelum audit selesai
❌ Refactor public app UI/UX (bukan scope migration)
```

---

## 🔒 BOUNDARY — Aturan Keras per Komponen

### Mother Repo (Repo Ini)
```
- BOLEH: governance, docs, shared packages, env templates, migration tracking
- TIDAK BOLEH: isi kode app, deploy langsung, simpan secret asli
```

### Fashionkas
```
- LAYER: Public Surface (market-facing)
- BOLEH: offer, proof, lead capture, shared packages (Phase 4)
- TIDAK BOLEH: akses credential registry, jadi command center, decision log
```

### Resellerkas
```
- LAYER: Public Surface (market-facing)
- BOLEH: reseller ops, onboarding, shared packages (Phase 4)
- TIDAK BOLEH: akses private OS, expose internal API tanpa auth
```

### Sovereign.private.real.busines.orchest (Tower)
```
- LAYER: Private Founder OS
- BOLEH: sprint log, decision log, AI agents, credential registry
- TIDAK BOLEH: diakses public tanpa auth, expose credential values, di-merge ke public repo
```

### sovereign-command-center
```
- LAYER: Access Gateway / Deployment Layer
- BOLEH: public pages, founder tower access (gated), CI/CD config
- TIDAK BOLEH: jadi brain/control center, simpan logic bisnis
```

---

## 📊 PHASE AKTIF SEKARANG

```
PHASE AKTIF  : SESSION 0 (Pre-Build Governance)
FOKUS        : Repo target, credential map, env template
PHASE NEXT   : Phase 1 — Mother Repo Skeleton (Turborepo + folder tree)

DEPENDENCY:
  Session 0 selesai → lanjut Phase 1 → lanjut Phase 2 → Phase 3-4 paralel
  Jangan skip phase. Jangan lompat ke Phase 3 sebelum Phase 1 solid.
```

---

## 🔗 REFERENSI DOKUMEN

| Butuh info tentang | Dokumen |
|-------------------|---------|
| Inventaris semua repo | `docs/23-REPO-INVENTORY.md` |
| Target akhir ecosystem | `docs/26-CANONICAL-ARCHITECTURE-MAP.md` |
| Folder tree mother repo | `docs/27-MOTHER-REPO-STRUCTURE.md` |
| Urutan phase migrasi | `docs/28-MIGRATION-PHASE-PLAN.md` |
| Aturan AI dev | `docs/29-AI-DEV-HANDOFF-PACK.md` |
| Credential & env vars | `docs/credential-map.md` (file ini satu paket) |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Session 0 — Repo Target v1.0 |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
