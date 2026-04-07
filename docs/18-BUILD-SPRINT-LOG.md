# 18 – BUILD / SPRINT LOG
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** LIVING DOCUMENT – Update setiap sesi build
**Repo:** https://github.com/ganihypha/Sovereign.private.real.busines.orchest

---

## CARA PAKAI DOKUMEN INI

> **Prinsip:** Catat SEBELUM mulai (niat), UPDATE saat jalan (blocker), TUTUP dengan hasil nyata.
> Jangan nulis panjang-panjang. Satu baris per task. Bukti wajib ada.

**Format entry:**
```
### [YYYY-MM-DD] Sprint X – Task Y.Z – [JUDUL SINGKAT]
- Status: [ ] TODO | [~] IN PROGRESS | [x] DONE | [!] BLOCKED
- Waktu mulai: HH:MM | Selesai: HH:MM (atau estimasi)
- Output: [file/route/tabel yang dibuat]
- Bukti: [link screenshot / curl output / commit hash]
- Blocker: [apa yang menghambat, jika ada]
- Next: [task berikutnya]
```

---

## SPRINT OVERVIEW

> **State terkini (2026-04-06):** Sessions 3a–3f DONE. Session 3g = NEXT.
> Sovereign Tower sudah live di https://sovereign-tower.pages.dev (build_session: 3f, commit: 47d947f)

| Sprint / Phase | Minggu | Fokus | Status |
|----------------|--------|-------|--------|
| Phase 3a–3f (Tower Build) | W0-W1 | Scaffold, wiring, DB, modules, WA/Fonnte | ✅ DONE — LIVE (verified 2026-04-05) |
| **Phase 3g** | W1+ | Inbound WA webhook + human-gate queue + broadcast | ✅ IMPLEMENTED (2026-04-07) — awaiting deploy |
| Sprint 2 — ScoutScorer Agent | W2+ | ScoutScorer Agent + Scout API | 🟡 NEXT — after 3g deployed |
| Sprint 3 | W6-W8 | MessageComposer + Closer Routes | 🔴 NOT STARTED |
| Sprint 4 | W9-W11 | InsightGenerator + CrewAI | 🔴 NOT STARTED |
| Sprint 5 | W12 | Revenue Tracking + Mobile Polish | 🔴 NOT STARTED |

---

## SPRINT 1 – Database Tables + WhatsApp Routes
**Target:** Minggu 1-2 | **Prasyarat:** FONNTE_TOKEN + OPENAI_API_KEY

### Blocking Items Sprint 1
- [ ] `FONNTE_TOKEN` → daftar di https://fonnte.com → simpan ke `.dev.vars` + Cloudflare Secret
- [ ] `OPENAI_API_KEY` → buat di https://platform.openai.com → simpan ke `.dev.vars` + Cloudflare Secret

### Task 1.1 – Buat 4 Tabel Supabase Baru
```
Status: [ ] TODO
Target file: supabase migration SQL
Tabel yang harus dibuat:
  - wa_messages (id, lead_id, direction, body, sent_at, status)
  - wa_templates (id, name, body, category, created_at)
  - orders (id, lead_id, product, qty, price, status, created_at)
  - revenue_log (id, order_id, amount, type, recorded_at)
Output: migration file + konfirmasi 4 tabel exist di Supabase dashboard
Bukti: screenshot Supabase table list
Estimasi: 45 menit
Ref: 07-MODULE-TASK-BREAKDOWN.md § Task 1.1
```
**Log harian:**
```
[YYYY-MM-DD HH:MM] - Status update di sini
```

### Task 1.2 – WhatsApp Routes via Fonnte
```
Status: [ ] TODO
Target file: src/routes/wa.ts (baru)
Routes yang harus ada:
  POST /api/wa/send     → kirim pesan WA
  GET  /api/wa/history  → ambil log pesan
  POST /api/wa/template → simpan template
Output: 3 routes aktif, tes via curl berhasil
Bukti: curl output + log di tabel wa_messages
Estimasi: 2 jam
Ref: 07-MODULE-TASK-BREAKDOWN.md § Task 1.2, 17-TASK-PROMPT-PACK-TEMPLATE.md § Sprint 1 Task 1.2
```
**Log harian:**
```
[YYYY-MM-DD HH:MM] - Status update di sini
```

