# ADR-012: WA Routes Activation Pattern — Session 3f

**Status:** ACCEPTED  
**Date:** 2026-04-05  
**Session:** 3f  
**Author:** AI Dev Executor

---

## Context

Session 3f scope: activate Fonnte/WhatsApp integration in Sovereign Tower.

Pre-conditions (all met before this ADR):
- Sessions 3a–3e completed and verified
- FONNTE_ACCOUNT_TOKEN + FONNTE_DEVICE_TOKEN present in Cloudflare secrets
- wa_logs table designed in migration/sql/001-wa-logs.sql
- Session 3e verified: DB connected, weekly_reviews live, POST founder-review E2E

Key constraints:
1. No uncontrolled auto-send or broadcast loops
2. All WA operations MUST be logged to wa_logs (audit trail)
3. Delivery status must distinguish: attempted vs confirmed vs failed
4. Token values must never appear in responses or logs
5. All routes require founder JWT auth (inherited from app-level middleware)

---

## Decision

### 1. New file: `src/lib/wa-adapter.ts`
Single responsibility adapter that:
- Resolves Fonnte token from env (FONNTE_ACCOUNT_TOKEN > FONNTE_TOKEN > FONNTE_DEVICE_TOKEN)
- Wraps Fonnte HTTP API (POST /send, POST /get-devices)
- Provides DB helpers for wa_logs (insert, update, read)
- Provides `waSendAndLog()` — atomic send + log flow

### 2. New file: `src/routes/wa.ts`
Four narrow routes:
- `GET /api/wa/status` — env/device readiness check (no token values in response)
- `GET /api/wa/logs` — audit trail (recent wa_logs entries)
- `POST /api/wa/test` — minimal single-target test send
- `POST /api/wa/send` — founder-controlled single-target send (supports dry_run=true)

### 3. Delivery status classification (strict honesty)
All send responses return one of:
- `CONFIRMED` — Fonnte returned status: true
- `ATTEMPTED_NOT_CONFIRMED` — request sent but no positive confirmation
- `NOT_ATTEMPTED` — blocked before send (missing token, invalid phone, etc.)
- `NOT_SENT` — dry_run mode, only logged

### 4. Human gate
- Founder-triggered sends: `requires_approval: false` (pre-approved by being founder action)
- `dry_run=true`: logged as `requires_approval: true`, status `pending` — not sent
- No agent-triggered auto-send in this session

### 5. No broadcast
- Single target only per request
- No bulk/batch endpoint in Session 3f
- Broadcast remains out of scope

---

## Alternatives Considered

1. **Use packages/integrations scaffold** — rejected (scaffold has no real HTTP calls)
2. **Import FonnteClient from packages** — rejected (packages not built for live impl yet; direct fetch in wa-adapter is more traceable and has fewer type issues)
3. **Add queue/approval flow** — deferred to 3g (wa_logs pending state + dry_run already provides foundation)

---

## Consequences

**Positive:**
- WA activation is narrow, auditable, founder-controlled
- Every send attempt is logged regardless of DB availability
- Token never exposed in logs or responses
- dry_run mode allows founder to preview before actual send

**Negative / Trade-offs:**
- wa_logs table must be live before /api/wa/logs works (migration/sql/001-wa-logs.sql)
- Delivery confirmation depends on Fonnte provider — only what Fonnte returns is trusted
- No delivery receipt (read/delivered status) in this session — needs webhook receiver

---

## Files Touched

```
apps/sovereign-tower/src/lib/wa-adapter.ts   NEW
apps/sovereign-tower/src/routes/wa.ts        NEW
apps/sovereign-tower/src/app.ts              UPDATED (register waRouter, session 3f)
apps/sovereign-tower/src/lib/app-config.ts  UPDATED (session 3f, WA routes in TOWER_ROUTES)
```

---

*ADR-012 created Session 3f — WA routes activation*
