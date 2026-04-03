// @sovereign/types — common.ts
// Shared enums, status, roles, dan primitive types
// Dipakai oleh semua packages: db, auth, integrations, analytics, prompt-contracts
// ⚠️ File ini TIDAK boleh import dari package lain (no circular dependency)

// =============================================================================
// ROLE & ACCESS
// =============================================================================

/** Role user di seluruh ecosystem */
export type UserRole =
  | 'founder'        // Haidar — full access Sovereign Tower
  | 'customer'       // Paying customer — Customer Workspace
  | 'reseller'       // Reseller — Resellerkas dashboard
  | 'agent'          // AI agent service account
  | 'guest'          // Unauthenticated / public

/** Access level untuk gating fitur */
export type AccessLevel = 'public' | 'gated' | 'private' | 'founder_only'

/** Tier pricing untuk customer */
export type CustomerTier = 'starter' | 'growth' | 'pro' | 'enterprise'

// =============================================================================
// LEAD STATUS (Fashionkas + Scout Agent)
// =============================================================================

/** Status lifecycle sebuah lead */
export type LeadStatus =
  | 'new'           // Baru masuk (belum diproses)
  | 'contacted'     // Sudah dihubungi via WA
  | 'interested'    // Menunjukkan minat
  | 'qualified'     // Sudah lulus scoring (AI score >= threshold)
  | 'converted'     // Jadi customer / reseller
  | 'lost'          // Tidak jadi (cold / rejected)
  | 'do_not_contact' // Minta tidak dihubungi

/** Source darimana lead berasal */
export type LeadSource =
  | 'instagram_manual'   // Input manual founder dari Instagram
  | 'instagram_scout'    // Hasil ScoutAgent otomatis
  | 'fashionkas_form'    // Form di Fashionkas website
  | 'resellerkas_form'   // Form di Resellerkas website
  | 'whatsapp_inbound'   // WA masuk sendiri
  | 'referral'           // Referral dari customer/reseller
  | 'other'

// =============================================================================
// ORDER STATUS (Resellerkas + Fashionkas)
// =============================================================================

/** Status lifecycle sebuah order */
export type OrderStatus =
  | 'pending'       // Order dibuat, belum dikonfirmasi
  | 'confirmed'     // Order dikonfirmasi oleh founder/reseller
  | 'processing'    // Sedang diproses / disiapkan
  | 'shipped'       // Sudah dikirim
  | 'delivered'     // Sudah diterima customer
  | 'completed'     // Selesai (termasuk review)
  | 'cancelled'     // Dibatalkan
  | 'refunded'      // Dikembalikan / refund

/** Metode pembayaran */
export type PaymentMethod =
  | 'transfer_bank'
  | 'cod'
  | 'ewallet_gopay'
  | 'ewallet_ovo'
  | 'ewallet_dana'
  | 'qris'
  | 'other'

/** Status pembayaran */
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded'

// =============================================================================
// PRODUCT (Fashionkas + Resellerkas)
// =============================================================================

/** Kategori produk */
export type ProductCategory =
  | 'fashion_wanita'
  | 'fashion_pria'
  | 'fashion_anak'
  | 'aksesoris'
  | 'tas'
  | 'sepatu'
  | 'other'

/** Status ketersediaan produk */
export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'discontinued'

// =============================================================================
// AGENT STATUS (Tower — AI Orchestration)
// =============================================================================

/** Status lifecycle sebuah AI agent task */
export type AgentStatus =
  | 'idle'          // Menunggu trigger
  | 'queued'        // Dalam antrian
  | 'running'       // Sedang berjalan
  | 'completed'     // Selesai sukses
  | 'failed'        // Gagal (dengan error)
  | 'cancelled'     // Dibatalkan manual
  | 'awaiting_approval' // Human gate — menunggu persetujuan founder

/** Jenis agent yang tersedia */
export type AgentType =
  | 'scout_scorer'        // ScoutScorer — scoring lead Instagram
  | 'message_composer'    // MessageComposer — generate WA message
  | 'insight_generator'   // InsightGenerator — weekly insights
  | 'market_validator'    // MarketValidator (CrewAI) — deep market analysis
  | 'closer_agent'        // CloserAgent — follow-up sequence automation

// =============================================================================
// WA / WHATSAPP (Fonnte)
// =============================================================================

/** Status pengiriman WhatsApp */
export type WaDeliveryStatus =
  | 'queued'        // Dalam antrian kirim
  | 'sent'          // Sudah terkirim ke WA server
  | 'delivered'     // Diterima device target
  | 'read'          // Sudah dibaca
  | 'failed'        // Gagal kirim
  | 'rejected'      // Ditolak (number not found, etc)

/** Tipe pesan WA */
export type WaMessageType = 'text' | 'image' | 'template' | 'interactive'

// =============================================================================
// TIMESTAMP HELPERS
// =============================================================================

/** ISO 8601 datetime string */
export type ISODateString = string

/** Unix timestamp in milliseconds */
export type UnixTimestamp = number

/** UUID string (v4) */
export type UUID = string

// =============================================================================
// SORT
// =============================================================================

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

// =============================================================================
// PAGINATION (unified)
// =============================================================================

/** Standar pagination params */
export type Pagination = {
  page: number     // 1-indexed
  per_page: number // max items per page (default: 20, max: 100)
}

// =============================================================================
// JSON TYPES
// =============================================================================

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Make a type nullable */
export type Nullable<T> = T | null

/** Make a type optional (undefined) */
export type Optional<T> = T | undefined

// =============================================================================
// PAGINATION
// =============================================================================

/** Standar pagination params */
export type PaginationParams = {
  page: number     // 1-indexed
  limit: number    // max items per page (default: 20, max: 100)
}

/** Standar pagination response metadata */
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// =============================================================================
// RESULT WRAPPER
// =============================================================================

/** Generic success response */
export type SuccessResult<T> = {
  success: true
  data: T
  meta?: PaginationMeta
}

/** Generic error response */
export type ErrorResult = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

/** Union result type */
export type Result<T> = SuccessResult<T> | ErrorResult
