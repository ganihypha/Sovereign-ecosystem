// sovereign-tower — src/routes/bridge.ts
// Bridge Review Desk v1 — SESSION HUB-05
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// HUB-05 Scope (Bridge Review Desk v1):
//   UI ROUTES (founder-only, JWT-gated via shared middleware):
//   - GET /bridge                    → Bridge overview / landing
//   - GET /bridge/inbox              → Incoming items pending classification
//   - GET /bridge/review             → Item review desk (detail + action)
//   - GET /bridge/classification     → Classification rules & tags view
//   - GET /bridge/checkpoints        → System checkpoints status
//   - GET /bridge/boundaries         → Module boundaries & scope map
//
//   API ROUTES (bounded, founder-only, /bridge/api/*):
//   - GET  /bridge/api/summary       → Bridge summary cards
//   - GET  /bridge/api/inbox         → Inbox items list
//   - GET  /bridge/api/item/:id      → Single item detail
//   - POST /bridge/api/item/:id/classify   → Classify item (assign tag + class)
//   - POST /bridge/api/item/:id/route      → Route item to Hub or Chamber
//   - POST /bridge/api/item/:id/hold       → Hold item for later
//   - POST /bridge/api/item/:id/escalate   → Escalate item to founder priority
//   - GET  /bridge/api/checkpoints   → Checkpoint statuses
//   - GET  /bridge/api/boundaries    → Module boundaries map
//
//   CONTINUITY LINKS:
//   - /hub (HUB-01/02/03) — reuses MASTER_PIN/JWT auth
//   - /chamber (HUB-04) — governance operating surface
//   - /health — system state reference
//   - /api/hub/state — session continuity
//
// AUTH MODEL: Reuses existing Hub auth model (HUB-01/02/03).
//   Bridge auth = same JWT from MASTER_PIN exchange.
//   No second auth flow. No auth redesign. No new env vars.
//   /bridge/api/* protected by JWT + founderOnly via app-level middleware.
//   /bridge/* UI routes use client-side JWT auth (same pattern as Hub/Chamber).
//
// ADR-HUB-05: Bridge = triage + routing desk between inbound signals and governance.
//   NOT a product app. NOT Counterpart. NOT BarberKas. NOT Chamber duplicate.
//   Bounded to: classify, route, hold, escalate — 4 decision verbs only.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { TOWER_BUILD_SESSION, TOWER_APP_VERSION, successResponse, errorResponse } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { verifyJwt } from '@sovereign/auth'

type BridgeContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

export const bridgeRouter = new Hono<BridgeContext>()

// =============================================================================
// CONSTANTS
// =============================================================================

const BRIDGE_BUILD_SESSION = 'hub05'
const BRIDGE_VERSION = '1.0.0'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type BridgeItemStatus =
  | 'PENDING_CLASSIFICATION'
  | 'CLASSIFIED'
  | 'ROUTED'
  | 'ON_HOLD'
  | 'ESCALATED'
  | 'CLOSED'

type BridgeItemClass =
  | 'INFRA_SIGNAL'
  | 'GOVERNANCE_SIGNAL'
  | 'BUILD_SIGNAL'
  | 'PRODUCT_SIGNAL'
  | 'AUTH_SIGNAL'
  | 'COMMS_SIGNAL'
  | 'UNKNOWN'

type RouteTarget = 'HUB' | 'CHAMBER' | 'QUEUE' | 'FOUNDER_DIRECT' | 'PENDING'

interface BridgeItem {
  id: string
  title: string
  source: string
  raw_signal: string
  status: BridgeItemStatus
  classification: BridgeItemClass
  route_target: RouteTarget
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  tags: string[]
  created_at: string
  updated_at: string
  classified_at?: string
  routed_at?: string
  held_at?: string
  escalated_at?: string
  closed_at?: string
  action_by?: string
  action_reason?: string
  linked_item?: string
  note?: string
}

interface BridgeCheckpoint {
  id: string
  label: string
  system: string
  status: 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN'
  last_checked: string
  detail: string
  action_required?: string
}

interface BridgeBoundary {
  id: string
  module: string
  scope_label: string
  status: 'ACTIVE' | 'BOUNDED' | 'FROZEN' | 'DEFERRED'
  entry_points: string[]
  out_of_scope: string[]
  note: string
  session_locked: string
}

// =============================================================================
// IN-MEMORY DATA STORE
// Bounded triage data for Bridge Review Desk v1.
// Reflects real system signals from Hub, Chamber, WA lane.
// =============================================================================

const BRIDGE_INBOX: BridgeItem[] = [
  {
    id: 'BR-001',
    title: 'Cloudflare Deploy Pending — HUB-04 Chamber Console',
    source: 'Build Ops',
    raw_signal: 'Chamber Console v1 built (b5c80a7) but CF deploy blocked. Token now available.',
    status: 'PENDING_CLASSIFICATION',
    classification: 'INFRA_SIGNAL',
    route_target: 'PENDING',
    urgency: 'HIGH',
    tags: ['cloudflare', 'deploy', 'hub-04', 'chamber'],
    created_at: '2026-04-12T12:00:00.000Z',
    updated_at: '2026-04-12T12:00:00.000Z',
    note: 'CF API token now available via dev.vars.setup.3.2.txt. Ready to deploy.',
  },
  {
    id: 'BR-002',
    title: 'GitHub Push Blocked — Commits b5c80a7 Unpushed',
    source: 'Build Ops',
    raw_signal: 'HUB-04 commit exists locally. GitHub push was blocked by missing token.',
    status: 'PENDING_CLASSIFICATION',
    classification: 'INFRA_SIGNAL',
    route_target: 'PENDING',
    urgency: 'HIGH',
    tags: ['github', 'push', 'hub-04'],
    created_at: '2026-04-12T12:05:00.000Z',
    updated_at: '2026-04-12T12:05:00.000Z',
    note: 'GITHUB_TOKEN now available. Push can proceed.',
  },
  {
    id: 'BR-003',
    title: 'Fonnte Webhook URL — Needs Manual Config at fonnte.com',
    source: 'WA Lane',
    raw_signal: 'B-010: Fonnte webhook URL not configured. WA inbound not active.',
    status: 'PENDING_CLASSIFICATION',
    classification: 'COMMS_SIGNAL',
    route_target: 'PENDING',
    urgency: 'MEDIUM',
    tags: ['fonnte', 'webhook', 'wa', 'b-010'],
    created_at: '2026-04-12T08:00:00.000Z',
    updated_at: '2026-04-12T08:00:00.000Z',
    linked_item: 'GQ-001',
    note: 'Founder must set webhook URL at https://fonnte.com/settings manually.',
  },
  {
    id: 'BR-004',
    title: 'Repo Visibility Decision — Public vs Private',
    source: 'Governance',
    raw_signal: 'B-012: Repo is public. Founder must decide visibility.',
    status: 'ON_HOLD',
    classification: 'GOVERNANCE_SIGNAL',
    route_target: 'CHAMBER',
    urgency: 'LOW',
    tags: ['github', 'repo', 'visibility', 'b-012'],
    created_at: '2026-04-12T08:30:00.000Z',
    updated_at: '2026-04-12T10:00:00.000Z',
    held_at: '2026-04-12T10:00:00.000Z',
    action_by: 'founder',
    action_reason: 'Defer until post-Chamber v1 stabilization.',
    linked_item: 'GQ-002',
  },
  {
    id: 'BR-005',
    title: 'HUB-05 Bridge Review Desk — Build Session Active',
    source: 'Build Ops',
    raw_signal: 'HUB-05 session started. Bridge Review Desk v1 now building.',
    status: 'ROUTED',
    classification: 'BUILD_SIGNAL',
    route_target: 'HUB',
    urgency: 'MEDIUM',
    tags: ['hub-05', 'bridge', 'build'],
    created_at: '2026-04-12T17:00:00.000Z',
    updated_at: '2026-04-12T17:00:00.000Z',
    routed_at: '2026-04-12T17:00:00.000Z',
    action_by: 'system',
    action_reason: 'Auto-routed to HUB for session tracking.',
  },
  {
    id: 'BR-006',
    title: 'BarberKas Sprint 1 — Go/No-Go Signal',
    source: 'Product Lane',
    raw_signal: 'BarberKas is bounded. Founder deferred Sprint 1 until governance layer stable.',
    status: 'ON_HOLD',
    classification: 'PRODUCT_SIGNAL',
    route_target: 'CHAMBER',
    urgency: 'LOW',
    tags: ['barberkas', 'sprint-1', 'product', 'deferred'],
    created_at: '2026-04-12T09:15:00.000Z',
    updated_at: '2026-04-12T09:30:00.000Z',
    held_at: '2026-04-12T09:30:00.000Z',
    action_by: 'founder',
    action_reason: 'Governance layer (Hub+Chamber+Bridge) must stabilize first.',
    linked_item: 'GQ-005',
  },
  {
    id: 'BR-007',
    title: 'Counterpart Workspace Lite — Module Gate Signal',
    source: 'Governance',
    raw_signal: 'Counterpart module bounded. Activation deferred pending Chamber stability.',
    status: 'ON_HOLD',
    classification: 'GOVERNANCE_SIGNAL',
    route_target: 'CHAMBER',
    urgency: 'LOW',
    tags: ['counterpart', 'module-gate', 'deferred', 'bounded'],
    created_at: '2026-04-12T09:00:00.000Z',
    updated_at: '2026-04-12T09:30:00.000Z',
    held_at: '2026-04-12T09:30:00.000Z',
    action_by: 'founder',
    action_reason: 'Review ulang di HUB-05 atau HUB-06 setelah Bridge stabil.',
    linked_item: 'GQ-004',
  },
  {
    id: 'BR-008',
    title: 'ScoutScorer Agent — Iteration 2 Signal',
    source: 'Build Ops',
    raw_signal: 'ScoutScorer v1 approved. Iteration 2 scoring rules needed.',
    status: 'CLASSIFIED',
    classification: 'BUILD_SIGNAL',
    route_target: 'HUB',
    urgency: 'MEDIUM',
    tags: ['scoutscorer', 'agent', 'iteration-2'],
    created_at: '2026-04-12T09:00:00.000Z',
    updated_at: '2026-04-12T09:00:00.000Z',
    classified_at: '2026-04-12T09:00:00.000Z',
    action_by: 'founder',
    action_reason: 'GQ-003 approved. Lanjut ke iterasi scoring rules.',
    linked_item: 'GQ-003',
  },
]

