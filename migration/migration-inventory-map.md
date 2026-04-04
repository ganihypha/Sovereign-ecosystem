# SOVEREIGN BUSINESS ENGINE v4.0
# MIGRATION INVENTORY MAP
## Session 3c — DB Migration Hardening
### Date: 2026-04-04 | Author: AI Developer (via Session 3c)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL

---

> **Tujuan dokumen ini**: Menyediakan peta lengkap semua migration file yang ada, statusnya, dan dependency-nya. Digunakan sebagai sumber kebenaran sebelum founder menjalankan migration di Supabase.

---

## 📊 MIGRATION FILES OVERVIEW

| # | File | Table | Domain | Sprint | Status | Gap? |
|---|------|-------|--------|--------|--------|------|
| 001 | `migration/sql/001-wa-logs.sql` | `wa_logs` | 3 — WA Automation | Sprint 1 | ✅ READY (hardened) | — |
| 002 | `migration/sql/002-ai-tasks.sql` | `ai_tasks` | 4 — AI Agent State | Sprint 1 | ✅ READY (hardened) | — |
| 003 | `migration/sql/003-ai-insights.sql` | `ai_insights` | 4 — AI Agent State | Sprint 1 | ✅ READY (hardened) | — |
| 004 | `migration/sql/004-order-items.sql` | `order_items` | 2 — Commerce Core | Sprint 1 | ✅ READY (hardened) | — |
| 005 | `migration/sql/005-credit-ledger.sql` | `credit_ledger` | 6 — Agent Ops | Sprint 1 | ✅ NEW (gap filled) | Was missing |

**Total files**: 5 (4 pre-existing hardened + 1 new gap-fill)

---

## 🗂️ TABLE STATUS MAP (Sprint 1 Target)

| Table | Domain | DB Status | Migration File | Pre-requisites | Type |
|-------|--------|-----------|----------------|----------------|------|
| `users` | 1 — Identity | ✅ LIVE | N/A (already live) | — | Existing |
| `leads` | 2 — Commerce | ✅ LIVE | N/A (already live) | — | Existing |
| `customers` | 2 — Commerce | ✅ LIVE | N/A (already live) | — | Existing |
| `products` | 2 — Commerce | ✅ LIVE | N/A (already live) | — | Existing |
| `orders` | 2 — Commerce | ✅ LIVE | N/A (already live) | — | Existing |
| `order_items` | 2 — Commerce | 🔴 PLANNED | `004-order-items.sql` | orders, products LIVE | New Sprint 1 |
| `wa_logs` | 3 — WA Auto | 🔴 PLANNED | `001-wa-logs.sql` | users, leads, customers LIVE | New Sprint 1 |
| `ai_tasks` | 4 — AI | 🔴 PLANNED | `002-ai-tasks.sql` | wa_logs, leads, orders LIVE | New Sprint 1 |
| `ai_insights` | 4 — AI | 🔴 PLANNED | `003-ai-insights.sql` | ai_tasks | New Sprint 1 |
| `credit_ledger` | 6 — Agent Ops | 🔴 PLANNED | `005-credit-ledger.sql` | ai_tasks | New Sprint 1 |
| `decision_logs` | 5 — Governance | 🔴 FUTURE | Not yet created | — | Phase 3+ |
| `proof_entries` | 5 — Governance | 🔴 FUTURE | Not yet created | — | Phase 3+ |
| `weekly_reviews` | 5 — Governance | 🔴 FUTURE | Not yet created | — | Phase 3+ |
| `agent_runs` | 6 — Agent Ops | 🔴 FUTURE | Not yet created | — | Phase 6 |

---

## 🔗 DEPENDENCY EXECUTION ORDER

```
TAHAP 1 — Base Tables (SUDAH LIVE, tidak perlu run):
  users ✅ → leads ✅ → customers ✅ → products ✅ → orders ✅

TAHAP 2 — Sprint 1 New Tables (RUN DALAM URUTAN INI):
  [Step 1] 001-wa-logs.sql        ← requires: users, leads, customers
  [Step 2] 002-ai-tasks.sql       ← requires: wa_logs, leads, orders
                                    (+ adds FK from wa_logs → ai_tasks)
  [Step 3] 003-ai-insights.sql    ← requires: ai_tasks
  [Step 4] 005-credit-ledger.sql  ← requires: ai_tasks
  [Step 5] 004-order-items.sql    ← requires: orders, products (INDEPENDENT)
                                    dapat dirun paralel dengan Step 1-4

CATATAN URUTAN:
  - Step 4 (credit_ledger) dan Step 5 (order_items) BISA dirun paralel
  - Step 1-3 harus SEQUENTIAL (ada FK dependency chain)
  - 004-order-items.sql INDEPENDEN dari WA/AI tables
```

