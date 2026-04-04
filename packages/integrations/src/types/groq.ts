// @sovereign/integrations — types/groq.ts
// Groq / LLM API — Type Contracts
// Provider utama: Groq (llama3, mixtral); fallback: OpenAI
//
// ⚠️ FILE INI HANYA TYPE DEFINITIONS — tidak ada HTTP call, tidak ada live integration
// ⚠️ GROQ_API_KEY wajib dari env var — JANGAN hardcode
// ⚠️ Setiap LLM call yang menghasilkan pesan untuk user WAJIB melalui human review
//
// Status: CONTRACT ONLY — live implementation di Phase 3

// =============================================================================
// CONSTANTS
// =============================================================================

/** Groq API base URL */
export const GROQ_API_BASE = 'https://api.groq.com/openai/v1' as const

/** OpenAI API base URL (fallback) */
export const OPENAI_API_BASE = 'https://api.openai.com/v1' as const

/** Default nilai untuk request */
export const LLM_MAX_TOKENS_DEFAULT = 1024 as const
export const LLM_TEMPERATURE_DEFAULT = 0.7 as const
export const LLM_TIMEOUT_MS_DEFAULT = 30000 as const  // 30 detik

// =============================================================================
// SUPPORTED MODELS
// =============================================================================

/**
 * LLM Model yang didukung dalam ecosystem Sovereign
 * Format: 'provider/model-name'
 *
 * Cost guide (approx):
 * - groq/llama3-8b-8192     → cheapest, fast
 * - groq/llama3-70b-8192    → better quality, still fast
 * - groq/mixtral-8x7b-32768 → good for long context
 * - openai/gpt-4o-mini      → fallback, lebih mahal
 */
export type LLMModel =
  | 'groq/llama3-8b-8192'       // Groq — Llama 3 8B (default untuk scout/draft)
  | 'groq/llama3-70b-8192'      // Groq — Llama 3 70B (untuk quality tasks)
  | 'groq/mixtral-8x7b-32768'   // Groq — Mixtral 8x7B (long context)
  | 'groq/gemma2-9b-it'         // Groq — Gemma 2 9B (instruction tuned)
  | 'openai/gpt-4o-mini'        // OpenAI — fallback (lebih mahal)
  | 'openai/gpt-4o'             // OpenAI — high quality (mahal, perlu approval)

/** Map model ke provider */
export const LLM_MODEL_PROVIDER: Record<LLMModel, 'groq' | 'openai'> = {
  'groq/llama3-8b-8192': 'groq',
  'groq/llama3-70b-8192': 'groq',
  'groq/mixtral-8x7b-32768': 'groq',
  'groq/gemma2-9b-it': 'groq',
  'openai/gpt-4o-mini': 'openai',
  'openai/gpt-4o': 'openai',
} as const

/** Model ID actual di API (tanpa prefix provider) */
export const LLM_MODEL_ID: Record<LLMModel, string> = {
  'groq/llama3-8b-8192': 'llama3-8b-8192',
  'groq/llama3-70b-8192': 'llama3-70b-8192',
  'groq/mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'groq/gemma2-9b-it': 'gemma2-9b-it',
  'openai/gpt-4o-mini': 'gpt-4o-mini',
  'openai/gpt-4o': 'gpt-4o',
} as const

/** Model default yang dipakai jika tidak dispesifikasi */
export const LLM_DEFAULT_MODEL: LLMModel = 'groq/llama3-8b-8192'

// =============================================================================
// ENV CONFIG
// =============================================================================

/**
 * Groq env config
 * Simpan di .dev.vars (local) atau Cloudflare Secrets (production)
 */
export type GroqEnvConfig = {
  /** API key dari console.groq.com — WAJIB dari env */
  GROQ_API_KEY: string
  /** Base URL override (opsional) */
  GROQ_BASE_URL?: string
}

/**
 * OpenAI env config (fallback)
 */
export type OpenAIEnvConfig = {
  /** API key dari platform.openai.com — WAJIB dari env */
  OPENAI_API_KEY: string
  /** Base URL override (opsional) */
  OPENAI_BASE_URL?: string
}

/**
 * Combined LLM env config
 * Setidaknya satu harus tersedia: GROQ atau OPENAI
 */
export type LLMEnvConfig = {
  GROQ_API_KEY?: string
  GROQ_BASE_URL?: string
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Satu pesan dalam conversation LLM
 * OpenAI-compatible format (dipakai Groq juga)
 */
export type LLMMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
  /** Nama pengirim opsional (untuk multi-agent) */
  name?: string
}

/**
 * Request ke LLM completion endpoint
 * Compatible dengan OpenAI API format (dipakai Groq)
 */
export type LLMCompletionRequest = {
  /** Model yang digunakan */
  model: LLMModel
  /** Array pesan conversation */
  messages: LLMMessage[]
  /** Temperature 0.0 - 2.0 (default: 0.7) */
  temperature?: number
  /** Max tokens untuk response (default: 1024) */
  max_tokens?: number
  /** Top-p sampling (opsional) */
  top_p?: number
  /** Stop sequences (opsional) */
  stop?: string[]
  /** Stream response (default: false — tidak didukung untuk sekarang) */
  stream?: false
}

/**
 * Usage stats dari LLM response
 */
export type LLMUsage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * Response dari LLM completion
 */
export type LLMCompletionResponse = {
  /** ID response dari provider */
  id: string
  /** Model yang digunakan (dari response, mungkin berbeda dari request) */
  model: string
  /** Content response (extracted dari choices[0].message.content) */
  content: string
  /** Informasi token usage untuk cost tracking */
  usage: LLMUsage
  /** Provider yang dipakai */
  provider: 'groq' | 'openai'
  /** Finish reason */
  finish_reason: 'stop' | 'length' | 'content_filter' | null
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/** Error dari LLM provider */
export type LLMError = {
  code: string
  message: string
  /** Provider yang menghasilkan error */
  provider: 'groq' | 'openai' | 'unknown'
  /** Status HTTP (jika dari API error) */
  status?: number
  /** Response body asli (untuk debug) */
  originalError?: unknown
}

// =============================================================================
// COST TRACKING HELPERS
// =============================================================================

/**
 * Estimasi cost per 1000 token (dalam USD)
 * Dipakai untuk credit_ledger tracking
 * Nilai approx — update sesuai pricing terbaru
 */
export const LLM_COST_PER_1K_TOKENS: Partial<Record<LLMModel, { input: number; output: number }>> = {
  'groq/llama3-8b-8192': { input: 0.00005, output: 0.00008 },
  'groq/llama3-70b-8192': { input: 0.00059, output: 0.00079 },
  'groq/mixtral-8x7b-32768': { input: 0.00024, output: 0.00024 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'openai/gpt-4o': { input: 0.005, output: 0.015 },
}

/**
 * Estimasi cost USD dari usage data
 * Gunakan untuk populate credit_ledger
 */
export function estimateLLMCostUsd(model: LLMModel, usage: LLMUsage): number {
  const pricing = LLM_COST_PER_1K_TOKENS[model]
  if (!pricing) return 0

  const inputCost = (usage.prompt_tokens / 1000) * pricing.input
  const outputCost = (usage.completion_tokens / 1000) * pricing.output
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000 // 6 decimal places
}
