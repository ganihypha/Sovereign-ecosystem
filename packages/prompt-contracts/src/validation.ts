// @sovereign/prompt-contracts — validation.ts
// Lightweight validation helpers untuk PromptContract completeness check
// Sovereign Business Engine v4.0 — Session 2e
// ⚠️ DESIGN RULES:
//   - TIDAK ada external validation library (Zod, Yup, dll)
//   - Pure TypeScript functions, zero runtime dependency
//   - Cloudflare Worker friendly
//   - Fokus ke: missing required fields, empty arrays, basic shape checks
//   - Do not over-engineer — simple practical validator is enough

import type { PromptContract, AcceptanceCriterion, MandatoryOutput } from './types'

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

/** Satu validation error */
export interface ValidationError {
  field: string           // Field yang bermasalah, e.g. "objective", "scope.in_scope"
  code: string            // Machine-readable code, e.g. "MISSING_REQUIRED"
  message: string         // Human-readable message
  severity: 'error' | 'warning'
}

/** Hasil validasi lengkap sebuah contract */
export interface ContractValidationResult {
  /** True jika contract dianggap valid (tidak ada error, boleh ada warning) */
  valid: boolean
  /** True jika ada error (bukan hanya warning) */
  has_errors: boolean
  /** True jika ada warning */
  has_warnings: boolean
  /** List semua validation errors */
  errors: ValidationError[]
  /** List semua validation warnings */
  warnings: ValidationError[]
  /** Total issues (errors + warnings) */
  total_issues: number
  /** Summary singkat */
  summary: string
}

// =============================================================================
// VALIDATION CODES
// =============================================================================

export const VALIDATION_CODES = {
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  EMPTY_ARRAY: 'EMPTY_ARRAY',
  INVALID_VALUE: 'INVALID_VALUE',
  MISSING_REPORT_FORMAT: 'MISSING_REPORT_FORMAT',
  INCOMPLETE_ACCEPTANCE_CRITERIA: 'INCOMPLETE_ACCEPTANCE_CRITERIA',
  INCOMPLETE_MANDATORY_OUTPUTS: 'INCOMPLETE_MANDATORY_OUTPUTS',
  MISSING_COST_CONTROL: 'MISSING_COST_CONTROL',
  MISSING_HUMAN_GATE: 'MISSING_HUMAN_GATE',
  SUSPICIOUS_SECRET: 'SUSPICIOUS_SECRET',
} as const

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/** @internal Buat error item */
function makeError(field: string, code: string, message: string): ValidationError {
  return { field, code, message, severity: 'error' }
}

/** @internal Buat warning item */
function makeWarning(field: string, code: string, message: string): ValidationError {
  return { field, code, message, severity: 'warning' }
}

/** @internal Cek apakah string non-empty */
function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0
}

/** @internal Cek apakah array non-empty */
function isNonEmptyArray(val: unknown): val is unknown[] {
  return Array.isArray(val) && val.length > 0
}

/** @internal Cek suspicious secret patterns di string */
function hasSuspiciousSecret(val: string): boolean {
  const patterns = [
    /ghp_[A-Za-z0-9]{36,}/,          // GitHub Personal Access Token
    /sk-[A-Za-z0-9]{20,}/,            // OpenAI API Key
    /gsk_[A-Za-z0-9]{20,}/,           // Groq API Key
    /eyJ[A-Za-z0-9+/=]{20,}\.[A-Za-z0-9+/=]{20,}/, // JWT token
    /password\s*[:=]\s*["'][^"']{8,}["']/i,  // Hardcoded password
    /api[_-]?key\s*[:=]\s*["'][^"']{16,}["']/i, // Hardcoded API key
  ]
  return patterns.some(p => p.test(val))
}

// =============================================================================
// MAIN VALIDATOR
// =============================================================================

/**
 * Validasi completeness sebuah PromptContract.
 * Cek required fields, empty arrays, dan basic shape.
 *
 * @param contract - Contract yang akan divalidasi
 * @returns ContractValidationResult dengan errors dan warnings
 *
 * @example
 * const result = validateContract(myContract)
 * if (!result.valid) {
 *   console.error('Contract invalid:', result.errors)
 * }
 */
