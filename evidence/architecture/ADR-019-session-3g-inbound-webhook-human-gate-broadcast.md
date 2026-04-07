# ADR-019 — Session 3g: Inbound WA Webhook + Human-Gate Queue + Broadcast Gating

**Status:** ACCEPTED
**Date:** 2026-04-07
**Author:** Haidar Faras Maulia (via AI Dev — Session 3g)
**Session:** 3g
**Previous ADR:** ADR-012 (WA routes activation)

---

## Context

Session 3f established outbound WA send capability (POST /api/wa/send, POST /api/wa/test)
with wa_logs audit trail. Session 3g extends this to complete the WA operational loop:

1. **Inbound**: Receive messages from customers/leads via Fonnte webhook
2. **Human Gate**: Queue for agent-generated messages requiring founder review before send
3. **Broadcast**: Controlled multi-target send with explicit founder gate

This is the narrowest safe implementation that enables real operational use without
opening uncontrolled automation.

---

## Decision

### A. Inbound WA Webhook — POST /api/wa/webhook

**Route:** `POST /api/wa/webhook?token=<FONNTE_DEVICE_TOKEN>`

**Design decisions:**

1. **Public route, NOT behind JWT** — Fonnte webhook cannot provide JWT tokens.
   Security is via `?token=` query param matching `FONNTE_DEVICE_TOKEN` (validateWebhookToken).

2. **Middleware exception in app.ts** — `/api/wa/webhook` is explicitly excluded from
   jwtMiddleware and founderOnly guards. All other `/api/*` routes remain fully protected.

3. **Always return 200 after token validation** — Prevents Fonnte retry storm.
   DB insert failures are logged internally but do not affect HTTP response to Fonnte.

4. **Graceful payload parsing** — Support both JSON and form-urlencoded payloads
   (Fonnte sometimes switches format). Never crash on malformed payload.

5. **wa_logs direction: 'inbound'** — Inbound messages stored in same wa_logs table
   with `direction: 'inbound'`, `status: 'delivered'`, `sent_by: 'system'`.
   No new table needed — wa_logs schema already supports inbound via direction field.

6. **Phone normalization** — `normalizeSenderPhone()` strips `@s.whatsapp.net` suffix
   that Fonnte sometimes appends.

### B. Human-Gate Queue — GET /api/wa/queue + approve/reject

**Routes:**
- `GET /api/wa/queue` — list pending items
- `POST /api/wa/queue/:id/approve` — founder approves
- `POST /api/wa/queue/:id/reject` — founder rejects

**Design decisions:**

1. **Reuse wa_logs table** — Queue is a VIEW of wa_logs where
   `requires_approval=true AND status='pending'`. No new table needed.
   wa_logs schema already has `requires_approval`, `approved_by`, `approved_at` fields.

2. **FIFO order** — Queue ordered by `created_at ASC` (oldest first).
   Ensures oldest pending items reviewed first.

3. **Approve = gate cleared, NOT auto-send** — Approve only changes status to 'sent'
   and clears `requires_approval`. Does NOT trigger actual Fonnte send.
   Founder must explicitly call POST /api/wa/send after approving.
   This is intentional: two-step process prevents any implicit automation.

4. **Reject = permanent record** — Rejected items get `status: 'rejected_by_founder'`.
   Full audit trail preserved. Item never auto-sent.

5. **approvedBy userId from JWT** — If available from JWT payload (sub/userId),
   stored in `approved_by` field for accountability. Soft requirement — continues
   without userId if JWT payload extraction fails.

6. **Double safety on approve/reject** — Both operations filter by status='pending'
   in the DB query, not just application layer. Prevents race conditions.

### C. Broadcast Gating — POST /api/wa/broadcast

**Route:** `POST /api/wa/broadcast`

**Required body:**
```json
{
  "founder_confirmed": true,
  "targets": ["628xxx", "628yyy"],
  "message": "broadcast text"
}
```

**Design decisions:**

