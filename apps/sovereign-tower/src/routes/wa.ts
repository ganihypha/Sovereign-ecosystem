// sovereign-tower — src/routes/wa.ts
// WhatsApp / Fonnte Routes — Session 3f + 3g
// Sovereign Business Engine v4.0
//
// ⚠️ SECURITY RULES (non-negotiable):
//   - NEVER return token values in responses
//   - NEVER create auto-send loops
//   - All send operations MUST be logged to wa_logs
//   - Broadcast REQUIRES founder_confirmed:true flag + max 10 targets
//   - JWT auth enforced at app-level middleware (except /webhook)
//
// Routes (Session 3f):
//   GET  /api/wa/status     → device status + env readiness
//   GET  /api/wa/logs       → recent wa_logs entries (audit trail)
//   POST /api/wa/test       → minimal test send (founder-gated, single target)
//   POST /api/wa/send       → founder-controlled send (single target)
//
// Routes (Session 3g — ADDED):
//   POST /api/wa/webhook    → Fonnte inbound webhook (PUBLIC, token-gated via ?token=)
//   GET  /api/wa/queue      → human-gate queue (requires_approval=true, status=pending)
//   POST /api/wa/queue/:id/approve → founder approves queue item
//   POST /api/wa/queue/:id/reject  → founder rejects queue item
//   POST /api/wa/broadcast  → gated broadcast (founder_confirmed:true required, max 10 targets)
//
// ADR-012: WA routes activation pattern — narrow, logged, founder-controlled
// ADR-019: Session 3g — inbound webhook, human-gate queue, broadcast gating

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import {
  hasFonnteCredentials,
  getFonnteToken,
  fonnteGetDeviceStatus,
  waSendAndLog,
  checkWaLogsTableExists,
  getRecentWaLogs,
  isValidPhone,
  // Session 3g additions
  validateWebhookToken,
  normalizeSenderPhone,
  insertInboundWaLog,
  getGateQueue,
  getPendingQueue,
  getQueueItemById,
  approveQueueItem,
  rejectQueueItem,
  checkBroadcastGate,
  executeBroadcast,
  BROADCAST_MAX_TARGETS,
  // Session 4G additions
  getFonnteEnvReport,
  getWaAuditTrail,
  WA_STATUS_LABELS,
} from '../lib/wa-adapter'
import { tryCreateDbClient, hasDbCredentials } from '../lib/db-adapter'

// =============================================================================
// ROUTER SETUP
// =============================================================================

type WaContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

export const waRouter = new Hono<WaContext>()

// =============================================================================
// GET /api/wa/status — Device status + env readiness
// =============================================================================

/**
 * GET /api/wa/status
 *
 * Returns:
 * - fonnte_credentials_present: true/false (by name only, no values)
 * - db_credentials_present: true/false
 * - wa_logs_table_exists: true/false
 * - device_status: from Fonnte API (if credentials present)
 *
 * ⚠️ Does NOT return token values — only presence indicators
 */
