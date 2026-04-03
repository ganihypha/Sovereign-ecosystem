-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 004-order-items.sql
-- Table: order_items — Order line items
-- Domain: 2 — Commerce Core
-- Status: PLANNED Sprint 1
-- Source: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
--
-- ⚠️ Run setelah orders table sudah confirmed ada
-- Ini adalah extension dari existing orders table
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- FK ke orders
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- FK ke products (dengan snapshot untuk immutability)
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,          -- Snapshot nama saat order dibuat
  sku TEXT NOT NULL,                   -- Snapshot SKU saat order dibuat

  -- Quantity dan harga (semua Rupiah INTEGER)
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),  -- Rupiah INTEGER snapshot
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),       -- quantity * unit_price

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy service role
CREATE POLICY "service_role_full_access" ON order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: customer bisa lihat order_items miliknya sendiri (lewat join ke orders)
-- Akan diimplementasikan saat Customer Workspace dibuat (Phase 4+)

COMMENT ON TABLE order_items IS 'Order line items — detail produk per order. Harga di-snapshot saat order untuk immutability';
COMMENT ON COLUMN order_items.unit_price IS 'Harga satuan saat order dibuat — SNAPSHOT, tidak berubah walaupun harga produk berubah kemudian';
COMMENT ON COLUMN order_items.subtotal IS 'quantity * unit_price — Rupiah INTEGER, computed saat insert';
