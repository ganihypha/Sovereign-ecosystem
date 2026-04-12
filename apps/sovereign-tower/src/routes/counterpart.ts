// sovereign-tower — src/routes/counterpart.ts
// Counterpart Workspace Lite v1 — SESSION HUB-08
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER GOVERNANCE LAYER — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// HUB-08 Scope: Counterpart Workspace Lite v1
//   - Bounded downstream workspace for counterpart visibility
//   - NOT full counterpart activation
//   - NOT Chamber duplicate, NOT Bridge duplicate
//   - Counterpart sees only scoped items and scoped outcomes
//   - Founder sovereignty remains final and cannot be overridden
//
// UI Routes (7 screens):
//   GET /counterpart                 → Overview / workspace summary
//   GET /counterpart/access          → Access level view
//   GET /counterpart/scope           → Scoped work lanes
//   GET /counterpart/checkpoints     → Checkpoint history (bounded)
//   GET /counterpart/contribute      → Contribution desk
//   GET /counterpart/outcomes        → Restricted review outcomes
//   GET /counterpart/boundaries      → Explicit boundary notice
//
// API Routes (9 bounded endpoints):
//   GET  /counterpart/api/summary          → workspace overview cards
//   GET  /counterpart/api/access           → access level + allowed areas
//   GET  /counterpart/api/scope            → scoped work lanes
//   GET  /counterpart/api/checkpoints      → checkpoint history (bounded)
//   GET  /counterpart/api/outcomes         → restricted review outcomes
//   POST /counterpart/api/contributions    → submit contribution
//   GET  /counterpart/api/contributions    → list contributions
//   GET  /counterpart/api/boundaries       → boundary rules
//   GET  /counterpart/api/*               → 404 catch-all
//
// Auth: Reuses existing Hub MASTER_PIN / JWT model.
//       v1 is founder-view simulation rendered under founder-controlled auth.
//       True multi-user counterpart role auth is deferred (stated honestly).
//
// Counterpart Workspace Lite v1 is intentionally DOWNSTREAM of:
//   Hub (continuity) → Chamber (governance) → Bridge (review/routing) → Counterpart (participate)

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { TOWER_BUILD_SESSION, TOWER_APP_VERSION, successResponse, errorResponse } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { verifyJwt } from '@sovereign/auth'

// =============================================================================
// CONSTANTS
// =============================================================================

const COUNTERPART_BUILD_SESSION = 'hub08'
const COUNTERPART_VERSION = '1.0.0'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type CounterpartContext = {
  Bindings: TowerEnv
  Variables: SovereignAuthVariables
}

interface CounterpartProfile {
  id: string
  role_band: string
  access_level: string
  status: string
  registered_since: string
  last_activity: string | null
  boundary_notice: string
}

interface AccessArea {
  area: string
  status: 'ALLOWED' | 'RESTRICTED' | 'BLOCKED'
  reason?: string
}

interface ScopeItem {
  id: string
  lane: string
  type: string
  label: string
  status: 'ACTIVE' | 'PENDING' | 'CLOSED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  allowed_actions: string[]
}

interface CheckpointItem {
  id: string
  session_ref: string
  date: string
  label: string
  status: 'ACCEPTED' | 'HELD' | 'REJECTED' | 'ROUTED' | 'PENDING'
  summary: string
  counterpart_visible: boolean
  note?: string
}

interface ContributionItem {
  id: string
  submitted_at: string
  category: string
  summary: string
  evidence_note?: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'HELD' | 'DECLINED' | 'NEEDS_REVISION'
  outcome_note?: string
}

interface OutcomeItem {
  id: string
  ref: string
  date: string
  type: string
  label: string
  result: 'ACCEPTED' | 'HELD' | 'DECLINED' | 'NEEDS_REVISION'
  explanation: string
  next_step?: string
}

interface BoundaryRule {
  id: string
  area: string
  rule: string
  enforced: boolean
  reason: string
}

// =============================================================================
// STATIC DATA — BOUNDED, HONEST, SCOPED
// =============================================================================

/** Counterpart profile — v1 simulated under founder auth */
const COUNTERPART_PROFILE: CounterpartProfile = {
  id: 'cp-001',
  role_band: 'Counterpart (Lite)',
  access_level: 'RESTRICTED',
  status: 'ACTIVE',
  registered_since: '2026-04-12',
  last_activity: new Date().toISOString(),
  boundary_notice:
    'Counterpart Workspace Lite v1 is a bounded participation layer. Founder sovereignty remains final. All decisions are routed through Hub → Chamber → Bridge before any counterpart visibility is granted.',
}

/** Access areas map */
const ACCESS_AREAS: AccessArea[] = [
  { area: 'Contribution Desk', status: 'ALLOWED', reason: 'Submit ideas, notes, requests, structured updates' },
  { area: 'Checkpoint History (scoped)', status: 'ALLOWED', reason: 'View checkpoints relevant to counterpart scope only' },
  { area: 'Scope Overview', status: 'ALLOWED', reason: 'View current allowed work lanes and contribution types' },
  { area: 'Review Outcomes (restricted)', status: 'ALLOWED', reason: 'View restricted outcomes on counterpart submissions' },
  { area: 'Boundary Notices', status: 'ALLOWED', reason: 'Understand workspace limits and governance layer hierarchy' },
  { area: 'Chamber Operating Console', status: 'RESTRICTED', reason: 'Founder-only governance surface. Not accessible.' },
  { area: 'Bridge Review Desk', status: 'RESTRICTED', reason: 'Founder-only review routing. Not accessible to counterpart.' },
  { area: 'Hub Session Continuity', status: 'RESTRICTED', reason: 'Founder-only session handoff surface. Read-only insight via scoped checkpoints only.' },
  { area: 'Founder Decision Actions', status: 'BLOCKED', reason: 'Approve/reject/hold decisions are founder-exclusive.' },
  { area: 'Governance Canon Full View', status: 'BLOCKED', reason: 'Full governance internals are founder-private.' },
  { area: 'JWT_SECRET / MASTER_PIN', status: 'BLOCKED', reason: 'Secrets never exposed to counterpart layer.' },
  { area: 'Audit Trail Full View', status: 'BLOCKED', reason: 'Full audit trail is founder-private. Only scoped outcomes visible.' },
]

/** Scoped work lanes */
const SCOPE_ITEMS: ScopeItem[] = [
  {
    id: 'SC-001',
    lane: 'Ideation',
    type: 'contribution',
    label: 'Submit New Ideas',
    status: 'ACTIVE',
    priority: 'HIGH',
    description: 'Counterpart may submit new ideas related to agreed scope. Ideas are routed via Bridge for classification.',
    allowed_actions: ['submit', 'track-status', 'view-outcome'],
  },
  {
    id: 'SC-002',
    lane: 'Evidence',
    type: 'contribution',
    label: 'Submit Supporting Evidence',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    description: 'Counterpart may submit evidence notes to support existing proposals or decisions under review.',
    allowed_actions: ['submit', 'attach-note', 'view-outcome'],
  },
  {
    id: 'SC-003',
    lane: 'Requests',
    type: 'contribution',
    label: 'Submit Structured Requests',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    description: 'Counterpart may submit structured requests for access, scope expansion, or review of held items.',
    allowed_actions: ['submit', 'categorize', 'view-status'],
  },
  {
    id: 'SC-004',
    lane: 'Feedback',
    type: 'contribution',
    label: 'Provide Feedback on Outcomes',
    status: 'ACTIVE',
    priority: 'LOW',
    description: 'Counterpart may provide feedback on received outcomes. Feedback is noted, not binding.',
    allowed_actions: ['submit-feedback', 'view-past-feedback'],
  },
  {
    id: 'SC-005',
    lane: 'Governance Override',
    type: 'forbidden',
    label: 'Override Founder Decisions',
    status: 'CLOSED',
    priority: 'LOW',
    description: 'OUT OF SCOPE. Counterpart cannot override, modify, or reclassify founder governance decisions.',
    allowed_actions: [],
  },
  {
    id: 'SC-006',
    lane: 'System Access',
    type: 'forbidden',
    label: 'Access Chamber / Bridge / Hub Internals',
    status: 'CLOSED',
    priority: 'LOW',
    description: 'OUT OF SCOPE. Counterpart cannot access Hub, Chamber, or Bridge internal views directly.',
    allowed_actions: [],
  },
]

