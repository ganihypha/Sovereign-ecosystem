// sovereign-tower — src/routes/agents.ts
// AI Agent routes — Session 4A: ScoutScorer Agent
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Session 4A Scope:
//   - POST /api/agents/scout-score  — Score single lead via GROQ
//   - Uses: ai_tasks table, leads table, GROQ_API_KEY
//   - Human gate: requires_approval = false (scoring only, no action)
//   - No auto-send, no broadcast, no WA trigger from this route

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
  // 4. Call GROQ API
  // -------------------------------------------------------------------------
  let groqResponse: GroqResponse
  let tokensUsed = 0
  let groqError: string | null = null

  try {
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

    groqResponse = await groqRes.json() as GroqResponse
    tokensUsed = groqResponse.usage?.total_tokens ?? 0
  } catch (err) {
    // Log failed ai_task before returning error
    await (db as any).from('ai_tasks').insert({
      agent: SCOUT_SCORER_AGENT,
      status: 'failed',
      input: { lead_id },
      error_message: groqError ?? String(err),
      model_used: GROQ_MODEL,
      triggered_by: 'founder',
      requires_approval: false,
      related_lead_id: lead_id,
      completed_at: new Date().toISOString(),
    })

    return c.json(errorResponse('GROQ_API_ERROR', groqError ?? 'GROQ API call failed'), 502)
  }

  // -------------------------------------------------------------------------
  // 5. Parse score from GROQ response
  // -------------------------------------------------------------------------
  const rawContent = groqResponse.choices?.[0]?.message?.content ?? ''
  const { score, reasoning } = parseGroqScore(rawContent)
  const taskCompletedAt = new Date().toISOString()

  // -------------------------------------------------------------------------
  // 6. Update lead.ai_score + ai_score_reasoning in DB
  // -------------------------------------------------------------------------
  const { error: updateError } = await (db as any)
    .from('leads')
    .update({
      ai_score: score,
      ai_score_reasoning: reasoning,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lead_id)

  if (updateError) {
    // Non-fatal — still return score but note update failed
    console.error('[scout-score] lead update failed:', updateError.message)
  }

  // -------------------------------------------------------------------------
  // 7. Write ai_tasks record (completed)
  // -------------------------------------------------------------------------
  const { data: taskData, error: taskError } = await (db as any)
    .from('ai_tasks')
    .insert({
      agent: SCOUT_SCORER_AGENT,
      status: 'completed',
      input: { lead_id, lead_name: lead.name },
      output: { score, reasoning, raw_groq_content: rawContent.slice(0, 500) },
      tokens_used: tokensUsed,
      model_used: GROQ_MODEL,
      triggered_by: 'founder',
      requires_approval: false,
      related_lead_id: lead_id,
      completed_at: taskCompletedAt,
    })
    .select('id')
    .single()

  if (taskError) {
    console.error('[scout-score] ai_tasks insert failed:', taskError.message)
  }

  const taskId = (taskData as any)?.id ?? null

  // -------------------------------------------------------------------------
  // 8. Return result
  // -------------------------------------------------------------------------
  return c.json({
    ok: true,
    lead_id,
    lead_name: lead.name,
    score,
    reasoning,
    model_used: GROQ_MODEL,
    tokens_used: tokensUsed,
    task_id: taskId,
    lead_updated: !updateError,
    scored_at: taskCompletedAt,
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
    build_session: '4a',
  })
})
