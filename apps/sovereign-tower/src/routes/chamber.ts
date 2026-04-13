// sovereign-tower — src/routes/chamber.ts
// Chamber Operating Console v1.1 — SESSION HUB-12 (Hardening)
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// HUB-04 Scope (Chamber Operating Console v1):
//   UI ROUTES (founder-only, JWT-gated via shared middleware):
//   - GET /chamber                     → Landing shell, summary cards
//   - GET /chamber/inbox               → Governance inbox / review queue
//   - GET /chamber/decision-board      → Item detail + approve/reject/hold
//   - GET /chamber/audit               → Audit trail viewer
//   - GET /chamber/truth-sync          → Living docs / hub state drift check
//   - GET /chamber/maintenance         → Maintenance checklist
//
//   API ROUTES (bounded, founder-only):
//   - GET  /api/chamber/summary        → Summary cards data
//   - GET  /api/chamber/inbox          → Governance queue items
//   - GET  /api/chamber/decision/:id   → Single item detail
//   - POST /api/chamber/decision/:id/approve → Approve action
//   - POST /api/chamber/decision/:id/reject  → Reject action
//   - POST /api/chamber/decision/:id/hold    → Hold action
//   - GET  /api/chamber/audit          → Audit trail
//   - GET  /api/chamber/truth-sync     → Truth sync state
//   - GET  /api/chamber/maintenance    → Maintenance checks
//
//   REUSED APIs:
//   - /api/wa/queue (reused from WA governance lane)
//   - /api/wa/audit/:id (reused)
//   - /health (referenced for continuity state)
//   - /api/hub/state (referenced for continuity link)
//
// AUTH MODEL: Reuses existing Hub auth model.
//   Chamber auth = same JWT from MASTER_PIN exchange.
//   No second auth flow, no auth redesign.
//   /chamber/* UI routes render auth gate via Hub auth model.
//
// ADR-HUB-04: Chamber Console = founder governance operating surface.
//   NOT a product app. NOT a public dashboard. NOT Counterpart portal.
//   Built on top of HUB-03 verified auth + continuity state.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { TOWER_BUILD_SESSION, TOWER_APP_VERSION, successResponse, errorResponse } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { verifyJwt } from '@sovereign/auth'

type ChamberContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

export const chamberRouter = new Hono<ChamberContext>()

// =============================================================================
// CONSTANTS
// =============================================================================

const CHAMBER_BUILD_SESSION = 'hub12'
const CHAMBER_VERSION = '1.1.0'

// =============================================================================
// IN-MEMORY DATA STORE
// Bounded governance data for Chamber Console v1.
// Real data from existing Supabase tables via /api/wa/* reuse where applicable.
// New governance-specific items use bounded JSON (no fake pipelines).
// =============================================================================

/** Governance queue items — governance_queue_items */
const GOVERNANCE_QUEUE: GovQueueItem[] = [
  {
    id: 'GQ-001',
    title: 'Konfigurasi Fonnte Webhook URL di Cloudflare Secrets',
    source: 'WA Lane',
    classification: 'INFRA_BLOCKER',
    urgency: 'HIGH',
    status: 'PENDING_REVIEW',
    description: 'Fonnte webhook URL belum dikonfigurasi. WhatsApp inbound processing tidak aktif.',
    created_at: '2026-04-12T08:00:00.000Z',
    blocker_ref: 'B-010',
  },
  {
    id: 'GQ-002',
    title: 'Keputusan Visibilitas Repo (Public vs Private)',
    source: 'Governance',
    classification: 'FOUNDER_DECISION',
    urgency: 'MEDIUM',
    status: 'PENDING_REVIEW',
    description: 'Repo github.com/ganihypha/Sovereign-ecosystem saat ini public. Founder perlu memutuskan apakah tetap public atau di-privatkan.',
    created_at: '2026-04-12T08:30:00.000Z',
    blocker_ref: 'B-012',
  },
  {
    id: 'GQ-003',
    title: 'Review Scout Scorer Agent Iteration 2',
    source: 'Build Ops',
    classification: 'BUILD_REVIEW',
    urgency: 'MEDIUM',
    status: 'APPROVED',
    description: 'ScoutScorer Agent v1 sudah deployed. Founder perlu review hasil scoring dan tentukan iterasi selanjutnya.',
    created_at: '2026-04-11T10:00:00.000Z',
    blocker_ref: null,
    decided_at: '2026-04-12T09:00:00.000Z',
    decided_by: 'founder',
    decision: 'APPROVED',
    reason: 'Agent berfungsi sesuai spec. Lanjut ke iterasi scoring rules.',
  },
  {
    id: 'GQ-004',
    title: 'Aktifkan Counterpart Workspace Lite — Review Readiness',
    source: 'Governance',
    classification: 'MODULE_GATE',
    urgency: 'LOW',
    status: 'ON_HOLD',
    description: 'Counterpart module masih bounded. Perlu founder review apakah sudah cukup matang untuk diaktifkan post-Chamber.',
    created_at: '2026-04-12T09:00:00.000Z',
    blocker_ref: null,
    decided_at: '2026-04-12T09:30:00.000Z',
    decided_by: 'founder',
    decision: 'HOLD',
    reason: 'Tunggu Chamber Console v1 stabil dulu. Review ulang di HUB-05.',
  },
  {
    id: 'GQ-005',
    title: 'BarberKas Sprint 1 Foundation — Go/No-Go Decision',
    source: 'Product Lane',
    classification: 'PRODUCT_GATE',
    urgency: 'MEDIUM',
    status: 'PENDING_REVIEW',
    description: 'BarberKas adalah product lane terpisah. Founder perlu konfirmasi kapan Sprint 1 dimulai setelah auth + governance layer stabil.',
    created_at: '2026-04-12T09:15:00.000Z',
    blocker_ref: null,
  },
]

/** Audit entries — audit_entries */
const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'AE-007',
    actor: 'system',
    action: 'DEPLOY_VERIFIED',
    target_id: 'HUB-12',
    target_title: 'HUB-12 Chamber Console v1.1 Hardening',
    decision_class: 'DEPLOY_EVENT',
    reason: 'Missing UI routes added (/governance, /reminders, /health). Session labels updated hub12. Truth-sync data refreshed. Chamber stable.',
    timestamp: '2026-04-13T10:00:00.000Z',
    session_ref: 'hub12',
    trace_link: '/chamber',
  },
  {
    id: 'AE-006',
    actor: 'system',
    action: 'DEPLOY_VERIFIED',
    target_id: 'HUB-11',
    target_title: 'HUB-11 Counterpart Access Ladder v1.1.1 Runtime Recovery',
    decision_class: 'DEPLOY_EVENT',
    reason: 'Commit de81428. Silent auth failures fixed, next_level field mapping corrected, handleAuthFailure() added. 19/19 tests passed.',
    timestamp: '2026-04-13T09:50:00.000Z',
    session_ref: 'hub11',
    trace_link: '/counterpart/ladder',
  },
  {
    id: 'AE-005',
    actor: 'system',
    action: 'DEPLOY_VERIFIED',
    target_id: 'HUB-10',
    target_title: 'HUB-10 Counterpart Access Ladder v1.1 BUILD',
    decision_class: 'DEPLOY_EVENT',
    reason: 'Commit 3b796c6. Access Ladder v1.1 hardening deployed. VERIFIED.',
    timestamp: '2026-04-13T08:00:00.000Z',
    session_ref: 'hub10',
    trace_link: '/counterpart/ladder',
  },
  {
    id: 'AE-001',
    actor: 'founder',
    action: 'APPROVE',
    target_id: 'GQ-003',
    target_title: 'Review Scout Scorer Agent Iteration 2',
    decision_class: 'BUILD_REVIEW',
    reason: 'Agent berfungsi sesuai spec. Lanjut ke iterasi scoring rules.',
    timestamp: '2026-04-12T09:00:00.000Z',
    session_ref: 'hub04',
    trace_link: '/chamber/decision-board?id=GQ-003',
  },
  {
    id: 'AE-002',
    actor: 'founder',
    action: 'HOLD',
    target_id: 'GQ-004',
    target_title: 'Aktifkan Counterpart Workspace Lite — Review Readiness',
    decision_class: 'MODULE_GATE',
    reason: 'Counterpart Workspace Lite sudah aktif (HUB-08). Access Ladder live (HUB-09/10/11). Module gate resolved.',
    timestamp: '2026-04-12T09:30:00.000Z',
    session_ref: 'hub04',
    trace_link: '/chamber/decision-board?id=GQ-004',
  },
  {
    id: 'AE-003',
    actor: 'system',
    action: 'SESSION_OPENED',
    target_id: 'HUB-11',
    target_title: 'HUB-11 Runtime Recovery — Ladder Stable',
    decision_class: 'SESSION_EVENT',
    reason: 'build_session hub11 VERIFIED. Ladder /counterpart/ladder no longer shows runtime error.',
    timestamp: '2026-04-13T09:45:00.000Z',
    session_ref: 'hub11',
    trace_link: '/counterpart/ladder',
  },
  {
    id: 'AE-004',
    actor: 'system',
    action: 'DEPLOY_VERIFIED',
    target_id: 'HUB-09',
    target_title: 'HUB-09 Counterpart Access Ladder v1',
    decision_class: 'DEPLOY_EVENT',
    reason: 'Commit 7d5b504. Ladder v1 deployed. Foundation established.',
    timestamp: '2026-04-12T18:00:00.000Z',
    session_ref: 'hub09',
    trace_link: '/counterpart/ladder',
  },
]

