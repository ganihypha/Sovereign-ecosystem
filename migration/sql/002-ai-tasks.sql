-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 002-ai-tasks.sql
-- Table: ai_tasks — AI agent task queue
-- Domain: 4 — AI Agent State
-- Sprint: Sprint 1
-- Status: PLANNED (NOT YET RUN IN PRODUCTION)
-- Author: Haidar Faras Maulia (via AI Dev — Session 3c)
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
-- Last Hardened: 2026-04-04 (Session 3c — Migration Hardening)
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST:
--   [ ] 001-wa-logs.sql sudah berhasil dirun SEBELUM ini
--   [ ] Tabel 'leads' dan 'orders' sudah LIVE (pre-requisite untuk FK)
--   [ ] Tidak ada tabel ai_tasks yang sudah ada
--
-- 🔁 ROLLBACK (jika gagal):
--   -- Step 1: Hapus FK yang ditambahkan ke wa_logs dulu
--   ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS fk_wa_logs_ai_task;
--   -- Step 2: Hapus tabel
--   DROP TABLE IF EXISTS ai_tasks CASCADE;
--
-- ⚠️ HUMAN GATE: requires_approval = true untuk semua irreversible agent actions
-- ============================================================================

-- ============================================================================
-- DRY RUN: cek dependencies
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wa_logs');
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads');
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders');
-- ============================================================================

-- Create table ai_tasks
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Agent identity — harus sesuai dengan AgentType di @sovereign/types
  agent TEXT NOT NULL CHECK (agent IN (
    'scout_scorer', 'message_composer', 'insight_generator',
    'market_validator', 'closer_agent'
  )),

  -- Status lifecycle — sesuai AgentStatus di @sovereign/types
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'idle', 'queued', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval'
  )),

  -- Payload (JSONB untuk flexibility + indexing)
  input JSONB NOT NULL,                    -- Input ke agent (serialized)
  output JSONB,                            -- Output agent (null = belum selesai)
  error_message TEXT,

  -- Performance metrics — untuk credit_ledger linkage
  tokens_used INTEGER,
  model_used TEXT,                         -- e.g. 'groq/llama3-8b-8192'
  duration_ms INTEGER,

  -- Trigger context
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('founder', 'system', 'schedule', 'agent_chain')),

  -- ⚠️ HUMAN GATE — untuk action irreversible (e.g., wa_blast, order_create)
  requires_approval BOOLEAN NOT NULL DEFAULT false,

  -- Relasi ke domain lain
  related_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_tasks_agent
  ON ai_tasks(agent);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_status
  ON ai_tasks(status);

-- Partial index — hanya tasks yang perlu approval
CREATE INDEX IF NOT EXISTS idx_ai_tasks_requires_approval
  ON ai_tasks(requires_approval)
  WHERE requires_approval = true;

CREATE INDEX IF NOT EXISTS idx_ai_tasks_lead
  ON ai_tasks(related_lead_id);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_order
  ON ai_tasks(related_order_id);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_created_at
  ON ai_tasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_triggered_by
  ON ai_tasks(triggered_by);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: hanya service role yang bisa akses (Tower backend)
CREATE POLICY "service_role_full_access" ON ai_tasks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- ADD FK FROM wa_logs → ai_tasks
-- (wa_logs dibuat dulu di 001, FK ditambahkan di sini setelah ai_tasks ada)
-- ============================================================================
ALTER TABLE wa_logs
  ADD CONSTRAINT fk_wa_logs_ai_task
  FOREIGN KEY (ai_task_id) REFERENCES ai_tasks(id) ON DELETE SET NULL;

-- ============================================================================
-- TABLE & COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE ai_tasks IS
  'AI agent task queue — setiap eksekusi agent dicatat sebagai task. Sprint 1 — Domain 4.';

COMMENT ON COLUMN ai_tasks.requires_approval IS
  '⚠️ HUMAN GATE: true = agent butuh persetujuan founder sebelum execute irreversible action.';

COMMENT ON COLUMN ai_tasks.input IS
  'Input payload JSON ke agent — serialized sesuai kontrak: ScoutInput, MessageComposerInput, dll.';

COMMENT ON COLUMN ai_tasks.output IS
  'Output agent JSON — null jika belum selesai atau failed.';

COMMENT ON COLUMN ai_tasks.tokens_used IS
  'Total tokens used by LLM — untuk credit_ledger tracking. Diupdate saat completed.';

COMMENT ON COLUMN ai_tasks.model_used IS
  'LLM model yang digunakan — e.g. groq/llama3-8b-8192, openai/gpt-4o-mini.';

-- ============================================================================
-- POST-RUN VALIDATION:
--
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('ai_tasks','wa_logs');
-- SELECT constraint_name FROM information_schema.table_constraints
--   WHERE table_name = 'wa_logs' AND constraint_type = 'FOREIGN KEY';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'ai_tasks';
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'ai_tasks'; -- must return true
-- ============================================================================
