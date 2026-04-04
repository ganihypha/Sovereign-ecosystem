# SOVEREIGN BUSINESS ENGINE v4.0
# MIGRATION VALIDATION MATRIX
## Session 3c — Sprint 1 DB Migration
### Date: 2026-04-04 | Status: DRY-RUN READY (not yet executed)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY

---

> **Instruksi**: Centang setiap baris setelah migration dijalankan dan diverifikasi.
> Jangan klaim VERIFIED sampai query validation di kolom terakhir benar-benar dijalankan.

---

## SECTION A: Migration File Validation

| AC# | Check Item | Migration File | Expected Result | Status | Verified By |
|-----|-----------|----------------|-----------------|--------|-------------|
| A-01 | File 001-wa-logs.sql exists | `migration/sql/001-wa-logs.sql` | File present, non-empty | ✅ FILE EXISTS | AI Dev (3c) |
| A-02 | File 002-ai-tasks.sql exists | `migration/sql/002-ai-tasks.sql` | File present, non-empty | ✅ FILE EXISTS | AI Dev (3c) |
| A-03 | File 003-ai-insights.sql exists | `migration/sql/003-ai-insights.sql` | File present, non-empty | ✅ FILE EXISTS | AI Dev (3c) |
| A-04 | File 004-order-items.sql exists | `migration/sql/004-order-items.sql` | File present, non-empty | ✅ FILE EXISTS | AI Dev (3c) |
| A-05 | File 005-credit-ledger.sql exists | `migration/sql/005-credit-ledger.sql` | File present, non-empty | ✅ NEW FILE CREATED | AI Dev (3c) |
| A-06 | All files have pre-run checklist | All 5 files | Header + checklist block | ✅ PRESENT | AI Dev (3c) |
| A-07 | All files have rollback instructions | All 5 files | ROLLBACK section | ✅ PRESENT | AI Dev (3c) |
| A-08 | All files have post-run validation queries | All 5 files | POST-RUN VALIDATION section | ✅ PRESENT | AI Dev (3c) |
| A-09 | Migration inventory map created | `migration/migration-inventory-map.md` | File present | ✅ CREATED | AI Dev (3c) |

---

## SECTION B: Schema Alignment Validation

| AC# | Check Item | SQL Column | TS Type Field | Match? | Notes |
|-----|-----------|------------|---------------|--------|-------|
| B-01 | wa_logs.direction CHECK | `'outbound','inbound'` | `WaLogsTable.Row.direction` | ✅ ALIGNED | — |
| B-02 | wa_logs.status CHECK | `'pending','sent','delivered','read','failed','rejected_by_founder'` | `WaLogsTable.Row.status` | ✅ ALIGNED | — |
| B-03 | wa_logs.requires_approval DEFAULT | `false` | `WaLogsTable.Insert.requires_approval?` | ✅ ALIGNED | HUMAN GATE intact |
| B-04 | wa_logs.sent_by CHECK | `'founder','agent','system'` | `WaLogsTable.Row.sent_by` | ✅ ALIGNED | — |
| B-05 | ai_tasks.agent CHECK | 5 agent types | `AgentType` union in `@sovereign/types` | ✅ ALIGNED | — |
| B-06 | ai_tasks.status CHECK | 7 status values | `AgentStatus` in `@sovereign/types` | ✅ ALIGNED | — |
| B-07 | ai_tasks.triggered_by CHECK | `'founder','system','schedule','agent_chain'` | `AITasksTable.Row.triggered_by` | ✅ ALIGNED | — |
| B-08 | ai_tasks.requires_approval DEFAULT | `false` | `AITasksTable.Insert.requires_approval?` | ✅ ALIGNED | HUMAN GATE intact |
| B-09 | ai_insights.agent CHECK | Same 5 agents | `AgentType` union | ✅ ALIGNED | — |
| B-10 | ai_insights.insight_type CHECK | 5 insight types | `AIInsightsTable.Row.insight_type` | ✅ ALIGNED | — |
| B-11 | ai_insights.priority CHECK | `'low','medium','high','critical'` | `AIInsightsTable.Row.priority` | ✅ ALIGNED | — |
| B-12 | order_items.subtotal CHECK | `>= 0 INTEGER` | `OrderItemsTable.Row.subtotal` | ✅ ALIGNED | Rupiah INTEGER |
| B-13 | order_items.unit_price CHECK | `>= 0 INTEGER` | `OrderItemsTable.Row.unit_price` | ✅ ALIGNED | Rupiah INTEGER |
| B-14 | credit_ledger.service CHECK | 7 service values | `CreditLedgerTable.Row.service` | ✅ ALIGNED | — |

---

## SECTION C: RLS (Row Level Security) Validation

| AC# | Table | RLS Enabled? | Policy Name | Scope | Status |
|-----|-------|-------------|-------------|-------|--------|
| C-01 | `wa_logs` | Must be TRUE | `service_role_full_access` | service_role only | ⏳ VERIFY AFTER RUN |
| C-02 | `ai_tasks` | Must be TRUE | `service_role_full_access` | service_role only | ⏳ VERIFY AFTER RUN |
| C-03 | `ai_insights` | Must be TRUE | `service_role_full_access` | service_role only | ⏳ VERIFY AFTER RUN |
| C-04 | `order_items` | Must be TRUE | `service_role_full_access` | service_role only | ⏳ VERIFY AFTER RUN |
| C-05 | `credit_ledger` | Must be TRUE | `service_role_full_access` | service_role only | ⏳ VERIFY AFTER RUN |

