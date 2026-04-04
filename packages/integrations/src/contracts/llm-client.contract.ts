// @sovereign/integrations — contracts/llm-client.contract.ts
// LLM Client Contract — Interface Definition
//
// ⚠️ INI INTERFACE/CONTRACT ONLY — implementasi live ada di Phase 3
// ⚠️ Setiap LLM call yang generate pesan untuk user WAJIB human review sebelum action
//
// Implementasi yang akan ada di Phase 3:
//   - GroqClient (packages/integrations/src/clients/groq.client.ts)
//   - OpenAIClient (packages/integrations/src/clients/openai.client.ts)

import type {
  LLMModel,
  LLMMessage,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMError,
  LLMEnvConfig,
} from '../types/groq'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default max tokens untuk completion */
export const LLM_MAX_TOKENS_DEFAULT = 1024 as const

/** Default temperature */
export const LLM_TEMPERATURE_DEFAULT = 0.7 as const

/** Max retry untuk transient error */
export const LLM_MAX_RETRY_DEFAULT = 3 as const

/** Delay antar retry dalam ms */
export const LLM_RETRY_DELAY_MS = 1000 as const

// =============================================================================
// LLM CLIENT INTERFACE
// =============================================================================

/**
 * Interface untuk LLM client
 * Implementasi: GroqClient, OpenAIClient (Phase 3)
 * Scaffold: GroqClientScaffold (tersedia sekarang)
 *
 * ⚠️ Output LLM yang akan dikirim ke user (WA, email) HARUS melalui human review
 *    — simpan ke ai_tasks/wa_logs dulu, jangan langsung execute
 */
export interface ILLMClient {
  /**
   * Request completion dari LLM
   *
   * @param request - Model, messages, temperature, dll
   * @returns LLMCompletionResponse dengan content + usage stats
   * @throws LLMError untuk error teknis (auth, rate limit, dll)
   *
   * @example
   * const response = await llm.complete({
   *   model: 'groq/llama3-8b-8192',
   *   messages: [
   *     { role: 'system', content: systemPrompt },
   *     { role: 'user', content: userInput }
   *   ]
   * })
   * // INGAT: Simpan ke ai_tasks dulu sebelum action apapun
   */
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>

  /**
   * Request completion dengan retry otomatis untuk transient error
   *
   * @param request - LLM completion request
   * @param maxRetries - Jumlah max retry (default: LLM_MAX_RETRY_DEFAULT)
   * @returns LLMCompletionResponse
   * @throws LLMError jika semua retry habis
   */
  completeWithRetry(
    request: LLMCompletionRequest,
    maxRetries?: number
  ): Promise<LLMCompletionResponse>

  /**
   * Quick completion dengan single user message (convenience method)
   * Useful untuk simple one-shot prompts
   *
   * @param userMessage - Pesan user langsung
   * @param systemPrompt - System prompt (opsional)
   * @param model - Model yang digunakan (default: LLM_DEFAULT_MODEL)
   * @returns Content string dari response
   */
  ask(
    userMessage: string,
    systemPrompt?: string,
    model?: LLMModel
  ): Promise<string>

  /**
   * Health check — apakah client siap (config valid, API reachable)
   * @returns true jika siap
   */
  isReady(): Promise<boolean>

  /**
   * Get provider name (untuk logging/debugging)
   */
  getProvider(): 'groq' | 'openai'

  /**
   * Get model yang akan dipakai (default model dari config)
   */
  getDefaultModel(): LLMModel
}

// =============================================================================
// COMPLETION BUILDER (helper untuk construct request)
// =============================================================================

/**
 * Builder helper untuk membuat LLMCompletionRequest yang bersih
 *
 * @example
 * const request = buildCompletionRequest(
 *   'groq/llama3-8b-8192',
 *   'Kamu adalah asisten penjualan Sovereign.',
 *   'Buatkan pesan follow up untuk reseller baru.'
 * )
 */
export function buildCompletionRequest(
  model: LLMModel,
  systemPrompt: string,
  userMessage: string,
  options?: {
    temperature?: number
    max_tokens?: number
    additionalMessages?: LLMMessage[]
  }
): LLMCompletionRequest {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(options?.additionalMessages ?? []),
    { role: 'user', content: userMessage },
  ]

  return {
    model,
    messages,
    temperature: options?.temperature ?? LLM_TEMPERATURE_DEFAULT,
    max_tokens: options?.max_tokens ?? LLM_MAX_TOKENS_DEFAULT,
    stream: false,
  }
}

// =============================================================================
// LLM RESULT WRAPPER (untuk integrasi dengan ai_tasks)
// =============================================================================

/**
 * Wrapper hasil LLM untuk disimpan ke ai_tasks
 * Memastikan semua metadata tersedia untuk tracking dan human review
 */
export type LLMTaskResult = {
  success: boolean
  /** Content dari LLM response */
  content?: string
  /** Usage untuk credit_ledger */
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    estimated_cost_usd: number
  }
  /** Model yang dipakai */
  model_used?: string
  /** Error jika gagal */
  error?: LLMError
  /** Duration eksekusi dalam ms */
  duration_ms: number
  /** Flag apakah hasil ini perlu human review sebelum action */
  requires_human_review: boolean
}
