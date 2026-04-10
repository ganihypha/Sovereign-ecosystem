// sovereign-tower — src/lib/wa-adapter.ts
// Fonnte WhatsApp Adapter — Session 3f + 3g
// Live implementation yang wrap Fonnte API untuk sovereign-tower
//
// ⚠️ SECURITY RULES (non-negotiable):
//   - NEVER log token/key values
//   - NEVER return raw token in response
//   - All outbound WA MUST be logged to wa_logs FIRST (audit trail)
//   - Delivery status is ATTEMPTED or CONFIRMED — never assume success
//   - Founder gate: requires_approval respected
//
// Scope Session 3f:
//   - POST /api/wa/send     → founder-triggered single send
//   - POST /api/wa/test     → minimal test path (single message)
//   - GET  /api/wa/status   → device status check
//   - GET  /api/wa/logs     → read wa_logs (recent entries)
//
// Scope Session 3g (ADDED):
//   - POST /api/wa/webhook         → inbound WA events from Fonnte (public, webhook-token gated)
//   - GET  /api/wa/queue           → human-gate queue (pending items requiring founder review)
//   - POST /api/wa/queue/:id/approve  → founder approves queued item
//   - POST /api/wa/queue/:id/reject   → founder rejects queued item
//   - POST /api/wa/broadcast       → gated broadcast (founder-only, requires explicit approval flag)
//
// ADR-012: WA adapter wraps Fonnte, tidak expose ke public, always logged to wa_logs
// ADR-019: Session 3g — inbound webhook, human-gate queue, broadcast gating

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js'
import type { TowerEnv } from './app-config'

// =============================================================================
// CONSTANTS
// =============================================================================

export const FONNTE_API_BASE = 'https://api.fonnte.com' as const

export const FONNTE_ENDPOINTS = {
  SEND: '/send',
  GET_DEVICES: '/get-devices',
  CHECK_NUMBER: '/validate-number',
} as const

// WA Log statuses — matches wa_logs.status CHECK constraint
export type WaLogStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'rejected_by_founder'

// =============================================================================
// ENV HELPERS
// =============================================================================

/**
 * Resolve Fonnte token untuk ACCOUNT/MANAGEMENT operations.
 * Priority: FONNTE_ACCOUNT_TOKEN > FONNTE_TOKEN > FONNTE_DEVICE_TOKEN
 * Return null jika tidak ada.
 */
export function getFonnteToken(env: TowerEnv): string | null {
  const token = env.FONNTE_ACCOUNT_TOKEN || env.FONNTE_TOKEN || env.FONNTE_DEVICE_TOKEN || null
  return token && token.length > 0 ? token : null
}

/**
 * Resolve Fonnte DEVICE token untuk SEND operations.
 * Fonnte memerlukan device-specific token untuk mengirim pesan.
 * Priority: FONNTE_DEVICE_TOKEN > FONNTE_TOKEN > FONNTE_ACCOUNT_TOKEN
 * ADR-012: Device token digunakan untuk /send, account token untuk /get-devices
 */
export function getFonnteDeviceToken(env: TowerEnv): string | null {
  const token = env.FONNTE_DEVICE_TOKEN || env.FONNTE_TOKEN || env.FONNTE_ACCOUNT_TOKEN || null
  return token && token.length > 0 ? token : null
}

/**
 * Cek apakah Fonnte credentials tersedia
 */
export function hasFonnteCredentials(env: TowerEnv): boolean {
  return getFonnteToken(env) !== null
}

// =============================================================================
// PHONE VALIDATION / NORMALIZATION
// =============================================================================

/**
 * Normalize nomor WA ke format Fonnte (628xxx tanpa +)
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '')
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  return cleaned
}

/**
 * Validasi format nomor WA Indonesia
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-]/g, '')
  return /^(\+62|62|0)[0-9]{8,13}$/.test(cleaned)
}

// =============================================================================
// WA LOG HELPERS (wa_logs table)
// =============================================================================

type DbClient = ReturnType<typeof createClient>

export interface WaLogInsert {
  direction: 'outbound' | 'inbound'
  phone: string
  message_body: string
  status: WaLogStatus
  requires_approval: boolean
  sent_by: 'founder' | 'agent' | 'system'
  fonnte_message_id?: string | null
  sent_at?: string | null
}

/**
 * Insert satu wa_log entry
 * Return inserted row atau null jika error
 */
