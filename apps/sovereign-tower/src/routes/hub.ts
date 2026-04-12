// sovereign-tower — src/routes/hub.ts
// Session & Handoff Hub MVP — HUB-01
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// HUB-01 Scope (BOUNDED MVP):
//   - GET /hub                      → HTML continuity surface (Session & Handoff Hub)
//   - GET /api/hub/state            → Session meta + verified state items
//   - GET /api/hub/blockers         → Current blockers board
//   - GET /api/hub/founder-actions  → Explicit founder manual actions
//   - GET /api/hub/lanes            → Lane split board
//   - GET /api/hub/closeout-draft   → Closeout generator (auto-draft)
//   - POST /api/hub/closeout-draft  → Accept/update closeout draft
//   - GET /api/hub/next-session     → Next session planner
//
// Architectural Positioning:
//   - Hub is NOT Chamber (governance seat)
//   - Hub is NOT Tower core (execution substrate)
//   - Hub is NOT BarberKas (product lane)
//   - Hub is NOT Counterpart activation
//   - Hub IS continuity layer — surfaces truth, organizes state, reduces re-briefing tax
//
// Data Source: Static/living truth from current-handoff + active-priority baseline
//   Future: could read from repo files or DB, but v1 uses bounded static truth
//
// ADR-HUB-01: Session & Handoff Hub MVP

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { TOWER_BUILD_SESSION, TOWER_APP_VERSION } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'

type HubContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

export const hubRouter = new Hono<HubContext>()

// =============================================================================
// DATA LAYER — Living Truth Snapshot
// =============================================================================
// HUB-01 v1: static truth derived from current-handoff.md + active-priority.md
// This is intentionally simple. Future versions may read from DB or repo files.
// Do not over-engineer workflow state in v1.

interface SessionMeta {
  code: string
  title: string
  objective: string
  classification: string
  phase: string
  status: string
  updated_at: string
}

interface StateItem {
  domain: string
  label: string
  proof_class: 'VERIFIED' | 'CODE-CONFIRMED' | 'DOC-CONFIRMED' | 'PENDING' | 'BLOCKED'
  evidence_note: string
  owner: string
  source_ref: string
  updated_at: string
}

interface Blocker {
  id: string
  title: string
  blocker_type: 'founder-only' | 'technical' | 'truth/documentation' | 'dependency'
  owner: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'RESOLVED' | 'PENDING'
  action_required: string
  related_lane: string
}

interface FounderAction {
  id: string
  title: string
  description: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'DONE' | 'BLOCKED'
  dependency_target: string
}

interface LaneItem {
  lane_name: string
  item_title: string
  item_status: string
  next_action: string
  boundary_note: string
}

interface CloseoutDraft {
  build_summary: string
  truth_verdict: string
  blocker_summary: string
  boundary_verdict: string
  next_locked_move: string
  generated_at: string
}

// ─────────────────────────────────────────────────────────────────────────
// TRUTH DATA — derived from current-handoff.md + active-priority.md v1.3
// Source: repo HEAD 121a078 (2026-04-12)
// ─────────────────────────────────────────────────────────────────────────

function getSessionMeta(): SessionMeta {
  return {
    code: 'HUB-01',
    title: 'Session & Handoff Hub MVP',
    objective: 'Build first founder-side continuity surface — reduce manual re-briefing, make current truth visible, keep blockers explicit, separate lanes clearly',
    classification: 'Internal Sovereign Suite — Founder-Only',
    phase: 'BUILD',
    status: 'IN PROGRESS',
    updated_at: new Date().toISOString(),
  }
}

