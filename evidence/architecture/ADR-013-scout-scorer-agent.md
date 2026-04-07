# ADR-013: ScoutScorer Agent — Session 4A

**Status:** ACCEPTED  
**Date:** 2026-04-07  
**Session:** 4A  
**Author:** AI Dev Executor (via Session 4A)  
**Scope:** `apps/sovereign-tower/src/routes/agents.ts`

---

## Context

Session 3G telah VERIFIED AND READY TO CLOSE. Next scoped target yang sudah ditetapkan di `current-handoff.md` adalah **Session 4A / ScoutScorer Agent**.

`GROQ_API_KEY` dan `GROQ_CONSOLE` sudah terkonfigurasi sebagai Cloudflare secrets.  
`ai_tasks` table sudah ada via migration `002-ai-tasks.sql`.  
`leads` table dengan kolom `ai_score` dan `ai_score_reasoning` sudah ada via `000-foundation-tables.sql`.

---

## Decision

Implement **ScoutScorer Agent** sebagai route file `src/routes/agents.ts` dengan:

1. `POST /api/agents/scout-score` — Score single lead via GROQ LLM
2. `GET /api/agents/scout-score/status` — Agent health/readiness check

### Model yang Digunakan
- Model: `groq/llama3-8b-8192`
- Temperature: `0.1` (low randomness untuk scoring consistency)
- Max tokens: `200` (cukup untuk JSON score response)

### Data Flow
```
Founder → POST /api/agents/scout-score { lead_id }
         ↓
  Fetch lead dari Supabase (leads table)
         ↓
  Build scoring prompt
         ↓
  Call GROQ API (llama3-8b-8192)
         ↓
  Parse score (0-100) + reasoning
         ↓
  UPDATE leads SET ai_score, ai_score_reasoning
         ↓
  INSERT ai_tasks (agent=scout_scorer, status=completed/failed)
         ↓
  Return { score, reasoning, task_id, lead_updated }
```

### Human Gate
- `requires_approval = false` — scoring adalah read-only, tidak ada action irreversible
- Tidak ada WA send, tidak ada broadcast, tidak ada order creation dari route ini
- Sesuai dengan non-negotiable guardrail: TIDAK enable auto-send loops

---

## Consequences

### Positive
- ScoutScorer terintegrasi langsung ke `ai_tasks` table (reuse existing schema)
- Lead scoring tersimpan di `leads.ai_score` + `leads.ai_score_reasoning` (reuse existing columns)
- GROQ API key reuse dari existing secret tanpa hardcode
- Route file mengikuti pola yang sama dengan `wa.ts`, `modules.ts`
- Full error handling: GROQ error → log failed ai_task → return 502

### Tradeoffs
- Scoring dilakukan per-lead (single), bukan batch — sesuai smallest safe slice principle
- GROQ llama3-8b-8192 dipilih karena sudah terkonfigurasi; bisa diupgrade ke model lain tanpa schema change

---

## Files Changed
- `apps/sovereign-tower/src/routes/agents.ts` ← NEW
- `apps/sovereign-tower/src/app.ts` ← UPDATED (agentsRouter registered)
- `apps/sovereign-tower/src/lib/app-config.ts` ← UPDATED (TOWER_BUILD_SESSION 3g → 4a)

## Session 3G Preservation
- WA routes (`wa.ts`) tidak diubah
- `wa-adapter.ts` tidak diubah
- Human gate WA (approve/reject/broadcast) tidak diubah
- FONNTE_DEVICE_TOKEN tidak diubah
- Verified 3G behavior fully preserved
