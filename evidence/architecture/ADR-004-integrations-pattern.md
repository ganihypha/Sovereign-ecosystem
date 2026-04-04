# ADR-004: Integration Foundation Pattern — Scaffold-First, Live Phase 3
# Session: 2d
# Status: ACCEPTED
# Tanggal: 2026-04-04
# Author: AI Dev (Session 2d)

---

## Context

Saat membangun @sovereign/integrations, dua external services utama dibutuhkan:
1. **Fonnte** — WhatsApp messaging API (FONNTE_TOKEN missing)
2. **Groq** — LLM completion API (GROQ_API_KEY status pending)

Constraints:
- FONNTE_TOKEN belum tersedia (blocker Phase 3)
- Harus Cloudflare Workers compatible (no Node.js APIs)
- Human gate WAJIB untuk semua outbound WA
- Tidak boleh ada live HTTP call atau secrets di repo

---

## Decisions

### S2D-001: Scaffold-First pattern — live clients dibuat Phase 3

**Keputusan**: Session 2d membangun type contracts + scaffold implementations.
Live HTTP clients (FonnteClient, GroqClient) dibuat di Phase 3.

**Alasan**:
- FONNTE_TOKEN belum tersedia — tidak mungkin test live
- Scaffold memungkinkan type checking dan development tanpa credentials
- Interface (IWaClient, ILLMClient) sudah fully typed — swap ke live client
  hanya butuh replace class di instantiation point
- Sesuai constraint Session 2d: "CONTRACT ONLY"

**Implikasi Phase 3**:
```typescript
// Sekarang (scaffold):
const wa = new FonnteClientScaffold({ FONNTE_TOKEN: 'placeholder' })

// Phase 3 (live):
import { FonnteClient } from '@sovereign/integrations/clients'
const wa = new FonnteClient(getFonnteConfig(c.env))
```

---

### S2D-002: Zero external HTTP dependency di @sovereign/integrations

**Keputusan**: Package tidak depend ke axios, got, ky, atau library HTTP lain.
Live clients Phase 3 akan menggunakan native `fetch()`.

**Alasan**:
- `fetch()` built-in di Cloudflare Workers, modern Node.js (18+), Deno, Bun
- Mengurangi bundle size
- Tidak ada supply chain risk dari HTTP library
- Groq dan Fonnte API compatible dengan simple fetch() POST

---

### S2D-003: Human gate sebagai first-class architectural constraint

**Keputusan**: WA_CLIENT_HUMAN_GATE_REQUIRED = true di-export sebagai konstanta
yang jelas dan di-dokumentasikan di interface IWaClient.

**Alasan**:
- Ini adalah constraint bisnis paling penting: founder harus approve setiap
  pesan WA yang digenerate AI sebelum dikirim
- Dengan membuat ini sebagai konstanta yang explicit, setiap developer yang
  menggunakan package ini otomatis sadar akan constraint ini
- Mencegah accidental bypass human gate

**Flow yang diwajibkan**:
```
Agent generate pesan
  → simpan ke wa_logs (requires_approval=true)
  → Founder review di Tower
  → Jika approved → panggil wa.sendMessage()
  → Jika rejected → update status = 'rejected_by_founder'
```

---

### S2D-004: Cost estimation helper di types layer, bukan client layer

**Keputusan**: estimateLLMCostUsd() diletakkan di types/groq.ts.

**Alasan**:
- Dibutuhkan untuk pre-flight cost check tanpa harus instantiate client
- Berguna di ai_tasks helper (packages/db) untuk populate cost_usd field
- Pure function tanpa side effects — cocok di types layer

---

### S2D-005: Config validation helpers tanpa throw variant

**Keputusan**: Menyediakan dua variant untuk config validation:
- getFonnteConfig() / getGroqConfig() → throw jika missing (untuk runtime)
- validateFonnteConfig() / validateLLMConfig() → return result object (untuk health check)

**Alasan**:
- Route handlers butuh hard fail jika config missing (use throw variant)
- Health check endpoint butuh soft check (use validate variant)
- Tower health endpoint: GET /api/health/integrations → return semua status

---

## Consequences

**Positif**:
- Type contracts siap → Phase 3 tinggal implement fetch() logic
- Scaffold bisa dipakai untuk agent pipeline testing sekarang
- Human gate ter-dokumentasi dengan jelas
- Zero dependency → bundle kecil

**Negatif / Trade-offs**:
- Live HTTP clients belum ada → tidak bisa test real WA/LLM flow
- Scaffold console.warn bisa noisy di development — acceptable

---

## Related ADRs
- ADR-001: Monorepo Turborepo (Session 1)
- ADR-002: DB schema pattern (Session 2b)
- ADR-003: Auth Web Crypto API (Session 2c)
- ADR-005: Prompt contracts pattern (Session 2e — TBD)