waRouter.get('/status', async (c: Context<WaContext>) => {
  const env = c.env
  const session = '4g' // SESSION 4G UPDATE

  // Check credentials by name only
  const fonnteCreds = hasFonnteCredentials(env)
  const dbCreds = hasDbCredentials(env)

  // Check env vars by name
  const envReadiness = {
    FONNTE_ACCOUNT_TOKEN: !!(env.FONNTE_ACCOUNT_TOKEN && env.FONNTE_ACCOUNT_TOKEN.length > 0),
    FONNTE_DEVICE_TOKEN: !!(env.FONNTE_DEVICE_TOKEN && env.FONNTE_DEVICE_TOKEN.length > 0),
    JWT_SECRET: !!(env.JWT_SECRET && env.JWT_SECRET.length > 0),
    SUPABASE_URL: !!(env.SUPABASE_URL && env.SUPABASE_URL.length > 0),
    SUPABASE_SERVICE_ROLE_KEY: !!(env.SUPABASE_SERVICE_ROLE_KEY && (env.SUPABASE_SERVICE_ROLE_KEY as string).length > 0),
  }

  // SESSION 4G: Token/env clarity report
  const fonnteEnvReport = getFonnteEnvReport(env)

  // Check wa_logs table
  let waLogsExists = false
  let waLogsCount = 0
  let pendingCount = 0
  if (dbCreds) {
    const db = tryCreateDbClient(env)
    if (db) {
      waLogsExists = await checkWaLogsTableExists(db)
      if (waLogsExists) {
        const logs = await getRecentWaLogs(db, 1)
        // Just check accessibility, count separately
        waLogsCount = -1 // unknown without count query
        // SESSION 4G: also count pending items
        try {
          const pending = await getPendingQueue(db, 100)
          pendingCount = pending.length
        } catch { pendingCount = -1 }
      }
    }
  }

  // Get device status from Fonnte if credentials present
  let deviceStatus: any = null
  let deviceError: string | null = null
  if (fonnteCreds) {
    const token = getFonnteToken(env)!
    const result = await fonnteGetDeviceStatus(token)
    if (result.success) {
      deviceStatus = result.devices ?? []
    } else {
      deviceError = result.error ?? 'Device status unavailable'
    }
  }

  const isReady = fonnteCreds && dbCreds && waLogsExists
  const blockers: string[] = []
  if (!fonnteCreds) blockers.push('FONNTE_ACCOUNT_TOKEN or FONNTE_TOKEN missing')
  if (!dbCreds) blockers.push('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing')
  if (!waLogsExists) blockers.push('wa_logs table not found — run migration/sql/001-wa-logs.sql')
  if (deviceError) blockers.push(`device_check: ${deviceError}`)

  return c.json(
    successResponse({
      module: 'wa',
      session,
      status: isReady ? 'ready' : (blockers.length > 0 ? 'blocked' : 'partial'),
      is_ready_to_send: isReady && deviceStatus !== null && deviceStatus.length > 0,

      // Env readiness (names only, no values)
      env_readiness: envReadiness,

      // SESSION 4G: Token/env clarity report (no values, only metadata)
      fonnte_env_report: fonnteEnvReport,

      // DB status
      db: {
        credentials_present: dbCreds,
        wa_logs_table_exists: waLogsExists,
        pending_approval_count: pendingCount,
      },

      // Device info (no token values)
      fonnte: {
        credentials_present: fonnteCreds,
        device_status: deviceStatus ?? null,
        device_error: deviceError ?? null,
        note: fonnteCreds ? 'credentials present' : 'credentials missing — check FONNTE_ACCOUNT_TOKEN',
      },

      blockers,
      note: isReady ? 'WA routes ready — send via POST /api/wa/send' : `Blockers: ${blockers.join(', ')}`,
    }),
    200
  )
})

// =============================================================================
// GET /api/wa/logs — Recent wa_logs entries (audit trail)
// =============================================================================

/**
 * GET /api/wa/logs?limit=10
 *
 * Returns recent wa_logs entries for founder audit trail.
 * ⚠️ Returns phone numbers (business necessity for review)
 * ⚠️ Does NOT return fonnte token values
 */
waRouter.get('/logs', async (c: Context<WaContext>) => {
  const env = c.env
  const session = '3f'

  const limitParam = c.req.query('limit')
  const limit = Math.min(parseInt(limitParam ?? '10', 10) || 10, 50)

  if (!hasDbCredentials(env)) {
    return c.json(
      errorResponse('DB_NOT_CONFIGURED', 'Database credentials missing — SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required'),
      503
    )
  }

  const db = tryCreateDbClient(env)
  if (!db) {
    return c.json(
      errorResponse('DB_CLIENT_FAILED', 'Failed to create DB client'),
      503
    )
  }

  const logsExist = await checkWaLogsTableExists(db)
  if (!logsExist) {
    return c.json(
      successResponse({
        module: 'wa-logs',
        session,
        status: 'table-missing',
        logs: [],
        total: 0,
        note: 'wa_logs table not found. Run migration: migration/sql/001-wa-logs.sql',
        blocker: 'MIGRATION_NOT_APPLIED',
      }),
      200
    )
  }

  const logs = await getRecentWaLogs(db, limit)

  return c.json(
    successResponse({
      module: 'wa-logs',
      session,
      status: 'live',
      logs: logs.map((l: any) => ({
        id: l.id,
        direction: l.direction,
        phone: l.phone,  // needed for founder review
        message_body: (l.message_body as string)?.slice(0, 200) ?? '',  // truncate for safety
        status: l.status,
        requires_approval: l.requires_approval,
        sent_by: l.sent_by,
        fonnte_message_id: l.fonnte_message_id ?? null,
        sent_at: l.sent_at ?? null,
        created_at: l.created_at,
      })),
      total: logs.length,
      limit,
      note: `Last ${logs.length} WA log entries`,
    }),
    200
  )
})

