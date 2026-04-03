# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 23: REPO INVENTORY
# (Inventaris Semua Repo — Siapa Jadi Apa, Keputusan Migrasi)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"Kalau AI dev tidak tahu repo mana yang jadi otak dan mana yang jadi wajah, dia akan salah ngira semua repo sederajat. Dokumen ini mencegah itu."*

---

## 🎯 TUJUAN DOKUMEN INI

Dokumen ini adalah **inventory resmi** dari semua repo yang ada di Sovereign Ecosystem.
Dibuat SEBELUM migrasi dimulai — bukan setelah.

**AI Dev WAJIB baca dokumen ini sebelum menyentuh repo mana pun.**

Pertanyaan yang dijawab dokumen ini:
- Repo mana itu brand surface (public)?
- Repo mana itu private control tower (founder-only)?
- Repo mana itu canonical integration home?
- Repo mana yang chaos / legacy?
- Keputusan per repo: keep / integrate / strengthen / archive / rewrite?

---

## 📋 REPO INVENTORY TABLE

| # | Nama Repo | GitHub URL | Role / Fungsi | Public/Private | Stack (Current) | Deploy URL | Status | Keputusan |
|---|-----------|------------|---------------|----------------|-----------------|------------|--------|-----------|
| 1 | **Fashionkas** | https://github.com/ganihypha/Fashionkas.git | Public brand / sales surface / market validation lab / lead capture / offer display | Public | Next.js / Hono (TBD) | TBD | Active | ✅ KEEP + Integrate ke mother repo |
| 2 | **Resellerkas** | https://github.com/ganihypha/Resellerkas.git | Public niche product surface / reseller ops / WA commerce / onboarding funnel | Public | TBD | TBD | Active | ✅ KEEP + Integrate ke mother repo |
| 3 | **Sovereign.private.real.busines.orchest** | https://github.com/ganihypha/Sovereign.private.real.busines.orchest.git | Private founder OS / command center / sprint log / decision log / proof tracker / agent orchestration | Private | Hono + Cloudflare Pages + Supabase | https://sovereign-orchestrator.pages.dev | ✅ LIVE (v3.0) | ✅ KEEP + Strengthen — jadi Sovereign Tower |
| 4 | **sovereign-command-center** | (Deployment URL) | Deployment shell / access layer / hybrid gateway untuk public + private + customer workspace | Public Deploy | Cloudflare Pages | https://sovereign-command-center.pages.dev | Active | ✅ KEEP sebagai access/deployment layer |
| 5 | **Mother Repo (NEW)** | Perlu dibuat | Canonical monorepo integration home / governance center / shared packages / infra / docs / migration | Private | Turborepo (target) | TBD | 🔴 BELUM ADA | 🔨 CREATE — ini yang dibuat di Phase 1 |

---

## 🧠 ROLE MAP — SIAPA JADI APA

```
SOVEREIGN ECOSYSTEM
│
├── 🌐 PUBLIC LAYER (Market-facing)
│   ├── Fashionkas          → Brand + Offer + Proof + Lead Capture
│   └── Resellerkas         → Reseller Workflow + Product Surface + Onboarding
│
├── 🔒 PRIVATE LAYER (Founder-only)
│   └── Sovereign.private.real.busines.orchest
│                           → Sprint Log + Decision Log + Credential Registry
│                           → Proof Tracker + Founder Review + AI Resource Manager
│                           → Orchestration Control + Architecture Governance
│
├── 🚪 GATEWAY LAYER (Access / Deployment)
│   └── sovereign-command-center
│                           → Public pages + Gated customer workspace + Founder tower access
│
└── 🏠 INTEGRATION HOME (Canonical Brain)
    └── Mother Repo (NEW)   → Governance + Shared Packages + Infra + Docs
                            → Migration Layer + CCA Evidence + Execution Prompts
```

---

## 📌 DECISION MATRIX PER REPO

### Repo 1 — Fashionkas
| Atribut | Detail |
|---------|--------|
| **Role Final** | Public commercial front / market lab |
| **Layer** | Bridge Layer (cashflow + market validation) |
| **Tetap standalone?** | Yes — brand identity tetap sendiri |
| **Integrasi ke mother repo?** | Yes — via shared packages (db, auth, types, ui) |
| **DB connection** | → nulis lead data ke canonical bridge DB |
| **Keputusan** | ✅ KEEP + integrate shared core pelan-pelan |
| **Yang TIDAK boleh:** | Jangan jadikan brain / command center |
| **Prioritas integrasi** | Phase 3 (setelah mother repo + shared core siap) |

### Repo 2 — Resellerkas
| Atribut | Detail |
|---------|--------|
| **Role Final** | Public niche product surface / reseller ops |
| **Layer** | Bridge Layer (cashflow + reseller channel) |
| **Tetap standalone?** | Yes — brand identity tetap sendiri |
| **Integrasi ke mother repo?** | Yes — via shared packages |
| **DB connection** | → nulis reseller/order data ke canonical bridge DB |
| **Keputusan** | ✅ KEEP + integrate shared core pelan-pelan |
| **Yang TIDAK boleh:** | Jangan jadikan control tower |
| **Prioritas integrasi** | Phase 3 (bersamaan Fashionkas) |

