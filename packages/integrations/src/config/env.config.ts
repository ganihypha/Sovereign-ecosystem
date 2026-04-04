// @sovereign/integrations — config/env.config.ts
// Env Config Helpers — Type-safe env reading untuk integrations
//
// ⚠️ File ini TIDAK menyimpan secret — hanya membaca dari env object
// ⚠️ Selalu gunakan Cloudflare Secrets atau .dev.vars untuk nilai aktual
// ⚠️ JANGAN import file ini di client-side code

import type { FonnteEnvConfig } from '../types/fonnte'
import type { GroqEnvConfig, OpenAIEnvConfig, LLMEnvConfig } from '../types/groq'

// =============================================================================
// ENV VALIDATION RESULT
// =============================================================================

export type EnvValidationResult = {
  valid: boolean
  missing: string[]
  warnings: string[]
}

// =============================================================================
// FONNTE ENV HELPERS
// =============================================================================

/**
 * Extract Fonnte config dari env object (Cloudflare Workers / Hono c.env)
 * Validasi bahwa FONNTE_TOKEN tersedia
 *
 * @param env - Environment bindings dari Cloudflare Workers
 * @returns FonnteEnvConfig
 * @throws Error jika FONNTE_TOKEN tidak tersedia
 *
 * @example
 * // Di Hono Worker:
 * app.post('/api/wa/send', async (c) => {
 *   const config = getFonnteConfig(c.env)
 *   const wa = new FonnteClient(config)  // Phase 3
 * })
 */
export function getFonnteConfig(env: Record<string, string | undefined>): FonnteEnvConfig {
  const token = env['FONNTE_TOKEN']
  if (!token) {
    throw new Error(
      '[sovereign/integrations] FONNTE_TOKEN is required but not set.\n' +
      'Add to .dev.vars for local development or Cloudflare Secrets for production.'
    )
  }

  return {
    FONNTE_TOKEN: token,
    FONNTE_BASE_URL: env['FONNTE_BASE_URL'],
  }
}

/**
 * Validasi apakah Fonnte config tersedia (tanpa throw)
 */
export function validateFonnteConfig(env: Record<string, string | undefined>): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  if (!env['FONNTE_TOKEN']) {
    missing.push('FONNTE_TOKEN')
  }

  if (!env['FONNTE_BASE_URL']) {
    warnings.push('FONNTE_BASE_URL not set — using default https://api.fonnte.com')
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

// =============================================================================
// GROQ / LLM ENV HELPERS
// =============================================================================

/**
 * Extract Groq config dari env
 *
 * @example
 * app.post('/api/agent/scout', async (c) => {
 *   const config = getGroqConfig(c.env)
 *   const llm = new GroqClient(config)  // Phase 3
 * })
 */
export function getGroqConfig(env: Record<string, string | undefined>): GroqEnvConfig {
  const apiKey = env['GROQ_API_KEY']
  if (!apiKey) {
    throw new Error(
      '[sovereign/integrations] GROQ_API_KEY is required but not set.\n' +
      'Add to .dev.vars for local development or Cloudflare Secrets for production.'
    )
  }

  return {
    GROQ_API_KEY: apiKey,
    GROQ_BASE_URL: env['GROQ_BASE_URL'],
  }
}

/**
 * Extract OpenAI config dari env
 */
export function getOpenAIConfig(env: Record<string, string | undefined>): OpenAIEnvConfig {
  const apiKey = env['OPENAI_API_KEY']
  if (!apiKey) {
    throw new Error(
      '[sovereign/integrations] OPENAI_API_KEY is required but not set.'
    )
  }

  return {
    OPENAI_API_KEY: apiKey,
    OPENAI_BASE_URL: env['OPENAI_BASE_URL'],
  }
}

/**
 * Extract LLM config (Groq + OpenAI combined — setidaknya satu harus ada)
 */
export function getLLMConfig(env: Record<string, string | undefined>): LLMEnvConfig {
  const config: LLMEnvConfig = {
    GROQ_API_KEY: env['GROQ_API_KEY'],
    GROQ_BASE_URL: env['GROQ_BASE_URL'],
    OPENAI_API_KEY: env['OPENAI_API_KEY'],
    OPENAI_BASE_URL: env['OPENAI_BASE_URL'],
  }

  if (!config.GROQ_API_KEY && !config.OPENAI_API_KEY) {
    throw new Error(
      '[sovereign/integrations] At least one LLM API key is required: GROQ_API_KEY or OPENAI_API_KEY.'
    )
  }

  return config
}

/**
 * Validasi LLM config tanpa throw
 */
export function validateLLMConfig(env: Record<string, string | undefined>): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  const hasGroq = !!env['GROQ_API_KEY']
  const hasOpenAI = !!env['OPENAI_API_KEY']

  if (!hasGroq && !hasOpenAI) {
    missing.push('GROQ_API_KEY (or OPENAI_API_KEY as fallback)')
  }

  if (!hasGroq) {
    warnings.push('GROQ_API_KEY not set — primary LLM provider unavailable')
  }

  if (!hasOpenAI) {
    warnings.push('OPENAI_API_KEY not set — OpenAI fallback unavailable')
  }

  return {
    valid: hasGroq || hasOpenAI,
    missing,
    warnings,
  }
}

// =============================================================================
// COMBINED INTEGRATIONS ENV VALIDATION
// =============================================================================

/**
 * Validasi semua integration configs sekaligus
 * Berguna untuk health check endpoint di Tower
 *
 * @example
 * app.get('/api/health/integrations', (c) => {
 *   const status = validateAllIntegrationsConfig(c.env)
 *   return c.json(status)
 * })
 */
export function validateAllIntegrationsConfig(
  env: Record<string, string | undefined>
): {
  fonnte: EnvValidationResult
  llm: EnvValidationResult
  allReady: boolean
} {
  const fonnte = validateFonnteConfig(env)
  const llm = validateLLMConfig(env)

  return {
    fonnte,
    llm,
    allReady: fonnte.valid && llm.valid,
  }
}