export async function insertWaLog(db: DbClient, log: WaLogInsert): Promise<any | null> {
  try {
    const { data, error } = await db
      .from('wa_logs')
      .insert({
        direction: log.direction,
        phone: log.phone,
        message_body: log.message_body,
        status: log.status,
        requires_approval: log.requires_approval,
        sent_by: log.sent_by,
        fonnte_message_id: log.fonnte_message_id ?? null,
        sent_at: log.sent_at ?? null,
      } as any)
      .select()
      .single()
    if (error) {
      console.error('[wa-adapter] insertWaLog error:', error.message)
      return null
    }
    return data
  } catch (e: any) {
    console.error('[wa-adapter] insertWaLog exception:', e?.message ?? e)
    return null
  }
}

/**
 * Get recent wa_logs (last N entries, most recent first)
 */
export async function getRecentWaLogs(db: DbClient, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('wa_logs')
      .select('id, direction, phone, message_body, status, requires_approval, sent_by, fonnte_message_id, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as any[]
  } catch {
    return []
  }
}

/**
 * Cek apakah wa_logs table sudah ada dan accessible
 */
export async function checkWaLogsTableExists(db: DbClient): Promise<boolean> {
  try {
    const { error } = await db
      .from('wa_logs')
      .select('id')
      .limit(1)
    return !error
  } catch {
    return false
  }
}

/**
 * Update wa_log status setelah send attempt
 */
export async function updateWaLogStatus(
  db: DbClient,
  logId: string,
  updates: {
    status: WaLogStatus
    fonnte_message_id?: string | null
    sent_at?: string | null
  }
): Promise<boolean> {
  try {
    const updatePayload: any = {
      status: updates.status,
      fonnte_message_id: updates.fonnte_message_id ?? null,
      sent_at: updates.sent_at ?? null,
    }
    const { error } = await (db
      .from('wa_logs') as any)
      .update(updatePayload)
      .eq('id', logId)
    return !error
  } catch {
    return false
  }
}

// =============================================================================
// FONNTE HTTP CLIENT
// =============================================================================

export interface FonnteCallResult {
  /** true jika Fonnte returns status: true */
  success: boolean
  /** Fonnte message ID untuk tracking (jika ada) */
  fonnte_message_id?: string | null
  /** Error dari Fonnte atau network */
  error?: string
  /** Raw response dari Fonnte (tanpa token/secret) */
  provider_status?: boolean
  provider_detail?: string
}

/**
 * Kirim pesan teks via Fonnte API
 *
 * ⚠️ SECURITY: token tidak pernah di-return atau di-log sebagai value
 * ⚠️ Fungsi ini hanya dipanggil setelah wa_log sudah di-insert (audit trail dulu)
 *
 * @param token - Fonnte token dari env (tidak di-log)
 * @param phone - Nomor tujuan (sudah di-normalize)
 * @param message - Isi pesan
 * @returns FonnteCallResult
 */
