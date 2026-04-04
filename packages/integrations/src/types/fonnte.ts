// @sovereign/integrations — types/fonnte.ts
// Fonnte WhatsApp API — Type Contracts
// Docs: https://fonnte.com/docs
//
// ⚠️ FILE INI HANYA TYPE DEFINITIONS — tidak ada HTTP call, tidak ada live integration
// ⚠️ FONNTE_TOKEN wajib dari env var — JANGAN hardcode di sini
// ⚠️ Semua outbound WA WAJIB melalui human gate (requires_approval) sebelum live
//
// Status: CONTRACT ONLY — live implementation di Phase 3
// Blocker: FONNTE_TOKEN masih missing (verify di fonnte.com)

// =============================================================================
// CONSTANTS
// =============================================================================

/** Base URL Fonnte API */
export const FONNTE_API_BASE = 'https://api.fonnte.com' as const

/** Endpoint paths */
export const FONNTE_ENDPOINTS = {
  SEND: '/send',
  GET_DEVICE: '/get-devices',
  CHECK_NUMBER: '/validate-number',
  SEND_FILE: '/send-file',
} as const

/** Default country code untuk Indonesia */
export const FONNTE_DEFAULT_COUNTRY_CODE = '62' as const

// =============================================================================
// ENV CONFIG
// =============================================================================

/**
 * Fonnte env config — nilai selalu dari env vars
 * Simpan di .dev.vars (local) atau Cloudflare Secrets (production)
 *
 * @example
 * // Di Hono Worker:
 * const fonnte: FonnteEnvConfig = { FONNTE_TOKEN: c.env.FONNTE_TOKEN }
 */
export type FonnteEnvConfig = {
  /** Token API dari fonnte.com — WAJIB dari env, TIDAK boleh hardcode */
  FONNTE_TOKEN: string
  /** Base URL override (opsional, default: FONNTE_API_BASE) */
  FONNTE_BASE_URL?: string
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Payload untuk kirim pesan teks WhatsApp
 * Fonnte API: POST /send
 */
export type FonnteSendPayload = {
  /** Nomor tujuan — format: '628xxxxxxxxxx' atau '628xxxxxxxxxx,628xxxxxxxxxx' untuk bulk */
  target: string
  /** Isi pesan teks */
  message: string
  /** Kode negara (default: '62' untuk Indonesia) */
  countryCode?: string
  /** Delay antar pesan dalam detik (untuk bulk send) */
  delay?: number
  /** Nama pengirim yang tampil (jika device support) */
  schedule?: number  // Unix timestamp untuk scheduled send
}

/**
 * Payload untuk kirim file/media WhatsApp
 * Fonnte API: POST /send-file
 */
export type FonnteSendFilePayload = {
  target: string
  /** URL file publik (gambar, dokumen, dll) */
  url: string
  /** Caption untuk media */
  caption?: string
  countryCode?: string
  delay?: number
}

/**
 * Payload untuk validasi/cek nomor WA
 */
export type FonnteValidateNumberPayload = {
  target: string
  countryCode?: string
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Response sukses dari Fonnte API
 */
export type FonnteSuccessResponse = {
  status: true
  /** Message ID dari Fonnte (untuk tracking) */
  id?: string
  /** Detail respons */
  detail?: string
  /** Data tambahan (tergantung endpoint) */
  data?: Record<string, unknown>
}

/**
 * Response error dari Fonnte API
 */
export type FonnteErrorResponse = {
  status: false
  /** Pesan error dari Fonnte */
  reason: string
  /** Error detail (opsional) */
  data?: Record<string, unknown>
}

/**
 * Union response Fonnte (success | error)
 */
export type FonnteResponse = FonnteSuccessResponse | FonnteErrorResponse

/**
 * Type guard untuk cek apakah response sukses
 */
export function isFonnteSuccess(r: FonnteResponse): r is FonnteSuccessResponse {
  return r.status === true
}

/**
 * Normalized error untuk internal error handling
 */
export type FonnteError = {
  code: string
  message: string
  provider: 'fonnte'
  originalResponse?: FonnteErrorResponse
}

// =============================================================================
// DEVICE STATUS
// =============================================================================

/** Status device Fonnte */
export type FonnteDeviceStatus =
  | 'connected'   // Device aktif dan ready
  | 'disconnect'  // Device terputus
  | 'pending'     // Menunggu scan QR
  | 'banned'      // Nomor diblokir WA

export type FonnteDevice = {
  name: string
  device: string          // Nomor WA device
  status: FonnteDeviceStatus
  quota?: number          // Sisa quota pesan
  expired?: string        // Tanggal expired subscription
}

// =============================================================================
// HUMAN GATE MARKER
// =============================================================================

/**
 * Marker konstanta — pengingat bahwa semua outbound WA WAJIB human gate
 * Cek requires_approval di wa_logs sebelum execute kirim pesan
 */
export const WA_HUMAN_GATE_REQUIRED = true as const

/**
 * Status human gate untuk WA message
 */
export type WaHumanGateStatus =
  | 'pending_approval'  // Menunggu founder approve
  | 'approved'          // Sudah disetujui — siap kirim
  | 'rejected'          // Ditolak founder — jangan kirim
  | 'auto_approved'     // Auto-approved (hanya untuk sistem tertentu)
