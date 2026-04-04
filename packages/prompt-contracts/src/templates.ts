// @sovereign/prompt-contracts — templates.ts
// Reusable template builders untuk common session types
// Sovereign Business Engine v4.0 — Session 2e
// ⚠️ DESIGN RULES:
//   - Template = factory function yang menghasilkan PromptContract partial/draft
//   - Caller WAJIB lengkapi field yang missing sebelum eksekusi
//   - Tidak ada hardcoded secret
//   - Setiap template punya sensible defaults

import type {
  PromptContract,
  SessionType,
  SovereignPhase,
  HumanGateLevel,
  CostControlRules,
  MandatoryContextItem,
  AcceptanceCriterion,
  MandatoryOutput,
} from './types'

import { DEFAULT_PHASE2_COST_CONTROL } from './contracts'

// =============================================================================
// TYPE: TEMPLATE INPUT
// Input yang dibutuhkan builder untuk menghasilkan contract draft
// =============================================================================

/** Input minimum untuk semua template builders */
export interface TemplateBaseInput {
  session_name: string
  session_id: string
  phase: SovereignPhase
  target_repo?: string
  objective: string
  role?: string
  /** Override default cost control jika diperlukan */
  cost_control_override?: Partial<CostControlRules>
  /** Override default human gate jika diperlukan */
  human_gate_override?: HumanGateLevel
}

/** Input tambahan untuk template execution session */
export interface ExecutionTemplateInput extends TemplateBaseInput {
  task_instructions: string[]
  in_scope_items: string[]
  out_of_scope_items?: string[]
  mandatory_context?: MandatoryContextItem[]
  acceptance_criteria?: AcceptanceCriterion[]
  mandatory_outputs?: MandatoryOutput[]
}

/** Input tambahan untuk template build-module session */
export interface BuildModuleTemplateInput extends ExecutionTemplateInput {
  package_name: string   // e.g. "@sovereign/db"
  package_path: string   // e.g. "packages/db/"
  session_summary_path?: string // e.g. "docs/session-2b-summary.md"
}

/** Input tambahan untuk template database session */
export interface DatabaseTemplateInput extends BuildModuleTemplateInput {
  affected_tables?: string[]
  migration_files?: string[]
}

/** Input tambahan untuk template auth session */
export interface AuthTemplateInput extends BuildModuleTemplateInput {
  auth_mechanisms?: string[]
}

/** Input tambahan untuk template integration session */
export interface IntegrationTemplateInput extends BuildModuleTemplateInput {
  integration_targets?: string[]
}

/** Input untuk handoff/summary session template */
export interface HandoffTemplateInput extends TemplateBaseInput {
  completed_session_id: string
  summary_points: string[]
  blockers_found?: string[]
  next_session_hint: string
}

// =============================================================================
// HELPER: buildBaseContract
// Internal helper untuk membuat base contract dari common fields
// =============================================================================

/** @internal Build base contract shell — tidak untuk export langsung */
function buildBaseContract(
  input: TemplateBaseInput,
  sessionType: SessionType,
): Omit<PromptContract, 'task_instructions' | 'mandatory_outputs' | 'acceptance_criteria' | 'scope' | 'mandatory_context'> {
  const costControl: CostControlRules = {
    ...DEFAULT_PHASE2_COST_CONTROL,
    ...input.cost_control_override,
  }

  return {
    session_name: input.session_name,
    session_id: input.session_id,
    phase: input.phase,
    session_type: sessionType,
    target_repo: input.target_repo ?? 'https://github.com/ganihypha/Sovereign-ecosystem',
    contract_version: '1.0.0',

    role: input.role ??
      `You are the AI Developer Executor for the Sovereign Ecosystem.
Execute only ${input.session_name}.
Do not expand scope.
If something is missing, scaffold/docs only and mark blocker clearly.`,

    mission: `Execute ${input.session_name} — ${input.objective}`,
    objective: input.objective,

    blockers: [],

    report_format: {
      task: input.session_name,
      status: 'draft',
      outputs: [],
      files_touched: [],
      test_commands: [],
      acceptance_criteria_status: [],
      blockers: [],
      decisions_made: [],
      next_step: '— to be filled after session completion —',
    },

    human_gate: input.human_gate_override ?? 'review',
    cost_control: costControl,
    governance_notes: [],
    next_step_hint: '— to be filled after session completion —',
    created_at: new Date().toISOString(),
    author: 'AI Dev Executor',
  }
}

