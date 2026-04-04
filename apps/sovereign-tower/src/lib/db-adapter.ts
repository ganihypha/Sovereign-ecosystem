// sovereign-tower — src/lib/db-adapter.ts
// DB Adapter — wraps @sovereign/db untuk Tower
// Menggunakan type assertions minimal untuk menghindari cascade errors dari packages
// Session 3b: narrow DB wiring untuk dashboard + revenue-ops

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js'
import type { TowerEnv } from './app-config'

// =============================================================================
// DB CLIENT FACTORY
// =============================================================================

/**
 * Cek apakah env memiliki DB credentials yang lengkap
 */
export function hasDbCredentials(env: TowerEnv): boolean {
  return (
    typeof env.SUPABASE_URL === 'string' &&
    env.SUPABASE_URL.length > 0 &&
    typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' &&
    (env.SUPABASE_SERVICE_ROLE_KEY as string).length > 0
  )
}

/**
 * Buat Supabase client langsung (tanpa @sovereign/db wrapper untuk hindari type errors)
 * Return null jika credentials tidak tersedia
 */
export function tryCreateDbClient(env: TowerEnv): ReturnType<typeof createClient> | null {
  if (!hasDbCredentials(env)) return null
  try {
    return createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )
  } catch {
    return null
  }
}

// =============================================================================
// DOMAIN HELPERS — Narrow scope untuk Session 3b
// =============================================================================

type DbClient = ReturnType<typeof createClient>

/**
 * Get total revenue dari orders table
 * Return null jika query error (table belum ada atau error lain)
 */
export async function getTotalRevenueFromDb(db: DbClient): Promise<number | null> {
  try {
    const { data, error } = await db
      .from('orders')
      .select('total')
    
    if (error || !data) return null
    
    const total = (data as any[]).reduce((sum: number, row: any) => {
      return sum + (typeof row.total === 'number' ? row.total : 0)
    }, 0)
    
    return total
  } catch {
    return null
  }
}

/**
 * Count leads dari leads table
 * Return null jika query error
 */
export async function countLeadsFromDb(db: DbClient): Promise<number | null> {
  try {
    const { count, error } = await db
      .from('leads')
      .select('*', { count: 'exact', head: true })
    
    if (error) return null
    return count ?? 0
  } catch {
    return null
  }
}

/**
 * Count leads dengan status tertentu
 */
export async function countLeadsByStatus(db: DbClient, status: string): Promise<number | null> {
  try {
    const { count, error } = await db
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    
    if (error) return null
    return count ?? 0
  } catch {
    return null
  }
}
