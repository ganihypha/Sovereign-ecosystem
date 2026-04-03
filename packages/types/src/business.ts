// @sovereign/types — business.ts
// Business domain types: Lead, Customer, Order, Product, User
// Ini adalah kontrak data inti seluruh ecosystem
// Dipakai oleh: @sovereign/db, @sovereign/analytics, semua apps

import type {
  LeadStatus,
  LeadSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  ProductStatus,
  CustomerTier,
  UserRole,
  ISODateString,
} from './common'

// =============================================================================
// USER / AUTH
// =============================================================================

/** Record user di canonical DB (sovereign-main.users) */
export type UserRecord = {
  id: string
  email: string
  name: string
  role: UserRole
  tier?: CustomerTier        // Hanya untuk role: customer
  is_active: boolean
  created_at: ISODateString
  updated_at: ISODateString
}

/** Payload untuk create user */
export type CreateUserPayload = {
  email: string
  name: string
  role: UserRole
  tier?: CustomerTier
}

// =============================================================================
// LEAD (Fashionkas + Scout Agent → sovereign-main.leads)
// =============================================================================

/** Record lead di canonical DB */
export type LeadRecord = {
  id: string
  name: string
  instagram_handle?: string    // @username Instagram
  phone?: string               // Format: +628xxx
  email?: string
  source: LeadSource
  status: LeadStatus
  ai_score?: number            // 0-100 dari ScoutScorer (null = belum di-score)
  ai_score_reasoning?: string  // Penjelasan AI score
  tags?: string[]              // Label manual/AI
  notes?: string               // Catatan founder
  last_contacted_at?: ISODateString
  converted_at?: ISODateString
  created_at: ISODateString
  updated_at: ISODateString
}

/** Payload untuk create lead */
export type CreateLeadPayload = {
  name: string
  instagram_handle?: string
  phone?: string
  email?: string
  source: LeadSource
  tags?: string[]
  notes?: string
}

/** Payload untuk update lead */
export type UpdateLeadPayload = Partial<Omit<LeadRecord, 'id' | 'created_at' | 'updated_at'>>

// =============================================================================
// CUSTOMER (Fashionkas + Resellerkas → sovereign-main.customers)
// =============================================================================

/** Record customer di canonical DB */
export type CustomerRecord = {
  id: string
  user_id?: string             // Link ke users table (jika punya account)
  lead_id?: string             // Dari lead mana customer ini berasal
  name: string
  phone: string                // Format: +628xxx (wajib)
  email?: string
  instagram_handle?: string
  tier: CustomerTier
  total_orders: number
  total_revenue: number        // Dalam Rupiah (integer, no float)
  is_reseller: boolean         // True jika reseller di Resellerkas
  reseller_code?: string       // Kode unik reseller
  notes?: string
  created_at: ISODateString
  updated_at: ISODateString
}

/** Payload untuk create customer */
export type CreateCustomerPayload = {
  name: string
  phone: string
  email?: string
  instagram_handle?: string
  tier?: CustomerTier
  lead_id?: string
  is_reseller?: boolean
  reseller_code?: string
}

// =============================================================================
// PRODUCT (Fashionkas + Resellerkas → sovereign-main.products)
// =============================================================================

/** Record produk */
export type ProductRecord = {
  id: string
  name: string
  sku: string                  // Stock Keeping Unit
  description?: string
  category: ProductCategory
  price: number                // Harga normal (Rupiah, integer)
  reseller_price?: number      // Harga khusus reseller
  stock: number
  images?: string[]            // Array URL gambar
  status: ProductStatus
  weight_gram?: number         // Berat dalam gram (untuk ongkir)
  created_at: ISODateString
  updated_at: ISODateString
}

/** Payload untuk create product */
export type CreateProductPayload = {
  name: string
  sku: string
  category: ProductCategory
  price: number
  reseller_price?: number
  stock: number
  description?: string
  images?: string[]
  weight_gram?: number
}

// =============================================================================
// ORDER (Resellerkas + Fashionkas → sovereign-main.orders)
// =============================================================================

/** Satu item dalam order */
export type OrderItem = {
  product_id: string
  product_name: string       // Snapshot nama saat order (immutable)
  sku: string
  quantity: number
  unit_price: number         // Harga saat order (snapshot)
  subtotal: number           // quantity * unit_price
}

/** Record order */
export type OrderRecord = {
  id: string
  order_number: string         // Format: ORD-YYYYMMDD-XXXX
  customer_id: string
  customer_name: string        // Snapshot
  customer_phone: string       // Snapshot
  items: OrderItem[]
  subtotal: number
  discount?: number
  shipping_cost: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  shipping_address?: string
  tracking_number?: string
  notes?: string
  source: 'fashionkas' | 'resellerkas' | 'tower_manual' | 'whatsapp'
  created_at: ISODateString
  updated_at: ISODateString
}

/** Payload untuk create order */
export type CreateOrderPayload = {
  customer_id: string
  items: Array<{
    product_id: string
    quantity: number
  }>
  payment_method: PaymentMethod
  shipping_address?: string
  discount?: number
  shipping_cost?: number
  source: OrderRecord['source']
  notes?: string
}

// =============================================================================
// PROOF / EVIDENCE (Tower → sovereign-main.proofs)
// =============================================================================

/** Record proof/evidence bisnis (screenshot, KPI, revenue) */
export type ProofRecord = {
  id: string
  title: string
  description?: string
  proof_type: 'screenshot' | 'revenue' | 'testimonial' | 'kpi' | 'wa_response' | 'other'
  value?: string               // Nilai KPI (e.g. "Rp 5.000.000")
  image_url?: string
  source_app: 'fashionkas' | 'resellerkas' | 'tower' | 'external'
  sprint?: string              // Sprint label (e.g. "Sprint 1")
  created_at: ISODateString
}

// =============================================================================
// SPRINT LOG (Tower)
// =============================================================================

/** Entry sprint log harian */
export type SprintLogEntry = {
  id: string
  sprint: string               // "Sprint 1", "Sprint 2", etc
  date: ISODateString
  tasks_completed: string[]
  blockers?: string[]
  decisions?: string[]
  next_actions?: string[]
  created_at: ISODateString
}

// =============================================================================
// DECISION LOG / ADR (Tower)
// =============================================================================

/** Architecture Decision Record */
export type AdrRecord = {
  id: string
  adr_number: string           // "ADR-001", "ADR-002"
  title: string
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded' | 'deprecated'
  context: string
  decision: string
  consequences: string
  alternatives_considered?: string[]
  created_at: ISODateString
  updated_at: ISODateString
}