// =============================================================================
// TEMPLATE 1: buildExecutionSessionContract
// Untuk standard execution task — memerlukan task_instructions dan scope lengkap
// =============================================================================

/**
 * Template builder untuk standard execution session.
 * Gunakan untuk task baru yang tidak spesifik ke package tertentu.
 *
 * @example
 * const contract = buildExecutionSessionContract({
 *   session_name: 'Session 3a: Sovereign Tower Auth Route',
 *   session_id: '3a',
 *   phase: 'phase-3',
 *   objective: 'Build auth route di Sovereign Tower',
 *   task_instructions: ['Buat /api/auth/login route', ...],
 *   in_scope_items: ['apps/sovereign-tower/src/routes/auth.ts'],
 * })
 */
export function buildExecutionSessionContract(input: ExecutionTemplateInput): PromptContract {
  const base = buildBaseContract(input, 'execution')

  return {
    ...base,
    mandatory_context: input.mandatory_context ?? [
      { source: '29-AI-DEV-HANDOFF-PACK.md', path: 'docs/29-AI-DEV-HANDOFF-PACK.md', reason: 'Execution rules, reading order, response format' },
      { source: '26-CANONICAL-ARCHITECTURE-MAP.md', path: 'docs/26-CANONICAL-ARCHITECTURE-MAP.md', reason: 'Architecture boundaries — confirm task fits the layer' },
      { source: '28-MIGRATION-PHASE-PLAN.md', path: 'migration/phase-tracker.md', reason: 'Confirm phase aktif sebelum eksekusi' },
    ],
    scope: {
      in_scope: input.in_scope_items,
      out_of_scope: input.out_of_scope_items ?? [
        'deployment configuration',
        'unrelated packages / apps',
        'live production migration',
        'any credential files',
      ],
    },
    task_instructions: input.task_instructions,
    mandatory_outputs: input.mandatory_outputs ?? [],
    acceptance_criteria: input.acceptance_criteria ?? [
      { id: 'AC-01', description: 'All promised files created/modified without TypeScript errors' },
      { id: 'AC-02', description: 'No real secrets committed' },
      { id: 'AC-03', description: 'Scope stayed narrow — only allowed paths touched' },
      { id: 'AC-04', description: 'Session summary document exists' },
    ],
  }
}

// =============================================================================
// TEMPLATE 2: buildBuildModuleContract
// Untuk build/modul session — fokus ke satu package
// =============================================================================

/**
 * Template builder untuk build/module session — fokus satu package.
 * Gunakan untuk Phase 2 shared-core package build.
 *
 * @example
 * const contract = buildBuildModuleContract({
 *   session_name: 'Session 2f: @sovereign/analytics Foundation',
 *   session_id: '2f',
 *   phase: 'phase-2',
 *   objective: 'Build @sovereign/analytics package',
 *   package_name: '@sovereign/analytics',
 *   package_path: 'packages/analytics/',
 *   task_instructions: [...],
 *   in_scope_items: ['packages/analytics/**'],
 * })
 */