/** Checkpoint history — bounded, counterpart-visible items only */
const CHECKPOINT_ITEMS: CheckpointItem[] = [
  {
    id: 'CPC-001',
    session_ref: 'HUB-06',
    date: '2026-04-12',
    label: 'Auth System Unified',
    status: 'ACCEPTED',
    summary: 'Auth canon established (HUB-06). MASTER_PIN confirmed. All governance modules stable. Foundation for counterpart participation secured.',
    counterpart_visible: true,
    note: 'Auth stability is prerequisite for safe counterpart layer construction.',
  },
  {
    id: 'CPC-002',
    session_ref: 'HUB-07',
    date: '2026-04-12',
    label: 'Bridge Review Desk v1.1 Hardened',
    status: 'ACCEPTED',
    summary: 'Bridge v1.1 deployed with /chamber/api/blockers fix, 404 fallback, checkpoint refresh. Governance gate is stable.',
    counterpart_visible: true,
    note: 'Bridge is the gate between governance authority and counterpart participation.',
  },
  {
    id: 'CPC-003',
    session_ref: 'HUB-08',
    date: '2026-04-12',
    label: 'Counterpart Workspace Lite v1 Initiated',
    status: 'PENDING',
    summary: 'SESSION HUB-08 initiated. Counterpart Workspace Lite v1 being constructed under bounded scope.',
    counterpart_visible: true,
    note: 'This is the first session where counterpart layer exists.',
  },
  {
    id: 'CPC-004',
    session_ref: 'HUB-05',
    date: '2026-04-12',
    label: 'Bridge Review Desk v1 Built',
    status: 'ACCEPTED',
    summary: 'Bridge Review Desk v1 deployed — triage, routing, checkpoint, boundary gate operational.',
    counterpart_visible: true,
    note: 'Bridge layer ensures counterpart contributions are properly routed.',
  },
  {
    id: 'CPC-005',
    session_ref: 'HUB-04',
    date: '2026-04-12',
    label: 'Chamber Operating Console v1 Built',
    status: 'ACCEPTED',
    summary: 'Chamber v1 deployed — founder governance operating surface. Counterpart does not access Chamber directly.',
    counterpart_visible: false,
    note: 'Chamber is founder-only. Not visible to counterpart.',
  },
]

/** In-memory contribution store (v1 — honest bounded preview) */
const CONTRIBUTIONS_STORE: ContributionItem[] = [
  {
    id: 'CTB-001',
    submitted_at: '2026-04-12T10:00:00.000Z',
    category: 'idea',
    summary: 'Proposal: Tambahkan dashboard ringkasan untuk counterpart melihat progress scope kerja',
    evidence_note: 'Berdasarkan kebutuhan visibilitas tanpa akses Chamber/Bridge penuh.',
    status: 'UNDER_REVIEW',
    outcome_note: 'Dalam review — Bridge classification pending.',
  },
]

let _contributionCounter = CONTRIBUTIONS_STORE.length + 1

/** Review outcomes — restricted, scoped to counterpart */
const OUTCOME_ITEMS: OutcomeItem[] = [
  {
    id: 'OUT-001',
    ref: 'CTB-001',
    date: '2026-04-12',
    type: 'contribution-review',
    label: 'Review: Proposal Dashboard Counterpart',
    result: 'HELD',
    explanation: 'Proposal di-hold untuk review lebih lanjut di session berikutnya. Tidak ditolak — butuh konteks lebih.',
    next_step: 'Counterpart diminta melengkapi evidence note dan resubmit di sesi berikutnya.',
  },
]

/** Boundary rules */
const BOUNDARY_RULES: BoundaryRule[] = [
  {
    id: 'BND-001',
    area: 'Authority',
    rule: 'Counterpart TIDAK dapat override keputusan Founder',
    enforced: true,
    reason: 'Founder sovereignty adalah final. Semua keputusan governance tetap di tangan founder.',
  },
  {
    id: 'BND-002',
    area: 'Access',
    rule: 'Counterpart TIDAK dapat mengakses Hub, Chamber, atau Bridge secara langsung',
    enforced: true,
    reason: 'Ketiga modul tersebut adalah founder-only governance layer. Counterpart hanya memiliki bounded downstream view.',
  },
  {
    id: 'BND-003',
    area: 'Secrets',
    rule: 'JWT_SECRET dan MASTER_PIN TIDAK pernah terekspos ke counterpart layer',
    enforced: true,
    reason: 'Auth secrets adalah founder-exclusive. Counterpart menggunakan bounded auth simulation v1.',
  },
  {
    id: 'BND-004',
    area: 'Decisions',
    rule: 'Counterpart TIDAK dapat approve, reject, atau hold keputusan governance',
    enforced: true,
    reason: 'Decision authority adalah fungsi Chamber yang hanya founder yang bisa operasikan.',
  },
  {
    id: 'BND-005',
    area: 'Reclassification',
    rule: 'Counterpart TIDAK dapat mereklasifikasi item di Bridge atau Chamber',
    enforced: true,
    reason: 'Klasifikasi adalah Bridge function. Counterpart hanya bisa submit — tidak classify.',
  },
  {
    id: 'BND-006',
    area: 'Audit',
    rule: 'Counterpart hanya melihat outcome terbatas — bukan audit trail penuh',
    enforced: true,
    reason: 'Full audit trail adalah founder-private. Counterpart hanya menerima scoped outcome summary.',
  },
  {
    id: 'BND-007',
    area: 'Expansion',
    rule: 'Counterpart tidak dapat mengekspansi scope sendiri — harus melalui permintaan formal',
    enforced: true,
    reason: 'Scope expansion harus di-review di Bridge dan di-approve di Chamber sebelum berlaku.',
  },
  {
    id: 'BND-008',
    area: 'Auth Model',
    rule: 'v1 berjalan sebagai bounded preview di bawah founder-controlled auth — bukan multi-user auth penuh',
    enforced: true,
    reason: 'True counterpart role auth belum diimplementasi. v1 dinyatakan jujur sebagai founder-view simulation.',
  },
]

// =============================================================================
// HELPER — AUTH GATE FOR COUNTERPART UI PAGES
// Reuses Hub auth model (MASTER_PIN / JWT)
// Returns: { authed: boolean, token: string | null }
// =============================================================================

async function checkCounterpartAuth(c: Context<CounterpartContext>): Promise<{ authed: boolean; token: string | null }> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authed: false, token: null }
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (!payload || payload.role !== 'founder') return { authed: false, token: null }
    return { authed: true, token }
  } catch {
    return { authed: false, token: null }
  }
}

async function requireFounderAuth(c: Context<CounterpartContext>): Promise<string | null> {
  const { authed, token } = await checkCounterpartAuth(c)
  return authed ? token : null
}

// =============================================================================
// ROUTER
// =============================================================================

export const counterpartRouter = new Hono<CounterpartContext>()

// =============================================================================
// API ROUTES — 9 bounded endpoints
// Auth: JWT + founderOnly enforced at app.ts level for /counterpart/api/*
// =============================================================================

/**
 * GET /counterpart/api/summary
 * Workspace overview cards — total contributions, access level, scope summary
 */
