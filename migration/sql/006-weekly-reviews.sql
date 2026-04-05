-- ============================================================
-- MIGRATION: 006-weekly-reviews.sql
-- Sovereign Business Engine v4.0 — Sprint 2
-- Session 3e: Buat weekly_reviews table untuk founder-review persistence
-- ============================================================
-- Pre-condition: foundation tables dari 000-foundation-tables.sql sudah ada
-- Safe to run: IF NOT EXISTS di semua CREATE statements
-- Rollback: DROP TABLE IF EXISTS weekly_reviews;

-- ============================================================
-- TABLE: weekly_reviews
-- Founder weekly reflection entries (5-question format)
-- ============================================================

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id BIGSERIAL PRIMARY KEY,
  week_label TEXT NOT NULL,            -- e.g. "2026-W14" (ISO week format)
  revenue_progress TEXT NOT NULL,      -- Q1: Revenue progress vs target
  build_progress TEXT NOT NULL,        -- Q2: Build progress, sessions, blockers
  arch_decisions TEXT NOT NULL,        -- Q3: Architecture decisions this week
  lessons_learned TEXT NOT NULL,       -- Q4: Lessons / mistakes to avoid
  next_priorities TEXT NOT NULL,       -- Q5: Top 3 priorities next week
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),  -- 1-5 optional
  notes TEXT,                          -- Free-form additional notes
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Unique constraint: satu review per week_label (idempotent insert friendly)
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reviews_week_label
  ON weekly_reviews (week_label);

-- Index untuk ordering by created_at
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_created_at
  ON weekly_reviews (created_at DESC);

-- ============================================================
-- RLS: Row Level Security
-- Hanya service_role yang bisa akses (founder-only tower access)
-- ============================================================

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Service role full access policy
DROP POLICY IF EXISTS service_role_full_access ON weekly_reviews;
CREATE POLICY service_role_full_access ON weekly_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VALIDATION QUERY (jalankan setelah migration untuk verify)
-- ============================================================
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'weekly_reviews'
-- ORDER BY ordinal_position;

-- ============================================================
-- ROLLBACK SQL (simpan untuk emergency)
-- DROP INDEX IF EXISTS idx_weekly_reviews_week_label;
-- DROP INDEX IF EXISTS idx_weekly_reviews_created_at;
-- DROP TABLE IF EXISTS weekly_reviews;
-- ============================================================

-- POST-MIGRATION NOTES:
-- 1. Apply to Supabase production:
--    Paste SQL di Supabase Dashboard > SQL Editor > Run
--    ATAU: npx wrangler d1 execute DB --file=migration/sql/006-weekly-reviews.sql
-- 2. Verify: SELECT COUNT(*) FROM weekly_reviews;
-- 3. After apply: founder-review GET akan return status 'db-wired-empty' (table ada, kosong)
-- 4. Submit review via: POST /api/modules/founder-review (with JWT)