1. **5-layer gate (checkBroadcastGate):**
   - Layer 1: JWT + founderOnly (app middleware)
   - Layer 2: `founder_confirmed: true` (explicit body flag — prevents accidental broadcast)
   - Layer 3: targets.length ≤ BROADCAST_MAX_TARGETS (hardcoded: 10)
   - Layer 4: All targets are valid Indonesian phone numbers
   - Layer 5: Message non-empty and ≤ 4000 chars

2. **BROADCAST_MAX_TARGETS = 10** — Hardcoded safety limit. Increase requires new ADR.
   Prevents accidental bulk send at scale.

3. **Sequential execution** — Each target sent one by one (no parallel fire).
   Slower but safer — prevents partial state ambiguity and Fonnte rate limit issues.

4. **Per-target logging** — Each target gets its own wa_log entry.
   Full per-recipient audit trail.

5. **Per-target result response** — Response includes status for every target.
   Founder sees exactly what was sent, what failed, with fonnte_message_id per entry.

6. **No queue for broadcast** — Broadcast is a direct founder action (already gated).
   Does not go through queue approval flow — founder_confirmed=true IS the approval.

---

## Implementation Files

### Modified:
- `apps/sovereign-tower/src/lib/wa-adapter.ts` — Added: validateWebhookToken,
  normalizeSenderPhone, insertInboundWaLog, getGateQueue, getQueueItemById,
  approveQueueItem, rejectQueueItem, checkBroadcastGate, executeBroadcast,
  BROADCAST_MAX_TARGETS, FonnteInboundPayload interface
- `apps/sovereign-tower/src/routes/wa.ts` — Added: webhook route, queue routes,
  broadcast route. Updated imports.
- `apps/sovereign-tower/src/app.ts` — Added middleware exception for /api/wa/webhook,
  updated session to 3g, updated endpoint list
- `apps/sovereign-tower/src/lib/app-config.ts` — Added WA_WEBHOOK, WA_QUEUE,
  WA_BROADCAST routes, updated TOWER_BUILD_SESSION to '3g'

### Created:
- `evidence/architecture/ADR-019-session-3g-inbound-webhook-human-gate-broadcast.md`

### Not Created (existing schema sufficient):
- No new DB migrations needed — wa_logs already has direction, requires_approval,
  approved_by, approved_at fields from migration 001-wa-logs.sql

---

## Route Summary (Post-3g)

| Route | Auth | Session | Purpose |
|-------|------|---------|---------|
| GET /api/wa/status | JWT+founder | 3f | Device status |
| GET /api/wa/logs | JWT+founder | 3f | Audit trail |
| POST /api/wa/test | JWT+founder | 3f | Test send |
| POST /api/wa/send | JWT+founder | 3f | Single send |
| POST /api/wa/webhook | PUBLIC (?token=) | 3g | Inbound from Fonnte |
| GET /api/wa/queue | JWT+founder | 3g | Human-gate queue |
| POST /api/wa/queue/:id/approve | JWT+founder | 3g | Approve queue item |
| POST /api/wa/queue/:id/reject | JWT+founder | 3g | Reject queue item |
| POST /api/wa/broadcast | JWT+founder | 3g | Gated broadcast (max 10) |

---

## Consequences

**Positive:**
- Inbound WA flow is no longer missing — complete bidirectional WA capability
- Human gate queue is real and operational — founder has full control
- Broadcast is gated — accidental bulk send is impossible
- All activity logged to wa_logs — complete audit trail
- No new DB tables needed — reuses existing schema

**Constraints preserved:**
- No auto-send loop
- No uncontrolled broadcast
- Founder sovereignty intact
- Least privilege maintained
- No credential exposure

**Next steps after 3g:**
- Configure Fonnte webhook URL to point at https://sovereign-tower.pages.dev/api/wa/webhook?token=<FONNTE_DEVICE_TOKEN>
- Test inbound webhook with a real WA message
- Use GET /api/wa/queue to see received messages and pending gate items
- Proceed to Sprint 2: ScoutScorer Agent (GROQ_API_KEY already configured)

---

*ADR-019 | Session 3g | 2026-04-07 | CLASSIFIED — FOUNDER ACCESS ONLY*