export function buildBuildModuleContract(input: BuildModuleTemplateInput): PromptContract {
  const base = buildBaseContract(input, 'build-module')
  const summaryPath = input.session_summary_path ?? `docs/session-${input.session_id}-summary.md`

  return {
    ...base,
    mandatory_context: input.mandatory_context ?? [
      { source: '29-AI-DEV-HANDOFF-PACK.md', path: 'docs/29-AI-DEV-HANDOFF-PACK.md', reason: 'Execution rules' },
      { source: '26-CANONICAL-ARCHITECTURE-MAP.md', path: 'docs/26-CANONICAL-ARCHITECTURE-MAP.md', reason: 'Layer definition — confirm package belongs in shared core' },
      { source: '27-MOTHER-REPO-STRUCTURE.md', path: 'docs/27-MOTHER-REPO-STRUCTURE.md', reason: 'Folder tree + naming conventions' },
    ],
    scope: {
      in_scope: [
        ...input.in_scope_items,
        summaryPath,
        'migration/phase-tracker.md',
      ],
      out_of_scope: input.out_of_scope_items ?? [
        'apps business code',
        'deployment configuration',
        'live production changes',
        'other packages beyond ' + input.package_name,
        'any credential files',
      ],
      allowed_paths: [input.package_path, summaryPath, 'migration/phase-tracker.md'],
      forbidden_paths: ['apps/', 'infra/cloudflare/', '.dev.vars', '.env'],
    },
    task_instructions: input.task_instructions,
    mandatory_outputs: input.mandatory_outputs ?? [
      { id: 'OUT-01', description: `${input.package_name} — core implementation files`, output_type: 'file', path: input.package_path + 'src/' },
      { id: 'OUT-02', description: `${input.package_path}package.json updated to v0.1.0`, output_type: 'file', path: input.package_path + 'package.json' },
      { id: 'OUT-03', description: summaryPath, output_type: 'document', path: summaryPath },
    ],
    acceptance_criteria: input.acceptance_criteria ?? [
      { id: 'AC-01', description: `${input.package_name} is no longer a placeholder` },
      { id: 'AC-02', description: 'Package exports are clean and TypeScript strict passes' },
      { id: 'AC-03', description: 'No real secrets committed' },
      { id: 'AC-04', description: 'No unrelated packages modified' },
      { id: 'AC-05', description: `${summaryPath} exists with done/omitted/blockers/next-step` },
    ],
    design_requirements: [
      'TypeScript strict mode',
      'Reusable, app-agnostic design',
      'Cloudflare-worker-friendly (no Node.js-specific API)',
      'No external runtime dependency unless absolutely necessary',
      'Naming konsisten dengan Sovereign monorepo conventions',
    ],
  }
}

// =============================================================================
// TEMPLATE 3: buildDatabaseSessionContract
// Untuk database migration / schema task
// =============================================================================

/**
 * Template builder untuk database-focused session.
 * Gunakan untuk task yang melibatkan DB migration, schema update, query helpers.
 *
 * @example
 * const contract = buildDatabaseSessionContract({
 *   session_name: 'Session 2b: @sovereign/db Foundation',
 *   session_id: '2b',
 *   phase: 'phase-2',
 *   objective: 'Build @sovereign/db — DB foundation layer',
 *   package_name: '@sovereign/db',
 *   package_path: 'packages/db/',
 *   task_instructions: [...],
 *   in_scope_items: ['packages/db/**'],
 *   affected_tables: ['leads', 'orders', 'wa_logs', 'ai_tasks'],
 * })
 */
export function buildDatabaseSessionContract(input: DatabaseTemplateInput): PromptContract {
  const base = buildBuildModuleContract({ ...input, session_type: 'database' } as BuildModuleTemplateInput)

  // Tambahkan constraints khusus DB
  const dbConstraints: string[] = [
    'Jangan lakukan live production migration',
    'Jangan drop/alter destructive schema di production',
    'Gunakan --local flag untuk local development',
    'Ikuti canonical database schema dari docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md',
    'Nilai Rupiah gunakan integer (bukan decimal)',
    'WALog support requires_approval / human gate jika relevan',
  ]

  return {
    ...base,
    session_type: 'database',
    task_instructions: [
      ...base.task_instructions,
      ...dbConstraints.map(c => `CONSTRAINT: ${c}`),
    ],
    governance_notes: [
      ...(base.governance_notes ?? []),
      {
        type: 'constraint',
        content: `Affected tables: ${(input.affected_tables ?? []).join(', ')}`,
      },
      ...(input.migration_files?.length
        ? [{ type: 'note' as const, content: `Migration files: ${input.migration_files.join(', ')}` }]
        : []),
    ],
    human_gate: 'approve', // DB changes perlu approval lebih ketat
  }
}

