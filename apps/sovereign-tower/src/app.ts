// sovereign-tower — src/app.ts
// Main Hono Application — route registration + middleware setup
// Sovereign Business Engine v4.0 — Session 3a
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️

import { Hono } from 'hono'
import type { Context, MiddlewareHandler } from 'hono'
import type { TowerEnv } from './lib/app-config'
import { TOWER_APP_NAME, TOWER_APP_VERSION, errorResponse } from './lib/app-config'

// Route handlers
import { healthRouter } from './routes/health'
import { founderRouter } from './routes/founder'
import { modulesRouter } from './routes/modules'
import { dashboardRouter } from './routes/dashboard'

// =============================================================================
// APP FACTORY
// =============================================================================

type TowerApp = Hono<{ Bindings: TowerEnv }>

/**
 * Buat Sovereign Tower Hono app.
 * Di-export sebagai factory function untuk testability.
 * Dipanggil dari src/index.ts sebagai Cloudflare Worker handler.
 */
export function createApp(): TowerApp {
  const app: TowerApp = new Hono<{ Bindings: TowerEnv }>()

  // ─────────────────────────────────────────────────────────────────────────
  // GLOBAL MIDDLEWARE
  // ─────────────────────────────────────────────────────────────────────────

  // CORS — restricted ke localhost di development
  // Session 3b: update allowed origins untuk production domain
  const corsMiddleware: MiddlewareHandler = async (c, next) => {
    await next()
    c.res.headers.set('Access-Control-Allow-Origin', 'http://localhost:3001')
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  app.use('*', corsMiddleware)

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH MIDDLEWARE NOTE (Session 3a → 3b)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Session 3a: auth check dilakukan per-route (manual Bearer header check)
  //
  // Session 3b wire-up (tidak dilakukan sekarang):
  //   import { jwtMiddleware, founderOnly } from '@sovereign/auth'
  //   app.use('/api/*', (c, next) => jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next))
  //   app.use('/api/founder/*', founderOnly())
  //   app.use('/api/modules/*', founderOnly())
  //   app.use('/api/dashboard/*', founderOnly())
  //
  // Alasan di-defer: workspace:* package resolution membutuhkan
  // npm install di monorepo root. Scaffold tetap valid dan siap di-wire.

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  // --- Public Routes (no auth required) ---
  app.route('/health', healthRouter)

  // --- Founder-Protected Routes ---
  app.route('/api/founder', founderRouter)
  app.route('/api/modules', modulesRouter)
  app.route('/api/dashboard', dashboardRouter)

  // ─────────────────────────────────────────────────────────────────────────
  // ROOT + FALLBACK
  // ─────────────────────────────────────────────────────────────────────────

  /** GET / — App info */
  app.get('/', (c: Context<{ Bindings: TowerEnv }>) => {
    return c.json({
      app: TOWER_APP_NAME,
      version: TOWER_APP_VERSION,
      description: 'Private Founder-Only Command Center — Sovereign Business Engine v4.0',
      session: '3a',
      phase: 'phase-3',
      access: 'FOUNDER ONLY — requires valid JWT',
      endpoints: {
        public: ['GET /health', 'GET /health/status'],
        founder_protected: [
          'GET /api/founder/profile',
          'GET /api/founder/tower-status',
          'GET /api/modules',
          'GET /api/modules/:id',
          'GET /api/modules/build-ops',
          'GET /api/modules/ai-resource-manager',
          'GET /api/modules/revenue-ops',
          'GET /api/modules/proof-center',
          'GET /api/modules/decision-center',
          'GET /api/modules/founder-review',
          'GET /api/dashboard',
          'GET /api/dashboard/today',
        ],
      },
      notice:
        'Session 3a: scaffold only — all module endpoints return structured placeholder responses. Wire to @sovereign/db + full auth in Session 3b.',
    })
  })

  /** 404 fallback */
  app.notFound((c: Context<{ Bindings: TowerEnv }>) => {
    return c.json(
      errorResponse(
        'NOT_FOUND',
        `Route '${c.req.method} ${c.req.path}' tidak ditemukan di Sovereign Tower`,
        { available_docs: 'GET /' }
      ),
      404
    )
  })

  /** Global error handler */
  app.onError((err: Error, c: Context<{ Bindings: TowerEnv }>) => {
    return c.json(
      errorResponse('INTERNAL_ERROR', `Internal server error: ${err.message}`),
      500
    )
  })

  return app
}

export type SovereignTowerApp = ReturnType<typeof createApp>
