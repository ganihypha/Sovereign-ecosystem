// sovereign-tower — src/lib/wa-adapter.ts
// Fonnte WhatsApp Adapter — Session 3f
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
// ADR-012: WA adapter wraps Fonnte, tidak expose ke public, always logged to wa_logs

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
