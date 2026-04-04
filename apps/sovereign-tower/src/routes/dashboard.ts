// sovereign-tower — src/routes/dashboard.ts
// Dashboard routes — today-dashboard module
// Sovereign Business Engine v4.0 — Session 3b
//
// ⚠️ FOUNDER ACCESS ONLY
// Session 3b: wire ke Supabase DB dengan safe fallback jika env belum tersedia
//
// DB wiring pattern:
//   - Cek apakah SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ada di env
//   - Jika ada: query real data dari DB
//   - Jika tidak ada: return safe fallback (0 + note)
//   - TIDAK pernah throw error ke client karena DB tidak tersedia

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import { getRegistrySummary } from '../lib/module-registry'
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
// DASHBOARD ROUTER
// =============================================================================

const dashboardRouter = new Hono<TowerContext>()

// ⚠️ NOTE: Auth middleware sudah di-wire di app.ts level

/**
 * GET /api/dashboard
 * Dashboard root — available endpoints
 */
dashboardRouter.get('/', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  return c.json(
    successResponse({
      available_endpoints: [
        'GET /api/dashboard/today — today dashboard summary (with real DB if configured)',
      ],
      db_status: hasDbCredentials(c.env)
        ? 'DB credentials available — real data enabled'
        : 'DB credentials not configured — fallback mode (add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars)',
      session: '3b',
    })
  )
})

/**
 * GET /api/dashboard/today
 * Today Dashboard — ringkasan harian founder
 * Session 3b: wire ke Supabase DB dengan safe fallback
 *
 * DB queries (narrow scope):
 *   - countLeadsFromDb(db) → total leads count
 *   - getTotalRevenueFromDb(db) → total revenue sum from orders
 * Jika DB tidak configured → safe fallback dengan 0 dan note
 */
dashboardRouter.get('/today', async (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')
  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  const todayRaw = new Date().toISOString().split('T')[0]
  const today = todayRaw ?? new Date().toISOString()
  const registry = getRegistrySummary()

  // ── DB Wiring ──────────────────────────────────────────────────────────────
  const db = tryCreateDbClient(c.env)
  const dbAvailable = db !== null

  // Revenue data
  let revenueThisMonth = 0
  let revenueDbNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'

  // Lead data
  let leadsTotalCount = 0
  let leadsDbNote = 'DB not configured — add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .dev.vars'

  if (dbAvailable && db) {
    // Revenue: total from orders
    const revenueResult = await getTotalRevenueFromDb(db)
    if (revenueResult === null) {
      revenueDbNote = 'DB query returned null (table mungkin belum ada — run Sprint 1 migration)'
    } else {
      revenueThisMonth = revenueResult
      revenueDbNote = 'Live data from Supabase orders table'
    }

    // Leads: total count
    const leadsResult = await countLeadsFromDb(db)
    if (leadsResult === null) {
      leadsDbNote = 'DB query returned null (table mungkin belum ada)'
    } else {
      leadsTotalCount = leadsResult
      leadsDbNote = 'Live data from Supabase leads table'
    }
  }

  return c.json(
    successResponse({
      module: 'today-dashboard',
      title: 'Today Dashboard',
      date: today,
      session: '3b',
      auth: {
        verified: true,
        user_sub: payload.sub,
        user_role: payload.role,
        package: '@sovereign/auth v0.1.0 (WIRED)',
      },
      db_status: dbAvailable ? 'connected' : 'not-configured',

      // --- Revenue Summary ---
      revenue: {
        today_idr: 0,
        this_week_idr: 0,
        this_month_idr: revenueThisMonth,
        monthly_target_idr: 75_000_000,
        target_progress_pct:
          revenueThisMonth > 0
            ? Math.round((revenueThisMonth / 75_000_000) * 100)
            : 0,
        db_source: revenueDbNote,
        note: 'Per-day breakdown membutuhkan date filter (Session 3c)',
      },

      // --- Lead Summary ---
      leads: {
        new_today: 0,
        total: leadsTotalCount,
        qualified: 0,
        converted_this_month: 0,
        db_source: leadsDbNote,
        note: 'Per-day count membutuhkan created_at filter (Session 3c)',
      },

      // --- AI Activity (tidak berubah — Session 3c+) ---
      ai_activity: {
        agent_runs_today: 0,
        tokens_used_today: 0,
        estimated_cost_usd_today: 0,
        note: 'Session 3c: wire ke Supabase credit_ledger setelah Sprint 1 DB migration',
      },

      // --- WA Activity (tetap blocked) ---
      wa_activity: {
        messages_sent_today: 0,
        pending_approval: 0,
        fonnte_status: 'BLOCKED — FONNTE_TOKEN not available',
        note: 'WA integration blocked until FONNTE_TOKEN is configured',
      },

      // --- Build Status ---
      build_status: {
        current_phase: 'phase-3',
        current_session: '3b',
        sessions_done: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a', '3b'],
        next_session: '3c',
        module_registry: registry,
      },

      // --- Alerts ---
      alerts: [
        {
          level: 'warning',
          code: 'FONNTE_TOKEN_MISSING',
          message: 'FONNTE_TOKEN belum dikonfigurasi — WA blast tidak tersedia',
        },
        ...(dbAvailable
          ? []
          : [
              {
                level: 'info' as const,
                code: 'DB_NOT_CONFIGURED',
                message:
                  'SUPABASE_SERVICE_ROLE_KEY tidak ada di env — Tower berjalan dalam safe fallback mode. Tambahkan ke .dev.vars untuk data real.',
              },
            ]),
      ],
    })
  )
})

export { dashboardRouter }
