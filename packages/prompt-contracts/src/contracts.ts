// @sovereign/prompt-contracts — contracts.ts
// Pre-built Prompt Contract objects yang siap pakai
// Sovereign Business Engine v4.0 — Session 2e
// ⚠️ DESIGN RULES:
//   - Tidak ada real secret di sini
//   - Hanya contract definitions, bukan live config
//   - Tiap contract = satu session / task yang well-defined

import type {
  PromptContract,
  DefinitionOfDone,
  CostControlRules,
  HumanGateLevel,
} from './types'

// =============================================================================
// SHARED DEFAULTS
// Reusable defaults yang dipakai di banyak contract
// =============================================================================

/** Default cost control rules untuk session package build (Phase 2) */
export const DEFAULT_PHASE2_COST_CONTROL: CostControlRules = {
  max_files_touched: 20,
  allow_paid_api_calls: false,
  allow_agent_runs: false,
  single_package_focus: true,
  estimated_credit_budget_usd: 2,
  notes: 'Phase 2 session: satu package saja, tidak ada live API call, tidak ada agent run',
}

/** Default human gate untuk Phase 2 build session — hanya review */
export const DEFAULT_PHASE2_HUMAN_GATE: HumanGateLevel = 'review'

/** Default human gate untuk Phase 3+ agent/action session — approve wajib */
export const DEFAULT_PHASE3_HUMAN_GATE: HumanGateLevel = 'approve'

// =============================================================================
// SESSION 2E CONTRACT — @sovereign/prompt-contracts Foundation
// Ini adalah self-referential contract: 2e mendefinisikan dirinya sendiri
// =============================================================================

