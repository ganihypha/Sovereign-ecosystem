// sovereign-tower — src/lib/app-config.ts
// App-level configuration constants dan environment bindings type
// Sovereign Business Engine v4.0 — Session 3a
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Semua nilai runtime WAJIB dari Cloudflare env vars / .dev.vars
// TIDAK ADA hardcoded secret di sini

// =============================================================================
// APP METADATA
// =============================================================================

export const TOWER_APP_NAME = 'Sovereign Tower' as const
export const TOWER_APP_VERSION = '0.1.0' as const
export const TOWER_BUILD_SESSION = '4e' as const
export const TOWER_PHASE = 'phase-3' as const
export const TOWER_DESCRIPTION = 'Private founder-only command center — Sovereign Business Engine v4.0'

// =============================================================================
// CLOUDFLARE ENV BINDINGS TYPE
// Defines expected env vars injected by Cloudflare Workers / .dev.vars
// JANGAN isi nilai di sini — hanya type definition
// =============================================================================

/**
 * Cloudflare Workers environment bindings untuk Sovereign Tower.
 * Di .dev.vars: tambahkan nilai sesuai template di infra/env-templates/.
 * Di production: tambahkan via wrangler secret put.
 *
 * ⚠️ JANGAN hardcode nilai apapun di sini.
 */
export type TowerEnv = {
  // --- Auth ---
  /** JWT Secret untuk sign/verify token — WAJIB ada */
  JWT_SECRET: string

  // --- Supabase ---
  /** Supabase project URL — e.g. https://xxxx.supabase.co */
  SUPABASE_URL: string
  /** Supabase anon key — untuk public DB reads */
  SUPABASE_ANON_KEY: string
  /**
   * Supabase Service Role Key — untuk server-side full access
   * ⚠️ WAJIB ada untuk DB wiring di Sovereign Tower
   * ⚠️ JANGAN expose ke client/browser
   * Tambahkan ke .dev.vars atau Cloudflare Secret
   */
  SUPABASE_SERVICE_ROLE_KEY?: string

  // --- External Integrations ---
  /**
   * Fonnte Account Token — tersedia di .dev.vars (session 3e)
   * WA routes akan diaktifkan di session 3f
   */
  FONNTE_ACCOUNT_TOKEN?: string
  /** Fonnte Device Token — tersedia di .dev.vars (session 3e) */
  FONNTE_DEVICE_TOKEN?: string
  /** Fonnte API Token — alias (backward compat) */
  FONNTE_TOKEN?: string
  /** Groq API Key — untuk LLM calls */
  GROQ_API_KEY?: string
  /** Groq Console key — dari .dev.vars */
  GROQ_CONSOLE?: string
  /** OpenAI API Key — untuk LLM fallback */
  OPENAI_API_KEY?: string

  // --- Founder Config ---
  /** Founder user ID (UUID di Supabase auth) — untuk identity check */
  FOUNDER_USER_ID?: string

  // --- App Config ---
  /** Environment: development | staging | production */
  ENVIRONMENT?: string
}

// =============================================================================
// ROUTE CONFIG
// Centralized route path constants untuk sovereign-tower
// =============================================================================

export const TOWER_ROUTES = {
  // Public routes (no auth required)
  HEALTH: '/health',
  STATUS: '/status',

  // API root
  API: '/api',

  // Founder-protected routes
  FOUNDER: '/api/founder',
  FOUNDER_PROFILE: '/api/founder/profile',

  // Module routes
  MODULES: '/api/modules',
  MODULE_BY_ID: '/api/modules/:id',

  // Dashboard
  DASHBOARD: '/api/dashboard',
  DASHBOARD_TODAY: '/api/dashboard/today',

  // Module-specific endpoints (scaffold)
  BUILD_OPS: '/api/modules/build-ops',
  AI_RESOURCE: '/api/modules/ai-resource-manager',
  REVENUE_OPS: '/api/modules/revenue-ops',
  PROOF_CENTER: '/api/modules/proof-center',
  DECISION_CENTER: '/api/modules/decision-center',
  FOUNDER_REVIEW: '/api/modules/founder-review',
  // WA Routes (Session 3f — Fonnte/WhatsApp activation)
  WA: '/api/wa',
  WA_STATUS: '/api/wa/status',
  WA_LOGS: '/api/wa/logs',
  WA_TEST: '/api/wa/test',
  WA_SEND: '/api/wa/send',
  // WA Routes (Session 3g — Inbound webhook + human-gate queue + broadcast)
  WA_WEBHOOK: '/api/wa/webhook',   // PUBLIC — Fonnte webhook endpoint
  WA_QUEUE: '/api/wa/queue',
  WA_BROADCAST: '/api/wa/broadcast',
} as const

export type TowerRoute = (typeof TOWER_ROUTES)[keyof typeof TOWER_ROUTES]

// =============================================================================
// RESPONSE HELPERS
// Standardized response shapes untuk sovereign-tower API
// =============================================================================

/** Standard success response shape */
export interface TowerSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: {
    session: string
    version: string
    timestamp: string
  }
}

/** Standard error response shape */
export interface TowerErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

/** Build standard success response */
export function successResponse<T>(data: T): TowerSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  }
}

/** Build standard error response */
export function errorResponse(code: string, message: string, details?: unknown): TowerErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  }
}

