// @sovereign/prompt-contracts — index.ts
// Package @sovereign/prompt-contracts v0.1.0
// AI Prompt Contract Foundation — Sovereign Business Engine v4.0
// ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Dipakai oleh:
//   - packages/prompt-contracts/src/ (internal)
//   - apps/scout-agent, closer-agent, architect-agent (agent layer)
//   - apps/sovereign-tower (founder command center)
//   - AI dev handoff packs dan session prompts
//
// Import pattern:
//   import type { PromptContract } from '@sovereign/prompt-contracts'
//   import { validateContract, session2eContract } from '@sovereign/prompt-contracts'

// --- Core Types ---
export type {
  // Primitives
  ISODateString,
  SovereignPhase,
  SessionType,
  ContractStatus,
  Priority,
  HumanGateLevel,

  // Cost Control
  CostControlRules,

  // Scope
  ScopeItem,
  PromptScope,

  // Blockers
  PromptBlocker,

  // Acceptance Criteria
  AcceptanceCriterion,

  // Outputs
  MandatoryOutput,

  // Report Format
  ReportFormat,

  // Mandatory Context
  MandatoryContextItem,

  // Governance
  GovernanceNote,

  // Core Model
  PromptContract,

  // Definition of Done
  DefinitionOfDone,
} from './types'

// --- Pre-built Contract Objects ---
export {
  DEFAULT_PHASE2_COST_CONTROL,
  DEFAULT_PHASE2_HUMAN_GATE,
  DEFAULT_PHASE3_HUMAN_GATE,
  session2eContract,
  session2eDefinitionOfDone,
} from './contracts'

// --- Template Builders ---
export type {
  TemplateBaseInput,
  ExecutionTemplateInput,
  BuildModuleTemplateInput,
  DatabaseTemplateInput,
  AuthTemplateInput,
  IntegrationTemplateInput,
  HandoffTemplateInput,
  TemplateBuilderMap,
} from './templates'

export {
  buildExecutionSessionContract,
  buildBuildModuleContract,
  buildDatabaseSessionContract,
  buildAuthSessionContract,
  buildIntegrationSessionContract,
  buildHandoffSummaryContract,
  SESSION_TYPE_TEMPLATE_MAP,
} from './templates'

// --- Validation ---
export type {
  ValidationError,
  ContractValidationResult,
} from './validation'

export {
  VALIDATION_CODES,
  validateContract,
  hasObjective,
  hasScope,
  hasAcceptanceCriteria,
  hasMandatoryOutputs,
  hasReportFormat,
  hasHumanGate,
  hasCostControl,
  isSecretFree,
  computeCompletenessScore,
  formatValidationReport,
} from './validation'

// --- Package Version ---
export const PROMPT_CONTRACTS_VERSION = '0.1.0'
export const PROMPT_CONTRACTS_PLACEHOLDER = false // No longer placeholder — Session 2e ✅
