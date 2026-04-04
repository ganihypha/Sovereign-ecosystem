// sovereign-tower — src/routes/dashboard.ts
// Dashboard routes — today-dashboard module
// Sovereign Business Engine v4.0 — Session 3b
//
// ⚠️ FOUNDER ACCESS ONLY
// Session 3b: wire ke Supabase DB dengan safe fallback jika env belum tersedia
// Session 3d: add date-range filter untuk revenue + leads breakdown
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
  getRevenueWithDateRange,
  countLeadsWithDateRange,
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
 * Session 3d: add optional date_from + date_to query params untuk filtered view
 *
 * Query params (optional):
 *   ?date_from=2026-04-01   (ISO date string YYYY-MM-DD)
 *   ?date_to=2026-04-04     (ISO date string YYYY-MM-DD)
 *   Jika tidak diberikan → query all (total without date filter)
 *
 * DB queries:
 *   - countLeadsWithDateRange(db, dateFrom, dateTo) → leads in range
 *   - getRevenueWithDateRange(db, dateFrom, dateTo) → revenue in range
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

  // ── Parse optional date-range query params ─────────────────────────────
  const dateFrom = c.req.query('date_from') ?? undefined
  const dateTo = c.req.query('date_to') ?? undefined

  // Simple ISO date validation (YYYY-MM-DD)
  const isValidDate = (d: string | undefined): boolean => {
    if (!d) return true // undefined = no filter, valid
    return /^\d{4}-\d{2}-\d{2}$/.test(d)
  }

  if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
    return c.json(
      errorResponse(
        'INVALID_PARAMS',
        'date_from dan date_to harus dalam format YYYY-MM-DD (contoh: 2026-04-01)'
      ),
      400
    )
  }

  const hasDateFilter = !!(dateFrom || dateTo)

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
    // Revenue: use date-range filter if provided, otherwise total
    const revenueResult = hasDateFilter
      ? await getRevenueWithDateRange(db, dateFrom, dateTo)
      : await getTotalRevenueFromDb(db)

    if (revenueResult === null) {
      revenueDbNote = 'DB query returned null (table mungkin belum ada — run Sprint 1 migration)'
    } else {
      revenueThisMonth = revenueResult
      revenueDbNote = hasDateFilter
        ? `Live data from orders table — filtered: ${dateFrom ?? 'start'} to ${dateTo ?? 'now'}`
        : 'Live data from Supabase orders table (all time)'
    }

    // Leads: use date-range filter if provided, otherwise total
    const leadsResult = hasDateFilter
      ? await countLeadsWithDateRange(db, dateFrom, dateTo)
      : await countLeadsFromDb(db)

    if (leadsResult === null) {
      leadsDbNote = 'DB query returned null (table mungkin belum ada)'
    } else {
      leadsTotalCount = leadsResult
      leadsDbNote = hasDateFilter
        ? `Live data from leads table — filtered: ${dateFrom ?? 'start'} to ${dateTo ?? 'now'}`
        : 'Live data from Supabase leads table (all time)'
    }
  }

  return c.json(
    successResponse({
      module: 'today-dashboard',
      title: 'Today Dashboard',
      date: today,
      session: '3d',
      auth: {
        verified: true,
        user_sub: payload.sub,
        user_role: payload.role,
        package: '@sovereign/auth v0.1.0 (WIRED)',
      },
      db_status: dbAvailable ? 'connected' : 'not-configured',

      // Date filter info
      date_filter: hasDateFilter
        ? {
            active: true,
            date_from: dateFrom ?? null,
            date_to: dateTo ?? null,
            note: 'Revenue + leads data filtered by created_at range',
          }
        : {
            active: false,
            note: 'No date filter — showing all-time totals. Use ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD to filter.',
          },

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
        note: hasDateFilter
          ? 'Revenue difilter sesuai date_from/date_to param'
          : 'All-time total revenue. Gunakan ?date_from=&date_to= untuk breakdown harian/mingguan.',
      },

      // --- Lead Summary ---
      leads: {
        new_today: 0,
        total: leadsTotalCount,
        qualified: 0,
        converted_this_month: 0,
        db_source: leadsDbNote,
        note: hasDateFilter
          ? 'Leads difilter sesuai date_from/date_to param'
          : 'All-time total leads. Gunakan ?date_from=&date_to= untuk breakdown.',
      },

      // --- AI Activity (tidak berubah — Session 3d: wire via ai-resource-manager) ---
      ai_activity: {
        agent_runs_today: 0,
        tokens_used_today: 0,
        estimated_cost_usd_today: 0,
        note: 'Session 3d: AI data tersedia via GET /api/modules/ai-resource-manager (wired ke ai_tasks + credit_ledger)',
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
        current_session: '3d',
        sessions_done: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a', '3b', '3c', '3c-live', '3d'],
        next_session: '3e',
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
