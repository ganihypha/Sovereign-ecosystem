// @sovereign/db — schema.ts
// Canonical Table Definitions — Sovereign Bridge (sovereign-main Supabase)
// Source of Truth: docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
//
// ATURAN PENTING:
// 1. File ini MENDEFINISIKAN shape setiap tabel di DB (bukan ORM)
// 2. Field snake_case sesuai PostgreSQL/Supabase convention
// 3. Semua nilai Rupiah WAJIB integer (NO float/decimal)
// 4. Semua timestamp pakai ISO string dari Supabase
// 5. File ini TIDAK boleh import @supabase/supabase-js langsung
//    (hanya type definitions — client ada di client.ts)

import type {
  UserRole,
  CustomerTier,
  LeadStatus,
  LeadSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  ProductStatus,
  AgentType,
  AgentStatus,
  ISODateString,
  JSONObject,
} from '../../types/src/index'

// =============================================================================
// DOMAIN 1 — IDENTITY & ACCESS
// Table: users
// Status: ✅ LIVE (sovereign-main)
// =============================================================================

export type UsersTable = {
  Row: {
    id: string                    // UUID — auth.users FK atau custom
    email: string
    name: string
    role: UserRole
    tier: CustomerTier | null
    is_active: boolean
    metadata: JSONObject | null   // Data tambahan per role
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    email: string
    name: string
    role?: UserRole
    tier?: CustomerTier | null
    is_active?: boolean
    metadata?: JSONObject | null
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    id?: string
    email?: string
    name?: string
    role?: UserRole
    tier?: CustomerTier | null
    is_active?: boolean
    metadata?: JSONObject | null
    updated_at?: ISODateString
  }
}

// =============================================================================
// DOMAIN 2 — COMMERCE CORE
// Tables: leads, customers, products, orders, order_items
// Status: leads/customers/products/orders → ✅ LIVE; order_items → 🔴 PLANNED Sprint 1
// =============================================================================

/** Table: leads */
export type LeadsTable = {
  Row: {
    id: string
    name: string
    instagram_handle: string | null
    phone: string | null
    email: string | null
    source: LeadSource
    status: LeadStatus
    ai_score: number | null           // 0-100, null = belum di-score
    ai_score_reasoning: string | null
    tags: string[] | null             // JSON array
    notes: string | null
    last_contacted_at: ISODateString | null
    converted_at: ISODateString | null
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    name: string
    instagram_handle?: string | null
    phone?: string | null
    email?: string | null
    source: LeadSource
    status?: LeadStatus
    ai_score?: number | null
    ai_score_reasoning?: string | null
    tags?: string[] | null
    notes?: string | null
    last_contacted_at?: ISODateString | null
    converted_at?: ISODateString | null
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    id?: string
    name?: string
    instagram_handle?: string | null
    phone?: string | null
    email?: string | null
    source?: LeadSource
    status?: LeadStatus
    ai_score?: number | null
    ai_score_reasoning?: string | null
    tags?: string[] | null
    notes?: string | null
    last_contacted_at?: ISODateString | null
    converted_at?: ISODateString | null
    updated_at?: ISODateString
  }
}

/** Table: customers */
export type CustomersTable = {
  Row: {
    id: string
    user_id: string | null          // FK ke users.id (optional)
    lead_id: string | null          // FK ke leads.id — dari mana customer berasal
    name: string
    phone: string                   // +628xxx — wajib
    email: string | null
    instagram_handle: string | null
    tier: CustomerTier
    total_orders: number            // Counter — di-update via trigger/API
    total_revenue: number           // Rupiah INTEGER (NO float) — sum semua orders
    is_reseller: boolean
    reseller_code: string | null
    notes: string | null
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    user_id?: string | null
    lead_id?: string | null
    name: string
    phone: string
    email?: string | null
    instagram_handle?: string | null
    tier?: CustomerTier
    total_orders?: number
    total_revenue?: number
    is_reseller?: boolean
    reseller_code?: string | null
    notes?: string | null
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    id?: string
    user_id?: string | null
    lead_id?: string | null
    name?: string
    phone?: string
    email?: string | null
    instagram_handle?: string | null
    tier?: CustomerTier
    total_orders?: number
    total_revenue?: number
    is_reseller?: boolean
    reseller_code?: string | null
    notes?: string | null
    updated_at?: ISODateString
  }
}

