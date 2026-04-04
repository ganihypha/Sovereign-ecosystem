-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 001-wa-logs.sql
-- Table: wa_logs — WA Automation audit trail
-- Domain: 3 — WA Automation
-- Sprint: Sprint 1
-- Status: PLANNED (NOT YET RUN IN PRODUCTION)
-- Author: Haidar Faras Maulia (via AI Dev — Session 3c)
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
-- Last Hardened: 2026-04-04 (Session 3c — Migration Hardening)
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST (FOUNDER MUST VERIFY BEFORE RUNNING):
--   [ ] Supabase dashboard open dan siap dimonitor
--   [ ] Backup/snapshot Supabase sudah dibuat
--   [ ] Tabel 'leads', 'customers', 'users' sudah LIVE (pre-requisite)
--   [ ] Tabel 'ai_tasks' BELUM dibuat (dibuat di 002-ai-tasks.sql)
--   [ ] Run di LOCAL/staging dulu sebelum production
--
-- 🔁 ROLLBACK (jika gagal setelah partial run):
--   DROP TABLE IF EXISTS wa_logs CASCADE;
--
-- ⚠️ HUMAN GATE: requires_approval field WAJIB ada
--    Agent-generated messages HARUS diapprove founder sebelum dikirim
--
-- 🔗 DEPENDENCY MAP:
--   001-wa-logs.sql  → requires: users, leads, customers (LIVE)
--   002-ai-tasks.sql → requires: wa_logs (FK ditambahkan di 002)
--   003-ai-insights.sql → requires: ai_tasks
--   004-order-items.sql → requires: orders, products (LIVE)
--   005-credit-ledger.sql → requires: ai_tasks
-- ============================================================================

-- ============================================================================
-- DRY RUN: uncomment baris berikut untuk cek dependencies sebelum run
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads');
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wa_logs');
-- ============================================================================

-- Create table wa_logs
CREATE TABLE IF NOT EXISTS wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relasi
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Pesan
  phone TEXT NOT NULL,                    -- +628xxx format WAJIB
  message_body TEXT NOT NULL,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'rejected_by_founder')),

  -- ⚠️ HUMAN GATE — Critical field: JANGAN hapus atau ubah default
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Fonnte integration (BLOCKED: FONNTE_TOKEN missing — lihat blocker-log.md)
  fonnte_message_id TEXT,                 -- ID dari Fonnte API response

  -- AI linkage (FK ditambahkan di 002-ai-tasks.sql setelah ai_tasks dibuat)
  ai_task_id UUID,

  -- Tracking
  sent_by TEXT NOT NULL CHECK (sent_by IN ('founder', 'agent', 'system')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES — untuk query umum (semua production-ready)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_wa_logs_lead_id
  ON wa_logs(lead_id);

CREATE INDEX IF NOT EXISTS idx_wa_logs_customer_id
  ON wa_logs(customer_id);

CREATE INDEX IF NOT EXISTS idx_wa_logs_status
  ON wa_logs(status);

-- Partial index — hanya baris yang perlu approval (smaller, faster)
CREATE INDEX IF NOT EXISTS idx_wa_logs_requires_approval
  ON wa_logs(requires_approval)
  WHERE requires_approval = true;

CREATE INDEX IF NOT EXISTS idx_wa_logs_created_at
  ON wa_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_logs_phone
  ON wa_logs(phone);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — MANDATORY untuk semua tabel Sovereign
-- ============================================================================
ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;

-- Policy: service role punya full access (backend only — Tower via service role key)
CREATE POLICY "service_role_full_access" ON wa_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: anon dan authenticated TIDAK bisa akses wa_logs
-- WA data adalah private — tidak ada public atau customer-facing read
-- (Customer layer policies akan ditambahkan saat Phase 4+ jika diperlukan)

-- ============================================================================
-- TABLE & COLUMN COMMENTS — untuk Supabase dashboard readability
-- ============================================================================
COMMENT ON TABLE wa_logs IS
  'WA Automation audit trail — semua pesan WA (inbound + outbound) dicatat di sini. Sprint 1 — Domain 3.';

COMMENT ON COLUMN wa_logs.requires_approval IS
  '⚠️ HUMAN GATE: true = harus founder approve sebelum dikirim. WAJIB true untuk semua agent-generated messages.';

COMMENT ON COLUMN wa_logs.fonnte_message_id IS
  'Message ID dari Fonnte API response — untuk tracking delivery status. NULL sampai FONNTE_TOKEN tersedia.';

COMMENT ON COLUMN wa_logs.ai_task_id IS
  'FK ke ai_tasks.id — ditambahkan via ALTER TABLE di 002-ai-tasks.sql setelah tabel ai_tasks dibuat.';

COMMENT ON COLUMN wa_logs.phone IS
  'Format: +628xxx — nomor internasional dengan kode negara. Wajib divalidasi di application layer.';

-- ============================================================================
-- POST-RUN VALIDATION QUERIES (run setelah migration):
--
-- SELECT table_name, column_name, data_type
--   FROM information_schema.columns
--   WHERE table_name = 'wa_logs'
--   ORDER BY ordinal_position;
--
-- SELECT indexname FROM pg_indexes WHERE tablename = 'wa_logs';
--
-- SELECT tablename, policyname FROM pg_policies WHERE tablename = 'wa_logs';
--
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'wa_logs'; -- must return true
-- ============================================================================
