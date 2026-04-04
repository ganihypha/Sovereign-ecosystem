// sovereign-tower — src/routes/modules.ts
// Module routes — list semua modules + per-module endpoints
// Sovereign Business Engine v4.0 — Session 3b
//
// ⚠️ FOUNDER ACCESS ONLY
// Session 3b: revenue-ops endpoint wired ke @sovereign/db dengan safe fallback
// Session 3d: ai-resource-manager, decision-center, founder-review wired

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import {
  TOWER_MODULE_REGISTRY,
  getModuleById,
  getRegistrySummary,
} from '../lib/module-registry'
import type { SovereignAuthVariables } from '@sovereign/auth'
import {
  hasDbCredentials,
  tryCreateDbClient,
  getTotalRevenueFromDb,
  countLeadsFromDb,
  getAiTasksSummary,
  getRecentAiTasks,
  getCreditLedgerSummary,
  getWeeklyReviews,
  checkWeeklyReviewsTableExists,
} from '../lib/db-adapter'

// =============================================================================
// TYPES
// =============================================================================

type TowerContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

// =============================================================================
// MODULES ROUTER
// =============================================================================

const modulesRouter = new Hono<TowerContext>()

// ⚠️ NOTE: Auth middleware sudah di-wire di app.ts level

// =============================================================================
// MODULE LIST ROUTES
// =============================================================================

/**
 * GET /api/modules
 * List semua registered modules dengan metadata lengkap
 */
modulesRouter.get('/', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  const summary = getRegistrySummary()

  return c.json(
    successResponse({
      session: '3b',
      summary,
      modules: TOWER_MODULE_REGISTRY,
    })
  )
})

/**
 * GET /api/modules/build-ops
 * Build Ops module — Sprint log, session tracker, phase tracker
 * NOTE: must be defined BEFORE /:id to avoid param collision
 */
modulesRouter.get('/build-ops', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      module: 'build-ops',
      title: 'Build Ops',
      status: 'placeholder',
      session: '3d',
      purpose: 'Track sprint progress, session log, AI dev task tracker, phase migration status',
      current_phase: 'phase-3',
      sessions_completed: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a', '3b', '3c', '3c-live', '3d'],
      sessions_in_progress: [],
      next_session: '3e',
      dependency_note: 'Requires @sovereign/db for session_logs table and @sovereign/prompt-contracts for contract metadata',
      blockers: [],
      next_session_hint: 'Session 3e: Wire ke @sovereign/db session_logs + phase-tracker. Buat endpoint list + create session log.',
    })
  )
})

/**
 * GET /api/modules/ai-resource-manager
 * AI Resource Manager — Credit usage tracking
 * Session 3d: wired ke ai_tasks + credit_ledger live tables (read path)
 */