/** Table: products */
export type ProductsTable = {
  Row: {
    id: string
    name: string
    sku: string                   // Stock Keeping Unit — UNIQUE
    description: string | null
    category: ProductCategory
    price: number                 // Harga normal Rupiah INTEGER
    reseller_price: number | null // Harga reseller Rupiah INTEGER
    stock: number
    images: string[] | null       // JSON array of URLs
    status: ProductStatus
    weight_gram: number | null    // Berat gram untuk ongkir
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    name: string
    sku: string
    description?: string | null
    category: ProductCategory
    price: number
    reseller_price?: number | null
    stock?: number
    images?: string[] | null
    status?: ProductStatus
    weight_gram?: number | null
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    id?: string
    name?: string
    sku?: string
    description?: string | null
    category?: ProductCategory
    price?: number
    reseller_price?: number | null
    stock?: number
    images?: string[] | null
    status?: ProductStatus
    weight_gram?: number | null
    updated_at?: ISODateString
  }
}

/** Table: orders */
export type OrdersTable = {
  Row: {
    id: string
    order_number: string          // Format: ORD-YYYYMMDD-XXXX — UNIQUE
    customer_id: string           // FK ke customers.id
    customer_name: string         // Snapshot saat order
    customer_phone: string        // Snapshot saat order
    subtotal: number              // Rupiah INTEGER (sebelum diskon + ongkir)
    discount: number              // Rupiah INTEGER (0 jika tidak ada)
    shipping_cost: number         // Rupiah INTEGER
    total: number                 // subtotal - discount + shipping_cost
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    order_status: OrderStatus
    shipping_address: string | null
    tracking_number: string | null
    notes: string | null
    source: 'fashionkas' | 'resellerkas' | 'tower_manual' | 'whatsapp'
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    order_number?: string
    customer_id: string
    customer_name: string
    customer_phone: string
    subtotal: number
    discount?: number
    shipping_cost?: number
    total: number
    payment_method: PaymentMethod
    payment_status?: PaymentStatus
    order_status?: OrderStatus
    shipping_address?: string | null
    tracking_number?: string | null
    notes?: string | null
    source: OrdersTable['Row']['source']
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    id?: string
    subtotal?: number
    discount?: number
    shipping_cost?: number
    total?: number
    payment_method?: PaymentMethod
    payment_status?: PaymentStatus
    order_status?: OrderStatus
    shipping_address?: string | null
    tracking_number?: string | null
    notes?: string | null
    updated_at?: ISODateString
  }
}

/** Table: order_items — PLANNED Sprint 1 (belum live) */
export type OrderItemsTable = {
  Row: {
    id: string
    order_id: string              // FK ke orders.id
    product_id: string            // FK ke products.id
    product_name: string          // Snapshot nama saat order
    sku: string                   // Snapshot SKU saat order
    quantity: number
    unit_price: number            // Harga per unit Rupiah INTEGER (snapshot)
    subtotal: number              // quantity * unit_price Rupiah INTEGER
    created_at: ISODateString
  }
  Insert: {
    id?: string
    order_id: string
    product_id: string
    product_name: string
    sku: string
    quantity: number
    unit_price: number
    subtotal: number
    created_at?: ISODateString
  }
  Update: {
    quantity?: number
    unit_price?: number
    subtotal?: number
  }
}

// =============================================================================
// DOMAIN 3 — WA AUTOMATION
// Table: wa_logs — PLANNED Sprint 1
// Human gate: requires_approval field WAJIB ada
// =============================================================================

