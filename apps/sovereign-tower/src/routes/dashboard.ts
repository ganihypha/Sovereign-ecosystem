// sovereign-tower — src/routes/dashboard.ts
// Dashboard routes — today-dashboard module
// Sovereign Business Engine v4.0 — Session 3a
//
// ⚠️ FOUNDER ACCESS ONLY
// Session 3a: returns structured placeholder response
// Session 3b: wire ke @sovereign/db untuk real metrics

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import { getRegistrySummary } from '../lib/module-registry'

// =============================================================================
// DASHBOARD ROUTER
// =============================================================================

const dashboardRouter = new Hono<{ Bindings: TowerEnv }>()

/** Internal: lightweight header check untuk Session 3a scaffold */
function requireBearerToken(authHeader: string | undefined): boolean {
  return (authHeader ?? '').startsWith('Bearer ')
}

/**
 * GET /api/dashboard
 * Dashboard root — available endpoints
 */
dashboardRouter.get('/', (c: Context<{ Bindings: TowerEnv }>) => {
  if (!requireBearerToken(c.req.header('Authorization'))) {
    return c.json(errorResponse('UNAUTHORIZED', 'Bearer token required'), 401)
  }

  return c.json(
    successResponse({
      available_endpoints: [
        'GET /api/dashboard/today — today dashboard summary',
      ],
      note: 'Session 3a scaffold — real metrics in Session 3b',
    })
  )
})

/**
 * GET /api/dashboard/today
 * Today Dashboard — ringkasan harian founder
 * Session 3a: placeholder dengan struktur lengkap
 * Session 3b: wire ke @sovereign/db untuk real data
 */
dashboardRouter.get('/today', (c: Context<{ Bindings: TowerEnv }>) => {
  if (!requireBearerToken(c.req.header('Authorization'))) {
    return c.json(errorResponse('UNAUTHORIZED', 'Bearer token required'), 401)
  }

  const todayRaw = new Date().toISOString().split('T')[0]
  const today = todayRaw ?? new Date().toISOString()
  const registry = getRegistrySummary()

  return c.json(
    successResponse({
      module: 'today-dashboard',
      title: 'Today Dashboard',
      date: today,
      status: 'placeholder',

      // --- Revenue Summary (placeholder) ---
      revenue: {
        today_idr: 0,
        this_week_idr: 0,
        this_month_idr: 0,
        monthly_target_idr: 75_000_000,
        target_progress_pct: 0,
        note: 'Placeholder — wire ke @sovereign/db orders table in Session 3b',
      },

      // --- Lead Summary (placeholder) ---
      leads: {
        new_today: 0,
        total_active: 0,
        qualified: 0,
        converted_this_month: 0,
        note: 'Placeholder — wire ke @sovereign/db leads table in Session 3b',
      },

      // --- AI Activity (placeholder) ---
      ai_activity: {
        agent_runs_today: 0,
        tokens_used_today: 0,
        estimated_cost_usd_today: 0,
        note: 'Placeholder — wire ke @sovereign/db credit_ledger in Session 3b',
      },

      // --- WA Activity (placeholder) ---
      wa_activity: {
        messages_sent_today: 0,
        pending_approval: 0,
        fonnte_status: 'BLOCKED — FONNTE_TOKEN not available',
        note: 'WA integration blocked until FONNTE_TOKEN is configured',
      },

      // --- Build Status ---
      build_status: {
        current_phase: 'phase-3',
        current_session: '3a',
        sessions_done: ['0', '1', '2a', '2b', '2c', '2d', '2e', '3a'],
        next_session: '3b',
        module_registry: registry,
      },

      // --- Alerts ---
      alerts: [
        {
          level: 'warning',
          code: 'FONNTE_TOKEN_MISSING',
          message: 'FONNTE_TOKEN belum dikonfigurasi — WA blast tidak tersedia',
        },
        {
          level: 'info',
          code: 'SCAFFOLD_ONLY',
          message: 'Session 3a: semua modul masih placeholder. Session 3b akan wire ke DB.',
        },
      ],
    })
  )
})

export { dashboardRouter }
