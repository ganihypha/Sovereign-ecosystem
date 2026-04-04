// sovereign-tower — src/routes/modules.ts
// Module routes — list semua modules + per-module endpoints
// Sovereign Business Engine v4.0 — Session 3b
//
// ⚠️ FOUNDER ACCESS ONLY
// Session 3b: revenue-ops endpoint wired ke @sovereign/db dengan safe fallback

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
      session: '3b',
      purpose: 'Track sprint progress, session log, AI dev task tracker, phase migration status',
      current_phase: 'phase-3',
      sessions_completed: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a', '3b'],
      sessions_in_progress: [],
      next_session: '3c',
      dependency_note: 'Requires @sovereign/db for session_logs table and @sovereign/prompt-contracts for contract metadata',
      blockers: [],
      next_session_hint: 'Session 3c: Wire ke @sovereign/db session_logs + phase-tracker. Buat endpoint list + create session log.',
    })
  )
})

/**
 * GET /api/modules/ai-resource-manager
 * AI Resource Manager — Credit usage tracking
 */
modulesRouter.get('/ai-resource-manager', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      module: 'ai-resource-manager',
      title: 'AI Resource Manager',
      status: 'placeholder',
      session: '3b',
      purpose: 'Track penggunaan token AI (Groq, OpenAI, Anthropic), estimasi cost, alert budget',
      current_usage: {
        note: 'Placeholder — real data needs credit_ledger table from Sprint 1 DB migration',
        groq_calls: 0,
        openai_calls: 0,
        anthropic_calls: 0,
        estimated_cost_usd: 0,
      },
      dependency_note: 'Requires @sovereign/db credit_ledger table (Sprint 1 migration) + @sovereign/integrations',
      blockers: ['credit_ledger table not yet migrated — Sprint 1 needed'],
      next_session_hint: 'Session 3c: Run Sprint 1 DB migration (ai_tasks, credit_ledger tables). Wire endpoint ke DB.',
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
 */
modulesRouter.get('/decision-center', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      module: 'decision-center',
      title: 'Decision Center',
      status: 'placeholder',
      session: '3b',
      purpose: 'Kelola Architecture Decision Records (ADR), keputusan strategis, governance log',
      existing_adrs: [
        'ADR-001: Cloudflare stack',
        'ADR-002: Monorepo dengan Turborepo',
        'ADR-003: Supabase sebagai canonical database',
        'ADR-004: @sovereign/integrations contract-first approach',
        'ADR-005: Pure TypeScript untuk prompt-contracts validation',
        'ADR-006: Auth deferred to Session 3b (Session 3a)',
        'ADR-007: Auth wiring via app-level middleware /api/* (Session 3b)',
      ],
      dependency_note: 'Requires @sovereign/db decision_logs table atau markdown files di /evidence/architecture/',
      blockers: [],
      next_session_hint: 'Session 3c: Buat list + create ADR endpoint. Wire ke DB atau file system.',
    })
  )
})

/**
 * GET /api/modules/founder-review
 * Founder Review — Weekly 5-question reflection
 */
modulesRouter.get('/founder-review', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      module: 'founder-review',
      title: 'Founder Review',
      status: 'placeholder',
      session: '3b',
      purpose: 'Weekly 5-question founder reflection. Structured thinking tool.',
      review_format: {
        questions: [
          '1. Revenue progress minggu ini vs target Rp 75jt/bulan?',
          '2. Build progress — session selesai, blocker yang ada?',
          '3. Keputusan arsitektur yang dibuat minggu ini?',
          '4. Lesson learned / kesalahan yang harus dihindari?',
          '5. Top 3 prioritas minggu depan?',
        ],
      },
      dependency_note: 'Requires @sovereign/db weekly_reviews table',
      blockers: [],
      next_session_hint: 'Session 3c: Buat POST + GET /api/modules/founder-review endpoint. Wire ke DB.',
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