export function validateContract(contract: Partial<PromptContract>): ContractValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // --- Required string fields ---
  const requiredStrings: Array<[keyof PromptContract, string]> = [
    ['session_name', 'Session name is required'],
    ['session_id', 'Session ID is required (e.g. "2e")'],
    ['phase', 'Phase is required (e.g. "phase-2")'],
    ['session_type', 'Session type is required'],
    ['target_repo', 'Target repo URL is required'],
    ['role', 'Role instruction is required'],
    ['mission', 'Mission description is required'],
    ['objective', 'Objective is required — what is this session trying to achieve?'],
  ]

  for (const [field, message] of requiredStrings) {
    if (!isNonEmptyString(contract[field])) {
      errors.push(makeError(String(field), VALIDATION_CODES.MISSING_REQUIRED, message))
    }
  }

  // --- objective: secret check ---
  if (contract.objective && hasSuspiciousSecret(contract.objective)) {
    errors.push(makeError('objective', VALIDATION_CODES.SUSPICIOUS_SECRET, 'Suspicious secret pattern found in objective — remove credentials'))
  }

  // --- mandatory_context ---
  if (!isNonEmptyArray(contract.mandatory_context)) {
    warnings.push(makeWarning('mandatory_context', VALIDATION_CODES.EMPTY_ARRAY, 'mandatory_context is empty — AI dev will not know what to read first'))
  }

  // --- scope ---
  if (!contract.scope) {
    errors.push(makeError('scope', VALIDATION_CODES.MISSING_REQUIRED, 'scope is required — defines what AI dev can and cannot touch'))
  } else {
    if (!isNonEmptyArray(contract.scope.in_scope)) {
      errors.push(makeError('scope.in_scope', VALIDATION_CODES.EMPTY_ARRAY, 'scope.in_scope cannot be empty — AI dev needs to know what is allowed'))
    }
    if (!isNonEmptyArray(contract.scope.out_of_scope)) {
      warnings.push(makeWarning('scope.out_of_scope', VALIDATION_CODES.EMPTY_ARRAY, 'scope.out_of_scope is empty — consider adding explicit out-of-scope items to prevent scope creep'))
    }
  }

  // --- task_instructions ---
  if (!isNonEmptyArray(contract.task_instructions)) {
    errors.push(makeError('task_instructions', VALIDATION_CODES.EMPTY_ARRAY, 'task_instructions cannot be empty — AI dev needs concrete instructions'))
  }

  // --- mandatory_outputs ---
  if (!isNonEmptyArray(contract.mandatory_outputs)) {
    errors.push(makeError('mandatory_outputs', VALIDATION_CODES.EMPTY_ARRAY, 'mandatory_outputs cannot be empty — AI dev needs to know what to produce'))
  } else {
    const outputs = contract.mandatory_outputs as MandatoryOutput[]
    const missingId = outputs.filter(o => !isNonEmptyString(o.id))
    const missingDesc = outputs.filter(o => !isNonEmptyString(o.description))
    if (missingId.length > 0) {
      errors.push(makeError('mandatory_outputs[].id', VALIDATION_CODES.MISSING_REQUIRED, `${missingId.length} mandatory output(s) missing id field`))
    }
    if (missingDesc.length > 0) {
      errors.push(makeError('mandatory_outputs[].description', VALIDATION_CODES.MISSING_REQUIRED, `${missingDesc.length} mandatory output(s) missing description field`))
    }
  }

  // --- acceptance_criteria ---
  if (!isNonEmptyArray(contract.acceptance_criteria)) {
    errors.push(makeError('acceptance_criteria', VALIDATION_CODES.EMPTY_ARRAY, 'acceptance_criteria cannot be empty — AI dev needs to know the definition of done'))
  } else {
    const criteria = contract.acceptance_criteria as AcceptanceCriterion[]
    const missingId = criteria.filter(ac => !isNonEmptyString(ac.id))
    const missingDesc = criteria.filter(ac => !isNonEmptyString(ac.description))
    if (missingId.length > 0) {
      errors.push(makeError('acceptance_criteria[].id', VALIDATION_CODES.MISSING_REQUIRED, `${missingId.length} acceptance criterion/criteria missing id field`))
    }
    if (missingDesc.length > 0) {
      errors.push(makeError('acceptance_criteria[].description', VALIDATION_CODES.MISSING_REQUIRED, `${missingDesc.length} acceptance criterion/criteria missing description field`))
    }
  }

  // --- report_format ---
  if (!contract.report_format) {
    errors.push(makeError('report_format', VALIDATION_CODES.MISSING_REPORT_FORMAT, 'report_format is required — AI dev needs to know the expected output format'))
  } else {
    if (!isNonEmptyString(contract.report_format.task)) {
      errors.push(makeError('report_format.task', VALIDATION_CODES.MISSING_REQUIRED, 'report_format.task is required'))
    }
    if (!isNonEmptyString(contract.report_format.next_step)) {
      warnings.push(makeWarning('report_format.next_step', VALIDATION_CODES.MISSING_REQUIRED, 'report_format.next_step is empty — add next step recommendation'))
    }
  }

  // --- human_gate ---
  if (!isNonEmptyString(contract.human_gate)) {
    errors.push(makeError('human_gate', VALIDATION_CODES.MISSING_HUMAN_GATE, 'human_gate is required — must define approval level: none | review | approve | confirm-irreversible'))
  }

  // --- cost_control ---
  if (!contract.cost_control) {
    errors.push(makeError('cost_control', VALIDATION_CODES.MISSING_COST_CONTROL, 'cost_control is required — must define session budget and restrictions'))
  } else {
    if (typeof contract.cost_control.allow_paid_api_calls !== 'boolean') {
      errors.push(makeError('cost_control.allow_paid_api_calls', VALIDATION_CODES.MISSING_REQUIRED, 'cost_control.allow_paid_api_calls must be explicitly set (true/false)'))
    }
    if (typeof contract.cost_control.allow_agent_runs !== 'boolean') {
      errors.push(makeError('cost_control.allow_agent_runs', VALIDATION_CODES.MISSING_REQUIRED, 'cost_control.allow_agent_runs must be explicitly set (true/false)'))
    }
    if (typeof contract.cost_control.single_package_focus !== 'boolean') {
      warnings.push(makeWarning('cost_control.single_package_focus', VALIDATION_CODES.MISSING_REQUIRED, 'cost_control.single_package_focus is not set — consider setting to true for Phase 2 sessions'))
    }
  }

  // --- next_step_hint (optional tapi recommended) ---
  if (!isNonEmptyString(contract.next_step_hint)) {
    warnings.push(makeWarning('next_step_hint', VALIDATION_CODES.MISSING_REQUIRED, 'next_step_hint is empty — add recommendation for what to do after this session'))
  }

  // --- role string: secret check ---
  if (contract.role && hasSuspiciousSecret(contract.role)) {
    errors.push(makeError('role', VALIDATION_CODES.SUSPICIOUS_SECRET, 'Suspicious secret pattern found in role — remove credentials'))
  }

  // --- Assemble result ---
  const has_errors = errors.length > 0
  const has_warnings = warnings.length > 0
  const total_issues = errors.length + warnings.length
  const valid = !has_errors

  let summary: string
  if (valid && !has_warnings) {
    summary = '✅ Contract valid — no issues found'
  } else if (valid && has_warnings) {
    summary = `⚠️ Contract valid but has ${warnings.length} warning(s) — review before execution`
  } else {
    summary = `❌ Contract invalid — ${errors.length} error(s), ${warnings.length} warning(s) — fix before execution`
  }

  return {
    valid,
    has_errors,
    has_warnings,
    errors,
    warnings,
    total_issues,
    summary,
  }
}

