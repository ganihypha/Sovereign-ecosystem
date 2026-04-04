// @sovereign/integrations — index.ts
// Package @sovereign/integrations v0.1.0
// Integration Foundation Layer — Sovereign Business Engine v4.0
//
// ============================================================================
// WHAT THIS PACKAGE PROVIDES:
// ============================================================================
//
// 1. Types — Fonnte & Groq/LLM type contracts
//    → FonnteSendPayload, FonnteResponse, FonnteDevice, FonnteEnvConfig
//    → LLMModel, LLMMessage, LLMCompletionRequest/Response, LLMEnvConfig
//    → estimateLLMCostUsd() helper
//
// 2. Contracts — Client interfaces untuk WA & LLM
//    → IWaClient (wa-client.contract.ts)
//    → ILLMClient (llm-client.contract.ts)
//    → WA_CLIENT_HUMAN_GATE_REQUIRED — ⚠️ SELALU TRUE
//
// 3. Scaffold — Type-safe placeholder implementations
//    → FonnteClientScaffold (implements IWaClient, no real HTTP calls)
//    → GroqClientScaffold (implements ILLMClient, no real LLM calls)
//    → Berguna untuk development tanpa live credentials
//
// 4. Config — Env-safe config helpers
//    → getFonnteConfig, getGroqConfig, getLLMConfig
//    → validateFonnteConfig, validateLLMConfig, validateAllIntegrationsConfig
//
// ============================================================================
// USAGE PATTERN:
// ============================================================================
//
// Development (tanpa live credentials):
//   import { FonnteClientScaffold, GroqClientScaffold } from '@sovereign/integrations'
//
//   const wa = new FonnteClientScaffold({ FONNTE_TOKEN: 'placeholder' })
//   const llm = new GroqClientScaffold({ GROQ_API_KEY: 'placeholder' })
//
// Production (Phase 3 — setelah live clients dibuat):
//   import { FonnteClient } from '@sovereign/integrations/clients'  // Phase 3
//   import { getFonnteConfig } from '@sovereign/integrations'
//
//   app.post('/api/wa/send-approved', async (c) => {
//     const wa = new FonnteClient(getFonnteConfig(c.env))
//     // ...
//   })
//
// ============================================================================
// SECURITY & HUMAN GATE REMINDER:
// ============================================================================
//
// ✅ Semua env config dibaca dari runtime env — TIDAK hardcode
// ✅ WA_CLIENT_HUMAN_GATE_REQUIRED = true — SELALU
// ✅ Output LLM HARUS disimpan ke ai_tasks dulu — bukan langsung execute
// ❌ JANGAN simpan FONNTE_TOKEN, GROQ_API_KEY, dll di kode
// ❌ JANGAN kirim WA langsung dari agent tanpa approval founder
//
// ============================================================================

export const INTEGRATIONS_VERSION = '0.1.0' as const
export const INTEGRATIONS_PLACEHOLDER = false as const

// --- Types: Fonnte ---
export type {
  FonnteEnvConfig,
  FonnteSendPayload,
  FonnteSendFilePayload,
  FonnteValidateNumberPayload,
  FonnteResponse,
  FonnteSuccessResponse,
  FonnteErrorResponse,
  FonnteError,
  FonnteDevice,
  FonnteDeviceStatus,
  WaHumanGateStatus,
} from './types/fonnte'

export {
  FONNTE_API_BASE,
  FONNTE_ENDPOINTS,
  FONNTE_DEFAULT_COUNTRY_CODE,
  WA_HUMAN_GATE_REQUIRED,
  isFonnteSuccess,
} from './types/fonnte'

// --- Types: Groq / LLM ---
export type {
  GroqEnvConfig,
  OpenAIEnvConfig,
  LLMEnvConfig,
  LLMModel,
  LLMMessage,
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMUsage,
  LLMError,
} from './types/groq'

export {
  GROQ_API_BASE,
  OPENAI_API_BASE,
  LLM_MAX_TOKENS_DEFAULT,
  LLM_TEMPERATURE_DEFAULT,
  LLM_TIMEOUT_MS_DEFAULT,
  LLM_MODEL_PROVIDER,
  LLM_MODEL_ID,
  LLM_DEFAULT_MODEL,
  LLM_COST_PER_1K_TOKENS,
  estimateLLMCostUsd,
} from './types/groq'

// --- Contracts: WA Client ---
export type {
  IWaClient,
  WaSendResult,
  WaBatchSendPayload,
  WaBatchSendResult,
} from './contracts/wa-client.contract'

export {
  WA_CLIENT_HUMAN_GATE_REQUIRED,
  WA_HUMAN_GATE_CONSTRAINT,
  isValidPhoneNumber,
  normalizePhoneForFonnte,
} from './contracts/wa-client.contract'

// --- Contracts: LLM Client ---
export type {
  ILLMClient,
  LLMTaskResult,
} from './contracts/llm-client.contract'

export {
  buildCompletionRequest,
} from './contracts/llm-client.contract'

// Re-export constants (sama nama dari contract dan types — gunakan dari contract)
export {
  LLM_MAX_RETRY_DEFAULT,
  LLM_RETRY_DELAY_MS,
} from './contracts/llm-client.contract'

// --- Scaffold: Fonnte ---
export {
  FonnteClientScaffold,
  ScaffoldNotImplementedError,
} from './scaffold/fonnte.scaffold'

// --- Scaffold: Groq ---
export {
  GroqClientScaffold,
} from './scaffold/groq.scaffold'

// --- Config: Env Helpers ---
export type {
  EnvValidationResult,
} from './config/env.config'

export {
  getFonnteConfig,
  getGroqConfig,
  getOpenAIConfig,
  getLLMConfig,
  validateFonnteConfig,
  validateLLMConfig,
  validateAllIntegrationsConfig,
} from './config/env.config'