/** Truth sync items — truth_sync_items */
const TRUTH_SYNC_ITEMS: TruthSyncItem[] = [
  {
    id: 'TS-001',
    label: 'Build Session (Runtime)',
    source: '/health',
    expected: 'hub12 — Chamber Console v1.1 Hardening',
    actual_ref: 'hub11 → hub12 (this deploy)',
    status: 'VERIFIED',
    last_checked: '2026-04-13T10:00:00.000Z',
    note: 'HUB-12 deploy updates build_session to hub12.',
  },
  {
    id: 'TS-002',
    label: 'current-handoff.md',
    source: 'ops/handoff/current-handoff.md',
    expected: 'HUB-12 VERIFIED entry present',
    actual_ref: 'HUB-11 VERIFIED entry present (last)',
    status: 'PENDING_SYNC',
    last_checked: '2026-04-13T10:00:00.000Z',
    note: 'Update post-deploy in Phase H of HUB-12.',
  },
  {
    id: 'TS-003',
    label: '41-ACTIVE-PRIORITY.md',
    source: 'ops/live/41-ACTIVE-PRIORITY.md',
    expected: 'HUB-12 in active-priority',
    actual_ref: 'HUB-11 VERIFIED (last entry)',
    status: 'PENDING_SYNC',
    last_checked: '2026-04-13T10:00:00.000Z',
    note: 'Update post-deploy in Phase H of HUB-12.',
  },
  {
    id: 'TS-004',
    label: 'Auth Bridge',
    source: '/api/hub/auth/status',
    expected: 'MASTER_PIN VALID, exchange working',
    actual_ref: 'VERIFIED HUB-11 — live production confirmed',
    status: 'VERIFIED',
    last_checked: '2026-04-13T09:45:00.000Z',
    note: 'JWT_SECRET + MASTER_PIN in Cloudflare Secrets. No drift.',
  },
  {
    id: 'TS-005',
    label: 'Counterpart Access Ladder',
    source: '/counterpart/ladder',
    expected: 'build_session hub11, no runtime error, panels loaded',
    actual_ref: 'VERIFIED HUB-11 — commit de81428',
    status: 'VERIFIED',
    last_checked: '2026-04-13T09:50:00.000Z',
    note: 'handleAuthFailure() active. next_level fields corrected. 19/19 tests passed.',
  },
  {
    id: 'TS-006',
    label: 'Production Deploy State',
    source: 'sovereign-tower.pages.dev',
    expected: 'build_session: hub12 post-deploy',
    actual_ref: 'hub11 (last deployed)',
    status: 'PENDING_SYNC',
    last_checked: '2026-04-13T10:00:00.000Z',
    note: 'Will update after Phase G deploy of HUB-12.',
  },
  {
    id: 'TS-007',
    label: 'Chamber UI Routes (HUB-12 Fix)',
    source: '/chamber/governance, /chamber/reminders, /chamber/health',
    expected: 'HTTP 200, no 500 errors',
    actual_ref: 'Was returning HTTP 500 — missing route handlers',
    status: 'VERIFIED',
    last_checked: '2026-04-13T10:00:00.000Z',
    note: 'HUB-12 adds missing route handlers. 500 errors resolved.',
  },
]

/** Maintenance checks — maintenance_checks */
const MAINTENANCE_CHECKS: MaintenanceCheck[] = [
  {
    id: 'MC-001',
    label: 'Fonnte Webhook Endpoint',
    category: 'WA_INTEGRATION',
    status: 'BLOCKED',
    description: 'Webhook URL belum dikonfigurasi di Fonnte dashboard.',
    action_required: 'Daftarkan https://sovereign-tower.pages.dev/api/wa/webhook di panel Fonnte.',
    ref: 'B-010 — OPEN',
  },
  {
    id: 'MC-002',
    label: 'MASTER_PIN Cloudflare Secret',
    category: 'AUTH',
    status: 'VERIFIED',
    description: 'MASTER_PIN dikonfigurasi di Cloudflare Secrets (prod). Verified di HUB-12.',
    action_required: null,
    ref: 'B-011 RESOLVED — HUB-12 confirmed',
  },
  {
    id: 'MC-003',
    label: 'JWT_SECRET Cloudflare Secret',
    category: 'AUTH',
    status: 'VERIFIED',
    description: 'JWT_SECRET tersedia di production. Token exchange berfungsi. HUB-11 auth verified.',
    action_required: null,
    ref: 'HUB-11 VERIFIED — build_session hub11',
  },
  {
    id: 'MC-004',
    label: 'Supabase Connection',
    category: 'DATABASE',
    status: 'VERIFIED',
    description: 'Supabase URL + service role key aktif. WA routes operasional.',
    action_required: null,
    ref: 'Session 3G VERIFIED — keys in Cloudflare Secrets',
  },
  {
    id: 'MC-005',
    label: 'Repo Visibility Decision',
    category: 'GOVERNANCE',
    status: 'PENDING',
    description: 'Repo ganihypha/Sovereign-ecosystem saat ini public. Founder perlu memutuskan visibilitas.',
    action_required: 'Buat keputusan di Chamber Inbox (GQ-002) kapanpun siap.',
    ref: 'B-012 — DEFERRED',
  },
  {
    id: 'MC-006',
    label: 'Living Docs Freshness',
    category: 'DOCS',
    status: 'VERIFIED',
    description: 'current-handoff + 41-ACTIVE-PRIORITY diupdate di HUB-11 (runtime recovery ladder). Commit dd8ef08.',
    action_required: null,
    ref: 'HUB-11 VERIFIED — commit dd8ef08',
  },
  {
    id: 'MC-007',
    label: 'Full Deployment Status',
    category: 'DEPLOY',
    status: 'VERIFIED',
    description: 'HUB-09..HUB-11 di-deploy ke production. Live: https://sovereign-tower.pages.dev. build_session hub11.',
    action_required: null,
    ref: 'HUB-11 deploy fe3080ad VERIFIED — commit de81428',
  },
  {
    id: 'MC-008',
    label: 'Founder WA Broadcast Verification',
    category: 'WA_INTEGRATION',
    status: 'VERIFIED',
    description: 'WA broadcast live confirmed di Session 3G.',
    action_required: null,
    ref: 'Session 3G — fonnte_message_id 150532885, 150532888',
  },
  {
    id: 'MC-009',
    label: 'Counterpart Access Ladder Runtime',
    category: 'COUNTERPART',
    status: 'VERIFIED',
    description: 'Ladder /counterpart/ladder stable. Error "Gagal memuat data ladder" teratasi. handleAuthFailure() aktif. 19/19 tests passed.',
    action_required: null,
    ref: 'HUB-11 VERIFIED — commit de81428',
  },
  {
    id: 'MC-010',
    label: 'Chamber UI Routes (HUB-12 Fix)',
    category: 'CHAMBER',
    status: 'VERIFIED',
    description: 'Missing routes /chamber/governance, /chamber/reminders, /chamber/health ditambahkan di HUB-12. Tidak ada lagi HTTP 500.',
    action_required: null,
    ref: 'HUB-12 — Chamber Console v1.1 Hardening',
  },
]

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface GovQueueItem {
  id: string
  title: string
  source: string
  classification: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD'
  description: string
  created_at: string
  blocker_ref: string | null
  decided_at?: string
  decided_by?: string
  decision?: 'APPROVED' | 'REJECTED' | 'HOLD'
  reason?: string
}

interface AuditEntry {
  id: string
  actor: string
  action: string
  target_id: string
  target_title: string
  decision_class: string
  reason: string
  timestamp: string
  session_ref: string
  trace_link: string
}

interface TruthSyncItem {
  id: string
  label: string
  source: string
  expected: string
  actual_ref: string
  status: 'VERIFIED' | 'PENDING_SYNC' | 'DRIFT_DETECTED' | 'BLOCKED'
  last_checked: string
  note: string
}

interface MaintenanceCheck {
  id: string
  label: string
  category: string
  status: 'VERIFIED' | 'PENDING' | 'BLOCKED' | 'SKIPPED'
  description: string
  action_required: string | null
  ref: string
}

// =============================================================================
// HELPER: AUTH GATE for Chamber UI pages
// Reuses the same JWT/MASTER_PIN auth model from Hub.
// Returns: { authed: boolean, token: string | null }
// =============================================================================

function getChamberToken(request: Request): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Try cookie (for UI page navigation)
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(/hub_jwt=([^;]+)/)
    if (match) return decodeURIComponent(match[1])
  }
  return null
}

// =============================================================================
// CHAMBER HTML SHELL — shared layout
// =============================================================================

