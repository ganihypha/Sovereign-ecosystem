// @sovereign/auth — index.ts
// Package @sovereign/auth v0.1.0
// Auth Foundation Layer — Sovereign Business Engine v4.0
//
// ============================================================================
// WHAT THIS PACKAGE PROVIDES:
// ============================================================================
//
// 1. JWT Foundation (jwt.ts)
//    → signJwt / verifyJwt / decodeJwt via Web Crypto API (Cloudflare Workers compatible)
//    → extractBearerToken helper
//    → JwtPayload type (aligned dengan @sovereign/types UserRole)
//
// 2. Role Guards (roles.ts)
//    → isFounder, isCustomer, isReseller, isAgent, isGuest
//    → hasRole, hasAccess, hasMinimumRole, canAccessResource
//    → ROLE_HIERARCHY, ACCESS_LEVEL_ROLES, AUTH_ERRORS constants
//
// 3. Hono Middleware (middleware.ts)
//    → jwtMiddleware — verify Bearer JWT, set c.get('jwtPayload')
//    → founderOnly   — restrict ke founder role
//    → roleGuard     — restrict ke array of roles
//    → accessGuard   — restrict berdasarkan AccessLevel
//    → optionalJwt   — JWT opsional (no 401 jika tidak ada token)
//
// ============================================================================
// USAGE PATTERN:
// ============================================================================
//
// Di Hono Worker (apps/tower):
//   import { jwtMiddleware, founderOnly, roleGuard } from '@sovereign/auth'
//   import type { SovereignAuthVariables } from '@sovereign/auth'
//
//   type Env = { JWT_SECRET: string }
//   const app = new Hono<{ Bindings: Env, Variables: SovereignAuthVariables }>()
//
//   app.use('/api/*', jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET }))
//   app.use('/api/admin/*', founderOnly())
//   app.get('/api/profile', (c) => {
//     const payload = c.get('jwtPayload')
//     return c.json({ userId: payload.sub, role: payload.role })
//   })
//
// ============================================================================
// SECURITY NOTES:
// ============================================================================
//
// ✅ Gunakan Web Crypto API — TIDAK ada Node.js crypto dependency
// ✅ JWT_SECRET wajib dari env var — JANGAN hardcode
// ✅ verifyJwt cek exp + iat clock skew
// ❌ JANGAN expose JWT_SECRET ke client/browser
// ❌ JANGAN commit .dev.vars ke repo
//
// ============================================================================

export const AUTH_VERSION = '0.1.0' as const
export const AUTH_PLACEHOLDER = false as const

// --- JWT Foundation ---
export type { JwtPayload, AuthEnvConfig } from './jwt'

export {
  AUTH_ALGORITHM,
  JWT_DEFAULT_EXPIRES_IN,
  signJwt,
  verifyJwt,
  decodeJwt,
  extractBearerToken,
} from './jwt'

// --- Role Guards ---
export type { AuthErrorCode } from './roles'

export {
  FOUNDER_ID_PLACEHOLDER,
  ROLE_HIERARCHY,
  ACCESS_LEVEL_ROLES,
  AUTH_ERRORS,
  isFounder,
  isCustomer,
  isReseller,
  isAgent,
  isGuest,
  hasRole,
  hasAccess,
  hasMinimumRole,
  canAccessResource,
} from './roles'

// --- Hono Middleware ---
export type { SovereignAuthVariables } from './middleware'

export {
  jwtMiddleware,
  founderOnly,
  roleGuard,
  accessGuard,
  optionalJwt,
} from './middleware'