### Task 1.3 – Order Capture Routes
```
Status: [ ] TODO
Target file: src/routes/orders.ts (baru)
Routes:
  POST /api/orders      → create order
  GET  /api/orders      → list orders
  PATCH /api/orders/:id → update status
Output: 3 routes aktif, order masuk ke tabel orders
Bukti: curl POST + screenshot Supabase row
Estimasi: 1.5 jam
```
**Log harian:**
```
[YYYY-MM-DD HH:MM] - Status update di sini
```

---

## SPRINT 2 – ScoutScorer Agent
**Target:** Minggu 3-5 | **Prasyarat:** Sprint 1 selesai

### Task 2.1 – Install LangChain + Setup Agent Base
```
Status: [ ] TODO
Command: npm install langchain @langchain/openai
Target file: src/agents/base.ts
Output: base agent class berjalan, test import berhasil
Estimasi: 1 jam
```

### Task 2.2 – ScoutScorer Agent Logic
```
Status: [ ] TODO
Target file: src/agents/scoutScorer.ts
Input: lead data (nama, sumber, interaksi)
Output: score 0-100 + reasoning JSON
Acceptance test: kirim lead dummy → terima score JSON valid
Estimasi: 3 jam
Ref: 17-TASK-PROMPT-PACK-TEMPLATE.md § Sprint 2 Task 2.2
```

### Task 2.3 – Scout API Routes + UI Button
```
Status: [ ] TODO
Route: POST /api/scout/score
UI: tombol "Score Lead" di Lead Inbox
Output: skor muncul di UI dalam <3 detik
```

---

## SPRINT 3 – MessageComposer Agent + Outreach Sequence
**Target:** Minggu 6-8

### Task 3.1 – MessageComposer Agent
```
Status: [ ] TODO
Input: lead profile + context
Output: 3 variasi pesan WA (opening, follow-up, closing)
```

### Task 3.2 – Outreach Sequence Engine
```
Status: [ ] TODO
Logic: T+0 opening, T+24h follow-up 1, T+72h follow-up 2
Trigger: otomatis atau manual dari dashboard
```

### Task 3.3 – Closer Routes + UI Integration
```
Status: [ ] TODO
Route: POST /api/closer/sequence
UI: panel "Outreach" di Lead detail
```

---

## SPRINT 4 – InsightGenerator + CrewAI
**Target:** Minggu 9-11

### Task 4.1 – InsightGenerator Agent
```
Status: [ ] TODO
Input: revenue_log + orders data (7/30 hari)
Output: 3-5 insight teks + rekomendasi prioritas
```

### Task 4.2 – Dashboard AI Insights Section
```
Status: [ ] TODO
UI: section "AI Insight" di homepage dashboard
Load time: <3 detik
```

### Task 4.3 – CrewAI Multi-Agent Integration
```
Status: [ ] TODO
Crew: ScoutScorer + MessageComposer + InsightGenerator
Orchestration: LangGraph workflow
```

---

## SPRINT 5 – Revenue Tracking + Polish
**Target:** Minggu 12

### Task 5.1 – Unpaid Invoice Calculator
```
Status: [ ] TODO
Logic: filter orders WHERE status='pending' → sum amount
UI: widget "Piutang Belum Lunas" di dashboard
```

### Task 5.2 – Mobile Polish + Security Audit
```
Status: [ ] TODO
Checklist: responsive semua halaman, PIN re-auth, rate limit API
```

### Task 5.3 – Deploy v4.0 Production
```
Status: [ ] TODO
Command: npm run build && wrangler pages deploy dist
Bukti: URL live + semua route 200 OK
```

---

## SPRINT MIGRATION LOG (Phase 3 — Sessions 3a-3f)

> **Update 2026-04-05:** Sessions 3a–3f selesai. Status di bawah adalah ringkasan dari migration phase.

