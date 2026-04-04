// @sovereign/auth — middleware.ts
// Hono Middleware untuk JWT Auth + Role Guards
// ⚠️ Kompatibel dengan Cloudflare Workers — menggunakan Web Crypto API via jwt.ts
//
// Usage:
//   app.use('/api/*', jwtMiddleware({ JWT_SECRET: env.JWT_SECRET }))
//   app.use('/api/admin/*', founderOnly())
//   app.use('/api/orders/*', roleGuard(['founder', 'customer', 'reseller']))
//
// Context variable 'jwtPayload' tersedia setelah jwtMiddleware pass:
//   const payload = c.get('jwtPayload')
//   console.log(payload.role, payload.sub)

import type { Context, Next, MiddlewareHandler } from 'hono'
import type { UserRole, AccessLevel } from '../../types/src/index'
import { verifyJwt, extractBearerToken } from './jwt'
import type { JwtPayload, AuthEnvConfig } from './jwt'
import {
  hasRole,
  hasAccess,
  AUTH_ERRORS,
} from './roles'

// =============================================================================
// HONO CONTEXT TYPING
// Tambahkan 'jwtPayload' ke Hono context variable
// =============================================================================

/**
 * Declare Hono Variables untuk type-safe c.get('jwtPayload')
 * Import di app Hono:
 *   type AppVariables = SovereignAuthVariables
 *   const app = new Hono<{ Variables: AppVariables }>()
 */
export type SovereignAuthVariables = {
  jwtPayload: JwtPayload
}

// =============================================================================
// RESPONSE HELPERS (internal)
// =============================================================================

function unauthorizedResponse(c: Context, message: string, code: string): Response {
  return c.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    401
  )
}

function forbiddenResponse(c: Context, message: string, code: string): Response {
  return c.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    403
  )
}

// =============================================================================
// MIDDLEWARE: jwtMiddleware
// =============================================================================

/**
 * Hono middleware untuk verifikasi JWT
 * Meng-extract Bearer token dari Authorization header, verify, dan set ke context
 *
 * Set c.set('jwtPayload', payload) jika valid
 * Return 401 jika tidak ada token atau token invalid/expired
 *
 * @param config - AuthEnvConfig dengan JWT_SECRET dari env
 *
 * @example
 * app.use('/api/*', jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET }))
 *
 * // Atau dengan Hono factory:
 * const auth = jwtMiddleware({ JWT_SECRET: env.JWT_SECRET })
 * app.use('/api/protected/*', auth)
 */
export function jwtMiddleware(config: AuthEnvConfig): MiddlewareHandler {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const authHeader = c.req.header('Authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return unauthorizedResponse(
        c,
        'Authorization token required',
        AUTH_ERRORS.MISSING_TOKEN
      )
    }

    const payload = await verifyJwt(token, config.JWT_SECRET)

    if (!payload) {
      // verifyJwt return null untuk: invalid signature, expired, malformed
      // Cek apakah mungkin expired dengan decode tanpa verify
      const decoded = (await import('./jwt')).decodeJwt(token)
      if (decoded) {
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp < now) {
          return unauthorizedResponse(
            c,
            'Token has expired',
            AUTH_ERRORS.EXPIRED_TOKEN
          )
        }
      }

      return unauthorizedResponse(
        c,
        'Invalid authorization token',
        AUTH_ERRORS.INVALID_TOKEN
      )
    }

    // Set payload ke context untuk dipakai oleh route handler / guard berikutnya
    c.set('jwtPayload', payload)
    await next()
  }
}

// =============================================================================
// MIDDLEWARE: founderOnly
// =============================================================================

/**
 * Hono middleware — hanya izinkan founder
 * WAJIB dipasang SETELAH jwtMiddleware
 *
 * Return 401 jika tidak ada payload (jwtMiddleware belum dijalankan)
 * Return 403 jika role bukan 'founder'
 *
 * @example
 * app.use('/api/tower/*', jwtMiddleware(authConfig), founderOnly())
 */
