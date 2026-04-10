// sovereign-tower — src/app.ts
// Main Hono Application — route registration + middleware setup
// Sovereign Business Engine v4.0 — Session 3b
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️

import { Hono } from 'hono'
import type { Context, MiddlewareHandler } from 'hono'
import type { TowerEnv } from './lib/app-config'
import { TOWER_APP_NAME, TOWER_APP_VERSION, errorResponse } from './lib/app-config'

// @sovereign/auth — real shared auth wiring (Session 3b upgrade dari placeholder)
import { jwtMiddleware, founderOnly } from '@sovereign/auth'
import type { SovereignAuthVariables } from '@sovereign/auth'

// Route handlers
import { healthRouter } from './routes/health'
import { founderRouter } from './routes/founder'
import { modulesRouter } from './routes/modules'
import { dashboardRouter } from './routes/dashboard'
import { waRouter } from './routes/wa'
import { agentsRouter } from './routes/agents'
import { founderDashboardRouter } from './routes/founder-dashboard'

// =============================================================================
// APP FACTORY
// =============================================================================

/**
 * TowerApp — Hono app type dengan:
 * - Bindings: TowerEnv (Cloudflare env vars)
 * - Variables: SovereignAuthVariables (jwtPayload dari @sovereign/auth middleware)
 *
 * Session 3b: Full auth wiring via @sovereign/auth jwtMiddleware + founderOnly
 */
type TowerApp = Hono<{ Bindings: TowerEnv; Variables: SovereignAuthVariables }>

/**
 * Buat Sovereign Tower Hono app.
 * Di-export sebagai factory function untuk testability.
 * Dipanggil dari src/index.ts sebagai Cloudflare Worker handler.
 */