// =============================================================================
// QUICK VALIDATORS
// Convenience functions untuk spot-check fields
// =============================================================================

/**
 * Quick check: apakah contract punya objective yang non-empty?
 * @returns true jika valid
 */
export function hasObjective(contract: Partial<PromptContract>): boolean {
  return isNonEmptyString(contract.objective)
}

/**
 * Quick check: apakah contract punya scope yang valid?
 * @returns true jika in_scope non-empty
 */
export function hasScope(contract: Partial<PromptContract>): boolean {
  return !!(contract.scope && isNonEmptyArray(contract.scope.in_scope))
}

/**
 * Quick check: apakah contract punya acceptance criteria?
 * @returns true jika ada minimal 1 AC
 */
export function hasAcceptanceCriteria(contract: Partial<PromptContract>): boolean {
  return isNonEmptyArray(contract.acceptance_criteria)
}

/**
 * Quick check: apakah contract punya mandatory outputs?
 * @returns true jika ada minimal 1 output
 */
export function hasMandatoryOutputs(contract: Partial<PromptContract>): boolean {
  return isNonEmptyArray(contract.mandatory_outputs)
}

/**
 * Quick check: apakah contract punya report format?
 * @returns true jika report_format terdefinisi
 */
export function hasReportFormat(contract: Partial<PromptContract>): boolean {
  return !!(contract.report_format && isNonEmptyString(contract.report_format.task))
}