// =============================================================================
// TEMPLATE 4: buildAuthSessionContract
// Untuk authentication/authorization task
// =============================================================================

/**
 * Template builder untuk auth-focused session.
 * Gunakan untuk task yang melibatkan JWT, roles, auth middleware.
 *
 * @example
 * const contract = buildAuthSessionContract({
 *   session_name: 'Session 2c: @sovereign/auth Foundation',
 *   session_id: '2c',
 *   phase: 'phase-2',
 *   objective: 'Build @sovereign/auth — JWT + role checking',
 *   package_name: '@sovereign/auth',
 *   package_path: 'packages/auth/',
 *   task_instructions: [...],
 *   in_scope_items: ['packages/auth/**'],
 *   auth_mechanisms: ['JWT', 'PIN'],
 * })
 */
export function buildAuthSessionContract(input: AuthTemplateInput): PromptContract {
  const base = buildBuildModuleContract({ ...input, session_type: 'auth' } as BuildModuleTemplateInput)

  const authConstraints: string[] = [
    'Jangan implement JWT middleware live — scaffold dan types only',
    'Jangan hardcode secret key atau JWT secret',
    'Semua auth config WAJIB dari env vars',
    'Jangan expose credential di response API',
    'Role hierarchy: founder > customer > reseller > agent > guest',
  ]

  return {
    ...base,
    session_type: 'auth',
    task_instructions: [
      ...base.task_instructions,
      ...authConstraints.map(c => `AUTH CONSTRAINT: ${c}`),
    ],
    governance_notes: [
      ...(base.governance_notes ?? []),
      {
        type: 'constraint',
        content: `Auth mechanisms: ${(input.auth_mechanisms ?? ['JWT']).join(', ')}`,
      },
    ],
    human_gate: 'approve', // Auth changes perlu approval lebih ketat
  }
}

// =============================================================================
// TEMPLATE 5: buildIntegrationSessionContract
// Untuk external API integration task
// =============================================================================

/**
 * Template builder untuk integration-focused session.
 * Gunakan untuk task yang melibatkan Fonnte, Groq/OpenAI, Supabase client, ScraperAPI.
 *
 * @example
 * const contract = buildIntegrationSessionContract({
 *   session_name: 'Session 2d: @sovereign/integrations Foundation',
 *   session_id: '2d',
 *   phase: 'phase-2',
 *   objective: 'Build @sovereign/integrations — external API clients',
 *   package_name: '@sovereign/integrations',
 *   package_path: 'packages/integrations/',
 *   task_instructions: [...],
 *   in_scope_items: ['packages/integrations/**'],
 *   integration_targets: ['supabase', 'fonnte', 'scraperapi', 'openai'],
 * })
 */
export function buildIntegrationSessionContract(input: IntegrationTemplateInput): PromptContract {
  const base = buildBuildModuleContract({ ...input, session_type: 'integration' } as BuildModuleTemplateInput)

  const integrationConstraints: string[] = [
    'Jangan implement live API client call — contracts dan types only di Phase 2',
    'Jangan commit API key, token, atau credential apapun',
    'Semua API config WAJIB dari env vars (FONNTE_TOKEN, GROQ_API_KEY, dll)',
    'Jangan aktifkan live Fonnte client (WA blast)',
    'Jangan aktifkan live LLM call (Groq/OpenAI)',
    'Client yang dibuat HARUS Cloudflare Worker compatible (Fetch API, bukan node-fetch)',
  ]

  return {
    ...base,
    session_type: 'integration',
    task_instructions: [
      ...base.task_instructions,
      ...integrationConstraints.map(c => `INTEGRATION CONSTRAINT: ${c}`),
    ],
    governance_notes: [
      ...(base.governance_notes ?? []),
      {
        type: 'constraint',
        content: `Integration targets (scaffold only, no live calls): ${(input.integration_targets ?? []).join(', ')}`,
      },
    ],
    human_gate: 'approve', // Integration perlu approval untuk avoid live API calls
  }
}

