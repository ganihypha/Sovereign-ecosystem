// sovereign-tower — src/routes/access-ladder.ts
// Counterpart Access Ladder v1 — SESSION HUB-09
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER GOVERNANCE LAYER — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// HUB-09 Scope: Counterpart Access Ladder v1
//   - Earned access progression layer downstream of Counterpart Workspace Lite v1
//   - Translates governance doctrine access ladder into operational system surface
//   - Shows current level, promotion criteria, review history, boundary per level
//   - Does NOT implement real multi-user auth (v1 honest simulation)
//   - Does NOT grant founder authority to counterpart
//   - Does NOT expose Chamber/Bridge internal surfaces
//
// UI Routes (5 screens):
//   GET /counterpart/ladder                  → Access Ladder overview
//   GET /counterpart/ladder/level/:id        → Level detail view
//   GET /counterpart/ladder/criteria         → Promotion criteria + review cadence
//   GET /counterpart/ladder/history          → Review + promotion history log
//   GET /counterpart/ladder/notice           → Ladder boundary notice
//
// API Routes (6 bounded endpoints):
//   GET  /counterpart/api/ladder/overview    → full ladder model + current position
//   GET  /counterpart/api/ladder/level/:id   → specific level detail
//   GET  /counterpart/api/ladder/current     → current counterpart level
//   GET  /counterpart/api/ladder/criteria    → promotion criteria for next level
//   GET  /counterpart/api/ladder/history     → review/promotion history
//   GET  /counterpart/api/ladder/*           → 404 catch-all
//
// Auth: Reuses Hub MASTER_PIN / JWT model. JWT + founderOnly enforced at app.ts level.
// Ladder is downstream of: Hub → Chamber → Bridge → Counterpart Workspace → Access Ladder

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { TOWER_APP_VERSION, successResponse, errorResponse } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { verifyJwt } from '@sovereign/auth'

// =============================================================================
// CONSTANTS
// =============================================================================

const LADDER_BUILD_SESSION = 'hub09'
const LADDER_VERSION = '1.0.0'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type LadderContext = {
  Bindings: TowerEnv
  Variables: SovereignAuthVariables
}

interface LadderLevel {
  id: number
  label: string
  code: string
  status: 'CURRENT' | 'LOCKED' | 'EARNED' | 'FOUNDER_GRANTED'
  description: string
  allowed_visibility: string[]
  restricted_visibility: string[]
  prohibited_actions: string[]
  promotion_criteria: string[]
  review_cadence: string
  estimated_duration: string
  founder_override_note: string
  is_current: boolean
}

interface PromotionCriteria {
  from_level: number
  to_level: number
  requirements: string[]
  evidence_needed: string[]
  review_process: string
  decision_authority: string
  typical_timeline: string
  auto_promotion: boolean
  notes: string
}

interface ReviewHistoryEntry {
  id: string
  date: string
  type: 'REVIEW' | 'PROMOTION' | 'HOLD' | 'REGRESSION' | 'NOTE'
  from_level?: number
  to_level?: number
  current_level: number
  summary: string
  reviewer: string
  outcome: 'APPROVED' | 'HELD' | 'DECLINED' | 'NOTED'
  next_review?: string
}

// =============================================================================
// STATIC DATA — HONEST, BOUNDED, OPERATIONAL
// =============================================================================

/** The Access Ladder — 5 levels (0-4) */
const LADDER_LEVELS: LadderLevel[] = [
  {
    id: 0,
    label: 'Observer (Lite)',
    code: 'OBSERVER_LITE',
    status: 'CURRENT',
    description:
      'Entry level. Counterpart dapat melihat workspace bounded, submit kontribusi dasar, melihat outcome terbatas. Ini adalah level awal semua counterpart. Earned access dimulai dari sini.',
    allowed_visibility: [
      'Workspace overview (summary cards)',
      'Allowed access areas list',
      'Active scope lanes (contribution types)',
      'Bounded checkpoint history (filtered)',
      'Own contribution submissions + status',
      'Restricted review outcomes on own submissions',
      'Boundary rules & governance hierarchy',
      'Access Ladder overview + current level',
    ],
    restricted_visibility: [
      'Chamber Operating Console internals',
      'Bridge triage/classification decisions',
      'Hub session continuity internals',
      'Full audit trail',
      'Other counterpart profiles',
      'Founder decision rationale (full)',
    ],
    prohibited_actions: [
      'Approve/reject/hold any governance item',
      'Reclassify Bridge items',
      'Access Chamber API directly',
      'Access Bridge API classification tools',
      'Request founder authority transfer',
      'Modify scope unilaterally',
    ],
    promotion_criteria: [
      'Minimum 3 accepted contributions verified by Bridge → Chamber',
      'Zero boundary violations in current level',
      'At least 1 complete review cycle completed',
      'Founder-initiated level review',
    ],
    review_cadence: 'Monthly atau per-milestone (founder-initiated)',
    estimated_duration: '30-90 hari tergantung kontribusi aktif',
    founder_override_note: 'Founder dapat menunda atau mempercepat promotion kapan saja.',
    is_current: true,
  },
  {
    id: 1,
    label: 'Contributor',
    code: 'CONTRIBUTOR',
    status: 'LOCKED',
    description:
      'Level kedua. Counterpart yang telah membuktikan kontribusi terverifikasi. Scope lebih luas, review cadence lebih cepat, visibility checkpoint bertambah.',
    allowed_visibility: [
      'Semua visibility Level 0',
      'Extended checkpoint history (lebih banyak checkpoint visible)',
      'Contribution feedback summary (aggregated, bukan per-item founder notes)',
      'Scope expansion proposals visibility',
      'Review queue status (apakah submission sedang di-queue atau diproses)',
    ],
    restricted_visibility: [
      'Chamber decision detail (tetap founder-private)',
      'Bridge classification reasoning (founder-private)',
      'Other counterpart data',
    ],
    prohibited_actions: [
      'Semua prohibited actions Level 0 tetap berlaku',
      'Tidak boleh claim Level 1 tanpa verifikasi',
    ],
    promotion_criteria: [
      'Minimum 7 accepted contributions, setidaknya 3 kategori berbeda',
      'Minimum 1 structured request di-approve via Bridge → Chamber',
      'Zero boundary violations sejak Level 0',
      'Evidence of scope understanding (dilihat dari kualitas submissions)',
      'Founder-approved promotion',
    ],
    review_cadence: 'Bi-weekly check, monthly formal review',
    estimated_duration: '60-120 hari setelah mencapai Level 0',
    founder_override_note: 'Founder memutuskan promotion — bukan sistem otomatis.',
    is_current: false,
  },
  {
    id: 2,
    label: 'Reviewed Contributor',
    code: 'REVIEWED_CONTRIBUTOR',
    status: 'LOCKED',
    description:
      'Level ketiga. Counterpart yang telah menyelesaikan minimal 2 review cycle penuh. Mendapat visibility lebih dalam pada checkpoint dan scope assignment aktif.',
    allowed_visibility: [
      'Semua visibility Level 1',
      'Structured assignment visibility (apakah ada assignment aktif)',
      'Review cycle summary (berapa cycle sudah selesai)',
      'Contribution impact summary (scoped, tidak penuh)',
    ],
    restricted_visibility: [
      'Full Chamber audit trail (tetap founder-private)',
      'Raw Bridge triage notes (tetap founder-private)',
    ],
    prohibited_actions: [
      'Semua prohibited actions Level 0-1 tetap berlaku',
      'Tidak boleh assign task kepada orang lain',
    ],
    promotion_criteria: [
      'Minimum 2 review cycles selesai dengan outcome ACCEPTED atau HELD (bukan DECLINED)',
      'Minimum 1 structured assignment selesai dan terverifikasi',
      'Track record kontribusi konsisten (tanpa gap >30 hari)',
      'Formal endorsement dari Bridge classification history',
      'Founder-approved promotion',
    ],
    review_cadence: 'Weekly activity check, bi-weekly formal review',
    estimated_duration: '90-180 hari setelah Level 1',
    founder_override_note: 'Level ini membutuhkan founder approval eksplisit.',
    is_current: false,
  },
  {
    id: 3,
    label: 'Trusted Counterpart',
    code: 'TRUSTED_COUNTERPART',
    status: 'LOCKED',
    description:
      'Level keempat. Counterpart yang telah membuktikan reliabilitas dan alignment governance. Mendapat pre-decision briefing visibility (sangat terbatas, founder-curated).',
    allowed_visibility: [
      'Semua visibility Level 2',
      'Pre-decision briefing (hanya yang di-curate founder — bukan semua)',
      'Upcoming scope items (founder-approved disclosure only)',
      'Review cycle forecast visibility',
    ],
    restricted_visibility: [
      'Founder decision rationale penuh (tetap private)',
      'Chamber session records (tetap private)',
      'Other sensitive governance internals',
    ],
    prohibited_actions: [
      'Semua prohibited actions Level 0-2 tetap berlaku',
      'Tidak boleh share pre-decision briefing ke pihak lain',
    ],
    promotion_criteria: [
      'Minimum 5 review cycles selesai',
      'Minimum 3 structured assignments dengan ACCEPTED outcome',
      'Zero boundary violations sejak Level 0',
      'Explicit Founder endorsement (bukan system-generated)',
      'Governance alignment assessment (founder review)',
      'Founder-approved promotion via formal declaration',
    ],
    review_cadence: 'Weekly, dengan monthly governance alignment check',
    estimated_duration: '180-365 hari setelah Level 2, tergantung alignment',
    founder_override_note:
      'Level 3 membutuhkan deklarasi formal founder. Tidak bisa dicapai hanya dengan kontribusi kuantitatif.',
    is_current: false,
  },
  {
    id: 4,
    label: 'Designated Partner',
    code: 'DESIGNATED_PARTNER',
    status: 'FOUNDER_GRANTED',
    description:
      'Level tertinggi. Counterpart yang telah diberi status Designated Partner oleh founder. Full counterpart co-governance participation dalam batas yang disetujui. HANYA bisa diberikan oleh founder — tidak bisa di-earned secara otomatis.',
    allowed_visibility: [
      'Semua visibility Level 3',
      'Founder-curated co-governance items',
      'Designated scope full visibility (founder-defined boundary)',
      'Formal co-decision participation (dalam scope yang disetujui)',
    ],
    restricted_visibility: [
      'Governance items di luar designated scope (tetap private)',
      'Founder personal records (selalu private)',
    ],
    prohibited_actions: [
      'Tidak boleh bertindak di luar designated scope',
      'Tidak boleh claim Sovereign authority',
      'Tidak boleh modify governance canon tanpa founder approval',
    ],
    promotion_criteria: [
      'HANYA bisa diberikan oleh founder secara eksplisit',
      'Tidak ada jalur otomatis ke Level 4',
      'Membutuhkan formal Designated Partner Agreement',
      'Membutuhkan founder declaration',
    ],
    review_cadence: 'Ongoing — founder reviews at any time',
    estimated_duration: 'Tidak ada timeline — sepenuhnya discretion founder',
    founder_override_note:
      'Level 4 adalah founder-granted, bukan earned. Founder dapat mencabut kapan saja tanpa proses review.',
    is_current: false,
  },
]