/** Prompt Contract untuk Session 2e — @sovereign/prompt-contracts Foundation */
export const session2eContract: PromptContract = {
  session_name: 'Session 2e: @sovereign/prompt-contracts Foundation',
  session_id: '2e',
  phase: 'phase-2',
  session_type: 'build-module',
  target_repo: 'https://github.com/ganihypha/Sovereign-ecosystem',
  contract_version: '1.0.0',

  role: `You are the AI Developer Executor for the Sovereign Ecosystem.
Execute only Session 2e.
Do not expand scope.
Do not jump to Phase 3.
Do not activate live integrations.
If something is still missing, create scaffold/contracts/docs only and mark blocker clearly.`,

  mission: `Replace the placeholder @sovereign/prompt-contracts package with a reusable,
app-agnostic prompt contract foundation that standardizes how AI tasks/prompts
are structured, validated, versioned, and handed off across the Sovereign Ecosystem.`,

  objective: 'Build narrow but solid @sovereign/prompt-contracts foundation: typed contracts, reusable templates, lightweight validation — app-agnostic, Cloudflare-friendly, no external deps.',

  mandatory_context: [
    { source: '29-AI-DEV-HANDOFF-PACK.md', path: 'docs/29-AI-DEV-HANDOFF-PACK.md', reason: 'Execution rules, reading order, response format' },
    { source: '26-CANONICAL-ARCHITECTURE-MAP.md', path: 'docs/26-CANONICAL-ARCHITECTURE-MAP.md', reason: 'Ecosystem layer definitions, prompt-contracts belongs in shared core' },
    { source: '27-MOTHER-REPO-STRUCTURE.md', path: 'docs/27-MOTHER-REPO-STRUCTURE.md', reason: 'Folder tree conventions, package naming' },
    { source: '@sovereign/types (Session 2a)', path: 'packages/types/src/', reason: 'Shared types: AgentType, ISODateString, JSONObject — import compatibility' },
    { source: '@sovereign/db (Session 2b)', path: 'packages/db/src/', reason: 'Context: DB patterns, schema conventions' },
    { source: '@sovereign/auth (Session 2c)', path: 'packages/auth/src/', reason: 'Context: auth patterns, JWT conventions' },
    { source: '@sovereign/integrations (Session 2d)', path: 'packages/integrations/src/', reason: 'Context: integration patterns, contract conventions' },
  ],

  scope: {
    in_scope: [
      { item: 'packages/prompt-contracts/**', rationale: 'Primary target package' },
      { item: 'docs/session-2e-summary.md', rationale: 'Session summary wajib' },
      { item: 'migration/phase-tracker.md', rationale: 'Update phase tracker' },
      { item: 'Minimal package wiring/exports jika strictly required', rationale: 'Hanya jika diperlukan untuk export compatibility' },
      { item: 'ADR note jika ada keputusan arsitektur nyata', rationale: 'Governance documentation' },
    ],
    out_of_scope: [
      { item: 'packages/db logic', rationale: 'Sudah selesai di Session 2b' },
      { item: 'packages/auth logic', rationale: 'Sudah selesai di Session 2c' },
      { item: 'packages/integrations logic', rationale: 'Sudah selesai di Session 2d' },
      { item: 'packages/types domain contracts', rationale: 'Hanya boleh minimal import compatibility jika absolutely necessary' },
      { item: '/apps business code', rationale: 'Apps tidak disentuh di Phase 2' },
      { item: 'deployment configuration', rationale: 'Bukan scope session ini' },
      { item: 'Cloudflare live settings', rationale: 'Tidak ada live deployment' },
      { item: 'Supabase live settings', rationale: 'Tidak ada live DB migration' },
      { item: 'credential files dengan real secrets', rationale: 'Security constraint absolut' },
      { item: 'live Fonnte client', rationale: 'Out of scope Phase 2' },
      { item: 'live Groq/OpenAI client', rationale: 'Out of scope Phase 2' },
      { item: 'JWT auth rewrite', rationale: 'Sudah selesai di Session 2c' },
      { item: 'DB migration rewrite', rationale: 'Sudah selesai di Session 2b' },
      { item: 'UI screens', rationale: 'Bukan scope session ini' },
      { item: 'Phase 3 work', rationale: 'Belum waktunya' },
    ],
    allowed_paths: ['packages/prompt-contracts/', 'docs/session-2e-summary.md', 'migration/phase-tracker.md'],
    forbidden_paths: ['packages/db/src/', 'packages/auth/src/', 'packages/integrations/src/', 'apps/', 'infra/cloudflare/', '.dev.vars', '.env'],
  },

  task_instructions: [
    'Replace the placeholder @sovereign/prompt-contracts package with a real reusable foundation',
    'Define typed prompt contract structures in src/types.ts covering: system context, objective, scope, required input/context, constraints, blockers, expected outputs, acceptance criteria, report format, human-gate requirement, cost-control rules, next-step recommendation',
    'Create reusable prompt contract templates/builders in src/templates.ts for: session execution, database task, auth task, integration task, AI-dev handoff/summary',
    'Add validation/helper utilities in src/validation.ts to check contract completeness: missing objective, missing scope, missing acceptance criteria, missing mandatory outputs, missing report format',
    'Build pre-built contract objects in src/contracts.ts including session2eContract as self-referential example',
    'Export everything cleanly from src/index.ts',
    'Update package.json to v0.1.0 with proper fields and build scripts',
    'Verify tsconfig.json is correct for TypeScript strict mode',
    'Run typecheck to confirm zero TypeScript errors',
    'Write docs/session-2e-summary.md with: done, omitted, blockers, next step',
    'Update migration/phase-tracker.md to mark session 2e as complete',
  ],

  design_requirements: [
    'TypeScript strict mode — tsconfig dengan "strict": true',
    'Reusable, app-agnostic design — tidak ada logic spesifik satu app',
    'Cloudflare-worker-friendly — tidak ada Node.js-specific API',
    'No external runtime dependency unless absolutely necessary',
    'Prefer plain TypeScript interfaces/types/helpers over heavy frameworks',
    'Naming konsisten dengan Sovereign monorepo conventions (camelCase functions, PascalCase types)',
    'Human-gate dan cost-control concepts WAJIB ada di contract model',
    'Prompt contracts HARUS support copy-paste AI-dev execution workflow',
    'Prompt contracts HARUS support narrow session execution (bukan giant one-shot)',
  ],

  blockers: [],

  mandatory_outputs: [
    { id: 'OUT-2E-01', description: 'packages/prompt-contracts/src/types.ts — core typed contract model', output_type: 'file', path: 'packages/prompt-contracts/src/types.ts' },
    { id: 'OUT-2E-02', description: 'packages/prompt-contracts/src/contracts.ts — pre-built contract objects', output_type: 'file', path: 'packages/prompt-contracts/src/contracts.ts' },
    { id: 'OUT-2E-03', description: 'packages/prompt-contracts/src/templates.ts — reusable template builders', output_type: 'file', path: 'packages/prompt-contracts/src/templates.ts' },
    { id: 'OUT-2E-04', description: 'packages/prompt-contracts/src/validation.ts — lightweight contract validator', output_type: 'file', path: 'packages/prompt-contracts/src/validation.ts' },
    { id: 'OUT-2E-05', description: 'packages/prompt-contracts/src/index.ts — clean barrel export', output_type: 'file', path: 'packages/prompt-contracts/src/index.ts' },
    { id: 'OUT-2E-06', description: 'packages/prompt-contracts/package.json — updated v0.1.0', output_type: 'file', path: 'packages/prompt-contracts/package.json' },
    { id: 'OUT-2E-07', description: 'packages/prompt-contracts/tsconfig.json — strict TS config', output_type: 'file', path: 'packages/prompt-contracts/tsconfig.json' },
    { id: 'OUT-2E-08', description: 'docs/session-2e-summary.md — session summary document', output_type: 'document', path: 'docs/session-2e-summary.md' },
  ],

  acceptance_criteria: [
    { id: 'AC-01', description: '@sovereign/prompt-contracts is no longer a placeholder' },
    { id: 'AC-02', description: 'Package exposes a clear typed contract model for AI prompt/session execution' },
    { id: 'AC-03', description: 'Package includes reusable templates/builders for common session types' },
    { id: 'AC-04', description: 'Package includes lightweight validation/helper logic' },
    { id: 'AC-05', description: 'Contract model includes scope, blockers, outputs, acceptance criteria, and report format' },
    { id: 'AC-06', description: 'Contract model includes human-gate and cost-control / narrow-session concepts' },
    { id: 'AC-07', description: 'Package remains app-agnostic and reusable across the monorepo' },
    { id: 'AC-08', description: 'No real secrets are committed anywhere' },
    { id: 'AC-09', description: 'No unrelated packages are modified beyond minimal required wiring' },
    { id: 'AC-10', description: 'TypeScript passes cleanly with zero errors for this session\'s work' },
    { id: 'AC-11', description: 'session-2e-summary.md clearly states done / omitted / blockers / next step' },
    { id: 'AC-12', description: 'Resulting package is usable as foundation for later AI-dev handoff prompts' },
  ],

  report_format: {
    task: 'Session 2e: @sovereign/prompt-contracts Foundation',
    status: 'done',
    outputs: [
      'packages/prompt-contracts/src/types.ts',
      'packages/prompt-contracts/src/contracts.ts',
      'packages/prompt-contracts/src/templates.ts',
      'packages/prompt-contracts/src/validation.ts',
      'packages/prompt-contracts/src/index.ts',
      'packages/prompt-contracts/package.json',
      'packages/prompt-contracts/tsconfig.json',
      'docs/session-2e-summary.md',
    ],
    files_touched: [
      'packages/prompt-contracts/src/types.ts',
      'packages/prompt-contracts/src/contracts.ts',
      'packages/prompt-contracts/src/templates.ts',
      'packages/prompt-contracts/src/validation.ts',
      'packages/prompt-contracts/src/index.ts',
      'packages/prompt-contracts/package.json',
      'packages/prompt-contracts/tsconfig.json',
      'docs/session-2e-summary.md',
      'migration/phase-tracker.md',
    ],
    test_commands: [
      'cd packages/prompt-contracts && npx tsc --noEmit',
      'node -e "const pc = require(\'./packages/prompt-contracts/src/index.ts\'); console.log(Object.keys(pc))"',
    ],
    acceptance_criteria_status: [
      { id: 'AC-01', description: '@sovereign/prompt-contracts is no longer a placeholder', status: 'pass' },
      { id: 'AC-02', description: 'Package exposes a clear typed contract model', status: 'pass' },
      { id: 'AC-03', description: 'Package includes reusable templates/builders', status: 'pass' },
      { id: 'AC-04', description: 'Package includes lightweight validation/helper logic', status: 'pass' },
      { id: 'AC-05', description: 'Contract model includes scope, blockers, outputs, AC, report format', status: 'pass' },
      { id: 'AC-06', description: 'Contract model includes human-gate and cost-control', status: 'pass' },
      { id: 'AC-07', description: 'Package remains app-agnostic', status: 'pass' },
      { id: 'AC-08', description: 'No real secrets committed', status: 'pass' },
      { id: 'AC-09', description: 'No unrelated packages modified', status: 'pass' },
      { id: 'AC-10', description: 'TypeScript zero errors', status: 'pass' },
      { id: 'AC-11', description: 'session-2e-summary.md complete', status: 'pass' },
      { id: 'AC-12', description: 'Package usable as AI-dev handoff foundation', status: 'pass' },
    ],
    blockers: [],
    decisions_made: [
      'ADR-005: @sovereign/prompt-contracts menggunakan pure TypeScript interfaces (bukan Zod/Yup) untuk Cloudflare Worker compatibility dan zero runtime dependency',
      'ADR-005b: PromptContract model bersifat self-describing — contract session 2e mendefinisikan dirinya sendiri sebagai contoh',
    ],
    next_step: 'Session 2e complete. Next: Phase 3 — Sovereign Tower Hardening. Mulai dari task 3.1 di 07-MODULE-TASK-BREAKDOWN.md. Pastikan semua shared-core packages (types, db, auth, integrations, prompt-contracts) sudah verified sebelum naik ke Phase 3.',
  },

  human_gate: 'review',
  cost_control: DEFAULT_PHASE2_COST_CONTROL,

  governance_notes: [
    {
      type: 'adr',
      id: 'ADR-005',
      content: 'prompt-contracts menggunakan pure TypeScript interfaces, bukan runtime validation library (Zod/Yup). Alasan: (1) Cloudflare Worker friendly, (2) zero runtime dep, (3) TypeScript strict sudah cukup untuk build-time safety. Runtime validation diimplementasikan via lightweight helper functions.',
    },
  ],

  next_step_hint: 'Phase 3: Sovereign Tower Hardening. Baca 28-MIGRATION-PHASE-PLAN.md section Phase 3 dan 07-MODULE-TASK-BREAKDOWN.md untuk task list.',

  created_at: '2026-04-04T00:00:00.000Z',
  author: 'AI Dev Executor — Session 2e',
}

// =============================================================================
// DEFINITION OF DONE — Session 2e
// =============================================================================

/** Definition of Done untuk Session 2e */
export const session2eDefinitionOfDone: DefinitionOfDone = {
  criteria: [
    '@sovereign/prompt-contracts contains a real reusable foundation (not placeholder)',
    'Typed prompt/session contracts exist in src/types.ts',
    'Pre-built contract objects exist in src/contracts.ts',
    'Template/builders exist in src/templates.ts',
    'Validation/helper logic exists in src/validation.ts',
    'Exports are clean and barrel-exported from src/index.ts',
    'session-2e-summary.md exists in docs/',
    'Scope stayed narrow — only prompt-contracts package touched',
    'No secrets were committed',
    'No Phase 3 work was started',
    'TypeScript zero errors',
  ],
  guardrails: [
    'Do not start Phase 3',
    'Do not modify packages/db, packages/auth, packages/integrations logic',
    'Do not add external runtime dependencies',
    'Do not add live API calls or agent runs',
    'Do not commit any .env, .dev.vars, or credential files',
    'Do not make irreversible changes without human gate',
  ],
}