modulesRouter.get('/ai-resource-manager', async (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  // ── DB Wiring ────────────────────────────────────────────────────────────
  const db = tryCreateDbClient(c.env)
  const dbAvailable = db !== null

  let aiTasksSummary: { total: number; queued: number; running: number; done: number; failed: number } | null = null
  let recentTasks: any[] | null = null
  let creditSummary: { total_entries: number; total_credits_used: number; by_provider: Record<string, number> } | null = null
  let dbNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'

  if (dbAvailable && db) {
    aiTasksSummary = await getAiTasksSummary(db)
    recentTasks = await getRecentAiTasks(db, 5)
    creditSummary = await getCreditLedgerSummary(db)
    dbNote = 'Live data from Supabase ai_tasks + credit_ledger tables'
  }

  // Determine module status clearly
  const moduleStatus = !dbAvailable
    ? 'fallback'
    : aiTasksSummary !== null || creditSummary !== null
    ? 'db-wired'
    : 'db-connected-empty'

  return c.json(
    successResponse({
      module: 'ai-resource-manager',
      title: 'AI Resource Manager',
      status: moduleStatus,
      session: '3d',
      purpose: 'Track penggunaan token AI (Groq, OpenAI, Anthropic), estimasi cost, alert budget',
      db_status: dbAvailable ? 'connected' : 'not-configured',
      db_source: dbNote,

      // ai_tasks summary (live or empty-state)
      ai_tasks: aiTasksSummary !== null
        ? {
            source: 'live',
            total: aiTasksSummary.total,
            queued: aiTasksSummary.queued,
            running: aiTasksSummary.running,
            done: aiTasksSummary.done,
            failed: aiTasksSummary.failed,
          }
        : {
            source: dbAvailable ? 'empty' : 'fallback',
            total: 0,
            queued: 0,
            running: 0,
            done: 0,
            failed: 0,
            note: dbAvailable
              ? 'No ai_tasks rows yet — tabel live dan kosong'
              : 'DB not configured',
          },

      // recent tasks (up to 5)
      recent_tasks: recentTasks !== null
        ? {
            source: 'live',
            count: recentTasks.length,
            items: recentTasks,
          }
        : {
            source: dbAvailable ? 'empty' : 'fallback',
            count: 0,
            items: [],
          },

      // credit_ledger summary (live or empty-state)
      credit_usage: creditSummary !== null
        ? {
            source: 'live',
            total_entries: creditSummary.total_entries,
            total_credits_used: creditSummary.total_credits_used,
            by_provider: creditSummary.by_provider,
            estimated_cost_usd: 0, // cost calculation requires rate table — future sprint
          }
        : {
            source: dbAvailable ? 'empty' : 'fallback',
            total_entries: 0,
            total_credits_used: 0,
            by_provider: {},
            estimated_cost_usd: 0,
            note: dbAvailable
              ? 'No credit_ledger rows yet — tabel live dan kosong'
              : 'DB not configured',
          },

      // human-gate note (preserved from schema design)
      human_gate: {
        note: 'ai_tasks.requires_approval field available — irreversible agent actions require founder approval',
        requires_approval_pending: aiTasksSummary !== null && aiTasksSummary.queued > 0
          ? `${aiTasksSummary.queued} tasks queued — check requires_approval field before executing`
          : 'no pending approvals detected',
      },

      blockers: dbAvailable ? [] : ['SUPABASE_SERVICE_ROLE_KEY missing from env'],
      next_session_hint: 'Session 3e: Add write path — POST /api/modules/ai-resource-manager/tasks untuk create ai_task entry.',
    })
  )
})

/**
 * GET /api/modules/revenue-ops
 * Revenue Ops — Revenue dashboard, orders, konversi
 * Session 3b: wire ke @sovereign/db orders table dengan safe fallback
 */
modulesRouter.get('/revenue-ops', async (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  // ── DB Wiring ──────────────────────────────────────────────────────────────
  const db = tryCreateDbClient(c.env)
  const dbAvailable = db !== null

  let totalRevenueIdr = 0
  let totalLeads = 0
  let revenueNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'
  let leadsNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'

  if (dbAvailable && db) {
    // Revenue total
    const revenueRaw = await getTotalRevenueFromDb(db)
    if (revenueRaw === null) {
      revenueNote = 'DB query returned null (table mungkin belum ada)'
    } else {
      totalRevenueIdr = revenueRaw
      revenueNote = 'Live data from Supabase orders table'
    }

    // Lead count
    const leadsRaw = await countLeadsFromDb(db)
    if (leadsRaw === null) {
      leadsNote = 'DB query returned null'
    } else {
      totalLeads = leadsRaw
      leadsNote = 'Live data from Supabase leads table'
    }
  }

  return c.json(
    successResponse({
      module: 'revenue-ops',
      title: 'Revenue Ops',
      status: dbAvailable ? 'db-wired' : 'fallback',
      session: '3b',
      purpose: 'Monitor revenue harian/mingguan, tracking orders, konversi lead → customer',
      db_status: dbAvailable ? 'connected' : 'not-configured',
      revenue_target: {
        monthly_target_idr: 75_000_000,
        current_total_idr: totalRevenueIdr,
        target_progress_pct:
          totalRevenueIdr > 0
            ? Math.round((totalRevenueIdr / 75_000_000) * 100)
            : 0,
        db_source: revenueNote,
      },
      leads_summary: {
        total_leads: totalLeads,
        db_source: leadsNote,
      },
      dependency_note: 'Requires @sovereign/db (orders, leads tables)',
      blockers: dbAvailable ? [] : ['SUPABASE_SERVICE_ROLE_KEY missing from env'],
      next_session_hint: 'Session 3c: Add date range filtering for daily/weekly revenue breakdown.',
    })
  )
})

