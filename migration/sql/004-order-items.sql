-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 004-order-items.sql
-- Table: order_items — Order line items
-- Domain: 2 — Commerce Core
-- Sprint: Sprint 1
-- Status: PLANNED (NOT YET RUN IN PRODUCTION)
-- Author: Haidar Faras Maulia (via AI Dev — Session 3c)
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
-- Last Hardened: 2026-04-04 (Session 3c — Migration Hardening)
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST:
--   [ ] Tabel 'orders' sudah LIVE di Supabase (pre-requisite FK)
--   [ ] Tabel 'products' sudah LIVE di Supabase (pre-requisite FK)
--   [ ] Existing orders data sudah dibackup sebelum extend schema
--   [ ] Tidak ada tabel order_items yang sudah ada
--   [ ] Catatan: 001, 002, 003 TIDAK harus dirun dulu — ini independent
--
-- 🔁 ROLLBACK (jika gagal):
--   DROP TABLE IF EXISTS order_items CASCADE;
--   -- Catatan: CASCADE akan hapus semua FK dan index terkait
--
-- ⚠️ IMPORTANT: subtotal HARUS = quantity * unit_price
--    Validasi di application layer sebelum insert!
--    Tidak ada trigger di DB untuk menghitung ini (keep it simple).
-- ============================================================================

-- ============================================================================
-- DRY RUN: cek dependencies
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders');
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products');
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- FK ke orders (CASCADE: hapus order_items jika ordernya dihapus)
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- FK ke products (RESTRICT: tidak bisa hapus product kalau masih ada di order_items)
  -- Snapshot: product_name dan sku di-snapshot saat order dibuat untuk immutability
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,          -- Snapshot nama saat order dibuat — IMMUTABLE setelah insert
  sku TEXT NOT NULL,                   -- Snapshot SKU saat order dibuat — IMMUTABLE setelah insert

  -- Quantity dan harga (semua Rupiah INTEGER — NO float/decimal)
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),  -- Rupiah INTEGER snapshot harga saat order
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),       -- HARUS = quantity * unit_price

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Catatan: tidak ada updated_at — order_items immutable setelah insert
  -- Untuk perubahan quantity/harga: hapus dan buat ulang order_items (atau buat order baru)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy service role: full access (Tower backend)
CREATE POLICY "service_role_full_access" ON order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy customer (PLACEHOLDER — akan diimplementasikan saat Customer Workspace Phase 4+):
-- Customer hanya bisa lihat order_items miliknya sendiri (lewat join ke orders → customer_id)
-- CREATE POLICY "customer_read_own" ON order_items
--   FOR SELECT TO authenticated
--   USING (
--     order_id IN (
--       SELECT id FROM orders WHERE customer_id = auth.uid()
--     )
--   );

-- ============================================================================
-- TABLE & COLUMN COMMENTS
-- ============================================================================
COMMENT ON TABLE order_items IS
  'Order line items — detail produk per order. Harga di-snapshot saat order untuk immutability. Sprint 1 — Domain 2.';

COMMENT ON COLUMN order_items.unit_price IS
  'Harga satuan saat order dibuat — SNAPSHOT, tidak berubah walaupun harga produk berubah kemudian.';

COMMENT ON COLUMN order_items.subtotal IS
  'quantity * unit_price — Rupiah INTEGER, computed di application layer sebelum insert.';

COMMENT ON COLUMN order_items.product_name IS
  'Snapshot nama produk saat order dibuat — IMMUTABLE. Jaga historical data integrity.';

COMMENT ON COLUMN order_items.sku IS
  'Snapshot SKU saat order dibuat — IMMUTABLE. Jaga historical data integrity.';

-- ============================================================================
-- POST-RUN VALIDATION:
--
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
--   WHERE table_name = 'order_items' ORDER BY ordinal_position;
-- SELECT indexname FROM pg_indexes WHERE tablename = 'order_items';
-- SELECT constraint_name, constraint_type FROM information_schema.table_constraints
--   WHERE table_name = 'order_items';
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items'; -- must return true
-- ============================================================================
