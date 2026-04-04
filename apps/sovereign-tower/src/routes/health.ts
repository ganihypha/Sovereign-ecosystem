// sovereign-tower — src/routes/health.ts
// Public health check routes — no auth required
// Sovereign Business Engine v4.0 — Session 3a

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import {
  TOWER_APP_NAME,
  TOWER_APP_VERSION,
  TOWER_BUILD_SESSION,
  TOWER_PHASE,
  successResponse,
} from '../lib/app-config'
import { getRegistrySummary } from '../lib/module-registry'

// =============================================================================
// HEALTH ROUTER
// =============================================================================

const healthRouter = new Hono<{ Bindings: TowerEnv }>()

/**
 * GET /health
 * Public health check — no auth required
 * Dipakai oleh Cloudflare health monitoring dan CI/CD pipelines
 */
healthRouter.get('/', (c: Context<{ Bindings: TowerEnv }>) => {
  return c.json(
    successResponse({
      status: 'ok',
      app: TOWER_APP_NAME,
      version: TOWER_APP_VERSION,
      build_session: TOWER_BUILD_SESSION,
      phase: TOWER_PHASE,
      environment: c.env.ENVIRONMENT ?? 'development',
      uptime: 'edge-stateless',
    })
  )
})

/**
 * GET /health/status
 * Detailed status — includes module registry summary
 * Public — no auth required
 */
healthRouter.get('/status', (c: Context<{ Bindings: TowerEnv }>) => {
  const registry = getRegistrySummary()

  return c.json(
    successResponse({
      status: 'ok',
      app: TOWER_APP_NAME,
      version: TOWER_APP_VERSION,
      build_session: TOWER_BUILD_SESSION,
      phase: TOWER_PHASE,
      module_registry: registry,
      integrations: {
        supabase: c.env.SUPABASE_URL ? 'configured' : 'missing-env',
        jwt: c.env.JWT_SECRET ? 'configured' : 'missing-env',
        fonnte: c.env.FONNTE_TOKEN ? 'configured' : 'BLOCKED — token not available',
        groq: c.env.GROQ_API_KEY ? 'configured' : 'not-configured',
      },
      notice: 'Session 3a — scaffold only. All module endpoints return placeholder responses.',
    })
  )
})

export { healthRouter }