/**
 * GET /api/modules/proof-center
 * Proof Center — Bukti nyata & CCA evidence
 */
modulesRouter.get('/proof-center', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      module: 'proof-center',
      title: 'Proof Center',
      status: 'placeholder',
      session: '3b',
      purpose: 'Kumpulkan bukti nyata: screenshot revenue, lead conversions, WA transactions, AI outputs. CCA-F evidence vault.',
      proof_categories: [
        'revenue-screenshots',
        'lead-conversions',
        'wa-transactions',
        'ai-outputs',
        'cca-evidence',
      ],
      cca_domains: {
        'domain-1-agentic': 'scaffold ✅',
        'domain-2-responsible': 'scaffold ✅',
        'domain-3-claude-code': 'scaffold ✅',
        'domain-4-testing': 'scaffold ✅',
        'domain-5-architecture': 'scaffold ✅',
      },
      dependency_note: 'Requires @sovereign/db + Cloudflare R2 for file storage',
      blockers: [],
      next_session_hint: 'Session 3c: Buat POST /api/modules/proof-center endpoint untuk add proof entry. Wire ke DB.',
    })
  )
})

/**
 * GET /api/modules/decision-center
 * Decision Center — ADR management
 * Session 3d: wired ke evidence/architecture ADR list (static read dari canonical source)
 *
 * Pola: ADR data embedded sebagai static manifest di code.
 * Rationale: ADR files di /evidence/architecture/ tidak bisa dibaca runtime (Cloudflare Workers = no fs).
 * ADR manifest di-sync manual setiap session sesuai file yang ada di evidence/architecture/.
 * ADR-010: Decision Center wiring pattern (lihat bawah)
 */