counterpartRouter.get('/api/summary', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const activeScopes = SCOPE_ITEMS.filter(s => s.status === 'ACTIVE').length
  const closedScopes = SCOPE_ITEMS.filter(s => s.status === 'CLOSED').length
  const totalContributions = CONTRIBUTIONS_STORE.length
  const submittedContributions = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'SUBMITTED').length
  const underReview = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'UNDER_REVIEW').length
  const acceptedContributions = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'ACCEPTED').length
  const allowedAreas = ACCESS_AREAS.filter(a => a.status === 'ALLOWED').length
  const restrictedAreas = ACCESS_AREAS.filter(a => a.status !== 'ALLOWED').length
  const visibleCheckpoints = CHECKPOINT_ITEMS.filter(cp => cp.counterpart_visible).length
  const pendingCheckpoints = CHECKPOINT_ITEMS.filter(cp => cp.status === 'PENDING' && cp.counterpart_visible).length

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    version: COUNTERPART_VERSION,
    profile: COUNTERPART_PROFILE,
    summary_cards: [
      {
        id: 'card-access',
        label: 'Access Level',
        value: COUNTERPART_PROFILE.access_level,
        sub: `${allowedAreas} allowed / ${restrictedAreas} restricted`,
        status: 'info',
      },
      {
        id: 'card-scope',
        label: 'Active Scope Lanes',
        value: String(activeScopes),
        sub: `${closedScopes} out-of-scope lanes`,
        status: 'active',
      },
      {
        id: 'card-contributions',
        label: 'Total Contributions',
        value: String(totalContributions),
        sub: `${submittedContributions} submitted · ${underReview} in review · ${acceptedContributions} accepted`,
        status: totalContributions > 0 ? 'active' : 'empty',
      },
      {
        id: 'card-checkpoints',
        label: 'Visible Checkpoints',
        value: String(visibleCheckpoints),
        sub: `${pendingCheckpoints} pending outcome`,
        status: 'info',
      },
      {
        id: 'card-boundary',
        label: 'Boundary Status',
        value: 'ENFORCED',
        sub: `${BOUNDARY_RULES.length} active boundary rules`,
        status: 'warning',
      },
    ],
    boundary_notice: COUNTERPART_PROFILE.boundary_notice,
    governance_note:
      'v1 berjalan di bawah founder-controlled auth. True multi-user counterpart auth deferred ke versi berikutnya.',
  }))
})

/**
 * GET /counterpart/api/access
 * Access level view — allowed areas + restricted areas
 */
counterpartRouter.get('/api/access', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const allowed = ACCESS_AREAS.filter(a => a.status === 'ALLOWED')
  const restricted = ACCESS_AREAS.filter(a => a.status === 'RESTRICTED')
  const blocked = ACCESS_AREAS.filter(a => a.status === 'BLOCKED')

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    profile: {
      role_band: COUNTERPART_PROFILE.role_band,
      access_level: COUNTERPART_PROFILE.access_level,
      status: COUNTERPART_PROFILE.status,
    },
    access_summary: {
      total: ACCESS_AREAS.length,
      allowed: allowed.length,
      restricted: restricted.length,
      blocked: blocked.length,
    },
    allowed_areas: allowed,
    restricted_areas: restricted,
    blocked_areas: blocked,
    escalation_note:
      'Untuk request akses ke area terbatas, gunakan Contribution Desk dengan kategori "request" dan sertakan justifikasi jelas.',
    earned_access_reminder:
      'Akses counterpart bersifat earned — dimulai dari minimal (Lite v1) dan dapat berkembang berdasarkan kontribusi yang terverifikasi melalui Bridge → Chamber review.',
  }))
})

/**
 * GET /counterpart/api/scope
 * Scoped work lanes + allowed contribution types
 */
counterpartRouter.get('/api/scope', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const activeItems = SCOPE_ITEMS.filter(s => s.status === 'ACTIVE')
  const forbiddenItems = SCOPE_ITEMS.filter(s => s.status === 'CLOSED')

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    scope_summary: {
      total: SCOPE_ITEMS.length,
      active: activeItems.length,
      out_of_scope: forbiddenItems.length,
    },
    active_lanes: activeItems,
    out_of_scope: forbiddenItems,
    contribution_types: ['idea', 'evidence', 'request', 'feedback', 'update'],
    out_of_scope_notice:
      'Lane dengan status CLOSED adalah di luar batas counterpart v1. Mengakses atau mencoba operasi pada lane ini tidak diizinkan.',
    scope_expansion_path:
      'Untuk ekspansi scope, submit "request" via Contribution Desk → Bridge akan mereview → Chamber akan memutuskan.',
  }))
})

/**
 * GET /counterpart/api/checkpoints
 * Checkpoint history — bounded, counterpart-visible only
 */
counterpartRouter.get('/api/checkpoints', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const sessionFilter = c.req.query('session')
  const statusFilter = c.req.query('status')

  let items = CHECKPOINT_ITEMS.filter(cp => cp.counterpart_visible)
  if (sessionFilter) items = items.filter(cp => cp.session_ref === sessionFilter)
  if (statusFilter) items = items.filter(cp => cp.status === statusFilter.toUpperCase())

  const total = items.length
  const accepted = items.filter(cp => cp.status === 'ACCEPTED').length
  const pending = items.filter(cp => cp.status === 'PENDING').length
  const held = items.filter(cp => cp.status === 'HELD').length

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    total,
    accepted,
    pending,
    held,
    items: items.map(cp => ({
      id: cp.id,
      session_ref: cp.session_ref,
      date: cp.date,
      label: cp.label,
      status: cp.status,
      summary: cp.summary,
      note: cp.note,
    })),
    boundary_note:
      'Hanya checkpoint yang diizinkan untuk counterpart visibility yang ditampilkan. Checkpoint founder-private tidak termasuk.',
  }))
})

/**
 * GET /counterpart/api/outcomes
 * Restricted review outcomes — minimal explanation + next step
 */
counterpartRouter.get('/api/outcomes', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const resultFilter = c.req.query('result')
  let items = [...OUTCOME_ITEMS]
  if (resultFilter) items = items.filter(o => o.result === resultFilter.toUpperCase())

  const accepted = OUTCOME_ITEMS.filter(o => o.result === 'ACCEPTED').length
  const held = OUTCOME_ITEMS.filter(o => o.result === 'HELD').length
  const declined = OUTCOME_ITEMS.filter(o => o.result === 'DECLINED').length
  const needsRevision = OUTCOME_ITEMS.filter(o => o.result === 'NEEDS_REVISION').length

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    total: OUTCOME_ITEMS.length,
    accepted,
    held,
    declined,
    needs_revision: needsRevision,
    outcomes: items,
    boundary_note:
      'Hanya outcome yang relevan dengan kontribusi counterpart yang ditampilkan. Keputusan governance internal founder tidak termasuk.',
  }))
})

/**
 * POST /counterpart/api/contributions
 * Submit a new contribution (idea / evidence / request / feedback / update)
 */
counterpartRouter.post('/api/contributions', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  let body: { category?: string; summary?: string; evidence_note?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body harus JSON dengan field: category, summary, evidence_note (optional).'), 400)
  }

  const { category, summary, evidence_note } = body
  const validCategories = ['idea', 'evidence', 'request', 'feedback', 'update']

  if (!category || !validCategories.includes(category)) {
    return c.json(errorResponse(
      'INVALID_CATEGORY',
      `Category wajib diisi dan harus salah satu dari: ${validCategories.join(', ')}`
    ), 400)
  }

  if (!summary || summary.trim().length < 10) {
    return c.json(errorResponse('INVALID_SUMMARY', 'Summary wajib diisi (minimal 10 karakter).'), 400)
  }

  if (summary.trim().length > 1000) {
    return c.json(errorResponse('SUMMARY_TOO_LONG', 'Summary maksimal 1000 karakter.'), 400)
  }

  const newContribution: ContributionItem = {
    id: `CTB-${String(_contributionCounter++).padStart(3, '0')}`,
    submitted_at: new Date().toISOString(),
    category,
    summary: summary.trim(),
    evidence_note: evidence_note?.trim() || undefined,
    status: 'SUBMITTED',
  }

  CONTRIBUTIONS_STORE.push(newContribution)

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    contribution: newContribution,
    routing_note: 'Kontribusi telah diterima dan akan di-route melalui Bridge untuk klasifikasi. Founder akan mereview di Chamber.',
    boundary_reminder:
      'Kontribusi adalah input — bukan keputusan. Semua keputusan tetap di tangan founder melalui Chamber.',
    estimated_visibility: 'Status update akan tersedia di GET /counterpart/api/contributions',
  }), 201)
})

/**
 * GET /counterpart/api/contributions
 * List all contributions with status
 */
