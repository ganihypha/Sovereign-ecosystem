// @sovereign/auth — jwt.ts
// JWT Sign / Verify menggunakan Web Crypto API (SubtleCrypto)
// ⚠️ WAJIB kompatibel dengan Cloudflare Workers — TIDAK menggunakan Node.js crypto module
//
// Algorithm: HS256 (HMAC-SHA256)
// Tidak ada dependency eksternal — hanya Web Crypto API standar
//
// Usage:
//   const token = await signJwt({ sub: userId, role: 'founder' }, env.JWT_SECRET)
//   const payload = await verifyJwt(token, env.JWT_SECRET)
//   if (!payload) return c.json({ error: 'Unauthorized' }, 401)

import type { UserRole, CustomerTier } from '../../types/src/index'

// =============================================================================
// CONSTANTS
// =============================================================================

export const AUTH_ALGORITHM = 'HS256' as const
export const AUTH_VERSION = '0.1.0' as const

/** Default token TTL: 24 jam dalam detik */
export const JWT_DEFAULT_EXPIRES_IN = 60 * 60 * 24

// =============================================================================
// TYPES
// =============================================================================

/** Minimal env config untuk JWT operations */
export type AuthEnvConfig = {
  JWT_SECRET: string
}

/**
 * JWT Payload — source of truth dari @sovereign/types UserRole
 * Standar JWT claims + sovereign-specific fields
 */
export type JwtPayload = {
  /** Subject — user ID (UUID) */
  sub: string
  /** Role dari UserRole (@sovereign/types) */
  role: UserRole
  /** Issued at — Unix timestamp detik */
  iat: number
  /** Expiration — Unix timestamp detik */
  exp: number
  /** Optional: email untuk display */
  email?: string
  /** Optional: nama user */
  name?: string
  /** Optional: tier customer */
  tier?: CustomerTier | null
}

/** Header JWT HS256 */
type JwtHeader = {
  alg: 'HS256'
  typ: 'JWT'
}

// =============================================================================
// BASE64URL HELPERS
// Web Crypto menggunakan ArrayBuffer — perlu encode/decode base64url
// =============================================================================

/** Encode string ke base64url (tanpa padding) */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/** Encode Uint8Array ke base64url */
function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number)
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/** Decode base64url ke string */
function base64UrlDecode(str: string): string {
  // Tambah padding jika perlu
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}

/** Decode base64url ke Uint8Array */
function base64UrlDecodeBytes(str: string): Uint8Array {
  const binary = base64UrlDecode(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// =============================================================================
// CRYPTO HELPERS
// Semua operasi crypto via SubtleCrypto — kompatibel Cloudflare Workers
// =============================================================================

/** Import JWT secret sebagai HMAC-SHA256 key */
async function importSecret(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/** Sign data dengan HMAC-SHA256 */
async function hmacSign(key: CryptoKey, data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  return new Uint8Array(signature)
}

/** Verify HMAC-SHA256 signature */
async function hmacVerify(key: CryptoKey, data: string, signature: Uint8Array): Promise<boolean> {
  const encoder = new TextEncoder()
  return crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(data)
  )
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Sign JWT token dengan HS256 menggunakan Web Crypto API
 *
 * @param payload - Data payload (sub, role, dll) — exp dan iat ditambahkan otomatis
 * @param secret - JWT secret dari env (JWT_SECRET) — JANGAN hardcode
 * @param expiresInSeconds - TTL dalam detik (default: 24 jam = 86400)
 * @returns JWT string (header.payload.signature)
 *
 * @example
 * const token = await signJwt({ sub: userId, role: 'founder' }, env.JWT_SECRET)
 */
export async function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds: number = JWT_DEFAULT_EXPIRES_IN
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  }

  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
  const signingInput = `${headerEncoded}.${payloadEncoded}`

  const key = await importSecret(secret)
  const signatureBytes = await hmacSign(key, signingInput)
  const signatureEncoded = base64UrlEncodeBytes(signatureBytes)

  return `${signingInput}.${signatureEncoded}`
}

/**
 * Verify dan decode JWT token
 *
 * @param token - JWT string (header.payload.signature)
 * @param secret - JWT secret dari env
 * @returns JwtPayload jika valid, null jika invalid/expired
 * @throws Error hanya untuk kegagalan crypto teknis
 *
 * @example
 * const payload = await verifyJwt(token, env.JWT_SECRET)
 * if (!payload) return c.json({ error: 'Unauthorized' }, 401)
 */
export async function verifyJwt(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts

    if (!headerEncoded || !payloadEncoded || !signatureEncoded) return null

    // Verify signature
    const signingInput = `${headerEncoded}.${payloadEncoded}`
    const signatureBytes = base64UrlDecodeBytes(signatureEncoded)

    const key = await importSecret(secret)
    const isValid = await hmacVerify(key, signingInput, signatureBytes)
    if (!isValid) return null

    // Decode payload
    let payload: JwtPayload
    try {
      payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JwtPayload
    } catch {
      return null
    }

    // Validasi required fields
    if (!payload.sub || !payload.role || !payload.iat || !payload.exp) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)

    // Cek expired
    if (payload.exp < now) return null

    // Cek iat tidak di masa depan (toleransi 60 detik untuk clock skew)
    if (payload.iat > now + 60) return null

    return payload
  } catch {
    // Untuk kegagalan crypto teknis — return null (tidak throw)
    // Ini dimaksudkan agar middleware bisa handle gracefully
    return null
  }
}

/**
 * Decode JWT tanpa verifikasi signature
 * Gunakan HANYA untuk inspeksi payload — JANGAN untuk auth decision
 *
 * @param token - JWT string
 * @returns JwtPayload atau null jika format tidak valid
 *
 * @example
 * const decoded = decodeJwt(token)
 * console.log('User role:', decoded?.role)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payloadEncoded = parts[1]
    if (!payloadEncoded) return null

    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JwtPayload

    if (!payload.sub || !payload.role) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Extract Bearer token dari Authorization header
 * Format: "Bearer <token>"
 *
 * @param authHeader - Nilai Authorization header
 * @returns token string atau null
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null
  if (!authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  return token.length > 0 ? token : null
}
