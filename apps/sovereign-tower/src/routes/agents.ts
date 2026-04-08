// sovereign-tower — src/routes/agents.ts
// AI Agent routes — Session 4A/4B: ScoutScorer Agent (single + batch)
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Session 4A Scope:
//   - POST /api/agents/scout-score  — Score single lead via GROQ
//   - Uses: ai_tasks table, leads table, GROQ_API_KEY
//   - Human gate: requires_approval = false (scoring only, no action)
//   - No auto-send, no broadcast, no WA trigger from this route
//
// Session 4B Scope (Extension):
//   - POST /api/agents/scout-score/batch — Score multiple leads (max 20)
//   - Reuses single-lead scoring logic
//   - Returns per-item results with partial failure handling

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { errorResponse } from '../lib/app-config'
import { tryCreateDbClient, hasDbCredentials } from '../lib/db-adapter'

type AgentContext = {
  Bindings: TowerEnv
  Variables: SovereignAuthVariables
}

export const agentsRouter = new Hono<AgentContext>()

// =============================================================================
// CONSTANTS
// =============================================================================

const SCOUT_SCORER_AGENT = 'scout_scorer' as const
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'
const SCORE_MIN = 0
const SCORE_MAX = 100

// =============================================================================
// TYPES
// =============================================================================

interface ScoutScoreInput {
  lead_id: string
}

interface BatchScoreInput {
  lead_ids: string[]
  batch_name?: string
}

interface BatchScoreResultItem {
  lead_id: string
  success: boolean
  score?: number
  reasoning?: string
  task_id?: string
  lead_updated?: boolean
  error?: string
}

interface LeadRow {
  id: string
  name: string
  status: string
  source: string
  instagram_handle: string | null
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[] | null
  ai_score: number | null
  created_at: string
}

interface GroqChoice {
  message: {
    content: string
  }
}

interface GroqResponse {
  choices: GroqChoice[]
  usage?: {
    total_tokens?: number
  }
}

interface ScoreResult {
  score: number
  reasoning: string
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build scoring prompt untuk lead
 */
function buildScoringPrompt(lead: LeadRow): string {
  return `You are ScoutScorer, an AI sales qualification agent for a digital business ecosystem.

Score the following lead from ${SCORE_MIN} to ${SCORE_MAX} based on their likelihood to convert to a paying customer.

Lead data:
- Name: ${lead.name}
- Status: ${lead.status}
- Source: ${lead.source}
- Instagram: ${lead.instagram_handle ?? 'not provided'}
- Phone: ${lead.phone ?? 'not provided'}
- Email: ${lead.email ?? 'not provided'}
- Notes: ${lead.notes ?? 'none'}
- Tags: ${lead.tags?.join(', ') ?? 'none'}
- Created at: ${lead.created_at}

Scoring criteria:
- 80-100: Highly qualified, strong signals of intent and contact info complete
- 60-79: Moderately qualified, some signals present
- 40-59: Weak signals, needs nurturing
- 20-39: Low qualification, minimal data
- 0-19: Very unlikely to convert

Respond ONLY with valid JSON in this exact format, no other text:
{"score": <integer 0-100>, "reasoning": "<1-2 sentence explanation>"}`
}

/**
 * Parse GROQ response dan extract score + reasoning
 */
function parseGroqScore(content: string): ScoreResult {
  try {
    // Bersihkan content dari markdown code block jika ada
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const score = Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(Number(parsed.score))))
    const reasoning = String(parsed.reasoning ?? 'No reasoning provided').slice(0, 500)
    return { score, reasoning }
  } catch {
    // Fallback: coba extract angka dari response
    const match = content.match(/\b([0-9]{1,3})\b/)
    const score = match ? Math.max(SCORE_MIN, Math.min(SCORE_MAX, parseInt(match[1]))) : 50
    return { score, reasoning: 'Score extracted from response (JSON parse failed)' }
  }
}

/**
 * Core scoring logic untuk single lead
 * Extracted dari POST /scout-score untuk reuse di batch route
 */