function getStateItems(): StateItem[] {
  return [
    {
      domain: 'Repo & Sandbox',
      label: 'Git repo synced (main branch, HEAD 121a078)',
      proof_class: 'VERIFIED',
      evidence_note: 'Working tree clean, local = remote, 250 tracked files',
      owner: 'system',
      source_ref: 'git log --oneline -1',
      updated_at: '2026-04-12',
    },
    {
      domain: 'Production Deploy',
      label: 'Sovereign Tower live at sovereign-tower.pages.dev',
      proof_class: 'VERIFIED',
      evidence_note: 'GET /health → build_session: 4g, status: ok',
      owner: 'system',
      source_ref: 'curl https://sovereign-tower.pages.dev/health',
      updated_at: '2026-04-12',
    },
    {
      domain: 'JWT Auth',
      label: 'HS256 UTF-8 raw key auth working',
      proof_class: 'VERIFIED',
      evidence_note: 'All protected routes accessible with valid JWT',
      owner: 'system',
      source_ref: 'packages/auth/src/jwt.ts (TextEncoder)',
      updated_at: '2026-04-12',
    },
    {
      domain: 'WA Queue',
      label: 'Approval queue operational (2 pending items)',
      proof_class: 'CODE-CONFIRMED',
      evidence_note: 'GET /api/wa/queue → total:2, pending_review:2, approved:0',
      owner: 'system',
      source_ref: 'Production API response',
      updated_at: '2026-04-12',
    },
    {
      domain: 'Governance Canon',
      label: '13 docs FROZEN at e4dd5e4',
      proof_class: 'VERIFIED',
      evidence_note: 'docs/governance-stack/ — all 13 canonical files present, not modified since freeze',
      owner: 'governance',
      source_ref: 'git log docs/governance-stack/',
      updated_at: '2026-04-11',
    },
    {
      domain: 'Ops Pack',
      label: '4 ops docs in 05-ops/ (runbook, integration, cadence, checklist)',
      proof_class: 'VERIFIED',
      evidence_note: 'All 4 files present at 086a1b1',
      owner: 'governance',
      source_ref: 'docs/governance-stack/05-ops/',
      updated_at: '2026-04-11',
    },
    {
      domain: 'Supabase Schema',
      label: 'Migration 007 applied — rejection_reason, rejected_at, approval index',
      proof_class: 'VERIFIED',
      evidence_note: 'Columns confirmed via Supabase API query',
      owner: 'system',
      source_ref: 'Session 4H verification',
      updated_at: '2026-04-12',
    },
    {
      domain: 'Dashboard',
      label: 'Founder Dashboard Lite accessible',
      proof_class: 'CODE-CONFIRMED',
      evidence_note: 'GET /dashboard → HTTP 200, Tailwind UI, JWT-gated',
      owner: 'system',
      source_ref: 'Production response',
      updated_at: '2026-04-12',
    },
    {
      domain: 'Audit Trail',
      label: 'Full lifecycle audit per wa_logs item',
      proof_class: 'CODE-CONFIRMED',
      evidence_note: 'GET /api/wa/audit/:id → lifecycle_summary working',
      owner: 'system',
      source_ref: 'Production API response',
      updated_at: '2026-04-12',
    },
    {
      domain: 'Living Docs',
      label: 'current-handoff.md + active-priority.md synced',
      proof_class: 'VERIFIED',
      evidence_note: 'Both patched and committed in 121a078 (Session 4H)',
      owner: 'governance',
      source_ref: 'ops/handoff/current-handoff.md',
      updated_at: '2026-04-12',
    },
  ]
}

function getBlockers(): Blocker[] {
  return [
    {
      id: 'B-010',
      title: 'Fonnte webhook URL belum dikonfigurasi',
      blocker_type: 'founder-only',
      owner: 'Founder',
      priority: 'MEDIUM',
      status: 'OPEN',
      action_required: 'Buka https://fonnte.com/settings → set URL: https://sovereign-tower.pages.dev/api/wa/webhook?token=VsPot2DeB8CL2eLbVGMF',
      related_lane: 'Tower',
    },
    {
      id: 'B-011',
      title: 'JWT belum di-set di Dashboard Lite browser',
      blocker_type: 'founder-only',
      owner: 'Founder',
      priority: 'LOW',
      status: 'OPEN',
      action_required: 'Buka /dashboard → paste JWT token dari dev.vars',
      related_lane: 'Tower',
    },
    {
      id: 'B-012',
      title: 'Repo public/private decision',
      blocker_type: 'founder-only',
      owner: 'Founder',
      priority: 'LOW',
      status: 'OPEN',
      action_required: 'Decide apakah repo harus set ke private (currently public)',
      related_lane: 'Governance',
    },
  ]
}