export async function fonnteSendMessage(
  token: string,
  phone: string,
  message: string
): Promise<FonnteCallResult> {
  try {
    const body = new URLSearchParams({
      target: phone,
      message: message,
      countryCode: '62',
    })

    const response = await fetch(`${FONNTE_API_BASE}${FONNTE_ENDPOINTS.SEND}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const json = await response.json() as any

    // Fonnte response: { status: true/false, id?: string, reason?: string }
    if (json?.status === true) {
      return {
        success: true,
        fonnte_message_id: json?.id ?? null,
        provider_status: true,
        provider_detail: json?.detail ?? 'sent',
      }
    } else {
      return {
        success: false,
        error: json?.reason ?? 'Fonnte returned status: false',
        provider_status: false,
        provider_detail: json?.reason,
      }
    }
  } catch (e: any) {
    return {
      success: false,
      error: `Network error: ${e?.message ?? 'unknown'}`,
    }
  }
}

/**
 * Get Fonnte device status
 * Read-only — tidak perlu human gate
 */
export async function fonnteGetDeviceStatus(token: string): Promise<{
  success: boolean
  devices?: Array<{name: string; device: string; status: string; quota?: number}>
  error?: string
}> {
  try {
    const response = await fetch(`${FONNTE_API_BASE}${FONNTE_ENDPOINTS.GET_DEVICES}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: '',
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const json = await response.json() as any
    if (json?.status === true) {
      return {
        success: true,
        devices: (json?.data ?? []).map((d: any) => ({
          name: d.name ?? '',
          device: d.device ?? '',
          status: d.status ?? 'unknown',
          quota: d.quota ?? null,
        })),
      }
    } else {
      return { success: false, error: json?.reason ?? 'Device check failed' }
    }
  } catch (e: any) {
    return { success: false, error: `Network error: ${e?.message ?? 'unknown'}` }
  }
}

// =============================================================================
// COMBINED SEND + LOG FLOW
// =============================================================================

export interface WaSendAndLogParams {
  env: TowerEnv
  db: DbClient | null
  phone: string
  message: string
  sent_by: 'founder' | 'agent' | 'system'
  /** Jika true: insert log dulu (pending), lalu send, lalu update log */
  log_first: boolean
}

export interface WaSendAndLogResult {
  /** Berhasil di-log ke wa_logs */
  logged: boolean
  /** Log entry ID (jika logged) */
  log_id?: string | null
  /** Delivery attempt result */
  attempted: boolean
  /** Apakah Fonnte confirm delivered */
  confirmed: boolean
  /** Fonnte message ID */
  fonnte_message_id?: string | null
  /** Status akhir di wa_logs */
  final_status: WaLogStatus
  /** Error message jika gagal */
  error?: string
}

/**
 * Safe send flow:
 * 1. Insert wa_log dulu dengan status 'pending'
 * 2. Kirim via Fonnte
 * 3. Update wa_log dengan status final (sent/failed)
 *
 * Jika db tidak tersedia: hanya attempt send tanpa log
 * Jika Fonnte tidak tersedia: log sebagai failed, tidak kirim
 *
 * ⚠️ STRICTLY NO BROADCAST — single target only
 * ⚠️ No auto-send loop — setiap call harus explicit founder action
 */
export async function waSendAndLog(params: WaSendAndLogParams): Promise<WaSendAndLogResult> {
  const { env, db, phone, message, sent_by, log_first } = params

  // Validate phone
  if (!isValidPhone(phone)) {
    return {
      logged: false,
      attempted: false,
      confirmed: false,
      final_status: 'failed',
      error: `Invalid phone format: ${phone.slice(0, 8)}... (must be +62/62/0 format)`,
    }
  }

  const normalizedPhone = normalizePhone(phone)

  // Resolve Fonnte DEVICE token untuk send
  // Device token digunakan untuk /send, bukan account token
  const token = getFonnteDeviceToken(env)
  if (!token) {
    return {
      logged: false,
      attempted: false,
      confirmed: false,
      final_status: 'failed',
      error: 'FONNTE_DEVICE_TOKEN or FONNTE_TOKEN not present in env',
    }
  }

  let logId: string | null = null
  let logInserted = false

  // Step 1: Insert wa_log sebagai 'pending' dulu (audit trail)
  if (db && log_first) {
    const logEntry = await insertWaLog(db, {
      direction: 'outbound',
      phone: normalizedPhone,
      message_body: message,
      status: 'pending',
      requires_approval: false, // founder-triggered = pre-approved
      sent_by,
    })
    if (logEntry) {
      logId = logEntry.id
      logInserted = true
    }
  }

  // Step 2: Kirim via Fonnte
  const sendResult = await fonnteSendMessage(token, normalizedPhone, message)

  // Step 3: Update wa_log dengan status final
  const finalStatus: WaLogStatus = sendResult.success ? 'sent' : 'failed'
  const sentAt = sendResult.success ? new Date().toISOString() : null

  if (db && logId) {
    await updateWaLogStatus(db, logId, {
      status: finalStatus,
      fonnte_message_id: sendResult.fonnte_message_id ?? null,
      sent_at: sentAt,
    })
  } else if (db && !logInserted && log_first) {
    // Log tetap masuk meskipun pre-log gagal
    await insertWaLog(db, {
      direction: 'outbound',
      phone: normalizedPhone,
      message_body: message,
      status: finalStatus,
      requires_approval: false,
      sent_by,
      fonnte_message_id: sendResult.fonnte_message_id ?? null,
      sent_at: sentAt,
    })
  }

  return {
    logged: logInserted,
    log_id: logId,
    attempted: true,
    confirmed: sendResult.success,
    fonnte_message_id: sendResult.fonnte_message_id ?? null,
    final_status: finalStatus,
    error: sendResult.success ? undefined : sendResult.error,
  }
}

// =============================================================================
// SESSION 3G — INBOUND WEBHOOK HELPERS
// =============================================================================

/**
 * Fonnte inbound webhook payload shape.
 * Fonnte sends POST to our webhook URL when a message is received.
 * Ref: https://fonnte.com/docs/webhook
 */
export interface FonnteInboundPayload {
  /** Nomor WA pengirim (format: 628xxx@s.whatsapp.net atau 628xxx) */
  sender?: string
  /** Nomor WA device/target kita */
  device?: string
  /** Isi pesan masuk */
  message?: string
  /** Tipe pesan: text | image | audio | document | video | sticker | location | contact */
  type?: string
  /** Timestamp dari Fonnte */
  timestamp?: number | string
  /** Nama sender (jika tersedia) */
  name?: string
  /** Additional Fonnte fields */
  [key: string]: unknown
}

/**
 * Validate Fonnte inbound webhook token
 * Fonnte kirim token via query param ?token=<FONNTE_DEVICE_TOKEN>
 * Ini adalah satu-satunya gate untuk public webhook endpoint.
 * Returns true jika token match, false jika tidak.
 */
export function validateWebhookToken(incomingToken: string | undefined, env: TowerEnv): boolean {
  if (!incomingToken) return false
  const expected = env.FONNTE_DEVICE_TOKEN || env.FONNTE_TOKEN || env.FONNTE_ACCOUNT_TOKEN || null
  if (!expected) return false
  // Trim whitespace (tokens dari .dev.vars kadang ada leading space)
  return incomingToken.trim() === expected.trim()
}

/**
 * Normalize sender dari format Fonnte
 * Fonnte kadang kirim '628xxx@s.whatsapp.net', kadang '628xxx'
 */
export function normalizeSenderPhone(sender: string): string {
  // Remove @s.whatsapp.net, @c.us, dll
  const cleaned = sender.replace(/@[a-z.]+$/i, '').trim()
  return cleaned
}

/**
 * Insert inbound wa_log dari webhook payload
 * direction: 'inbound', status: 'pending', requires_approval: false (inbound tidak perlu approval)
 */
export async function insertInboundWaLog(
  db: DbClient,
  payload: {
    phone: string
    message_body: string
    fonnte_raw?: Record<string, unknown>
  }
): Promise<any | null> {
  return insertWaLog(db, {
    direction: 'inbound',
    phone: payload.phone,
    message_body: payload.message_body,
    status: 'delivered', // inbound sudah delivered (kita yang menerima)
    requires_approval: false,
    sent_by: 'system', // system = auto-received
    fonnte_message_id: null,
    sent_at: new Date().toISOString(),
  })
}

// =============================================================================
// SESSION 3G — HUMAN-GATE QUEUE HELPERS
// =============================================================================

/**
 * Get human-gate queue: wa_logs yang requires_approval=true dan status='pending'
 * Ini adalah queue yang harus di-review founder sebelum dikirim
 */
export async function getGateQueue(
  db: DbClient,
  limit = 20
): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('wa_logs')
      .select('id, direction, phone, message_body, status, requires_approval, sent_by, created_at, approved_at, approved_by')
      .eq('requires_approval', true)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }) // oldest first = FIFO queue
      .limit(limit)
    if (error || !data) return []
    return data as any[]
  } catch {
    return []
  }
}

