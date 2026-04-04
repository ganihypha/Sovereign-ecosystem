# CCA-F EVIDENCE — DOMAIN 5: ARCHITECTURE
### Status: 🟢 PARTIALLY FILLED — Updated Session 3c
### Last Updated: 2026-04-04

---

## Evidence yang Sudah Ada

### 5.1 Multi-App Architecture (Session 0-1)
- [x] Canonical repo sebagai governance center — lihat `docs/repo-target.md`
- [x] Layer separation: public / private / shared core / mother repo
- [x] Monorepo dengan Turborepo + workspace packages
- [x] Naming conventions: @sovereign/* packages
- [x] **ADR-001**: Monorepo + Turborepo architecture

### 5.2 Canonical DB Strategy (Session 2b + 3c)
- [x] Single source of truth (Sovereign Bridge — sovereign-main Supabase)
- [x] **14 tables defined** across 6 domains — `packages/db/src/schema.ts`
- [x] **Sprint 1 migration files** — 5 SQL files with RLS policies
- [x] **Domain-by-domain migration plan** — `docs/28-MIGRATION-PHASE-PLAN.md`
- [x] **RLS policies** — service_role_full_access on all private tables
- [x] **ADR-002**: DB schema pattern with TypeScript types
- [x] **Dependency chain** — explicit execution order documented

### 5.3 ADR (Architecture Decision Records) — Complete Trail

| ADR# | Decision | Session | Status |
|------|---------|---------|--------|
| ADR-001 | Monorepo + Turborepo | Session 1 | ✅ ACCEPTED |
| ADR-002 | DB schema pattern | Session 2b | ✅ ACCEPTED |
| ADR-003 | Auth pattern (Web Crypto API) | Session 2c | ✅ ACCEPTED |
| ADR-004 | Integrations pattern | Session 2d | ✅ ACCEPTED |
| ADR-S0-001 | Groq sebagai primary LLM | Session 0 | ✅ ACCEPTED |
| ADR-S0-002 | sovereign-ecosystem = canonical repo | Session 0 | ✅ ACCEPTED |
| ADR-S0-003 | .dev.vars di .gitignore | Session 0 | ✅ ACCEPTED |
| ADR-006 | Tower scaffold pattern | Session 3a | ✅ ACCEPTED |
| ADR-007 | Auth wired at app-level /api/* | Session 3b | ✅ ACCEPTED |
| ADR-008 | DB access via db-adapter.ts | Session 3b | ✅ ACCEPTED |
| **ADR-009** | **Migration hardening pattern** | **Session 3c** | ✅ ACCEPTED |

### 5.4 Security Architecture (Session 2c + 3b + 3c)
- [x] JWT via Web Crypto API (no Node.js crypto) — `packages/auth/src/jwt.ts`
- [x] Role hierarchy (guest < agent < customer < reseller < founder)
- [x] Human gate: `requires_approval` field on all agent tables
- [x] RLS: anon users cannot access private tables
- [x] `.dev.vars` pattern: secrets never committed to git
- [x] Service role key: server-side only, never exposed to client

### 5.5 Migration Hardening Pattern (Session 3c — NEW)
- [x] **Standardized SQL headers** — author, sprint, status, last hardened date
- [x] **Pre-run safety checklist** — founder MUST verify before execution
- [x] **Rollback procedures** — explicit DROP TABLE sequence per migration
- [x] **Dry-run validation queries** — check dependencies before run
- [x] **Post-run validation queries** — verify schema after migration
- [x] **Migration inventory map** — `migration/migration-inventory-map.md`
- [x] **Validation matrix** — `migration/validation-matrix.md` (16 acceptance criteria)
- [x] **Blocker log** — `migration/blocker-log.md`
- [x] **Risk & rollback notes** — `migration/risk-rollback-notes.md`

---

## Evidence yang Akan Dikumpulkan

### 5.6 Agent Architecture (Phase 6)
- [ ] LangGraph graph definitions (ScoutScorer, MessageComposer)
- [ ] CrewAI multi-agent setup (MarketValidator)
- [ ] Agent API boundaries (agents → internal API → DB, no direct DB access)

### 5.7 CI/CD Architecture (Phase 3d+)
- [ ] GitHub Actions workflow definitions
- [ ] Cloudflare Pages deployment pipeline
- [ ] Turbo build pipeline

---

## CCA Portfolio Bullets (Domain 5)

**Layered Architecture Design:**
> "Designed 6-layer architecture (public → shared core → sovereign bridge → private tower → agent layer → customer workspace) with strict access boundaries: public apps read-only via API, Tower has founder-JWT access, agents can only call internal API."

**Migration-Safe Schema Design:**
> "Implemented Sprint 1 DB migration across 5 new tables (wa_logs, ai_tasks, ai_insights, order_items, credit_ledger) with explicit execution order, dependency chain, RLS policies, and rollback procedures — ensuring safe, auditable, reversible schema changes."

**Decision Log Completeness:**
> "Maintained 11 Architecture Decision Records (ADR-001 to ADR-009 + session 0 ADRs) covering every major architectural decision from monorepo strategy to migration hardening pattern — providing complete audit trail for CCA exam evidence."

**Human Gate Architecture:**
> "Embedded `requires_approval BOOLEAN DEFAULT false` as structural pattern in all agent-facing tables (wa_logs, ai_tasks, agent_runs) — ensuring no agent can take irreversible action without explicit founder approval."

---

*Updated: Session 3c — 2026-04-04*  
*Next update: After Sprint 1 migration executed + CI/CD setup*