const BRIDGE_CHECKPOINTS: BridgeCheckpoint[] = [
  {
    id: 'CP-001',
    label: 'Auth Layer (Hub MASTER_PIN / JWT)',
    system: 'HUB-01/02/03',
    status: 'PASS',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'MASTER_PIN valid. Token exchange working. 8h JWT issued correctly.',
  },
  {
    id: 'CP-002',
    label: 'Chamber Console v1 (HUB-04)',
    system: 'Chamber',
    status: 'PASS',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: '6 screens + 9 APIs verified locally. Build 411.26 kB. Commit b5c80a7.',
    action_required: 'Deploy to Cloudflare Pages (CF token now available).',
  },
  {
    id: 'CP-003',
    label: 'GitHub Push Status',
    system: 'Version Control',
    status: 'WARN',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'HUB-04 commit b5c80a7 built locally, push previously blocked. Token now available.',
    action_required: 'git push origin main (GITHUB_TOKEN available).',
  },
  {
    id: 'CP-004',
    label: 'Cloudflare Pages Deploy',
    system: 'Infrastructure',
    status: 'WARN',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'Last deploy: fd0505c8 (HUB-03). HUB-04 deploy pending.',
    action_required: 'npx wrangler pages deploy dist --project-name sovereign-tower',
  },
  {
    id: 'CP-005',
    label: 'WA Webhook (Fonnte)',
    system: 'Comms / WA Lane',
    status: 'WARN',
    last_checked: '2026-04-12T08:00:00.000Z',
    detail: 'B-010: Fonnte webhook URL not set at fonnte.com/settings.',
    action_required: 'Founder must configure webhook URL manually at https://fonnte.com/settings.',
  },
  {
    id: 'CP-006',
    label: '/health endpoint',
    system: 'System',
    status: 'PASS',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'build_session: hub04, status: ok, environment: development.',
  },
  {
    id: 'CP-007',
    label: '/api/hub/state',
    system: 'HUB Continuity',
    status: 'PASS',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'session.code: HUB-03. Hub continuity preserved. No auth regression.',
  },
  {
    id: 'CP-008',
    label: 'Supabase Connection',
    system: 'Database',
    status: 'UNKNOWN',
    last_checked: '2026-04-12T17:00:00.000Z',
    detail: 'Supabase credentials present in .dev.vars. Live connection not yet verified in HUB-05.',
    action_required: 'Verify DB access via /api/founder/profile in next session.',
  },
]

const BRIDGE_BOUNDARIES: BridgeBoundary[] = [
  {
    id: 'BND-001',
    module: 'Hub (Session & Handoff)',
    scope_label: 'HUB-01/02/03 — Auth + Continuity',
    status: 'ACTIVE',
    entry_points: ['/hub', '/api/hub/state', '/api/hub/auth/exchange', '/api/hub/blockers', '/api/hub/founder-actions'],
    out_of_scope: ['New auth systems', 'Counterpart portal', 'Product app features'],
    note: 'Hub is the continuity surface. Auth MASTER_PIN/JWT lives here. Do NOT rebuild.',
    session_locked: 'HUB-03',
  },
  {
    id: 'BND-002',
    module: 'Chamber (Governance Console)',
    scope_label: 'HUB-04 — Governance Operating Surface',
    status: 'ACTIVE',
    entry_points: ['/chamber', '/chamber/inbox', '/chamber/decision-board', '/chamber/audit', '/chamber/truth-sync', '/chamber/maintenance'],
    out_of_scope: ['Product features', 'Counterpart activation', 'BarberKas', 'New auth flow'],
    note: 'Chamber = approve/reject/hold governance items. Bounded to governance decisions only.',
    session_locked: 'HUB-04',
  },
  {
    id: 'BND-003',
    module: 'Bridge (Review Desk)',
    scope_label: 'HUB-05 — Triage + Routing Surface',
    status: 'ACTIVE',
    entry_points: ['/bridge', '/bridge/inbox', '/bridge/review', '/bridge/classification', '/bridge/checkpoints', '/bridge/boundaries'],
    out_of_scope: ['Chamber duplication', 'BarberKas build', 'Counterpart full activation', 'Auth relaunch'],
    note: 'Bridge = classify + route + hold + escalate. Feeds Chamber and Hub. Does NOT replace them.',
    session_locked: 'HUB-05',
  },
  {
    id: 'BND-004',
    module: 'WA Lane',
    scope_label: 'Session 3G — WhatsApp / Fonnte',
    status: 'ACTIVE',
    entry_points: ['/api/wa/webhook', '/api/wa/queue', '/api/wa/send', '/api/wa/audit/:id', '/api/wa/broadcast'],
    out_of_scope: ['Full chatbot', 'AI automation', 'Bulk send without approval'],
    note: 'WA lane is human-gated. All outbound via approval queue. Fonnte webhook pending B-010.',
    session_locked: '3G',
  },
  {
    id: 'BND-005',
    module: 'Counterpart Workspace',
    scope_label: 'DEFERRED — Bounded, not activated',
    status: 'DEFERRED',
    entry_points: [],
    out_of_scope: ['Full activation in HUB-05', 'New auth for counterpart', 'Public portal'],
    note: 'Counterpart module is FROZEN/DEFERRED. Do NOT activate until Chamber+Bridge stable.',
    session_locked: 'deferred',
  },
  {
    id: 'BND-006',
    module: 'BarberKas',
    scope_label: 'DEFERRED — Product lane, separate sprint',
    status: 'DEFERRED',
    entry_points: [],
    out_of_scope: ['Sprint 1 in HUB-05', 'Any code in this session', 'DB schema changes'],
    note: 'BarberKas Sprint 1 deferred until governance layer (Hub+Chamber+Bridge) fully stabilized.',
    session_locked: 'deferred',
  },
]

// =============================================================================
// AUTH HELPER — reuse Hub JWT verification pattern
// =============================================================================

async function requireFounderAuth(c: Context<BridgeContext>): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7)
  if (!token || token.split('.').length !== 3) {
    return null
  }
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (!payload || (payload as any).role !== 'founder') return null
    return token
  } catch {
    return null
  }
}

// =============================================================================
// HTML SHELL — reusable for all 6 screens
// =============================================================================

