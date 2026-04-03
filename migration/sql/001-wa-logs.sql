-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 001-wa-logs.sql
-- Table: wa_logs — WA Automation audit trail
-- Domain: 3 — WA Automation
-- Status: PLANNED Sprint 1
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
--
-- ⚠️ ATURAN SEBELUM JALANKAN:
--   1. JANGAN run di production tanpa backup dulu
--   2. Run di Supabase local dev dulu (supabase db push --local)
--   3. Test dengan wrangler d1 execute setelah schema confirmed
--   4. Baru production setelah staging stable
--
-- ⚠️ HUMAN GATE: requires_approval field WAJIB ada
--    Agent-generated messages HARUS diapprove founder sebelum dikirim
-- ============================================================================

-- Create table wa_logs
CREATE TABLE IF NOT EXISTS wa_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relasi
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Pesan
  phone TEXT NOT NULL,                    -- +628xxx
  message_body TEXT NOT NULL,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'rejected_by_founder')),

  -- ⚠️ HUMAN GATE — Critical field
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Fonnte integration
  fonnte_message_id TEXT,                 -- ID dari Fonnte API response

  -- AI linkage
  ai_task_id UUID,                        -- FK ke ai_tasks.id (dibuat setelah ai_tasks table ada)

  -- Tracking
  sent_by TEXT NOT NULL CHECK (sent_by IN ('founder', 'agent', 'system')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query umum
CREATE INDEX IF NOT EXISTS idx_wa_logs_lead_id ON wa_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_customer_id ON wa_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_wa_logs_status ON wa_logs(status);
CREATE INDEX IF NOT EXISTS idx_wa_logs_requires_approval ON wa_logs(requires_approval) WHERE requires_approval = true;
CREATE INDEX IF NOT EXISTS idx_wa_logs_created_at ON wa_logs(created_at DESC);

-- Row Level Security
ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;

-- Policy: service role punya full access (backend only)
CREATE POLICY "service_role_full_access" ON wa_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: anon/authenticated TIDAK bisa akses wa_logs (private data)
-- Public tidak boleh baca/tulis wa_logs

-- Komentar tabel
COMMENT ON TABLE wa_logs IS 'WA Automation audit trail — semua pesan WA (inbound + outbound) dicatat di sini';
COMMENT ON COLUMN wa_logs.requires_approval IS '⚠️ HUMAN GATE: true = harus founder approve sebelum dikirim. WAJIB true untuk semua agent-generated messages';
COMMENT ON COLUMN wa_logs.fonnte_message_id IS 'Message ID dari Fonnte API response — untuk tracking delivery status';