modulesRouter.get('/decision-center', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  // Static ADR manifest — synced dari evidence/architecture/ di session 3d
  // Format: { id, title, status, date, file, summary }
  const adrManifest = [
    {
      id: 'ADR-001',
      title: 'Monorepo dengan Turborepo',
      status: 'ACCEPTED',
      date: '2026-04-03',
      file: 'evidence/architecture/ADR-001-monorepo-turborepo.md',
      summary: 'Gunakan Turborepo monorepo sebagai canonical home untuk semua packages + apps',
    },
    {
      id: 'ADR-002',
      title: 'DB Schema Pattern — Supabase Canonical',
      status: 'ACCEPTED',
      date: '2026-04-03',
      file: 'evidence/architecture/ADR-002-db-schema-pattern.md',
      summary: 'Satu canonical Supabase project (sovereign-main) sebagai single source of truth',
    },
    {
      id: 'ADR-003',
      title: 'Auth Pattern — @sovereign/auth JWT',
      status: 'ACCEPTED',
      date: '2026-04-03',
      file: 'evidence/architecture/ADR-003-auth-pattern.md',
      summary: 'Shared JWT auth via @sovereign/auth, HS256 Web Crypto API, founderOnly middleware',
    },
    {
      id: 'ADR-004',
      title: 'Integrations — Contract-First Approach',
      status: 'ACCEPTED',
      date: '2026-04-03',
      file: 'evidence/architecture/ADR-004-integrations-pattern.md',
      summary: 'Semua external API via typed contracts di @sovereign/integrations',
    },
    {
      id: 'ADR-005',
      title: 'Pure TypeScript untuk prompt-contracts validation',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-005-prompt-contracts-ts.md',
      summary: 'Prompt validation menggunakan pure TypeScript type guards, bukan runtime schema library',
    },
    {
      id: 'ADR-006',
      title: 'Auth deferred to Session 3b (dari Session 3a)',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-006-auth-deferred-3b.md',
      summary: 'Auth wiring dideferred dari 3a ke 3b untuk memisahkan scaffold dari auth complexity',
    },
    {
      id: 'ADR-007',
      title: 'Auth wiring via app-level middleware /api/*',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-007-app-level-auth.md',
      summary: 'JWT + founderOnly di-wire di app.ts level bukan per-route untuk maintainability',
    },
    {
      id: 'ADR-008',
      title: 'DB wiring narrow-scoped: db-adapter pattern',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-008-db-adapter-pattern.md',
      summary: 'DB access via thin adapter layer (db-adapter.ts) tanpa @sovereign/db wrapper untuk hindari type cascade',
    },
    {
      id: 'ADR-009',
      title: 'Sprint 1 Migration Hardening Pattern',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-009-migration-hardening-pattern.md',
      summary: 'Semua migration files harus punya pre-run checklist, rollback script, dry-run queries, post-run verification',
    },
    {
      id: 'ADR-010',
      title: 'Decision Center wiring: static ADR manifest',
      status: 'ACCEPTED',
      date: '2026-04-04',
      file: 'evidence/architecture/ADR-010-decision-center-static-manifest.md',
      summary: 'ADR manifest di-embed sebagai static data karena Cloudflare Workers tidak bisa baca filesystem. Sync manual per session.',
    },
  ]

  const acceptedCount = adrManifest.filter((a) => a.status === 'ACCEPTED').length
  const pendingCount = adrManifest.filter((a) => a.status === 'PROPOSED').length
  const supersededCount = adrManifest.filter((a) => a.status === 'SUPERSEDED').length

  return c.json(
    successResponse({
      module: 'decision-center',
      title: 'Decision Center',
      status: 'wired',
      session: '3d',
      purpose: 'Kelola Architecture Decision Records (ADR), keputusan strategis, governance log',

      // ADR summary
      adr_summary: {
        source: 'static-manifest',
        source_note: 'ADR manifest embedded in code — synced from evidence/architecture/ at session 3d. ADR-010 documents this pattern.',
        total: adrManifest.length,
        accepted: acceptedCount,
        pending: pendingCount,
        superseded: supersededCount,
      },

      // Full ADR list
      adrs: adrManifest,

      // Next step
      next_step: {
        action: 'Add new ADRs ke adrManifest array di modules.ts setiap ada keputusan arsitektur baru',
        post_3d: 'Session 3e: optionally add POST /api/modules/decision-center/adr endpoint untuk submit ADR via form',
      },

      dependency_note: 'Static manifest — tidak butuh DB. ADR files ada di evidence/architecture/ di repo.',
      blockers: [],
      next_session_hint: 'Session 3e: Add POST endpoint untuk create ADR draft. Wire ke DB jika decision_logs table tersedia.',
    })
  )
})

/**
 * GET /api/modules/founder-review
 * Founder Review — Weekly 5-question reflection
 * Session 3d: try to wire ke weekly_reviews table — safe fallback jika tabel belum ada
 *
 * Pattern: check table existence first, jika tidak ada → fallback ke review template
 * Tidak menginvent fake persistence.
 */