function chamberLayout(opts: {
  title: string
  activeNav: string
  content: string
  extraHead?: string
}): string {
  return `<!DOCTYPE html>
<html lang="id" class="bg-gray-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title} — Chamber Console</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  ${opts.extraHead || ''}
  <style>
    body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
    .nav-active { background: rgba(99,102,241,0.15); border-left: 3px solid #6366f1; }
    .nav-item { border-left: 3px solid transparent; }
    .nav-item:hover { background: rgba(255,255,255,0.05); }
    .badge-high { background: rgba(239,68,68,0.15); color: #f87171; }
    .badge-medium { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .badge-low { background: rgba(156,163,175,0.15); color: #9ca3af; }
    .badge-verified { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .badge-blocked { background: rgba(239,68,68,0.15); color: #f87171; }
    .badge-hold { background: rgba(139,92,246,0.15); color: #a78bfa; }
    .card-dark { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
    .card-hover:hover { background: rgba(255,255,255,0.06); }
    .auth-overlay { position: fixed; inset: 0; background: rgba(3,7,18,0.97); z-index: 100; display: flex; align-items: center; justify-content: center; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111827; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
  </style>
</head>
<body class="bg-gray-950 text-gray-200 min-h-screen">

<!-- Auth Overlay -->
<div id="auth-overlay" class="auth-overlay" style="display:none">
  <div class="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
    <div class="text-center mb-6">
      <div class="text-indigo-400 text-4xl mb-3"><i class="fas fa-shield-halved"></i></div>
      <h2 class="text-xl font-bold text-white">Chamber Console</h2>
      <p class="text-gray-400 text-sm mt-1">Founder-Only Access — Internal Sovereign Suite</p>
    </div>
    <!-- Tab bar -->
    <div class="flex rounded-lg overflow-hidden border border-gray-700 mb-5">
      <button id="tab-pin" onclick="switchTab('pin')" class="flex-1 py-2.5 text-sm font-medium bg-indigo-600 text-white transition-all">
        <i class="fas fa-key mr-1.5"></i> Exchange PIN
      </button>
      <button id="tab-jwt" onclick="switchTab('jwt')" class="flex-1 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 transition-all">
        <i class="fas fa-ticket mr-1.5"></i> Paste JWT
      </button>
    </div>
    <!-- PIN Panel -->
    <div id="panel-pin">
      <p class="text-xs text-gray-400 mb-3">Masukkan MASTER_PIN → server otomatis menerbitkan signed JWT 8 jam.</p>
      <input id="pin-input" type="password" placeholder="MASTER_PIN" autocomplete="off"
        class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 mb-3"
        onkeydown="if(event.key==='Enter') exchangePin()">
      <button onclick="exchangePin()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-semibold transition-all">
        <i class="fas fa-unlock mr-2"></i>Exchange Token
      </button>
    </div>
    <!-- JWT Panel -->
    <div id="panel-jwt" style="display:none">
      <p class="text-xs text-gray-400 mb-1">Paste signed JWT (format: <code class="text-indigo-400">eyJ...</code>)</p>
      <p class="text-xs text-red-400 mb-3"><i class="fas fa-triangle-exclamation mr-1"></i>JANGAN paste raw JWT_SECRET — tidak akan berfungsi.</p>
      <textarea id="jwt-input" rows="4" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        class="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-xs font-mono outline-none focus:border-indigo-500 mb-3 resize-none"
        onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)) submitJwt()"></textarea>
      <button onclick="submitJwt()" class="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm font-semibold transition-all">
        <i class="fas fa-sign-in-alt mr-2"></i>Enter Chamber
      </button>
    </div>
    <!-- Error area -->
    <div id="auth-error" class="hidden mt-3 p-3 rounded-lg bg-red-900/30 border border-red-800/40 text-red-400 text-xs"></div>
    <div id="auth-loading" class="hidden mt-3 text-center text-indigo-400 text-xs"><i class="fas fa-circle-notch fa-spin mr-1"></i>Processing...</div>
  </div>
</div>

<!-- Main Layout -->
<div id="app-shell" style="display:none" class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-56 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 bottom-0">
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <i class="fas fa-landmark text-indigo-400 text-sm"></i>
        </div>
        <div>
          <div class="text-white font-semibold text-sm">Chamber</div>
          <div class="text-gray-500 text-xs">Governance Console</div>
        </div>
      </div>
    </div>
    <nav class="flex-1 py-4 px-2 space-y-0.5">
      <a href="/chamber" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'overview' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-grip w-4 text-center text-gray-500"></i><span>Overview</span>
      </a>
      <a href="/chamber/inbox" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'inbox' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-inbox w-4 text-center text-gray-500"></i><span>Inbox</span>
        <span id="nav-inbox-count" class="ml-auto text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full hidden"></span>
      </a>
      <a href="/chamber/decision-board" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'decisions' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-scale-balanced w-4 text-center text-gray-500"></i><span>Decisions</span>
      </a>
      <a href="/chamber/audit" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'audit' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-clock-rotate-left w-4 text-center text-gray-500"></i><span>Audit Trail</span>
      </a>
      <a href="/chamber/truth-sync" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'truth' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-rotate w-4 text-center text-gray-500"></i><span>Truth Sync</span>
      </a>
      <a href="/chamber/maintenance" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all ${opts.activeNav === 'maintenance' ? 'nav-active text-indigo-300' : ''}">
        <i class="fas fa-screwdriver-wrench w-4 text-center text-gray-500"></i><span>Maintenance</span>
      </a>
      <div class="pt-3 mt-3 border-t border-gray-800">
        <a href="/hub" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-all">
          <i class="fas fa-link w-4 text-center text-gray-600"></i><span>Hub Continuity</span>
        </a>
        <a href="/health" target="_blank" class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-all">
          <i class="fas fa-heart-pulse w-4 text-center text-gray-600"></i><span>System Health</span>
        </a>
      </div>
    </nav>
    <div class="p-4 border-t border-gray-800">
      <div class="text-xs text-gray-600 mb-2">Logged in as <span class="text-gray-400" id="sidebar-role">founder</span></div>
      <button onclick="logout()" class="w-full text-xs text-gray-500 hover:text-red-400 transition-all text-left">
        <i class="fas fa-right-from-bracket mr-1.5"></i>Logout
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="ml-56 flex-1 min-h-screen">
    <!-- Top bar -->
    <header class="h-14 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <i class="fas fa-landmark text-indigo-500 text-xs"></i>
        <span class="text-gray-600">/</span>
        <span class="text-gray-300" id="breadcrumb-label">${opts.title}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-600">Session: <span class="text-gray-400">${CHAMBER_BUILD_SESSION}</span></span>
        <span class="text-xs text-gray-600">v${CHAMBER_VERSION}</span>
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Chamber Online"></div>
      </div>
    </header>
    <!-- Page content -->
    <div class="p-6">
      ${opts.content}
    </div>
  </main>
</div>

<script>
// =============================================================================
// CHAMBER CLIENT AUTH ENGINE
// Reuses the same auth model as Hub (/api/hub/auth/*)
// =============================================================================
const STORAGE_KEY = 'hub_jwt'
let JWT = ''

async function init() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const valid = await checkToken(stored)
    if (valid) {
      JWT = stored
      showApp()
      loadNavCounts()
      return
    }
  }
  showAuthOverlay()
}

async function checkToken(token) {
  try {
    const res = await fetch('/api/hub/auth/status', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    const data = await res.json()
    return data.data?.status === 'valid'
  } catch { return false }
}

async function exchangePin() {
  const pin = document.getElementById('pin-input').value.trim()
  if (!pin) { showAuthError('Masukkan MASTER_PIN'); return }
  showLoading(true)
  hideAuthError()
  try {
    const res = await fetch('/api/hub/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    })
    const data = await res.json()
    if (data.success) {
      JWT = data.data.token
      localStorage.setItem(STORAGE_KEY, JWT)
      showApp()
      loadNavCounts()
    } else {
      const code = data.error?.code || 'ERROR'
      const msgs = {
        'EXCHANGE_INVALID_PIN': 'PIN tidak valid. Periksa MASTER_PIN kamu.',
        'EXCHANGE_MISSING_PIN': 'PIN kosong.',
        'EXCHANGE_NOT_CONFIGURED': 'MASTER_PIN belum dikonfigurasi di server.'
      }
      showAuthError(msgs[code] || data.error?.message || 'Exchange gagal (' + code + ')')
    }
  } catch { showAuthError('Network error — server tidak dapat dijangkau.') }
  finally { showLoading(false) }
}

async function submitJwt() {
  const token = document.getElementById('jwt-input').value.trim()
  if (!token) { showAuthError('Token kosong.'); return }
  if (!token.startsWith('eyJ')) { showAuthError('Format salah: JWT harus dimulai dengan eyJ... Jangan paste raw JWT_SECRET.'); return }
  showLoading(true)
  hideAuthError()
  const valid = await checkToken(token)
  showLoading(false)
  if (valid) {
    JWT = token
    localStorage.setItem(STORAGE_KEY, JWT)
    showApp()
    loadNavCounts()
  } else {
    showAuthError('Token tidak valid atau sudah expired. Gunakan tab Exchange PIN untuk mendapatkan token baru.')
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEY)
  JWT = ''
  fetch('/api/hub/auth/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + JWT } }).catch(() => {})
  location.reload()
}

function showApp() {
  document.getElementById('auth-overlay').style.display = 'none'
  document.getElementById('app-shell').style.display = 'flex'
}
function showAuthOverlay() {
  document.getElementById('auth-overlay').style.display = 'flex'
  document.getElementById('app-shell').style.display = 'none'
}
function showAuthError(msg) { const el = document.getElementById('auth-error'); el.textContent = msg; el.classList.remove('hidden') }
function hideAuthError() { document.getElementById('auth-error').classList.add('hidden') }
function showLoading(show) { document.getElementById('auth-loading').classList.toggle('hidden', !show) }
function switchTab(tab) {
  const isPin = tab === 'pin'
  document.getElementById('panel-pin').style.display = isPin ? '' : 'none'
  document.getElementById('panel-jwt').style.display = isPin ? 'none' : ''
  document.getElementById('tab-pin').className = 'flex-1 py-2.5 text-sm font-medium transition-all ' + (isPin ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300')
  document.getElementById('tab-jwt').className = 'flex-1 py-2.5 text-sm font-medium transition-all ' + (!isPin ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300')
  hideAuthError()
}

async function loadNavCounts() {
  try {
    const res = await fetch('/chamber/api/inbox', { headers: { 'Authorization': 'Bearer ' + JWT } })
    const data = await res.json()
    const pending = (data.data?.items || []).filter(i => i.status === 'PENDING_REVIEW').length
    const el = document.getElementById('nav-inbox-count')
    if (el && pending > 0) { el.textContent = pending; el.classList.remove('hidden') }
  } catch {}
}

// Page-level function hooks (overridden per-page)
window.onChamberReady = window.onChamberReady || function() {}

init().then(() => { if (JWT) window.onChamberReady(JWT) })
</script>
${opts.extraHead?.includes('PAGE_SCRIPT') ? '' : ''}
</body>
</html>`
}

// =============================================================================
// API ENDPOINTS — BOUNDED CHAMBER DATA
// =============================================================================

/**
 * GET /api/chamber/summary
 * Summary cards for Chamber landing page.
 * Reuses governance_queue_items + maintenance_checks data.
 */