/**
 * Get single queue item by id
 */
export async function getQueueItemById(db: DbClient, id: string): Promise<any | null> {
  try {
    const { data, error } = await db
      .from('wa_logs')
      .select('id, direction, phone, message_body, status, requires_approval, sent_by, created_at, approved_at, approved_by, fonnte_message_id')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

/**
 * Approve queue item: update status ke 'pending' → 'sent' + set approved_at
 * Note: approval hanya update status — actual send dilakukan via /api/wa/send setelah approve
 * Narrowest safe approach: approve = mark as approved, tidak auto-send
 */
export async function approveQueueItem(
  db: DbClient,
  id: string,
  approvedByUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = {
      status: 'sent',
      requires_approval: false, // gate cleared
      approved_at: new Date().toISOString(),
    }
    // Only set approved_by if it's a valid UUID (DB column is UUID FK to users)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (approvedByUserId && UUID_REGEX.test(approvedByUserId)) {
      updatePayload.approved_by = approvedByUserId
    }
    const { error } = await (db
      .from('wa_logs') as any)
      .update(updatePayload)
      .eq('id', id)
      .eq('requires_approval', true) // safety: only approve items that are actually pending gate
      .eq('status', 'pending')
    if (error) {
      // If FK violation on approved_by (user not in DB), retry without approved_by
      if (error.message && error.message.includes('approved_by') && updatePayload.approved_by) {
        delete updatePayload.approved_by
        const { error: retryError } = await (db
          .from('wa_logs') as any)
          .update(updatePayload)
          .eq('id', id)
          .eq('requires_approval', true)
          .eq('status', 'pending')
        if (retryError) {
          return { success: false, error: retryError.message }
        }
        return { success: true }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'unknown error' }
  }
}

/**
 * Reject queue item: update status ke 'rejected_by_founder'
 * Item akan tidak dikirim, audit trail tetap tersimpan
 */
export async function rejectQueueItem(
  db: DbClient,
  id: string,
  approvedByUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = {
      status: 'rejected_by_founder',
      requires_approval: false, // gate decision made
      approved_at: new Date().toISOString(),
    }
    // Only set approved_by if it's a valid UUID (DB column is UUID FK to users)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (approvedByUserId && UUID_REGEX.test(approvedByUserId)) {
      updatePayload.approved_by = approvedByUserId
    }
    const { error } = await (db
      .from('wa_logs') as any)
      .update(updatePayload)
      .eq('id', id)
      .eq('status', 'pending') // safety: only reject pending items
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'unknown error' }
  }
}

