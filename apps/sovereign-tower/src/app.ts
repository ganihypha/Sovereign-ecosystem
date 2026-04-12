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
import { hubRouter } from './routes/hub'
import { chamberRouter } from './routes/chamber'
import { bridgeRouter } from './routes/bridge'
import { counterpartRouter } from './routes/counterpart'

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
  // ⚠️ Session HUB-02 EXCEPTION: /api/hub/auth/* adalah PUBLIC routes untuk auth exchange
  //    - GET /api/hub/auth/status  — token status check (no auth required, reads header optionally)
  //    - POST /api/hub/auth/exchange — mint JWT via MASTER_PIN (no JWT required, PIN required)
  //    - POST /api/hub/auth/logout — stateless logout acknowledgment (no auth required)
  //    Semua route /api/* lainnya tetap full JWT + founderOnly
  app.use('/api/*', async (c, next) => {
    // Skip JWT for webhook route (public, token-gated separately)
    if (c.req.method === 'POST' && c.req.path === '/api/wa/webhook') {
      return next()
    }
    // Skip JWT for hub auth routes (HUB-02 — public auth helpers)
    if (c.req.path.startsWith('/api/hub/auth/')) {
      return next()
    }
    return jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next)
  })

  // Founder-only guard — enforce role === 'founder' untuk semua protected routes
  // /health/* tetap public (tidak dalam /api/*)
  // /api/wa/webhook tetap public (webhook dari Fonnte)
  // /api/hub/auth/* tetap public (HUB-02 auth exchange routes)
  // /dashboard tetap public HTML (auth dilakukan client-side via JavaScript)
  app.use('/api/*', async (c, next) => {
    // Skip founderOnly for webhook route
    if (c.req.method === 'POST' && c.req.path === '/api/wa/webhook') {
      return next()
    }
    // Skip founderOnly for hub auth routes (HUB-02)
    if (c.req.path.startsWith('/api/hub/auth/')) {
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

  // HUB-01: Session & Handoff Hub MVP — continuity surface for founder
  // Isolated additive route. Does NOT modify Tower core or governance canon.
  // Hub ≠ Chamber, Hub ≠ Tower core, Hub ≠ BarberKas
  app.route('/api/hub', hubRouter)
  app.route('/hub', hubRouter)

  // HUB-04: Chamber Operating Console v1 — founder governance operating surface
  // Isolated additive route. Does NOT modify Tower core, Hub, or governance canon.
  // Chamber = governance operating console (NOT product app, NOT Counterpart, NOT public UI)
  // Auth: /chamber/api/* routes protected by JWT + founderOnly via explicit middleware.
  // UI routes /chamber/* are HTML pages with client-side JWT auth (same model as Hub).
  app.use('/chamber/api/*', async (c, next) => {
    return jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next)
  })
  app.use('/chamber/api/*', async (c, next) => {
    return founderOnly()(c, next)
  })
  app.route('/chamber', chamberRouter)

  // HUB-05: Bridge Review Desk v1 — triage + routing surface for founder
  // Isolated additive route. Does NOT modify Hub, Chamber, or Tower core.
  // Bridge = classify + route + hold + escalate signals.
  // Auth: /bridge/api/* protected by JWT + founderOnly via explicit middleware.
  // UI routes /bridge/* use client-side JWT auth (same pattern as Hub/Chamber).
  app.use('/bridge/api/*', async (c, next) => {
    return jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next)
  })
  app.use('/bridge/api/*', async (c, next) => {
    return founderOnly()(c, next)
  })
  app.route('/bridge', bridgeRouter)

  // HUB-08: Counterpart Workspace Lite v1 — bounded downstream participation layer
  // Isolated additive route. Does NOT modify Hub, Chamber, Bridge, or Tower core.
  // Counterpart = bounded contribution workspace only (NOT governance override)
  // Auth: /counterpart/api/* protected by JWT + founderOnly via explicit middleware.
  // UI routes /counterpart/* use client-side JWT auth (same pattern as Hub/Chamber/Bridge).
  // ⚠️ v1 is bounded preview under founder-controlled auth.
  //    True multi-user counterpart role auth is deferred (stated honestly in /counterpart/boundaries).
  app.use('/counterpart/api/*', async (c, next) => {
    return jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next)
  })
  app.use('/counterpart/api/*', async (c, next) => {
    return founderOnly()(c, next)
  })
  app.route('/counterpart', counterpartRouter)

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
      hub: {
        ui: 'GET /hub — Session & Handoff Hub (continuity surface)',
        api_protected: [
          'GET /api/hub/state',
          'GET /api/hub/blockers',
          'GET /api/hub/founder-actions',
          'GET /api/hub/lanes',
          'GET /api/hub/closeout-draft',
          'POST /api/hub/closeout-draft',
          'GET /api/hub/next-session',
        ],
        auth_public: [
          'GET /api/hub/auth/status  — check token validity (no auth required)',
          'POST /api/hub/auth/exchange — mint JWT via MASTER_PIN (no JWT required)',
          'POST /api/hub/auth/logout — stateless logout acknowledgment',
        ],
        auth_note: 'HUB-02: Founder uses MASTER_PIN to exchange for signed JWT. Never paste raw JWT_SECRET.',
      },
      chamber: {
          ui: 'GET /chamber — Chamber Operating Console (governance operating surface)',
          screens: [
            'GET /chamber — Overview / summary cards',
            'GET /chamber/inbox — Governance inbox',
            'GET /chamber/decision-board — Decision board + approve/reject/hold',
            'GET /chamber/audit — Audit trail viewer',
            'GET /chamber/truth-sync — Truth sync panel',
            'GET /chamber/maintenance — Maintenance checklist',
          ],
          api_bounded: [
            'GET /api/chamber/summary',
            'GET /api/chamber/inbox',
            'GET /api/chamber/decision/:id',
            'POST /api/chamber/decision/:id/approve',
            'POST /api/chamber/decision/:id/reject',
            'POST /api/chamber/decision/:id/hold',
            'GET /api/chamber/audit',
            'GET /api/chamber/truth-sync',
            'GET /api/chamber/maintenance',
          ],
          auth_note: 'HUB-04: Reuses Hub auth model. Same MASTER_PIN / JWT. No second auth flow.',
        },
      notice: 'HUB-08: Counterpart Workspace Lite v1 built. Bounded participation layer downstream of Hub/Chamber/Bridge. Auth preserved.',
      hub08: {
        counterpart: {
          ui: 'GET /counterpart — Counterpart Workspace Lite v1 (bounded participation)',
          screens: [
            'GET /counterpart — Overview / workspace summary',
            'GET /counterpart/access — Access level + allowed areas',
            'GET /counterpart/scope — Scoped work lanes + contribution types',
            'GET /counterpart/checkpoints — Checkpoint history (bounded, counterpart-visible)',
            'GET /counterpart/contribute — Contribution desk (submit)',
            'GET /counterpart/outcomes — Restricted review outcomes',
            'GET /counterpart/boundaries — Explicit boundary notice',
          ],
          api_bounded: [
            'GET /counterpart/api/summary',
            'GET /counterpart/api/access',
            'GET /counterpart/api/scope',
            'GET /counterpart/api/checkpoints',
            'GET /counterpart/api/outcomes',
            'POST /counterpart/api/contributions',
            'GET /counterpart/api/contributions',
            'GET /counterpart/api/boundaries',
          ],
          auth_note: 'HUB-08: v1 is bounded preview under founder-controlled auth. True multi-user counterpart auth deferred.',
          boundary_note: 'Counterpart is downstream of Hub/Chamber/Bridge. Cannot override founder decisions.',
        }
      },
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