/** Promotion criteria map — from level N to N+1 */
const PROMOTION_CRITERIA: PromotionCriteria[] = [
  {
    from_level: 0,
    to_level: 1,
    requirements: [
      'Minimum 3 accepted contributions verified by Bridge → Chamber',
      'Zero boundary violations di Level 0',
      'Minimal 1 complete review cycle',
    ],
    evidence_needed: [
      'Contribution IDs dengan status ACCEPTED',
      'Review cycle completion record',
      'No DECLINED contributions due to boundary violation',
    ],
    review_process: 'Founder-initiated. Counterpart dapat request review via Contribution Desk (kategori: request).',
    decision_authority: 'Founder (via Chamber review)',
    typical_timeline: '30-90 hari',
    auto_promotion: false,
    notes: 'Tidak ada promosi otomatis. Semua promosi membutuhkan founder review.',
  },
  {
    from_level: 1,
    to_level: 2,
    requirements: [
      'Minimum 7 accepted contributions, 3 kategori berbeda',
      'Minimum 1 structured request di-approve',
      'Zero boundary violations sejak Level 0',
      'Evidence of scope understanding',
    ],
    evidence_needed: [
      'Contribution history menunjukkan diversitas kategori',
      'Accepted structured request record',
      'Clean boundary violation history',
    ],
    review_process: 'Bi-weekly monitoring, formal review saat kriteria terpenuhi.',
    decision_authority: 'Founder (via Chamber)',
    typical_timeline: '60-120 hari setelah Level 0',
    auto_promotion: false,
    notes: 'Level ini membutuhkan bukti konsistensi, bukan hanya volume.',
  },
  {
    from_level: 2,
    to_level: 3,
    requirements: [
      'Minimum 2 review cycles selesai dengan ACCEPTED/HELD outcome',
      'Minimum 1 structured assignment terverifikasi',
      'Konsistensi kontribusi (tanpa gap >30 hari)',
      'Bridge classification history positif',
    ],
    evidence_needed: [
      'Review cycle completion records',
      'Assignment completion proof',
      'Contribution timeline tanpa gap',
    ],
    review_process: 'Weekly monitoring, bi-weekly formal assessment.',
    decision_authority: 'Founder (explicit approval)',
    typical_timeline: '90-180 hari setelah Level 1',
    auto_promotion: false,
    notes: 'Level 3 membutuhkan founder approval eksplisit — tidak cukup hanya memenuhi kriteria kuantitatif.',
  },
  {
    from_level: 3,
    to_level: 4,
    requirements: [
      'HANYA bisa diberikan oleh founder secara eksplisit',
      'Minimum 5 review cycles selesai',
      'Minimum 3 structured assignments ACCEPTED',
      'Zero boundary violations selama seluruh journey',
      'Formal Designated Partner Agreement',
      'Governance alignment assessment',
    ],
    evidence_needed: [
      'Full contribution history review',
      'Formal founder declaration',
      'Signed Designated Partner Agreement (format founder-defined)',
    ],
    review_process: 'Founder discretion — tidak ada path otomatis.',
    decision_authority: 'Founder only (tidak bisa didelegasikan)',
    typical_timeline: 'Tidak ada timeline — founder discretion',
    auto_promotion: false,
    notes:
      'Level 4 adalah sovereign discretion founder. Tidak ada quantity of contributions yang otomatis menghasilkan Level 4.',
  },
]

