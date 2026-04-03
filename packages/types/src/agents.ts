// @sovereign/types — agents.ts
// AI Agent types: task contracts, run records, insight types
// Dipakai oleh: agent layer (ScoutScorer, MessageComposer, InsightGenerator, CloserAgent)
// ⚠️ File ini TIDAK boleh import dari @sovereign/db atau external API clients

import type {
  AgentStatus,
  AgentType,
  ISODateString,
  JSONObject,
} from './common'

// =============================================================================
// AGENT TASK (sovereign-main.ai_tasks)
// =============================================================================

/** Record task AI di canonical DB */
export type AITaskRecord = {
  id: string
  agent: AgentType
  status: AgentStatus
  input: JSONObject           // Input payload ke agent (serialized)
  output?: JSONObject         // Output agent (null jika belum selesai / error)
  error_message?: string      // Pesan error jika status = error
  tokens_used?: number        // Token LLM yang dipakai (untuk cost tracking)
  model_used?: string         // Model name: groq/llama3, claude-3-haiku, etc
  duration_ms?: number        // Berapa lama agent berjalan (ms)
  triggered_by: 'founder' | 'system' | 'schedule' | 'agent_chain'
  related_lead_id?: string    // Jika task berkaitan dengan lead
  related_order_id?: string   // Jika task berkaitan dengan order
  created_at: ISODateString
  completed_at?: ISODateString
}

/** Payload untuk membuat AI task baru */
export type CreateAITaskPayload = {
  agent: AgentType
  input: JSONObject
  triggered_by: AITaskRecord['triggered_by']
  related_lead_id?: string
  related_order_id?: string
}

// =============================================================================
// AGENT RUN (sovereign-main.agent_runs)
// Run = satu eksekusi lengkap pipeline agent
// Task = satu step dalam run
// =============================================================================

/** Record satu agent run */
export type AgentRunRecord = {
  id: string
  run_number: string            // Format: RUN-YYYYMMDD-XXXX
  agent: AgentType
  status: AgentStatus
  tasks: string[]               // Array of ai_task IDs dalam run ini
  total_tokens?: number         // Total token seluruh tasks
  total_cost_usd?: number       // Estimasi cost USD (untuk credit tracking)
  summary?: string              // Ringkasan hasil run (plain text)
  requires_approval: boolean    // True jika perlu human gate sebelum action
  approved_by?: string          // user_id founder yang approve
  approved_at?: ISODateString
  created_at: ISODateString
  completed_at?: ISODateString
}

// =============================================================================
// SCOUT AGENT (ScoutScorer)
// =============================================================================

/** Input untuk ScoutScorer */
export type ScoutInput = {
  instagram_handle: string
  name?: string
  manual_notes?: string           // Catatan dari founder
  context?: string                // Context tambahan (e.g. "kandidat reseller batik")
}

/** Output scoring dari ScoutScorer */
export type ScoutScore = {
  instagram_handle: string
  score: number                   // 0-100
  recommendation: 'hot' | 'warm' | 'cold' | 'disqualified'
  reasoning: string               // Penjelasan AI (max 200 kata)
  engagement_estimate?: string    // Estimasi engagement rate
  audience_fit?: string           // Apakah audience cocok dengan produk
  suggested_tags?: string[]       // Tag otomatis dari AI
}

// =============================================================================
// MESSAGE COMPOSER (MessageComposer)
// =============================================================================

/** Input untuk MessageComposer */
export type MessageComposerInput = {
  lead_id?: string
  customer_id?: string
  message_goal: 'initial_outreach' | 'follow_up' | 'closing' | 'onboarding' | 'reactivation'
  context?: string              // Context tambahan untuk personalisasi
  tone?: 'formal' | 'casual' | 'friendly'
  language?: 'id' | 'en'
}

/** Output dari MessageComposer */
export type MessageComposerOutput = {
  message_body: string          // Pesan WA yang dihasilkan (siap kirim)
  message_goal: MessageComposerInput['message_goal']
  personalization_notes?: string // Catatan kenapa pesan dibuat seperti itu
  requires_founder_approval: boolean
  alternative_versions?: string[] // 1-2 versi alternatif
}

// =============================================================================
// WA LOG (sovereign-main.wa_logs)
// =============================================================================

/** Record log pesan WhatsApp */
export type WALogRecord = {
  id: string
  direction: 'outbound' | 'inbound'
  lead_id?: string
  customer_id?: string
  phone: string                 // Nomor tujuan/pengirim
  message_body: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'rejected_by_founder'
  fonnte_message_id?: string    // ID dari Fonnte API
  ai_task_id?: string           // Jika pesan dihasilkan oleh agent
  sent_by: 'founder' | 'agent' | 'system'
  approved_by?: string          // Founder approval (untuk ai-generated messages)
  approved_at?: ISODateString
  sent_at?: ISODateString
  delivered_at?: ISODateString
  read_at?: ISODateString
  created_at: ISODateString
}

/** Payload untuk log pesan WA outbound */
export type CreateWAOutboundPayload = {
  lead_id?: string
  customer_id?: string
  phone: string
  message_body: string
  ai_task_id?: string
  sent_by: WALogRecord['sent_by']
}

// =============================================================================
// INSIGHT GENERATOR
// =============================================================================

/** Output dari InsightGenerator */
export type BusinessInsight = {
  id: string
  insight_type: 'weekly_review' | 'lead_trend' | 'revenue_alert' | 'agent_performance' | 'product_trend'
  title: string
  summary: string               // Ringkasan insight (max 100 kata)
  details?: string              // Detail lengkap
  data_snapshot?: JSONObject    // Data mentah yang jadi dasar insight
  action_items?: string[]       // Saran tindakan dari AI
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: ISODateString
}

// =============================================================================
// CREDIT LEDGER (sovereign-main.credit_ledger)
// Tracking penggunaan API credit (Groq, OpenAI, Fonnte, ScraperAPI)
// =============================================================================

/** Record credit usage */
export type CreditLedgerRecord = {
  id: string
  service: 'groq' | 'openai' | 'anthropic' | 'fonnte' | 'scraperapi' | 'supabase' | 'cloudflare'
  operation: string             // e.g. "scout_score", "message_compose", "wa_send"
  tokens_used?: number
  messages_sent?: number        // Untuk Fonnte
  api_calls?: number
  cost_usd?: number             // Estimasi cost USD
  cost_idr?: number             // Estimasi cost IDR (kurs realtime atau approx)
  ai_task_id?: string
  created_at: ISODateString
}