// =============================================================================
// POST /api/wa/test — Minimal safe test path (FOUNDER-GATED)
// =============================================================================

/**
 * POST /api/wa/test
 *
 * Body: { phone: string, message: string }
 *
 * Minimal test send — FOUNDER only.
 * Requirements:
 * - Single target only (no bulk/broadcast)
 * - Must log to wa_logs
 * - Must distinguish attempted vs confirmed
 * - Explicit "test mode" label in message + log
 *
 * Use this BEFORE full /api/wa/send to verify Fonnte connectivity.
 */
waRouter.post('/test', async (c: Context<WaContext>) => {
  const env = c.env
  const session = '3f'

  // Check Fonnte credentials by name
  if (!hasFonnteCredentials(env)) {
    return c.json(
      errorResponse(
        'FONNTE_CREDENTIALS_MISSING',
        'Fonnte credentials not configured. Required: FONNTE_ACCOUNT_TOKEN or FONNTE_TOKEN in Cloudflare secrets.'
      ),
      503
    )
  }

  // Parse body
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body must be valid JSON'), 400)
  }

  const { phone, message } = body ?? {}

  // Validate phone
  if (!phone || typeof phone !== 'string') {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'phone is required (format: +628xxx or 08xxx)'),
      400
    )
  }

  if (!isValidPhone(phone)) {
    return c.json(
      errorResponse('VALIDATION_ERROR', `Invalid phone format: ${phone.slice(0, 12)}... Expected: +628xxx / 628xxx / 08xxx`),
      400
    )
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'message is required and must be non-empty string'),
      400
    )
  }

  if (message.length > 1000) {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'message too long (max 1000 chars for test)'),
      400
    )
  }

  // Create test message with prefix (audit clarity)
  const testMessage = `[SOVEREIGN TEST - ${new Date().toISOString().slice(0, 10)}] ${message.trim()}`

  // Get DB client (optional — if missing, still attempt send)
  const db = hasDbCredentials(env) ? tryCreateDbClient(env) : null

  // Execute send + log
  const result = await waSendAndLog({
    env,
    db,
    phone,
    message: testMessage,
    sent_by: 'founder',
    log_first: true,
  })

  // Build response — distinguish attempted vs confirmed
  const httpStatus = result.confirmed ? 201 : (result.attempted ? 202 : 400)

  return c.json(
    successResponse({
      module: 'wa-test',
      session,

      // Delivery classification (strict honesty)
      delivery_status: result.confirmed
        ? 'CONFIRMED'  // Fonnte returned status: true
        : result.attempted
          ? 'ATTEMPTED_NOT_CONFIRMED'  // sent to Fonnte but no confirmation
          : 'NOT_ATTEMPTED',  // blocked before send

      // Log status
      logged: result.logged,
      log_id: result.log_id ?? null,

      // Fonnte tracking
      fonnte_message_id: result.fonnte_message_id ?? null,
      final_status: result.final_status,

      // Error (if any)
      error: result.error ?? null,

      note: result.confirmed
        ? 'Message sent and confirmed by Fonnte provider'
        : result.attempted
          ? 'Message attempted — provider confirmation pending or failed'
          : `Send blocked: ${result.error ?? 'unknown reason'}`,

      security_note: 'No token values exposed. Phone number retained for audit trail.',
    }),
    httpStatus
  )
})

// =============================================================================
// POST /api/wa/send — Founder-controlled single send
// =============================================================================

/**
 * POST /api/wa/send
 *
 * Body: { phone: string, message: string, dry_run?: boolean }
 *
 * Full send endpoint — FOUNDER only.
 * - single target only (no broadcast)
 * - always logged to wa_logs
 * - dry_run=true → log only, no actual send (safe preview)
 * - requires_approval default: false (founder-triggered = pre-approved)
 */
