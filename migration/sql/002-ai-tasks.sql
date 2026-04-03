-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 002-ai-tasks.sql
-- Tables: ai_tasks — AI agent task queue
-- Domain: 4 — AI Agent State
-- Status: PLANNED Sprint 1
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
--
-- ⚠️ ATURAN: Run setelah wa_logs sudah confirmed stable
-- ⚠️ HUMAN GATE: requires_approval field WAJIB ada untuk irreversible actions
-- ============================================================================

-- Create table ai_tasks
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Agent identity
  agent TEXT NOT NULL CHECK (agent IN (
    'scout_scorer', 'message_composer', 'insight_generator',
    'market_validator', 'closer_agent'
  )),

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'idle', 'queued', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval'
  )),

  -- Payload
  input JSONB NOT NULL,                    -- Input ke agent (serialized)
  output JSONB,                            -- Output agent (null = belum selesai)
  error_message TEXT,

  -- Performance metrics
  tokens_used INTEGER,
  model_used TEXT,                         -- e.g. 'groq/llama3-8b-8192'
  duration_ms INTEGER,

  -- Trigger context
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('founder', 'system', 'schedule', 'agent_chain')),

  -- ⚠️ HUMAN GATE — untuk action irreversible
  requires_approval BOOLEAN NOT NULL DEFAULT false,

  -- Relasi
  related_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_tasks_agent ON ai_tasks(agent);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_requires_approval ON ai_tasks(requires_approval) WHERE requires_approval = true;
CREATE INDEX IF NOT EXISTS idx_ai_tasks_lead ON ai_tasks(related_lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at ON ai_tasks(created_at DESC);

-- Row Level Security
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: hanya service role yang bisa akses
CREATE POLICY "service_role_full_access" ON ai_tasks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sekarang tambahkan FK dari wa_logs ke ai_tasks (setelah ai_tasks dibuat)
ALTER TABLE wa_logs
  ADD CONSTRAINT fk_wa_logs_ai_task
  FOREIGN KEY (ai_task_id) REFERENCES ai_tasks(id) ON DELETE SET NULL;

-- Komentar
COMMENT ON TABLE ai_tasks IS 'AI agent task queue — setiap eksekusi agent dicatat sebagai task';
COMMENT ON COLUMN ai_tasks.requires_approval IS '⚠️ HUMAN GATE: true = agent butuh persetujuan founder sebelum execute action irreversible';
COMMENT ON COLUMN ai_tasks.input IS 'Input payload JSON ke agent — serialized ScoutInput / MessageComposerInput / dll';
COMMENT ON COLUMN ai_tasks.output IS 'Output agent JSON — null jika belum selesai atau failed';
