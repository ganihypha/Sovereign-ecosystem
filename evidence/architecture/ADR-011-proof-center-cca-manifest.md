# ADR-011: Proof Center Wiring Pattern — Static CCA Domain Manifest

**Status:** ACCEPTED
**Date:** 2026-04-05
**Session:** 3e
**Author:** AI Dev Executor

---

## Context

Proof Center module membutuhkan akses ke CCA domain evidence status
(`evidence/cca/domain-*.md`). Cloudflare Workers runtime tidak bisa membaca
filesystem, sehingga file tidak bisa dibaca langsung saat runtime.

## Decision

Gunakan **static manifest pattern** (sama dengan ADR-010 untuk decision-center).
Embed CCA domain data sebagai static array di `modules.ts`, di-sync manual setiap session.

## Implementation (Session 3e)

- Static `ccaDomainManifest` array embed di `modulesRouter.get('/proof-center', ...)`
- Fields per domain: `domain_id`, `title`, `weight_pct`, `status`, `evidence_items`, `evidence_count_ready`, `evidence_count_total`, `notes`, `last_updated`
- Summary computed: `total_evidence_ready`, `readiness_pct`, `domains_at_risk`
- Status label: `wired` (tidak `placeholder`)
- Sync manual setiap session sesuai isi `evidence/cca/` folder

## Consequences

**Positif:**
- Always available — tidak ada runtime dependency
- Zero latency (no DB / network call)
- Auditable — diff manifest per session
- CCA readiness gap langsung kelihatan via API

**Negatif:**
- Manual sync per session (tidak real-time)
- Jika evidence berubah tanpa sync manifest, data stale

## Sync Responsibility

AI Dev wajib update manifest saat ada perubahan material di `evidence/cca/`:
- Status berubah dari `scaffold` ke `partially-filled` atau `complete`
- Evidence items baru ditambahkan
- Evidence count berubah

## Related

- ADR-010: Decision Center Static Manifest Pattern (template untuk ini)
- ADR-009: Migration Hardening
- proof-center route: `apps/sovereign-tower/src/routes/modules.ts`
- CCA source: `evidence/cca/domain-1-agentic.md` ... `domain-5-architecture.md`

---

*ADR-011 dibuat saat session 3e — proof-center CCA manifest wiring*