// =============================================================================
// TEMPLATE 6: buildHandoffSummaryContract
// Untuk AI-dev handoff / session-summary task
// Dipakai untuk menghasilkan handoff document setelah session selesai
// =============================================================================

/**
 * Template builder untuk handoff/summary session.
 * Gunakan setelah session selesai untuk membuat summary yang bisa di-handoff
 * ke AI dev session berikutnya.
 *
 * @example
 * const contract = buildHandoffSummaryContract({
 *   session_name: 'Handoff: Session 2e Summary',
 *   session_id: 'handoff-2e',
 *   phase: 'phase-2',
 *   objective: 'Document Session 2e completion dan prepare handoff untuk Phase 3',
 *   completed_session_id: '2e',
 *   summary_points: ['@sovereign/prompt-contracts v0.1.0 complete', ...],
 *   next_session_hint: 'Phase 3: Sovereign Tower Hardening',
 * })
 */
export function buildHandoffSummaryContract(input: HandoffTemplateInput): PromptContract {
  const base = buildBaseContract(input, 'handoff-summary')
  const summaryPath = `docs/session-${input.completed_session_id}-summary.md`

  return {
    ...base,
    mandatory_context: [
      { source: `Session ${input.completed_session_id} output`, reason: 'Review semua output yang dihasilkan session yang sudah selesai' },
      { source: '28-MIGRATION-PHASE-PLAN.md', path: 'migration/phase-tracker.md', reason: 'Update phase tracker' },
      { source: '29-AI-DEV-HANDOFF-PACK.md', path: 'docs/29-AI-DEV-HANDOFF-PACK.md', reason: 'Format laporan yang benar' },
    ],
    scope: {
      in_scope: [
        summaryPath,
        'migration/phase-tracker.md',
      ],
      out_of_scope: [
        'Kode baru — handoff session hanya dokumentasi',
        'DB migration',
        'Live deployment',
      ],
      allowed_paths: [summaryPath, 'migration/phase-tracker.md'],
      forbidden_paths: ['packages/', 'apps/', 'infra/', '.dev.vars', '.env'],
    },
    task_instructions: [
      `Buat ${summaryPath} dengan format standar`,
      'Dokumentasikan: semua output yang sudah dibuat, apa yang di-skip/defer, blockers yang ditemukan',
      'Update migration/phase-tracker.md untuk session yang sudah selesai',
      `Buat next session recommendation yang clear untuk session setelah ${input.completed_session_id}`,
      ...input.summary_points.map(p => `DOCUMENT: ${p}`),
      ...(input.blockers_found ?? []).map(b => `BLOCKER FOUND: ${b}`),
    ],
    mandatory_outputs: [
      { id: 'OUT-HANDOFF-01', description: summaryPath, output_type: 'document', path: summaryPath },
      { id: 'OUT-HANDOFF-02', description: 'migration/phase-tracker.md updated', output_type: 'document', path: 'migration/phase-tracker.md' },
    ],
    acceptance_criteria: [
      { id: 'AC-HANDOFF-01', description: `${summaryPath} exists with done / omitted / blockers / next step` },
      { id: 'AC-HANDOFF-02', description: 'phase-tracker.md updated with session completion status' },
      { id: 'AC-HANDOFF-03', description: 'Next session hint is actionable and specific' },
    ],
    blockers: (input.blockers_found ?? []).map((b, i) => ({
      id: `BLOCKER-${input.completed_session_id.toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
      description: b,
      severity: 'medium' as const,
    })),
    next_step_hint: input.next_session_hint,
  }
}

// =============================================================================
// EXPORT: Template type reference map
// Gunakan ini untuk lookup template yang tepat berdasarkan session type
// =============================================================================

/** Map dari SessionType ke template builder function */
export const SESSION_TYPE_TEMPLATE_MAP = {
  execution: buildExecutionSessionContract,
  'build-module': buildBuildModuleContract,
  database: buildDatabaseSessionContract,
  auth: buildAuthSessionContract,
  integration: buildIntegrationSessionContract,
  'handoff-summary': buildHandoffSummaryContract,
} as const

export type TemplateBuilderMap = typeof SESSION_TYPE_TEMPLATE_MAP
