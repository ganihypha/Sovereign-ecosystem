-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 003-ai-insights.sql
-- Table: ai_insights — AI insights storage
-- Domain: 4 — AI Agent State
-- Sprint: Sprint 1
-- Status: PLANNED (NOT YET RUN IN PRODUCTION)
-- Author: Haidar Faras Maulia (via AI Dev — Session 3c)
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
-- Last Hardened: 2026-04-04 (Session 3c — Migration Hardening)
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST:
--   [ ] 001-wa-logs.sql sudah berhasil dirun
--   [ ] 002-ai-tasks.sql sudah berhasil dirun (ai_tasks table exists)
--   [ ] FK ke ai_tasks sudah siap
--
-- 🔁 ROLLBACK (jika gagal):
--   DROP TABLE IF EXISTS ai_insights CASCADE;
--
-- ============================================================================

-- ============================================================================
-- DRY RUN: cek dependency
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tasks');
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Sumber insight — sesuai AgentType di @sovereign/types
  agent TEXT NOT NULL CHECK (agent IN (
    'scout_scorer', 'message_composer', 'insight_generator',
    'market_validator', 'closer_agent'
  )),

  -- Kategori insight — sesuai AIInsightsTable di @sovereign/db schema.ts
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'weekly_review', 'lead_trend', 'revenue_alert', 'agent_performance', 'product_trend'
  )),

  -- Konten
  title TEXT NOT NULL,
  summary TEXT NOT NULL,               -- max ~100 kata, ditampilkan di dashboard
  details TEXT,                        -- detail lengkap opsional (bisa panjang)
  data_snapshot JSONB,                 -- data mentah yang jadi dasar insight (audit trail)

  -- Action items — array of string suggestions
  action_items JSONB,                  -- e.g. ["Follow up lead X", "Review revenue Y"]

  -- Prioritas tampilan di dashboard
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Linkage ke task yang menghasilkan insight ini
  ai_task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_insights_type
  ON ai_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_ai_insights_priority
  ON ai_insights(priority);

CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at
  ON ai_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_agent
  ON ai_insights(agent);

-- Partial index untuk insights high/critical priority
CREATE INDEX IF NOT EXISTS idx_ai_insights_high_priority
  ON ai_insights(priority, created_at DESC)
  WHERE priority IN ('high', 'critical');

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON ai_insights
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- TABLE & COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE ai_insights IS
  'AI-generated business insights — output dari InsightGenerator dan agent lain. Sprint 1 — Domain 4.';

COMMENT ON COLUMN ai_insights.data_snapshot IS
  'Snapshot data yang jadi dasar insight — WAJIB ada untuk audit trail. Jangan hapus.';

COMMENT ON COLUMN ai_insights.action_items IS
  'Array of suggested actions — ditampilkan di Dashboard Today sebagai quick actions.';

COMMENT ON COLUMN ai_insights.priority IS
  'critical = tampilkan notifikasi di dashboard. high = highlighted. medium/low = normal list.';

-- ============================================================================
-- POST-RUN VALIDATION:
--
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'ai_insights' ORDER BY ordinal_position;
-- SELECT indexname FROM pg_indexes WHERE tablename = 'ai_insights';
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'ai_insights'; -- must return true
-- ============================================================================
