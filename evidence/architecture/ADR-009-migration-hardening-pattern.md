# ADR-009: Sprint 1 Migration Hardening — Pattern & Gap Fill
## Status: ACCEPTED
## Date: 2026-04-04
## Session: 3c — DB Migration + Evidence Hardening
## Author: AI Developer (via Session 3c)
## ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY

---

## Context

Session 3c menemukan bahwa 4 migration files yang ada di `migration/sql/` (001-004) memiliki konten SQL yang fungsional tapi kekurangan:
1. Standardized pre-run safety checklist
2. Explicit rollback instructions
3. Dry-run validation queries  
4. Post-run verification queries
5. Dependency map yang jelas

Selain itu, ditemukan **gap kritis**: `005-credit-ledger.sql` belum ada, padahal `CreditLedgerTable` sudah didefinisikan di `packages/db/src/schema.ts` sebagai Sprint 1 target.

## Decision

1. **Harden semua 4 existing migration files** dengan standar header, checklist, rollback, dry-run queries, dan post-run validation — tanpa mengubah schema SQL inti.

2. **Create `005-credit-ledger.sql`** sebagai gap fill — tabel ini diperlukan oleh `ai-resource-manager` module untuk tracking AI credit usage.

3. **Create migration artifact documents**:
   - `migration/migration-inventory-map.md` — peta semua migration files
   - `migration/validation-matrix.md` — komprehensive verification checklist
   - `migration/blocker-log.md` — active/resolved blockers tracking
   - `migration/risk-rollback-notes.md` — rollback procedures per migration

4. **Migration execution stays with founder** — AI Developer tidak menjalankan migration langsung ke Supabase. Semua files are "dry-run ready".

## Consequences

**Positive:**
- Founder punya complete safety net sebelum run migration
- credit_ledger tabel schema siap untuk Sprint 1
- ADR trail terdokumentasi untuk CCA evidence
- Migration process repeatable dan auditable

**Negative:**
- 5 tabel Sprint 1 MASIH belum live (hanya SQL siap)
- ai-resource-manager MASIH placeholder sampai migration dijalankan
- Memerlukan sesi tersendiri (3d) untuk wire modules setelah migration

## Alternatives Considered

1. **Langsung wire modules tanpa migration** — REJECTED: tidak bisa query tabel yang belum ada
2. **Run migration otomatis di sandbox** — REJECTED: tidak punya Supabase credentials, dan ini adalah irreversible production action yang butuh founder approval
3. **Skip credit_ledger gap** — REJECTED: gap fill penting untuk completeness Sprint 1

## Related ADRs
- ADR-007: Auth via app-level /api/* middleware (Session 3b)
- ADR-008: DB access via db-adapter.ts narrow wrapper (Session 3b)
- ADR-002: DB schema pattern (Session 2b)

## References
- `migration/sql/001-005` — all hardened files
- `packages/db/src/schema.ts:CreditLedgerTable` — TypeScript schema
- `docs/28-MIGRATION-PHASE-PLAN.md` — Phase 5 DB Consolidation plan
- `migration/validation-matrix.md` — AC tracker