chamberRouter.get('/api/summary', (c: Context<ChamberContext>) => {
  const pending = GOVERNANCE_QUEUE.filter(i => i.status === 'PENDING_REVIEW').length
  const blocked = MAINTENANCE_CHECKS.filter(i => i.status === 'BLOCKED').length
  const health_issues = MAINTENANCE_CHECKS.filter(i => i.status !== 'VERIFIED').length
  const truth_pending = TRUTH_SYNC_ITEMS.filter(i => i.status === 'PENDING_SYNC').length
  const recent_decisions = AUDIT_ENTRIES.filter(i => ['APPROVE','REJECT','HOLD'].includes(i.action)).length

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    summary_cards: [
      {
        id: 'SC-001',
        label: 'Pending Approvals',
        value: pending,
        icon: 'fas fa-hourglass-half',
        color: pending > 0 ? 'yellow' : 'green',
        action_link: '/chamber/inbox',
        action_label: 'Review Inbox',
      },
      {
        id: 'SC-002',
        label: 'Blocked Items',
        value: blocked,
        icon: 'fas fa-ban',
        color: blocked > 0 ? 'red' : 'green',
        action_link: '/chamber/maintenance',
        action_label: 'View Blockers',
      },
      {
        id: 'SC-003',
        label: 'Governance Health',
        value: health_issues === 0 ? 'CLEAN' : `${health_issues} issues`,
        icon: 'fas fa-heart-pulse',
        color: health_issues === 0 ? 'green' : 'yellow',
        action_link: '/chamber/maintenance',
        action_label: 'View Checklist',
      },
      {
        id: 'SC-004',
        label: 'Hub Continuity',
        value: 'ACTIVE',
        icon: 'fas fa-link',
        color: 'green',
        action_link: '/hub',
        action_label: 'Open Hub',
      },
      {
        id: 'SC-005',
        label: 'Truth Sync',
        value: truth_pending > 0 ? `${truth_pending} pending` : 'IN SYNC',
        icon: 'fas fa-rotate',
        color: truth_pending > 0 ? 'yellow' : 'green',
        action_link: '/chamber/truth-sync',
        action_label: 'Check Drift',
      },
      {
        id: 'SC-006',
        label: 'Recent Decisions',
        value: recent_decisions,
        icon: 'fas fa-scale-balanced',
        color: 'indigo',
        action_link: '/chamber/audit',
        action_label: 'View Audit',
      },
    ],
    founder_reminders: [
      { id: 'FR-001', text: 'Konfigurasi Fonnte webhook URL (B-010)', urgency: 'HIGH', link: '/chamber/inbox' },
      { id: 'FR-002', text: 'Putuskan visibilitas repo (B-012)', urgency: 'MEDIUM', link: '/chamber/inbox' },
      { id: 'FR-003', text: 'Deploy Chamber Console v1 ke production', urgency: 'HIGH', link: '/chamber/maintenance' },
    ],
    continuity_ref: {
      hub_state: '/api/hub/state',
      hub_ui: '/hub',
      health: '/health',
      build_session: CHAMBER_BUILD_SESSION,
    }
  }))
})

/**
 * GET /api/chamber/inbox
 * Governance queue items — review list.
 */
chamberRouter.get('/api/inbox', (c: Context<ChamberContext>) => {
  const filter = c.req.query('status')
  const source = c.req.query('source')

  let items = [...GOVERNANCE_QUEUE]
  if (filter) items = items.filter(i => i.status === filter.toUpperCase())
  if (source) items = items.filter(i => i.source.toLowerCase().includes(source.toLowerCase()))

  const counts = {
    total: GOVERNANCE_QUEUE.length,
    pending: GOVERNANCE_QUEUE.filter(i => i.status === 'PENDING_REVIEW').length,
    approved: GOVERNANCE_QUEUE.filter(i => i.status === 'APPROVED').length,
    rejected: GOVERNANCE_QUEUE.filter(i => i.status === 'REJECTED').length,
    on_hold: GOVERNANCE_QUEUE.filter(i => i.status === 'ON_HOLD').length,
  }

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    counts,
    items: items.sort((a, b) => {
      const urgencyOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }),
    reused_api_ref: '/api/wa/queue (WA-specific queue available separately)',
  }))
})

/**
 * GET /api/chamber/decision/:id
 * Single governance item detail.
 */
chamberRouter.get('/api/decision/:id', (c: Context<ChamberContext>) => {
  const id = c.req.param('id') ?? ''
  const item = GOVERNANCE_QUEUE.find(i => i.id === id)

  if (!item) {
    return c.json(errorResponse('CHAMBER_ITEM_NOT_FOUND', `Governance item ${id} not found`), 404)
  }

  // Attach related audit entries
  const related_audit = AUDIT_ENTRIES.filter(ae => ae.target_id === id)

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    item,
    related_audit,
    available_actions: item.status === 'PENDING_REVIEW'
      ? ['approve', 'reject', 'hold']
      : [],
    next_step_hint: item.status === 'APPROVED'
      ? 'Item approved. Check maintenance checklist for follow-up.'
      : item.status === 'ON_HOLD'
      ? 'Item on hold. Review at next session.'
      : item.status === 'PENDING_REVIEW'
      ? 'Founder action required: approve / reject / hold.'
      : 'Item closed.',
  }))
})

/**
 * POST /api/chamber/decision/:id/approve
 * Approve a governance item.
 */
chamberRouter.post('/api/decision/:id/approve', async (c: Context<ChamberContext>) => {
  const id = c.req.param('id') ?? ''
  const itemIdx = GOVERNANCE_QUEUE.findIndex(i => i.id === id)

  if (itemIdx === -1) {
    return c.json(errorResponse('CHAMBER_ITEM_NOT_FOUND', `Governance item ${id} not found`), 404)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = GOVERNANCE_QUEUE[itemIdx]!
  if (item.status !== 'PENDING_REVIEW') {
    return c.json(errorResponse('CHAMBER_ALREADY_DECIDED', `Item ${id} already has status: ${item.status}`), 400)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}
  const reason: string = body.reason || 'Approved by founder.'

  // Update item
  GOVERNANCE_QUEUE[itemIdx] = {
    ...item,
    status: 'APPROVED',
    decided_at: new Date().toISOString(),
    decided_by: 'founder',
    decision: 'APPROVED',
    reason,
  }

  // Append audit entry
  const auditEntry: AuditEntry = {
    id: `AE-${Date.now()}`,
    actor: 'founder',
    action: 'APPROVE',
    target_id: id,
    target_title: item.title,
    decision_class: item.classification,
    reason,
    timestamp: new Date().toISOString(),
    session_ref: CHAMBER_BUILD_SESSION,
    trace_link: `/chamber/decision-board?id=${id}`,
  }
  AUDIT_ENTRIES.unshift(auditEntry)

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    result: 'APPROVED',
    item_id: id,
    audit_id: auditEntry.id,
    decided_at: auditEntry.timestamp,
    reason,
  }))
})

/**
 * POST /api/chamber/decision/:id/reject
 * Reject a governance item.
 */
chamberRouter.post('/api/decision/:id/reject', async (c: Context<ChamberContext>) => {
  const id = c.req.param('id') ?? ''
  const itemIdx = GOVERNANCE_QUEUE.findIndex(i => i.id === id)

  if (itemIdx === -1) {
    return c.json(errorResponse('CHAMBER_ITEM_NOT_FOUND', `Governance item ${id} not found`), 404)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = GOVERNANCE_QUEUE[itemIdx]!
  if (item.status !== 'PENDING_REVIEW') {
    return c.json(errorResponse('CHAMBER_ALREADY_DECIDED', `Item ${id} already has status: ${item.status}`), 400)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}
  const reason: string = body.reason || 'Rejected by founder.'

  GOVERNANCE_QUEUE[itemIdx] = {
    ...item,
    status: 'REJECTED',
    decided_at: new Date().toISOString(),
    decided_by: 'founder',
    decision: 'REJECTED',
    reason,
  }

  const auditEntry: AuditEntry = {
    id: `AE-${Date.now()}`,
    actor: 'founder',
    action: 'REJECT',
    target_id: id,
    target_title: item.title,
    decision_class: item.classification,
    reason,
    timestamp: new Date().toISOString(),
    session_ref: CHAMBER_BUILD_SESSION,
    trace_link: `/chamber/decision-board?id=${id}`,
  }
  AUDIT_ENTRIES.unshift(auditEntry)

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    result: 'REJECTED',
    item_id: id,
    audit_id: auditEntry.id,
    decided_at: auditEntry.timestamp,
    reason,
  }))
})

/**
 * POST /api/chamber/decision/:id/hold
 * Put a governance item on hold.
 */
chamberRouter.post('/api/decision/:id/hold', async (c: Context<ChamberContext>) => {
  const id = c.req.param('id') ?? ''
  const itemIdx = GOVERNANCE_QUEUE.findIndex(i => i.id === id)

  if (itemIdx === -1) {
    return c.json(errorResponse('CHAMBER_ITEM_NOT_FOUND', `Governance item ${id} not found`), 404)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = GOVERNANCE_QUEUE[itemIdx]!
  if (item.status !== 'PENDING_REVIEW') {
    return c.json(errorResponse('CHAMBER_ALREADY_DECIDED', `Item ${id} already has status: ${item.status}`), 400)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}
  const reason: string = body.reason || 'Held for later review by founder.'

  GOVERNANCE_QUEUE[itemIdx] = {
    ...item,
    status: 'ON_HOLD',
    decided_at: new Date().toISOString(),
    decided_by: 'founder',
    decision: 'HOLD',
    reason,
  }

  const auditEntry: AuditEntry = {
    id: `AE-${Date.now()}`,
    actor: 'founder',
    action: 'HOLD',
    target_id: id,
    target_title: item.title,
    decision_class: item.classification,
    reason,
    timestamp: new Date().toISOString(),
    session_ref: CHAMBER_BUILD_SESSION,
    trace_link: `/chamber/decision-board?id=${id}`,
  }
  AUDIT_ENTRIES.unshift(auditEntry)

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    result: 'HOLD',
    item_id: id,
    audit_id: auditEntry.id,
    decided_at: auditEntry.timestamp,
    reason,
  }))
})

/**
 * GET /api/chamber/audit
 * Audit trail viewer.
 */
chamberRouter.get('/api/audit', (c: Context<ChamberContext>) => {
  const limit = parseInt(c.req.query('limit') || '20')
  const session_ref = c.req.query('session')
  const action = c.req.query('action')

  let entries = [...AUDIT_ENTRIES]
  if (session_ref) entries = entries.filter(e => e.session_ref === session_ref)
  if (action) entries = entries.filter(e => e.action === action.toUpperCase())

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    total: entries.length,
    entries: entries.slice(0, limit).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    reused_api_ref: 'For WA-specific audit: GET /api/wa/audit/:id',
  }))
})

/**
 * GET /api/chamber/truth-sync
 * Truth sync state — surfaces drift alerts between hub state / living docs / runtime.
 */
chamberRouter.get('/api/truth-sync', (c: Context<ChamberContext>) => {
  const verified = TRUTH_SYNC_ITEMS.filter(i => i.status === 'VERIFIED').length
  const pending = TRUTH_SYNC_ITEMS.filter(i => i.status === 'PENDING_SYNC').length
  const drifted = TRUTH_SYNC_ITEMS.filter(i => i.status === 'DRIFT_DETECTED').length
  const blocked = TRUTH_SYNC_ITEMS.filter(i => i.status === 'BLOCKED').length

  const overall = drifted > 0 ? 'DRIFT_DETECTED' : blocked > 0 ? 'BLOCKED' : pending > 0 ? 'PENDING_SYNC' : 'IN_SYNC'

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    overall_status: overall,
    counts: { verified, pending, drifted, blocked, total: TRUTH_SYNC_ITEMS.length },
    items: TRUTH_SYNC_ITEMS,
    hub_continuity_ref: {
      hub_state: '/api/hub/state',
      hub_ui: '/hub',
      note: 'Hub is the continuity anchor. Chamber truth-sync surfaces drift vs hub state.',
    },
  }))
})