export type WaLogsTable = {
  Row: {
    id: string
    direction: 'outbound' | 'inbound'
    lead_id: string | null
    customer_id: string | null
    phone: string                 // +628xxx
    message_body: string
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'rejected_by_founder'
    requires_approval: boolean    // ⚠️ HUMAN GATE — true = harus founder approve dulu
    approved_by: string | null    // user_id founder (jika requires_approval = true)
    approved_at: ISODateString | null
    fonnte_message_id: string | null  // ID dari Fonnte API response
    ai_task_id: string | null     // FK ke ai_tasks.id (jika digenerate oleh agent)
    sent_by: 'founder' | 'agent' | 'system'
    sent_at: ISODateString | null
    delivered_at: ISODateString | null
    read_at: ISODateString | null
    created_at: ISODateString
  }
  Insert: {
    id?: string
    direction?: 'outbound' | 'inbound'
    lead_id?: string | null
    customer_id?: string | null
    phone: string
    message_body: string
    status?: WaLogsTable['Row']['status']
    requires_approval?: boolean
    approved_by?: string | null
    approved_at?: ISODateString | null
    fonnte_message_id?: string | null
    ai_task_id?: string | null
    sent_by: WaLogsTable['Row']['sent_by']
    sent_at?: ISODateString | null
    delivered_at?: ISODateString | null
    read_at?: ISODateString | null
    created_at?: ISODateString
  }
  Update: {
    status?: WaLogsTable['Row']['status']
    requires_approval?: boolean
    approved_by?: string | null
    approved_at?: ISODateString | null
    fonnte_message_id?: string | null
    sent_at?: ISODateString | null
    delivered_at?: ISODateString | null
    read_at?: ISODateString | null
  }
}

// =============================================================================
// DOMAIN 4 — AI AGENT STATE
// Tables: ai_tasks, ai_insights — PLANNED Sprint 1
// =============================================================================

/** Table: ai_tasks */
export type AITasksTable = {
  Row: {
    id: string
    agent: AgentType
    status: AgentStatus
    input: JSONObject             // Input payload serialized
    output: JSONObject | null     // Output agent (null jika belum selesai)
    error_message: string | null
    tokens_used: number | null
    model_used: string | null     // e.g. "groq/llama3-8b-8192"
    duration_ms: number | null
    triggered_by: 'founder' | 'system' | 'schedule' | 'agent_chain'
    requires_approval: boolean    // ⚠️ HUMAN GATE — true untuk irreversible actions
    related_lead_id: string | null
    related_order_id: string | null
    created_at: ISODateString
    completed_at: ISODateString | null
  }
  Insert: {
    id?: string
    agent: AgentType
    status?: AgentStatus
    input: JSONObject
    output?: JSONObject | null
    error_message?: string | null
    tokens_used?: number | null
    model_used?: string | null
    duration_ms?: number | null
    triggered_by: AITasksTable['Row']['triggered_by']
    requires_approval?: boolean
    related_lead_id?: string | null
    related_order_id?: string | null
    created_at?: ISODateString
    completed_at?: ISODateString | null
  }
  Update: {
    status?: AgentStatus
    output?: JSONObject | null
    error_message?: string | null
    tokens_used?: number | null
    model_used?: string | null
    duration_ms?: number | null
    requires_approval?: boolean
    completed_at?: ISODateString | null
  }
}

/** Table: ai_insights */
export type AIInsightsTable = {
  Row: {
    id: string
    agent: AgentType
    insight_type: 'weekly_review' | 'lead_trend' | 'revenue_alert' | 'agent_performance' | 'product_trend'
    title: string
    summary: string               // max 100 kata
    details: string | null
    data_snapshot: JSONObject | null  // Data mentah yang jadi dasar
    action_items: string[] | null // JSON array of suggested actions
    priority: 'low' | 'medium' | 'high' | 'critical'
    ai_task_id: string | null     // FK ke ai_tasks.id
    created_at: ISODateString
  }
  Insert: {
    id?: string
    agent: AgentType
    insight_type: AIInsightsTable['Row']['insight_type']
    title: string
    summary: string
    details?: string | null
    data_snapshot?: JSONObject | null
    action_items?: string[] | null
    priority?: AIInsightsTable['Row']['priority']
    ai_task_id?: string | null
    created_at?: ISODateString
  }
  Update: {
    title?: string
    summary?: string
    details?: string | null
    action_items?: string[] | null
    priority?: AIInsightsTable['Row']['priority']
  }
}

// =============================================================================
// DOMAIN 5 — GOVERNANCE & PROOF
// Tables: decision_logs, proof_entries, weekly_reviews
// Status: PLANNED Phase 3
// =============================================================================

