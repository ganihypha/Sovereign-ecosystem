-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 003-ai-insights.sql
-- Table: ai_insights — AI insights storage
-- Domain: 4 — AI Agent State
-- Status: PLANNED Sprint 1
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
--
-- ⚠️ Run setelah 002-ai-tasks.sql berhasil
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Sumber insight
  agent TEXT NOT NULL CHECK (agent IN (
    'scout_scorer', 'message_composer', 'insight_generator',
    'market_validator', 'closer_agent'
  )),

  -- Kategori insight
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'weekly_review', 'lead_trend', 'revenue_alert', 'agent_performance', 'product_trend'
  )),

  -- Konten
  title TEXT NOT NULL,
  summary TEXT NOT NULL,               -- max ~100 kata
  details TEXT,                        -- detail lengkap opsional
  data_snapshot JSONB,                 -- data mentah yang jadi dasar insight

  -- Action items
  action_items JSONB,                  -- array of string suggestions

  -- Prioritas
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Linkage ke task yang menghasilkan insight ini
  ai_task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON ai_insights
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE ai_insights IS 'AI-generated business insights — output dari InsightGenerator dan agent lain';
COMMENT ON COLUMN ai_insights.data_snapshot IS 'Snapshot data yang jadi dasar insight — untuk audit trail';
