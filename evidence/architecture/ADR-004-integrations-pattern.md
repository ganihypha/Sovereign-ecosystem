# ADR-004: Integrations Foundation Pattern — Scaffold-First, Contract-Driven
# Session: 2d
# Status: ACCEPTED
# Tanggal: 2026-04-04

---

## Context

Membangun `@sovereign/integrations` sebagai shared integration layer untuk Fonnte (WA)
dan Groq/LLM, dengan constraint:
- Tidak ada live HTTP call di Session 2d
- FONNTE_TOKEN dan GROQ_API_KEY belum tersedia / belum dikonfigurasi
- Harus siap untuk live integration di Phase 3 tanpa refactor besar
- Semua WA outbound WAJIB human gate

---

## Decisions

### S2D-001: Scaffold-First Pattern

**Keputusan**: Build interface + scaffold implementasi dulu, live client Phase 3.

**Struktur**:
```
types/        → Type contracts (request/response shapes)
contracts/    → Interface definitions (IWaClient, ILLMClient)
scaffold/     → Placeholder implementations (no live calls)
config/       → Env config helpers
clients/      → BELUM ADA — akan dibuat Phase 3 (FonnteClient, GroqClient)
```

**Alasan**:
- TypeScript type safety terjamin sebelum implementasi live
- Development dan testing bisa berjalan tanpa credentials aktif
- Interface stabil → live client bisa dibuat di Phase 3 tanpa ubah contract

---

### S2D-002: WA_CLIENT_HUMAN_GATE_REQUIRED = true — Non-Configurable

**Keputusan**: `WA_CLIENT_HUMAN_GATE_REQUIRED = true as const` — hardcoded, bukan toggle.

**Alasan**:
- Ini adalah business rule utama Sovereign ecosystem, bukan fitur yang bisa dimatikan
- AI-generated WA messages HARUS melalui founder approval di wa_logs
- Membuat ini configurable membuka celah untuk bypass human gate

**Enforcement**:
- IWaClient hanya dipanggil setelah wa_logs record ada dengan approved_by diisi
- Scaffold memiliki console.warn reminder di setiap method

---

### S2D-003: LLM Cost Tracking built-in di types layer

**Keputusan**: `estimateLLMCostUsd()` dan `LLM_COST_PER_1K_TOKENS` ada di `types/groq.ts`.

**Alasan**:
- Cost tracking adalah core business requirement (credit_ledger)
- Harus mudah diakses dari mana saja tanpa import circular
- Approx pricing hardcoded dengan catatan "update sesuai pricing terbaru"

---

### S2D-004: Config helpers terpisah di config/ layer

**Keputusan**: `getFonnteConfig()`, `getGroqConfig()`, `validateAllIntegrationsConfig()`
ada di `config/env.config.ts`, bukan di scaffold atau client.

**Alasan**:
- Config validation reusable untuk health check endpoint di Tower
- Pemisahan concerns: config reading ≠ client logic
- `validateAllIntegrationsConfig()` bisa dipanggil di `/api/health` tanpa instantiate client

---

### S2D-005: Hapus @supabase/supabase-js dari integrations dependencies

**Keputusan**: Hapus dependency `@supabase/supabase-js` dan `@sovereign/types` workspace dari `package.json`.

**Alasan**:
- `@supabase/supabase-js` sudah ada di `packages/db` — tidak perlu duplikasi
- `workspace:*` tidak work tanpa pnpm workspace aktif
- Import types dari relative path (`../../types/src/`) sementara

---

## Consequences

**Positif**:
- Foundation siap untuk Phase 3 live integration
- TypeScript strict 0 errors — interface contract terjamin
- WA human gate constraint terdokumentasi dan enforced di contract level
- Scaffold berguna untuk testing tanpa credentials

**Trade-offs**:
- Belum ada live client → tidak bisa test end-to-end sampai Phase 3
- `LLM_COST_PER_1K_TOKENS` hardcoded → perlu update manual jika pricing berubah

---

## Related ADRs
- ADR-001: Monorepo Turborepo (Session 1)
- ADR-002: DB schema pattern (Session 2b)
- ADR-003: Auth Web Crypto API pattern (Session 2c)
- ADR-005: Agent prompt contracts (Session 2e — TBD)
