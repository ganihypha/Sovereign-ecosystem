// @sovereign/types — api.ts
// API contract types: request/response shapes untuk semua endpoints
// Dipakai oleh: semua apps (Fashionkas, Resellerkas, Tower, Client Workspace)
// Ini adalah "API schema tanpa framework" — pure TypeScript types
// ⚠️ Tidak ada import dari framework (Hono, Express, etc.)

import type {
  LeadStatus,
  OrderStatus,
  AgentStatus,
  AgentType,
  Pagination,
  SortDirection,
  ISODateString,
  JSONObject,
} from './common'

import type {
  LeadRecord,
  CustomerRecord,
  OrderRecord,
  ProductRecord,
  CreateLeadPayload,
  UpdateLeadPayload,
  CreateCustomerPayload,
  CreateOrderPayload,
  CreateProductPayload,
} from './business'

import type {
  AITaskRecord,
  AgentRunRecord,
  CreateAITaskPayload,
  WALogRecord,
  CreateWAOutboundPayload,
  BusinessInsight,
  ScoutInput,
  ScoutScore,
  MessageComposerInput,
  MessageComposerOutput,
} from './agents'

// =============================================================================
// GENERIC API RESPONSE WRAPPER
// Semua API response harus mengikuti shape ini
// =============================================================================

/** Standard API response wrapper (success) */
export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: ApiMeta
}

/** Standard API response wrapper (error) */
export type ApiError = {
  success: false
  error: {
    code: string              // e.g. "LEAD_NOT_FOUND", "VALIDATION_ERROR"
    message: string           // Human-readable error message
    details?: JSONObject      // Tambahan detail (field errors, dll)
  }
}

/** Union type untuk semua API responses */
export type ApiResponse<T> = ApiSuccess<T> | ApiError

/** Metadata untuk paginated responses */
export type ApiMeta = {
  total?: number
  page?: number
  per_page?: number
  has_more?: boolean
}

/** Generic paginated list response */
export type PaginatedResponse<T> = ApiSuccess<{
  items: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}>

// =============================================================================
// AUTH API (Tower → sovereign-main.users)
// =============================================================================

/** POST /api/auth/login */
export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = ApiResponse<{
  access_token: string          // JWT (short-lived, 1h)
  refresh_token: string         // Refresh token (7d)
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  expires_at: ISODateString
}>

/** POST /api/auth/refresh */
export type RefreshTokenRequest = {
  refresh_token: string
}

export type RefreshTokenResponse = ApiResponse<{
  access_token: string
  expires_at: ISODateString
}>

/** GET /api/auth/me */
export type GetMeResponse = ApiResponse<{
  id: string
  email: string
  name: string
  role: string
  tier?: string
  is_active: boolean
}>

// =============================================================================
// LEADS API (Tower + Fashionkas)
// Base path: /api/leads
// =============================================================================

/** GET /api/leads — query params */
export type LeadsQueryParams = {
  page?: number
  per_page?: number
  status?: LeadStatus
  source?: string
  search?: string               // Search by name, phone, instagram
  min_score?: number
  max_score?: number
  sort_by?: 'created_at' | 'updated_at' | 'ai_score' | 'name'
  sort_dir?: SortDirection
}

/** GET /api/leads */
export type GetLeadsResponse = PaginatedResponse<LeadRecord>

/** GET /api/leads/:id */
export type GetLeadResponse = ApiResponse<LeadRecord>

/** POST /api/leads */
export type CreateLeadRequest = CreateLeadPayload
export type CreateLeadResponse = ApiResponse<LeadRecord>

/** PATCH /api/leads/:id */
export type UpdateLeadRequest = UpdateLeadPayload
export type UpdateLeadResponse = ApiResponse<LeadRecord>

/** DELETE /api/leads/:id */
export type DeleteLeadResponse = ApiResponse<{ deleted: true; id: string }>

// =============================================================================
// CUSTOMERS API (Tower + Fashionkas + Resellerkas)
// Base path: /api/customers
// =============================================================================

/** GET /api/customers — query params */
export type CustomersQueryParams = {
  page?: number
  per_page?: number
  tier?: string
  is_reseller?: boolean
  search?: string
  sort_by?: 'created_at' | 'total_revenue' | 'total_orders' | 'name'
  sort_dir?: SortDirection
}

/** GET /api/customers */
export type GetCustomersResponse = PaginatedResponse<CustomerRecord>

/** GET /api/customers/:id */
export type GetCustomerResponse = ApiResponse<CustomerRecord>

/** POST /api/customers */
export type CreateCustomerRequest = CreateCustomerPayload
export type CreateCustomerResponse = ApiResponse<CustomerRecord>

// =============================================================================
// PRODUCTS API (Fashionkas + Resellerkas)
// Base path: /api/products
// =============================================================================

