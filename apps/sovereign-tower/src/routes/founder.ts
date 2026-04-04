// sovereign-tower — src/routes/founder.ts
// Founder-protected routes — requires JWT + founder role
// Sovereign Business Engine v4.0 — Session 3a
//
// ⚠️ FOUNDER ACCESS ONLY — semua route di sini membutuhkan valid JWT dengan role 'founder'
//
// Auth flow Session 3a:
//   1. Client kirim: Authorization: Bearer <jwt>
//   2. requireBearerToken() validasi header present
//   3. Handler return placeholder data
//
// Auth flow Session 3b (wire-up):
//   1. jwtMiddleware verify token (di-mount di app.ts)
//   2. founderOnly middleware cek role === 'founder'
//   3. Handler akses c.get('jwtPayload') untuk identity

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import { successResponse, errorResponse } from '../lib/app-config'
import { getRegistrySummary } from '../lib/module-registry'

// =============================================================================
// FOUNDER ROUTER
// =============================================================================

const founderRouter = new Hono<{ Bindings: TowerEnv }>()

/**
 * ⚠️ MIDDLEWARE NOTE (Session 3a):
 * Auth middleware di-wire di app.ts level.
 * Di sini semua routes diasumsikan sudah di-protect.
 *
 * Session 3b wire-up:
 *   import { jwtMiddleware, founderOnly } from '@sovereign/auth'
 *   app.use('/api/founder/*', (c, next) => jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next))
 *   app.use('/api/founder/*', founderOnly())
 */

/** Internal: lightweight header check untuk Session 3a scaffold */
function requireBearerToken(authHeader: string | undefined): boolean {
  return (authHeader ?? '').startsWith('Bearer ')
}

/**
 * GET /api/founder/profile
 * Mengembalikan profil founder dari JWT payload
 */
founderRouter.get('/profile', (c: Context<{ Bindings: TowerEnv }>) => {
  if (!requireBearerToken(c.req.header('Authorization'))) {
    return c.json(
      errorResponse('UNAUTHORIZED', 'Bearer token required. Use: Authorization: Bearer <jwt>'),
      401
    )
  }

  // Session 3a scaffold: return placeholder profile
  // Session 3b: wire ke jwtMiddleware + real JWT decode via @sovereign/auth
  return c.json(
    successResponse({
      notice: 'Session 3a scaffold — full auth middleware wire-up in Session 3b',
      profile: {
        role: 'founder',
        app: 'sovereign-tower',
        access_level: 'founder_only',
        permissions: [
          'read:all-modules',
          'write:build-ops',
          'write:decision-center',
          'execute:ai-agents',
          'approve:wa-blast',
        ],
      },
      auth_package: '@sovereign/auth v0.1.0 (available — wire in Session 3b)',
      session_note: 'Full JWT decode + Supabase user lookup in Session 3b',
    })
  )
})

/**
 * GET /api/founder/tower-status
 * Overview status seluruh Sovereign Tower dari perspektif founder
 */
founderRouter.get('/tower-status', (c: Context<{ Bindings: TowerEnv }>) => {
  if (!requireBearerToken(c.req.header('Authorization'))) {
    return c.json(errorResponse('UNAUTHORIZED', 'Bearer token required'), 401)
  }

  const registry = getRegistrySummary()

  return c.json(
    successResponse({
      tower: {
        name: 'Sovereign Tower',
        version: '0.1.0',
        build_session: '3a',
        phase: 'phase-3',
        status: 'scaffold-ready',
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
      blockers: [
        'FONNTE_TOKEN not available — WA integration blocked',
        'Session 3b needed for full @sovereign/auth wiring',
      ],
      shared_core_packages: {
        '@sovereign/types': 'v0.1.0 ✅',
        '@sovereign/db': 'v0.1.0 ✅',
        '@sovereign/auth': 'v0.1.0 ✅',
        '@sovereign/integrations': 'v0.1.0 ✅',
        '@sovereign/prompt-contracts': 'v0.1.0 ✅',
      },
    })
  )
})

export { founderRouter }