### Repo 3 — Sovereign.private.real.busines.orchest
| Atribut | Detail |
|---------|--------|
| **Role Final** | Founder-only private OS / control tower |
| **Layer** | Brain + Foundation Layer |
| **Tetap standalone?** | Yes — tetap private, TIDAK boleh dipublish |
| **Integrasi ke mother repo?** | Partial — shared packages, tapi governance tetap di sini |
| **DB connection** | → canonical bridge DB sebagai single source of truth |
| **Keputusan** | ✅ KEEP + Strengthen (upgrade ke full Sovereign Tower v4.0) |
| **Yang TIDAK boleh:** | Jangan expose credential / decision log ke public |
| **Prioritas** | Phase 2 — Sovereign Tower hardening |

### Repo 4 — sovereign-command-center
| Atribut | Detail |
|---------|--------|
| **Role Final** | Hybrid shell / deployment + access gateway |
| **Layer** | Access Layer |
| **Tetap standalone?** | Yes — ini gateway, bukan app |
| **Integrasi ke mother repo?** | Light integration — env + deploy config |
| **Keputusan** | ✅ KEEP sebagai deployment access layer |
| **Prioritas** | Phase 4 — setelah surfaces terintegrasi |

### Repo 5 — Mother Repo (NEW — Canonical Home)
| Atribut | Detail |
|---------|--------|
| **Role Final** | Canonical monorepo integration home |
| **Layer** | Foundation Layer — OTAK PUSAT |
| **Isi awal** | /docs, /apps (placeholder), /packages (placeholder), /infra, /migration, /evidence |
| **Stack target** | Turborepo + TypeScript |
| **Keputusan** | 🔨 CREATE di Phase 1 (PRIORITAS UTAMA) |
| **Yang TIDAK boleh:** | Jangan isi dengan code app dulu — fokus ke governance + shared packages dulu |
| **Prioritas** | Phase 0–1 — PALING PERTAMA dibangun |

---

## ⚠️ ATURAN WAJIB UNTUK AI DEV

```
SEBELUM menyentuh repo mana pun, AI Dev WAJIB tahu:

1. Mother Repo = otak pusat governance (bukan app)
2. Fashionkas / Resellerkas = public surfaces (jangan diisi logic internal)
3. Sovereign.private.real.busines.orchest = PRIVATE command center (jangan pernah expose)
4. JANGAN merge semua repo sekaligus
5. JANGAN rebuild dari nol
6. JANGAN gabungkan credential/decision log ke public repo
7. Strategi = integrate first, rebuild later only if needed
8. Migrasi dilakukan PELAN-PELAN, domain-by-domain
```

---

## 🔗 REFERENSI DOKUMEN TERKAIT

| Butuh info tentang | Buka dokumen ini |
|-------------------|------------------|
| Target architecture akhir | `26-CANONICAL-ARCHITECTURE-MAP.md` |
| Database mana yang canonical | `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` |
| Deployment tiap repo | `25-DEPLOYMENT-INVENTORY.md` |
| Urutan migrasi per phase | `28-MIGRATION-PHASE-PLAN.md` |
| Cara baca semua doc ini | `29-AI-DEV-HANDOFF-PACK.md` |
| Folder tree target mother repo | `27-MOTHER-REPO-STRUCTURE.md` |

---

## 📊 STATUS AUDIT

| Item | Status | Catatan |
|------|--------|---------|
| Fashionkas — repo exist? | ⚠️ PERLU VERIFIKASI | Update saat audit |
| Fashionkas — stack confirmed? | 🔴 BELUM | Isi saat audit Phase 0 |
| Resellerkas — repo exist? | ⚠️ PERLU VERIFIKASI | Update saat audit |
| Sovereign.private — LIVE? | ✅ YES | https://sovereign-orchestrator.pages.dev |
| sovereign-command-center — LIVE? | ✅ YES | https://sovereign-command-center.pages.dev |
| Mother Repo — created? | 🔴 BELUM ADA | Target: Phase 1 |

> 📝 **NOTE:** Isi kolom "Stack (Current)" dan "Deploy URL" saat Phase 0 Audit selesai.
> Bagian yang belum terisi adalah tugas audit, BUKAN hambatan untuk mulai.

---

## 📋 CHECKLIST PHASE 0 AUDIT

```
[ ] Cek Fashionkas repo — akses OK? Stack apa? Deploy URL?
[ ] Cek Resellerkas repo — akses OK? Stack apa? Deploy URL?
[ ] Verifikasi sovereign-orchestrator.pages.dev masih live
[ ] Verifikasi sovereign-command-center.pages.dev masih live
[ ] Buat Mother Repo di GitHub (private)
[ ] Set canonical mother repo URL di semua dokumen migrasi
[ ] Update tabel di atas setelah audit
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Repo Inventory v1.0 — initial audit + migration decisions |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