/** Table: decision_logs (ADR records) */
export type DecisionLogsTable = {
  Row: {
    id: string
    adr_number: string            // "ADR-001" — UNIQUE
    title: string
    status: 'proposed' | 'accepted' | 'rejected' | 'superseded' | 'deprecated'
    context: string
    decision: string
    consequences: string
    alternatives_considered: string[] | null
    session_number: string | null // Linked session (e.g. "Session 2b")
    created_at: ISODateString
    updated_at: ISODateString
  }
  Insert: {
    id?: string
    adr_number: string
    title: string
    status?: DecisionLogsTable['Row']['status']
    context: string
    decision: string
    consequences: string
    alternatives_considered?: string[] | null
    session_number?: string | null
    created_at?: ISODateString
    updated_at?: ISODateString
  }
  Update: {
    title?: string
    status?: DecisionLogsTable['Row']['status']
    context?: string
    decision?: string
    consequences?: string
    alternatives_considered?: string[] | null
    updated_at?: ISODateString
  }
}

/** Table: proof_entries (CCA evidence + business proof) */
export type ProofEntriesTable = {
  Row: {
    id: string
    title: string
    description: string | null
    proof_type: 'screenshot' | 'revenue' | 'testimonial' | 'kpi' | 'wa_response' | 'other'
    value: string | null          // Nilai KPI, revenue, dll
    image_url: string | null
    source_app: 'fashionkas' | 'resellerkas' | 'tower' | 'external'
    sprint: string | null         // "Sprint 1", "Sprint 2"
    created_at: ISODateString
  }
  Insert: {
    id?: string
    title: string
    description?: string | null
    proof_type: ProofEntriesTable['Row']['proof_type']
    value?: string | null
    image_url?: string | null
    source_app: ProofEntriesTable['Row']['source_app']
    sprint?: string | null
    created_at?: ISODateString
  }
  Update: {
    title?: string
    description?: string | null
    value?: string | null
    image_url?: string | null
    sprint?: string | null
  }
}

/** Table: weekly_reviews */
export type WeeklyReviewsTable = {
  Row: {
    id: string
    week_number: number           // e.g. 14 (ISO week number)
    week_label: string            // e.g. "Week 14 — Apr 1-7, 2026"
    answers_json: JSONObject      // Jawaban 5 pertanyaan weekly review
    revenue_this_week: number     // Rupiah INTEGER
    leads_added: number
    orders_completed: number
    blockers: string[] | null
    wins: string[] | null
    created_at: ISODateString
  }
  Insert: {
    id?: string
    week_number: number
    week_label: string
    answers_json: JSONObject
    revenue_this_week?: number
    leads_added?: number
    orders_completed?: number
    blockers?: string[] | null
    wins?: string[] | null
    created_at?: ISODateString
  }
  Update: {
    answers_json?: JSONObject
    revenue_this_week?: number
    leads_added?: number
    orders_completed?: number
    blockers?: string[] | null
    wins?: string[] | null
  }
}

// =============================================================================
// DOMAIN 6 — AGENT OPERATIONS
// Tables: agent_runs, credit_ledger
// Status: PLANNED Phase 4+
// =============================================================================

/** Table: agent_runs */
export type AgentRunsTable = {
  Row: {
    id: string
    run_number: string            // Format: RUN-YYYYMMDD-XXXX — UNIQUE
    agent: AgentType
    status: AgentStatus
    task_ids: string[] | null     // JSON array of ai_tasks.id
    total_tokens: number | null
    total_cost_usd: number | null // USD float (untuk pembanding saja)
    summary: string | null
    requires_approval: boolean    // ⚠️ HUMAN GATE
    approved_by: string | null
    approved_at: ISODateString | null
    created_at: ISODateString
    completed_at: ISODateString | null
  }
  Insert: {
    id?: string
    run_number?: string
    agent: AgentType
    status?: AgentStatus
    task_ids?: string[] | null
    total_tokens?: number | null
    total_cost_usd?: number | null
    summary?: string | null
    requires_approval?: boolean
    approved_by?: string | null
    approved_at?: ISODateString | null
    created_at?: ISODateString
    completed_at?: ISODateString | null
  }
  Update: {
    status?: AgentStatus
    task_ids?: string[] | null
    total_tokens?: number | null
    total_cost_usd?: number | null
    summary?: string | null
    requires_approval?: boolean
    approved_by?: string | null
    approved_at?: ISODateString | null
    completed_at?: ISODateString | null
  }
}