/** Review/promotion history */
const REVIEW_HISTORY: ReviewHistoryEntry[] = [
  {
    id: 'RH-001',
    date: '2026-04-12',
    type: 'NOTE',
    current_level: 0,
    summary:
      'Counterpart Workspace Lite v1 deployed (HUB-08). Access Ladder v1 constructed (HUB-09). Counterpart dimulai di Level 0: Observer (Lite). Ini adalah titik awal perjalanan earned access.',
    reviewer: 'System / Founder',
    outcome: 'NOTED',
    next_review: '2026-05-12',
  },
]

// =============================================================================
// HELPER — AUTH
// =============================================================================

async function requireFounderAuth(c: Context<LadderContext>): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET)
    if (!payload || payload.role !== 'founder') return null
    return token
  } catch {
    return null
  }
}

// =============================================================================
// ROUTER
// =============================================================================

export const accessLadderRouter = new Hono<LadderContext>()

// =============================================================================
// API ROUTES — 6 bounded endpoints (registered under /counterpart path)
// Auth: JWT + founderOnly enforced at app.ts level for /counterpart/api/*
// =============================================================================

/**
 * GET /counterpart/api/ladder/overview
 * Full ladder model + current level + next level requirements
 */
accessLadderRouter.get('/api/ladder/overview', async (c: Context<LadderContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const currentLevel = LADDER_LEVELS.find(l => l.is_current)!
  const nextLevel = LADDER_LEVELS.find(l => l.id === currentLevel.id + 1) || null
  const nextCriteria = PROMOTION_CRITERIA.find(p => p.from_level === currentLevel.id) || null

  return c.json(successResponse({
    session: LADDER_BUILD_SESSION,
    version: LADDER_VERSION,
    overview: {
      total_levels: LADDER_LEVELS.length,
      current_level_id: currentLevel.id,
      current_level_label: currentLevel.label,
      current_level_code: currentLevel.code,
      honest_note:
        'v1 berjalan sebagai bounded simulation di bawah founder-controlled auth. Counterpart v1 = Level 0 (Observer Lite). True multi-user role auth untuk level progression deferred ke versi berikutnya.',
    },
    levels: LADDER_LEVELS.map(l => ({
      id: l.id,
      label: l.label,
      code: l.code,
      status: l.status,
      description: l.description,
      is_current: l.is_current,
      review_cadence: l.review_cadence,
      estimated_duration: l.estimated_duration,
    })),
    current_level: currentLevel,
    next_level: nextLevel
      ? {
          id: nextLevel.id,
          label: nextLevel.label,
          code: nextLevel.code,
          promotion_criteria: nextCriteria?.requirements || [],
          decision_authority: nextCriteria?.decision_authority || 'Founder',
          typical_timeline: nextCriteria?.typical_timeline || 'N/A',
        }
      : null,
    boundary_note:
      'Semua promosi membutuhkan founder review. Tidak ada promosi otomatis. Founder dapat menunda, mempercepat, atau menolak promosi kapan saja.',
  }))
})

/**
 * GET /counterpart/api/ladder/level/:id
 * Specific level detail
 */
accessLadderRouter.get('/api/ladder/level/:id', async (c: Context<LadderContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const id = parseInt(c.req.param('id') ?? '')
  if (isNaN(id) || id < 0 || id > 4) {
    return c.json(errorResponse('INVALID_LEVEL_ID', 'Level ID harus antara 0-4.'), 400)
  }

  const level = LADDER_LEVELS.find(l => l.id === id)
  if (!level) return c.json(errorResponse('LEVEL_NOT_FOUND', `Level ${id} tidak ditemukan.`), 404)

  const criteriaToThis = PROMOTION_CRITERIA.find(p => p.to_level === id) || null
  const criteriaFromThis = PROMOTION_CRITERIA.find(p => p.from_level === id) || null

  return c.json(successResponse({
    session: LADDER_BUILD_SESSION,
    level,
    how_to_reach: criteriaToThis
      ? {
          from_level: criteriaToThis.from_level,
          requirements: criteriaToThis.requirements,
          evidence_needed: criteriaToThis.evidence_needed,
          review_process: criteriaToThis.review_process,
          decision_authority: criteriaToThis.decision_authority,
          typical_timeline: criteriaToThis.typical_timeline,
          notes: criteriaToThis.notes,
        }
      : (id === 0 ? { note: 'Level 0 adalah level awal — semua counterpart dimulai di sini.' } : null),
    how_to_advance: criteriaFromThis
      ? {
          to_level: criteriaFromThis.to_level,
          requirements: criteriaFromThis.requirements,
          auto_promotion: criteriaFromThis.auto_promotion,
          notes: criteriaFromThis.notes,
        }
      : (id === 4 ? { note: 'Level 4 adalah level tertinggi. Tidak ada level di atasnya.' } : null),
  }))
})

/**
 * GET /counterpart/api/ladder/current
 * Current counterpart level — honest bounded answer
 */
accessLadderRouter.get('/api/ladder/current', async (c: Context<LadderContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const currentLevel = LADDER_LEVELS.find(l => l.is_current)!
  const nextCriteria = PROMOTION_CRITERIA.find(p => p.from_level === currentLevel.id)
  const nextLevel = LADDER_LEVELS.find(l => l.id === currentLevel.id + 1)

  return c.json(successResponse({
    session: LADDER_BUILD_SESSION,
    current: {
      id: currentLevel.id,
      label: currentLevel.label,
      code: currentLevel.code,
      status: currentLevel.status,
      description: currentLevel.description,
      review_cadence: currentLevel.review_cadence,
      founder_override_note: currentLevel.founder_override_note,
    },
    position_summary: {
      at_level: currentLevel.id,
      of_total_levels: LADDER_LEVELS.length - 1,
      percent_progress: Math.round((currentLevel.id / (LADDER_LEVELS.length - 1)) * 100),
      levels_above: LADDER_LEVELS.length - 1 - currentLevel.id,
    },
    next_promotion: nextCriteria && nextLevel
      ? {
          next_level_id: nextLevel.id,
          next_level_label: nextLevel.label,
          requirements: nextCriteria.requirements,
          auto_promotion: nextCriteria.auto_promotion,
          decision_authority: nextCriteria.decision_authority,
          typical_timeline: nextCriteria.typical_timeline,
        }
      : null,
    honest_v1_note:
      'Counterpart Access Ladder v1 berjalan dalam bounded simulation. True level enforcement via multi-user auth system deferred. Ini adalah operational access model, bukan enforced permission system.',
  }))
})

/**
 * GET /counterpart/api/ladder/criteria
 * Promotion criteria — what is needed to advance from current level
 */
