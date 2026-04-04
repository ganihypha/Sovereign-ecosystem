// @sovereign/auth — roles.ts
// Role Guards dan Access Control
// Source of truth: packages/types/src/common.ts (UserRole, AccessLevel)
//
// ⚠️ File ini TIDAK boleh import dari packages lain kecuali @sovereign/types
// ⚠️ Semua logic di sini harus app-agnostic (tidak ada Tower/Fashionkas specific logic)
//
// Usage:
//   if (!isFounder(payload.role)) return c.json({ error: 'Forbidden' }, 403)
//   if (!hasAccess(payload.role, 'founder_only')) return c.json({ error: 'Forbidden' }, 403)

import type { UserRole, AccessLevel } from '../../types/src/index'

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Placeholder untuk Founder ID — nilai asli WAJIB dari env var
 * ⚠️ JANGAN hardcode user ID di sini — gunakan env.FOUNDER_USER_ID
 */
export const FOUNDER_ID_PLACEHOLDER = 'FOUNDER_ID_ENV' as const

/**
 * Role hierarchy — urutan dari terendah ke tertinggi
 * Digunakan sebagai referensi, bukan untuk inheritance check
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  agent: 1,
  customer: 2,
  reseller: 3,
  founder: 4,
} as const

/**
 * Map AccessLevel ke minimum UserRole yang dibutuhkan
 * Digunakan oleh hasAccess() sebagai referensi
 */
export const ACCESS_LEVEL_ROLES: Record<AccessLevel, UserRole[]> = {
  public: ['guest', 'customer', 'reseller', 'agent', 'founder'],
  gated: ['customer', 'reseller', 'agent', 'founder'],
  private: ['customer', 'reseller', 'agent', 'founder'],
  founder_only: ['founder'],
} as const

// =============================================================================
// ROLE GUARDS
// =============================================================================

/**
 * Cek apakah role adalah founder
 * Founder memiliki akses penuh ke seluruh sistem
 *
 * @example
 * if (!isFounder(payload.role)) return forbidden(c)
 */
export function isFounder(role: UserRole): boolean {
  return role === 'founder'
}

/**
 * Cek apakah role adalah customer (paying customer)
 */
export function isCustomer(role: UserRole): boolean {
  return role === 'customer'
}

/**
 * Cek apakah role adalah reseller
 */
export function isReseller(role: UserRole): boolean {
  return role === 'reseller'
}

/**
 * Cek apakah role adalah AI agent service account
 */
export function isAgent(role: UserRole): boolean {
  return role === 'agent'
}

/**
 * Cek apakah role adalah guest (unauthenticated)
 */
export function isGuest(role: UserRole): boolean {
  return role === 'guest'
}

/**
 * Cek apakah role ada dalam daftar allowed roles
 * Guard generik — dipakai untuk custom role list
 *
 * @param role - Role user yang akan dicek
 * @param allowedRoles - Array role yang diizinkan
 * @returns true jika role ada dalam allowedRoles
 *
 * @example
 * if (!hasRole(payload.role, ['founder', 'reseller'])) return forbidden(c)
 */
export function hasRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role)
}

/**
 * Cek apakah role memiliki akses ke level tertentu
 * Menggunakan ACCESS_LEVEL_ROLES map
 *
 * Access level semantics:
 * - 'public'       → semua role (termasuk guest)
 * - 'gated'        → semua kecuali guest (perlu login)
 * - 'private'      → customer, reseller, agent, founder
 * - 'founder_only' → hanya founder
 *
 * @param role - Role user
 * @param level - AccessLevel yang dibutuhkan resource
 * @returns true jika role memiliki akses
 *
 * @example
 * if (!hasAccess(payload.role, 'gated')) return forbidden(c)
 */
export function hasAccess(role: UserRole, level: AccessLevel): boolean {
  const allowedRoles = ACCESS_LEVEL_ROLES[level]
  return allowedRoles.includes(role)
}

/**
 * Cek apakah role memiliki level hierarki yang sama atau lebih tinggi
 * Berguna untuk fitur yang butuh "minimal role"
 *
 * @param role - Role user
 * @param minimumRole - Minimum role yang dibutuhkan
 * @returns true jika role >= minimumRole dalam hierarki
 *
 * @example
 * if (!hasMinimumRole(payload.role, 'customer')) return forbidden(c)
 */
export function hasMinimumRole(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Cek apakah user dapat melakukan aksi pada resource milik user lain
 * Rule: founder bisa akses semua, user lain hanya milik sendiri
 *
 * @param requestorRole - Role user yang melakukan request
 * @param requestorId - User ID yang melakukan request
 * @param resourceOwnerId - User ID pemilik resource
 * @returns true jika akses diizinkan
 *
 * @example
 * if (!canAccessResource(payload.role, payload.sub, params.userId)) return forbidden(c)
 */
export function canAccessResource(
  requestorRole: UserRole,
  requestorId: string,
  resourceOwnerId: string
): boolean {
  if (isFounder(requestorRole)) return true
  return requestorId === resourceOwnerId
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/** Standard auth error codes */
export const AUTH_ERRORS = {
  MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  FORBIDDEN: 'AUTH_FORBIDDEN',
  INSUFFICIENT_ROLE: 'AUTH_INSUFFICIENT_ROLE',
} as const

export type AuthErrorCode = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS]
