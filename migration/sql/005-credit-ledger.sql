-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 005-credit-ledger.sql
-- Table: credit_ledger — AI & API credit usage tracking
-- Domain: 6 — Agent Operations
-- Sprint: Sprint 1 (partial — full Phase 4+)
-- Status: PLANNED (NOT YET RUN IN PRODUCTION)
-- Author: Haidar Faras Maulia (via AI Dev — Session 3c)
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md + packages/db/src/schema.ts
-- Created: 2026-04-04 (Session 3c — Gap Fill)
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST:
--   [ ] 002-ai-tasks.sql sudah berhasil dirun (ai_tasks exists untuk FK)
--   [ ] Tidak ada tabel credit_ledger yang sudah ada
--
-- 🔁 ROLLBACK (jika gagal):
--   DROP TABLE IF EXISTS credit_ledger CASCADE;
--
-- 🎯 TUJUAN TABEL INI:
--   Melacak semua penggunaan kredit API (LLM tokens, WA messages, API calls)
--   untuk cost monitoring dan budget control.
--   Linked ke ai_tasks untuk traceability per agent run.
--
-- ⚠️ SCOPE NOTE (Session 3c):
--   Tabel ini dibuat untuk Sprint 1 infrastructure — belum diisi data
--   sampai Agent Orchestration (Phase 6) aktif. Tapi schema harus ada
--   agar ai-resource-manager module bisa query cost data.
-- ============================================================================

-- ============================================================================
-- DRY RUN: cek dependency
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tasks');
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Service yang dikonsumsi — sesuai CreditLedgerTable di @sovereign/db schema.ts
  service TEXT NOT NULL CHECK (service IN (
    'groq', 'openai', 'anthropic', 'fonnte', 'scraperapi', 'supabase', 'cloudflare'
  )),

  -- Operasi spesifik — deskripsi bebas
  -- e.g. "scout_score", "wa_send", "wa_broadcast", "insight_generate"
  operation TEXT NOT NULL,

  -- Usage metrics — semua nullable (tidak semua service pakai semua metric)
  tokens_used INTEGER,                 -- LLM token usage
  messages_sent INTEGER,               -- Untuk Fonnte (WA messages)
  api_calls INTEGER,                   -- Generic API call counter

  -- Cost estimation
  cost_usd NUMERIC(10, 6),             -- Estimasi cost USD (untuk pembanding)
  cost_idr INTEGER,                    -- Estimasi cost IDR — INTEGER (approx, untuk budget)

  -- Linkage ke agent task yang trigger usage ini
  ai_task_id UUID REFERENCES ai_tasks(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_credit_ledger_service
  ON credit_ledger(service);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_operation
  ON credit_ledger(operation);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at
  ON credit_ledger(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_ai_task
  ON credit_ledger(ai_task_id);

-- Index untuk aggregation queries (total cost per period)
CREATE INDEX IF NOT EXISTS idx_credit_ledger_service_date
  ON credit_ledger(service, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: hanya service role yang bisa akses (Tower backend)
CREATE POLICY "service_role_full_access" ON credit_ledger
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- TABLE & COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE credit_ledger IS
  'AI & API credit usage tracking — setiap penggunaan API (LLM tokens, WA messages, dll) dicatat untuk cost monitoring. Sprint 1 — Domain 6.';

COMMENT ON COLUMN credit_ledger.service IS
  'Service provider yang dikonsumsi: groq (LLM), openai (LLM), fonnte (WA), scraperapi (scraping), dll.';

COMMENT ON COLUMN credit_ledger.operation IS
  'Operasi spesifik, e.g. "scout_score", "wa_send", "wa_broadcast", "insight_generate", "lead_scrape".';

COMMENT ON COLUMN credit_ledger.cost_usd IS
  'Estimasi cost USD 6 decimal places — untuk pembanding dan reporting. Bukan angka billing resmi.';

COMMENT ON COLUMN credit_ledger.cost_idr IS
  'Estimasi cost IDR INTEGER — untuk budget monitoring dalam Rupiah. Approx conversion.';

COMMENT ON COLUMN credit_ledger.tokens_used IS
  'LLM token usage — NULL untuk non-LLM services (Fonnte, ScraperAPI, dll).';

COMMENT ON COLUMN credit_ledger.messages_sent IS
  'WA messages sent — NULL untuk non-Fonnte services.';

-- ============================================================================
-- POST-RUN VALIDATION:
--
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
--   WHERE table_name = 'credit_ledger' ORDER BY ordinal_position;
-- SELECT indexname FROM pg_indexes WHERE tablename = 'credit_ledger';
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'credit_ledger'; -- must return true
--
-- Verifikasi semua 5 tabel Sprint 1 sudah dibuat:
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name IN ('wa_logs','ai_tasks','ai_insights','order_items','credit_ledger')
--   ORDER BY table_name;
-- -- Expected: 5 rows
-- ============================================================================