async function scoreLeadWithGroq(
  db: any,
  env: TowerEnv,
  lead: LeadRow
): Promise<{ success: boolean; score?: number; reasoning?: string; task_id?: string; error?: string; tokens_used?: number }> {
  let groqError: string | null = null
  let tokensUsed = 0

  try {
    // Call GROQ API
    const prompt = buildScoringPrompt(lead)
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      groqError = `GROQ HTTP ${groqRes.status}: ${errText.slice(0, 200)}`
      throw new Error(groqError)
    }

    const groqResponse = await groqRes.json() as GroqResponse
    tokensUsed = groqResponse.usage?.total_tokens ?? 0

    // Parse score
    const rawContent = groqResponse.choices?.[0]?.message?.content ?? ''
    const { score, reasoning } = parseGroqScore(rawContent)
    const taskCompletedAt = new Date().toISOString()

    // Update lead.ai_score + ai_score_reasoning
    const { error: updateError } = await db
      .from('leads')
      .update({
        ai_score: score,
        ai_score_reasoning: reasoning,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    // Write ai_tasks record
    const { data: taskData, error: taskError } = await db
      .from('ai_tasks')
      .insert({
        agent: SCOUT_SCORER_AGENT,
        status: 'completed',
        input: { lead_id: lead.id, lead_name: lead.name },
        output: { score, reasoning, raw_groq_content: rawContent.slice(0, 500) },
        tokens_used: tokensUsed,
        model_used: GROQ_MODEL,
        triggered_by: 'founder',
        requires_approval: false,
        related_lead_id: lead.id,
        completed_at: taskCompletedAt,
      })
      .select('id')
      .single()

    const taskId = taskData?.id ?? null

    return {
      success: true,
      score,
      reasoning,
      task_id: taskId,
      tokens_used: tokensUsed,
    }
  } catch (err) {
    // Log failed task
    await db.from('ai_tasks').insert({
      agent: SCOUT_SCORER_AGENT,
      status: 'failed',
      input: { lead_id: lead.id, lead_name: lead.name },
      error_message: groqError ?? String(err),
      model_used: GROQ_MODEL,
      triggered_by: 'founder',
      requires_approval: false,
      related_lead_id: lead.id,
      completed_at: new Date().toISOString(),
    })

    return {
      success: false,
      error: groqError ?? String(err),
    }
  }
}

// =============================================================================
// ROUTE: POST /api/agents/scout-score
// =============================================================================

/**
 * POST /api/agents/scout-score
 *
 * Score a single lead using GROQ LLM.
 * Writes result to ai_tasks table and updates lead.ai_score + ai_score_reasoning.
 *
 * Body: { lead_id: string }
 *
 * Flow:
 * 1. Validate input
 * 2. Fetch lead from DB
 * 3. Call GROQ API
 * 4. Parse score
 * 5. Update lead.ai_score + ai_score_reasoning in DB
 * 6. Write ai_tasks record with result
 * 7. Return score result
 *
 * ⚠️ HUMAN GATE:
 * - requires_approval = false (read-only scoring, no action taken)
 * - Score is written back to lead record only
 * - No WA send, no broadcast triggered from this route
 */
agentsRouter.post('/scout-score', async (c) => {
  const env = c.env

  // -------------------------------------------------------------------------
  // 1. Validate GROQ key + DB credentials
  // -------------------------------------------------------------------------
  if (!env.GROQ_API_KEY) {
    return c.json(errorResponse('GROQ_API_KEY_MISSING', 'GROQ_API_KEY not configured'), 503)
  }

  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials not configured'), 503)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = tryCreateDbClient(env) as any
  if (!db) {
    return c.json(errorResponse('DB_INIT_FAILED', 'Failed to initialize database client'), 503)
  }

  // -------------------------------------------------------------------------
  // 2. Parse + validate body
  // -------------------------------------------------------------------------
  let body: ScoutScoreInput
  try {
    body = await c.req.json<ScoutScoreInput>()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body must be valid JSON'), 400)
  }

  const { lead_id } = body
  if (!lead_id || typeof lead_id !== 'string' || lead_id.trim() === '') {
    return c.json(errorResponse('LEAD_ID_REQUIRED', 'lead_id is required'), 400)
  }

  // Basic UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(lead_id)) {
    return c.json(errorResponse('LEAD_ID_INVALID', 'lead_id must be a valid UUID'), 400)
  }

  // -------------------------------------------------------------------------
  // 3. Fetch lead from DB
  // -------------------------------------------------------------------------
  const { data: leadData, error: leadError } = await (db as any)
    .from('leads')
    .select('id, name, status, source, instagram_handle, phone, email, notes, tags, ai_score, created_at')
    .eq('id', lead_id)
    .single()

  if (leadError || !leadData) {
    return c.json(errorResponse('LEAD_NOT_FOUND', `Lead ${lead_id} not found`), 404)
  }

  const lead = leadData as LeadRow
  // -------------------------------------------------------------------------
  // 4. Score lead using extracted helper
  // -------------------------------------------------------------------------
  const result = await scoreLeadWithGroq(db, env, lead)

  if (!result.success) {
    return c.json(errorResponse('GROQ_API_ERROR', result.error ?? 'GROQ API call failed'), 502)
  }

  // -------------------------------------------------------------------------
  // 5. Return result
  // -------------------------------------------------------------------------
  return c.json({
    ok: true,
    lead_id,
    lead_name: lead.name,
    score: result.score,
    reasoning: result.reasoning,
    model_used: GROQ_MODEL,
    tokens_used: result.tokens_used,
    task_id: result.task_id,
    lead_updated: true,
    scored_at: new Date().toISOString(),
  })
})

