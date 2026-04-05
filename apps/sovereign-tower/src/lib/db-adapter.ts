// sovereign-tower — src/lib/db-adapter.ts
// DB Adapter — wraps @sovereign/db untuk Tower
// Menggunakan type assertions minimal untuk menghindari cascade errors dari packages
// Session 3b: narrow DB wiring untuk dashboard + revenue-ops
// Session 3d: tambah helpers untuk ai_tasks, credit_ledger, weekly_reviews, dan date-range filters
// Session 3e: tambah insertWeeklyReview helper

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

/**
 * Get total revenue dari orders dengan date range filter (optional)
 * dateFrom / dateTo dalam format ISO string (e.g. '2026-04-01')
 */
export async function getRevenueWithDateRange(
  db: DbClient,
  dateFrom?: string,
  dateTo?: string
): Promise<number | null> {
  try {
    let query = db.from('orders').select('total')
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z')
    const { data, error } = await query
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
 * Count leads dengan optional date range filter
 */
export async function countLeadsWithDateRange(
  db: DbClient,
  dateFrom?: string,
  dateTo?: string
): Promise<number | null> {
  try {
    let query = db.from('leads').select('*', { count: 'exact', head: true })
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z')
    const { count, error } = await query
    if (error) return null
    return count ?? 0
  } catch {
    return null
  }
}

// =============================================================================
// AI RESOURCE MANAGER HELPERS — Session 3d
// =============================================================================

/**
 * Summary status ai_tasks: count per status (queued / running / done / failed)
 */
export async function getAiTasksSummary(db: DbClient): Promise<{
  total: number
  queued: number
  running: number
  done: number
  failed: number
} | null> {
  try {
    const { data, error } = await db
      .from('ai_tasks')
      .select('status')
    if (error || !data) return null
    const rows = data as any[]
    const result = { total: rows.length, queued: 0, running: 0, done: 0, failed: 0 }
    for (const row of rows) {
      const s: string = row.status ?? ''
      if (s === 'queued') result.queued++
      else if (s === 'running') result.running++
      else if (s === 'done') result.done++
      else if (s === 'failed') result.failed++
    }
    return result
  } catch {
    return null
  }
}

/**
 * Get last N ai_tasks entries (ordered by created_at DESC)
 */
export async function getRecentAiTasks(
  db: DbClient,
  limit = 5
): Promise<any[] | null> {
  try {
    const { data, error } = await db
      .from('ai_tasks')
      .select('id, task_type, agent, status, created_at, started_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return null
    return (data as any[]) ?? []
  } catch {
    return null
  }
}

/**
 * Summary credit_ledger: total_credits_used + count per provider
 */
export async function getCreditLedgerSummary(db: DbClient): Promise<{
  total_entries: number
  total_credits_used: number
  by_provider: Record<string, number>
} | null> {
  try {
    const { data, error } = await db
      .from('credit_ledger')
      .select('provider, credits_used')
    if (error || !data) return null
    const rows = data as any[]
    const byProvider: Record<string, number> = {}
    let totalCredits = 0
    for (const row of rows) {
      const provider: string = row.provider ?? 'unknown'
      const credits: number = typeof row.credits_used === 'number' ? row.credits_used : 0
      totalCredits += credits
      byProvider[provider] = (byProvider[provider] ?? 0) + credits
    }
    return {
      total_entries: rows.length,
      total_credits_used: totalCredits,
      by_provider: byProvider,
    }
  } catch {
    return null
  }
}

// =============================================================================
// FOUNDER REVIEW HELPERS — Session 3d
// =============================================================================

/**
 * Get all weekly_reviews ordered by created_at DESC (limit N)
 * Return null jika tabel belum ada / error
 */
export async function getWeeklyReviews(
  db: DbClient,
  limit = 5
): Promise<any[] | null> {
  try {
    const { data, error } = await db
      .from('weekly_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) {
      // Distinguish: table not found vs other errors
      return null
    }
    return (data as any[]) ?? []
  } catch {
    return null
  }
}

/**
 * Check apakah weekly_reviews table ada (probe dengan count)
 * Return true jika tabel ada, false jika error (termasuk tabel belum dibuat)
 */
export async function checkWeeklyReviewsTableExists(db: DbClient): Promise<boolean> {
  try {
    // NOTE: Use .select('id').limit(1) instead of HEAD count — HEAD count does not trigger
    // PGRST205 (schema cache miss) and gives false positive if table doesn't exist.
    // Real SELECT correctly fails with PGRST205 if table is missing from PostgREST schema cache.
    const { error } = await db
      .from('weekly_reviews')
      .select('id')
      .limit(1)
    return !error
  } catch {
    return false
  }
}

// =============================================================================
// FOUNDER REVIEW WRITE HELPERS — Session 3e
// =============================================================================

export interface WeeklyReviewInsert {
  week_label: string          // e.g. "2026-W14"
  revenue_progress: string    // Q1 answer
  build_progress: string      // Q2 answer
  arch_decisions: string      // Q3 answer
  lessons_learned: string     // Q4 answer
  next_priorities: string     // Q5 answer
  overall_rating?: number     // 1-5 optional
  notes?: string              // free-form notes
}

/**
 * Insert satu weekly review entry
 * Return inserted row atau null jika error
 */
export async function insertWeeklyReview(
  db: DbClient,
  review: WeeklyReviewInsert
): Promise<any | null> {
  try {
    const { data, error } = await db
      .from('weekly_reviews')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({
        week_label: review.week_label,
        revenue_progress: review.revenue_progress,
        build_progress: review.build_progress,
        arch_decisions: review.arch_decisions,
        lessons_learned: review.lessons_learned,
        next_priorities: review.next_priorities,
        overall_rating: review.overall_rating ?? null,
        notes: review.notes ?? null,
      } as any)
      .select()
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}
