# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 26: CANONICAL ARCHITECTURE MAP
# (Target Akhir Ecosystem — Source of Truth Arsitektur Post-Migration)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"Ini dokumen 'target akhirnya apa'. Semua orang — termasuk AI dev — harus paham: ini 1 ecosystem, banyak surface, 1 otak pusat. Bukan 1 app monster, bukan repo liar tanpa pusat."*

---

## 🎯 TUJUAN DOKUMEN INI

Dokumen ini adalah **source of truth arsitektur** setelah fase chaos berakhir.

Setiap keputusan teknis harus merujuk ke sini:
- "Komponen ini masuk layer mana?"
- "App ini public atau private?"
- "Data ini siapa yang punya?"
- "Integrasi ini lewat jalur apa?"

**Prinsip utama:**
```
1 Sovereign Ecosystem
1 Canonical Brain (Mother Repo)
1 Canonical Database (Sovereign Bridge)
Banyak App/Surface yang tetap distinct
```

---

## 🗺️ ECOSYSTEM OVERVIEW — BIG PICTURE

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SOVEREIGN ECOSYSTEM v4.0 — TARGET FINAL                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                    PUBLIC LAYER (Market-Facing)                      │    ║
║  │  ┌──────────────────┐          ┌──────────────────────────────────┐ │    ║
║  │  │   Fashionkas      │          │         Resellerkas              │ │    ║
║  │  │  (Brand surface)  │          │      (Reseller surface)          │ │    ║
║  │  │ offer / proof /   │          │  reseller ops / WA commerce /    │ │    ║
║  │  │ lead capture /    │          │  onboarding funnel / products    │ │    ║
║  │  │ market validation │          │                                  │ │    ║
║  │  └────────┬─────────┘          └────────────────┬─────────────────┘ │    ║
║  └───────────┼────────────────────────────────────┼───────────────────┘    ║
║              │ Lead + Order Data                   │ Reseller Data           ║
║              ▼                                     ▼                         ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                   SHARED CORE LAYER                                  │    ║
║  │           (packages/ in Mother Repo — tidak deploy sendiri)          │    ║
║  │  ┌──────┐  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │    ║
║  │  │  db  │  │ auth │  │  types   │  │    ui    │  │ integrations │ │    ║
║  │  └──────┘  └──────┘  └──────────┘  └──────────┘  └──────────────┘ │    ║
║  │  ┌──────────────────┐  ┌────────────────────────────────────────┐  │    ║
║  │  │ prompt-contracts │  │              analytics                  │  │    ║
║  │  └──────────────────┘  └────────────────────────────────────────┘  │    ║
║  └───────────────────────────────────────┬──────────────────────────-─┘    ║
║                                          │                                   ║
║                                          ▼                                   ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │              SOVEREIGN BRIDGE (Canonical Database)                   │    ║
║  │                      Supabase — sovereign-main                       │    ║
║  │  users│leads│customers│orders│products│wa_logs│ai_tasks│ai_insights  │    ║
║  │  proof│decision_logs│weekly_reviews│agent_runs│credit_ledger         │    ║
║  └───────────────────────────────────────────────────────────────────-─┘    ║
║                    ▲                    ▲                   ▲                ║
║                    │                   │                   │                 ║
║  ┌─────────────────┴──┐  ┌────────────┴────────────┐  ┌──┴───────────────┐ ║
║  │  SOVEREIGN TOWER    │  │      AGENT LAYER         │  │ CUSTOMER LAYER   │ ║
║  │  (Private/Founder)  │  │  (AI Orchestration)      │  │  (Gated Access)  │ ║
║  │                     │  │                          │  │                  │ ║
║  │ Sprint Log          │  │ Scout Agent              │  │ Client Workspace │ ║
║  │ Decision Log        │  │ Closer Agent             │  │ Starter Dashbrd  │ ║
║  │ Credential Registry │  │ Architect Agent          │  │ Demo Environment │ ║
║  │ Proof Tracker       │  │ Orchestration Flows      │  │                  │ ║
║  │ Founder Review      │  │ WA Automation            │  │                  │ ║
║  │ AI Resource Mgr     │  │ CrewAI + LangGraph       │  │                  │ ║
║  │ Architecture Ctrl   │  │                          │  │                  │ ║
║  └─────────────────────┘  └──────────────────────────┘  └──────────────────┘ ║
║              ▲                                                                ║
║              │                                                                ║
║  ┌───────────┴──────────────────────────────────────────────────────────┐   ║
║  │                  MOTHER REPO (Canonical Brain)                        │   ║
║  │     Governance + Docs + Migration + Infra + CCA Evidence             │   ║
║  └──────────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📐 LAYER DEFINITIONS

### 🌐 Layer 1 — PUBLIC LAYER (Market-Facing Surfaces)