accessLadderRouter.get('/api/ladder/criteria', async (c: Context<LadderContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const currentLevel = LADDER_LEVELS.find(l => l.is_current)!
  const allCriteria = PROMOTION_CRITERIA

  return c.json(successResponse({
    session: LADDER_BUILD_SESSION,
    current_level_id: currentLevel.id,
    current_level_label: currentLevel.label,
    next_level_criteria: allCriteria.find(p => p.from_level === currentLevel.id) || null,
    all_criteria: allCriteria.map(p => ({
      from_level: p.from_level,
      to_level: p.to_level,
      from_label: LADDER_LEVELS[p.from_level]?.label,
      to_label: LADDER_LEVELS[p.to_level]?.label,
      requirements_count: p.requirements.length,
      auto_promotion: p.auto_promotion,
      decision_authority: p.decision_authority,
      typical_timeline: p.typical_timeline,
    })),
    universal_rules: [
      'Tidak ada promosi otomatis — semua membutuhkan founder review',
      'Boundary violations dapat menyebabkan penundaan atau penolakan promosi',
      'Founder dapat menolak promosi kapan saja tanpa memberikan alasan',
      'Jumlah kontribusi saja tidak cukup — kualitas dan alignment juga dinilai',
      'Level 4 hanya bisa diberikan oleh founder secara eksplisit',
    ],
  }))
})

/**
 * GET /counterpart/api/ladder/history
 * Review + promotion history log
 */
accessLadderRouter.get('/api/ladder/history', async (c: Context<LadderContext>) => {
  const token = await requireFounderAuth(c)
  if (!token) return c.json(errorResponse('AUTH_MISSING_TOKEN', 'Valid founder JWT required.'), 401)

  const typeFilter = c.req.query('type')
  let items = [...REVIEW_HISTORY]
  if (typeFilter) items = items.filter(h => h.type === typeFilter.toUpperCase())

  const promotions = REVIEW_HISTORY.filter(h => h.type === 'PROMOTION').length
  const holds = REVIEW_HISTORY.filter(h => h.outcome === 'HELD').length
  const notes = REVIEW_HISTORY.filter(h => h.type === 'NOTE').length

  return c.json(successResponse({
    session: LADDER_BUILD_SESSION,
    total: REVIEW_HISTORY.length,
    promotions,
    holds,
    notes,
    items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    boundary_note:
      'Hanya review history yang relevan dengan counterpart yang ditampilkan. Founder internal review notes tidak termasuk.',
  }))
})

/**
 * GET /counterpart/api/ladder/* — catch-all 404
 */
accessLadderRouter.get('/api/ladder/*', (c: Context<LadderContext>) => {
  return c.json(errorResponse(
    'LADDER_ROUTE_NOT_FOUND',
    `Access Ladder API route '${c.req.path}' not found. Available: GET /counterpart/api/ladder/overview, /current, /criteria, /history, /level/:id`,
  ), 404)
})

// =============================================================================
// LAYOUT HELPER
// =============================================================================

