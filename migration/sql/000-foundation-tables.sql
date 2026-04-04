-- ============================================================================
-- SOVEREIGN BUSINESS ENGINE v4.0
-- Migration: 000-foundation-tables.sql
-- Tables: users, leads, customers, products, orders
-- Domain: 1 (Identity) + 2 (Commerce Core)
-- Sprint: Foundation (Pre-Sprint 1)
-- Status: GREENFIELD — dibuat Session 3c Live Gate karena DB kosong
-- Author: AI Dev Executor — Session 3c Live Gate
-- Created: 2026-04-04
-- ============================================================================
--
-- 📋 PRE-RUN CHECKLIST:
--   [ ] DB kosong / greenfield (verified: yes, pre-migration check = empty)
--   [ ] Supabase REST API accessible (verified: yes, HTTP 200)
--   [ ] SUPABASE_ACCESS_KEY valid untuk management API (verified: yes)
--
-- 🔁 ROLLBACK:
--   DROP TABLE IF EXISTS orders CASCADE;
--   DROP TABLE IF EXISTS products CASCADE;
--   DROP TABLE IF EXISTS customers CASCADE;
--   DROP TABLE IF EXISTS leads CASCADE;
--   DROP TABLE IF EXISTS users CASCADE;
--   DROP TYPE IF EXISTS user_role CASCADE;
--   DROP TYPE IF EXISTS customer_tier CASCADE;
--   DROP TYPE IF EXISTS lead_status CASCADE;
--   DROP TYPE IF EXISTS lead_source CASCADE;
--   DROP TYPE IF EXISTS order_status CASCADE;
--   DROP TYPE IF EXISTS payment_method CASCADE;
--   DROP TYPE IF EXISTS payment_status CASCADE;
--   DROP TYPE IF EXISTS product_category CASCADE;
--   DROP TYPE IF EXISTS product_status CASCADE;
--
-- ⚠️ CATATAN: Tabel users, leads, customers, products, orders adalah prerequisite
--    untuk migration 001-wa-logs, 002-ai-tasks, 004-order-items.
--    Harus dijalankan PERTAMA sebelum migration 001-005.
-- ============================================================================

-- ============================================================================
-- DOMAIN 1 — IDENTITY: users
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'founder'
    CHECK (role IN ('founder', 'reseller', 'customer', 'agent', 'admin')),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE users IS 'Domain 1 — Identity. Semua user Sovereign ecosystem (founder, reseller, customer, agent). Foundation table.';

-- ============================================================================
-- DOMAIN 2 — COMMERCE CORE: leads
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instagram_handle TEXT,
  phone TEXT,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('instagram', 'whatsapp', 'fashionkas', 'resellerkas', 'referral', 'manual', 'tiktok', 'marketplace')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'interested', 'qualified', 'converted', 'lost', 'nurturing')),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_score_reasoning TEXT,
  tags TEXT[],
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON leads(ai_score DESC) WHERE ai_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE leads IS 'Domain 2 — Commerce Core. Prospek yang belum menjadi customer. Digunakan oleh ScoutScorer agent.';

-- ============================================================================
-- DOMAIN 2 — COMMERCE CORE: customers
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  instagram_handle TEXT,
  tier TEXT NOT NULL DEFAULT 'bronze'
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,  -- Rupiah INTEGER
  is_reseller BOOLEAN NOT NULL DEFAULT false,
  reseller_code TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_is_reseller ON customers(is_reseller) WHERE is_reseller = true;
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers(lead_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE customers IS 'Domain 2 — Commerce Core. Customer aktif. total_revenue dalam Rupiah INTEGER.';

-- ============================================================================
-- DOMAIN 2 — COMMERCE CORE: products
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'fashion'
    CHECK (category IN ('fashion', 'accessories', 'beauty', 'home', 'food', 'digital', 'other')),
  price INTEGER NOT NULL CHECK (price >= 0),             -- Rupiah INTEGER
  reseller_price INTEGER CHECK (reseller_price >= 0),    -- Rupiah INTEGER
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'out_of_stock')),
  weight_gram INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE products IS 'Domain 2 — Commerce Core. Katalog produk Sovereign. price dan reseller_price dalam Rupiah INTEGER.';

-- ============================================================================
-- DOMAIN 2 — COMMERCE CORE: orders
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL DEFAULT
    ('ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6))),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),       -- Rupiah INTEGER
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_cost INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL DEFAULT 'transfer'
    CHECK (payment_method IN ('transfer', 'cod', 'qris', 'credit_card', 'ewallet', 'other')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  shipping_address TEXT,
  tracking_number TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'tower_manual'
    CHECK (source IN ('fashionkas', 'resellerkas', 'tower_manual', 'whatsapp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE orders IS 'Domain 2 — Commerce Core. Order dari semua channel (fashionkas, resellerkas, tower, whatsapp). Semua nilai Rupiah INTEGER.';

-- ============================================================================
-- POST-RUN VALIDATION:
--
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   ORDER BY table_name;
--
-- Expected tables after 000: users, leads, customers, products, orders
-- ============================================================================