export function createApp(): TowerApp {
  const app: TowerApp = new Hono<{ Bindings: TowerEnv; Variables: SovereignAuthVariables }>()

  // ─────────────────────────────────────────────────────────────────────────
  // GLOBAL MIDDLEWARE
  // ─────────────────────────────────────────────────────────────────────────

  // CORS — restricted ke localhost di development
  // Session 3b: update allowed origins untuk production domain
  const corsMiddleware: MiddlewareHandler = async (c, next) => {
    await next()
    const origin = c.req.header('origin') || ''
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://sovereign-tower.pages.dev',
    ]
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    c.res.headers.set('Access-Control-Allow-Origin', allowOrigin)
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  app.use('*', corsMiddleware)

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH MIDDLEWARE — Session 3b Real Wiring
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Session 3a: auth check dilakukan per-route (manual Bearer header check)
  //
  // Session 3b UPGRADE:
  //   - jwtMiddleware verify token cryptographically via @sovereign/auth (Web Crypto API)
  //   - founderOnly() enforce role === 'founder' untuk semua /api/* routes
  //   - c.get('jwtPayload') tersedia di semua route handlers setelah middleware pass
  //
  // ADR-007: Auth wiring via app-level middleware (tidak per-route)
  //   → Lebih maintainable, satu tempat untuk semua /api/* protection
  //   → Route handlers bisa fokus ke business logic
  //
  // ⚠️ JWT_SECRET WAJIB ada di env vars. Jika tidak ada:
  //   - Development: tambahkan ke .dev.vars
  //   - Production: wrangler secret put JWT_SECRET

  // JWT Middleware — verifikasi Bearer token untuk semua /api/* routes
  // ⚠️ Session 3g EXCEPTION: /api/wa/webhook adalah PUBLIC route (Fonnte webhook)
  //    Diproteksi via ?token= query param (validateWebhookToken), bukan JWT
  //    Semua route /api/* lainnya tetap full JWT + founderOnly
  app.use('/api/*', async (c, next) => {
    // Skip JWT for webhook route (public, token-gated separately)
    if (c.req.method === 'POST' && c.req.path === '/api/wa/webhook') {
      return next()
    }
    return jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next)
  })

  // Founder-only guard — enforce role === 'founder' untuk semua protected routes
  // /health/* tetap public (tidak dalam /api/*)
  // /api/wa/webhook tetap public (webhook dari Fonnte)
  // /dashboard tetap public HTML (auth dilakukan client-side via JavaScript)
  app.use('/api/*', async (c, next) => {
    // Skip founderOnly for webhook route
    if (c.req.method === 'POST' && c.req.path === '/api/wa/webhook') {
      return next()
    }
    return founderOnly()(c, next)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  // --- Public Routes (no auth required) ---
  app.route('/health', healthRouter)

  // --- Founder-Protected Routes (JWT + founderOnly di atas sudah handle) ---
  app.route('/api/founder', founderRouter)
  app.route('/api/modules', modulesRouter)
  app.route('/api/dashboard', dashboardRouter)
  app.route('/api/dashboard', founderDashboardRouter)  // SESSION 4G: wa dashboard data feed
  app.route('/api/wa', waRouter)
  app.route('/api/agents', agentsRouter)
  
  // SESSION 4G: Founder Dashboard Lite HTML UI
  // ⚠️ Auth check still required — JWT enforced at /api/* level
  // /dashboard route is separate, handled by founderDashboardRouter's '/' handler
  app.route('/dashboard', founderDashboardRouter)

  // ─────────────────────────────────────────────────────────────────────────
  // ROOT + FALLBACK
  // ─────────────────────────────────────────────────────────────────────────

  /** GET / — App info */
  app.get('/', (c: Context<{ Bindings: TowerEnv; Variables: SovereignAuthVariables }>) => {
    return c.json({
      app: TOWER_APP_NAME,
      version: TOWER_APP_VERSION,
      description: 'Private Founder-Only Command Center — Sovereign Business Engine v4.0',
      session: '3g',
      phase: 'phase-3',
      access: 'FOUNDER ONLY — requires valid JWT (HS256 signed)',
      auth: {
        package: '@sovereign/auth v0.1.0',
        algorithm: 'HS256 (Web Crypto API)',
        middleware: 'jwtMiddleware + founderOnly (app-level, /api/*)',
        required_env: 'JWT_SECRET (from .dev.vars or Cloudflare secret)',
      },
      endpoints: {
        public: ['GET /health', 'GET /health/status'],
        public_webhook: [
          'POST /api/wa/webhook  (Fonnte inbound webhook — token-gated via ?token=)',
        ],
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
          'POST /api/modules/founder-review',
          'GET /api/dashboard',
          'GET /api/dashboard/today',
          'GET /api/wa/status',
          'GET /api/wa/logs',
          'POST /api/wa/test',
          'POST /api/wa/send',
          // Session 3g
          'GET /api/wa/queue',
          'POST /api/wa/queue/:id/approve',
          'POST /api/wa/queue/:id/reject',
          'POST /api/wa/broadcast',
        ],
      },
      db_wiring: {
        status: 'partial',
        wired: [
          'GET /api/dashboard/today → leads + orders (with date-range filter, fallback)',
          'GET /api/modules/revenue-ops → total revenue sum (with fallback)',
          'GET /api/modules/ai-resource-manager → ai_tasks + credit_ledger (with fallback)',
          'GET /api/modules/decision-center → static ADR manifest (11 ADRs, ADR-011 latest)',
          'GET /api/modules/founder-review → weekly_reviews OR evidence-based fallback',
          'POST /api/modules/founder-review → insert weekly_reviews entry',
          'GET /api/modules/proof-center → static CCA domain manifest (5 domains)',
          'GET /api/modules/build-ops → static phase-tracker manifest',
        ],
        note: 'DB wiring progressive. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.',
      },
      notice: 'Session 4a: ScoutScorer Agent added. POST /api/agents/scout-score (GROQ scoring), GET /api/agents/scout-score/status. Session 3g WA routes preserved: webhook, queue, broadcast.',
    })
  })

  /** 404 fallback */
  app.notFound((c: Context<{ Bindings: TowerEnv; Variables: SovereignAuthVariables }>) => {
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
  app.onError((err: Error, c: Context<{ Bindings: TowerEnv; Variables: SovereignAuthVariables }>) => {
    return c.json(
      errorResponse('INTERNAL_ERROR', `Internal server error: ${err.message}`),
      500
    )
  })

  return app
}

export type SovereignTowerApp = ReturnType<typeof createApp>