counterpartRouter.get('/api/contributions', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const categoryFilter = c.req.query('category')
  const statusFilter = c.req.query('status')

  let items = [...CONTRIBUTIONS_STORE]
  if (categoryFilter) items = items.filter(ct => ct.category === categoryFilter)
  if (statusFilter) items = items.filter(ct => ct.status === statusFilter.toUpperCase())

  const submitted = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'SUBMITTED').length
  const underReview = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'UNDER_REVIEW').length
  const accepted = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'ACCEPTED').length
  const held = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'HELD').length
  const declined = CONTRIBUTIONS_STORE.filter(ct => ct.status === 'DECLINED').length

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    total: CONTRIBUTIONS_STORE.length,
    submitted,
    under_review: underReview,
    accepted,
    held,
    declined,
    items: items.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
  }))
})

/**
 * GET /counterpart/api/boundaries
 * Explicit boundary rules for counterpart workspace
 */
counterpartRouter.get('/api/boundaries', async (c: Context<CounterpartContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  return c.json(successResponse({
    session: COUNTERPART_BUILD_SESSION,
    version: COUNTERPART_VERSION,
    total_rules: BOUNDARY_RULES.length,
    enforced_rules: BOUNDARY_RULES.filter(b => b.enforced).length,
    boundaries: BOUNDARY_RULES,
    governance_hierarchy: [
      { layer: 'Hub', role: 'Session continuity + handoff', access: 'Founder only' },
      { layer: 'Chamber', role: 'Governance operating console', access: 'Founder only' },
      { layer: 'Bridge', role: 'Review + routing + checkpoint gate', access: 'Founder only' },
      {
        layer: 'Counterpart Workspace Lite',
        role: 'Bounded contribution + participation',
        access: 'Counterpart (restricted, earned)',
      },
    ],
    why_lite: [
      'Counterpart access starts minimal and is earned through verified contributions',
      'v1 is a bounded preview under founder-controlled auth',
      'True multi-user auth for counterpart is deferred to future sessions',
      'Founder sovereignty must remain unambiguous before counterpart expands',
    ],
  }))
})

/**
 * GET /counterpart/api/* — catch-all 404 for unknown /counterpart/api/* paths
 * HUB-08: Prevents empty 200 body response (consistent with bridge.ts pattern)
 */
counterpartRouter.get('/api/*', (c: Context<CounterpartContext>) => {
  return c.json(errorResponse(
    'COUNTERPART_ROUTE_NOT_FOUND',
    `Counterpart API route '${c.req.path}' not found. Available: GET /counterpart/api/summary, /access, /scope, /checkpoints, /outcomes, /contributions, /boundaries | POST /counterpart/api/contributions`,
  ), 404)
})

// =============================================================================
// UI LAYOUT HELPER
// =============================================================================

