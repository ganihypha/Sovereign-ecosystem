// @sovereign/types — index.ts
// Central export barrel untuk semua shared types
// 
// USAGE:
//   import type { LeadRecord, LeadStatus } from '@sovereign/types'
//   import type { ApiResponse, GetLeadsResponse } from '@sovereign/types'
//   import type { AITaskRecord, ScoutScore } from '@sovereign/types'
//
// VERSION: 0.1.0
// SESSION: 2a — Core domain types implemented
// NEXT: Session 2b will add @sovereign/db (Supabase schema + query helpers)

// =============================================================================
// COMMON: Enums, Statuses, Roles, Primitives
// =============================================================================
export type {
  // Roles & Access
  UserRole,
  AccessLevel,
  CustomerTier,

  // Lead & Scout
  LeadStatus,
  LeadSource,

  // Order & Commerce
  OrderStatus,
  PaymentMethod,
  PaymentStatus,

  // Product
  ProductCategory,
  ProductStatus,

  // AI Agents
  AgentStatus,
  AgentType,

  // Utilities
  ISODateString,
  UUID,
  Pagination,
  SortDirection,
  JSONValue,
  JSONObject,
  JSONArray,
  Nullable,
  Optional,
  Result,
} from './common'

// =============================================================================
// BUSINESS: Domain entities (Lead, Customer, Order, Product, etc.)
// =============================================================================
export type {
  // User / Auth
  UserRecord,
  CreateUserPayload,

  // Lead
  LeadRecord,
  CreateLeadPayload,
  UpdateLeadPayload,

  // Customer
  CustomerRecord,
  CreateCustomerPayload,

  // Product
  ProductRecord,
  CreateProductPayload,

  // Order
  OrderItem,
  OrderRecord,
  CreateOrderPayload,

  // Tower internals
  ProofRecord,
  SprintLogEntry,
  AdrRecord,
} from './business'

// =============================================================================
// AGENTS: AI task/run types, WA logs, agent I/O contracts
// =============================================================================
export type {
  // AI Tasks & Runs
  AITaskRecord,
  CreateAITaskPayload,
  AgentRunRecord,

  // Scout Agent
  ScoutInput,
  ScoutScore,

  // Message Composer
  MessageComposerInput,
  MessageComposerOutput,

  // WA Log
  WALogRecord,
  CreateWAOutboundPayload,

  // Insight
  BusinessInsight,

  // Credit Ledger
  CreditLedgerRecord,
} from './agents'

// =============================================================================
// API: Request/Response contract shapes
// =============================================================================
export type {
  // Generic wrappers
  ApiSuccess,
  ApiError,
  ApiResponse,
  ApiMeta,
  PaginatedResponse,

  // Auth
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetMeResponse,

  // Leads
  LeadsQueryParams,
  GetLeadsResponse,
  GetLeadResponse,
  CreateLeadRequest,
  CreateLeadResponse,
  UpdateLeadRequest,
  UpdateLeadResponse,
  DeleteLeadResponse,

  // Customers
  CustomersQueryParams,
  GetCustomersResponse,
  GetCustomerResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,

  // Products
  ProductsQueryParams,
  GetProductsResponse,
  GetProductResponse,
  CreateProductRequest,
  CreateProductResponse,

  // Orders
  OrdersQueryParams,
  GetOrdersResponse,
  GetOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,

  // AI Agents
  RunScoutRequest,
  RunScoutResponse,
  RunComposeRequest,
  RunComposeResponse,
  GetAITasksResponse,
  GetAITaskResponse,
  GetAgentRunsResponse,

  // WA
  SendWARequest,
  SendWAResponse,
  ApproveWARequest,
  ApproveWAResponse,
  GetWALogsResponse,

  // Insights
  GetInsightsResponse,
  GenerateInsightRequest,
  GenerateInsightResponse,

  // Dashboard
  DashboardSummary,
  GetDashboardSummaryResponse,
  WeeklyReview,
  GetWeeklyReviewResponse,
} from './api'