/** Table: credit_ledger */
export type CreditLedgerTable = {
  Row: {
    id: string
    service: 'groq' | 'openai' | 'anthropic' | 'fonnte' | 'scraperapi' | 'supabase' | 'cloudflare'
    operation: string             // e.g. "scout_score", "wa_send"
    tokens_used: number | null
    messages_sent: number | null  // Untuk Fonnte
    api_calls: number | null
    cost_usd: number | null       // Estimasi cost USD
    cost_idr: number | null       // Estimasi cost IDR — INTEGER (approx)
    ai_task_id: string | null     // FK ke ai_tasks.id
    created_at: ISODateString
  }
  Insert: {
    id?: string
    service: CreditLedgerTable['Row']['service']
    operation: string
    tokens_used?: number | null
    messages_sent?: number | null
    api_calls?: number | null
    cost_usd?: number | null
    cost_idr?: number | null
    ai_task_id?: string | null
    created_at?: ISODateString
  }
  Update: {
    tokens_used?: number | null
    messages_sent?: number | null
    api_calls?: number | null
    cost_usd?: number | null
    cost_idr?: number | null
  }
}

// =============================================================================
// DATABASE TYPE — Aggregate semua table definitions
// Pattern: Supabase Database<Tables> type
// =============================================================================

/**
 * SovereignDatabase — type aggregate untuk Supabase client
 * Dipakai saat init: createClient<SovereignDatabase>(url, key)
 *
 * Menggambarkan SELURUH canonical DB (sovereign-main)
 * Tables yang sudah LIVE dan yang PLANNED Sprint 1 sudah include semua
 */
export type SovereignDatabase = {
  public: {
    Tables: {
      // Domain 1 — Identity
      users: UsersTable

      // Domain 2 — Commerce Core (LIVE + PLANNED)
      leads: LeadsTable
      customers: CustomersTable
      products: ProductsTable
      orders: OrdersTable
      order_items: OrderItemsTable     // ← PLANNED Sprint 1

      // Domain 3 — WA Automation (PLANNED Sprint 1)
      wa_logs: WaLogsTable             // ← PLANNED Sprint 1

      // Domain 4 — AI Agent State (PLANNED Sprint 1)
      ai_tasks: AITasksTable           // ← PLANNED Sprint 1
      ai_insights: AIInsightsTable     // ← PLANNED Sprint 1

      // Domain 5 — Governance (PLANNED Phase 3)
      decision_logs: DecisionLogsTable
      proof_entries: ProofEntriesTable
      weekly_reviews: WeeklyReviewsTable

      // Domain 6 — Agent Operations (PLANNED Phase 4+)
      agent_runs: AgentRunsTable
      credit_ledger: CreditLedgerTable
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// =============================================================================
// TABLE NAMES — Konstanta string untuk hindari typo
// =============================================================================

export const DB_TABLES = {
  // Domain 1 — Identity
  USERS: 'users',

  // Domain 2 — Commerce
  LEADS: 'leads',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',

  // Domain 3 — WA
  WA_LOGS: 'wa_logs',

  // Domain 4 — AI
  AI_TASKS: 'ai_tasks',
  AI_INSIGHTS: 'ai_insights',

  // Domain 5 — Governance
  DECISION_LOGS: 'decision_logs',
  PROOF_ENTRIES: 'proof_entries',
  WEEKLY_REVIEWS: 'weekly_reviews',

  // Domain 6 — Agent Ops
  AGENT_RUNS: 'agent_runs',
  CREDIT_LEDGER: 'credit_ledger',
} as const

export type TableName = typeof DB_TABLES[keyof typeof DB_TABLES]

// =============================================================================
// DOMAIN STATUS MAP — Untuk tracking migration status
// =============================================================================

/**
 * Map status tiap domain sesuai docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
 * P0 = sudah live, P1 = Sprint 1, P3+ = Future
 */
export const DOMAIN_STATUS = {
  DOMAIN_1_IDENTITY: 'P0_LIVE',
  DOMAIN_2_COMMERCE_CORE: 'P0_LIVE',       // orders + order_items = P1
  DOMAIN_2_ORDER_ITEMS: 'P1_PLANNED',
  DOMAIN_3_WA_AUTOMATION: 'P1_PLANNED',
  DOMAIN_4_AI_AGENT: 'P1_PLANNED',
  DOMAIN_5_GOVERNANCE: 'P3_FUTURE',
  DOMAIN_6_AGENT_OPS: 'P4_FUTURE',
} as const