| App | Role | Audience | Boleh Akses |
|-----|------|----------|-------------|
| **Fashionkas** | Brand + Offer + Proof + Lead Capture | Public (market) | Public data only |
| **Resellerkas** | Reseller Ops + Product Surface + Onboarding | Public (resellers) | Public data only |

**Rules untuk Public Layer:**
- ✅ Nampilin offer, proof, CTA, demo terbatas
- ✅ Lead capture → kirim ke canonical DB via API
- ✅ Pakai shared packages (db, auth, ui, types)
- ❌ TIDAK boleh akses credential registry
- ❌ TIDAK boleh akses sprint log / decision log
- ❌ TIDAK boleh jadi command center

---

### 🔒 Layer 2 — SOVEREIGN TOWER (Private Founder OS)

| Komponen | Fungsi | Access Level |
|----------|--------|-------------|
| **Sprint Log** | Track build progress harian | Founder Only |
| **Decision Log (ADR)** | Record setiap keputusan strategis/teknis | Founder Only |
| **Credential Registry** | Metadata semua API key / secrets | Founder Only |
| **Proof Tracker** | Kumpulkan bukti nyata (screenshot, KPI, revenue) | Founder Only |
| **Founder Review** | Weekly 5-question review | Founder Only |
| **AI Resource Manager** | Track penggunaan AI credits / tokens | Founder Only |
| **Architecture Control** | Governance arsitektur seluruh ecosystem | Founder Only |

**Rules untuk Sovereign Tower:**
- ✅ Founder-only access (PIN + JWT)
- ✅ Read/write ke canonical DB
- ✅ Launch dan monitor AI agents
- ❌ TIDAK boleh accessible dari public internet tanpa auth
- ❌ TIDAK boleh expose credential values

---

### 🤖 Layer 3 — AGENT LAYER (AI Orchestration)

| Agent | Framework | Role | Trigger |
|-------|-----------|------|---------|
| **ScoutScorer** | LangGraph.js (Edge) | Score lead dari Instagram 0-100 | Manual dari Sovereign Tower |
| **MessageComposer** | LangGraph.js (Edge) | Generate WA message otomatis | Manual / Scheduled |
| **InsightGenerator** | LangGraph.js (Edge) | Generate weekly insights | Scheduled |
| **MarketValidator** | CrewAI (External) | Deep market analysis | Scheduled weekly |
| **CloserAgent** | LangGraph.js (Edge) | Auto follow-up sequences | Triggered on lead status |

**Rules untuk Agent Layer:**
- ✅ Akses canonical DB untuk baca/tulis task + insights
- ✅ Pakai prompt contracts dari shared packages
- ✅ Log semua run ke ai_tasks + agent_runs
- ✅ Semua output di-validate sebelum action irreversible
- ❌ TIDAK boleh akses DB langsung tanpa API (kecuali read-only internal)
- ❌ TIDAK boleh kirim WA tanpa approval flow (human gate untuk action besar)

---

### 👥 Layer 4 — CUSTOMER LAYER (Gated Client Access)

| Surface | Role | Audience |
|---------|------|----------|
| **Client Workspace** | Customer dashboard untuk pakai Sovereign Engine service | Paying customers |
| **Starter Dashboard** | Simplified version untuk tier Starter | Tier 1 customers |
| **Demo Environment** | Safe demo space untuk prospects | Prospects (pre-sale) |

---

### 🔗 Layer 5 — SHARED CORE (packages/ in Mother Repo)

| Package | Isi | Dipakai oleh |
|---------|-----|-------------|
| `packages/db` | DB schema, types, query helpers | Semua apps + agents |
| `packages/auth` | JWT validation, role checking | Semua apps |
| `packages/types` | Shared TypeScript types | Semua apps + agents |
| `packages/ui` | Shared UI components | Public surfaces + customer layer |
| `packages/integrations` | Fonnte, Supabase, ScraperAPI, LLM clients | Semua yang butuh external API |
| `packages/prompt-contracts` | Agent system prompts + schemas | Agent layer |
| `packages/analytics` | Metrics, tracking helpers | Public surfaces + tower |

---

### 🏠 Layer 6 — MOTHER REPO (Canonical Brain)

```
Mother Repo bukan app yang di-deploy.
Mother Repo adalah governance center dan integration home.

Isi Mother Repo:
  /apps          → placeholder + link ke app repos
  /packages      → shared packages (YANG INI di-deploy via npm packages)
  /infra         → Cloudflare config, GitHub Actions, env templates
  /docs          → Semua sovereign docs (01-29)
  /migration     → Migration scripts, audit results, phase tracking
  /evidence      → CCA evidence vault, architecture decisions
```

---

## 🔄 DATA FLOW MAP