// =============================================================================
// SESSION 3G — BROADCAST GATING HELPERS
// =============================================================================

/**
 * Max targets for broadcast — hardcoded safety limit
 * Perubahan nilai ini harus via ADR baru
 */
export const BROADCAST_MAX_TARGETS = 10 as const

/**
 * Broadcast gate check — semua kondisi harus terpenuhi sebelum broadcast diizinkan:
 * 1. founder_confirmed: true harus ada di body
 * 2. targets array harus ada dan tidak kosong
 * 3. targets tidak boleh melebihi BROADCAST_MAX_TARGETS
 * 4. semua target harus valid phone numbers
 *
 * Returns: { allowed: boolean, reason?: string, invalid_targets?: string[] }
 */
export function checkBroadcastGate(params: {
  founder_confirmed?: boolean
  targets?: unknown[]
  message?: unknown
}): {
  allowed: boolean
  reason?: string
  invalid_targets?: string[]
} {
  const { founder_confirmed, targets, message } = params

  // Gate 1: explicit founder confirmation required
  if (founder_confirmed !== true) {
    return {
      allowed: false,
      reason: 'BROADCAST_NOT_CONFIRMED: founder_confirmed must be exactly true in request body — no implicit broadcast',
    }
  }

  // Gate 2: targets must exist
  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return {
      allowed: false,
      reason: 'BROADCAST_NO_TARGETS: targets array is required and must not be empty',
    }
  }

  // Gate 3: max targets limit
  if (targets.length > BROADCAST_MAX_TARGETS) {
    return {
      allowed: false,
      reason: `BROADCAST_EXCEEDS_LIMIT: targets.length (${targets.length}) exceeds max allowed (${BROADCAST_MAX_TARGETS}) — split into smaller batches`,
    }
  }

  // Gate 4: all targets must be valid phones
  const invalidTargets: string[] = []
  for (const t of targets) {
    if (typeof t !== 'string' || !isValidPhone(t)) {
      invalidTargets.push(typeof t === 'string' ? t.slice(0, 15) : '[invalid type]')
    }
  }
  if (invalidTargets.length > 0) {
    return {
      allowed: false,
      reason: `BROADCAST_INVALID_PHONES: ${invalidTargets.length} invalid phone number(s) found`,
      invalid_targets: invalidTargets,
    }
  }

  // Gate 5: message validation
  if (!message || typeof message !== 'string' || (message as string).trim().length === 0) {
    return {
      allowed: false,
      reason: 'BROADCAST_NO_MESSAGE: message is required and must not be empty',
    }
  }

  if ((message as string).length > 4000) {
    return {
      allowed: false,
      reason: 'BROADCAST_MESSAGE_TOO_LONG: message max 4000 chars for broadcast',
    }
  }

  return { allowed: true }
}