---

## 📋 SCHEMA ALIGNMENT MATRIX

Verifikasi bahwa setiap SQL file align dengan TypeScript schema di `packages/db/src/schema.ts`:

| Table | SQL File | TS Type | Alignment | Notes |
|-------|----------|---------|-----------|-------|
| `wa_logs` | 001 | `WaLogsTable` | ✅ ALIGNED | FK ai_task_id ditambahkan via 002 |
| `ai_tasks` | 002 | `AITasksTable` | ✅ ALIGNED | agent CHECK sesuai AgentType |
| `ai_insights` | 003 | `AIInsightsTable` | ✅ ALIGNED | insight_type CHECK sesuai TS union |
| `order_items` | 004 | `OrderItemsTable` | ✅ ALIGNED | Rupiah INTEGER constraint ada |
| `credit_ledger` | 005 | `CreditLedgerTable` | ✅ ALIGNED | service CHECK sesuai TS union |

---

## 🔒 RLS POLICY SUMMARY

| Table | RLS Enabled | service_role Policy | Public Policy | Customer Policy |
|-------|-------------|---------------------|---------------|-----------------|
| `wa_logs` | ✅ YES | ✅ Full access | ❌ None (private) | ❌ None |
| `ai_tasks` | ✅ YES | ✅ Full access | ❌ None (private) | ❌ None |
| `ai_insights` | ✅ YES | ✅ Full access | ❌ None (private) | ❌ None |
| `order_items` | ✅ YES | ✅ Full access | ❌ None | 🔜 Phase 4+ placeholder |
| `credit_ledger` | ✅ YES | ✅ Full access | ❌ None (private) | ❌ None |

---

## 📌 HARDSENED IMPROVEMENTS (Session 3c vs Session 2b originals)

Setiap migration file telah di-harden dengan penambahan:

1. **Standardized header** — author, sprint, last hardened date
2. **Pre-run checklist** — founder harus verify sebelum run
3. **Dry-run validation queries** — SELECT untuk cek dependencies
4. **Rollback instructions** — explicit DROP TABLE sequence
5. **Dependency map** — visual chain semua 5 migration files
6. **Additional indexes** — phone index untuk wa_logs, operation index untuk credit_ledger
7. **Table & column COMMENTS** — readable di Supabase dashboard
8. **Post-run validation queries** — verify setelah migration selesai
9. **Partial indexes** — optimized untuk common WHERE clauses
10. **005-credit-ledger.sql** — file baru yang sebelumnya GAP

---

## ⚠️ BLOCKED TABLES (DO NOT MIGRATE YET)

| Table | Blocker | Why |
|-------|---------|-----|
| `decision_logs` | Phase 3+ scope | Butuh governance layer implementation |
| `proof_entries` | Phase 3+ scope | Butuh proof upload infrastructure |
| `weekly_reviews` | Phase 3+ scope | Butuh founder review workflow |
| `agent_runs` | Phase 6 | Butuh full agent orchestration |

---

## 📅 ESTIMATED MIGRATION TIMELINE

| Step | Action | Estimated Time | Notes |
|------|--------|----------------|-------|
| 0 | Founder fills `.dev.vars` with real credentials | 5 min | BLOCKER for all steps |
| 1 | Run 001-wa-logs.sql in Supabase | 2 min | Via Dashboard SQL Editor |
| 2 | Run 002-ai-tasks.sql in Supabase | 2 min | After step 1 verified |
| 3 | Run 003-ai-insights.sql | 2 min | After step 2 verified |
| 4 | Run 005-credit-ledger.sql | 2 min | After step 2 verified |
| 5 | Run 004-order-items.sql | 2 min | Independent, any time after step 0 |
| 6 | Run post-validation queries | 5 min | Verify all 5 tables created |
| 7 | Test Tower endpoints with real JWT | 15 min | Verify DB read/write works |

**Total estimated**: ~35 minutes (after credentials ready)

---

*Document generated: Session 3c — 2026-04-04*  
*Next update: After migration execution confirmed by founder*