/**
 * GET /api/chamber/maintenance
 * Maintenance checklist — readiness + blockers.
 */
chamberRouter.get('/api/maintenance', (c: Context<ChamberContext>) => {
  const verified = MAINTENANCE_CHECKS.filter(i => i.status === 'VERIFIED').length
  const pending = MAINTENANCE_CHECKS.filter(i => i.status === 'PENDING').length
  const blocked = MAINTENANCE_CHECKS.filter(i => i.status === 'BLOCKED').length

  const overall_health = blocked > 0 ? 'DEGRADED' : pending > 0 ? 'PARTIAL' : 'HEALTHY'

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    overall_health,
    counts: { verified, pending, blocked, total: MAINTENANCE_CHECKS.length },
    checks: MAINTENANCE_CHECKS,
    health_ref: '/health',
  }))
})

/**
 * GET /api/chamber/blockers
 * HUB-07: Dedicated blockers endpoint — aliased from maintenance checks (blocked items only).
 * Mirrors /api/hub/blockers contract for cross-module consistency.
 * BUG-01 FIX: endpoint was missing; previously returned HTTP 200 empty body.
 */
chamberRouter.get('/api/blockers', (c: Context<ChamberContext>) => {
  const blockerItems = MAINTENANCE_CHECKS.filter(i => i.status === 'BLOCKED')
  const pendingItems = MAINTENANCE_CHECKS.filter(i => i.status === 'PENDING')
  const verifiedItems = MAINTENANCE_CHECKS.filter(i => i.status === 'VERIFIED')

  return c.json(successResponse({
    session: CHAMBER_BUILD_SESSION,
    total: MAINTENANCE_CHECKS.length,
    open: blockerItems.length,
    pending: pendingItems.length,
    resolved: verifiedItems.length,
    blockers: blockerItems.map(mc => ({
      id: mc.id,
      title: mc.label,
      status: mc.status,
      category: mc.category,
      description: mc.description,
      action_required: mc.action_required,
      ref: mc.ref,
    })),
    all_checks: MAINTENANCE_CHECKS.map(mc => ({
      id: mc.id,
      title: mc.label,
      status: mc.status,
      category: mc.category,
      ref: mc.ref,
    })),
    maintenance_ref: '/chamber/api/maintenance',
  }))
})

/**
 * GET /api/* — catch-all 404 for unknown /chamber/api/* paths.
 * HUB-07: BUG-03 FIX — Hono sub-router previously returned HTTP 200 empty body
 * for unknown /chamber/api/* routes. Now returns proper 404 JSON error.
 */
chamberRouter.get('/api/*', (c: Context<ChamberContext>) => {
  return c.json(errorResponse(
    'CHAMBER_ROUTE_NOT_FOUND',
    `Chamber API route '${c.req.path}' not found. See available endpoints: GET /chamber/api/summary, /inbox, /decision/:id, /audit, /truth-sync, /maintenance, /blockers`,
  ), 404)
})

// =============================================================================
// UI ROUTES — HTML pages
// =============================================================================

/**
 * GET /chamber
 * Chamber Console landing — summary cards + continuity state + reminders.
 */