waRouter.post('/send', async (c: Context<WaContext>) => {
  const env = c.env
  const session = '3f'

  // Check Fonnte credentials
  if (!hasFonnteCredentials(env)) {
    return c.json(
      errorResponse(
        'FONNTE_CREDENTIALS_MISSING',
        'Fonnte credentials not configured. Required: FONNTE_ACCOUNT_TOKEN in Cloudflare secrets.'
      ),
      503
    )
  }

  // Parse body
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body must be valid JSON'), 400)
  }

  const { phone, message, dry_run } = body ?? {}
  const isDryRun = dry_run === true

  // Validate phone
  if (!phone || typeof phone !== 'string') {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'phone is required'),
      400
    )
  }

  if (!isValidPhone(phone)) {
    return c.json(
      errorResponse('VALIDATION_ERROR', `Invalid phone format. Expected: +628xxx / 628xxx / 08xxx`),
      400
    )
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'message is required and must be non-empty'),
      400
    )
  }

  if (message.length > 4000) {
    return c.json(
      errorResponse('VALIDATION_ERROR', 'message too long (max 4000 chars)'),
      400
    )
  }

  // Get DB client
  const db = hasDbCredentials(env) ? tryCreateDbClient(env) : null

  // DRY RUN mode — log only, no actual send
  if (isDryRun) {
    // Insert wa_log with status 'pending', requires_approval: true for visibility
    let logId: string | null = null
    if (db) {
      const { insertWaLog: insertLog } = await import('../lib/wa-adapter')
      const logEntry = await insertLog(db, {
        direction: 'outbound',
        phone: phone,
        message_body: message.trim(),
        status: 'pending',
        requires_approval: true,  // dry_run = pending approval
        sent_by: 'founder',
      })
      logId = logEntry?.id ?? null
    }

    return c.json(
      successResponse({
        module: 'wa-send',
        session,
        mode: 'DRY_RUN',
        delivery_status: 'NOT_SENT',
        logged: logId !== null,
        log_id: logId,
        note: 'dry_run=true: message logged as pending (requires_approval=true), NOT sent to Fonnte. Set dry_run=false to actually send.',
      }),
      200
    )
  }

  // LIVE SEND
  const result = await waSendAndLog({
    env,
    db,
    phone,
    message: message.trim(),
    sent_by: 'founder',
    log_first: true,
  })

  const httpStatus = result.confirmed ? 201 : (result.attempted ? 202 : 400)

  return c.json(
    successResponse({
      module: 'wa-send',
      session,
      mode: 'LIVE',

      // Delivery classification
      delivery_status: result.confirmed
        ? 'CONFIRMED'
        : result.attempted
          ? 'ATTEMPTED_NOT_CONFIRMED'
          : 'NOT_ATTEMPTED',

      // Audit trail
      logged: result.logged,
      log_id: result.log_id ?? null,

      // Provider result
      fonnte_message_id: result.fonnte_message_id ?? null,
      final_status: result.final_status,

      error: result.error ?? null,

      note: result.confirmed
        ? 'Message sent — Fonnte confirmed'
        : result.attempted
          ? 'Message sent to Fonnte — awaiting confirmation'
          : `Send failed: ${result.error ?? 'unknown'}`,
    }),
    httpStatus
  )
})

// =============================================================================
// POST /api/wa/webhook — Fonnte Inbound Webhook (SESSION 3G)
// =============================================================================

/**
 * POST /api/wa/webhook?token=<FONNTE_DEVICE_TOKEN>
 *
 * ⚠️ PUBLIC ROUTE — tidak require JWT (Fonnte webhook tidak bisa kirim JWT)
 * ⚠️ GATED via query param token — must match FONNTE_DEVICE_TOKEN
 *
 * Fonnte akan POST ke URL ini setiap kali ada pesan masuk ke device kita.
 * Payload format: { sender, device, message, type, timestamp, name, ... }
 *
 * Flow:
 * 1. Validate ?token param against FONNTE_DEVICE_TOKEN
 * 2. Parse payload
 * 3. Normalize sender phone
 * 4. Log to wa_logs (direction: 'inbound', status: 'delivered')
 * 5. Return 200 immediately (Fonnte tidak retry jika 200)
 *
 * Silent failure prevention:
 * - Return 200 ALWAYS after token pass (even if DB insert fails)
 * - Log error internally if DB fails
 * - Never return 4xx/5xx to Fonnte (causes retry storm)
 */