// =============================================================================
// ROUTE: GET /api/agents/scout-score/status
// =============================================================================

/**
 * GET /api/agents/scout-score/status
 * Health check untuk agent route — returns agent availability
 */
agentsRouter.get('/scout-score/status', async (c) => {
  const env = c.env
  const groqReady = !!env.GROQ_API_KEY

  return c.json({
    ok: true,
    agent: SCOUT_SCORER_AGENT,
    model: GROQ_MODEL,
    groq_configured: groqReady,
    status: groqReady ? 'ready' : 'missing_groq_key',
    build_session: '4b',
  })
})

// =============================================================================
// ROUTE: POST /api/agents/scout-score/batch
// =============================================================================

/**
 * POST /api/agents/scout-score/batch
 *
 * Score multiple leads (max 20) using GROQ LLM.
 * Processes each lead sequentially and returns per-item results.
 *
 * Body: { lead_ids: string[], batch_name?: string }
 *
 * Response: {
 *   ok: true,
 *   batch_id: string,
 *   batch_name: string | null,
 *   total: number,
 *   succeeded: number,
 *   failed: number,
 *   results: BatchScoreResultItem[],
 *   started_at: string,
 *   completed_at: string
 * }
 *
 * ⚠️ SAFETY LIMITS:
 * - Max 20 leads per batch
 * - Partial failure handling (continue on individual errors)
 * - No auto-send, no broadcast triggered
 */
agentsRouter.post('/scout-score/batch', async (c) => {
  const env = c.env
  const batchStartedAt = new Date().toISOString()

  // -------------------------------------------------------------------------
  // 1. Validate GROQ key + DB credentials
  // -------------------------------------------------------------------------
  if (!env.GROQ_API_KEY) {
    return c.json(errorResponse('GROQ_API_KEY_MISSING', 'GROQ_API_KEY not configured'), 503)
  }

  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials not configured'), 503)
  }

  const db = tryCreateDbClient(env) as any
  if (!db) {
    return c.json(errorResponse('DB_INIT_FAILED', 'Failed to initialize database client'), 503)
  }

  // -------------------------------------------------------------------------
  // 2. Parse + validate body
  // -------------------------------------------------------------------------
  let body: BatchScoreInput
  try {
    body = await c.req.json<BatchScoreInput>()
  } catch {
    return c.json(errorResponse('INVALID_JSON', 'Request body must be valid JSON'), 400)
  }

  const { lead_ids, batch_name } = body

  // Validate lead_ids
  if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
    return c.json(errorResponse('LEAD_IDS_REQUIRED', 'lead_ids must be a non-empty array'), 400)
  }

  if (lead_ids.length > 20) {
    return c.json(errorResponse('BATCH_TOO_LARGE', 'Maximum 20 leads per batch'), 400)
  }

  // Validate each lead_id format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const invalidIds = lead_ids.filter(id => typeof id !== 'string' || !uuidRegex.test(id))
  if (invalidIds.length > 0) {
    return c.json(
      errorResponse('INVALID_LEAD_IDS', `${invalidIds.length} invalid UUID(s)`, { invalid_ids: invalidIds.slice(0, 5) }),
      400
    )
  }

  // -------------------------------------------------------------------------
  // 3. Generate batch ID
  // -------------------------------------------------------------------------
  const batchId = crypto.randomUUID()

  // -------------------------------------------------------------------------
  // 4. Process each lead
  // -------------------------------------------------------------------------
  const results: BatchScoreResultItem[] = []
  let succeeded = 0
  let failed = 0

  for (const lead_id of lead_ids) {
    // Fetch lead from DB
    const { data: leadData, error: leadError } = await db
      .from('leads')
      .select('id, name, status, source, instagram_handle, phone, email, notes, tags, ai_score, created_at')
      .eq('id', lead_id)
      .single()

    if (leadError || !leadData) {
      // Lead not found — record failure
      failed++
      results.push({
        lead_id,
        success: false,
        error: `Lead ${lead_id} not found`,
      })
      continue
    }

    const lead = leadData as LeadRow

    // Score lead using extracted helper
    const scoreResult = await scoreLeadWithGroq(db, env, lead)

    if (scoreResult.success) {
      succeeded++
      results.push({
        lead_id,
        success: true,
        score: scoreResult.score,
        reasoning: scoreResult.reasoning,
        task_id: scoreResult.task_id,
        lead_updated: true,
      })
    } else {
      failed++
      results.push({
        lead_id,
        success: false,
        error: scoreResult.error ?? 'Unknown error',
      })
    }
  }

  const batchCompletedAt = new Date().toISOString()

  // -------------------------------------------------------------------------
  // 5. Return batch result
  // -------------------------------------------------------------------------
  return c.json({
    ok: true,
    batch_id: batchId,
    batch_name: batch_name ?? null,
    total: lead_ids.length,
    succeeded,
    failed,
    results,
    started_at: batchStartedAt,
    completed_at: batchCompletedAt,
  })
})