export function founderOnly(): MiddlewareHandler {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const payload = c.get('jwtPayload') as JwtPayload | undefined

    if (!payload) {
      return unauthorizedResponse(
        c,
        'Authentication required',
        AUTH_ERRORS.MISSING_TOKEN
      )
    }

    if (payload.role !== 'founder') {
      return forbiddenResponse(
        c,
        'Founder access required',
        AUTH_ERRORS.INSUFFICIENT_ROLE
      )
    }

    await next()
  }
}

// =============================================================================
// MIDDLEWARE: roleGuard
// =============================================================================

/**
 * Hono middleware — izinkan role dari daftar allowedRoles
 * WAJIB dipasang SETELAH jwtMiddleware
 *
 * Return 401 jika tidak ada payload
 * Return 403 jika role tidak dalam allowedRoles
 *
 * @param allowedRoles - Array UserRole yang diizinkan
 *
 * @example
 * app.use('/api/orders', jwtMiddleware(authConfig), roleGuard(['founder', 'customer', 'reseller']))
 */
export function roleGuard(allowedRoles: UserRole[]): MiddlewareHandler {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const payload = c.get('jwtPayload') as JwtPayload | undefined

    if (!payload) {
      return unauthorizedResponse(
        c,
        'Authentication required',
        AUTH_ERRORS.MISSING_TOKEN
      )
    }

    if (!hasRole(payload.role, allowedRoles)) {
      return forbiddenResponse(
        c,
        `Access requires one of: ${allowedRoles.join(', ')}`,
        AUTH_ERRORS.INSUFFICIENT_ROLE
      )
    }

    await next()
  }
}

// =============================================================================
// MIDDLEWARE: accessGuard
// =============================================================================

/**
 * Hono middleware berdasarkan AccessLevel
 * Level 'public' → selalu pass (tidak cek token)
 * Level lainnya → cek payload + hasAccess()
 *
 * WAJIB dipasang SETELAH jwtMiddleware untuk level selain 'public'
 *
 * @param level - AccessLevel yang dibutuhkan resource
 *
 * @example
 * app.get('/api/products', accessGuard('public'))                    // semua boleh
 * app.get('/api/orders',   jwtMiddleware(cfg), accessGuard('gated')) // perlu login
 * app.get('/api/tower',    jwtMiddleware(cfg), accessGuard('founder_only')) // founder only
 */
export function accessGuard(level: AccessLevel): MiddlewareHandler {
  return async (c: Context, next: Next): Promise<Response | void> => {
    // Public → bypass semua cek
    if (level === 'public') {
      await next()
      return
    }

    const payload = c.get('jwtPayload') as JwtPayload | undefined

    if (!payload) {
      return unauthorizedResponse(
        c,
        'Authentication required',
        AUTH_ERRORS.MISSING_TOKEN
      )
    }

    if (!hasAccess(payload.role, level)) {
      return forbiddenResponse(
        c,
        `Access level '${level}' required`,
        AUTH_ERRORS.FORBIDDEN
      )
    }

    await next()
  }
}

// =============================================================================
// MIDDLEWARE: optionalJwt
// =============================================================================

/**
 * Hono middleware untuk JWT opsional
 * Jika ada token yang valid → set jwtPayload ke context
 * Jika tidak ada / invalid → lanjut tanpa set (tidak return 401)
 *
 * Berguna untuk route yang punya behavior berbeda untuk logged-in vs anonymous
 *
 * @param config - AuthEnvConfig
 *
 * @example
 * app.use('/api/products', optionalJwt(authConfig))
 * // Di handler:
 * const payload = c.get('jwtPayload') // undefined jika tidak login
 */
export function optionalJwt(config: AuthEnvConfig): MiddlewareHandler {
  return async (c: Context, next: Next): Promise<void> => {
    const authHeader = c.req.header('Authorization')
    const token = extractBearerToken(authHeader)

    if (token) {
      const payload = await verifyJwt(token, config.JWT_SECRET)
      if (payload) {
        c.set('jwtPayload', payload)
      }
    }

    await next()
  }
}