waRouter.post('/webhook', async (c: Context<WaContext>) => {
  const env = c.env

  // GATE: validate webhook token
  const incomingToken = c.req.query('token')
  if (!validateWebhookToken(incomingToken, env)) {
    // Return 401 only for token failure — this is not a Fonnte client, so retry is fine
    return c.json(
      errorResponse('WEBHOOK_TOKEN_INVALID', 'Invalid or missing webhook token'),
      401
    )
  }

  // Parse payload (graceful — never crash on bad payload)
  let payload: Record<string, unknown> = {}
  try {
    const raw = await c.req.text()
    if (raw) {
      try {
        payload = JSON.parse(raw) as Record<string, unknown>
      } catch {
        // Try form-urlencoded (Fonnte sometimes sends form data)
        const formData = new URLSearchParams(raw)
        // Build object manually to avoid TS iterator compatibility issues
        const obj: Record<string, string> = {}
        formData.forEach((value, key) => { obj[key] = value })
        payload = obj
      }
    }
  } catch {
    // Payload parse failed — log and continue (return 200 to prevent retry)
    console.error('[wa-webhook] Failed to parse payload body')
  }

  // Extract sender + message
  const rawSender = (payload.sender as string) || ''
  const messageText = (payload.message as string) || ''
  const messageType = (payload.type as string) || 'unknown'
  const senderName = (payload.name as string) || ''

  // Normalize sender phone
  const senderPhone = rawSender ? normalizeSenderPhone(rawSender) : 'unknown'

  // Log to wa_logs if DB available
  let logId: string | null = null
  let logError: string | null = null

  if (hasDbCredentials(env)) {
    const db = tryCreateDbClient(env)
    if (db) {
      const logEntry = await insertInboundWaLog(db, {
        phone: senderPhone,
        message_body: messageText
          ? messageText.slice(0, 2000) // truncate for safety
          : `[${messageType} message — no text content]`,
      })
      if (logEntry) {
        logId = logEntry.id
      } else {
        logError = 'DB insert failed — audit trail incomplete'
        console.error('[wa-webhook] Failed to insert inbound wa_log for sender:', senderPhone.slice(0, 8))
      }
    }
  }

  // Always return 200 after token validation — prevent Fonnte retry storm
  // Internal log reflects actual state
  console.log(`[wa-webhook] inbound from ${senderPhone.slice(0, 8)}... type=${messageType} log_id=${logId ?? 'null'} ${logError ?? 'ok'}`)

  return c.json(
    successResponse({
      module: 'wa-webhook',
      session: '4g',
      status: 'received',
      logged: logId !== null,
      log_id: logId,
      direction: 'inbound',
      message_type: messageType,
      // SESSION 4G: diagnostic fields for inbound verification
      db_available: hasDbCredentials(env),
      log_status: logId ? 'persisted' : (logError ? 'failed' : 'skipped_no_db'),
      note: logError
        ? `Received — log warning: ${logError}`
        : 'Inbound message received and logged',
      sender_name: senderName || null,
    }),
    200
  )
})

// =============================================================================
// GET /api/wa/queue — Human-Gate Queue (SESSION 3G, 4G HARDENED)
// =============================================================================

/**
 * GET /api/wa/queue?limit=20&filter=pending|approved|all
 *
 * SESSION 4G HARDENED:
 * - Default returns both 'pending' and 'approved' items (full action queue)
 * - filter=pending → only items awaiting review
 * - filter=approved → only items approved but not yet sent
 * - filter=all → same as default
 *
 * Requires JWT + founderOnly (inherited from app-level middleware)
 */