// =============================================================================
// SESSION 4C: INSIGHT GENERATOR AGENT
// =============================================================================

/**
 * POST /api/agents/insights
 * 
 * Generate actionable insights from scored leads.
 * Analyzes score distribution and provides:
 * - Score summary (total leads, avg score, distribution)
 * - Top opportunities (high-scoring leads)
 * - Weak leads (low-scoring leads)
 * - Recommended next actions
 * 
 * Optional query params:
 * - ?limit=50 (max leads to analyze, default 100)
 * - ?min_score=0 (filter minimum score)
 * - ?status=new (filter by lead status)
 * 
 * Response:
 * {
 *   ok: true,
 *   summary: {
 *     total_leads: number,
 *     scored_leads: number,
 *     avg_score: number,
 *     score_distribution: { high: number, medium: number, low: number }
 *   },
 *   top_opportunities: Lead[],
 *   weak_leads: Lead[],
 *   insights: {
 *     summary: string,
 *     recommended_actions: string[]
 *   },
 *   generated_at: string
 * }
 */
agentsRouter.post('/insights', async (c) => {
  const env = c.env
  const generatedAt = new Date().toISOString()

  // -------------------------------------------------------------------------
  // 1. Validate DB credentials
  // -------------------------------------------------------------------------
  if (!hasDbCredentials(env)) {
    return c.json(errorResponse('DB_NOT_CONFIGURED', 'Database credentials not configured'), 503)
  }

  const db = tryCreateDbClient(env) as any
  if (!db) {
    return c.json(errorResponse('DB_INIT_FAILED', 'Failed to initialize database client'), 503)
  }

  // Validate GROQ key for AI insights generation
  if (!env.GROQ_API_KEY) {
    return c.json(errorResponse('GROQ_API_KEY_MISSING', 'GROQ_API_KEY not configured'), 503)
  }

  // -------------------------------------------------------------------------
  // 2. Parse query parameters
  // -------------------------------------------------------------------------
  const limit = Math.min(parseInt(c.req.query('limit') ?? '100'), 200)
  const minScore = parseInt(c.req.query('min_score') ?? '0')
  const statusFilter = c.req.query('status') ?? null

  // -------------------------------------------------------------------------
  // 3. Fetch scored leads from database
  // -------------------------------------------------------------------------
  let query = db
    .from('leads')
    .select('id, name, status, source, instagram_handle, phone, email, ai_score, ai_score_reasoning, created_at')
    .not('ai_score', 'is', null)
    .order('ai_score', { ascending: false })
    .limit(limit)

  if (minScore > 0) {
    query = query.gte('ai_score', minScore)
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: leadsData, error: leadsError } = await query

  if (leadsError) {
    return c.json(errorResponse('DB_QUERY_FAILED', `Failed to fetch leads: ${leadsError.message}`), 500)
  }

  const leads = (leadsData ?? []) as any[]

  if (leads.length === 0) {
    return c.json({
      ok: true,
      summary: {
        total_leads: 0,
        scored_leads: 0,
        avg_score: 0,
        score_distribution: { high: 0, medium: 0, low: 0 }
      },
      top_opportunities: [],
      weak_leads: [],
      insights: {
        summary: 'No scored leads found matching criteria.',
        recommended_actions: ['Score more leads using POST /api/agents/scout-score/batch']
      },
      generated_at: generatedAt
    })
  }

  // -------------------------------------------------------------------------
  // 4. Calculate summary statistics
  // -------------------------------------------------------------------------
  const totalLeads = leads.length
  const scores = leads.map(l => l.ai_score).filter(s => typeof s === 'number')
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length

  const scoreDistribution = {
    high: leads.filter(l => l.ai_score >= 70).length,
    medium: leads.filter(l => l.ai_score >= 40 && l.ai_score < 70).length,
    low: leads.filter(l => l.ai_score < 40).length
  }

  // -------------------------------------------------------------------------
  // 5. Identify top opportunities and weak leads
  // -------------------------------------------------------------------------
  const topOpportunities = leads.filter(l => l.ai_score >= 70).slice(0, 5)
  const weakLeads = leads.filter(l => l.ai_score < 40).slice(0, 5)

  // -------------------------------------------------------------------------
  // 6. Generate AI insights using GROQ
  // -------------------------------------------------------------------------
  const leadsSummaryForAI = leads.slice(0, 20).map(l => ({
    name: l.name,
    score: l.ai_score,
    status: l.status,
    source: l.source,
    reasoning: l.ai_score_reasoning?.substring(0, 100)
  }))

  const insightPrompt = `You are a lead intelligence analyst. Based on this lead scoring data, provide:
1. A concise 2-sentence summary of the lead quality landscape
2. Top 3 recommended next actions for the founder/operator

Lead Data Summary:
- Total Scored Leads: ${totalLeads}
- Average Score: ${avgScore.toFixed(1)}/100
- Distribution: ${scoreDistribution.high} high (70+), ${scoreDistribution.medium} medium (40-69), ${scoreDistribution.low} low (<40)
- Top ${leadsSummaryForAI.length} leads sample: ${JSON.stringify(leadsSummaryForAI, null, 2)}

Provide response in JSON format:
{
  "summary": "2-sentence analysis",
  "recommended_actions": ["action 1", "action 2", "action 3"]
}`

  let aiInsights = {
    summary: `Lead pool shows average quality of ${avgScore.toFixed(1)}/100. Focus on ${scoreDistribution.high} high-scoring leads for immediate conversion opportunities.`,
    recommended_actions: [
      `Prioritize contact with ${topOpportunities.length} high-scoring leads (70+ score)`,
      `Review and improve engagement for ${scoreDistribution.medium} medium-scoring leads`,
      `Filter or re-qualify ${scoreDistribution.low} low-scoring leads`
    ]
  }

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a lead intelligence analyst. Always respond with valid JSON.' },
          { role: 'user', content: insightPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (groqResponse.ok) {
      const groqData = await groqResponse.json() as any
      const aiContent = groqData.choices?.[0]?.message?.content
      if (aiContent) {
        try {
          // Try to parse JSON response
          const parsed = JSON.parse(aiContent)
          if (parsed.summary && parsed.recommended_actions) {
            aiInsights = parsed
          }
        } catch {
          // If not valid JSON, use AI response as summary text
          aiInsights.summary = aiContent.substring(0, 300)
        }
      }
    }
  } catch (error) {
    // Use fallback insights if GROQ fails
    console.error('GROQ insight generation failed:', error)
  }

  // -------------------------------------------------------------------------
  // 7. Log AI task for audit trail
  // -------------------------------------------------------------------------
  try {
    await db.from('ai_tasks').insert({
      id: crypto.randomUUID(),
      agent: 'insight_generator',
      prompt: insightPrompt.substring(0, 500),
      result: JSON.stringify(aiInsights),
      status: 'completed',
      created_at: new Date().toISOString()
    })
  } catch {
    // Non-critical: insight generation succeeded even if logging failed
  }

  // -------------------------------------------------------------------------
  // 8. Return insight report
  // -------------------------------------------------------------------------
  return c.json({
    ok: true,
    summary: {
      total_leads: totalLeads,
      scored_leads: scores.length,
      avg_score: parseFloat(avgScore.toFixed(2)),
      score_distribution: scoreDistribution
    },
    top_opportunities: topOpportunities.map(l => ({
      id: l.id,
      name: l.name,
      score: l.ai_score,
      status: l.status,
      source: l.source,
      contact: l.phone || l.email || l.instagram_handle,
      reasoning: l.ai_score_reasoning
    })),
    weak_leads: weakLeads.map(l => ({
      id: l.id,
      name: l.name,
      score: l.ai_score,
      status: l.status,
      reasoning: l.ai_score_reasoning?.substring(0, 100)
    })),
    insights: aiInsights,
    generated_at: generatedAt
  })
})