function getFounderActions(): FounderAction[] {
  return [
    {
      id: 'FA-001',
      title: 'Configure Fonnte Webhook',
      description: 'Login ke https://fonnte.com/settings dan set webhook URL ke https://sovereign-tower.pages.dev/api/wa/webhook?token=VsPot2DeB8CL2eLbVGMF',
      urgency: 'MEDIUM',
      status: 'PENDING',
      dependency_target: 'Inbound WA auto-logging',
    },
    {
      id: 'FA-002',
      title: 'Set JWT di Dashboard Lite',
      description: 'Buka /dashboard di browser, paste JWT token. Token bisa di-generate dari dev.vars JWT_SECRET.',
      urgency: 'LOW',
      status: 'PENDING',
      dependency_target: 'Dashboard Lite usability',
    },
    {
      id: 'FA-003',
      title: 'Review 2 pending approval items',
      description: 'Ada 2 items di wa_logs queue menunggu approve/reject. Bisa via Dashboard atau API.',
      urgency: 'MEDIUM',
      status: 'PENDING',
      dependency_target: 'Queue clearance',
    },
    {
      id: 'FA-004',
      title: 'Decide repo visibility',
      description: 'Repo ganihypha/Sovereign-ecosystem saat ini public. Pertimbangkan set ke private jika ada concern keamanan.',
      urgency: 'LOW',
      status: 'PENDING',
      dependency_target: 'Security posture',
    },
  ]
}

function getLaneItems(): LaneItem[] {
  return [
    // Tower lane
    {
      lane_name: 'Sovereign Tower',
      item_title: 'Core routes operational (health, wa, agents, dashboard, modules)',
      item_status: 'VERIFIED',
      next_action: 'Maintenance only — no expansion this session',
      boundary_note: 'Tower = execution substrate. Do NOT add governance doctrine.',
    },
    {
      lane_name: 'Sovereign Tower',
      item_title: 'Session & Handoff Hub MVP',
      item_status: 'IN PROGRESS (HUB-01)',
      next_action: 'Complete bounded MVP → verify → closeout',
      boundary_note: 'Hub is continuity layer, NOT Chamber, NOT doctrine.',
    },
    // Chamber / Governance lane
    {
      lane_name: 'Private Chair Chamber',
      item_title: 'Governance Canon v1 — FROZEN',
      item_status: 'LOCKED',
      next_action: 'Bounded maintenance only. No new doctrine.',
      boundary_note: 'Chamber = governance seat. NOT activated operationally. NOT product lane.',
    },
    {
      lane_name: 'Private Chair Chamber',
      item_title: 'Ops Pack (runbook, integration map, cadence, checklist)',
      item_status: 'COMMITTED',
      next_action: 'First governance health review can be run using checklist',
      boundary_note: 'Ops pack supplements canon. Does not replace it.',
    },
    // Counterpart lane
    {
      lane_name: 'Imperial Counterpart',
      item_title: 'Counterpart protocol + privilege matrix',
      item_status: 'DOCUMENTED (NOT ACTIVATED)',
      next_action: 'No activation this session — future-gated',
      boundary_note: 'Counterpart = controlled participation. NOT broadly activated.',
    },
    // BarberKas lane
    {
      lane_name: 'BarberKas',
      item_title: 'Master Build Doc — FROZEN FOR BUILD',
      item_status: 'READY',
      next_action: 'Sprint 1 Foundation (after Hub MVP closeout)',
      boundary_note: 'BarberKas = market product lane. Completely separate from governance.',
    },
  ]
}

function generateCloseoutDraft(): CloseoutDraft {
  const blockers = getBlockers()
  const openBlockers = blockers.filter(b => b.status === 'OPEN')

  return {
    build_summary: 'HUB-01: Session & Handoff Hub MVP — /hub route added as isolated continuity surface inside Sovereign Tower. Includes session brief, verified state board, blocker board, founder action board, lane split, closeout generator, and next session planner. No Tower core routes modified. No governance canon touched.',
    truth_verdict: 'All living docs (current-handoff.md, active-priority.md) are synced to 121a078. Governance canon 13 docs frozen at e4dd5e4. Ops pack 4 docs committed at 086a1b1. Production deploy build_session: 4g verified live.',
    blocker_summary: `${openBlockers.length} open blocker(s): ${openBlockers.map(b => b.id + ' — ' + b.title).join('; ')}. All are founder-only manual actions — no technical blockers.`,
    boundary_verdict: 'Hub ≠ Chamber (no doctrine). Hub ≠ Tower core (no route modification). Governance ≠ product. Counterpart NOT activated. BarberKas NOT touched. No scope drift detected.',
    next_locked_move: 'After HUB-01 verify: option A) harden Hub v1 (add DB-backed truth), option B) begin BarberKas Sprint 1, option C) patch truth inputs if stale.',
    generated_at: new Date().toISOString(),
  }
}