/**
 * Execute broadcast: kirim ke setiap target satu per satu (sequential, logged)
 * Tidak ada parallel fire — safety by design
 * Returns: array of per-target result
 */
export async function executeBroadcast(params: {
  env: TowerEnv
  db: DbClient | null
  targets: string[]
  message: string
  sent_by: 'founder' | 'agent' | 'system'
}): Promise<Array<{
  phone: string
  log_id: string | null
  delivery_status: 'CONFIRMED' | 'ATTEMPTED_NOT_CONFIRMED' | 'FAILED'
  fonnte_message_id: string | null
  error?: string
}>> {
  const { env, db, targets, message, sent_by } = params
  const results: Array<{
    phone: string
    log_id: string | null
    delivery_status: 'CONFIRMED' | 'ATTEMPTED_NOT_CONFIRMED' | 'FAILED'
    fonnte_message_id: string | null
    error?: string
  }> = []

  const token = getFonnteDeviceToken(env)
  if (!token) {
    // Return all as failed — no token available
    return targets.map(phone => ({
      phone,
      log_id: null,
      delivery_status: 'FAILED' as const,
      fonnte_message_id: null,
      error: 'FONNTE_DEVICE_TOKEN not configured',
    }))
  }

  for (const rawPhone of targets) {
    const phone = normalizePhone(rawPhone)
    let logId: string | null = null

    // Log first — audit trail before send
    if (db) {
      const logEntry = await insertWaLog(db, {
        direction: 'outbound',
        phone,
        message_body: message,
        status: 'pending',
        requires_approval: false, // already gated — founder confirmed broadcast
        sent_by,
      })
      logId = logEntry?.id ?? null
    }

    // Send to this target
    const sendResult = await fonnteSendMessage(token, phone, message)
    const finalStatus: WaLogStatus = sendResult.success ? 'sent' : 'failed'

    // Update log
    if (db && logId) {
      await updateWaLogStatus(db, logId, {
        status: finalStatus,
        fonnte_message_id: sendResult.fonnte_message_id ?? null,
        sent_at: sendResult.success ? new Date().toISOString() : null,
      })
    }

    results.push({
      phone: rawPhone,
      log_id: logId,
      delivery_status: sendResult.success
        ? 'CONFIRMED'
        : 'ATTEMPTED_NOT_CONFIRMED',
      fonnte_message_id: sendResult.fonnte_message_id ?? null,
      error: sendResult.success ? undefined : sendResult.error,
    })
  }

  return results
}
