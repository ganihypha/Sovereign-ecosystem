// @sovereign/integrations — scaffold/groq.scaffold.ts
// GroqClientScaffold — Type-safe Scaffold Implementation
//
// ⚠️ INI ADALAH SCAFFOLD — BUKAN PRODUCTION IMPLEMENTATION
// ⚠️ Tidak ada HTTP call ke Groq atau OpenAI API di file ini
// ⚠️ Semua method return mock response dengan flag SCAFFOLD
//
// Tujuan scaffold ini:
// 1. Verifikasi bahwa ILLMClient interface sudah benar (type-checking)
// 2. Placeholder yang aman untuk testing agent pipeline tanpa API key
// 3. Template untuk implementasi live di Phase 3 (groq.client.ts)
//
// Untuk live implementation Phase 3:
// → Buat packages/integrations/src/clients/groq.client.ts
// → Implements ILLMClient dengan real fetch() ke GROQ_API_BASE/chat/completions
// → Inject GroqEnvConfig dari c.env di Hono Worker

import type { ILLMClient } from '../contracts/llm-client.contract'
import type {
  LLMModel,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMEnvConfig,
} from '../types/groq'
import {
  LLM_DEFAULT_MODEL,
  estimateLLMCostUsd,
} from '../types/groq'
import {
  LLM_MAX_TOKENS_DEFAULT,
  LLM_TEMPERATURE_DEFAULT,
  LLM_MAX_RETRY_DEFAULT,
  LLM_RETRY_DELAY_MS,
} from '../contracts/llm-client.contract'

// =============================================================================
// SCAFFOLD MOCK RESPONSES
// =============================================================================

function buildMockResponse(
  request: LLMCompletionRequest,
  content: string
): LLMCompletionResponse {
  const promptTokens = Math.floor(
    request.messages.reduce((acc, m) => acc + m.content.length, 0) / 4
  )
  const completionTokens = Math.floor(content.length / 4)
  const usage = {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
  }

  return {
    id: `scaffold-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    model: request.model,
    content,
    usage,
    provider: 'groq',
    finish_reason: 'stop',
  }
}

// =============================================================================
// GROQ CLIENT SCAFFOLD
// =============================================================================

/**
 * GroqClientScaffold — Type-safe placeholder untuk ILLMClient
 *
 * Implements ILLMClient sepenuhnya untuk:
 * - Type checking tanpa API call
 * - Development tanpa GROQ_API_KEY
 * - Testing agent pipeline logic
 *
 * @example
 * // Di development / testing:
 * const llm = new GroqClientScaffold({ GROQ_API_KEY: 'placeholder' })
 * const response = await llm.complete({
 *   model: 'groq/llama3-8b-8192',
 *   messages: [{ role: 'user', content: 'Hello' }]
 * })
 * // response.content = '[SCAFFOLD] Mock LLM response ...'
 *
 * // Di production (Phase 3):
 * // Ganti dengan: import { GroqClient } from './clients/groq.client'
 * // const llm = new GroqClient({ GROQ_API_KEY: c.env.GROQ_API_KEY })
 */
export class GroqClientScaffold implements ILLMClient {
  private readonly config: LLMEnvConfig
  private readonly defaultModel: LLMModel
  private readonly scaffoldMode: 'mock' | 'error'

  /**
   * @param config - LLMEnvConfig (API key tidak dipakai di scaffold)
   * @param options
   *   - defaultModel: model default (default: 'groq/llama3-8b-8192')
   *   - scaffoldMode: 'mock' | 'error'
   */
  constructor(
    config: LLMEnvConfig,
    options?: {
      defaultModel?: LLMModel
      scaffoldMode?: 'mock' | 'error'
    }
  ) {
    this.config = config
    this.defaultModel = options?.defaultModel ?? LLM_DEFAULT_MODEL
    this.scaffoldMode = options?.scaffoldMode ?? 'mock'

    console.warn(
      `[SCAFFOLD] GroqClientScaffold initialized — NO real LLM calls will be made.\n` +
      `Default model: ${this.defaultModel}\n` +
      `Replace with GroqClient from Phase 3 for live integration.`
    )
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    if (this.scaffoldMode === 'error') {
      throw {
        code: 'SCAFFOLD_ERROR',
        message: '[SCAFFOLD] GroqClientScaffold error mode — simulated LLM error',
        provider: 'groq' as const,
        status: 500,
      }
    }

    const lastUserMessage = [...request.messages]
      .reverse()
      .find(m => m.role === 'user')?.content ?? 'no user message'

    const mockContent =
      `[SCAFFOLD] Mock LLM response for model ${request.model}.\n` +
      `Input: "${lastUserMessage.slice(0, 80)}${lastUserMessage.length > 80 ? '...' : ''}"\n` +
      `⚠️ This is a scaffold response — NOT a real LLM completion.\n` +
      `Replace GroqClientScaffold with GroqClient in Phase 3.`

    const response = buildMockResponse(request, mockContent)

    console.warn(
      `[SCAFFOLD] complete() called — model: ${request.model}, ` +
      `messages: ${request.messages.length}, ` +
      `est. tokens: ${response.usage.total_tokens}`
    )

    return response
  }

  async completeWithRetry(
    request: LLMCompletionRequest,
    maxRetries: number = LLM_MAX_RETRY_DEFAULT
  ): Promise<LLMCompletionResponse> {
    // Scaffold: cukup panggil complete() — tidak perlu real retry logic
    console.warn(`[SCAFFOLD] completeWithRetry() — maxRetries: ${maxRetries}. Using scaffold complete().`)
    return this.complete(request)
  }

  async ask(
    userMessage: string,
    systemPrompt?: string,
    model?: LLMModel
  ): Promise<string> {
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: userMessage },
    ]

    const response = await this.complete({
      model: model ?? this.defaultModel,
      messages,
      temperature: LLM_TEMPERATURE_DEFAULT,
      max_tokens: LLM_MAX_TOKENS_DEFAULT,
      stream: false,
    })

    return response.content
  }

  async isReady(): Promise<boolean> {
    return this.scaffoldMode !== 'error'
  }

  getProvider(): 'groq' | 'openai' {
    return 'groq'
  }

  getDefaultModel(): LLMModel {
    return this.defaultModel
  }

  /**
   * Expose config info untuk testing (tanpa expose API key)
   */
  getConfigInfo(): { hasGroqKey: boolean; hasOpenAIKey: boolean; defaultModel: LLMModel } {
    return {
      hasGroqKey: !!this.config.GROQ_API_KEY && this.config.GROQ_API_KEY.length > 0,
      hasOpenAIKey: !!this.config.OPENAI_API_KEY && this.config.OPENAI_API_KEY.length > 0,
      defaultModel: this.defaultModel,
    }
  }

  /**
   * Estimate cost dari response (utility untuk testing credit tracking)
   */
  estimateCost(response: LLMCompletionResponse): number {
    return estimateLLMCostUsd(response.model as LLMModel, response.usage)
  }

  // Expose constants untuk testing
  static readonly MAX_RETRY_DEFAULT = LLM_MAX_RETRY_DEFAULT
  static readonly RETRY_DELAY_MS = LLM_RETRY_DELAY_MS
  static readonly MAX_TOKENS_DEFAULT = LLM_MAX_TOKENS_DEFAULT
  static readonly TEMPERATURE_DEFAULT = LLM_TEMPERATURE_DEFAULT
}
