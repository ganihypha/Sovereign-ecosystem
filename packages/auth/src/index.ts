// @sovereign/auth — Placeholder
// Phase 2: JWT validation, role checking akan diisi di sini
// Lihat: docs/26-CANONICAL-ARCHITECTURE-MAP.md Layer 2

// TODO Phase 2:
// - jwt.ts: JWT sign / verify helpers
// - roles.ts: Role definitions + guards
// - middleware for Hono

export const AUTH_VERSION = '0.0.1'
export const AUTH_PLACEHOLDER = true

export type AuthRole = 'founder' | 'customer' | 'agent'

export type JwtPayload = {
  sub: string
  role: AuthRole
  iat: number
  exp: number
}
