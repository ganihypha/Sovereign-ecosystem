# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 27: MOTHER REPO STRUCTURE
# (Target Folder Tree Canonical Mother Repo — AI Dev Tinggal Execute)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"AI dev tidak perlu mulai dari nol mikir folder tree. Dokumen ini adalah target yang sudah disetujui Founder. Tinggal execute."*

---

## 🎯 TUJUAN DOKUMEN INI

Dokumen ini mendefinisikan **target folder tree** dari canonical mother repo.

Ini adalah blueprint teknis untuk:
- AI dev yang akan build mother repo skeleton (Phase 1)
- Siapapun yang perlu tahu di mana sesuatu harus diletakkan
- Governance untuk naming conventions dan package ownership

**PENTING:** Mother repo bukan app yang di-deploy sendiri.
Mother repo adalah **integration home + governance center + shared packages**.

---

## 🌳 TARGET FOLDER TREE

```
sovereign-ecosystem/                    ← ROOT mother repo
│
├── apps/                               ← App repos (bisa submodule atau folder)
│   ├── fashionkas-web/                 ← Public brand surface
│   ├── resellerkas-web/                ← Public reseller surface
│   ├── sovereign-tower/                ← Private founder command center
│   ├── client-workspace/               ← Customer-facing dashboard
│   ├── scout-agent/                    ← LangGraph.js Scout agent app
│   ├── closer-agent/                   ← LangGraph.js Closer agent app
│   └── architect-agent/               ← LangGraph.js Architect agent
│
├── packages/                           ← Shared core (NPM packages internal)
│   ├── db/                             ← DB schema, types, query helpers
│   │   ├── src/
│   │   │   ├── schema.ts               ← Semua table definitions
│   │   │   ├── types.ts                ← DB-level TypeScript types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                           ← JWT validation, role checking
│   │   ├── src/
│   │   │   ├── jwt.ts                  ← JWT sign / verify helpers
│   │   │   ├── roles.ts                ← Role definitions + guards
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                          ← Shared TypeScript types (non-DB)
│   │   ├── src/
│   │   │   ├── api.ts                  ← API request/response types
│   │   │   ├── agents.ts               ← Agent input/output types
│   │   │   ├── business.ts             ← Business domain types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                             ← Shared UI components
│   │   ├── src/
│   │   │   ├── components/             ← Reusable React/HTML components
│   │   │   ├── styles/                 ← Shared CSS / Tailwind config
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── integrations/                   ← External API clients
│   │   ├── src/
│   │   │   ├── supabase.ts             ← Supabase client + helpers
│   │   │   ├── fonnte.ts               ← Fonnte WA API client
│   │   │   ├── scraperapi.ts           ← ScraperAPI Instagram client
│   │   │   ├── openai.ts               ← OpenAI / Groq LLM client
│   │   │   ├── crewai.ts               ← CrewAI integration
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── prompt-contracts/               ← Agent system prompts + output schemas
│   │   ├── src/
│   │   │   ├── scout-scorer.ts         ← ScoutScorer agent prompt + schema
│   │   │   ├── message-composer.ts     ← MessageComposer prompt + schema
│   │   │   ├── insight-generator.ts    ← InsightGenerator prompt + schema
│   │   │   ├── market-validator.ts     ← MarketValidator (CrewAI) prompt
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── analytics/                      ← Metrics, tracking, KPI helpers
│       ├── src/
│       │   ├── events.ts               ← Event tracking helpers
│       │   ├── kpi.ts                  ← KPI calculation functions
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── infra/                              ← Infrastructure config
│   ├── cloudflare/                     ← Cloudflare-specific config
│   │   ├── wrangler.base.jsonc         ← Base wrangler config (extend per app)
│   │   └── _headers                   ← Standard security headers
│   │
│   ├── github-actions/                 ← CI/CD workflows
│   │   ├── deploy-fashionkas.yml
│   │   ├── deploy-resellerkas.yml
│   │   ├── deploy-sovereign-tower.yml
│   │   └── deploy-shared-packages.yml
│   │
│   ├── env-templates/                  ← Env var templates (NO REAL VALUES)
│   │   ├── .env.example                ← Template untuk .dev.vars
│   │   ├── fashionkas.env.example
│   │   ├── resellerkas.env.example
│   │   └── sovereign-tower.env.example
│   │
│   └── workers/                        ← Cloudflare Workers config
│       └── rate-limiter.ts             ← Shared rate limiting worker
│
├── docs/                               ← All sovereign docs (01-29+)
│   ├── 00-MASTER-INDEX.md
│   ├── 01-NORTH-STAR-PRD.md
│   ├── ... (semua dokumen 01-22)
│   ├── 23-REPO-INVENTORY.md
│   ├── 24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
│   ├── 25-DEPLOYMENT-INVENTORY.md
│   ├── 26-CANONICAL-ARCHITECTURE-MAP.md
│   ├── 27-MOTHER-REPO-STRUCTURE.md
│   ├── 28-MIGRATION-PHASE-PLAN.md
│   └── 29-AI-DEV-HANDOFF-PACK.md
│
├── migration/                          ← Migration scripts + audit results
│   ├── audits/                         ← Phase 0 audit results
│   │   ├── repo-audit-2026-04.md
│   │   ├── db-audit-2026-04.md
│   │   └── deployment-audit-2026-04.md
│   │
│   ├── sql/                            ← DB migration SQL scripts
│   │   ├── 001-wa-logs.sql
│   │   ├── 002-ai-tasks.sql
│   │   ├── 003-ai-insights.sql
│   │   └── 004-order-items.sql
│   │
│   └── phase-tracker.md               ← Track progress per migration phase
│
├── evidence/                           ← CCA evidence + architecture proof
│   ├── cca/                            ← CCA-F certification evidence
│   │   ├── domain-1-agentic.md         ← Evidence untuk Domain 1
│   │   ├── domain-2-responsible.md     ← Evidence untuk Domain 2
│   │   ├── domain-3-claude-code.md     ← Evidence untuk Domain 3
│   │   ├── domain-4-testing.md         ← Evidence untuk Domain 4
│   │   └── domain-5-architecture.md   ← Evidence untuk Domain 5
│   │
│   ├── architecture/                   ← Architecture decision records
│   │   ├── ADR-001-cloudflare-stack.md
│   │   ├── ADR-002-monorepo.md
│   │   └── ...
│   │
│   └── screenshots/                    ← Build proof screenshots
│       └── (screenshots go here)
│
├── .github/                            ← GitHub-specific config
│   └── workflows/                      ← CI/CD action files
│
├── turbo.json                          ← Turborepo pipeline config
├── package.json                        ← Root package.json (workspaces)
├── pnpm-workspace.yaml                 ← pnpm workspace config (atau npm)
├── tsconfig.base.json                  ← Base TypeScript config
├── .gitignore                          ← Root gitignore
└── README.md                           ← Ecosystem overview
```