function counterpartLayout({
  title,
  activeNav,
  content,
}: {
  title: string
  activeNav: string
  content: string
}): string {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'fa-home', path: '/counterpart' },
    { id: 'access', label: 'Access', icon: 'fa-key', path: '/counterpart/access' },
    { id: 'scope', label: 'Scope', icon: 'fa-list-check', path: '/counterpart/scope' },
    { id: 'checkpoints', label: 'Checkpoints', icon: 'fa-flag-checkered', path: '/counterpart/checkpoints' },
    { id: 'contribute', label: 'Contribute', icon: 'fa-paper-plane', path: '/counterpart/contribute' },
    { id: 'outcomes', label: 'Outcomes', icon: 'fa-circle-check', path: '/counterpart/outcomes' },
    { id: 'boundaries', label: 'Boundaries', icon: 'fa-shield-halved', path: '/counterpart/boundaries' },
  ]

  const navHtml = navItems
    .map(item => {
      const isActive = activeNav === item.id
      return `
      <a href="${item.path}" data-nav="${item.id}"
         class="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
           isActive
             ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
             : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
         }">
        <i class="fas ${item.icon} w-4 text-center ${isActive ? 'text-emerald-400' : 'text-gray-500'}"></i>
        ${item.label}
      </a>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Counterpart Workspace</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e1a; color: #e2e8f0; display: flex; flex-direction: column; min-height: 100vh; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a1f2e; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
    .auth-overlay { position: fixed; inset: 0; background: #0a0e1a; display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .auth-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 2rem; width: 100%; max-width: 360px; }
    .badge-restricted { display: inline-flex; align-items: center; gap: 4px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-allowed { display: inline-flex; align-items: center; gap: 4px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-blocked { display: inline-flex; align-items: center; gap: 4px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 1.25rem; }
    .btn-primary { background: #059669; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #047857; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .tag-accepted { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .tag-pending { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .tag-held { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .tag-rejected,.tag-declined,.tag-blocked { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .tag-routed,.tag-submitted,.tag-under_review { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .boundary-banner { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; padding: 0.75rem 1rem; }
    .skeleton { background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; height: 16px; margin-bottom: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  </style>
</head>
<body>

<!-- AUTH OVERLAY -->
<div id="auth-overlay" class="auth-overlay">
  <div class="auth-card">
    <div style="text-align:center; margin-bottom:1.5rem;">
      <div style="font-size:2rem; margin-bottom:0.5rem;">🤝</div>
      <h2 style="font-size:1.1rem; font-weight:700; color:#e2e8f0;">Counterpart Workspace</h2>
      <p style="font-size:12px; color:#6b7280; margin-top:0.25rem;">Bounded Participation Layer</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-size:12px; color:#9ca3af; display:block; margin-bottom:6px;">Master PIN</label>
      <input id="pin-input" type="password" placeholder="Masukkan MASTER_PIN..."
        style="width:100%; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:0.6rem 0.75rem; font-size:14px; color:#e2e8f0; outline:none;"
        onkeydown="if(event.key==='Enter') doExchange()">
    </div>
    <div id="auth-error" style="font-size:12px; color:#f87171; margin-bottom:0.75rem; display:none;"></div>
    <button onclick="doExchange()" id="pin-btn" class="btn-primary" style="width:100%;">
      <i class="fas fa-right-to-bracket"></i> Akses Workspace
    </button>
    <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #1f2937; text-align:center;">
      <p style="font-size:11px; color:#4b5563;">
        <i class="fas fa-shield-halved" style="color:#6b7280;"></i>
        Counterpart Workspace Lite v${COUNTERPART_VERSION} · SESSION HUB-08
      </p>
    </div>
  </div>
</div>

<!-- MAIN LAYOUT -->
<div id="main-app" style="display:none; flex:1; display:none; flex-direction:column; height:100vh; overflow:hidden;">
  <!-- TOPBAR -->
  <div style="background:#111827; border-bottom:1px solid #1f2937; padding:0 1.25rem; height:52px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <span style="font-size:1.1rem;">🤝</span>
      <span style="font-weight:700; font-size:14px; color:#e2e8f0;">Counterpart Workspace</span>
      <span style="font-size:11px; color:#6b7280;">v${COUNTERPART_VERSION} · HUB-08</span>
      <span class="badge-restricted" style="margin-left:4px;"><i class="fas fa-shield-halved"></i> LITE</span>
    </div>
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <span id="topbar-status" style="font-size:11px; color:#34d399;"><i class="fas fa-circle" style="font-size:8px;"></i> Bounded</span>
      <div style="display:flex; gap:0.5rem; font-size:11px; color:#6b7280;">
        <a href="/hub" style="color:#6b7280; text-decoration:none; hover:color:#9ca3af;">Hub</a>
        <span>·</span>
        <a href="/bridge" style="color:#6b7280; text-decoration:none;">Bridge</a>
      </div>
      <button onclick="doLogout()" style="background:none; border:1px solid #374151; color:#9ca3af; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer;">
        <i class="fas fa-right-from-bracket"></i>
      </button>
    </div>
  </div>

  <!-- BODY: SIDEBAR + CONTENT -->
  <div style="display:flex; flex:1; overflow:hidden;">
    <!-- SIDEBAR -->
    <div style="width:200px; background:#0d1117; border-right:1px solid #1f2937; display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; padding:1rem 0.75rem;">
      <nav style="display:flex; flex-direction:column; gap:2px;">
        ${navHtml}
      </nav>
      <div style="margin-top:auto; padding-top:1rem; border-top:1px solid #1f2937;">
        <div style="font-size:10px; color:#4b5563; line-height:1.5; text-align:center;">
          <div style="color:#6b7280; margin-bottom:2px;">Governance Hierarchy</div>
          <div>Hub → Chamber → Bridge</div>
          <div style="color:#34d399;">↓ Counterpart (Lite)</div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div style="flex:1; overflow-y:auto; padding:1.5rem;">
      <div id="page-content">
        ${content}
      </div>
    </div>
  </div>
</div>

<script>
const TOKEN_KEY = 'hub_jwt'
let _token = ''

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || ''
}

function doLogout() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
  window.location.reload()
}

async function doExchange() {
  const pin = document.getElementById('pin-input').value.trim()
  const errEl = document.getElementById('auth-error')
  const btn = document.getElementById('pin-btn')
  if (!pin) { errEl.textContent = 'PIN wajib diisi.'; errEl.style.display='block'; return; }
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memverifikasi...'
  try {
    const res = await axios.post('/api/hub/auth/exchange', { pin })
    if (res.data?.data?.token) {
      sessionStorage.setItem(TOKEN_KEY, res.data.data.token)
      _token = res.data.data.token
      document.getElementById('auth-overlay').style.display = 'none'
      document.getElementById('main-app').style.display = 'flex'
      document.getElementById('main-app').style.flexDirection = 'column'
      if (typeof window.onCounterpartReady === 'function') window.onCounterpartReady(_token)
    } else {
      errEl.textContent = res.data?.error?.message || 'PIN tidak valid.'
      errEl.style.display = 'block'
    }
  } catch (e) {
    errEl.textContent = e.response?.data?.error?.message || 'Gagal menghubungi server.'
    errEl.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Akses Workspace'
  }
}

function authHeader() { return { Authorization: 'Bearer ' + _token } }

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return iso }
}

function tagHtml(status) {
  const s = (status||'').toLowerCase()
  const cls = {
    accepted:'tag-accepted', pass:'tag-accepted', allowed:'tag-allowed',
    pending:'tag-pending', warn:'tag-pending', submitted:'tag-submitted',
    held:'tag-held', routed:'tag-routed', under_review:'tag-under_review',
    rejected:'tag-rejected', blocked:'tag-blocked', declined:'tag-rejected', needs_revision:'tag-pending',
  }[s] || 'tag-pending'
  return \`<span class="\${cls}">\${status}</span>\`
}

;(function() {
  const saved = getToken()
  if (saved) {
    _token = saved
    document.getElementById('auth-overlay').style.display = 'none'
    document.getElementById('main-app').style.display = 'flex'
    document.getElementById('main-app').style.flexDirection = 'column'
    setTimeout(() => { if (typeof window.onCounterpartReady === 'function') window.onCounterpartReady(_token) }, 100)
  }
})()
</script>
</body>
</html>`
}

// =============================================================================
// UI ROUTES — 7 screens
// =============================================================================

/**
 * GET /counterpart — Overview / workspace summary
 */
counterpartRouter.get('/', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <!-- Header -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:0.5rem;">
        <i class="fas fa-home" style="color:#10b981;"></i> Counterpart Workspace
      </h1>
      <p style="color:#6b7280; font-size:13px; margin-top:2px;">Bounded participation layer — Lite v${COUNTERPART_VERSION}</p>
    </div>
    <div class="boundary-banner" style="max-width:380px;">
      <p style="font-size:11px; color:#fbbf24; font-weight:600;"><i class="fas fa-triangle-exclamation"></i> BOUNDARY NOTICE</p>
      <p style="font-size:11px; color:#9ca3af; margin-top:2px;">Workspace ini adalah layer partisipasi terbatas. Founder sovereignty tetap final. Semua keputusan diputuskan melalui Hub → Chamber → Bridge sebelum counterpart mendapat visibilitas.</p>
    </div>
  </div>

  <!-- Summary Cards -->
  <div id="summary-cards" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem;">
    <div class="skeleton" style="height:90px;"></div>
    <div class="skeleton" style="height:90px;"></div>
    <div class="skeleton" style="height:90px;"></div>
    <div class="skeleton" style="height:90px;"></div>
    <div class="skeleton" style="height:90px;"></div>
  </div>

  <!-- Profile Info -->
  <div class="card" id="profile-card">
    <div style="font-size:12px; font-weight:600; color:#6b7280; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Profile</div>
    <div class="skeleton"></div>
    <div class="skeleton" style="width:70%;"></div>
  </div>

  <!-- Governance Notice -->
  <div class="card" style="border-color:#1e3a5f;">
    <div style="font-size:12px; font-weight:600; color:#60a5fa; margin-bottom:0.75rem;"><i class="fas fa-sitemap"></i> GOVERNANCE HIERARCHY</div>
    <div style="display:flex; gap:0.5rem; align-items:center; font-size:12px; color:#9ca3af; flex-wrap:wrap;">
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;">
        <i class="fas fa-circle-nodes" style="color:#818cf8;"></i> Hub <span style="color:#4b5563;">(Continuity)</span>
      </div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;">
        <i class="fas fa-landmark" style="color:#818cf8;"></i> Chamber <span style="color:#4b5563;">(Governance)</span>
      </div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;">
        <i class="fas fa-bridge" style="color:#f97316;"></i> Bridge <span style="color:#4b5563;">(Review Gate)</span>
      </div>
      <i class="fas fa-arrow-down" style="color:#374151;"></i>
      <div style="background:rgba(16,185,129,0.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(16,185,129,0.3);">
        <i class="fas fa-handshake" style="color:#10b981;"></i> <strong style="color:#34d399;">Counterpart</strong> <span style="color:#4b5563;">(Participate)</span>
      </div>
    </div>
    <p style="font-size:11px; color:#4b5563; margin-top:0.75rem;">Counterpart adalah layer paling downstream. Counterpart berpartisipasi — tidak memerintah.</p>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/summary', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { summary_cards, profile, boundary_notice, governance_note } = d.data

    // Render summary cards
    document.getElementById('summary-cards').innerHTML = summary_cards.map(card => {
      const statusColor = { info:'#818cf8', active:'#10b981', empty:'#6b7280', warning:'#f59e0b' }[card.status] || '#818cf8'
      return \`<div class="card" style="border-color:rgba(\${statusColor==='#10b981'?'16,185,129':statusColor==='#818cf8'?'129,140,248':statusColor==='#f59e0b'?'245,158,11':'107,114,128'},.3);">
        <div style="font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:.5rem;">\${card.label}</div>
        <div style="font-size:1.5rem; font-weight:700; color:\${statusColor}; margin-bottom:.25rem;">\${card.value}</div>
        <div style="font-size:11px; color:#4b5563;">\${card.sub}</div>
      </div>\`
    }).join('')

    // Render profile
    document.getElementById('profile-card').innerHTML = \`
      <div style="font-size:12px; font-weight:600; color:#6b7280; margin-bottom:.75rem; text-transform:uppercase;">Profile</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:.5rem; font-size:12px;">
        <div><span style="color:#6b7280;">Role Band:</span> <span style="color:#e2e8f0; font-weight:600;">\${profile.role_band}</span></div>
        <div><span style="color:#6b7280;">Access Level:</span> \${tagHtml(profile.access_level)}</div>
        <div><span style="color:#6b7280;">Status:</span> \${tagHtml(profile.status)}</div>
        <div><span style="color:#6b7280;">Since:</span> <span style="color:#9ca3af;">\${profile.registered_since}</span></div>
      </div>
      <div style="margin-top:.75rem; font-size:11px; color:#6b7280; background:#0d1117; padding:.5rem .75rem; border-radius:6px; border-left:2px solid #374151;">
        \${governance_note}
      </div>
    \`
  } catch(e) {
    document.getElementById('summary-cards').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Overview', activeNav: 'overview', content }))
})

/**
 * GET /counterpart/access — Access level view
 */
counterpartRouter.get('/access', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-key" style="color:#10b981;"></i> Access Level
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Area yang diizinkan, dibatasi, dan diblokir untuk counterpart</p>
  </div>

  <div id="access-summary" style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
  </div>

  <div id="access-sections" class="space-y-4">
    <div class="skeleton" style="height:120px;"></div>
  </div>

  <div class="card" style="border-color:rgba(16,185,129,.2);">
    <p style="font-size:12px; color:#34d399; font-weight:600; margin-bottom:.5rem;"><i class="fas fa-stairs"></i> EARNED ACCESS REMINDER</p>
    <p style="font-size:12px; color:#9ca3af;">Akses counterpart bersifat earned. Dimulai dari Lite v1 dan dapat berkembang berdasarkan kontribusi yang terverifikasi melalui Bridge → Chamber review. Submit kontribusi berkualitas untuk meningkatkan access band secara bertahap.</p>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/access', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { access_summary, allowed_areas, restricted_areas, blocked_areas } = d.data

    document.getElementById('access-summary').innerHTML = \`
      <div class="card" style="border-color:rgba(16,185,129,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">ALLOWED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#10b981;">\${access_summary.allowed}</div>
      </div>
      <div class="card" style="border-color:rgba(245,158,11,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">RESTRICTED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#f59e0b;">\${access_summary.restricted}</div>
      </div>
      <div class="card" style="border-color:rgba(239,68,68,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">BLOCKED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#ef4444;">\${access_summary.blocked}</div>
      </div>
    \`

    const renderArea = (areas, cls) => areas.map(a => \`
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; padding:.6rem 0; border-bottom:1px solid #1f2937;">
        <div>
          <div style="font-size:13px; color:#e2e8f0; font-weight:500;">\${a.area}</div>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">\${a.reason || ''}</div>
        </div>
        <span class="badge-\${cls}" style="flex-shrink:0;">\${a.status}</span>
      </div>
    \`).join('')

    document.getElementById('access-sections').innerHTML = \`
      <div class="card">
        <div style="font-size:12px; font-weight:700; color:#34d399; text-transform:uppercase; margin-bottom:.75rem;"><i class="fas fa-check-circle"></i> AREA YANG DIIZINKAN</div>
        \${renderArea(allowed_areas, 'allowed')}
      </div>
      <div class="card">
        <div style="font-size:12px; font-weight:700; color:#fbbf24; text-transform:uppercase; margin-bottom:.75rem;"><i class="fas fa-lock"></i> AREA TERBATAS</div>
        \${renderArea(restricted_areas, 'restricted')}
      </div>
      <div class="card">
        <div style="font-size:12px; font-weight:700; color:#f87171; text-transform:uppercase; margin-bottom:.75rem;"><i class="fas fa-ban"></i> AREA DIBLOKIR</div>
        \${renderArea(blocked_areas, 'blocked')}
      </div>
    \`
  } catch(e) {
    document.getElementById('access-sections').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Access Level', activeNav: 'access', content }))
})

/**
 * GET /counterpart/scope — Scoped work lanes
 */
counterpartRouter.get('/scope', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-list-check" style="color:#10b981;"></i> Scope Kerja
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Lane kerja aktif dan tipe kontribusi yang diizinkan</p>
  </div>

  <div id="scope-content" class="space-y-4">
    <div class="skeleton" style="height:150px;"></div>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/scope', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { scope_summary, active_lanes, out_of_scope, contribution_types, out_of_scope_notice, scope_expansion_path } = d.data

    const priorityColor = { HIGH:'#f87171', MEDIUM:'#fbbf24', LOW:'#6b7280' }

    document.getElementById('scope-content').innerHTML = \`
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
        <div class="card" style="border-color:rgba(16,185,129,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">ACTIVE LANES</div>
          <div style="font-size:1.8rem; font-weight:700; color:#10b981;">\${scope_summary.active}</div>
        </div>
        <div class="card" style="border-color:rgba(239,68,68,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">OUT OF SCOPE</div>
          <div style="font-size:1.8rem; font-weight:700; color:#ef4444;">\${scope_summary.out_of_scope}</div>
        </div>
        <div class="card" style="border-color:rgba(129,140,248,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">CONTRIBUTION TYPES</div>
          <div style="font-size:1.8rem; font-weight:700; color:#818cf8;">\${contribution_types.length}</div>
        </div>
      </div>

      <div class="card">
        <div style="font-size:12px; font-weight:600; color:#34d399; text-transform:uppercase; margin-bottom:.75rem;"><i class="fas fa-check"></i> ACTIVE LANES</div>
        \${active_lanes.map(lane => \`
          <div style="border:1px solid #1f2937; border-radius:8px; padding:.75rem 1rem; margin-bottom:.5rem; background:#0d1117;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:.4rem;">
              <div style="font-weight:600; font-size:13px; color:#e2e8f0;">\${lane.label}</div>
              <div style="display:flex; gap:.4rem; align-items:center;">
                <span style="font-size:10px; color:\${priorityColor[lane.priority]}; background:rgba(0,0,0,.3); padding:2px 6px; border-radius:4px;">\${lane.priority}</span>
                \${tagHtml(lane.status)}
              </div>
            </div>
            <div style="font-size:12px; color:#9ca3af; margin-bottom:.5rem;">\${lane.description}</div>
            <div style="display:flex; gap:.4rem; flex-wrap:wrap;">
              \${lane.allowed_actions.map(a => \`<span style="background:#1f2937; color:#6b7280; font-size:10px; padding:2px 8px; border-radius:4px;">\${a}</span>\`).join('')}
            </div>
          </div>
        \`).join('')}
      </div>

      <div class="card">
        <div style="font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; margin-bottom:.5rem;"><i class="fas fa-ban"></i> TIPE KONTRIBUSI YANG DIIZINKAN</div>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap;">
          \${contribution_types.map(t => \`<span style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; font-size:12px; padding:4px 12px; border-radius:6px;">\${t}</span>\`).join('')}
        </div>
      </div>

      <div class="card" style="border-color:rgba(239,68,68,.2);">
        <div style="font-size:12px; font-weight:600; color:#f87171; margin-bottom:.5rem;"><i class="fas fa-circle-xmark"></i> OUT OF SCOPE NOTICE</div>
        <p style="font-size:12px; color:#9ca3af;">\${out_of_scope_notice}</p>
        <div style="margin-top:.5rem; font-size:11px; color:#6b7280; border-top:1px solid #1f2937; padding-top:.5rem;">
          <strong>Path Ekspansi Scope:</strong> \${scope_expansion_path}
        </div>
      </div>
    \`
  } catch(e) {
    document.getElementById('scope-content').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Scope Kerja', activeNav: 'scope', content }))
})

/**
 * GET /counterpart/checkpoints — Checkpoint history (bounded)
 */
counterpartRouter.get('/checkpoints', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-flag-checkered" style="color:#10b981;"></i> Checkpoint History
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Checkpoint yang relevan dengan scope counterpart</p>
  </div>

  <div class="boundary-banner">
    <p style="font-size:11px; color:#fbbf24;"><i class="fas fa-eye-slash"></i> Hanya checkpoint yang diizinkan untuk counterpart visibility yang ditampilkan. Checkpoint founder-private tidak termasuk.</p>
  </div>

  <div id="checkpoint-stats" style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
  </div>

  <div id="checkpoint-list" class="space-y-3">
    <div class="skeleton" style="height:100px;"></div>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/checkpoints', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { total, accepted, pending, held, items } = d.data

    document.getElementById('checkpoint-stats').innerHTML = \`
      <div class="card" style="border-color:rgba(16,185,129,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">ACCEPTED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#10b981;">\${accepted}</div>
      </div>
      <div class="card" style="border-color:rgba(245,158,11,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">PENDING</div>
        <div style="font-size:1.8rem; font-weight:700; color:#f59e0b;">\${pending}</div>
      </div>
      <div class="card" style="border-color:rgba(139,92,246,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">HELD</div>
        <div style="font-size:1.8rem; font-weight:700; color:#a78bfa;">\${held}</div>
      </div>
    \`

    document.getElementById('checkpoint-list').innerHTML = items.length === 0
      ? '<div class="card" style="text-align:center; color:#6b7280; padding:2rem;">Belum ada checkpoint yang tersedia untuk counterpart.</div>'
      : items.map(cp => \`
        <div class="card" style="border-left:3px solid \${cp.status==='ACCEPTED'?'#10b981':cp.status==='PENDING'?'#f59e0b':cp.status==='HELD'?'#a78bfa':'#ef4444'};">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; margin-bottom:.4rem;">
            <div>
              <span style="font-size:10px; color:#6b7280; background:#1f2937; padding:2px 8px; border-radius:4px; margin-right:6px;">\${cp.session_ref}</span>
              <strong style="font-size:13px; color:#e2e8f0;">\${cp.label}</strong>
            </div>
            <div style="display:flex; gap:.4rem; align-items:center; flex-shrink:0;">
              \${tagHtml(cp.status)}
              <span style="font-size:11px; color:#6b7280;">\${formatDate(cp.date)}</span>
            </div>
          </div>
          <p style="font-size:12px; color:#9ca3af; margin-bottom:.4rem;">\${cp.summary}</p>
          \${cp.note ? \`<p style="font-size:11px; color:#6b7280; border-top:1px solid #1f2937; padding-top:.4rem; margin-top:.4rem;">\${cp.note}</p>\` : ''}
        </div>
      \`).join('')
  } catch(e) {
    document.getElementById('checkpoint-list').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Checkpoints', activeNav: 'checkpoints', content }))
})

/**
 * GET /counterpart/contribute — Contribution desk
 */
counterpartRouter.get('/contribute', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-paper-plane" style="color:#10b981;"></i> Contribution Desk
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Submit ide, catatan, request, atau update terstruktur</p>
  </div>

  <div class="boundary-banner" style="border-color:rgba(245,158,11,.3);">
    <p style="font-size:12px; color:#fbbf24; font-weight:600;"><i class="fas fa-triangle-exclamation"></i> BOUNDARY REMINDER SEBELUM SUBMIT</p>
    <ul style="font-size:11px; color:#9ca3af; margin-top:.4rem; padding-left:1.2rem; list-style:disc; line-height:1.7;">
      <li>Kontribusi adalah <strong>input</strong> — bukan keputusan.</li>
      <li>Semua kontribusi akan di-route ke Bridge untuk klasifikasi.</li>
      <li>Founder memutuskan via Chamber. Counterpart tidak dapat mengoverride keputusan founder.</li>
      <li>Submission yang tidak dalam scope yang diizinkan akan di-reject di Bridge.</li>
    </ul>
  </div>

  <!-- Submit Form -->
  <div class="card">
    <div style="font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; margin-bottom:1rem;"><i class="fas fa-plus-circle" style="color:#10b981;"></i> Form Kontribusi Baru</div>

    <div style="margin-bottom:1rem;">
      <label style="font-size:12px; color:#9ca3af; display:block; margin-bottom:6px;">Kategori <span style="color:#ef4444;">*</span></label>
      <select id="contrib-category" style="width:100%; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:.6rem .75rem; font-size:13px; color:#e2e8f0; outline:none;">
        <option value="">— Pilih Kategori —</option>
        <option value="idea">💡 Idea — Proposal atau gagasan baru</option>
        <option value="evidence">📎 Evidence — Bukti pendukung untuk proposal</option>
        <option value="request">📋 Request — Permintaan formal (akses, scope, review)</option>
        <option value="feedback">💬 Feedback — Tanggapan atas outcome yang diterima</option>
        <option value="update">🔄 Update — Informasi perkembangan terbaru</option>
      </select>
    </div>

    <div style="margin-bottom:1rem;">
      <label style="font-size:12px; color:#9ca3af; display:block; margin-bottom:6px;">
        Summary <span style="color:#ef4444;">*</span>
        <span style="color:#4b5563; font-weight:normal;">(10-1000 karakter)</span>
      </label>
      <textarea id="contrib-summary" rows="4" placeholder="Jelaskan kontribusi Anda secara ringkas dan jelas..."
        style="width:100%; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:.6rem .75rem; font-size:13px; color:#e2e8f0; outline:none; resize:vertical;"
        oninput="updateCounter()"></textarea>
      <div style="font-size:11px; color:#4b5563; margin-top:4px; text-align:right;">
        <span id="char-count">0</span>/1000 karakter
      </div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <label style="font-size:12px; color:#9ca3af; display:block; margin-bottom:6px;">
        Evidence Note <span style="color:#4b5563;">(opsional)</span>
      </label>
      <textarea id="contrib-evidence" rows="2" placeholder="Bukti, referensi, atau konteks tambahan (opsional)..."
        style="width:100%; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:.6rem .75rem; font-size:13px; color:#e2e8f0; outline:none; resize:vertical;"></textarea>
    </div>

    <div id="submit-error" style="font-size:12px; color:#f87171; margin-bottom:.75rem; display:none;"></div>
    <div id="submit-success" style="font-size:12px; color:#34d399; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.2); padding:.6rem .75rem; border-radius:6px; margin-bottom:.75rem; display:none;"></div>

    <button id="submit-btn" onclick="submitContribution()" class="btn-primary">
      <i class="fas fa-paper-plane"></i> Submit Kontribusi
    </button>
  </div>

  <!-- Recent Contributions -->
  <div class="card">
    <div style="font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; margin-bottom:.75rem;"><i class="fas fa-history"></i> Kontribusi Terbaru</div>
    <div id="recent-contributions"><div class="skeleton" style="height:60px;"></div></div>
  </div>
</div>

<script>
function updateCounter() {
  const v = document.getElementById('contrib-summary').value
  document.getElementById('char-count').textContent = v.length
}

async function submitContribution() {
  const category = document.getElementById('contrib-category').value
  const summary = document.getElementById('contrib-summary').value
  const evidence_note = document.getElementById('contrib-evidence').value

  const errEl = document.getElementById('submit-error')
  const sucEl = document.getElementById('submit-success')
  const btn = document.getElementById('submit-btn')

  errEl.style.display = 'none'
  sucEl.style.display = 'none'

  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...'

  try {
    const res = await fetch('/counterpart/api/contributions', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, summary, evidence_note })
    })
    const d = await res.json()
    if (d.success) {
      sucEl.innerHTML = \`<i class="fas fa-check-circle"></i> Kontribusi <strong>\${d.data.contribution.id}</strong> berhasil dikirim. \${d.data.routing_note}\`
      sucEl.style.display = 'block'
      document.getElementById('contrib-category').value = ''
      document.getElementById('contrib-summary').value = ''
      document.getElementById('contrib-evidence').value = ''
      document.getElementById('char-count').textContent = '0'
      loadRecentContributions()
    } else {
      errEl.textContent = d.error?.message || 'Gagal submit kontribusi.'
      errEl.style.display = 'block'
    }
  } catch(e) {
    errEl.textContent = 'Gagal menghubungi server.'
    errEl.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Kontribusi'
  }
}

async function loadRecentContributions() {
  try {
    const res = await fetch('/counterpart/api/contributions', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { items } = d.data
    document.getElementById('recent-contributions').innerHTML = items.length === 0
      ? '<p style="font-size:12px; color:#6b7280; text-align:center; padding:1rem;">Belum ada kontribusi yang disubmit.</p>'
      : items.slice(0,5).map(ct => \`
        <div style="border-bottom:1px solid #1f2937; padding:.6rem 0; display:flex; align-items:flex-start; justify-content:space-between; gap:.5rem;">
          <div>
            <span style="font-size:10px; color:#6b7280; background:#1f2937; padding:2px 6px; border-radius:4px; margin-right:4px;">\${ct.category}</span>
            <span style="font-size:12px; color:#e2e8f0;">\${ct.summary.slice(0,80)}\${ct.summary.length>80?'...':''}</span>
          </div>
          <div style="display:flex; gap:.4rem; align-items:center; flex-shrink:0;">
            \${tagHtml(ct.status)}
            <span style="font-size:10px; color:#6b7280;">\${ct.id}</span>
          </div>
        </div>
      \`).join('')
  } catch(e) {}
}

window.onCounterpartReady = async function(token) {
  _token = token
  loadRecentContributions()
}
</script>`

  return c.html(counterpartLayout({ title: 'Contribution Desk', activeNav: 'contribute', content }))
})

/**
 * GET /counterpart/outcomes — Restricted review outcomes
 */
counterpartRouter.get('/outcomes', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-circle-check" style="color:#10b981;"></i> Review Outcomes
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Hasil review kontribusi counterpart (terbatas)</p>
  </div>

  <div class="boundary-banner">
    <p style="font-size:11px; color:#fbbf24;"><i class="fas fa-eye-slash"></i> Hanya outcome yang relevan dengan kontribusi counterpart yang ditampilkan. Keputusan governance internal founder tidak termasuk.</p>
  </div>

  <div id="outcome-stats" style="display:grid; grid-template-columns:repeat(4,1fr); gap:1rem;">
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
    <div class="skeleton" style="height:70px;"></div>
  </div>

  <div id="outcome-list" class="space-y-3">
    <div class="skeleton" style="height:100px;"></div>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/outcomes', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { total, accepted, held, declined, needs_revision, outcomes } = d.data

    document.getElementById('outcome-stats').innerHTML = \`
      <div class="card" style="border-color:rgba(16,185,129,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">ACCEPTED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#10b981;">\${accepted}</div>
      </div>
      <div class="card" style="border-color:rgba(139,92,246,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">HELD</div>
        <div style="font-size:1.8rem; font-weight:700; color:#a78bfa;">\${held}</div>
      </div>
      <div class="card" style="border-color:rgba(239,68,68,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">DECLINED</div>
        <div style="font-size:1.8rem; font-weight:700; color:#ef4444;">\${declined}</div>
      </div>
      <div class="card" style="border-color:rgba(245,158,11,.3);">
        <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">NEEDS REVISION</div>
        <div style="font-size:1.8rem; font-weight:700; color:#f59e0b;">\${needs_revision}</div>
      </div>
    \`

    document.getElementById('outcome-list').innerHTML = outcomes.length === 0
      ? '<div class="card" style="text-align:center; color:#6b7280; padding:2rem;">Belum ada outcome yang tersedia.</div>'
      : outcomes.map(o => {
          const borderColor = { ACCEPTED:'#10b981', HELD:'#a78bfa', DECLINED:'#ef4444', NEEDS_REVISION:'#f59e0b' }[o.result] || '#374151'
          return \`
            <div class="card" style="border-left:3px solid \${borderColor};">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; margin-bottom:.5rem;">
                <div>
                  <span style="font-size:10px; color:#6b7280; background:#1f2937; padding:2px 6px; border-radius:4px; margin-right:6px;">\${o.ref}</span>
                  <strong style="font-size:13px; color:#e2e8f0;">\${o.label}</strong>
                </div>
                <div style="display:flex; gap:.4rem; align-items:center; flex-shrink:0;">
                  \${tagHtml(o.result)}
                  <span style="font-size:11px; color:#6b7280;">\${formatDate(o.date)}</span>
                </div>
              </div>
              <p style="font-size:12px; color:#9ca3af; margin-bottom:.4rem;">\${o.explanation}</p>
              \${o.next_step ? \`<div style="background:#0d1117; border:1px solid #1f2937; border-radius:6px; padding:.5rem .75rem; margin-top:.4rem;">
                <span style="font-size:11px; color:#34d399; font-weight:600;"><i class="fas fa-arrow-right"></i> Next Step:</span>
                <span style="font-size:11px; color:#9ca3af;"> \${o.next_step}</span>
              </div>\` : ''}
            </div>
          \`
        }).join('')
  } catch(e) {
    document.getElementById('outcome-list').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Review Outcomes', activeNav: 'outcomes', content }))
})

/**
 * GET /counterpart/boundaries — Explicit boundary notice
 */
counterpartRouter.get('/boundaries', (c: Context<CounterpartContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-shield-halved" style="color:#10b981;"></i> Boundary Notice
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Batas eksplisit Counterpart Workspace Lite v1</p>
  </div>

  <!-- Why Lite Banner -->
  <div class="card" style="background:rgba(245,158,11,.05); border-color:rgba(245,158,11,.2);">
    <div style="font-size:13px; font-weight:700; color:#fbbf24; margin-bottom:.75rem;"><i class="fas fa-triangle-exclamation"></i> MENGAPA WORKSPACE INI BERSIFAT LITE?</div>
    <ul style="font-size:12px; color:#9ca3af; list-style:disc; padding-left:1.2rem; line-height:1.9;">
      <li>Counterpart access dimulai minimal dan di-earned melalui kontribusi yang terverifikasi</li>
      <li>v1 adalah bounded preview di bawah founder-controlled auth — bukan multi-user auth penuh</li>
      <li>Founder sovereignty harus tetap tidak ambigu sebelum counterpart layer berkembang</li>
      <li>True counterpart role auth deferred ke session berikutnya (Counterpart Access Ladder v1)</li>
    </ul>
  </div>

  <!-- Hierarchy -->
  <div class="card">
    <div style="font-size:12px; font-weight:600; color:#60a5fa; margin-bottom:.75rem;"><i class="fas fa-sitemap"></i> GOVERNANCE HIERARCHY — POSISI COUNTERPART</div>
    <div id="hierarchy-list"><div class="skeleton" style="height:120px;"></div></div>
  </div>

  <!-- Boundary Rules -->
  <div class="card">
    <div style="font-size:12px; font-weight:600; color:#f87171; margin-bottom:.75rem; text-transform:uppercase;"><i class="fas fa-gavel"></i> ATURAN BATAS AKTIF</div>
    <div id="boundary-rules"><div class="skeleton" style="height:200px;"></div></div>
  </div>
</div>

<script>
window.onCounterpartReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/boundaries', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { boundaries, governance_hierarchy, why_lite } = d.data

    const layerIcon = { Hub:'fa-circle-nodes', Chamber:'fa-landmark', Bridge:'fa-bridge', 'Counterpart Workspace Lite':'fa-handshake' }
    const layerColor = { Hub:'#818cf8', Chamber:'#818cf8', Bridge:'#f97316', 'Counterpart Workspace Lite':'#10b981' }

    document.getElementById('hierarchy-list').innerHTML = governance_hierarchy.map((h, i) => \`
      \${i > 0 ? '<div style="text-align:center; font-size:12px; color:#374151; margin:4px 0;"><i class="fas fa-arrow-down"></i></div>' : ''}
      <div style="border:1px solid #1f2937; border-radius:8px; padding:.6rem 1rem; background:#0d1117; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:.6rem;">
          <i class="fas \${layerIcon[h.layer] || 'fa-circle'}" style="color:\${layerColor[h.layer] || '#6b7280'}; width:16px;"></i>
          <div>
            <div style="font-size:13px; font-weight:600; color:\${layerColor[h.layer] || '#e2e8f0'};">\${h.layer}</div>
            <div style="font-size:11px; color:#6b7280;">\${h.role}</div>
          </div>
        </div>
        <span style="font-size:11px; color:#6b7280; background:#1f2937; padding:3px 10px; border-radius:6px;">\${h.access}</span>
      </div>
    \`).join('')

    document.getElementById('boundary-rules').innerHTML = boundaries.map(b => \`
      <div style="border-bottom:1px solid #1f2937; padding:.6rem 0; display:flex; align-items:flex-start; gap:.75rem;">
        <div style="flex-shrink:0; margin-top:2px;">
          \${b.enforced ? '<i class="fas fa-lock" style="color:#ef4444; font-size:12px;"></i>' : '<i class="fas fa-unlock" style="color:#6b7280; font-size:12px;"></i>'}
        </div>
        <div style="flex:1;">
          <div style="font-size:12px; font-weight:600; color:#e2e8f0;">\${b.rule}</div>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">\${b.reason}</div>
        </div>
        <span style="font-size:10px; background:#1f2937; color:#6b7280; padding:2px 8px; border-radius:4px; flex-shrink:0;">\${b.area}</span>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('hierarchy-list').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(counterpartLayout({ title: 'Boundary Notice', activeNav: 'boundaries', content }))
})