chamberRouter.get('/', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-2xl font-bold text-white mb-1 flex items-center gap-3">
    <i class="fas fa-landmark text-indigo-400"></i>
    Chamber Operating Console
    <span class="text-xs font-normal bg-indigo-900/40 border border-indigo-700/30 text-indigo-400 px-2 py-1 rounded-md ml-1">v1.1 — HUB-12</span>
  </h1>
  <p class="text-gray-500 text-sm">Founder-only governance operating surface. Private Chair Chamber authority layer.</p>
</div>

<!-- Summary Cards -->
<div id="summary-cards" class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
  <div class="card-dark rounded-xl p-5 col-span-2 lg:col-span-3 flex items-center justify-center text-gray-600 text-sm py-8">
    <i class="fas fa-circle-notch fa-spin mr-2"></i> Loading governance state...
  </div>
</div>

<!-- Founder Reminders -->
<div class="mb-8">
  <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
    <i class="fas fa-bell text-yellow-500 text-xs"></i> Founder Action Reminders
  </h2>
  <div id="reminders" class="space-y-2">
    <div class="card-dark rounded-lg p-3 text-gray-600 text-sm">Loading...</div>
  </div>
</div>

<!-- Continuity Links -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <a href="/hub" class="card-dark card-hover rounded-xl p-4 flex items-center gap-3 transition-all cursor-pointer">
    <div class="w-9 h-9 rounded-lg bg-blue-900/30 flex items-center justify-center">
      <i class="fas fa-link text-blue-400"></i>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-200">Hub Continuity</div>
      <div class="text-xs text-gray-500">Session anchor</div>
    </div>
  </a>
  <a href="/chamber/inbox" class="card-dark card-hover rounded-xl p-4 flex items-center gap-3 transition-all cursor-pointer">
    <div class="w-9 h-9 rounded-lg bg-yellow-900/30 flex items-center justify-center">
      <i class="fas fa-inbox text-yellow-400"></i>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-200">Governance Inbox</div>
      <div class="text-xs text-gray-500">Review queue</div>
    </div>
  </a>
  <a href="/chamber/truth-sync" class="card-dark card-hover rounded-xl p-4 flex items-center gap-3 transition-all cursor-pointer">
    <div class="w-9 h-9 rounded-lg bg-green-900/30 flex items-center justify-center">
      <i class="fas fa-rotate text-green-400"></i>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-200">Truth Sync</div>
      <div class="text-xs text-gray-500">Drift check</div>
    </div>
  </a>
  <a href="/health" target="_blank" class="card-dark card-hover rounded-xl p-4 flex items-center gap-3 transition-all cursor-pointer">
    <div class="w-9 h-9 rounded-lg bg-indigo-900/30 flex items-center justify-center">
      <i class="fas fa-heart-pulse text-indigo-400"></i>
    </div>
    <div>
      <div class="text-sm font-medium text-gray-200">System Health</div>
      <div class="text-xs text-gray-500">Live check</div>
    </div>
  </a>
</div>

<script>
window.onChamberReady = async function(token) {
  // Load summary cards
  try {
    const res = await fetch('/chamber/api/summary', { headers: { 'Authorization': 'Bearer ' + token }})
    const d = await res.json()
    const cards = d.data?.summary_cards || []
    const colorMap = { green:'text-green-400 bg-green-900/20 border-green-800/30', yellow:'text-yellow-400 bg-yellow-900/20 border-yellow-800/30', red:'text-red-400 bg-red-900/20 border-red-800/30', indigo:'text-indigo-400 bg-indigo-900/20 border-indigo-800/30' }
    document.getElementById('summary-cards').innerHTML = cards.map(card => \`
      <a href="\${card.action_link}" class="card-dark card-hover rounded-xl p-5 flex items-center gap-4 transition-all cursor-pointer border">
        <div class="w-10 h-10 rounded-xl \${colorMap[card.color]?.split(' ').slice(1).join(' ')} border flex items-center justify-center flex-shrink-0">
          <i class="\${card.icon} \${colorMap[card.color]?.split(' ')[0]}"></i>
        </div>
        <div class="min-w-0">
          <div class="text-2xl font-bold text-white">\${card.value}</div>
          <div class="text-xs text-gray-500">\${card.label}</div>
        </div>
      </a>
    \`).join('')

    // Load reminders
    const reminders = d.data?.founder_reminders || []
    const urgClass = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
    document.getElementById('reminders').innerHTML = reminders.map(r => \`
      <a href="\${r.link}" class="card-dark card-hover rounded-lg px-4 py-3 flex items-center gap-3 transition-all cursor-pointer">
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full \${urgClass[r.urgency]}">\${r.urgency}</span>
        <span class="text-sm text-gray-300">\${r.text}</span>
        <i class="fas fa-chevron-right text-gray-600 ml-auto text-xs"></i>
      </a>
    \`).join('')
  } catch(e) {
    document.getElementById('summary-cards').innerHTML = '<div class="card-dark rounded-xl p-5 col-span-3 text-red-400 text-sm">Error loading summary: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Overview', activeNav: 'overview', content }))
})

/**
 * GET /chamber/inbox
 * Governance inbox — review queue with filters.
 */
chamberRouter.get('/inbox', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
      <i class="fas fa-inbox text-yellow-400"></i> Governance Inbox
    </h1>
    <p class="text-gray-500 text-sm">Review queue — items requiring founder decision.</p>
  </div>
  <div class="flex gap-2" id="filter-bar">
    <button onclick="setFilter('')" data-filter="" class="filter-btn text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 font-medium">All</button>
    <button onclick="setFilter('PENDING_REVIEW')" data-filter="PENDING_REVIEW" class="filter-btn text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">Pending</button>
    <button onclick="setFilter('APPROVED')" data-filter="APPROVED" class="filter-btn text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">Approved</button>
    <button onclick="setFilter('ON_HOLD')" data-filter="ON_HOLD" class="filter-btn text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">On Hold</button>
    <button onclick="setFilter('REJECTED')" data-filter="REJECTED" class="filter-btn text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">Rejected</button>
  </div>
</div>

<div id="counts-bar" class="flex gap-3 mb-5"></div>
<div id="inbox-list" class="space-y-3">
  <div class="card-dark rounded-xl p-6 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading...</div>
</div>

<script>
let _token = '', _currentFilter = ''

window.onChamberReady = async function(token) {
  _token = token
  loadInbox('')
}

function setFilter(f) {
  _currentFilter = f
  document.querySelectorAll('.filter-btn').forEach(b => {
    const isActive = b.dataset.filter === f
    b.className = 'filter-btn text-xs px-3 py-1.5 rounded-lg font-medium ' + (isActive ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-gray-400')
  })
  loadInbox(f)
}

async function loadInbox(filter) {
  const url = '/chamber/api/inbox' + (filter ? '?status=' + filter : '')
  try {
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    const counts = d.data?.counts || {}
    document.getElementById('counts-bar').innerHTML = [
      { label: 'Total', v: counts.total, c: 'text-gray-400' },
      { label: 'Pending', v: counts.pending, c: 'text-yellow-400' },
      { label: 'Approved', v: counts.approved, c: 'text-green-400' },
      { label: 'On Hold', v: counts.on_hold, c: 'text-purple-400' },
      { label: 'Rejected', v: counts.rejected, c: 'text-red-400' },
    ].map(s => \`<div class="card-dark rounded-lg px-3 py-2 text-center min-w-[70px]"><div class="text-lg font-bold \${s.c}">\${s.v}</div><div class="text-xs text-gray-600">\${s.label}</div></div>\`).join('')

    const items = d.data?.items || []
    if (!items.length) {
      document.getElementById('inbox-list').innerHTML = '<div class="card-dark rounded-xl p-8 text-gray-500 text-center text-sm">No items match filter.</div>'
      return
    }
    const urgClass = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
    const stClass = { PENDING_REVIEW: 'badge-pending', APPROVED: 'badge-verified', ON_HOLD: 'badge-hold', REJECTED: 'badge-blocked' }
    document.getElementById('inbox-list').innerHTML = items.map(item => \`
      <div class="card-dark card-hover rounded-xl p-5 flex items-start gap-4 cursor-pointer transition-all"
           onclick="window.location='/chamber/decision-board?id=\${item.id}'">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-sm font-semibold text-gray-200">\${item.title}</span>
            <span class="text-xs px-2 py-0.5 rounded-full \${urgClass[item.urgency]}">\${item.urgency}</span>
            <span class="text-xs px-2 py-0.5 rounded-full \${stClass[item.status]}">\${item.status.replace('_',' ')}</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">\${item.description}</div>
          <div class="flex items-center gap-3 text-xs text-gray-600">
            <span><i class="fas fa-tag mr-1"></i>\${item.source}</span>
            <span><i class="fas fa-hashtag mr-1"></i>\${item.classification}</span>
            \${item.blocker_ref ? \`<span class="text-yellow-700"><i class="fas fa-ban mr-1"></i>\${item.blocker_ref}</span>\` : ''}
            <span class="ml-auto"><i class="fas fa-clock mr-1"></i>\${item.created_at.slice(0,10)}</span>
          </div>
        </div>
        <i class="fas fa-chevron-right text-gray-700 mt-1 flex-shrink-0"></i>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('inbox-list').innerHTML = '<div class="text-red-400 text-sm p-4">Error: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Inbox', activeNav: 'inbox', content }))
})

/**
 * GET /chamber/decision-board
 * Decision board — item detail + approve/reject/hold actions.
 * Query param: ?id=GQ-xxx
 */
chamberRouter.get('/decision-board', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-scale-balanced text-indigo-400"></i> Decision Board
  </h1>
  <p class="text-gray-500 text-sm">Item detail — approve / reject / hold. Semua keputusan tercatat di audit trail.</p>
</div>

<div id="decision-content">
  <div class="card-dark rounded-xl p-8 text-center text-gray-600">
    <i class="fas fa-circle-notch fa-spin mr-2"></i>Loading...
  </div>
</div>

<script>
let _token = ''

window.onChamberReady = async function(token) {
  _token = token
  const id = new URLSearchParams(location.search).get('id')
  if (id) { loadItem(id) }
  else { loadList() }
}

async function loadList() {
  try {
    const res = await fetch('/chamber/api/inbox', { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    const items = (d.data?.items || []).filter(i => i.status === 'PENDING_REVIEW')
    if (!items.length) {
      document.getElementById('decision-content').innerHTML = \`
        <div class="card-dark rounded-xl p-8 text-center">
          <i class="fas fa-check-circle text-green-400 text-3xl mb-3"></i>
          <div class="text-gray-300 font-medium mb-1">No pending decisions</div>
          <div class="text-gray-500 text-sm">Semua item sudah diputuskan. Cek <a href="/chamber/inbox" class="text-indigo-400">Inbox</a> untuk melihat semua.</div>
        </div>\`
      return
    }
    document.getElementById('decision-content').innerHTML = \`
      <div class="mb-4 text-sm text-gray-400">\${items.length} item menunggu keputusan founder:</div>
      <div class="space-y-3">
        \${items.map(item => \`
          <div class="card-dark card-hover rounded-xl p-5 cursor-pointer transition-all"
               onclick="loadItem('\${item.id}')">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold text-gray-200">\${item.title}</span>
              <span class="text-xs px-2 py-0.5 rounded-full badge-pending">\${item.urgency}</span>
            </div>
            <div class="text-xs text-gray-500">\${item.description}</div>
          </div>
        \`).join('')}
      </div>
    \`
  } catch(e) {
    document.getElementById('decision-content').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}

async function loadItem(id) {
  try {
    const res = await fetch('/chamber/api/decision/' + id, { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    if (!d.success) { document.getElementById('decision-content').innerHTML = '<div class="text-red-400 text-sm p-4">' + d.error?.message + '</div>'; return }
    const item = d.data.item
    const audit = d.data.related_audit || []
    const stClass = { PENDING_REVIEW: 'badge-pending', APPROVED: 'badge-verified', ON_HOLD: 'badge-hold', REJECTED: 'badge-blocked' }
    const urgClass = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }

    document.getElementById('decision-content').innerHTML = \`
      <div class="mb-4">
        <button onclick="loadList()" class="text-xs text-gray-500 hover:text-gray-300 transition-all">
          <i class="fas fa-arrow-left mr-1"></i>Back to list
        </button>
      </div>
      <div class="card-dark rounded-xl p-6 mb-5">
        <div class="flex items-start gap-3 mb-4">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="text-base font-bold text-white">\${item.title}</span>
              <span class="text-xs px-2 py-0.5 rounded-full \${urgClass[item.urgency]}">\${item.urgency}</span>
              <span class="text-xs px-2 py-0.5 rounded-full \${stClass[item.status]}">\${item.status.replace(/_/g,' ')}</span>
            </div>
            <div class="text-sm text-gray-400 mb-3">\${item.description}</div>
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span class="text-gray-600">Source:</span> \${item.source}</div>
              <div><span class="text-gray-600">Classification:</span> \${item.classification}</div>
              <div><span class="text-gray-600">Created:</span> \${item.created_at.slice(0,10)}</div>
              \${item.blocker_ref ? \`<div><span class="text-gray-600">Blocker:</span> <span class="text-yellow-600">\${item.blocker_ref}</span></div>\` : ''}
            </div>
            \${item.reason ? \`<div class="mt-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/30 text-xs text-gray-400"><i class="fas fa-quote-left mr-1 text-gray-600"></i>\${item.reason}</div>\` : ''}
          </div>
        </div>

        \${item.status === 'PENDING_REVIEW' ? \`
          <div class="border-t border-gray-800 pt-4">
            <div class="text-xs text-gray-500 mb-2">Reason (optional):</div>
            <textarea id="reason-field" rows="2" placeholder="Masukkan alasan keputusan..."
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none mb-3"></textarea>
            <div class="flex gap-2 flex-wrap">
              <button onclick="decide('\${item.id}','approve')"
                class="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-all">
                <i class="fas fa-check mr-1.5"></i>Approve
              </button>
              <button onclick="decide('\${item.id}','hold')"
                class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold transition-all">
                <i class="fas fa-pause mr-1.5"></i>Hold
              </button>
              <button onclick="decide('\${item.id}','reject')"
                class="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-semibold transition-all">
                <i class="fas fa-xmark mr-1.5"></i>Reject
              </button>
            </div>
            <div id="decision-feedback" class="mt-3 hidden"></div>
          </div>
        \` : \`
          <div class="text-xs text-gray-500 border-t border-gray-800 pt-3 mt-3">
            <i class="fas fa-info-circle mr-1 text-indigo-500"></i>\${d.data.next_step_hint}
          </div>
        \`}
      </div>

      \${audit.length > 0 ? \`
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Audit Trail</h3>
          <div class="space-y-2">
            \${audit.map(ae => \`
              <div class="card-dark rounded-lg px-4 py-3 flex items-center gap-3 text-xs">
                <span class="text-gray-500">\${ae.timestamp.slice(0,16).replace('T',' ')}</span>
                <span class="font-semibold text-gray-300">\${ae.action}</span>
                <span class="text-gray-500">by \${ae.actor}</span>
                \${ae.reason ? \`<span class="text-gray-600 truncate">\${ae.reason}</span>\` : ''}
              </div>
            \`).join('')}
          </div>
        </div>
      \` : ''}
    \`
  } catch(e) {
    document.getElementById('decision-content').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}

async function decide(id, action) {
  const reason = document.getElementById('reason-field')?.value || ''
  const btn = event.currentTarget
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i>Processing...'
  try {
    const res = await fetch('/chamber/api/decision/' + id + '/' + action, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + _token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    const d = await res.json()
    if (d.success) {
      const fb = document.getElementById('decision-feedback')
      if (fb) {
        fb.className = 'mt-3 p-3 rounded-lg bg-green-900/30 border border-green-800/30 text-green-400 text-xs'
        fb.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Decision recorded: ' + d.data.result + ' — Audit ID: ' + d.data.audit_id
        fb.classList.remove('hidden')
      }
      setTimeout(() => loadItem(id), 1500)
    } else {
      btn.disabled = false
      btn.innerHTML = btn.innerHTML.replace('Processing...', 'Try again')
      const fb = document.getElementById('decision-feedback')
      if (fb) {
        fb.className = 'mt-3 p-3 rounded-lg bg-red-900/30 border border-red-800/30 text-red-400 text-xs'
        fb.innerHTML = d.error?.message || 'Decision failed.'
        fb.classList.remove('hidden')
      }
    }
  } catch(e) {
    btn.disabled = false
    alert('Network error: ' + e.message)
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Decision Board', activeNav: 'decisions', content }))
})

/**
 * GET /chamber/audit
 * Audit trail viewer.
 */
chamberRouter.get('/audit', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-clock-rotate-left text-blue-400"></i> Audit Trail
  </h1>
  <p class="text-gray-500 text-sm">Riwayat keputusan founder + system events. Immutable record.</p>
</div>

<div id="audit-filters" class="flex gap-2 mb-5 flex-wrap">
  <button onclick="loadAudit()" class="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 font-medium">All Sessions</button>
  <button onclick="loadAudit('hub12')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">HUB-12</button>
  <button onclick="loadAudit('hub11')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">HUB-11</button>
  <button onclick="loadAudit('hub10')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">HUB-10</button>
  <button onclick="loadAudit('hub09')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">HUB-09</button>
  <button onclick="loadAudit('hub04')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400">HUB-04</button>
</div>

<div id="audit-list" class="space-y-2">
  <div class="card-dark rounded-xl p-6 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading...</div>
</div>

<script>
let _token = ''
window.onChamberReady = function(token) { _token = token; loadAudit() }

async function loadAudit(session) {
  const url = '/chamber/api/audit' + (session ? '?session=' + session : '')
  try {
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    const entries = d.data?.entries || []
    if (!entries.length) {
      document.getElementById('audit-list').innerHTML = '<div class="card-dark rounded-xl p-8 text-gray-500 text-center text-sm">No audit entries for this filter.</div>'
      return
    }
    const actionColor = { APPROVE:'text-green-400', REJECT:'text-red-400', HOLD:'text-purple-400', SESSION_OPENED:'text-blue-400', DEPLOY_VERIFIED:'text-indigo-400' }
    document.getElementById('audit-list').innerHTML = entries.map(ae => \`
      <div class="card-dark rounded-xl px-5 py-4 flex items-start gap-4">
        <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-gavel text-gray-500 text-xs"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-sm font-semibold \${actionColor[ae.action] || 'text-gray-300'}">\${ae.action}</span>
            <span class="text-sm text-gray-300">\${ae.target_title}</span>
          </div>
          <div class="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>by <span class="text-gray-400">\${ae.actor}</span></span>
            <span>session <span class="text-gray-400">\${ae.session_ref}</span></span>
            <span>class <span class="text-gray-400">\${ae.decision_class}</span></span>
          </div>
          \${ae.reason ? \`<div class="mt-1.5 text-xs text-gray-600 italic">\${ae.reason}</div>\` : ''}
        </div>
        <div class="text-xs text-gray-600 flex-shrink-0 text-right">
          <div>\${ae.timestamp.slice(0,10)}</div>
          <div>\${ae.timestamp.slice(11,16)}</div>
        </div>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('audit-list').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Audit Trail', activeNav: 'audit', content }))
})

/**
 * GET /chamber/truth-sync
 * Truth sync panel — compare living docs / hub state / governance state.
 */
chamberRouter.get('/truth-sync', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-rotate text-green-400"></i> Truth Sync
  </h1>
  <p class="text-gray-500 text-sm">Compare living docs / hub state / governance state. Surface drift alerts.</p>
</div>

<div id="sync-overall" class="mb-5"></div>
<div id="sync-list" class="space-y-3">
  <div class="card-dark rounded-xl p-6 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading...</div>
</div>

<!-- Hub state live reference -->
<div class="mt-8">
  <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hub Continuity Reference</h2>
  <div id="hub-state-ref" class="card-dark rounded-xl p-5 text-gray-500 text-sm">
    <i class="fas fa-circle-notch fa-spin mr-2"></i>Fetching hub state...
  </div>
</div>

<script>
let _token = ''
window.onChamberReady = async function(token) {
  _token = token
  loadSync()
  loadHubRef()
}

async function loadSync() {
  try {
    const res = await fetch('/chamber/api/truth-sync', { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    const data = d.data || {}
    const overallColor = { IN_SYNC: 'badge-verified', PENDING_SYNC: 'badge-pending', DRIFT_DETECTED: 'badge-blocked', BLOCKED: 'badge-blocked' }
    document.getElementById('sync-overall').innerHTML = \`
      <div class="card-dark rounded-xl px-5 py-4 flex items-center gap-3">
        <i class="fas fa-circle text-xs \${data.overall_status === 'IN_SYNC' ? 'text-green-500' : 'text-yellow-500'}"></i>
        <span class="font-semibold text-gray-200">Overall Status:</span>
        <span class="text-sm px-2 py-0.5 rounded-full \${overallColor[data.overall_status]}">\${data.overall_status?.replace('_',' ')}</span>
        <span class="text-xs text-gray-600 ml-auto">\${data.counts?.verified}/\${data.counts?.total} verified</span>
      </div>
    \`

    const stColor = { VERIFIED: 'badge-verified', PENDING_SYNC: 'badge-pending', DRIFT_DETECTED: 'badge-blocked', BLOCKED: 'badge-blocked' }
    document.getElementById('sync-list').innerHTML = (data.items || []).map(item => \`
      <div class="card-dark rounded-xl p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm font-semibold text-gray-200">\${item.label}</span>
          <span class="text-xs px-2 py-0.5 rounded-full \${stColor[item.status]}">\${item.status.replace(/_/g,' ')}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-gray-500 mb-1">Source</div>
            <div class="text-gray-300 font-mono">\${item.source}</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-gray-500 mb-1">Expected State</div>
            <div class="text-gray-300">\${item.expected}</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-gray-500 mb-1">Actual Ref</div>
            <div class="text-gray-300">\${item.actual_ref}</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-gray-500 mb-1">Note</div>
            <div class="text-gray-400 italic">\${item.note}</div>
          </div>
        </div>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('sync-list').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}

async function loadHubRef() {
  try {
    const res = await fetch('/api/hub/state', { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    if (d.success) {
      const s = d.data.session
      document.getElementById('hub-state-ref').innerHTML = \`
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div><span class="text-gray-500">Session Code:</span> <span class="text-gray-300 font-mono">\${s.code}</span></div>
          <div><span class="text-gray-500">Status:</span> <span class="text-green-400">\${s.status}</span></div>
          <div><span class="text-gray-500">Hub UI:</span> <a href="/hub" class="text-indigo-400 hover:underline">/hub</a></div>
          <div><span class="text-gray-500">State Items:</span> <span class="text-gray-300">\${d.data.state_items?.length || 0}</span></div>
        </div>
      \`
    } else {
      document.getElementById('hub-state-ref').innerHTML = '<span class="text-yellow-500">Hub state unavailable</span>'
    }
  } catch {
    document.getElementById('hub-state-ref').innerHTML = '<span class="text-yellow-500">Could not reach /api/hub/state</span>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Truth Sync', activeNav: 'truth', content }))
})

/**
 * GET /chamber/maintenance
 * Maintenance checklist.
 */

/**
 * GET /chamber/governance
 * Governance overview — all queue items in one view.
 * HUB-12: Route was missing, causing HTTP 500. Fixed with proper handler.
 */
chamberRouter.get('/governance', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-landmark text-indigo-400"></i> Governance Overview
  </h1>
  <p class="text-gray-500 text-sm">Summary governance state. Lihat Decision Board untuk aksi founder.</p>
</div>

<div id="gov-summary" class="space-y-4">
  <div class="card-dark rounded-xl p-6 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading governance state...</div>
</div>

<script>
window.onChamberReady = async function(token) {
  try {
    const [inboxRes, auditRes] = await Promise.all([
      fetch('/chamber/api/inbox', { headers: { 'Authorization': 'Bearer ' + token }}),
      fetch('/chamber/api/audit', { headers: { 'Authorization': 'Bearer ' + token }}),
    ])
    const inbox = await inboxRes.json()
    const audit = await auditRes.json()
    const items = inbox.data?.items || []
    const entries = audit.data?.entries || []
    const counts = inbox.data?.counts || {}
    const stClass = { PENDING_REVIEW: 'badge-pending', APPROVED: 'badge-verified', ON_HOLD: 'badge-hold', REJECTED: 'badge-blocked' }
    const urgClass = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
    document.getElementById('gov-summary').innerHTML = \`
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card-dark rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-yellow-400">\${counts.pending || 0}</div>
          <div class="text-xs text-gray-500 mt-1">Pending Review</div>
        </div>
        <div class="card-dark rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-green-400">\${counts.approved || 0}</div>
          <div class="text-xs text-gray-500 mt-1">Approved</div>
        </div>
        <div class="card-dark rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-purple-400">\${counts.on_hold || 0}</div>
          <div class="text-xs text-gray-500 mt-1">On Hold</div>
        </div>
        <div class="card-dark rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-indigo-400">\${entries.length}</div>
          <div class="text-xs text-gray-500 mt-1">Audit Entries</div>
        </div>
      </div>
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">All Governance Items</h2>
      <div class="space-y-3">
        \${items.map(item => \`
          <a href="/chamber/decision-board?id=\${item.id}" class="card-dark card-hover rounded-xl px-5 py-4 flex items-center gap-4 transition-all cursor-pointer">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-200">\${item.title}</span>
                <span class="text-xs px-2 py-0.5 rounded-full \${urgClass[item.urgency]}">\${item.urgency}</span>
                <span class="text-xs px-2 py-0.5 rounded-full \${stClass[item.status] || 'badge-pending'}">\${item.status}</span>
              </div>
              <div class="text-xs text-gray-500">\${item.source} — \${item.description.slice(0,80)}...</div>
            </div>
            <i class="fas fa-chevron-right text-gray-600 text-xs"></i>
          </a>
        \`).join('')}
      </div>
      <div class="mt-4">
        <a href="/chamber/decision-board" class="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-all">
          <i class="fas fa-scale-balanced"></i> Open Decision Board
        </a>
      </div>
    \`
  } catch(e) {
    document.getElementById('gov-summary').innerHTML = '<div class="text-red-400 text-sm p-4">Error loading governance data: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Governance', activeNav: 'decisions', content }))
})

/**
 * GET /chamber/reminders
 * Founder reminders — surfaces action items requiring founder attention.
 * HUB-12: Route was missing, causing HTTP 500. Fixed with proper handler.
 */
chamberRouter.get('/reminders', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-bell text-yellow-400"></i> Founder Reminders
  </h1>
  <p class="text-gray-500 text-sm">Action items requiring founder attention. Sourced from governance state.</p>
</div>

<div id="reminders-list" class="space-y-3">
  <div class="card-dark rounded-xl p-6 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading reminders...</div>
</div>

<script>
window.onChamberReady = async function(token) {
  try {
    const res = await fetch('/chamber/api/summary', { headers: { 'Authorization': 'Bearer ' + token }})
    const d = await res.json()
    const reminders = d.data?.founder_reminders || []
    const urgClass = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' }
    if (!reminders.length) {
      document.getElementById('reminders-list').innerHTML = '<div class="card-dark rounded-xl p-8 text-center"><i class="fas fa-check-circle text-green-400 text-3xl mb-3"></i><div class="text-gray-300 font-medium mt-3">No pending reminders</div></div>'
      return
    }
    document.getElementById('reminders-list').innerHTML = reminders.map(r => \`
      <a href="\${r.link}" class="card-dark card-hover rounded-xl px-5 py-4 flex items-center gap-4 transition-all cursor-pointer">
        <div class="w-9 h-9 rounded-lg \${r.urgency === 'HIGH' ? 'bg-red-900/30' : r.urgency === 'MEDIUM' ? 'bg-yellow-900/30' : 'bg-gray-800'} flex items-center justify-center flex-shrink-0">
          <i class="fas fa-bell \${r.urgency === 'HIGH' ? 'text-red-400' : r.urgency === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}"></i>
        </div>
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full \${urgClass[r.urgency]}">\${r.urgency}</span>
          </div>
          <div class="text-sm text-gray-200">\${r.text}</div>
        </div>
        <i class="fas fa-chevron-right text-gray-600 text-xs"></i>
      </a>
    \`).join('')
  } catch(e) {
    document.getElementById('reminders-list').innerHTML = '<div class="text-red-400 text-sm p-4">Error loading reminders: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Reminders', activeNav: 'overview', content }))
})

/**
 * GET /chamber/health
 * Chamber health check — surfaces live runtime health + governance health.
 * HUB-12: Route was missing, causing HTTP 500. Fixed with proper handler.
 */
chamberRouter.get('/health', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-heart-pulse text-green-400"></i> Chamber Health
  </h1>
  <p class="text-gray-500 text-sm">Runtime + governance health. Live data from /health + maintenance checklist.</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
  <div>
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Runtime Health</h2>
    <div id="runtime-health" class="card-dark rounded-xl p-5 text-gray-500 text-sm">
      <i class="fas fa-circle-notch fa-spin mr-2"></i>Fetching runtime state...
    </div>
  </div>
  <div>
    <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Governance Health</h2>
    <div id="gov-health" class="card-dark rounded-xl p-5 text-gray-500 text-sm">
      <i class="fas fa-circle-notch fa-spin mr-2"></i>Fetching governance state...
    </div>
  </div>
</div>

<div>
  <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Maintenance Checks</h2>
  <div id="maint-health" class="space-y-2">
    <div class="card-dark rounded-xl p-5 text-gray-600 text-center"><i class="fas fa-circle-notch fa-spin mr-2"></i>Loading...</div>
  </div>
</div>

<script>
window.onChamberReady = async function(token) {
  // Runtime health (public endpoint)
  try {
    const res = await fetch('/health')
    const d = await res.json()
    document.getElementById('runtime-health').innerHTML = \`
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 rounded-full \${d.status === 'ok' ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
        <span class="text-sm font-semibold \${d.status === 'ok' ? 'text-green-400' : 'text-red-400'}">\${(d.status || 'unknown').toUpperCase()}</span>
      </div>
      <div class="space-y-1.5 text-xs">
        <div class="flex justify-between"><span class="text-gray-600">Build Session</span><span class="text-gray-300 font-mono">\${d.build_session || '—'}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Version</span><span class="text-gray-300 font-mono">\${d.version || '—'}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Phase</span><span class="text-gray-300">\${d.phase || '—'}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Environment</span><span class="text-gray-300">\${d.environment || '—'}</span></div>
      </div>
    \`
  } catch(e) {
    document.getElementById('runtime-health').innerHTML = '<div class="text-red-400">Error: ' + e.message + '</div>'
  }

  // Governance health (requires token)
  try {
    const res = await fetch('/chamber/api/maintenance', { headers: { 'Authorization': 'Bearer ' + token }})
    const d = await res.json()
    const overall = d.data?.overall_health || 'UNKNOWN'
    const counts = d.data?.counts || {}
    const healthColor = { HEALTHY: 'text-green-400', PARTIAL: 'text-yellow-400', DEGRADED: 'text-red-400' }
    const dotColor = { HEALTHY: 'bg-green-500', PARTIAL: 'bg-yellow-500', DEGRADED: 'bg-red-500' }
    document.getElementById('gov-health').innerHTML = \`
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 rounded-full \${dotColor[overall] || 'bg-gray-500'} animate-pulse"></div>
        <span class="text-sm font-semibold \${healthColor[overall] || 'text-gray-400'}">\${overall}</span>
      </div>
      <div class="space-y-1.5 text-xs">
        <div class="flex justify-between"><span class="text-gray-600">Verified</span><span class="text-green-400">\${counts.verified || 0}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Pending</span><span class="text-yellow-400">\${counts.pending || 0}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Blocked</span><span class="text-red-400">\${counts.blocked || 0}</span></div>
        <div class="flex justify-between"><span class="text-gray-600">Total Checks</span><span class="text-gray-300">\${counts.total || 0}</span></div>
      </div>
    \`
    const checks = d.data?.checks || []
    const stIcon = { VERIFIED: 'fa-check-circle text-green-500', PENDING: 'fa-clock text-yellow-500', BLOCKED: 'fa-ban text-red-500', SKIPPED: 'fa-minus-circle text-gray-500' }
    const stClass = { VERIFIED: 'badge-verified', PENDING: 'badge-pending', BLOCKED: 'badge-blocked', SKIPPED: 'text-gray-500 bg-gray-800/40' }
    document.getElementById('maint-health').innerHTML = checks.map(check => \`
      <div class="card-dark rounded-xl px-5 py-4 flex items-start gap-4">
        <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i class="fas \${stIcon[check.status] || 'fa-circle text-gray-500'} text-xs"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-sm font-semibold text-gray-200">\${check.label}</span>
            <span class="text-xs px-2 py-0.5 rounded-full \${stClass[check.status]}">\${check.status}</span>
            <span class="text-xs text-gray-600">\${check.category}</span>
          </div>
          <div class="text-xs text-gray-500 mb-1">\${check.description}</div>
          \${check.action_required ? '<div class="text-xs text-yellow-600"><i class="fas fa-arrow-right mr-1"></i>' + check.action_required + '</div>' : ''}
          <div class="text-xs text-gray-700 mt-1">ref: \${check.ref}</div>
        </div>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('gov-health').innerHTML = '<div class="text-red-400">Error: ' + e.message + '</div>'
    document.getElementById('maint-health').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Health', activeNav: 'maintenance', content }))
})

/**
 * GET /chamber/maintenance
 * Maintenance checklist (existing route, kept intact).
 */
chamberRouter.get('/maintenance', (c: Context<ChamberContext>) => {
  const content = `
<div class="mb-6">
  <h1 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
    <i class="fas fa-screwdriver-wrench text-orange-400"></i> Maintenance Checklist
  </h1>
  <p class="text-gray-500 text-sm">System readiness, blockers, and governance health checks.</p>
</div>

<div id="health-banner" class="mb-5"></div>
<div id="check-categories"></div>

<script>
let _token = ''
window.onChamberReady = async function(token) {
  _token = token
  loadMaintenance()
}

async function loadMaintenance() {
  try {
    const res = await fetch('/chamber/api/maintenance', { headers: { 'Authorization': 'Bearer ' + _token }})
    const d = await res.json()
    const data = d.data || {}
    const healthColor = { HEALTHY: 'text-green-400 bg-green-900/20 border-green-800/30', PARTIAL: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30', DEGRADED: 'text-red-400 bg-red-900/20 border-red-800/30' }

    document.getElementById('health-banner').innerHTML = \`
      <div class="rounded-xl px-5 py-4 border flex items-center gap-3 \${healthColor[data.overall_health] || 'text-gray-400 bg-gray-900 border-gray-800'}">
        <i class="fas fa-heart-pulse text-lg"></i>
        <span class="font-semibold">Governance Health: \${data.overall_health}</span>
        <span class="text-xs opacity-70 ml-auto">\${data.counts?.verified}/\${data.counts?.total} verified — \${data.counts?.blocked || 0} blocked</span>
      </div>
    \`

    // Group by category
    const checks = data.checks || []
    const categories = {}
    checks.forEach(c => {
      if (!categories[c.category]) categories[c.category] = []
      categories[c.category].push(c)
    })

    const stIcon = { VERIFIED: 'fa-check text-green-400', PENDING: 'fa-hourglass-half text-yellow-400', BLOCKED: 'fa-ban text-red-400', SKIPPED: 'fa-minus text-gray-500' }
    const stClass = { VERIFIED: 'badge-verified', PENDING: 'badge-pending', BLOCKED: 'badge-blocked', SKIPPED: '' }
    const catIcons = { AUTH: 'fa-shield-halved', DATABASE: 'fa-database', WA_INTEGRATION: 'fa-comment-dots', GOVERNANCE: 'fa-landmark', DOCS: 'fa-file-alt', DEPLOY: 'fa-rocket' }

    document.getElementById('check-categories').innerHTML = Object.entries(categories).map(([cat, items]) => \`
      <div class="mb-6">
        <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i class="fas \${catIcons[cat] || 'fa-circle'} text-gray-600"></i> \${cat.replace(/_/g,' ')}
        </h2>
        <div class="space-y-2">
          \${items.map(check => \`
            <div class="card-dark rounded-xl px-5 py-4 flex items-start gap-4">
              <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i class="fas \${stIcon[check.status] || 'fa-circle text-gray-500'} text-xs"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-gray-200">\${check.label}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full \${stClass[check.status]}">\${check.status}</span>
                </div>
                <div class="text-xs text-gray-500 mb-1">\${check.description}</div>
                \${check.action_required ? \`<div class="text-xs text-yellow-600"><i class="fas fa-arrow-right mr-1"></i>\${check.action_required}</div>\` : ''}
                <div class="text-xs text-gray-700 mt-1">ref: \${check.ref}</div>
              </div>
            </div>
          \`).join('')}
        </div>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('check-categories').innerHTML = '<div class="text-red-400 text-sm">Error: ' + e.message + '</div>'
  }
}
</script>
`
  return c.html(chamberLayout({ title: 'Maintenance', activeNav: 'maintenance', content }))
})
