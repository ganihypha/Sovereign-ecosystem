// @sovereign/integrations — contracts/wa-client.contract.ts
// WhatsApp Client Contract — Interface Definition
//
// ⚠️ INI INTERFACE/CONTRACT ONLY — implementasi live ada di Phase 3
// ⚠️ Semua outbound WA WAJIB melalui human gate (requires_approval di wa_logs)
//    sebelum execute kirim pesan — ini non-negotiable di Sovereign ecosystem
//
// Implementasi yang akan ada di Phase 3:
//   - FonnteClient (packages/integrations/src/clients/fonnte.client.ts)
//   - Mock/Test double implementaion untuk testing

import type {
  FonnteEnvConfig,
  FonnteSendPayload,
  FonnteSendFilePayload,
  FonnteValidateNumberPayload,
  FonnteResponse,
  FonnteDevice,
  WaHumanGateStatus,
} from '../types/fonnte'

// =============================================================================
// HUMAN GATE — NON-NEGOTIABLE
// =============================================================================

/**
 * ⚠️ HUMAN GATE REQUIRED — TRUE, SELALU
 *
 * Setiap pesan WA outbound yang dihasilkan oleh AI WAJIB mendapat approval founder
 * sebelum dikirim. Ini adalah constraint arsitektur utama Sovereign ecosystem.
 *
 * Flow yang benar:
 * 1. Agent generate pesan → simpan ke wa_logs dengan requires_approval=true
 * 2. Founder review di Tower → approve atau reject
 * 3. Jika approved → WA dikirim via Fonnte
 * 4. Jika rejected → pesan tidak dikirim, status = 'rejected_by_founder'
 */
export const WA_CLIENT_HUMAN_GATE_REQUIRED = true as const

/**
 * Nama constraint untuk logging/audit
 */
export const WA_HUMAN_GATE_CONSTRAINT = 'SOVEREIGN_WA_HUMAN_GATE_v1' as const

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validasi format nomor WA
 * Format yang valid: +628xxx atau 628xxx atau 08xxx
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '')
  // Cek format Indonesia: +62 / 62 / 0
  return /^(\+62|62|0)[0-9]{8,13}$/.test(cleaned)
}

/**
 * Normalize nomor WA ke format Fonnte (628xxx)
 */
export function normalizePhoneForFonnte(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '')
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  return cleaned
}

// =============================================================================
// WA CLIENT INTERFACE
// =============================================================================

/**
 * Interface untuk WhatsApp client
 * Implementasi: FonnteClient (Phase 3)
 * Scaffold: FonnteClientScaffold (tersedia sekarang)
 *
 * ⚠️ Semua method di sini MENGASUMSIKAN human gate sudah dilewati.
 *    Jangan panggil sendMessage langsung dari agent — harus melalui wa_logs + approval flow.
 */
export interface IWaClient {
  /**
   * Kirim pesan teks WA
   * ⚠️ HANYA dipanggil setelah wa_logs.requires_approval = true DAN sudah diapprove founder
   *
   * @param payload - Target nomor + pesan
   * @returns FonnteResponse (sukses atau error)
   */
  sendMessage(payload: FonnteSendPayload): Promise<FonnteResponse>

  /**
   * Kirim file/media WA
   * ⚠️ HANYA dipanggil setelah approval
   *
   * @param payload - Target nomor + URL file + caption
   * @returns FonnteResponse
   */
  sendFile(payload: FonnteSendFilePayload): Promise<FonnteResponse>

  /**
   * Cek apakah nomor terdaftar di WhatsApp
   * Tidak memerlukan human gate — operasi read-only
   *
   * @param payload - Nomor yang akan dicek
   * @returns FonnteResponse dengan data validasi
   */
  validateNumber(payload: FonnteValidateNumberPayload): Promise<FonnteResponse>

  /**
   * Get status device Fonnte
   * Tidak memerlukan human gate — operasi read-only
   *
   * @returns Array device dengan status koneksi
   */
  getDevices(): Promise<FonnteDevice[]>

  /**
   * Health check — apakah client siap digunakan
   * @returns true jika config valid dan device connected
   */
  isReady(): Promise<boolean>
}

// =============================================================================
// WA SEND RESULT (untuk internal tracking)
// =============================================================================

/**
 * Result dari WA send operation — untuk update wa_logs setelah kirim
 */
export type WaSendResult = {
  success: boolean
  /** Fonnte message ID — untuk tracking delivery status */
  fonnte_message_id?: string
  /** Status human gate yang dipakai */
  human_gate_status: WaHumanGateStatus
  /** Error jika gagal */
  error?: string
  /** Timestamp kirim */
  sent_at: string  // ISO date string
}

// =============================================================================
// BATCH SEND (untuk future use)
// =============================================================================

/**
 * Payload untuk batch send (broadcast)
 * ⚠️ SETIAP message dalam batch HARUS sudah ada di wa_logs dengan approved status
 */
export type WaBatchSendPayload = {
  messages: Array<{
    wa_log_id: string   // ID di wa_logs — WAJIB ada dan sudah approved
    phone: string
    message: string
  }>
  /** Delay antar pesan dalam ms (default: 2000 — 2 detik) */
  delay_ms?: number
}

export type WaBatchSendResult = {
  total: number
  success: number
  failed: number
  results: Array<{
    wa_log_id: string
    success: boolean
    fonnte_message_id?: string
    error?: string
  }>
}