function ladderLayout({
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
    { id: 'ladder', label: 'Access Ladder', icon: 'fa-stairs', path: '/counterpart/ladder', isNew: true },
  ]

  const navHtml = navItems
    .map(item => {
      const isActive = activeNav === item.id
      return `
      <a href="${item.path}" data-nav="${item.id}"
         class="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
           isActive
             ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
             : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
         }">
        <i class="fas ${item.icon} w-4 text-center ${isActive ? 'text-violet-400' : 'text-gray-500'}"></i>
        ${item.label}${(item as { isNew?: boolean }).isNew ? ' <span style="background:rgba(139,92,246,.3);color:#c4b5fd;font-size:9px;padding:1px 5px;border-radius:4px;margin-left:2px;">NEW</span>' : ''}
      </a>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Access Ladder</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e1a; color: #e2e8f0; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a1f2e; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
    .auth-overlay { position: fixed; inset: 0; background: #0a0e1a; display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .auth-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 2rem; width: 100%; max-width: 360px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 1.25rem; }
    .btn-primary { background: #7c3aed; color: white; border: none; padding: .6rem 1.25rem; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .badge-current { background: rgba(139,92,246,.2); border: 1px solid rgba(139,92,246,.4); color: #c4b5fd; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-locked { background: rgba(107,114,128,.15); border: 1px solid rgba(107,114,128,.3); color: #9ca3af; padding: 2px 10px; border-radius: 9999px; font-size: 11px; }
    .badge-earned { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); color: #34d399; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-founder { background: rgba(245,158,11,.15); border: 1px solid rgba(245,158,11,.3); color: #fbbf24; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .level-card { border: 1px solid #1f2937; border-radius: 10px; padding: 1rem; background: #0d1117; transition: border-color .2s; }
    .level-card.is-current { border-color: rgba(139,92,246,.4); background: rgba(139,92,246,.05); }
    .level-card.is-locked { opacity: .7; }
    .skeleton { background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; height: 16px; margin-bottom: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .progress-bar-bg { background: #1f2937; border-radius: 9999px; height: 8px; overflow: hidden; }
    .progress-bar-fill { background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 9999px; height: 100%; transition: width .5s ease; }
  </style>
</head>
<body>

<!-- AUTH OVERLAY -->
<div id="auth-overlay" class="auth-overlay">
  <div class="auth-card">
    <div style="text-align:center; margin-bottom:1.5rem;">
      <div style="font-size:2rem; margin-bottom:.5rem;">🪜</div>
      <h2 style="font-size:1.1rem; font-weight:700; color:#e2e8f0;">Access Ladder</h2>
      <p style="font-size:12px; color:#6b7280; margin-top:.25rem;">Earned Access Progression — HUB-09</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-size:12px; color:#9ca3af; display:block; margin-bottom:6px;">Master PIN</label>
      <input id="pin-input" type="password" placeholder="Masukkan MASTER_PIN..."
        style="width:100%; background:#1f2937; border:1px solid #374151; border-radius:8px; padding:.6rem .75rem; font-size:14px; color:#e2e8f0; outline:none;"
        onkeydown="if(event.key==='Enter') doExchange()">
    </div>
    <div id="auth-error" style="font-size:12px; color:#f87171; margin-bottom:.75rem; display:none;"></div>
    <button onclick="doExchange()" id="pin-btn" class="btn-primary" style="width:100%;">
      <i class="fas fa-right-to-bracket"></i> Akses Ladder
    </button>
    <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #1f2937; text-align:center;">
      <p style="font-size:11px; color:#4b5563;">
        <i class="fas fa-stairs" style="color:#7c3aed;"></i>
        Counterpart Access Ladder v${LADDER_VERSION} · SESSION HUB-09
      </p>
    </div>
  </div>
</div>

<!-- MAIN LAYOUT -->
<div id="main-app" style="display:none; flex-direction:column; height:100vh; overflow:hidden;">
  <!-- TOPBAR -->
  <div style="background:#111827; border-bottom:1px solid #1f2937; padding:0 1.25rem; height:52px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
    <div style="display:flex; align-items:center; gap:.75rem;">
      <span style="font-size:1.1rem;">🤝</span>
      <span style="font-weight:700; font-size:14px; color:#e2e8f0;">Counterpart Workspace</span>
      <span style="font-size:11px; color:#6b7280;">· Access Ladder v${LADDER_VERSION}</span>
      <span style="background:rgba(139,92,246,.2); border:1px solid rgba(139,92,246,.3); color:#c4b5fd; font-size:10px; padding:2px 8px; border-radius:9999px; margin-left:4px;"><i class="fas fa-stairs"></i> HUB-09</span>
    </div>
    <div style="display:flex; align-items:center; gap:.75rem;">
      <span style="font-size:11px; color:#34d399;"><i class="fas fa-circle" style="font-size:8px;"></i> Bounded</span>
      <div style="display:flex; gap:.5rem; font-size:11px;">
        <a href="/hub" style="color:#6b7280; text-decoration:none;">Hub</a>
        <span style="color:#374151;">·</span>
        <a href="/counterpart" style="color:#6b7280; text-decoration:none;">Workspace</a>
      </div>
      <button onclick="doLogout()" style="background:none; border:1px solid #374151; color:#9ca3af; padding:4px 10px; border-radius:6px; font-size:12px; cursor:pointer;">
        <i class="fas fa-right-from-bracket"></i>
      </button>
    </div>
  </div>

  <!-- BODY: SIDEBAR + CONTENT -->
  <div style="display:flex; flex:1; overflow:hidden;">
    <!-- SIDEBAR -->
    <div style="width:200px; background:#0d1117; border-right:1px solid #1f2937; display:flex; flex-direction:column; flex-shrink:0; overflow-y:auto; padding:1rem .75rem;">
      <nav style="display:flex; flex-direction:column; gap:2px;">
        ${navHtml}
      </nav>
      <div style="margin-top:auto; padding-top:1rem; border-top:1px solid #1f2937;">
        <div style="font-size:10px; color:#4b5563; text-align:center; line-height:1.5;">
          <div style="color:#6b7280;">Level Saat Ini</div>
          <div style="color:#c4b5fd; font-weight:600;">L0 — Observer</div>
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

function getToken() { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '' }
function doLogout() { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); window.location.reload() }
function authHeader() { return { Authorization: 'Bearer ' + _token } }

async function doExchange() {
  const pin = document.getElementById('pin-input').value.trim()
  const errEl = document.getElementById('auth-error')
  const btn = document.getElementById('pin-btn')
  if (!pin) { errEl.textContent = 'PIN wajib diisi.'; errEl.style.display='block'; return }
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memverifikasi...'
  try {
    const res = await axios.post('/api/hub/auth/exchange', { pin })
    if (res.data?.data?.token) {
      sessionStorage.setItem(TOKEN_KEY, res.data.data.token)
      _token = res.data.data.token
      document.getElementById('auth-overlay').style.display = 'none'
      const ma = document.getElementById('main-app')
      ma.style.display = 'flex'; ma.style.flexDirection = 'column'
      if (typeof window.onLadderReady === 'function') window.onLadderReady(_token)
    } else {
      errEl.textContent = res.data?.error?.message || 'PIN tidak valid.'; errEl.style.display = 'block'
    }
  } catch(e) {
    errEl.textContent = e.response?.data?.error?.message || 'Gagal menghubungi server.'; errEl.style.display = 'block'
  } finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Akses Ladder' }
}

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) } catch { return iso }
}

function badgeHtml(status) {
  const map = { CURRENT:'badge-current', LOCKED:'badge-locked', EARNED:'badge-earned', FOUNDER_GRANTED:'badge-founder' }
  return \`<span class="\${map[status]||'badge-locked'}">\${status.replace('_',' ')}</span>\`
}

;(function(){
  const saved = getToken()
  if (saved) {
    _token = saved
    document.getElementById('auth-overlay').style.display = 'none'
    const ma = document.getElementById('main-app')
    ma.style.display = 'flex'; ma.style.flexDirection = 'column'
    setTimeout(() => { if (typeof window.onLadderReady === 'function') window.onLadderReady(_token) }, 100)
  }
})()
</script>
</body>
</html>`
}

// =============================================================================
// UI ROUTES — 5 screens (registered under /counterpart path)
// =============================================================================

/**
 * GET /counterpart/ladder — Access Ladder overview
 */
accessLadderRouter.get('/ladder', (c: Context<LadderContext>) => {
  const content = `
<div class="space-y-5">
  <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
        <i class="fas fa-stairs" style="color:#a78bfa;"></i> Access Ladder
      </h1>
      <p style="color:#6b7280; font-size:13px; margin-top:2px;">Earned access progression — Level 0 sampai 4</p>
    </div>
    <div style="background:rgba(139,92,246,.08); border:1px solid rgba(139,92,246,.2); border-radius:8px; padding:.6rem 1rem; max-width:360px;">
      <p style="font-size:11px; color:#a78bfa; font-weight:600;"><i class="fas fa-info-circle"></i> HONEST NOTE v1</p>
      <p style="font-size:11px; color:#9ca3af; margin-top:2px;">Ladder ini adalah model operasional. True level enforcement via multi-user auth deferred. v1 = bounded simulation di bawah founder-controlled auth.</p>
    </div>
  </div>

  <!-- Current Level Card -->
  <div id="current-level-card"><div class="skeleton" style="height:100px;"></div></div>

  <!-- Progress Bar -->
  <div class="card" id="progress-section">
    <div class="skeleton" style="height:40px;"></div>
  </div>

  <!-- All Levels -->
  <div id="levels-grid" class="space-y-3">
    <div class="skeleton" style="height:120px;"></div>
    <div class="skeleton" style="height:120px;"></div>
  </div>

  <!-- Quick Actions -->
  <div style="display:flex; gap:.75rem; flex-wrap:wrap;">
    <a href="/counterpart/ladder/criteria" style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; padding:.5rem 1rem; border-radius:8px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;">
      <i class="fas fa-clipboard-list" style="color:#a78bfa;"></i> Promotion Criteria
    </a>
    <a href="/counterpart/ladder/history" style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; padding:.5rem 1rem; border-radius:8px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;">
      <i class="fas fa-clock-rotate-left" style="color:#a78bfa;"></i> Review History
    </a>
    <a href="/counterpart/ladder/notice" style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; padding:.5rem 1rem; border-radius:8px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;">
      <i class="fas fa-triangle-exclamation" style="color:#fbbf24;"></i> Boundary Notice
    </a>
  </div>
</div>

<script>
window.onLadderReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/ladder/overview', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { overview, levels, current_level, next_level } = d.data

    // Current level card
    document.getElementById('current-level-card').innerHTML = \`
      <div class="card" style="border-color:rgba(139,92,246,.4); background:rgba(139,92,246,.05);">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
          <div>
            <div style="font-size:11px; color:#a78bfa; font-weight:600; text-transform:uppercase; margin-bottom:.4rem;"><i class="fas fa-location-dot"></i> LEVEL SAAT INI</div>
            <div style="display:flex; align-items:center; gap:.75rem;">
              <div style="width:44px; height:44px; background:rgba(139,92,246,.2); border:2px solid rgba(139,92,246,.4); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.2rem; color:#c4b5fd; flex-shrink:0;">\${current_level.id}</div>
              <div>
                <div style="font-size:1rem; font-weight:700; color:#e2e8f0;">\${current_level.label}</div>
                <div style="font-size:12px; color:#9ca3af;">\${current_level.code} · \${current_level.review_cadence}</div>
              </div>
            </div>
            <p style="font-size:12px; color:#9ca3af; margin-top:.75rem; max-width:500px;">\${current_level.description}</p>
          </div>
          \${next_level ? \`
            <div style="background:#0d1117; border:1px solid #1f2937; border-radius:8px; padding:.75rem 1rem; min-width:180px;">
              <div style="font-size:11px; color:#6b7280; margin-bottom:.4rem; font-weight:600;">NEXT LEVEL</div>
              <div style="font-size:13px; font-weight:600; color:#e2e8f0;">L\${next_level.next_level_id} — \${next_level.next_level_label}</div>
              <div style="font-size:11px; color:#6b7280; margin-top:.25rem;">\${next_level.requirements.length} kriteria · \${next_level.typical_timeline}</div>
            </div>
          \` : '<div style="font-size:12px;color:#6b7280;">Level tertinggi</div>'}
        </div>
      </div>
    \`

    // Progress bar
    const pct = Math.round((current_level.id / (levels.length - 1)) * 100)
    document.getElementById('progress-section').innerHTML = \`
      <div style="font-size:12px; color:#6b7280; margin-bottom:.6rem; display:flex; justify-content:space-between;">
        <span>Progress Ladder</span>
        <span style="color:#c4b5fd;">\${pct}% (Level \${current_level.id}/\${levels.length-1})</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:\${pct}%"></div>
      </div>
    \`

    // All levels
    const levelColors = ['#818cf8','#34d399','#60a5fa','#f59e0b','#f97316']
    document.getElementById('levels-grid').innerHTML = levels.map(lv => \`
      <div class="level-card \${lv.is_current ? 'is-current' : 'is-locked'}" style="border-left:3px solid \${lv.is_current ? '#a78bfa' : '#1f2937'};">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:.75rem;">
            <div style="width:36px; height:36px; border-radius:50%; background:\${lv.is_current ? 'rgba(139,92,246,.2)' : '#1f2937'}; border:2px solid \${lv.is_current ? 'rgba(139,92,246,.5)' : '#374151'}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:\${lv.is_current ? '#c4b5fd' : '#6b7280'}; flex-shrink:0;">\${lv.id}</div>
            <div>
              <div style="font-size:13px; font-weight:600; color:\${lv.is_current ? '#e2e8f0' : '#9ca3af'};">\${lv.label}</div>
              <div style="font-size:11px; color:#6b7280;">\${lv.code}</div>
            </div>
          </div>
          <div style="display:flex; gap:.5rem; align-items:center;">
            \${badgeHtml(lv.status)}
            <a href="/counterpart/ladder/level/\${lv.id}" style="font-size:11px; color:#818cf8; text-decoration:none; background:#1f2937; padding:3px 10px; border-radius:6px; border:1px solid #374151;">Detail →</a>
          </div>
        </div>
        <p style="font-size:11px; color:#6b7280; margin-top:.5rem; padding-left:48px;">\${lv.description.slice(0,120)}\${lv.description.length>120?'...':''}</p>
      </div>
    \`).join('')
  } catch(e) {
    document.getElementById('current-level-card').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(ladderLayout({ title: 'Access Ladder', activeNav: 'ladder', content }))
})

/**
 * GET /counterpart/ladder/level/:id — Level detail
 */
accessLadderRouter.get('/ladder/level/:id', (c: Context<LadderContext>) => {
  const levelId = c.req.param('id')
  const content = `
<div class="space-y-5">
  <div style="display:flex; align-items:center; gap:.75rem;">
    <a href="/counterpart/ladder" style="color:#6b7280; text-decoration:none; font-size:13px;"><i class="fas fa-arrow-left"></i> Kembali ke Ladder</a>
  </div>
  <div id="level-detail"><div class="skeleton" style="height:200px;"></div></div>
</div>

<script>
const LEVEL_ID = ${levelId}
window.onLadderReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/ladder/level/' + LEVEL_ID, { headers: authHeader() })
    const d = await res.json()
    if (!d.success) {
      document.getElementById('level-detail').innerHTML = '<div class="card" style="color:#f87171;">' + (d.error?.message || 'Level tidak ditemukan.') + '</div>'
      return
    }
    const { level, how_to_reach, how_to_advance } = d.data

    const listHtml = (items, color) => items.map(i => \`
      <li style="padding:.3rem 0; border-bottom:1px solid #1f2937; font-size:12px; color:\${color || '#9ca3af'};">\${i}</li>
    \`).join('')

    document.getElementById('level-detail').innerHTML = \`
      <div class="card" style="border-color:\${level.is_current ? 'rgba(139,92,246,.4)' : '#1f2937'}; background:\${level.is_current ? 'rgba(139,92,246,.05)' : '#111827'};">
        <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:1rem;">
          <div style="width:52px; height:52px; border-radius:50%; background:\${level.is_current ? 'rgba(139,92,246,.2)' : '#1f2937'}; border:2px solid \${level.is_current ? 'rgba(139,92,246,.5)' : '#374151'}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.4rem; color:\${level.is_current ? '#c4b5fd' : '#6b7280'}; flex-shrink:0;">\${level.id}</div>
          <div>
            <h2 style="font-size:1.1rem; font-weight:700; color:#e2e8f0;">\${level.label}</h2>
            <div style="display:flex; gap:.5rem; margin-top:.25rem;">\${badgeHtml(level.status)}</div>
          </div>
        </div>
        <p style="font-size:13px; color:#9ca3af; margin-bottom:1.25rem;">\${level.description}</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div style="background:#0d1117; border-radius:8px; padding:.75rem; border:1px solid #1f2937;">
            <div style="font-size:11px; color:#34d399; font-weight:600; margin-bottom:.5rem;"><i class="fas fa-eye"></i> ALLOWED VISIBILITY</div>
            <ul style="list-style:none; padding:0;">\${listHtml(level.allowed_visibility, '#9ca3af')}</ul>
          </div>
          <div style="background:#0d1117; border-radius:8px; padding:.75rem; border:1px solid #1f2937;">
            <div style="font-size:11px; color:#f87171; font-weight:600; margin-bottom:.5rem;"><i class="fas fa-ban"></i> PROHIBITED ACTIONS</div>
            <ul style="list-style:none; padding:0;">\${listHtml(level.prohibited_actions, '#9ca3af')}</ul>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <div style="font-size:11px; color:#6b7280; font-weight:600; margin-bottom:.4rem;">REVIEW CADENCE</div>
            <p style="font-size:12px; color:#e2e8f0;">\${level.review_cadence}</p>
          </div>
          <div>
            <div style="font-size:11px; color:#6b7280; font-weight:600; margin-bottom:.4rem;">ESTIMASI DURASI</div>
            <p style="font-size:12px; color:#e2e8f0;">\${level.estimated_duration}</p>
          </div>
        </div>

        <div style="background:rgba(245,158,11,.05); border:1px solid rgba(245,158,11,.2); border-radius:8px; padding:.6rem .75rem;">
          <p style="font-size:11px; color:#fbbf24; font-weight:600;"><i class="fas fa-crown"></i> FOUNDER OVERRIDE</p>
          <p style="font-size:11px; color:#9ca3af; margin-top:2px;">\${level.founder_override_note}</p>
        </div>
      </div>

      \${how_to_advance && how_to_advance.to_level !== undefined ? \`
        <div class="card" style="border-color:rgba(129,140,248,.2);">
          <div style="font-size:12px; font-weight:600; color:#818cf8; margin-bottom:.75rem;"><i class="fas fa-arrow-up"></i> CARA MENCAPAI LEVEL \${how_to_advance.to_level}</div>
          <ul style="list-style:none; padding:0;">
            \${how_to_advance.requirements.map(r => \`
              <li style="padding:.4rem 0; border-bottom:1px solid #1f2937; font-size:12px; color:#9ca3af; display:flex; align-items:flex-start; gap:.5rem;">
                <i class="fas fa-circle-dot" style="color:#818cf8; margin-top:3px; font-size:10px; flex-shrink:0;"></i> \${r}
              </li>
            \`).join('')}
          </ul>
          <p style="font-size:11px; color:#6b7280; margin-top:.5rem;">\${how_to_advance.notes}</p>
        </div>
      \` : ''}

      \${how_to_reach && how_to_reach.requirements ? \`
        <div class="card" style="border-color:rgba(16,185,129,.2);">
          <div style="font-size:12px; font-weight:600; color:#34d399; margin-bottom:.75rem;"><i class="fas fa-stairs"></i> KRITERIA MENCAPAI LEVEL INI</div>
          <ul style="list-style:none; padding:0;">
            \${how_to_reach.requirements.map(r => \`
              <li style="padding:.4rem 0; border-bottom:1px solid #1f2937; font-size:12px; color:#9ca3af; display:flex; align-items:flex-start; gap:.5rem;">
                <i class="fas fa-check" style="color:#34d399; margin-top:3px; font-size:10px; flex-shrink:0;"></i> \${r}
              </li>
            \`).join('')}
          </ul>
          <div style="font-size:11px; color:#6b7280; margin-top:.5rem;">
            <strong>Decision Authority:</strong> \${how_to_reach.decision_authority} ·
            <strong>Timeline:</strong> \${how_to_reach.typical_timeline}
          </div>
        </div>
      \` : ''}
    \`
  } catch(e) {
    document.getElementById('level-detail').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(ladderLayout({ title: `Level ${levelId} Detail`, activeNav: 'ladder', content }))
})

/**
 * GET /counterpart/ladder/criteria — Promotion criteria + review cadence
 */
accessLadderRouter.get('/ladder/criteria', (c: Context<LadderContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-clipboard-list" style="color:#a78bfa;"></i> Promotion Criteria
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Syarat promosi dari setiap level</p>
  </div>
  <div id="criteria-content" class="space-y-4"><div class="skeleton" style="height:150px;"></div></div>
</div>

<script>
window.onLadderReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/ladder/criteria', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { current_level_id, next_level_criteria, all_criteria, universal_rules } = d.data

    document.getElementById('criteria-content').innerHTML = \`
      \${next_level_criteria ? \`
        <div class="card" style="border-color:rgba(139,92,246,.4);">
          <div style="font-size:12px; font-weight:600; color:#c4b5fd; margin-bottom:.75rem;"><i class="fas fa-star"></i> KRITERIA UNTUK LEVEL ANDA BERIKUTNYA (L\${next_level_criteria.from_level} → L\${next_level_criteria.to_level})</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:.75rem;">
            <div>
              <div style="font-size:11px; color:#6b7280; margin-bottom:.4rem;">REQUIREMENTS</div>
              \${next_level_criteria.requirements.map(r => \`<div style="font-size:12px; color:#e2e8f0; padding:.25rem 0; border-bottom:1px solid #1f2937;"><i class="fas fa-circle-dot" style="color:#a78bfa; font-size:8px; margin-right:6px;"></i>\${r}</div>\`).join('')}
            </div>
            <div>
              <div style="font-size:11px; color:#6b7280; margin-bottom:.4rem;">EVIDENCE NEEDED</div>
              \${next_level_criteria.evidence_needed.map(e => \`<div style="font-size:12px; color:#9ca3af; padding:.25rem 0; border-bottom:1px solid #1f2937;"><i class="fas fa-paperclip" style="color:#6b7280; font-size:8px; margin-right:6px;"></i>\${e}</div>\`).join('')}
            </div>
          </div>
          <div style="font-size:11px; color:#6b7280; background:#0d1117; padding:.5rem .75rem; border-radius:6px;">
            <strong style="color:#9ca3af;">Process:</strong> \${next_level_criteria.review_process}<br>
            <strong style="color:#9ca3af;">Authority:</strong> \${next_level_criteria.decision_authority} ·
            <strong style="color:#9ca3af;">Timeline:</strong> \${next_level_criteria.typical_timeline}
          </div>
        </div>
      \` : ''}

      <div class="card">
        <div style="font-size:12px; font-weight:600; color:#6b7280; margin-bottom:.75rem; text-transform:uppercase;"><i class="fas fa-list"></i> SEMUA KRITERIA PROMOSI</div>
        \${all_criteria.map(c => \`
          <div style="border-bottom:1px solid #1f2937; padding:.6rem 0; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.5rem;">
            <div style="display:flex; align-items:center; gap:.6rem;">
              <span style="background:#1f2937; color:#6b7280; font-size:11px; padding:3px 8px; border-radius:6px; font-weight:600;">L\${c.from_level}</span>
              <i class="fas fa-arrow-right" style="color:#374151; font-size:10px;"></i>
              <span style="background:#1f2937; color:#a78bfa; font-size:11px; padding:3px 8px; border-radius:6px; font-weight:600;">L\${c.to_level}</span>
              <span style="font-size:12px; color:#e2e8f0;">\${c.from_label} → \${c.to_label}</span>
            </div>
            <div style="display:flex; gap:.5rem; align-items:center; font-size:11px; color:#6b7280;">
              <span>\${c.requirements_count} syarat</span>·
              <span>\${c.typical_timeline}</span>·
              <span style="color:\${c.auto_promotion?'#34d399':'#f59e0b'}">\${c.auto_promotion ? 'Auto' : 'Manual'}</span>
            </div>
          </div>
        \`).join('')}
      </div>

      <div class="card" style="border-color:rgba(245,158,11,.2);">
        <div style="font-size:12px; font-weight:600; color:#fbbf24; margin-bottom:.6rem;"><i class="fas fa-gavel"></i> ATURAN UNIVERSAL</div>
        \${universal_rules.map(r => \`
          <div style="font-size:12px; color:#9ca3af; padding:.3rem 0; border-bottom:1px solid #1f2937; display:flex; gap:.5rem;">
            <i class="fas fa-triangle-exclamation" style="color:#f59e0b; font-size:10px; margin-top:3px; flex-shrink:0;"></i> \${r}
          </div>
        \`).join('')}
      </div>
    \`
  } catch(e) {
    document.getElementById('criteria-content').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(ladderLayout({ title: 'Promotion Criteria', activeNav: 'ladder', content }))
})

/**
 * GET /counterpart/ladder/history — Review + promotion history
 */
accessLadderRouter.get('/ladder/history', (c: Context<LadderContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-clock-rotate-left" style="color:#a78bfa;"></i> Review History
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Riwayat review dan promosi level</p>
  </div>
  <div id="history-content" class="space-y-3"><div class="skeleton" style="height:100px;"></div></div>
</div>

<script>
window.onLadderReady = async function(token) {
  _token = token
  try {
    const res = await fetch('/counterpart/api/ladder/history', { headers: authHeader() })
    const d = await res.json()
    if (!d.success) return
    const { total, promotions, holds, notes, items } = d.data

    const typeColor = { PROMOTION:'#34d399', REVIEW:'#818cf8', HOLD:'#a78bfa', REGRESSION:'#f87171', NOTE:'#6b7280' }
    const outcomeColor = { APPROVED:'#34d399', HELD:'#a78bfa', DECLINED:'#f87171', NOTED:'#6b7280' }

    document.getElementById('history-content').innerHTML = \`
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
        <div class="card" style="border-color:rgba(16,185,129,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">PROMOTIONS</div>
          <div style="font-size:1.8rem; font-weight:700; color:#10b981;">\${promotions}</div>
        </div>
        <div class="card" style="border-color:rgba(139,92,246,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">HOLDS</div>
          <div style="font-size:1.8rem; font-weight:700; color:#a78bfa;">\${holds}</div>
        </div>
        <div class="card" style="border-color:rgba(107,114,128,.3);">
          <div style="font-size:11px; color:#6b7280; text-transform:uppercase; margin-bottom:.4rem;">NOTES</div>
          <div style="font-size:1.8rem; font-weight:700; color:#9ca3af;">\${notes}</div>
        </div>
      </div>

      \${items.length === 0
        ? '<div class="card" style="text-align:center; color:#6b7280; padding:2rem;">Belum ada history tersedia.</div>'
        : items.map(h => \`
          <div class="card" style="border-left:3px solid \${typeColor[h.type]||'#374151'};">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; margin-bottom:.4rem;">
              <div style="display:flex; align-items:center; gap:.5rem;">
                <span style="font-size:10px; background:#1f2937; color:\${typeColor[h.type]||'#6b7280'}; padding:2px 8px; border-radius:4px; font-weight:600;">\${h.type}</span>
                <span style="font-size:12px; color:#e2e8f0;">Level \${h.current_level}</span>
              </div>
              <div style="display:flex; gap:.4rem; align-items:center; flex-shrink:0;">
                <span style="font-size:11px; background:rgba(0,0,0,.3); color:\${outcomeColor[h.outcome]||'#6b7280'}; padding:2px 8px; border-radius:4px;">\${h.outcome}</span>
                <span style="font-size:11px; color:#6b7280;">\${formatDate(h.date)}</span>
              </div>
            </div>
            <p style="font-size:12px; color:#9ca3af;">\${h.summary}</p>
            \${h.next_review ? \`<div style="font-size:11px; color:#6b7280; margin-top:.4rem;"><i class="fas fa-calendar"></i> Next review: \${formatDate(h.next_review)}</div>\` : ''}
          </div>
        \`).join('')
      }
    \`
  } catch(e) {
    document.getElementById('history-content').innerHTML = '<div style="color:#f87171;font-size:12px;">Gagal memuat data.</div>'
  }
}
</script>`

  return c.html(ladderLayout({ title: 'Review History', activeNav: 'ladder', content }))
})

/**
 * GET /counterpart/ladder/notice — Ladder boundary notice
 */
accessLadderRouter.get('/ladder/notice', (c: Context<LadderContext>) => {
  const content = `
<div class="space-y-5">
  <div>
    <h1 style="font-size:1.4rem; font-weight:700; color:#e2e8f0; display:flex; align-items:center; gap:.5rem;">
      <i class="fas fa-triangle-exclamation" style="color:#fbbf24;"></i> Ladder Boundary Notice
    </h1>
    <p style="color:#6b7280; font-size:13px; margin-top:2px;">Batasan dan aturan eksplisit Access Ladder v1</p>
  </div>

  <div class="card" style="background:rgba(245,158,11,.05); border-color:rgba(245,158,11,.25);">
    <div style="font-size:13px; font-weight:700; color:#fbbf24; margin-bottom:.75rem;"><i class="fas fa-gavel"></i> ATURAN FUNDAMENTAL LADDER</div>
    <div style="display:flex; flex-direction:column; gap:.6rem;">
      ${[
        'Tidak ada promosi otomatis — semua level change membutuhkan founder review eksplisit',
        'Jumlah kontribusi banyak tidak otomatis menghasilkan promosi — kualitas dan alignment juga dinilai',
        'Founder dapat menolak, menunda, atau mencabut level kapan saja tanpa memberikan alasan',
        'Level 4 (Designated Partner) adalah founder-granted, bukan path yang bisa di-earned secara otomatis',
        'Counterpart tidak dapat self-promote atau claim level yang belum diberikan',
        'Boundary violations di level manapun dapat menyebabkan penolakan promosi atau regresi',
        'Access Ladder v1 adalah operational model — true level enforcement via multi-user auth system deferred',
      ].map(r => `
      <div style="display:flex; gap:.6rem; align-items:flex-start;">
        <i class="fas fa-lock" style="color:#f59e0b; font-size:10px; margin-top:3px; flex-shrink:0;"></i>
        <p style="font-size:12px; color:#9ca3af;">${r}</p>
      </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div style="font-size:12px; font-weight:600; color:#818cf8; margin-bottom:.75rem;"><i class="fas fa-sitemap"></i> POSISI LADDER DALAM HIERARCHY</div>
    <div style="display:flex; gap:.5rem; align-items:center; font-size:12px; color:#9ca3af; flex-wrap:wrap;">
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;"><i class="fas fa-circle-nodes" style="color:#818cf8;"></i> Hub</div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;"><i class="fas fa-landmark" style="color:#818cf8;"></i> Chamber</div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:#1f2937; padding:4px 12px; border-radius:6px; border:1px solid #374151;"><i class="fas fa-bridge" style="color:#f97316;"></i> Bridge</div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:rgba(16,185,129,.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(16,185,129,.3);"><i class="fas fa-handshake" style="color:#10b981;"></i> Counterpart Workspace</div>
      <i class="fas fa-arrow-right" style="color:#374151;"></i>
      <div style="background:rgba(139,92,246,.1); padding:4px 12px; border-radius:6px; border:1px solid rgba(139,92,246,.3);"><strong style="color:#c4b5fd;"><i class="fas fa-stairs"></i> Access Ladder</strong></div>
    </div>
    <p style="font-size:11px; color:#4b5563; margin-top:.75rem;">Access Ladder adalah layer paling downstream. Ladder menunjukkan posisi counterpart — tidak mengubah governance authority.</p>
  </div>

  <div class="card" style="border-color:rgba(139,92,246,.2);">
    <div style="font-size:12px; font-weight:600; color:#a78bfa; margin-bottom:.6rem;"><i class="fas fa-info-circle"></i> CATATAN JUJUR v1</div>
    <ul style="font-size:12px; color:#9ca3af; list-style:disc; padding-left:1.2rem; line-height:1.9;">
      <li>Access Ladder v1 adalah model operasional di bawah founder-controlled auth simulation</li>
      <li>True multi-user counterpart role system yang enforce level secara teknis deferred ke versi berikutnya</li>
      <li>v1 menyediakan clarity tentang level model dan earned access path — bukan enforcement runtime</li>
      <li>Counterpart dapat menggunakan ladder ini untuk memahami expectations dan track progress mereka</li>
    </ul>
  </div>

  <div style="display:flex; gap:.75rem; flex-wrap:wrap;">
    <a href="/counterpart/ladder" style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; padding:.5rem 1rem; border-radius:8px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;">
      <i class="fas fa-stairs" style="color:#a78bfa;"></i> Kembali ke Ladder
    </a>
    <a href="/counterpart/boundaries" style="background:#1f2937; border:1px solid #374151; color:#e2e8f0; padding:.5rem 1rem; border-radius:8px; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;">
      <i class="fas fa-shield-halved" style="color:#a78bfa;"></i> Workspace Boundaries
    </a>
  </div>
</div>

<script>
window.onLadderReady = function(token) { _token = token }
</script>`

  return c.html(ladderLayout({ title: 'Ladder Boundary Notice', activeNav: 'ladder', content }))
})