waRouter.get('/queue', async (c: Context<WaContext>) => {
  const env = c.env

  if (!hasDbCredentials(env)) {
    return c.json(
      errorResponse('DB_NOT_CONFIGURED', 'Database credentials missing'),
      503
    )
  }

  const db = tryCreateDbClient(env)
  if (!db) {
    return c.json(errorResponse('DB_CLIENT_FAILED', 'Failed to create DB client'), 503)
  }

  const limitParam = c.req.query('limit')
  const filter = c.req.query('filter') ?? 'all'
  const limit = Math.min(parseInt(limitParam ?? '20', 10) || 20, 50)

  let queue: any[]
  if (filter === 'pending') {
    queue = await getPendingQueue(db, limit)
  } else {
    // default / 'approved' / 'all' → get full action queue
    queue = await getGateQueue(db, limit)
  }

  const pendingCount = queue.filter((i: any) => i.status === 'pending').length
  const approvedCount = queue.filter((i: any) => i.status === 'approved').length

  return c.json(
    successResponse({
      module: 'wa-queue',
      session: '4g',
      status: 'live',
      filter_applied: filter,
      queue: queue.map((item: any) => ({
        id: item.id,
        direction: item.direction,
        phone: item.phone,
        message_preview: (item.message_body as string)?.slice(0, 200) ?? '',
        status: item.status,
        status_label: WA_STATUS_LABELS[item.status as keyof typeof WA_STATUS_LABELS] ?? item.status,
        requires_approval: item.requires_approval,
        sent_by: item.sent_by,
        created_at: item.created_at,
        approved_at: item.approved_at ?? null,
        // SESSION 4G: show next action based on status
        next_action: item.status === 'pending'
          ? `POST /api/wa/queue/${item.id}/approve or /reject`
          : item.status === 'approved'
          ? `POST /api/agents/send-approved/${item.id}`
          : null,
      })),
      summary: {
        total: queue.length,
        pending_review: pendingCount,
        approved_ready_to_send: approvedCount,
      },
      limit,
      note: queue.length === 0
        ? 'No items in action queue'
        : `${pendingCount} pending review, ${approvedCount} approved (ready to send)`,
    }),
    200
  )
})

// =============================================================================
// POST /api/wa/queue/:id/approve — Approve Queue Item (SESSION 3G, 4G HARDENED)
// =============================================================================

/**
 * POST /api/wa/queue/:id/approve
 *
 * SESSION 4G HARDENED: Status after approve = 'approved' (was 'sent' in 3G)
 * 'approved' = founder reviewed and approved, NOT yet dispatched to Fonnte.
 * Actual send: POST /api/agents/send-approved/:id
 *
 * State machine: pending → approved → (POST /api/agents/send-approved/:id) → sent → delivered
 *
 * Requires JWT + founderOnly
 */
waRouter.post('/queue/:id/approve', async (c: Context<WaContext>) => {
  const env = c.env
  const id = c.req.param('id')

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Queue item id is required'), 400)
  }

  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials missing'), 503)
  }

  const db = tryCreateDbClient(env)
  if (!db) {
    return c.json(errorResponse('DB_CLIENT_FAILED', 'Failed to create DB client'), 503)
  }

  // Verify item exists and is pending
  const item = await getQueueItemById(db, id)
  if (!item) {
    return c.json(
      errorResponse('QUEUE_ITEM_NOT_FOUND', `Queue item ${id.slice(0, 8)}... not found`),
      404
    )
  }

  if (item.status !== 'pending' || !item.requires_approval) {
    return c.json(
      errorResponse(
        'QUEUE_ITEM_NOT_PENDING',
        `Item is not in pending gate state (status: ${item.status}, requires_approval: ${item.requires_approval})`
      ),
      409
    )
  }

  // Get founder user ID from JWT payload (if available)
  let founderUserId: string | undefined
  try {
    const jwtPayload = c.get('jwtPayload' as any) as any
    founderUserId = jwtPayload?.sub ?? jwtPayload?.userId ?? undefined
  } catch {
    // JWT payload extraction failed — continue without userId
  }

  const result = await approveQueueItem(db, id, founderUserId)

  if (!result.success) {
    return c.json(
      errorResponse('APPROVE_FAILED', result.error ?? 'Failed to approve queue item'),
      500
    )
  }

  return c.json(
    successResponse({
      module: 'wa-queue-approve',
      session: '4g',
      status: 'approved',
      new_status: 'approved', // SESSION 4G: was 'sent', now correctly 'approved'
      id,
      phone: item.phone,
      message_preview: (item.message_body as string)?.slice(0, 100) ?? '',
      ...(result.note ? { governance_note: result.note } : {}),
      note: 'Gate cleared — item status set to \'approved\'. Message NOT auto-sent. Use POST /api/agents/send-approved/:id to dispatch.',
      next_action: `POST /api/agents/send-approved/${id}`,
    }),
    200
  )
})