/**
 * Quick check: apakah contract punya human gate setting?
 * @returns true jika human_gate terdefinisi
 */
export function hasHumanGate(contract: Partial<PromptContract>): boolean {
  return isNonEmptyString(contract.human_gate)
}

/**
 * Quick check: apakah contract punya cost control?
 * @returns true jika cost_control terdefinisi dengan required fields
 */
export function hasCostControl(contract: Partial<PromptContract>): boolean {
  return !!(
    contract.cost_control &&
    typeof contract.cost_control.allow_paid_api_calls === 'boolean' &&
    typeof contract.cost_control.allow_agent_runs === 'boolean'
  )
}

/**
 * Quick check: apakah contract mengandung suspicious secret patterns?
 * Run ini sebelum commit untuk cek basic secret hygiene.
 * @returns true jika TIDAK ada suspicious secret (aman)
 */
export function isSecretFree(contract: Partial<PromptContract>): boolean {
  const fieldsToCheck = [
    contract.role,
    contract.objective,
    contract.mission,
    JSON.stringify(contract.task_instructions ?? []),
    JSON.stringify(contract.governance_notes ?? []),
  ]
  return fieldsToCheck.every(f => !f || !hasSuspiciousSecret(f))
}

// =============================================================================
// COMPLETENESS SCORE
// Berikan skor 0-100 berdasarkan seberapa lengkap sebuah contract
// =============================================================================

/**
 * Hitung completeness score untuk sebuah contract (0-100).
 * Berguna untuk dashboard atau monitoring.
 *
 * @returns number 0-100
 */
export function computeCompletenessScore(contract: Partial<PromptContract>): number {
  const checks = [
    isNonEmptyString(contract.session_name),    // 10
    isNonEmptyString(contract.session_id),      // 5
    isNonEmptyString(contract.phase),           // 5
    isNonEmptyString(contract.objective),       // 15
    isNonEmptyString(contract.role),            // 5
    isNonEmptyArray(contract.mandatory_context), // 5
    hasScope(contract),                          // 15
    isNonEmptyArray(contract.task_instructions), // 15
    hasMandatoryOutputs(contract),              // 10
    hasAcceptanceCriteria(contract),            // 10
    hasReportFormat(contract),                  // 5
    hasHumanGate(contract),                     // 5
    hasCostControl(contract),                   // 5
    isNonEmptyString(contract.next_step_hint),  // 5 — total: 120 raw
  ]

  const weights = [10, 5, 5, 15, 5, 5, 15, 15, 10, 10, 5, 5, 5, 5] // total = 120
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) // 120

  const earned = checks.reduce((sum, check, i) => sum + (check ? (weights[i] ?? 0) : 0), 0)
  return Math.round((earned / totalWeight) * 100)
}

// =============================================================================
// PRETTY PRINT
// Human-readable validation report untuk logging / debugging
// =============================================================================

/**
 * Format validation result ke string yang human-readable.
 * Berguna untuk console.log atau session report.
 */
export function formatValidationReport(result: ContractValidationResult, contractName?: string): string {
  const lines: string[] = []
  const name = contractName ?? 'Contract'

  lines.push(`## Validation Report: ${name}`)
  lines.push(`**Status:** ${result.summary}`)
  lines.push('')

  if (result.errors.length > 0) {
    lines.push('### ❌ Errors (must fix before execution)')
    for (const e of result.errors) {
      lines.push(`  - [${e.code}] ${e.field}: ${e.message}`)
    }
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('### ⚠️ Warnings (recommended to fix)')
    for (const w of result.warnings) {
      lines.push(`  - [${w.code}] ${w.field}: ${w.message}`)
    }
    lines.push('')
  }

  if (result.valid && !result.has_warnings) {
    lines.push('### ✅ All checks passed — contract ready for execution')
  }

  return lines.join('\n')
}