---

## 📦 PACKAGE NAMING CONVENTIONS

```
Pattern: @sovereign/[package-name]

Contoh:
  @sovereign/db
  @sovereign/auth
  @sovereign/types
  @sovereign/ui
  @sovereign/integrations
  @sovereign/prompt-contracts
  @sovereign/analytics
```

---

## 🏷️ NAMING CONVENTIONS — SEMUA KOMPONEN

| Komponen | Convention | Contoh |
|----------|-----------|--------|
| Folder name | kebab-case | `fashionkas-web`, `scout-agent` |
| Package name | `@sovereign/[name]` | `@sovereign/db` |
| Cloudflare project | kebab-case | `fashionkas-web`, `sovereign-tower` |
| DB tables | snake_case | `wa_logs`, `ai_tasks`, `order_items` |
| TypeScript types | PascalCase | `LeadRecord`, `AgentTask` |
| API routes | kebab-case | `/api/scout/gather`, `/api/wa/send` |
| Env vars | UPPER_SNAKE_CASE | `SUPABASE_URL`, `FONNTE_TOKEN` |
| GitHub Actions | kebab-case | `deploy-fashionkas.yml` |

---

## 🔗 PACKAGE OWNERSHIP MAP

| Package | Owner (team/layer) | Konsumer |
|---------|-------------------|---------|
| `@sovereign/db` | Shared Core team | Semua apps + agents |
| `@sovereign/auth` | Shared Core team | Semua apps |
| `@sovereign/types` | Shared Core team | Semua apps + agents |
| `@sovereign/ui` | Shared Core team | fashionkas, resellerkas, client-workspace |
| `@sovereign/integrations` | Shared Core team | sovereign-tower, agent apps |
| `@sovereign/prompt-contracts` | AI/Agent team | scout-agent, closer-agent, architect-agent |
| `@sovereign/analytics` | Shared Core team | fashionkas, resellerkas, sovereign-tower |

