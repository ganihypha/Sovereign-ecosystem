// @sovereign/db — helpers/leads.ts
// Query helpers untuk domain Leads
// Domain 2 Commerce Core — sovereign-main.leads (✅ LIVE)
//
// Prinsip:
// - Semua helper return DbResult<T> — TIDAK throw exception
// - Semua helper menerima typed Supabase client (SovereignServerClient)
// - Query minimal, cukup untuk use case nyata hari ini
// - Tidak ada logic bisnis — hanya DB access layer

import type { SovereignServerClient, DbResult } from '../client'
import { wrapResult } from '../client'
import type { LeadsTable } from '../schema'
import { DB_TABLES } from '../schema'

export type LeadRow = LeadsTable['Row']
export type LeadInsert = LeadsTable['Insert']
export type LeadUpdate = LeadsTable['Update']

// =============================================================================
// READ
// =============================================================================

/**
 * Ambil satu lead berdasarkan ID
 */
export async function getLeadById(
  client: SovereignServerClient,
  id: string
): Promise<DbResult<LeadRow>> {
  const { data, error } = await client
    .from(DB_TABLES.LEADS)
    .select('*')
    .eq('id', id)
    .single()

  return wrapResult(data, error)
}

/**
 * List leads dengan filter opsional
 * @param options - Filter, sorting, pagination
 */
export async function listLeads(
  client: SovereignServerClient,
  options: {
    status?: LeadRow['status']
    source?: LeadRow['source']
    limit?: number
    offset?: number
    order?: { column: keyof LeadRow; ascending: boolean }
  } = {}
): Promise<DbResult<LeadRow[]>> {
  const {
    status,
    source,
    limit = 20,
    offset = 0,
    order = { column: 'created_at', ascending: false },
  } = options

  let query = client
    .from(DB_TABLES.LEADS)
    .select('*')
    .range(offset, offset + limit - 1)
    .order(order.column as string, { ascending: order.ascending })

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('source', source)

  const { data, error } = await query
  return wrapResult(data, error)
}

/**
 * Cari leads berdasarkan nama atau instagram handle
 */
export async function searchLeads(
  client: SovereignServerClient,
  query: string,
  limit = 10
): Promise<DbResult<LeadRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.LEADS)
    .select('*')
    .or(`name.ilike.%${query}%,instagram_handle.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit)

  return wrapResult(data, error)
}

// =============================================================================
// WRITE
// =============================================================================

/**
 * Buat lead baru
 */
export async function insertLead(
  client: SovereignServerClient,
  payload: LeadInsert
): Promise<DbResult<LeadRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.LEADS)
    .insert({
      ...payload,
      status: payload.status ?? 'new',
      created_at: payload.created_at ?? now,
      updated_at: payload.updated_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Update lead — partial update
 */
export async function updateLead(
  client: SovereignServerClient,
  id: string,
  payload: LeadUpdate
): Promise<DbResult<LeadRow>> {
  const { data, error } = await client
    .from(DB_TABLES.LEADS)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Update AI score lead (dari ScoutScorer output)
 */
export async function updateLeadAIScore(
  client: SovereignServerClient,
  id: string,
  score: number,
  reasoning: string
): Promise<DbResult<LeadRow>> {
  const update: LeadUpdate = {
    ai_score: score,
    ai_score_reasoning: reasoning,
    updated_at: new Date().toISOString(),
  }
  // Auto-qualify jika score >= 70 (hanya update status jika memenuhi threshold)
  if (score >= 70) {
    update.status = 'qualified'
  }
  return updateLead(client, id, update)
}