// =============================================================================
// POST /api/wa/queue/:id/reject — Reject Queue Item (SESSION 3G, 4G HARDENED)
// =============================================================================

/**
 * POST /api/wa/queue/:id/reject
 *
 * SESSION 4G HARDENED: Supports rejection_reason body param.
 * Effect: status → 'rejected_by_founder', rejected_at = now, rejection_reason saved
 * Item stays in wa_logs for full audit trail.
 *
 * Body (optional): { reason: "why rejected" }
 *
 * Requires JWT + founderOnly
 */
waRouter.post('/queue/:id/reject', async (c: Context<WaContext>) => {
  const env = c.env
  const id = c.req.param('id')

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Queue item id is required'), 400)
  }

  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials missing'), 503)
  }

  const db = tryCreateDbClient(env)
  if (!db) {
    return c.json(errorResponse('DB_CLIENT_FAILED', 'Failed to create DB client'), 503)
  }

  // Verify item exists and is pending
  const item = await getQueueItemById(db, id)
  if (!item) {
    return c.json(
      errorResponse('QUEUE_ITEM_NOT_FOUND', `Queue item ${id.slice(0, 8)}... not found`),
      404
    )
  }

  if (item.status !== 'pending') {
    return c.json(
      errorResponse(
        'QUEUE_ITEM_NOT_PENDING',
        `Item is not in pending state (current status: ${item.status})`
      ),
      409
    )
  }

  // Get founder user ID from JWT payload
  let founderUserId: string | undefined
  try {
    const jwtPayload = c.get('jwtPayload' as any) as any
    founderUserId = jwtPayload?.sub ?? jwtPayload?.userId ?? undefined
  } catch {
    // Continue without userId
  }

  // SESSION 4G: Extract rejection reason from body (optional)
  let rejectionReason: string | undefined
  try {
    const body = await c.req.json().catch(() => ({}))
    if (body?.reason && typeof body.reason === 'string') {
      rejectionReason = body.reason.slice(0, 500)
    }
  } catch {
    // No body or parse error — rejection_reason remains undefined
  }

  const result = await rejectQueueItem(db, id, founderUserId, rejectionReason)

  if (!result.success) {
    return c.json(
      errorResponse('REJECT_FAILED', result.error ?? 'Failed to reject queue item'),
      500
    )
  }

  return c.json(
    successResponse({
      module: 'wa-queue-reject',
      session: '4g',
      status: 'rejected',
      id,
      phone: item.phone,
      message_preview: (item.message_body as string)?.slice(0, 100) ?? '',
      rejection_reason: rejectionReason ?? null,
      note: 'Item rejected — status set to rejected_by_founder. Audit trail preserved in wa_logs.',
    }),
    200
  )
})

// =============================================================================
// GET /api/wa/audit/:id — Get Full Audit Trail for a Message (SESSION 4G)
// =============================================================================

/**
 * GET /api/wa/audit/:id
 *
 * SESSION 4G: Get full lifecycle audit trail for a specific wa_logs item.
 * Returns all state transitions including: created → approved → sent → delivered
 * Plus rejection details if rejected.
 *
 * Requires JWT + founderOnly
 */
waRouter.get('/audit/:id', async (c: Context<WaContext>) => {
  const env = c.env
  const id = c.req.param('id')

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Message id is required'), 400)
  }

  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials missing'), 503)
  }

  const db = tryCreateDbClient(env)
  if (!db) {
    return c.json(errorResponse('DB_CLIENT_FAILED', 'Failed to create DB client'), 503)
  }

  const trail = await getWaAuditTrail(db, id)
  if (!trail) {
    return c.json(errorResponse('NOT_FOUND', `Message ${id.slice(0, 8)}... not found`), 404)
  }

  return c.json(
    successResponse({
      module: 'wa-audit',
      session: '4g',
      id: trail.id,
      status: trail.status,
      status_label: WA_STATUS_LABELS[trail.status as keyof typeof WA_STATUS_LABELS] ?? trail.status,
      direction: trail.direction,
      phone: trail.phone,
      message_preview: trail.message_body?.slice(0, 100) ?? '',
      requires_approval: trail.requires_approval,
      sent_by: trail.sent_by,
      timestamps: {
        created_at: trail.created_at,
        approved_at: trail.approved_at ?? null,
        rejected_at: trail.rejected_at ?? null,
        sent_at: trail.sent_at ?? null,
        delivered_at: trail.delivered_at ?? null,
      },
      approver: trail.approved_by ?? null,
      rejection_reason: trail.rejection_reason ?? null,
      fonnte_message_id: trail.fonnte_message_id ?? null,
      lifecycle_summary: trail.lifecycle_summary,
    }),
    200
  )
})