```
LEAD CAPTURE FLOW:
  User di Fashionkas ──► Submit form
  → POST /api/leads (Fashionkas API)
  → INSERT leads table (sovereign-main DB)
  → Trigger: notify Sovereign Tower

SCOUT AGENT FLOW:
  Founder di Tower ──► Click "Gather Leads"
  → GET /api/scout/gather
  → ScouterAgent (LangGraph) ──► ScraperAPI
  → AI Score leads ──► INSERT leads with score
  → Sovereign Tower dashboard update

CLOSER FLOW:
  Founder select lead ──► "AI Compose + Send"
  → POST /api/closer/ai-compose (MessageComposer)
  → Generate message ──► Preview to Founder
  → Founder approve ──► POST Fonnte API
  → Log to wa_logs ──► Update lead status

CUSTOMER ONBOARDING FLOW:
  Prospect → Demo → Purchase
  → Customer record created (sovereign-main.customers)
  → Customer workspace provisioned
  → Subset data accessible via customer dashboard
```

---

## 🛡️ SECURITY BOUNDARIES

```
PUBLIC  ──────────► SHARED CORE ──────────► CANONICAL DB
  │                                              ▲
  │ (public data only)                           │
  └──────────────────────────────────────────────┘

SOVEREIGN TOWER ──► API GATEWAY ──────────► CANONICAL DB
  │                    │
  │ (auth required)    │ (rate limited)
  └────────────────────┘

AGENT LAYER ──────► API (internal) ────────► CANONICAL DB
  │                    │
  │ (service auth)     │ (write restricted)
  └────────────────────┘
```

**Public surface TIDAK PERNAH punya direct DB access.**
**Semua akses lewat API layer.**

---

## 🗂️ WHAT IS MULTI-APP, WHAT IS SHARED

| Komponen | Multi-App (tetap distinct) | Shared (di packages/) |
|----------|---------------------------|----------------------|
| Brand identity | ✅ Fashionkas, Resellerkas, dll tetap brand sendiri | — |
| UI components | Boleh punya custom UI | Shared base component |
| Business logic | Spesifik per app | — |
| DB schema | — | ✅ Shared via packages/db |
| Auth logic | — | ✅ Shared via packages/auth |
| Type definitions | — | ✅ Shared via packages/types |
| External API clients | — | ✅ Shared via packages/integrations |
| Prompt contracts | — | ✅ Shared via packages/prompt-contracts |
| Infrastructure config | — | ✅ Shared via /infra |

---

## 📍 CURRENT vs TARGET STATE

| Aspek | Current (April 2026) | Target (Post-Migration) |
|-------|---------------------|------------------------|
| Repo | 4 repo liar terpisah | 1 mother repo + 4 app repos terintegrasi |
| Database | sovereign-main (8 tabel) + kemungkinan DB lain | 1 canonical Sovereign Bridge |
| Auth | JWT di sovereign-orchestrator | Shared auth package |
| Types | Per-app types | Shared types package |
| Deployment | Manual wrangler per app | GitHub Actions CI/CD |
| Agent orchestration | LangGraph per agent | Unified agent layer |
| Evidence | Tersebar di berbagai dokumen | Terpusat di /evidence |

---

## ⚠️ ANTI-PATTERNS — YANG TIDAK BOLEH DILAKUKAN

```
❌ JANGAN jadikan Fashionkas / Resellerkas sebagai control center
❌ JANGAN expose credential registry ke public surface
❌ JANGAN merge semua DB tanpa domain-by-domain migration plan
❌ JANGAN rebuild semua app sekaligus
❌ JANGAN bikin agent yang bisa aksi irreversible tanpa human gate
❌ JANGAN duplicate auth logic di tiap app
❌ JANGAN simpan env vars / secrets di kode atau public repo
❌ JANGAN override keputusan di 19-DECISION-LOG.md tanpa ADR baru
```

---

## 🔗 REFERENSI DOKUMEN TERKAIT

| Butuh info tentang | Buka dokumen ini |
|-------------------|------------------|
| Daftar semua repo + keputusan | `23-REPO-INVENTORY.md` |
| Database canonical + migration map | `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` |
| Deployment tiap app | `25-DEPLOYMENT-INVENTORY.md` |
| Folder tree mother repo | `27-MOTHER-REPO-STRUCTURE.md` |
| Urutan phase migration | `28-MIGRATION-PHASE-PLAN.md` |
| Cara AI dev baca semua ini | `29-AI-DEV-HANDOFF-PACK.md` |
| Architecture brief original | `02-SYSTEM-ARCHITECTURE-BRIEF.md` |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Canonical Architecture Map v1.0 — full ecosystem target + layer definitions |

**Catatan Governance Layer (update 2026-04-06):** Layer 7 diperluas dengan docs 35–37 — lihat `00-MASTER-INDEX.md` untuk daftar lengkap.

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