---

## 📐 APPS OWNERSHIP MAP

| App Folder | Repo GitHub | Tipe | Deploy Target |
|------------|-------------|------|--------------|
| `apps/fashionkas-web` | ganihypha/Fashionkas | Public surface | Cloudflare Pages |
| `apps/resellerkas-web` | ganihypha/Resellerkas | Public surface | Cloudflare Pages |
| `apps/sovereign-tower` | ganihypha/Sovereign.private.real.busines.orchest | Private | Cloudflare Pages (private) |
| `apps/client-workspace` | NEW | Customer facing | Cloudflare Pages |
| `apps/scout-agent` | Dari sovereign-tower | Agent | Cloudflare Workers |
| `apps/closer-agent` | Dari sovereign-tower | Agent | Cloudflare Workers |
| `apps/architect-agent` | NEW | Agent | Cloudflare Workers |

---

## 🚀 BUILD ORDER (Turborepo Pipeline)

```json
// turbo.json — pipeline build order
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

**Build sequence yang benar:**
```
1. packages/types        (no dependencies)
2. packages/db           (depends on types)
3. packages/auth         (depends on types, db)
4. packages/integrations (depends on types)
5. packages/prompt-contracts (depends on types)
6. packages/ui           (depends on types)
7. packages/analytics    (depends on types, db)
8. apps/*                (depends on all packages)
```

---

## 📋 PHASE 1 CHECKLIST — MOTHER REPO SKELETON

```
[ ] Buat GitHub repo baru: sovereign-ecosystem (private)
[ ] Init Turborepo: npx create-turbo@latest
[ ] Setup folder structure: /apps /packages /infra /docs /migration /evidence
[ ] Buat placeholder packages dengan package.json kosong:
    [ ] packages/db
    [ ] packages/auth
    [ ] packages/types
    [ ] packages/ui
    [ ] packages/integrations
    [ ] packages/prompt-contracts
    [ ] packages/analytics
[ ] Setup tsconfig.base.json
[ ] Setup root .gitignore
[ ] Copy semua docs 00-29 ke /docs
[ ] Setup /infra/env-templates dengan .env.example
[ ] Initial commit dengan message: "feat: sovereign ecosystem mother repo skeleton"
```

---

## ⚠️ RULES UNTUK AI DEV

```
SAAT BUILD MOTHER REPO SKELETON:

1. JANGAN copy paste kode dari repo lama dulu
   → Phase 1 hanya skeleton + placeholder

2. JANGAN langsung integrate DB logic
   → DB schema package dibuat di Phase 2

3. JANGAN deploy apps dulu dari mother repo
   → Apps tetap deploy dari repo original sampai integrasi siap

4. LAKUKAN setup Turborepo + workspace dulu
   → Pastikan packages bisa di-build sebelum apps

5. IKUTI naming conventions yang sudah ditetapkan di atas
   → Jangan improvise naming
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Mother Repo Structure v1.0 — full folder tree + naming conventions |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
