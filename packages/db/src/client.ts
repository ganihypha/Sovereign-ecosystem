// @sovereign/db — client.ts
// Supabase Client Factory & Configuration
// ⚠️ SECURITY RULES:
//   - TIDAK boleh expose service role key ke client/browser
//   - Service role key HANYA untuk server-side (Hono API, Worker)
//   - Anon key untuk public read-only operations
//   - Semua value dari env vars — TIDAK boleh hardcode
//
// Usage:
//   Server-side (Hono worker): import { createServerClient } from '@sovereign/db'
//   Public surface (lead form): import { createAnonClient } from '@sovereign/db'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SovereignDatabase } from './schema'

// =============================================================================
// TYPE ALIASES — Typed Supabase clients
// =============================================================================

/** Fully typed server-side Supabase client (service role) */
export type SovereignServerClient = SupabaseClient<SovereignDatabase>

/** Fully typed anon/public Supabase client */
export type SovereignAnonClient = SupabaseClient<SovereignDatabase>

// =============================================================================
// ENV CONFIG TYPE
// =============================================================================

/** Minimal env config untuk DB client */
export type DbEnvConfig = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_ANON_KEY: string
}

// =============================================================================
// CLIENT FACTORIES
// =============================================================================

/**
 * Create server-side Supabase client (service role — full access)
 *
 * ⚠️ HANYA dipakai di:
 *   - Hono API route handlers
 *   - Cloudflare Workers (server environment)
 *   - Migration scripts
 *
 * TIDAK BOLEH dipakai di:
 *   - Browser/client-side code
 *   - Public HTML/JS yang ter-expose
 *
 * @param env - Cloudflare env bindings atau process.env equivalent
 */
export function createServerClient(env: Pick<DbEnvConfig, 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY'>): SovereignServerClient {
  if (!env.SUPABASE_URL) {
    throw new Error('[sovereign/db] SUPABASE_URL is required')
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('[sovereign/db] SUPABASE_SERVICE_ROLE_KEY is required')
  }

  return createClient<SovereignDatabase>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,          // Server-side: tidak perlu session persist
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-sovereign-client': 'server',
          'x-sovereign-version': '0.1.0',
        },
      },
    }
  )
}

/**
 * Create anon/public Supabase client (anon key — restricted access)
 *
 * Dipakai untuk:
 *   - Lead capture form di Fashionkas (public write ke leads)
 *   - Public product listing (read-only)
 *   - Demo environment
 *
 * ⚠️ Pastikan RLS diaktifkan untuk semua tabel yang diakses via anon key
 *
 * @param env - Env config dengan anon key
 */
export function createAnonClient(env: Pick<DbEnvConfig, 'SUPABASE_URL' | 'SUPABASE_ANON_KEY'>): SovereignAnonClient {
  if (!env.SUPABASE_URL) {
    throw new Error('[sovereign/db] SUPABASE_URL is required')
  }
  if (!env.SUPABASE_ANON_KEY) {
    throw new Error('[sovereign/db] SUPABASE_ANON_KEY is required')
  }

  return createClient<SovereignDatabase>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-sovereign-client': 'anon',
          'x-sovereign-version': '0.1.0',
        },
      },
    }
  )
}

// =============================================================================
// DB ERROR HELPER
// =============================================================================

export type DbError = {
  code: string
  message: string
  details?: string | null
  hint?: string | null
}

/**
 * Normalize Supabase error menjadi DbError yang konsisten
 * Dipakai di semua helper functions untuk error handling
 */
export function normalizeDbError(error: unknown): DbError {
  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as { message: string; code?: string; details?: string; hint?: string }
    return {
      code: e.code ?? 'DB_ERROR',
      message: e.message,
      details: e.details ?? null,
      hint: e.hint ?? null,
    }
  }
  return {
    code: 'UNKNOWN_DB_ERROR',
    message: String(error),
  }
}

/**
 * Result type untuk semua DB operations
 * Pattern: { data: T | null, error: DbError | null }
 */
export type DbResult<T> = {
  data: T | null
  error: DbError | null
}

/**
 * Wrap Supabase query result menjadi DbResult yang konsistent
 */
export function wrapResult<T>(
  data: T | null,
  error: unknown
): DbResult<T> {
  if (error) {
    return { data: null, error: normalizeDbError(error) }
  }
  return { data, error: null }
}
