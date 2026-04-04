// sovereign-tower — src/routes/founder.ts
// Founder-protected routes — requires JWT + founder role
// Sovereign Business Engine v4.0 — Session 3b
//
// ⚠️ FOUNDER ACCESS ONLY — semua route di sini membutuhkan valid JWT dengan role 'founder'
//
// Auth flow Session 3b (UPGRADED dari Session 3a):
//   1. app.ts level: jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET }) verifikasi token cryptographically
//   2. app.ts level: founderOnly() enforce role === 'founder'
//   3. c.get('jwtPayload') tersedia di handler — berisi sub, role, email, dll dari JWT
//   4. TIDAK ADA lagi requireBearerToken() per-route — auth sudah handled di middleware level

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import { getRegistrySummary } from '../lib/module-registry'
import type { SovereignAuthVariables } from '@sovereign/auth'

// =============================================================================
// FOUNDER ROUTER
// =============================================================================

type TowerContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

const founderRouter = new Hono<TowerContext>()

// ⚠️ NOTE: Auth middleware sudah di-wire di app.ts level (app.use('/api/*', ...))
// Route handlers di sini bisa langsung pakai c.get('jwtPayload') untuk identity

/**
 * GET /api/founder/profile
 * Mengembalikan profil founder dari JWT payload
 * Session 3b: real JWT decode via jwtPayload dari @sovereign/auth middleware
 */
founderRouter.get('/profile', (c: Context<TowerContext>) => {
  // jwtPayload tersedia setelah jwtMiddleware pass di app.ts
  const payload = c.get('jwtPayload')

  if (!payload) {
    // Seharusnya tidak pernah terjadi (middleware sudah reject di app.ts)
    // Tapi sebagai defensive coding
    return c.json(
      errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia. Pastikan Authorization: Bearer <token>'),
      401
    )
  }

  return c.json(
    successResponse({
      session: '3b',
      auth: {
        wired: true,
        package: '@sovereign/auth v0.1.0',
        algorithm: 'HS256 (Web Crypto API)',
      },
      profile: {
        sub: payload.sub,
        role: payload.role,
        email: payload.email ?? null,
        name: payload.name ?? null,
        issued_at: new Date(payload.iat * 1000).toISOString(),
        expires_at: new Date(payload.exp * 1000).toISOString(),
        access_level: 'founder_only',
        permissions: [
          'read:all-modules',
          'write:build-ops',
          'write:decision-center',
          'execute:ai-agents',
          'approve:wa-blast',
        ],
      },
    })
  )
})

/**
 * GET /api/founder/tower-status
 * Overview status seluruh Sovereign Tower dari perspektif founder
 * Session 3b: real JWT decode + updated status
 */
founderRouter.get('/tower-status', (c: Context<TowerContext>) => {
  const payload = c.get('jwtPayload')

  if (!payload) {
    return c.json(errorResponse('UNAUTHORIZED', 'JWT payload tidak tersedia'), 401)
  }

  const registry = getRegistrySummary()

  return c.json(
    successResponse({
      tower: {
        name: 'Sovereign Tower',
        version: '0.1.0',
        build_session: '3b',
        phase: 'phase-3',
        status: 'auth-wired',
        auth_status: 'REAL — @sovereign/auth jwtMiddleware + founderOnly active',
        db_status: 'NARROW WIRING — dashboard/today + revenue-ops (with safe fallback)',
      },
      authenticated_as: {
        sub: payload.sub,
        role: payload.role,
        email: payload.email ?? null,
      },
      module_registry: registry,
      phase_status: {
        'phase-0': 'done',
        'phase-1': 'done',
        'phase-2': 'done',
        'phase-3': 'in-progress',
        'phase-4': 'not-started',
        'phase-5': 'not-started',
        'phase-6': 'not-started',
      },
      session_status: {
        '3a': 'done',
        '3b': 'in-progress',
        '3c': 'pending',
      },
      blockers: [
        'FONNTE_TOKEN not available — WA integration blocked',
        'SUPABASE_SERVICE_ROLE_KEY needed for full DB queries (optional fallback active)',
      ],
      shared_core_packages: {
        '@sovereign/types': 'v0.1.0 ✅',
        '@sovereign/db': 'v0.1.0 ✅',
        '@sovereign/auth': 'v0.1.0 ✅ WIRED',
        '@sovereign/integrations': 'v0.1.0 ✅',
        '@sovereign/prompt-contracts': 'v0.1.0 ✅',
      },
    })
  )
})

export { founderRouter }