**Validation Query** (run di Supabase SQL Editor setelah migration):
```sql
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('wa_logs', 'ai_tasks', 'ai_insights', 'order_items', 'credit_ledger');
-- Expected: all 5 rows with relrowsecurity = TRUE
```

---

## SECTION D: Auth Impact Validation

| AC# | Check Item | Impact on Tower | Action Required | Status |
|-----|-----------|-----------------|-----------------|--------|
| D-01 | wa_logs created → WA routes | WA routes still BLOCKED | FONNTE_TOKEN needed separately | ✅ NO IMPACT (routes already guarded) |
| D-02 | ai_tasks created → ai-resource-manager | Module can now query real data | Wire module to ai_tasks after migration | ⏳ PENDING (needs module update) |
| D-03 | credit_ledger created → ai-resource-manager | Module can show cost data | Wire module to credit_ledger | ⏳ PENDING (needs module update) |
| D-04 | JWT auth remains unchanged | @sovereign/auth not touched | None | ✅ NO IMPACT |
| D-05 | db-adapter.ts fallback behavior | Returns null_db gracefully if table missing | None needed — fallback already coded | ✅ SAFE FALLBACK EXISTS |

---

## SECTION E: Fallback Behavior Validation

| AC# | Scenario | Expected Behavior | Code Location | Status |
|-----|---------|-------------------|---------------|--------|
| E-01 | SUPABASE_URL missing | Returns empty data, no crash | `db-adapter.ts:hasDbCredentials()` | ✅ IMPLEMENTED |
| E-02 | Table doesn't exist yet | Returns `{data:null, error}`, handled gracefully | `db-adapter.ts:try/catch` | ✅ IMPLEMENTED |
| E-03 | Invalid JWT | 401 Unauthorized response | `@sovereign/auth:jwtMiddleware()` | ✅ IMPLEMENTED |
| E-04 | Non-founder role JWT | 403 Forbidden response | `@sovereign/auth:founderOnly()` | ✅ IMPLEMENTED |
| E-05 | FONNTE_TOKEN missing | WA routes return 503 placeholder | `src/routes/modules.ts` | ✅ PLACEHOLDER |

---

## SECTION F: Environment Dependencies

| AC# | Variable | Required For | Current Status | Blocker? |
|-----|---------|-------------|----------------|---------|
| F-01 | `SUPABASE_URL` | All DB operations | ⚠️ Empty in .dev.vars (template only) | YES — for local test |
| F-02 | `SUPABASE_ANON_KEY` | Public reads | ⚠️ Empty in .dev.vars (template only) | YES — for local test |
| F-03 | `SUPABASE_SERVICE_ROLE_KEY` | All Tower DB ops | ⚠️ Empty in .dev.vars (template only) | YES — for DB write |
| F-04 | `JWT_SECRET` | Auth verification | ⚠️ Empty in .dev.vars (template only) | YES — for any auth test |
| F-05 | `FONNTE_TOKEN` | WA routes | 🔴 MISSING | YES — WA only (not DB) |
| F-06 | `GROQ_API_KEY` | AI agent runs | ⚠️ May be available | NO — not Sprint 1 |
| F-07 | `CLOUDFLARE_ACCOUNT_ID` | Deployment | ⚠️ Not needed for local | NO — deploy only |

---

## SECTION G: Acceptance Criteria (AC-01 to AC-16)

| AC# | Criterion | Status | Evidence |
|-----|-----------|--------|---------|
| AC-01 | 5 migration files ready in `migration/sql/` | ✅ DONE | 001-005 all present |
| AC-02 | 005-credit-ledger.sql gap filled | ✅ DONE | New file created |
| AC-03 | All files have pre-run checklists | ✅ DONE | All 5 files verified |
| AC-04 | All files have rollback instructions | ✅ DONE | All 5 files verified |
| AC-05 | Migration inventory map created | ✅ DONE | `migration/migration-inventory-map.md` |
| AC-06 | Validation matrix created | ✅ DONE | This document |
| AC-07 | Blocker log created | ✅ DONE | `migration/blocker-log.md` |
| AC-08 | Risk & rollback artifact created | ✅ DONE | `migration/risk-rollback-notes.md` |
| AC-09 | SQL aligned with @sovereign/db schema.ts | ✅ DONE | Section B above |
| AC-10 | RLS enabled on all 5 new tables | ⏳ VERIFY AFTER RUN | SQL ready, not yet executed |
| AC-11 | No secrets committed to git | ✅ DONE | Only SQL and docs files |
| AC-12 | No Fonnte activation | ✅ DONE | WA routes remain placeholder |
| AC-13 | No live Supabase migration executed | ✅ DONE | Dry-run only |
| AC-14 | TypeScript zero errors (from Session 3b) | ✅ MAINTAINED | Not touched in Session 3c |
| AC-15 | CCA evidence artifacts updated | ✅ DONE | evidence/ directory updated |
| AC-16 | Session 3c docs updated | ✅ DONE | session-3c-summary.md etc |

---

*Document generated: Session 3c — 2026-04-04*
