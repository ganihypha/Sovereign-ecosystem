// @sovereign/db — helpers/wa-logs.ts
// Query helpers untuk domain WA Automation
// Domain 3 — sovereign-main.wa_logs (🔴 PLANNED Sprint 1)
//
// ⚠️ HUMAN GATE PATTERN:
// Semua outbound WA message yang digenerate oleh agent WAJIB:
//   1. Disimpan dulu ke wa_logs dengan status='pending' + requires_approval=true
//   2. Founder review di Sovereign Tower
//   3. Founder approve → status='approved' → baru dikirim via Fonnte API
//   4. Setelah kirim → update status ke sent/delivered/failed
//
// TIDAK BOLEH kirim WA langsung tanpa melalui flow ini (untuk agent messages)

import type { SovereignServerClient, DbResult } from '../client'
import { wrapResult } from '../client'
import type { WaLogsTable } from '../schema'
import { DB_TABLES } from '../schema'

export type WaLogRow = WaLogsTable['Row']
export type WaLogInsert = WaLogsTable['Insert']
export type WaLogUpdate = WaLogsTable['Update']

// =============================================================================
// READ
// =============================================================================

export async function getWaLogById(
  client: SovereignServerClient,
  id: string
): Promise<DbResult<WaLogRow>> {
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .select('*')
    .eq('id', id)
    .single()

  return wrapResult(data, error)
}

/**
 * List WA logs yang MENUNGGU approval founder (human gate queue)
 * Dipakai di Sovereign Tower — approval queue
 */
export async function listPendingApprovals(
  client: SovereignServerClient,
  limit = 20
): Promise<DbResult<WaLogRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .select('*')
    .eq('requires_approval', true)
    .eq('status', 'pending')
    .limit(limit)
    .order('created_at', { ascending: true }) // Oldest first

  return wrapResult(data, error)
}

export async function listWaLogsByLead(
  client: SovereignServerClient,
  leadId: string,
  limit = 50
): Promise<DbResult<WaLogRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .select('*')
    .eq('lead_id', leadId)
    .limit(limit)
    .order('created_at', { ascending: false })

  return wrapResult(data, error)
}

// =============================================================================
// WRITE
// =============================================================================

/**
 * Log outbound WA message dari agent (pending approval)
 *
 * ⚠️ HUMAN GATE: Secara default requires_approval=true untuk agent messages
 * Founder-sent messages boleh requires_approval=false
 */
export async function insertWaLog(
  client: SovereignServerClient,
  payload: WaLogInsert
): Promise<DbResult<WaLogRow>> {
  const now = new Date().toISOString()

  // Enforce: agent messages WAJIB requires_approval=true kecuali dikirim founder manual
  const requires_approval =
    payload.requires_approval !== undefined
      ? payload.requires_approval
      : payload.sent_by === 'agent' || payload.sent_by === 'system'

  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .insert({
      ...payload,
      direction: payload.direction ?? 'outbound',
      status: payload.status ?? 'pending',
      requires_approval,
      created_at: payload.created_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Founder approve WA message — unlock untuk dikirim
 *
 * Setelah approve:
 *   - status tetap 'pending' (siap kirim)
 *   - requires_approval diupdate (jadi false untuk unlock)
 *   - approved_by + approved_at diisi
 *
 * Pengiriman actual via Fonnte ada di @sovereign/integrations
 */
export async function approveWaLog(
  client: SovereignServerClient,
  id: string,
  approvedByUserId: string
): Promise<DbResult<WaLogRow>> {
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .update({
      requires_approval: false,   // Unlock — siap kirim
      approved_by: approvedByUserId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')      // Safety check: hanya update yang masih pending
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Update status WA setelah Fonnte API response
 */
export async function updateWaLogStatus(
  client: SovereignServerClient,
  id: string,
  status: WaLogRow['status'],
  fonnteMessageId?: string
): Promise<DbResult<WaLogRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .update({
      status,
      fonnte_message_id: fonnteMessageId ?? null,
      sent_at: status === 'sent' ? now : undefined,
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Reject WA message (founder reject — tidak jadi dikirim)
 */
export async function rejectWaLog(
  client: SovereignServerClient,
  id: string,
  rejectedByUserId: string
): Promise<DbResult<WaLogRow>> {
  const { data, error } = await client
    .from(DB_TABLES.WA_LOGS)
    .update({
      status: 'rejected_by_founder',
      approved_by: rejectedByUserId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}