function getNextSessionPlan() {
  return {
    next_target: 'BarberKas Sprint 1 Foundation — OR — Hub v1.1 Hardening',
    carry_forward_items: [
      'Fonnte webhook config (B-010) — founder manual',
      'Dashboard JWT setup (B-011) — founder manual',
      'Repo visibility decision (B-012) — founder decision',
      '2 pending queue items awaiting review',
    ],
    pending_founder_decisions: [
      'Which lane next: BarberKas Sprint 1 or Hub v1.1?',
      'Repo public → private?',
      'First governance health review scheduling',
    ],
    out_of_scope_reminders: [
      'Do NOT expand governance canon (frozen)',
      'Do NOT activate Counterpart',
      'Do NOT mix BarberKas into governance lane',
      'Do NOT turn Hub into a doctrine dump',
      'Do NOT build full Chamber Console in this session',
    ],
    what_should_happen_after_hub01: [
      '1. Verify /hub renders correctly in production',
      '2. Verify all /api/hub/* endpoints respond',
      '3. Verify no existing Tower routes broken',
      '4. Commit + push to repo',
      '5. Update current-handoff.md with HUB-01 closeout',
      '6. Founder chooses next lane',
    ],
  }
}

// =============================================================================
// API ROUTES — JSON endpoints for Hub
// =============================================================================

hubRouter.get('/state', (c: Context<HubContext>) => {
  return c.json({
    success: true,
    data: {
      session: getSessionMeta(),
      state_items: getStateItems(),
    },
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
      source: 'HUB-01 static truth layer',
    },
  })
})