// =============================================================================
// POST /api/wa/broadcast — Gated Broadcast (SESSION 3G)
// =============================================================================

/**
 * POST /api/wa/broadcast
 *
 * Body: {
 *   founder_confirmed: true,   ← REQUIRED — must be exactly boolean true
 *   targets: string[],          ← Array of phone numbers (max 10)
 *   message: string             ← Message to broadcast
 * }
 *
 * Multi-gate broadcast — ALL gates must pass:
 * 1. JWT + founderOnly (app-level middleware)
 * 2. founder_confirmed: true in body (explicit double confirmation)
 * 3. targets.length <= BROADCAST_MAX_TARGETS (hardcoded: 10)
 * 4. All targets are valid phone numbers
 * 5. Message is non-empty and <= 4000 chars
 *
 * Execution:
 * - Sequential send (no parallel fire) — each target logged separately
 * - Each send has own wa_log entry
 * - Returns per-target result for full transparency
 *
 * ⚠️ No auto-send from queue — broadcast is always explicit founder action
 * ⚠️ Fonnte credentials required
 */
waRouter.post('/broadcast', async (c: Context<WaContext>) => {
  const env = c.env
  const session = '3g'

  // Check Fonnte credentials
  if (!hasFonnteCredentials(env)) {
    return c.json(
      errorResponse(
        'FONNTE_CREDENTIALS_MISSING',
        'Fonnte credentials not configured — broadcast blocked'
      ),
      503
    )
  }

  // Parse body
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body must be valid JSON'), 400)
  }

  const { founder_confirmed, targets, message } = body ?? {}

  // Run broadcast gate checks
  const gateResult = checkBroadcastGate({ founder_confirmed, targets, message })
  if (!gateResult.allowed) {
    return c.json(
      errorResponse('BROADCAST_GATE_BLOCKED', gateResult.reason ?? 'Broadcast gate check failed', {
        invalid_targets: gateResult.invalid_targets ?? [],
        gate_rules: {
          requires: 'founder_confirmed=true, non-empty targets array, valid phones, message ≤ 4000 chars',
          max_targets: BROADCAST_MAX_TARGETS,
        },
      }),
      400
    )
  }

  // Get DB client
  const db = hasDbCredentials(env) ? tryCreateDbClient(env) : null

  // Execute broadcast (sequential, logged)
  const results = await executeBroadcast({
    env,
    db,
    targets: (targets as string[]),
    message: (message as string).trim(),
    sent_by: 'founder',
  })

  const confirmed = results.filter(r => r.delivery_status === 'CONFIRMED').length
  const failed = results.filter(r => r.delivery_status !== 'CONFIRMED').length

  const allConfirmed = confirmed === results.length

  return c.json(
    successResponse({
      module: 'wa-broadcast',
      session,
      status: allConfirmed ? 'all_confirmed' : (confirmed > 0 ? 'partial_success' : 'all_failed'),

      summary: {
        total_targets: results.length,
        confirmed,
        failed,
      },

      results: results.map(r => ({
        phone: r.phone,
        log_id: r.log_id,
        delivery_status: r.delivery_status,
        fonnte_message_id: r.fonnte_message_id ?? null,
        error: r.error ?? null,
      })),

      note: allConfirmed
        ? `All ${confirmed} message(s) sent and confirmed`
        : `${confirmed}/${results.length} confirmed — ${failed} failed (see results for details)`,

      security_note: 'Broadcast gated — all sends logged to wa_logs. No token values exposed.',
    }),
    allConfirmed ? 201 : 207
  )
})
