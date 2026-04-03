// @sovereign/db — helpers/ai-tasks.ts
// Query helpers untuk domain AI Agent State
// Domain 4 — sovereign-main.ai_tasks + ai_insights (🔴 PLANNED Sprint 1)
//
// ⚠️ HUMAN GATE: ai_tasks dengan requires_approval=true WAJIB ditahan
// sampai founder approve sebelum agent execute irreversible action

import type { SovereignServerClient, DbResult } from '../client'
import { wrapResult } from '../client'
import type { AITasksTable, AIInsightsTable, AgentRunsTable } from '../schema'
import { DB_TABLES } from '../schema'
import type { AgentType } from '../../../types/src/common'

export type AITaskRow = AITasksTable['Row']
export type AITaskInsert = AITasksTable['Insert']
export type AITaskUpdate = AITasksTable['Update']
export type AIInsightRow = AIInsightsTable['Row']
export type AIInsightInsert = AIInsightsTable['Insert']
export type AgentRunRow = AgentRunsTable['Row']
export type AgentRunInsert = AgentRunsTable['Insert']

// =============================================================================
// AI TASKS — READ
// =============================================================================

export async function getAITaskById(
  client: SovereignServerClient,
  id: string
): Promise<DbResult<AITaskRow>> {
  const { data, error } = await client
    .from(DB_TABLES.AI_TASKS)
    .select('*')
    .eq('id', id)
    .single()

  return wrapResult(data, error)
}

/**
 * List tasks yang MENUNGGU approval founder (human gate)
 */
export async function listTasksPendingApproval(
  client: SovereignServerClient,
  limit = 20
): Promise<DbResult<AITaskRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.AI_TASKS)
    .select('*')
    .eq('requires_approval', true)
    .eq('status', 'awaiting_approval')
    .limit(limit)
    .order('created_at', { ascending: true })

  return wrapResult(data, error)
}

export async function listTasksByAgent(
  client: SovereignServerClient,
  agent: AgentType,
  options: { limit?: number; offset?: number; status?: AITaskRow['status'] } = {}
): Promise<DbResult<AITaskRow[]>> {
  const { limit = 20, offset = 0, status } = options
  let query = client
    .from(DB_TABLES.AI_TASKS)
    .select('*')
    .eq('agent', agent)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  const { data, error } = await query
  return wrapResult(data, error)
}

// =============================================================================
// AI TASKS — WRITE
// =============================================================================

/**
 * Buat AI task baru
 *
 * ⚠️ Untuk tasks yang akan trigger irreversible actions (WA blast, dll):
 *    Set requires_approval=true → task akan masuk ke approval queue
 */
export async function insertAITask(
  client: SovereignServerClient,
  payload: AITaskInsert
): Promise<DbResult<AITaskRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.AI_TASKS)
    .insert({
      ...payload,
      status: payload.status ?? 'queued',
      requires_approval: payload.requires_approval ?? false,
      created_at: payload.created_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

/**
 * Update status AI task (lifecycle management)
 */
export async function updateAITaskStatus(
  client: SovereignServerClient,
  id: string,
  update: Pick<AITaskUpdate, 'status' | 'output' | 'error_message' | 'tokens_used' | 'model_used' | 'duration_ms'>
): Promise<DbResult<AITaskRow>> {
  const { data, error } = await client
    .from(DB_TABLES.AI_TASKS)
    .update({
      ...update,
      completed_at: (update.status === 'completed' || update.status === 'failed')
        ? new Date().toISOString()
        : undefined,
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}

// =============================================================================
// AI INSIGHTS — READ + WRITE
// =============================================================================

export async function listInsightsByType(
  client: SovereignServerClient,
  insightType: AIInsightRow['insight_type'],
  limit = 10
): Promise<DbResult<AIInsightRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.AI_INSIGHTS)
    .select('*')
    .eq('insight_type', insightType)
    .limit(limit)
    .order('created_at', { ascending: false })

  return wrapResult(data, error)
}

export async function insertAIInsight(
  client: SovereignServerClient,
  payload: AIInsightInsert
): Promise<DbResult<AIInsightRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.AI_INSIGHTS)
    .insert({
      ...payload,
      priority: payload.priority ?? 'medium',
      created_at: payload.created_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

// =============================================================================
// AGENT RUNS — Untuk tracking keseluruhan run pipeline
// =============================================================================

/**
 * Generate run number format: RUN-YYYYMMDD-XXXX
 */
export function generateRunNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RUN-${date}-${rand}`
}

export async function insertAgentRun(
  client: SovereignServerClient,
  payload: AgentRunInsert
): Promise<DbResult<AgentRunRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.AGENT_RUNS)
    .insert({
      ...payload,
      run_number: payload.run_number ?? generateRunNumber(),
      status: payload.status ?? 'running',
      requires_approval: payload.requires_approval ?? false,
      created_at: payload.created_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

export async function updateAgentRunStatus(
  client: SovereignServerClient,
  id: string,
  status: AgentRunRow['status'],
  extras: { summary?: string; total_tokens?: number; total_cost_usd?: number } = {}
): Promise<DbResult<AgentRunRow>> {
  const { data, error } = await client
    .from(DB_TABLES.AGENT_RUNS)
    .update({
      status,
      ...extras,
      completed_at: (status === 'completed' || status === 'failed' || status === 'cancelled')
        ? new Date().toISOString()
        : undefined,
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}
