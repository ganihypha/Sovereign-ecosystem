// sovereign-tower — src/routes/wa.ts
// WhatsApp / Fonnte Routes — Session 3f
// Sovereign Business Engine v4.0
//
// ⚠️ SECURITY RULES (non-negotiable):
//   - NEVER return token values in responses
//   - NEVER create auto-send loops
//   - All send operations MUST be logged to wa_logs
//   - Broadcast DISABLED — single target only per request
//   - All routes require JWT auth (enforced at app-level middleware)
//
// Routes:
//   GET  /api/wa/status     → device status + env readiness
//   GET  /api/wa/logs       → recent wa_logs entries (audit trail)
//   POST /api/wa/test       → minimal test send (founder-gated, single target)
//   POST /api/wa/send       → founder-controlled send (single target)
//
// ADR-012: WA routes activation pattern — narrow, logged, founder-controlled

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
  const session = '3f'

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

  // Check wa_logs table
  let waLogsExists = false
  let waLogsCount = 0
  if (dbCreds) {
    const db = tryCreateDbClient(env)
    if (db) {
      waLogsExists = await checkWaLogsTableExists(db)
      if (waLogsExists) {
        const logs = await getRecentWaLogs(db, 1)
        // Just check accessibility, count separately
        waLogsCount = -1 // unknown without count query
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

      // DB status
      db: {
        credentials_present: dbCreds,
        wa_logs_table_exists: waLogsExists,
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