modulesRouter.get('/founder-review', async (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  // Review template (always available as fallback)
  const reviewTemplate = {
    questions: [
      '1. Revenue progress minggu ini vs target Rp 75jt/bulan?',
      '2. Build progress — session selesai, blocker yang ada?',
      '3. Keputusan arsitektur yang dibuat minggu ini?',
      '4. Lesson learned / kesalahan yang harus dihindari?',
      '5. Top 3 prioritas minggu depan?',
    ],
  }

  // Phase/evidence-based status (static fallback source)
  const evidenceStatus = {
    source: 'phase-tracker + session-summaries',
    sessions_completed: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a', '3b', '3c', '3c-live', '3d'],
    current_phase: 'phase-3',
    last_session: '3d',
    live_gate_passed: true,
    active_blockers: ['FONNTE_TOKEN missing (WA routes)'],
    recent_adrs: ['ADR-009: migration hardening', 'ADR-010: decision-center static manifest'],
  }

  // ── DB Wiring (dengan fallback aman) ────────────────────────────────────
  const db = tryCreateDbClient(c.env)
  const dbAvailable = db !== null

  let tableExists = false
  let reviews: any[] | null = null
  let reviewsSource = 'fallback'
  let reviewsNote = 'DB not configured'

  if (dbAvailable && db) {
    tableExists = await checkWeeklyReviewsTableExists(db)

    if (tableExists) {
      reviews = await getWeeklyReviews(db, 5)
      reviewsSource = reviews !== null && reviews.length > 0 ? 'live' : 'live-empty'
      reviewsNote = reviews !== null && reviews.length > 0
        ? `${reviews.length} reviews dari weekly_reviews table`
        : 'weekly_reviews table ada tapi kosong — belum ada review yang disimpan'
    } else {
      reviewsSource = 'fallback'
      reviewsNote = 'DB connected tapi weekly_reviews table belum ada — using evidence-based fallback'
    }
  } else {
    reviewsNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'
  }

  // Module status label
  const moduleStatus = !dbAvailable
    ? 'fallback'
    : tableExists && reviews && reviews.length > 0
    ? 'db-wired'
    : tableExists
    ? 'db-wired-empty'
    : 'fallback'

  return c.json(
    successResponse({
      module: 'founder-review',
      title: 'Founder Review',
      status: moduleStatus,
      session: '3d',
      purpose: 'Weekly 5-question founder reflection. Structured thinking tool.',
      db_status: dbAvailable ? 'connected' : 'not-configured',
      weekly_reviews_table: dbAvailable
        ? tableExists
          ? 'EXISTS'
          : 'NOT_FOUND — table belum dibuat (bukan Sprint 1 scope)'
        : 'UNKNOWN — DB not configured',

      // Review data (live jika ada, fallback ke evidence status)
      reviews: {
        source: reviewsSource,
        note: reviewsNote,
        count: reviews?.length ?? 0,
        items: reviews ?? [],
      },

      // Evidence-based current status (always available, tidak bergantung DB)
      current_status: evidenceStatus,

      // Review template (always available)
      review_template: reviewTemplate,

      // Fallback mode explanation
      fallback_mode: moduleStatus === 'fallback'
        ? {
            active: true,
            reason: reviewsNote,
            using: 'phase-tracker + session-summaries as evidence base',
            action_required: tableExists
              ? 'Tambahkan review entry via POST endpoint (future)'
              : 'weekly_reviews table belum dibuat — add ke Sprint 2 scope jika needed',
          }
        : { active: false },

      blockers: dbAvailable ? [] : ['SUPABASE_SERVICE_ROLE_KEY missing from env'],
      next_session_hint: 'Session 3e: Add POST /api/modules/founder-review endpoint untuk submit weekly review. Wire ke DB (create weekly_reviews table jika diperlukan).',
    })
  )
})

/**
 * GET /api/modules/:id
 * Get satu module by ID — generic lookup
 * NOTE: must be defined AFTER specific named routes
 */
modulesRouter.get('/:id', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  const id = c.req.param('id') ?? ''
  const mod = getModuleById(id)

  if (!mod) {
    return c.json(
      errorResponse(
        'NOT_FOUND',
        `Module '${id}' tidak ditemukan. Available: ${TOWER_MODULE_REGISTRY.map((m) => m.id).join(', ')}`
      ),
      404
    )
  }

  return c.json(successResponse(mod))
})

export { modulesRouter }