/** GET /api/products — query params */
export type ProductsQueryParams = {
  page?: number
  per_page?: number
  category?: string
  status?: string
  min_price?: number
  max_price?: number
  search?: string
  sort_by?: 'price' | 'created_at' | 'name' | 'stock'
  sort_dir?: SortDirection
}

/** GET /api/products */
export type GetProductsResponse = PaginatedResponse<ProductRecord>

/** GET /api/products/:id */
export type GetProductResponse = ApiResponse<ProductRecord>

/** POST /api/products (Tower only) */
export type CreateProductRequest = CreateProductPayload
export type CreateProductResponse = ApiResponse<ProductRecord>

// =============================================================================
// ORDERS API (Tower + Fashionkas + Resellerkas)
// Base path: /api/orders
// =============================================================================

/** GET /api/orders — query params */
export type OrdersQueryParams = {
  page?: number
  per_page?: number
  status?: OrderStatus
  customer_id?: string
  source?: string
  date_from?: ISODateString
  date_to?: ISODateString
  sort_by?: 'created_at' | 'total' | 'order_number'
  sort_dir?: SortDirection
}

/** GET /api/orders */
export type GetOrdersResponse = PaginatedResponse<OrderRecord>

/** GET /api/orders/:id */
export type GetOrderResponse = ApiResponse<OrderRecord>

/** POST /api/orders */
export type CreateOrderRequest = CreateOrderPayload
export type CreateOrderResponse = ApiResponse<OrderRecord>

// =============================================================================
// AI TASKS API (Tower — agent orchestration)
// Base path: /api/agents
// =============================================================================

/** POST /api/agents/scout — jalankan ScoutScorer */
export type RunScoutRequest = ScoutInput
export type RunScoutResponse = ApiResponse<{
  task_id: string
  score: ScoutScore
  lead_updated: boolean
}>

/** POST /api/agents/compose — jalankan MessageComposer */
export type RunComposeRequest = MessageComposerInput
export type RunComposeResponse = ApiResponse<{
  task_id: string
  composed: MessageComposerOutput
}>

/** GET /api/agents/tasks — list AI tasks */
export type GetAITasksResponse = PaginatedResponse<AITaskRecord>

/** GET /api/agents/tasks/:id */
export type GetAITaskResponse = ApiResponse<AITaskRecord>

/** GET /api/agents/runs — list agent runs */
export type GetAgentRunsResponse = PaginatedResponse<AgentRunRecord>

// =============================================================================
// WA API (Tower — human gate sebelum kirim WA)
// Base path: /api/wa
// =============================================================================

/** POST /api/wa/send — kirim WA (founder triggered) */
export type SendWARequest = CreateWAOutboundPayload
export type SendWAResponse = ApiResponse<{
  wa_log_id: string
  fonnte_message_id?: string
  status: WALogRecord['status']
}>

/** POST /api/wa/approve/:task_id — founder approve AI-generated message */
export type ApproveWARequest = {
  message_override?: string     // Jika founder mau edit pesan
}
export type ApproveWAResponse = ApiResponse<{
  wa_log_id: string
  status: 'sent' | 'queued'
}>

/** GET /api/wa/logs */
export type GetWALogsResponse = PaginatedResponse<WALogRecord>

// =============================================================================
// INSIGHTS API (Tower — business intelligence)
// Base path: /api/insights
// =============================================================================

/** GET /api/insights */
export type GetInsightsResponse = PaginatedResponse<BusinessInsight>

/** POST /api/insights/generate — trigger InsightGenerator */
export type GenerateInsightRequest = {
  insight_type: BusinessInsight['insight_type']
  date_from?: ISODateString
  date_to?: ISODateString
  context?: string
}
export type GenerateInsightResponse = ApiResponse<BusinessInsight>

// =============================================================================
// DASHBOARD / ANALYTICS (Tower + Client Workspace)
// Base path: /api/dashboard
// =============================================================================

/** GET /api/dashboard/summary */
export type DashboardSummary = {
  total_leads: number
  leads_by_status: Record<LeadStatus, number>
  total_customers: number
  total_revenue_idr: number
  total_orders: number
  orders_by_status: Record<OrderStatus, number>
  pending_ai_tasks: number
  agents_running: number
  wa_sent_today: number
  last_updated: ISODateString
}

export type GetDashboardSummaryResponse = ApiResponse<DashboardSummary>

/** GET /api/dashboard/weekly */
export type WeeklyReview = {
  week_label: string            // e.g. "2026-W14"
  date_from: ISODateString
  date_to: ISODateString
  new_leads: number
  converted_leads: number
  revenue_idr: number
  orders_completed: number
  wa_messages_sent: number
  ai_tasks_completed: number
  highlights?: string[]
  lowlights?: string[]
  next_week_goals?: string[]
}

export type GetWeeklyReviewResponse = ApiResponse<WeeklyReview>