### [2026-04-04 / 2026-04-05] Phase 3 — Sovereign Tower Sessions
```
## Session 3a — Scaffold
- Status: [x] DONE
- Output: apps/sovereign-tower scaffolded (7 modules, 14 routes)
- Bukti: commit history, TypeScript zero errors

## Session 3b — Core Wiring
- Status: [x] DONE
- Output: JWT auth wired, Supabase DB adapters, wrangler.jsonc
- Bukti: session-3b-summary.md

## Session 3c — DB Migration Hardening
- Status: [x] DONE
- Output: migrations 001-005 hardened, inventory map, validation matrix
- Bukti: session-3c-summary.md, migration/sql/

## Session 3d — Module Wiring
- Status: [x] DONE
- Output: ai-resource-manager, decision-center, founder-review wired; ADR-010; dist 230.84kB
- Bukti: session-3d-summary.md, commit 89762b4

## Session 3e — Foundation Verification + Weekly Reviews
- Status: [x] DONE
- Output: weekly_reviews live, POST founder-review E2E verified, proof-center + build-ops static
- Bukti: session-3e-summary.md, commit 775d9af / 06d3a99

## Session 3f — WA/Fonnte Activation
- Status: [x] DONE
- Output: wa-adapter.ts, wa.ts (4 routes), ADR-012
- Fonnte device: CONFIRMED send (fonnte_message_id 150273541)
- wa_logs: 3 entries (1 sent, 2 failed pre-fix)
- Bukti: session-3f-summary.md, commit 47d947f + 8d5f19f
- Next: Session 3g (inbound webhook, human-gate queue, broadcast)

## Session 3g — Inbound Webhook + Human-Gate Queue + Broadcast Gating
- Status: [x] IMPLEMENTED (2026-04-07) — awaiting deploy
- Output:
  - wa-adapter.ts extended: +validateWebhookToken, +insertInboundWaLog, +getGateQueue,
    +approveQueueItem, +rejectQueueItem, +checkBroadcastGate, +executeBroadcast,
    +FonnteInboundPayload, +BROADCAST_MAX_TARGETS
  - wa.ts: +5 new routes (webhook, queue, queue/:id/approve, queue/:id/reject, broadcast)
  - app.ts: middleware exception for /api/wa/webhook (public webhook route)
  - app-config.ts: TOWER_BUILD_SESSION '3g', +WA_WEBHOOK, +WA_QUEUE, +WA_BROADCAST
  - ADR-019 created
- TypeScript: zero errors ✅
- Build: 257.91 kB ✅
- No new DB migration: reuses wa_logs (direction, requires_approval, approved_by, approved_at)
- Fonnte webhook URL (Founder must configure): https://sovereign-tower.pages.dev/api/wa/webhook?token=<FONNTE_DEVICE_TOKEN>
- Next: Deploy → test inbound → Sprint 2 ScoutScorer
```

---

## LOG HARIAN (Append di sini)

### [Template]
```
## [YYYY-MM-DD] – Hari ke-X Build
**Sesi:** [pagi/sore/malam] | **Durasi:** X jam
**Dikerjakan:**
- Task X.X: [hasil singkat]
**Output/Bukti:**
- [link / commit / screenshot]
**Blocker:**
- [jika ada]
**Keputusan dibuat:**
- [jika ada – mirror ke 19-DECISION-LOG.md]
**Besok:**
- [ ] Task berikutnya
```

---

## METRICS SPRINT

> **Note:** Metrics di bawah adalah target original Sprint 1–5. Phase 3 (sessions 3a–3f) adalah migration + build phase yang sudah selesai sebelum sprint framework ini dijalankan. Update aktual mengikuti session progress.

| Metric | Target | Aktual (s/d 3f) |
|--------|--------|------------------|
| Phase 3 sessions selesai | 3a–3g | 3a–3f ✅ DONE (3g NEXT) |
| Routes live (sovereign-tower) | — | 12 routes live ✅ |
| WA E2E delivery confirmed | 1 | 1 ✅ (fonnte_message_id: 150273541) |
| wa_logs entries | — | 3 ✅ (1 sent, 2 failed pre-fix) |
| weekly_reviews DB wired | ✅ | ✅ DONE (migration 006, id:1) |
| Orders captured (test) | 5 | 0 — Sprint 2+ task |
| AI agents running | 0 | 0 — Sprint 2–4 task |
| Revenue tracked (IDR) | Rp 0 | Rp 0 |

---

## BLOCKERS AKTIF

| ID | Blocker | Dampak | PIC | Deadline | Status |
|----|---------|--------|-----|----------|--------|
| B-001 | FONNTE_TOKEN belum ada | Sprint 1 Task 1.2 tidak bisa jalan | Founder | ASAP | ✅ RESOLVED (2026-04-05) |
| B-002 | OPENAI_API_KEY belum ada | Sprint 2-4 semua blocked | Founder | Sprint 2 | 🔴 OPEN — needed for ScoutScorer Agent |

**⚠️ NO CRITICAL BLOCKERS untuk Session 3g.** GROQ_API_KEY sudah configured (dipakai Sprint 2 awal sebagai substitusi OpenAI).

---

*Document Control: v1.2 – 2026-04-07 – Living Document (Session 3g IMPLEMENTED: inbound webhook, human-gate queue, broadcast gating — TypeScript PASS, Build 257.91 kB)*
*CLASSIFIED – FOUNDER ACCESS ONLY*