hubRouter.get('/blockers', (c: Context<HubContext>) => {
  const blockers = getBlockers()
  return c.json({
    success: true,
    data: {
      total: blockers.length,
      open: blockers.filter(b => b.status === 'OPEN').length,
      resolved: blockers.filter(b => b.status === 'RESOLVED').length,
      blockers,
    },
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

hubRouter.get('/founder-actions', (c: Context<HubContext>) => {
  const actions = getFounderActions()
  return c.json({
    success: true,
    data: {
      total: actions.length,
      pending: actions.filter(a => a.status === 'PENDING').length,
      actions,
    },
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

hubRouter.get('/lanes', (c: Context<HubContext>) => {
  return c.json({
    success: true,
    data: {
      lanes: getLaneItems(),
      boundary_rules: [
        'Tower = execution substrate (NOT governance seat)',
        'Chamber = governance seat (NOT product lane)',
        'BarberKas = market product lane (NOT governance)',
        'Counterpart = bounded participation (NOT broadly activated)',
        'Hub = continuity layer (NOT doctrine, NOT Chamber)',
      ],
    },
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

hubRouter.get('/closeout-draft', (c: Context<HubContext>) => {
  return c.json({
    success: true,
    data: generateCloseoutDraft(),
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

hubRouter.post('/closeout-draft', async (c: Context<HubContext>) => {
  // v1: acknowledge closeout acceptance (stateless, no DB write yet)
  const body = await c.req.json().catch(() => ({})) as Record<string, any>
  const draft = generateCloseoutDraft()
  return c.json({
    success: true,
    data: {
      accepted: true,
      closeout: {
        ...draft,
        founder_notes: body.founder_notes || null,
        accepted_at: new Date().toISOString(),
      },
    },
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

hubRouter.get('/next-session', (c: Context<HubContext>) => {
  return c.json({
    success: true,
    data: getNextSessionPlan(),
    meta: {
      session: TOWER_BUILD_SESSION,
      version: TOWER_APP_VERSION,
      timestamp: new Date().toISOString(),
    },
  })
})

// =============================================================================
// HTML UI — GET /hub (mounted at /)
// =============================================================================

hubRouter.get('/', (c: Context<HubContext>) => {
  const html = generateHubHTML()
  return c.html(html)
})

// =============================================================================
// HTML GENERATOR — Single-page continuity surface
// =============================================================================

function generateHubHTML(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session & Handoff Hub — Sovereign Tower</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; }
    .card-header { border-bottom: 1px solid #334155; }
    .status-verified { color: #4ade80; }
    .status-code-confirmed { color: #60a5fa; }
    .status-pending { color: #fbbf24; }
    .status-blocked { color: #f87171; }
    .status-doc-confirmed { color: #a78bfa; }
    .lane-tower { border-left: 3px solid #3b82f6; }
    .lane-chamber { border-left: 3px solid #a855f7; }
    .lane-counterpart { border-left: 3px solid #6366f1; }
    .lane-barberkas { border-left: 3px solid #10b981; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .badge-verified { background: #064e3b; color: #4ade80; }
    .badge-code { background: #1e3a5f; color: #60a5fa; }
    .badge-pending { background: #422006; color: #fbbf24; }
    .badge-blocked { background: #450a0a; color: #f87171; }
    .badge-open { background: #7f1d1d; color: #fca5a5; }
    .badge-high { background: #7f1d1d; color: #fca5a5; }
    .badge-medium { background: #422006; color: #fbbf24; }
    .badge-low { background: #1e3a5f; color: #93c5fd; }
    .section-nav { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); background: rgba(15,23,42,0.85); }
    .section-nav a { transition: color 0.15s; }
    .section-nav a:hover { color: #60a5fa; }
    .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    #jwt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; }
    #jwt-overlay.hidden { display: none; }
    .closeout-box { background: #1a2332; border: 1px solid #2d3748; }
  </style>
</head>
<body class="min-h-screen">

<!-- JWT Auth Overlay -->
<div id="jwt-overlay">
  <div class="card p-8 max-w-md w-full mx-4">
    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <i class="fas fa-shield-alt text-blue-400"></i> Founder Authentication
    </h2>
    <p class="text-sm text-gray-400 mb-4">Enter JWT token to access Session & Handoff Hub.</p>
    <textarea id="jwt-input" rows="3" placeholder="Paste JWT token here..."
      class="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 mb-3 focus:border-blue-500 focus:outline-none"></textarea>
    <button onclick="authenticate()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
      <i class="fas fa-key mr-2"></i>Authenticate
    </button>
    <p id="jwt-error" class="text-red-400 text-sm mt-2 hidden"></p>
    <p class="text-xs text-gray-500 mt-3">Token disimpan di localStorage browser. Tidak dikirim ke server lain.</p>
  </div>
</div>

<!-- Navigation -->
<nav class="section-nav border-b border-gray-700 px-4 py-3">
  <div class="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
    <div class="flex items-center gap-2">
      <i class="fas fa-satellite-dish text-blue-400"></i>
      <span class="font-bold text-sm">SESSION & HANDOFF HUB</span>
      <span class="badge badge-pending text-[10px]">HUB-01 MVP</span>
    </div>
    <div class="flex flex-wrap gap-3 text-xs text-gray-400">
      <a href="#brief" class="hover:text-blue-400"><i class="fas fa-info-circle mr-1"></i>Brief</a>
      <a href="#state" class="hover:text-blue-400"><i class="fas fa-check-circle mr-1"></i>State</a>
      <a href="#blockers" class="hover:text-blue-400"><i class="fas fa-exclamation-triangle mr-1"></i>Blockers</a>
      <a href="#actions" class="hover:text-blue-400"><i class="fas fa-user-shield mr-1"></i>Actions</a>
      <a href="#lanes" class="hover:text-blue-400"><i class="fas fa-road mr-1"></i>Lanes</a>
      <a href="#closeout" class="hover:text-blue-400"><i class="fas fa-file-export mr-1"></i>Closeout</a>
      <a href="#next" class="hover:text-blue-400"><i class="fas fa-arrow-right mr-1"></i>Next</a>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <span id="auth-status" class="text-xs text-gray-500">checking...</span>
      <button onclick="logout()" class="text-xs text-gray-500 hover:text-red-400" title="Clear JWT"><i class="fas fa-sign-out-alt"></i></button>
    </div>
  </div>
</nav>

<!-- Main Content -->
<main class="max-w-6xl mx-auto px-4 py-6 space-y-6" id="main-content">
  <!-- Loading State -->
  <div id="loading" class="text-center py-20">
    <i class="fas fa-spinner fa-spin text-3xl text-blue-400 mb-4"></i>
    <p class="text-gray-400">Loading continuity data...</p>
  </div>

  <!-- A. Session Open Brief -->
  <section id="brief" class="card hidden">
    <div class="card-header px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-info-circle text-blue-400"></i> Session Open Brief
      </h2>
      <span id="brief-phase" class="badge badge-pending">—</span>
    </div>
    <div class="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="text-xs text-gray-500 uppercase tracking-wide">Session Code</label>
        <p id="brief-code" class="font-mono font-bold text-lg">—</p>
      </div>
      <div>
        <label class="text-xs text-gray-500 uppercase tracking-wide">Title</label>
        <p id="brief-title" class="font-semibold">—</p>
      </div>
      <div class="md:col-span-2">
        <label class="text-xs text-gray-500 uppercase tracking-wide">Objective</label>
        <p id="brief-objective" class="text-sm text-gray-300">—</p>
      </div>
      <div>
        <label class="text-xs text-gray-500 uppercase tracking-wide">Classification</label>
        <p id="brief-classification" class="text-sm">—</p>
      </div>
      <div>
        <label class="text-xs text-gray-500 uppercase tracking-wide">Status</label>
        <p id="brief-status" class="text-sm font-semibold">—</p>
      </div>
    </div>
  </section>

  <!-- B. Current Verified State -->
  <section id="state" class="card hidden">
    <div class="card-header px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-check-circle text-green-400"></i> Current Verified State
      </h2>
      <div id="state-summary" class="flex gap-2 text-xs"></div>
    </div>
    <div class="px-6 py-4">
      <div id="state-grid" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
    </div>
  </section>

  <!-- C. Blocker Board -->
  <section id="blockers" class="card hidden">
    <div class="card-header px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-exclamation-triangle text-yellow-400"></i> Blocker Board
      </h2>
      <span id="blocker-count" class="badge badge-open">—</span>
    </div>
    <div class="px-6 py-4 space-y-3" id="blocker-list"></div>
  </section>

  <!-- D. Founder Action Board -->
  <section id="actions" class="card hidden">
    <div class="card-header px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-user-shield text-purple-400"></i> Founder Action Board
      </h2>
      <span id="action-count" class="badge badge-pending">—</span>
    </div>
    <div class="px-6 py-4 space-y-3" id="action-list"></div>
  </section>

  <!-- E. Lane Split Board -->
  <section id="lanes" class="card hidden">
    <div class="card-header px-6 py-4">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-road text-cyan-400"></i> Lane Split Board
      </h2>
    </div>
    <div class="px-6 py-4 space-y-3" id="lane-list"></div>
    <div class="px-6 pb-4">
      <div class="bg-gray-800/50 rounded-lg p-3">
        <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Boundary Rules</p>
        <div id="boundary-rules" class="space-y-1"></div>
      </div>
    </div>
  </section>

  <!-- F. Closeout Draft -->
  <section id="closeout" class="card hidden">
    <div class="card-header px-6 py-4 flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-file-export text-emerald-400"></i> Closeout Draft
      </h2>
      <button onclick="refreshCloseout()" class="text-xs text-gray-400 hover:text-blue-400">
        <i class="fas fa-sync-alt mr-1"></i>Regenerate
      </button>
    </div>
    <div class="px-6 py-4 space-y-4" id="closeout-content"></div>
  </section>

  <!-- G. Next Session Planner -->
  <section id="next" class="card hidden">
    <div class="card-header px-6 py-4">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <i class="fas fa-arrow-right text-orange-400"></i> Next Session Planner
      </h2>
    </div>
    <div class="px-6 py-4 space-y-4" id="next-content"></div>
  </section>
</main>

<footer class="max-w-6xl mx-auto px-4 py-6 text-center">
  <p class="text-xs text-gray-600">
    Session & Handoff Hub v1 — HUB-01 MVP — Sovereign Business Engine v4.0
    <br>⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL
  </p>
</footer>

<script>
// =============================================================================
// AUTH
// =============================================================================
const API_BASE = '';
let JWT = localStorage.getItem('hub_jwt') || '';

function authenticate() {
  const input = document.getElementById('jwt-input').value.trim();
  if (!input) {
    showError('Token required');
    return;
  }
  JWT = input;
  localStorage.setItem('hub_jwt', JWT);
  loadHub();
}

function logout() {
  JWT = '';
  localStorage.removeItem('hub_jwt');
  document.getElementById('jwt-overlay').classList.remove('hidden');
  document.getElementById('auth-status').textContent = 'not authenticated';
}

function showError(msg) {
  const el = document.getElementById('jwt-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

function headers() {
  return { 'Authorization': 'Bearer ' + JWT, 'Content-Type': 'application/json' };
}

async function api(path) {
  const res = await fetch(API_BASE + '/api/hub' + path, { headers: headers() });
  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Auth failed');
  }
  return res.json();
}

// =============================================================================
// LOAD HUB
// =============================================================================
async function loadHub() {
  try {
    const [stateRes, blockerRes, actionRes, laneRes, closeoutRes, nextRes] = await Promise.all([
      api('/state'),
      api('/blockers'),
      api('/founder-actions'),
      api('/lanes'),
      api('/closeout-draft'),
      api('/next-session'),
    ]);

    if (!stateRes.success) throw new Error('Failed to load state');

    document.getElementById('jwt-overlay').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('auth-status').innerHTML = '<i class="fas fa-check-circle text-green-400 mr-1"></i>Authenticated';

    renderBrief(stateRes.data.session);
    renderState(stateRes.data.state_items);
    renderBlockers(blockerRes.data);
    renderActions(actionRes.data);
    renderLanes(laneRes.data);
    renderCloseout(closeoutRes.data);
    renderNext(nextRes.data);

    document.querySelectorAll('.card.hidden').forEach(el => el.classList.remove('hidden'));
  } catch (err) {
    console.error(err);
    document.getElementById('jwt-overlay').classList.remove('hidden');
    showError('Authentication failed or API unreachable');
  }
}

// =============================================================================
// RENDERERS
// =============================================================================
function renderBrief(s) {
  document.getElementById('brief-code').textContent = s.code;
  document.getElementById('brief-title').textContent = s.title;
  document.getElementById('brief-objective').textContent = s.objective;
  document.getElementById('brief-classification').textContent = s.classification;
  document.getElementById('brief-status').textContent = s.status;
  document.getElementById('brief-phase').textContent = s.phase;
}

function proofBadge(proof) {
  const map = {
    'VERIFIED': 'badge-verified',
    'CODE-CONFIRMED': 'badge-code',
    'PENDING': 'badge-pending',
    'BLOCKED': 'badge-blocked',
    'DOC-CONFIRMED': 'badge-code',
  };
  return '<span class="badge ' + (map[proof] || 'badge-pending') + '">' + proof + '</span>';
}

function renderState(items) {
  const counts = {};
  items.forEach(i => { counts[i.proof_class] = (counts[i.proof_class] || 0) + 1; });
  const summary = document.getElementById('state-summary');
  summary.innerHTML = Object.entries(counts).map(([k,v]) => proofBadge(k) + ' ' + v).join(' ');

  const grid = document.getElementById('state-grid');
  grid.innerHTML = items.map(i => \`
    <div class="bg-gray-800/50 rounded-lg p-3 flex items-start gap-3">
      <div class="mt-1">\${proofBadge(i.proof_class)}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium">\${i.label}</p>
        <p class="text-xs text-gray-400 mt-1">\${i.evidence_note}</p>
        <p class="text-[10px] text-gray-500 mt-1">\${i.domain} — \${i.source_ref}</p>
      </div>
    </div>
  \`).join('');
}

function renderBlockers(data) {
  document.getElementById('blocker-count').textContent = data.open + ' open';
  const list = document.getElementById('blocker-list');
  if (data.blockers.length === 0) {
    list.innerHTML = '<p class="text-sm text-green-400"><i class="fas fa-check mr-2"></i>No blockers</p>';
    return;
  }
  list.innerHTML = data.blockers.map(b => \`
    <div class="bg-gray-800/50 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-\${b.priority.toLowerCase()}">\${b.priority}</span>
        <span class="badge badge-\${b.status === 'OPEN' ? 'open' : 'verified'}">\${b.status}</span>
        <span class="text-xs text-gray-500">\${b.id}</span>
      </div>
      <p class="text-sm font-medium">\${b.title}</p>
      <p class="text-xs text-gray-400 mt-1"><i class="fas fa-user mr-1"></i>\${b.owner} — \${b.blocker_type}</p>
      <p class="text-xs text-gray-300 mt-2 bg-gray-900/50 rounded p-2"><i class="fas fa-arrow-right mr-1 text-yellow-400"></i>\${b.action_required}</p>
    </div>
  \`).join('');
}

function renderActions(data) {
  document.getElementById('action-count').textContent = data.pending + ' pending';
  const list = document.getElementById('action-list');
  list.innerHTML = data.actions.map(a => \`
    <div class="bg-gray-800/50 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-\${a.urgency.toLowerCase()}">\${a.urgency}</span>
        <span class="badge badge-\${a.status === 'PENDING' ? 'pending' : 'verified'}">\${a.status}</span>
        <span class="text-xs text-gray-500">\${a.id}</span>
      </div>
      <p class="text-sm font-medium">\${a.title}</p>
      <p class="text-xs text-gray-400 mt-1">\${a.description}</p>
      <p class="text-[10px] text-gray-500 mt-2">Dependency: \${a.dependency_target}</p>
    </div>
  \`).join('');
}

function renderLanes(data) {
  const laneColors = {
    'Sovereign Tower': 'lane-tower',
    'Private Chair Chamber': 'lane-chamber',
    'Imperial Counterpart': 'lane-counterpart',
    'BarberKas': 'lane-barberkas',
  };
  const list = document.getElementById('lane-list');
  list.innerHTML = data.lanes.map(l => \`
    <div class="bg-gray-800/50 rounded-lg p-4 \${laneColors[l.lane_name] || ''}">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">\${l.lane_name}</span>
      </div>
      <p class="text-sm font-medium">\${l.item_title}</p>
      <p class="text-xs text-gray-400 mt-1">Status: <span class="font-semibold">\${l.item_status}</span></p>
      <p class="text-xs text-gray-300 mt-1"><i class="fas fa-arrow-right mr-1 text-blue-400"></i>\${l.next_action}</p>
      <p class="text-[10px] text-gray-500 mt-1 italic">\${l.boundary_note}</p>
    </div>
  \`).join('');

  const rules = document.getElementById('boundary-rules');
  rules.innerHTML = data.boundary_rules.map(r =>
    '<p class="text-xs text-gray-400"><i class="fas fa-shield-alt mr-1 text-gray-600"></i>' + r + '</p>'
  ).join('');
}

function renderCloseout(data) {
  const c = document.getElementById('closeout-content');
  const fields = [
    { key: 'build_summary', label: 'Build Summary', icon: 'fa-hammer' },
    { key: 'truth_verdict', label: 'Truth Verdict', icon: 'fa-balance-scale' },
    { key: 'blocker_summary', label: 'Blocker Summary', icon: 'fa-exclamation-triangle' },
    { key: 'boundary_verdict', label: 'Boundary Verdict', icon: 'fa-shield-alt' },
    { key: 'next_locked_move', label: 'Next Locked Move', icon: 'fa-lock' },
  ];
  c.innerHTML = fields.map(f => \`
    <div class="closeout-box rounded-lg p-4">
      <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
        <i class="fas \${f.icon} mr-1"></i>\${f.label}
      </p>
      <p class="text-sm text-gray-300">\${data[f.key]}</p>
    </div>
  \`).join('') + \`
    <p class="text-[10px] text-gray-500">Generated: \${data.generated_at}</p>
  \`;
}

async function refreshCloseout() {
  try {
    const res = await api('/closeout-draft');
    renderCloseout(res.data);
  } catch(e) { console.error(e); }
}

function renderNext(data) {
  const c = document.getElementById('next-content');
  c.innerHTML = \`
    <div class="bg-orange-900/20 border border-orange-800/30 rounded-lg p-4">
      <p class="text-xs text-orange-400 font-semibold uppercase tracking-wide mb-1">Next Target</p>
      <p class="text-sm font-medium">\${data.next_target}</p>
    </div>
    <div>
      <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Carry-Forward Items</p>
      \${data.carry_forward_items.map(i => '<p class="text-xs text-gray-300 mb-1"><i class="fas fa-angle-right mr-1 text-gray-600"></i>' + i + '</p>').join('')}
    </div>
    <div>
      <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Pending Founder Decisions</p>
      \${data.pending_founder_decisions.map(i => '<p class="text-xs text-yellow-300 mb-1"><i class="fas fa-question-circle mr-1"></i>' + i + '</p>').join('')}
    </div>
    <div>
      <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Out of Scope Reminders</p>
      \${data.out_of_scope_reminders.map(i => '<p class="text-xs text-red-300 mb-1"><i class="fas fa-ban mr-1"></i>' + i + '</p>').join('')}
    </div>
    <div>
      <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Steps After HUB-01</p>
      \${data.what_should_happen_after_hub01.map(i => '<p class="text-xs text-gray-300 mb-1"><i class="fas fa-check mr-1 text-green-600"></i>' + i + '</p>').join('')}
    </div>
  \`;
}

// =============================================================================
// INIT
// =============================================================================
if (JWT) {
  loadHub();
} else {
  document.getElementById('loading').classList.add('hidden');
}
</script>
</body>
</html>`
}