function bridgeShell(opts: {
  title: string
  activeNav: string
  bodyHtml: string
  scriptHtml?: string
}): string {
  const { title, activeNav, bodyHtml, scriptHtml } = opts

  const navItems = [
    { label: 'Overview', path: '/bridge', id: 'overview' },
    { label: 'Inbox', path: '/bridge/inbox', id: 'inbox' },
    { label: 'Review', path: '/bridge/review', id: 'review' },
    { label: 'Classification', path: '/bridge/classification', id: 'classification' },
    { label: 'Checkpoints', path: '/bridge/checkpoints', id: 'checkpoints' },
    { label: 'Boundaries', path: '/bridge/boundaries', id: 'boundaries' },
  ]

  const navHtml = navItems
    .map((n) => {
      const active = n.id === activeNav
      return `<a href="${n.path}" class="px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-orange-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }">${n.label}</a>`
    })
    .join('\n      ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Bridge Review Desk v1</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { background: #0f172a; color: #e2e8f0; }
    .card { background: #1e293b; border: 1px solid #334155; }
    .badge-pending { background:#854d0e; color:#fef08a; }
    .badge-classified { background:#1e3a5f; color:#93c5fd; }
    .badge-routed { background:#14532d; color:#86efac; }
    .badge-hold { background:#3b1f6b; color:#d8b4fe; }
    .badge-escalated { background:#7f1d1d; color:#fca5a5; }
    .badge-closed { background:#374151; color:#9ca3af; }
    .badge-pass { background:#14532d; color:#86efac; }
    .badge-warn { background:#78350f; color:#fcd34d; }
    .badge-fail { background:#7f1d1d; color:#fca5a5; }
    .badge-unknown { background:#374151; color:#9ca3af; }
    .badge-active { background:#1e3a5f; color:#93c5fd; }
    .badge-bounded { background:#3b1f6b; color:#d8b4fe; }
    .badge-frozen { background:#374151; color:#9ca3af; }
    .badge-deferred { background:#1f2937; color:#6b7280; }
    .toast { position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999; }
  </style>
</head>
<body class="min-h-screen">

  <!-- Auth Gate -->
  <div id="auth-gate" class="fixed inset-0 bg-gray-950 flex items-center justify-center z-50 hidden">
    <div class="card rounded-xl p-8 w-full max-w-md mx-4">
      <div class="text-center mb-6">
        <div class="text-4xl mb-3">🌉</div>
        <h2 class="text-xl font-bold text-white">Bridge Review Desk</h2>
        <p class="text-gray-400 text-sm mt-1">SESSION HUB-05 — Founder Access Only</p>
      </div>
      <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm"></div>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Master PIN</label>
          <input id="pin-input" type="password" placeholder="sovereign-hub-02-pin"
            class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none">
        </div>
        <button id="pin-btn" onclick="doExchange()"
          class="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
          <i class="fas fa-key mr-2"></i>Exchange Token
        </button>
        <div class="text-center text-xs text-gray-500 mt-2">
          ⚠️ Enter MASTER_PIN only — do NOT paste raw JWT_SECRET
        </div>
      </div>
      <div class="border-t border-gray-700 mt-5 pt-4 flex gap-2 text-xs text-gray-500 justify-center">
        <a href="/hub" class="hover:text-orange-400 transition-colors"><i class="fas fa-broadcast-tower mr-1"></i>Hub</a>
        <span>·</span>
        <a href="/chamber" class="hover:text-orange-400 transition-colors"><i class="fas fa-landmark mr-1"></i>Chamber</a>
        <span>·</span>
        <a href="/health" class="hover:text-orange-400 transition-colors"><i class="fas fa-heartbeat mr-1"></i>Health</a>
      </div>
    </div>
  </div>

  <!-- Main App -->
  <div id="main-app" class="hidden">
    <!-- Top Nav -->
    <nav class="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-orange-400 text-lg">🌉</span>
          <span class="font-bold text-white text-sm">Bridge Review Desk</span>
          <span class="text-gray-500 text-xs">v${BRIDGE_VERSION} · HUB-05</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          ${navHtml}
        </div>
        <div class="flex items-center gap-3">
          <a href="/hub" class="text-xs text-gray-400 hover:text-orange-400 transition-colors" title="Hub"><i class="fas fa-broadcast-tower"></i></a>
          <a href="/chamber" class="text-xs text-gray-400 hover:text-orange-400 transition-colors" title="Chamber"><i class="fas fa-landmark"></i></a>
          <button onclick="doLogout()" class="text-xs text-gray-400 hover:text-red-400 transition-colors" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      ${bodyHtml}
    </main>
  </div>

  <!-- Toast -->
  <div id="toast" class="toast hidden">
    <div id="toast-msg" class="px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script>
    // ── Auth helpers ──────────────────────────────────────────────────────────
    const TOKEN_KEY = 'sovereign_hub_token'

    function getToken() { return localStorage.getItem(TOKEN_KEY) }
    function setToken(t) { localStorage.setItem(TOKEN_KEY, t) }
    function clearToken() { localStorage.removeItem(TOKEN_KEY) }

    function authHeader() { return { Authorization: 'Bearer ' + getToken() } }

    function showToast(msg, type = 'success') {
      const el = document.getElementById('toast')
      const msgEl = document.getElementById('toast-msg')
      msgEl.textContent = msg
      msgEl.className = 'px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl ' +
        (type === 'success' ? 'bg-green-700 text-green-100' :
         type === 'error'   ? 'bg-red-700 text-red-100' :
                              'bg-orange-700 text-orange-100')
      el.classList.remove('hidden')
      setTimeout(() => el.classList.add('hidden'), 3500)
    }

    async function doExchange() {
      const pin = document.getElementById('pin-input').value.trim()
      const errEl = document.getElementById('auth-error')
      errEl.classList.add('hidden')
      if (!pin) {
        errEl.textContent = 'PIN is required.'
        errEl.classList.remove('hidden')
        return
      }
      try {
        const res = await axios.post('/api/hub/auth/exchange', { pin })
        if (res.data?.success && res.data?.data?.token) {
          setToken(res.data.data.token)
          showApp()
        } else {
          const code = res.data?.error?.code || 'UNKNOWN'
          errEl.textContent = 'Exchange failed: ' + code
          errEl.classList.remove('hidden')
        }
      } catch (e) {
        const code = e.response?.data?.error?.code
        const map = {
          EXCHANGE_MISSING_PIN: 'PIN is required.',
          EXCHANGE_INVALID_PIN: 'Incorrect PIN. Use your MASTER_PIN.',
        }
        errEl.textContent = map[code] || 'Network error. Check connection.'
        errEl.classList.remove('hidden')
      }
    }

    async function doLogout() {
      try {
        await axios.post('/api/hub/auth/logout', {}, { headers: authHeader() })
      } catch {}
      clearToken()
      document.getElementById('auth-gate').classList.remove('hidden')
      document.getElementById('main-app').classList.add('hidden')
      showToast('Logged out.', 'warn')
    }

    function showApp() {
      document.getElementById('auth-gate').classList.add('hidden')
      document.getElementById('main-app').classList.remove('hidden')
      onAppReady()
    }

    function checkAuth() {
      const t = getToken()
      if (!t || t.split('.').length !== 3) {
        document.getElementById('auth-gate').classList.remove('hidden')
        document.getElementById('main-app').classList.add('hidden')
      } else {
        showApp()
      }
    }

    // ── Keyboard shortcut ────────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !document.getElementById('auth-gate').classList.contains('hidden')) {
        doExchange()
      }
    })

    // ── Page-specific logic ──────────────────────────────────────────────────
    ${scriptHtml ?? 'function onAppReady() {}'}

    checkAuth()
  </script>
</body>
</html>`
}

// =============================================================================
// HELPER: status badge
// =============================================================================

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    PENDING_CLASSIFICATION: 'badge-pending',
    CLASSIFIED: 'badge-classified',
    ROUTED: 'badge-routed',
    ON_HOLD: 'badge-hold',
    ESCALATED: 'badge-escalated',
    CLOSED: 'badge-closed',
    PASS: 'badge-pass',
    WARN: 'badge-warn',
    FAIL: 'badge-fail',
    UNKNOWN: 'badge-unknown',
    ACTIVE: 'badge-active',
    BOUNDED: 'badge-bounded',
    FROZEN: 'badge-frozen',
    DEFERRED: 'badge-deferred',
  }
  const cls = map[status] ?? 'badge-unknown'
  return `<span class="px-2 py-0.5 rounded text-xs font-medium ${cls}">${status}</span>`
}

function urgencyBadge(urgency: string): string {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-900 text-red-200',
    HIGH: 'bg-orange-900 text-orange-200',
    MEDIUM: 'bg-yellow-900 text-yellow-200',
    LOW: 'bg-gray-700 text-gray-300',
  }
  const cls = map[urgency] ?? 'bg-gray-700 text-gray-300'
  return `<span class="px-2 py-0.5 rounded text-xs font-medium ${cls}">${urgency}</span>`
}

// =============================================================================
// API ROUTES — /bridge/api/*
// These are mounted under /bridge → effectively /bridge/api/...
// =============================================================================

/** GET /api/summary */
bridgeRouter.get('/api/summary', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const pending = BRIDGE_INBOX.filter(i => i.status === 'PENDING_CLASSIFICATION').length
  const classified = BRIDGE_INBOX.filter(i => i.status === 'CLASSIFIED').length
  const routed = BRIDGE_INBOX.filter(i => i.status === 'ROUTED').length
  const onHold = BRIDGE_INBOX.filter(i => i.status === 'ON_HOLD').length
  const escalated = BRIDGE_INBOX.filter(i => i.status === 'ESCALATED').length
  const total = BRIDGE_INBOX.length

  const cpPass = BRIDGE_CHECKPOINTS.filter(c => c.status === 'PASS').length
  const cpWarn = BRIDGE_CHECKPOINTS.filter(c => c.status === 'WARN').length
  const cpFail = BRIDGE_CHECKPOINTS.filter(c => c.status === 'FAIL').length
  const cpUnknown = BRIDGE_CHECKPOINTS.filter(c => c.status === 'UNKNOWN').length

  return c.json(successResponse({
    session: BRIDGE_BUILD_SESSION,
    version: BRIDGE_VERSION,
    total_items: total,
    by_status: { pending, classified, routed, on_hold: onHold, escalated },
    checkpoints: { pass: cpPass, warn: cpWarn, fail: cpFail, unknown: cpUnknown, total: BRIDGE_CHECKPOINTS.length },
    active_boundaries: BRIDGE_BOUNDARIES.filter(b => b.status === 'ACTIVE').length,
    deferred_modules: BRIDGE_BOUNDARIES.filter(b => b.status === 'DEFERRED').length,
    hub_link: '/api/hub/state',
    chamber_link: '/chamber/api/summary',
    last_updated: new Date().toISOString(),
  }))
})

/** GET /api/inbox */
bridgeRouter.get('/api/inbox', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const status = c.req.query('status')
  const items = status
    ? BRIDGE_INBOX.filter(i => i.status === status)
    : BRIDGE_INBOX

  return c.json(successResponse({
    items,
    total: items.length,
    pending: BRIDGE_INBOX.filter(i => i.status === 'PENDING_CLASSIFICATION').length,
    filter: status ?? 'all',
  }))
})

/** GET /api/item/:id */
bridgeRouter.get('/api/item/:id', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = c.req.param('id') ?? ''
  const item = BRIDGE_INBOX.find(i => i.id === id)
  if (!item) return c.json(errorResponse('BRIDGE_ITEM_NOT_FOUND', `Item ${id} not found.`), 404)

  return c.json(successResponse({ item }))
})

/** POST /api/item/:id/classify */
bridgeRouter.post('/api/item/:id/classify', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = c.req.param('id') ?? ''
  const idx = BRIDGE_INBOX.findIndex(i => i.id === id)
  if (idx === -1) return c.json(errorResponse('BRIDGE_ITEM_NOT_FOUND', `Item ${id} not found.`), 404)

  const item = BRIDGE_INBOX[idx]!
  if (item.status !== 'PENDING_CLASSIFICATION') {
    return c.json(errorResponse('BRIDGE_ALREADY_ACTIONED', `Item ${id} is already ${item.status}.`), 409)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}

  const classification = (body.classification as BridgeItemClass) || item.classification
  const reason = String(body.reason || 'Classified by founder.')

  item.status = 'CLASSIFIED'
  item.classification = classification
  item.classified_at = new Date().toISOString()
  item.updated_at = new Date().toISOString()
  item.action_by = 'founder'
  item.action_reason = reason

  return c.json(successResponse({
    id,
    result: 'CLASSIFIED',
    classification,
    reason,
    classified_at: item.classified_at,
    session_ref: BRIDGE_BUILD_SESSION,
  }))
})

/** POST /api/item/:id/route */
bridgeRouter.post('/api/item/:id/route', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = c.req.param('id') ?? ''
  const idx = BRIDGE_INBOX.findIndex(i => i.id === id)
  if (idx === -1) return c.json(errorResponse('BRIDGE_ITEM_NOT_FOUND', `Item ${id} not found.`), 404)

  const item = BRIDGE_INBOX[idx]!
  if (item.status === 'CLOSED') {
    return c.json(errorResponse('BRIDGE_ALREADY_ACTIONED', `Item ${id} is already CLOSED.`), 409)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}

  const target = (body.target as RouteTarget) || 'HUB'
  const reason = String(body.reason || 'Routed by founder.')

  item.status = 'ROUTED'
  item.route_target = target
  item.routed_at = new Date().toISOString()
  item.updated_at = new Date().toISOString()
  item.action_by = 'founder'
  item.action_reason = reason

  return c.json(successResponse({
    id,
    result: 'ROUTED',
    route_target: target,
    reason,
    routed_at: item.routed_at,
    session_ref: BRIDGE_BUILD_SESSION,
  }))
})

/** POST /api/item/:id/hold */
bridgeRouter.post('/api/item/:id/hold', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = c.req.param('id') ?? ''
  const idx = BRIDGE_INBOX.findIndex(i => i.id === id)
  if (idx === -1) return c.json(errorResponse('BRIDGE_ITEM_NOT_FOUND', `Item ${id} not found.`), 404)

  const item = BRIDGE_INBOX[idx]!
  if (item.status === 'CLOSED') {
    return c.json(errorResponse('BRIDGE_ALREADY_ACTIONED', `Item ${id} is already CLOSED.`), 409)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}

  const reason = String(body.reason || 'Held by founder for later review.')

  item.status = 'ON_HOLD'
  item.held_at = new Date().toISOString()
  item.updated_at = new Date().toISOString()
  item.action_by = 'founder'
  item.action_reason = reason

  return c.json(successResponse({
    id,
    result: 'ON_HOLD',
    reason,
    held_at: item.held_at,
    session_ref: BRIDGE_BUILD_SESSION,
  }))
})

/** POST /api/item/:id/escalate */
bridgeRouter.post('/api/item/:id/escalate', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = c.req.param('id') ?? ''
  const idx = BRIDGE_INBOX.findIndex(i => i.id === id)
  if (idx === -1) return c.json(errorResponse('BRIDGE_ITEM_NOT_FOUND', `Item ${id} not found.`), 404)

  const item = BRIDGE_INBOX[idx]!
  if (item.status === 'CLOSED') {
    return c.json(errorResponse('BRIDGE_ALREADY_ACTIONED', `Item ${id} is already CLOSED.`), 409)
  }

  let body: any = {}
  try { body = await c.req.json() } catch {}

  const reason = String(body.reason || 'Escalated to founder priority.')

  item.status = 'ESCALATED'
  item.urgency = 'CRITICAL'
  item.escalated_at = new Date().toISOString()
  item.updated_at = new Date().toISOString()
  item.action_by = 'founder'
  item.action_reason = reason

  return c.json(successResponse({
    id,
    result: 'ESCALATED',
    reason,
    escalated_at: item.escalated_at,
    new_urgency: 'CRITICAL',
    session_ref: BRIDGE_BUILD_SESSION,
  }))
})

/** GET /api/checkpoints */
bridgeRouter.get('/api/checkpoints', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const pass = BRIDGE_CHECKPOINTS.filter(cp => cp.status === 'PASS').length
  const warn = BRIDGE_CHECKPOINTS.filter(cp => cp.status === 'WARN').length
  const fail = BRIDGE_CHECKPOINTS.filter(cp => cp.status === 'FAIL').length

  return c.json(successResponse({
    checkpoints: BRIDGE_CHECKPOINTS,
    summary: { pass, warn, fail, total: BRIDGE_CHECKPOINTS.length },
    overall_health: fail > 0 ? 'DEGRADED' : warn > 0 ? 'WARNING' : 'HEALTHY',
  }))
})

/** GET /api/boundaries */
bridgeRouter.get('/api/boundaries', async (c: Context<BridgeContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  return c.json(successResponse({
    boundaries: BRIDGE_BOUNDARIES,
    active: BRIDGE_BOUNDARIES.filter(b => b.status === 'ACTIVE').length,
    deferred: BRIDGE_BOUNDARIES.filter(b => b.status === 'DEFERRED').length,
    frozen: BRIDGE_BOUNDARIES.filter(b => b.status === 'FROZEN').length,
    total: BRIDGE_BOUNDARIES.length,
    scope_note: 'Bridge is bounded to: classify, route, hold, escalate. Not Chamber. Not Hub. Not BarberKas.',
  }))
})

// =============================================================================
// UI ROUTES — /bridge/*
// =============================================================================

/** GET / — Bridge Landing / Overview */
bridgeRouter.get('/', (c: Context<BridgeContext>) => {
  const bodyHtml = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            🌉 Bridge Review Desk
            <span class="text-sm font-normal text-gray-400">v${BRIDGE_VERSION}</span>
          </h1>
          <p class="text-gray-400 text-sm mt-1">SESSION HUB-05 — Triage, classify, and route incoming signals.</p>
        </div>
        <div class="text-right text-xs text-gray-500">
          <div>build_session: <span class="text-orange-400">${BRIDGE_BUILD_SESSION}</span></div>
          <div id="last-updated" class="mt-0.5"></div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div id="summary-cards" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card rounded-xl p-4 animate-pulse h-20"></div>
        <div class="card rounded-xl p-4 animate-pulse h-20"></div>
        <div class="card rounded-xl p-4 animate-pulse h-20"></div>
        <div class="card rounded-xl p-4 animate-pulse h-20"></div>
      </div>

      <!-- Checkpoint Status + Module Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Checkpoints -->
        <div class="card rounded-xl p-5">
          <h2 class="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <i class="fas fa-shield-alt text-orange-400"></i>System Checkpoints
          </h2>
          <div id="cp-mini" class="space-y-2 text-sm">
            <div class="text-gray-500 text-xs">Loading...</div>
          </div>
          <a href="/bridge/checkpoints" class="mt-3 block text-xs text-orange-400 hover:text-orange-300">View all checkpoints →</a>
        </div>

        <!-- Module Links -->
        <div class="card rounded-xl p-5">
          <h2 class="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <i class="fas fa-link text-orange-400"></i>Connected Modules
          </h2>
          <div class="space-y-2.5">
            <a href="/hub" class="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <span class="text-lg">📡</span>
              <div>
                <div class="text-sm font-medium text-white">Hub (HUB-01/02/03)</div>
                <div class="text-xs text-gray-400">Session continuity + Auth (MASTER_PIN/JWT)</div>
              </div>
            </a>
            <a href="/chamber" class="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <span class="text-lg">🏛️</span>
              <div>
                <div class="text-sm font-medium text-white">Chamber (HUB-04)</div>
                <div class="text-xs text-gray-400">Governance decisions — approve/reject/hold</div>
              </div>
            </a>
            <a href="/bridge/boundaries" class="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <span class="text-lg">🗺️</span>
              <div>
                <div class="text-sm font-medium text-white">Boundaries Map</div>
                <div class="text-xs text-gray-400">Module scope & activation status</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Inbox Items -->
      <div class="card rounded-xl p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <i class="fas fa-inbox text-orange-400"></i>Pending Classification
          </h2>
          <a href="/bridge/inbox" class="text-xs text-orange-400 hover:text-orange-300">View all →</a>
        </div>
        <div id="pending-items" class="space-y-2 text-sm">
          <div class="text-gray-500 text-xs">Loading...</div>
        </div>
      </div>
    </div>
  `

  const scriptHtml = `
    async function onAppReady() {
      try {
        const [sumRes, cpRes, inboxRes] = await Promise.all([
          axios.get('/bridge/api/summary', { headers: authHeader() }),
          axios.get('/bridge/api/checkpoints', { headers: authHeader() }),
          axios.get('/bridge/api/inbox?status=PENDING_CLASSIFICATION', { headers: authHeader() }),
        ])

        // Summary cards
        const s = sumRes.data.data
        document.getElementById('last-updated').textContent = 'Updated: ' + new Date(s.last_updated).toLocaleTimeString()
        document.getElementById('summary-cards').innerHTML = \`
          <div class="card rounded-xl p-4">
            <div class="text-2xl font-bold text-orange-400">\${s.by_status.pending}</div>
            <div class="text-xs text-gray-400 mt-1">Pending Classification</div>
          </div>
          <div class="card rounded-xl p-4">
            <div class="text-2xl font-bold text-blue-400">\${s.by_status.classified + s.by_status.routed}</div>
            <div class="text-xs text-gray-400 mt-1">Classified / Routed</div>
          </div>
          <div class="card rounded-xl p-4">
            <div class="text-2xl font-bold text-yellow-400">\${s.checkpoints.warn}</div>
            <div class="text-xs text-gray-400 mt-1">Checkpoint Warnings</div>
          </div>
          <div class="card rounded-xl p-4">
            <div class="text-2xl font-bold text-purple-400">\${s.total_items}</div>
            <div class="text-xs text-gray-400 mt-1">Total Signals</div>
          </div>
        \`

        // Checkpoints mini
        const cps = cpRes.data.data.checkpoints.slice(0, 5)
        const cpColors = { PASS: 'text-green-400', WARN: 'text-yellow-400', FAIL: 'text-red-400', UNKNOWN: 'text-gray-400' }
        const cpIcons = { PASS: 'fa-check-circle', WARN: 'fa-exclamation-triangle', FAIL: 'fa-times-circle', UNKNOWN: 'fa-question-circle' }
        document.getElementById('cp-mini').innerHTML = cps.map(cp => \`
          <div class="flex items-center justify-between">
            <span class="text-gray-300">\${cp.label}</span>
            <span class="\${cpColors[cp.status] || 'text-gray-400'} text-xs"><i class="fas \${cpIcons[cp.status] || 'fa-circle'} mr-1"></i>\${cp.status}</span>
          </div>
        \`).join('')

        // Pending items
        const items = inboxRes.data.data.items.slice(0, 4)
        if (items.length === 0) {
          document.getElementById('pending-items').innerHTML = '<div class="text-gray-500 text-xs text-center py-3">No pending items.</div>'
        } else {
          document.getElementById('pending-items').innerHTML = items.map(item => \`
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
              onclick="window.location='/bridge/review?id=\${item.id}'">
              <div class="flex-1 min-w-0 mr-3">
                <div class="text-sm text-white truncate">\${item.title}</div>
                <div class="text-xs text-gray-400 mt-0.5">\${item.source} · \${item.classification}</div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="px-2 py-0.5 rounded text-xs font-medium \${
                  item.urgency === 'HIGH' || item.urgency === 'CRITICAL' ? 'bg-orange-900 text-orange-200' : 'bg-gray-700 text-gray-300'
                }">\${item.urgency}</span>
              </div>
            </div>
          \`).join('')
        }
      } catch(e) {
        console.error('Bridge overview load error:', e)
        if (e.response?.status === 401) {
          clearToken()
          checkAuth()
        }
      }
    }
  `

  return c.html(bridgeShell({ title: 'Overview', activeNav: 'overview', bodyHtml, scriptHtml }))
})

/** GET /inbox — Inbox screen */
bridgeRouter.get('/inbox', (c: Context<BridgeContext>) => {
  const bodyHtml = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-inbox text-orange-400"></i>Bridge Inbox
          </h1>
          <p class="text-gray-400 text-sm mt-1">Incoming signals pending classification and routing.</p>
        </div>
        <div class="flex items-center gap-2">
          <select id="filter-status" onchange="filterItems()"
            class="bg-gray-800 border border-gray-600 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500">
            <option value="all">All Status</option>
            <option value="PENDING_CLASSIFICATION">Pending</option>
            <option value="CLASSIFIED">Classified</option>
            <option value="ROUTED">Routed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      <!-- Stats row -->
      <div id="inbox-stats" class="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
        <div class="card rounded-lg p-3"><div id="stat-pending" class="text-xl font-bold text-yellow-400">-</div><div class="text-xs text-gray-400">Pending</div></div>
        <div class="card rounded-lg p-3"><div id="stat-classified" class="text-xl font-bold text-blue-400">-</div><div class="text-xs text-gray-400">Classified</div></div>
        <div class="card rounded-lg p-3"><div id="stat-routed" class="text-xl font-bold text-green-400">-</div><div class="text-xs text-gray-400">Routed</div></div>
        <div class="card rounded-lg p-3"><div id="stat-hold" class="text-xl font-bold text-purple-400">-</div><div class="text-xs text-gray-400">On Hold</div></div>
        <div class="card rounded-lg p-3"><div id="stat-escalated" class="text-xl font-bold text-red-400">-</div><div class="text-xs text-gray-400">Escalated</div></div>
      </div>

      <!-- Items list -->
      <div id="items-list" class="space-y-3">
        <div class="text-gray-500 text-sm text-center py-8">Loading...</div>
      </div>
    </div>
  `

  const scriptHtml = `
    let allItems = []

    const statusBadgeMap = {
      PENDING_CLASSIFICATION: 'badge-pending',
      CLASSIFIED: 'badge-classified',
      ROUTED: 'badge-routed',
      ON_HOLD: 'badge-hold',
      ESCALATED: 'badge-escalated',
      CLOSED: 'badge-closed',
    }

    const urgencyColor = {
      CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-yellow-400', LOW: 'text-gray-400'
    }

    function renderItems(items) {
      if (items.length === 0) {
        document.getElementById('items-list').innerHTML = '<div class="text-gray-500 text-center py-8 text-sm">No items found.</div>'
        return
      }
      document.getElementById('items-list').innerHTML = items.map(item => \`
        <div class="card rounded-xl p-4 hover:border-orange-700 transition-colors cursor-pointer"
          onclick="window.location='/bridge/review?id=\${item.id}'">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="text-xs font-mono text-gray-500">\${item.id}</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium \${statusBadgeMap[item.status] || ''}">\${item.status}</span>
                <span class="text-xs \${urgencyColor[item.urgency] || 'text-gray-400'}">\${item.urgency}</span>
              </div>
              <div class="text-sm font-medium text-white">\${item.title}</div>
              <div class="text-xs text-gray-400 mt-1">\${item.source} · \${item.classification}</div>
              \${item.note ? \`<div class="text-xs text-gray-500 mt-1 italic">\${item.note}</div>\` : ''}
            </div>
            <div class="text-xs text-gray-500 shrink-0 text-right">
              <div>\${item.tags.slice(0,2).map(t => '#'+t).join(' ')}</div>
              <div class="mt-1">\${new Date(item.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
          \${item.action_reason ? \`<div class="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">Reason: \${item.action_reason}</div>\` : ''}
        </div>
      \`).join('')
    }

    function filterItems() {
      const status = document.getElementById('filter-status').value
      const filtered = status === 'all' ? allItems : allItems.filter(i => i.status === status)
      renderItems(filtered)
    }

    async function onAppReady() {
      try {
        const res = await axios.get('/bridge/api/inbox', { headers: authHeader() })
        const d = res.data.data
        allItems = d.items

        document.getElementById('stat-pending').textContent = allItems.filter(i => i.status === 'PENDING_CLASSIFICATION').length
        document.getElementById('stat-classified').textContent = allItems.filter(i => i.status === 'CLASSIFIED').length
        document.getElementById('stat-routed').textContent = allItems.filter(i => i.status === 'ROUTED').length
        document.getElementById('stat-hold').textContent = allItems.filter(i => i.status === 'ON_HOLD').length
        document.getElementById('stat-escalated').textContent = allItems.filter(i => i.status === 'ESCALATED').length

        renderItems(allItems)
      } catch(e) {
        if (e.response?.status === 401) { clearToken(); checkAuth() }
        document.getElementById('items-list').innerHTML = '<div class="text-red-400 text-sm text-center py-8">Load failed.</div>'
      }
    }
  `

  return c.html(bridgeShell({ title: 'Inbox', activeNav: 'inbox', bodyHtml, scriptHtml }))
})

/** GET /review — Review desk (item detail + action panel) */
bridgeRouter.get('/review', (c: Context<BridgeContext>) => {
  const bodyHtml = `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-search text-orange-400"></i>Review Desk
        </h1>
        <p class="text-gray-400 text-sm mt-1">Select an item to review, classify, and action.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Item list sidebar -->
        <div class="card rounded-xl p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</h2>
          <div id="item-sidebar" class="space-y-1.5">
            <div class="text-gray-500 text-xs">Loading...</div>
          </div>
        </div>

        <!-- Item detail + actions -->
        <div class="md:col-span-2 space-y-4">
          <div id="item-detail" class="card rounded-xl p-5">
            <div class="text-center text-gray-500 py-8 text-sm">
              <i class="fas fa-arrow-left mr-2"></i>Select an item from the list.
            </div>
          </div>

          <!-- Action panel -->
          <div id="action-panel" class="card rounded-xl p-5 hidden">
            <h2 class="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <i class="fas fa-bolt text-orange-400"></i>Actions
            </h2>
            <div class="mb-3">
              <label class="text-xs text-gray-400 block mb-1">Reason (optional)</label>
              <input id="action-reason" type="text" placeholder="Brief reason for this action..."
                class="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none">
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button onclick="doAction('classify')"
                class="px-3 py-2 rounded-lg text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white transition-colors">
                <i class="fas fa-tag mr-1"></i>Classify
              </button>
              <button onclick="doAction('route')"
                class="px-3 py-2 rounded-lg text-xs font-medium bg-green-700 hover:bg-green-600 text-white transition-colors">
                <i class="fas fa-route mr-1"></i>Route
              </button>
              <button onclick="doAction('hold')"
                class="px-3 py-2 rounded-lg text-xs font-medium bg-purple-700 hover:bg-purple-600 text-white transition-colors">
                <i class="fas fa-pause mr-1"></i>Hold
              </button>
              <button onclick="doAction('escalate')"
                class="px-3 py-2 rounded-lg text-xs font-medium bg-red-700 hover:bg-red-600 text-white transition-colors">
                <i class="fas fa-arrow-up mr-1"></i>Escalate
              </button>
            </div>
            <div id="route-target-row" class="mt-3 hidden">
              <label class="text-xs text-gray-400 block mb-1">Route Target</label>
              <select id="route-target"
                class="bg-gray-900 border border-gray-600 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500">
                <option value="HUB">Hub</option>
                <option value="CHAMBER">Chamber</option>
                <option value="QUEUE">Queue</option>
                <option value="FOUNDER_DIRECT">Founder Direct</option>
              </select>
            </div>
            <div id="action-result" class="mt-3 hidden text-xs rounded-lg px-3 py-2"></div>
          </div>
        </div>
      </div>
    </div>
  `

  const scriptHtml = `
    let currentItemId = null
    let allItems = []
    let pendingAction = null

    const statusBadgeMap = {
      PENDING_CLASSIFICATION: 'badge-pending',
      CLASSIFIED: 'badge-classified',
      ROUTED: 'badge-routed',
      ON_HOLD: 'badge-hold',
      ESCALATED: 'badge-escalated',
      CLOSED: 'badge-closed',
    }

    function renderSidebar(items) {
      document.getElementById('item-sidebar').innerHTML = items.map(item => \`
        <div class="p-2 rounded-lg cursor-pointer transition-colors text-xs hover:bg-gray-700 \${currentItemId === item.id ? 'bg-gray-700 border border-orange-700' : 'border border-transparent'}"
          onclick="selectItem('\${item.id}')">
          <div class="text-gray-300 font-medium truncate">\${item.title}</div>
          <div class="flex items-center gap-1.5 mt-1 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-xs \${statusBadgeMap[item.status] || ''}">\${item.status.replace('_', ' ')}</span>
            <span class="text-gray-500">\${item.id}</span>
          </div>
        </div>
      \`).join('')
    }

    async function selectItem(id) {
      currentItemId = id
      renderSidebar(allItems)
      try {
        const res = await axios.get('/bridge/api/item/' + id, { headers: authHeader() })
        const item = res.data.data.item
        renderDetail(item)
        document.getElementById('action-panel').classList.remove('hidden')
        document.getElementById('action-result').classList.add('hidden')
      } catch(e) {
        document.getElementById('item-detail').innerHTML = '<div class="text-red-400 text-sm p-4">Failed to load item.</div>'
      }
    }

    function renderDetail(item) {
      const el = document.getElementById('item-detail')
      el.innerHTML = \`
        <div class="space-y-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono text-xs text-gray-500">\${item.id}</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium \${statusBadgeMap[item.status] || ''}">\${item.status}</span>
            <span class="text-xs text-orange-300">\${item.urgency}</span>
          </div>
          <h3 class="text-base font-semibold text-white">\${item.title}</h3>
          <p class="text-sm text-gray-400">\${item.raw_signal}</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-gray-500">Source:</span> <span class="text-gray-300">\${item.source}</span></div>
            <div><span class="text-gray-500">Class:</span> <span class="text-gray-300">\${item.classification}</span></div>
            <div><span class="text-gray-500">Route Target:</span> <span class="text-gray-300">\${item.route_target}</span></div>
            \${item.linked_item ? \`<div><span class="text-gray-500">Linked:</span> <span class="text-orange-400">\${item.linked_item}</span></div>\` : ''}
          </div>
          \${item.note ? \`<div class="text-xs text-gray-500 italic bg-gray-900 rounded p-2">\${item.note}</div>\` : ''}
          \${item.action_reason ? \`<div class="text-xs text-gray-400 bg-gray-900 rounded p-2">Last action: <span class="text-white">\${item.action_reason}</span> by \${item.action_by || 'founder'}</div>\` : ''}
          <div class="flex flex-wrap gap-1 pt-1">
            \${item.tags.map(t => \`<span class="px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-400">#\${t}</span>\`).join('')}
          </div>
        </div>
      \`
    }

    async function doAction(action) {
      if (!currentItemId) return
      pendingAction = action
      const reason = document.getElementById('action-reason').value.trim()

      // Show route target picker for 'route'
      if (action === 'route') {
        document.getElementById('route-target-row').classList.remove('hidden')
      } else {
        document.getElementById('route-target-row').classList.add('hidden')
      }

      const target = document.getElementById('route-target')?.value || 'HUB'
      const body = { reason: reason || undefined }
      if (action === 'route') body.target = target

      const resultEl = document.getElementById('action-result')
      try {
        const res = await axios.post('/bridge/api/item/' + currentItemId + '/' + action, body, { headers: authHeader() })
        const d = res.data.data
        resultEl.className = 'mt-3 text-xs rounded-lg px-3 py-2 bg-green-900/40 border border-green-700 text-green-300'
        resultEl.textContent = 'SUCCESS: ' + d.result + (d.route_target ? ' → ' + d.route_target : '')
        resultEl.classList.remove('hidden')
        showToast(action.toUpperCase() + ' action applied.', 'success')
        // Reload item list
        const inboxRes = await axios.get('/bridge/api/inbox', { headers: authHeader() })
        allItems = inboxRes.data.data.items
        renderSidebar(allItems)
        await selectItem(currentItemId)
      } catch(e) {
        const code = e.response?.data?.error?.code || 'ERROR'
        resultEl.className = 'mt-3 text-xs rounded-lg px-3 py-2 bg-red-900/40 border border-red-700 text-red-300'
        resultEl.textContent = 'FAILED: ' + code
        resultEl.classList.remove('hidden')
        showToast('Action failed: ' + code, 'error')
      }
    }

    async function onAppReady() {
      try {
        const res = await axios.get('/bridge/api/inbox', { headers: authHeader() })
        allItems = res.data.data.items
        renderSidebar(allItems)

        // Auto-select from URL param
        const urlId = new URLSearchParams(window.location.search).get('id')
        if (urlId) selectItem(urlId)
      } catch(e) {
        if (e.response?.status === 401) { clearToken(); checkAuth() }
      }
    }
  `

  return c.html(bridgeShell({ title: 'Review Desk', activeNav: 'review', bodyHtml, scriptHtml }))
})

/** GET /classification — Classification rules screen */
bridgeRouter.get('/classification', (c: Context<BridgeContext>) => {
  const classes = [
    { id: 'INFRA_SIGNAL', label: 'Infrastructure Signal', icon: 'fa-server', color: 'text-blue-400', desc: 'Cloudflare deploys, GitHub pushes, env config, tokens.', examples: ['CF deploy pending', 'GitHub push blocked', 'API token missing'] },
    { id: 'GOVERNANCE_SIGNAL', label: 'Governance Signal', icon: 'fa-gavel', color: 'text-yellow-400', desc: 'Repo visibility, module gates, policy decisions.', examples: ['Repo public/private decision', 'Module activation gate', 'Counterpart bounded status'] },
    { id: 'BUILD_SIGNAL', label: 'Build Signal', icon: 'fa-hammer', color: 'text-orange-400', desc: 'Build sessions, agent iterations, feature scope.', examples: ['ScoutScorer iteration', 'HUB-05 build active', 'Chamber v1.1 hardening'] },
    { id: 'PRODUCT_SIGNAL', label: 'Product Signal', icon: 'fa-box', color: 'text-green-400', desc: 'Product lane decisions — BarberKas, modules, sprints.', examples: ['BarberKas Sprint 1 go/no-go', 'Module enablement', 'Feature gate'] },
    { id: 'AUTH_SIGNAL', label: 'Auth Signal', icon: 'fa-key', color: 'text-purple-400', desc: 'JWT, MASTER_PIN, token issues, auth flow changes.', examples: ['Token expired', 'MASTER_PIN rotation', 'JWT_SECRET update'] },
    { id: 'COMMS_SIGNAL', label: 'Comms Signal', icon: 'fa-comment', color: 'text-pink-400', desc: 'WhatsApp, Fonnte, webhook, broadcast signals.', examples: ['Fonnte webhook pending', 'WA send queue', 'Broadcast approval'] },
    { id: 'UNKNOWN', label: 'Unknown', icon: 'fa-question', color: 'text-gray-400', desc: 'Unclassified signal. Needs founder review.', examples: ['New signal type', 'Ambiguous source'] },
  ]

  const bodyHtml = `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-tags text-orange-400"></i>Classification Rules
        </h1>
        <p class="text-gray-400 text-sm mt-1">Signal classification taxonomy for Bridge Review Desk.</p>
      </div>

      <!-- Classification by source stats -->
      <div id="class-stats" class="card rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-300 mb-3">Current Inbox — By Classification</h2>
        <div id="class-bars" class="space-y-2 text-sm">Loading...</div>
      </div>

      <!-- Classification taxonomy -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${classes.map(cl => `
          <div class="card rounded-xl p-4 space-y-2">
            <div class="flex items-center gap-2">
              <i class="fas ${cl.icon} ${cl.color}"></i>
              <span class="font-medium text-white text-sm">${cl.label}</span>
              <span class="text-xs font-mono text-gray-500 ml-auto">${cl.id}</span>
            </div>
            <p class="text-xs text-gray-400">${cl.desc}</p>
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${cl.examples.map(e => `<span class="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">${e}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Route targets -->
      <div class="card rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-300 mb-3">Route Targets</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm font-medium text-white">HUB</div>
            <div class="text-xs text-gray-400 mt-1">Session tracking, continuity signals</div>
          </div>
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm font-medium text-white">CHAMBER</div>
            <div class="text-xs text-gray-400 mt-1">Governance decisions, module gates</div>
          </div>
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm font-medium text-white">QUEUE</div>
            <div class="text-xs text-gray-400 mt-1">WA queue, deferred actions</div>
          </div>
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm font-medium text-white">FOUNDER_DIRECT</div>
            <div class="text-xs text-gray-400 mt-1">Immediate founder attention required</div>
          </div>
        </div>
      </div>
    </div>
  `

  const scriptHtml = `
    async function onAppReady() {
      try {
        const res = await axios.get('/bridge/api/inbox', { headers: authHeader() })
        const items = res.data.data.items
        const classCounts = {}
        items.forEach(i => { classCounts[i.classification] = (classCounts[i.classification] || 0) + 1 })

        const classColors = {
          INFRA_SIGNAL: 'bg-blue-700',
          GOVERNANCE_SIGNAL: 'bg-yellow-700',
          BUILD_SIGNAL: 'bg-orange-700',
          PRODUCT_SIGNAL: 'bg-green-700',
          AUTH_SIGNAL: 'bg-purple-700',
          COMMS_SIGNAL: 'bg-pink-700',
          UNKNOWN: 'bg-gray-700',
        }

        const maxCount = Math.max(...Object.values(classCounts), 1)
        document.getElementById('class-bars').innerHTML = Object.entries(classCounts).map(([cls, count]) => \`
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400 w-40 shrink-0">\${cls}</span>
            <div class="flex-1 bg-gray-800 rounded-full h-2">
              <div class="\${classColors[cls] || 'bg-gray-600'} h-2 rounded-full transition-all" style="width:\${Math.round(count/maxCount*100)}%"></div>
            </div>
            <span class="text-xs text-gray-300 w-4">\${count}</span>
          </div>
        \`).join('') || '<div class="text-gray-500 text-xs">No data.</div>'
      } catch(e) {
        if (e.response?.status === 401) { clearToken(); checkAuth() }
      }
    }
  `

  return c.html(bridgeShell({ title: 'Classification', activeNav: 'classification', bodyHtml, scriptHtml }))
})

/** GET /checkpoints — System checkpoints screen */
bridgeRouter.get('/checkpoints', (c: Context<BridgeContext>) => {
  const bodyHtml = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-shield-alt text-orange-400"></i>System Checkpoints
          </h1>
          <p class="text-gray-400 text-sm mt-1">Current state of all tracked system components.</p>
        </div>
        <div id="health-badge" class="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-300">Loading...</div>
      </div>

      <!-- Summary row -->
      <div class="grid grid-cols-4 gap-3 text-center">
        <div class="card rounded-lg p-3"><div id="cp-pass" class="text-xl font-bold text-green-400">-</div><div class="text-xs text-gray-400">Pass</div></div>
        <div class="card rounded-lg p-3"><div id="cp-warn" class="text-xl font-bold text-yellow-400">-</div><div class="text-xs text-gray-400">Warning</div></div>
        <div class="card rounded-lg p-3"><div id="cp-fail" class="text-xl font-bold text-red-400">-</div><div class="text-xs text-gray-400">Fail</div></div>
        <div class="card rounded-lg p-3"><div id="cp-unknown" class="text-xl font-bold text-gray-400">-</div><div class="text-xs text-gray-400">Unknown</div></div>
      </div>

      <!-- Checkpoint list -->
      <div id="cp-list" class="space-y-3">
        <div class="text-gray-500 text-sm text-center py-8">Loading...</div>
      </div>
    </div>
  `

  const scriptHtml = `
    async function onAppReady() {
      try {
        const res = await axios.get('/bridge/api/checkpoints', { headers: authHeader() })
        const { checkpoints, summary, overall_health } = res.data.data

        document.getElementById('cp-pass').textContent = summary.pass
        document.getElementById('cp-warn').textContent = summary.warn
        document.getElementById('cp-fail').textContent = summary.fail
        document.getElementById('cp-unknown').textContent = summary.total - summary.pass - summary.warn - summary.fail

        const healthBadge = document.getElementById('health-badge')
        if (overall_health === 'HEALTHY') {
          healthBadge.className = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-green-900 text-green-200'
        } else if (overall_health === 'WARNING') {
          healthBadge.className = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-900 text-yellow-200'
        } else {
          healthBadge.className = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-red-900 text-red-200'
        }
        healthBadge.textContent = overall_health

        const statusColors = { PASS: 'text-green-400', WARN: 'text-yellow-400', FAIL: 'text-red-400', UNKNOWN: 'text-gray-400' }
        const statusIcons = { PASS: 'fa-check-circle', WARN: 'fa-exclamation-triangle', FAIL: 'fa-times-circle', UNKNOWN: 'fa-question-circle' }
        const borderColors = { PASS: 'border-green-800', WARN: 'border-yellow-800', FAIL: 'border-red-800', UNKNOWN: 'border-gray-700' }

        document.getElementById('cp-list').innerHTML = checkpoints.map(cp => \`
          <div class="card rounded-xl p-4 border \${borderColors[cp.status] || 'border-gray-700'}">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <i class="fas \${statusIcons[cp.status]} \${statusColors[cp.status]}"></i>
                  <span class="text-sm font-medium text-white">\${cp.label}</span>
                  <span class="text-xs text-gray-500 font-mono">\${cp.id}</span>
                </div>
                <div class="text-xs text-gray-400">\${cp.system}</div>
                <div class="text-xs text-gray-300 mt-1.5">\${cp.detail}</div>
                \${cp.action_required ? \`
                  <div class="mt-2 text-xs text-yellow-300 bg-yellow-900/30 border border-yellow-800 rounded px-2 py-1.5">
                    <i class="fas fa-exclamation mr-1"></i>Action: \${cp.action_required}
                  </div>
                \` : ''}
              </div>
              <div class="text-xs text-gray-500 shrink-0">\${new Date(cp.last_checked).toLocaleDateString()}</div>
            </div>
          </div>
        \`).join('')
      } catch(e) {
        if (e.response?.status === 401) { clearToken(); checkAuth() }
        document.getElementById('cp-list').innerHTML = '<div class="text-red-400 text-sm text-center py-8">Load failed.</div>'
      }
    }
  `

  return c.html(bridgeShell({ title: 'Checkpoints', activeNav: 'checkpoints', bodyHtml, scriptHtml }))
})

/** GET /boundaries — Module boundaries screen */
bridgeRouter.get('/boundaries', (c: Context<BridgeContext>) => {
  const bodyHtml = `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-map text-orange-400"></i>Module Boundaries
        </h1>
        <p class="text-gray-400 text-sm mt-1">Scope map of all modules — what is active, bounded, frozen, or deferred.</p>
      </div>

      <!-- Scope summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div class="card rounded-lg p-3"><div id="bnd-active" class="text-xl font-bold text-blue-400">-</div><div class="text-xs text-gray-400">Active</div></div>
        <div class="card rounded-lg p-3"><div id="bnd-bounded" class="text-xl font-bold text-purple-400">-</div><div class="text-xs text-gray-400">Bounded</div></div>
        <div class="card rounded-lg p-3"><div id="bnd-frozen" class="text-xl font-bold text-gray-400">-</div><div class="text-xs text-gray-400">Frozen</div></div>
        <div class="card rounded-lg p-3"><div id="bnd-deferred" class="text-xl font-bold text-gray-500">-</div><div class="text-xs text-gray-400">Deferred</div></div>
      </div>

      <!-- Scope note -->
      <div class="card rounded-xl p-4 border border-orange-900">
        <div class="flex items-center gap-2 text-orange-300 text-sm font-medium mb-1">
          <i class="fas fa-exclamation-triangle"></i>Scope Lock — HUB-05
        </div>
        <div class="text-xs text-gray-400">Bridge is bounded to: <strong class="text-white">classify, route, hold, escalate</strong>. Not Chamber. Not Hub. Not BarberKas. Counterpart remains deferred.</div>
      </div>

      <!-- Boundaries list -->
      <div id="boundaries-list" class="space-y-4">
        <div class="text-gray-500 text-sm text-center py-8">Loading...</div>
      </div>
    </div>
  `

  const scriptHtml = `
    const statusBadgeMap = {
      ACTIVE: 'badge-active',
      BOUNDED: 'badge-bounded',
      FROZEN: 'badge-frozen',
      DEFERRED: 'badge-deferred',
    }

    async function onAppReady() {
      try {
        const res = await axios.get('/bridge/api/boundaries', { headers: authHeader() })
        const { boundaries, active, deferred, frozen } = res.data.data

        document.getElementById('bnd-active').textContent = active
        document.getElementById('bnd-bounded').textContent = boundaries.filter(b => b.status === 'BOUNDED').length
        document.getElementById('bnd-frozen').textContent = frozen
        document.getElementById('bnd-deferred').textContent = deferred

        document.getElementById('boundaries-list').innerHTML = boundaries.map(b => \`
          <div class="card rounded-xl p-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-base font-semibold text-white">\${b.module}</span>
                  <span class="px-2 py-0.5 rounded text-xs font-medium \${statusBadgeMap[b.status] || ''}">\${b.status}</span>
                </div>
                <div class="text-xs text-gray-400">\${b.scope_label}</div>
              </div>
              <div class="text-xs text-gray-500 shrink-0">Locked: \${b.session_locked}</div>
            </div>
            <p class="text-xs text-gray-400 mb-3">\${b.note}</p>
            \${b.entry_points.length > 0 ? \`
              <div class="mb-2">
                <div class="text-xs text-gray-500 mb-1.5">Entry Points:</div>
                <div class="flex flex-wrap gap-1.5">
                  \${b.entry_points.map(ep => \`<span class="px-2 py-0.5 bg-gray-800 rounded text-xs text-blue-300 font-mono">\${ep}</span>\`).join('')}
                </div>
              </div>
            \` : ''}
            \${b.out_of_scope.length > 0 ? \`
              <div>
                <div class="text-xs text-gray-500 mb-1.5">Out of Scope:</div>
                <div class="flex flex-wrap gap-1.5">
                  \${b.out_of_scope.map(s => \`<span class="px-2 py-0.5 bg-red-950 rounded text-xs text-red-400">\${s}</span>\`).join('')}
                </div>
              </div>
            \` : ''}
          </div>
        \`).join('')
      } catch(e) {
        if (e.response?.status === 401) { clearToken(); checkAuth() }
        document.getElementById('boundaries-list').innerHTML = '<div class="text-red-400 text-sm text-center py-8">Load failed.</div>'
      }
    }
  `

  return c.html(bridgeShell({ title: 'Boundaries', activeNav: 'boundaries', bodyHtml, scriptHtml }))
})

/** GET /* — catch-all fallback for /bridge/* (unknown sub-paths) */
bridgeRouter.get('/*', (c: Context<BridgeContext>) => {
  return c.html(bridgeShell({
    title: 'Not Found',
    activeNav: 'overview',
    bodyHtml: `
      <div class="text-center py-16">
        <div class="text-5xl mb-4">🌉</div>
        <h2 class="text-xl font-bold text-white mb-2">Bridge Page Not Found</h2>
        <p class="text-gray-400 text-sm mb-6">Path <code class="text-orange-400">${'unknown'}</code> does not exist in Bridge Review Desk.</p>
        <a href="/bridge" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm transition-colors">
          <i class="fas fa-home mr-2"></i>Back to Bridge Overview
        </a>
      </div>
    `,
  }))
})
