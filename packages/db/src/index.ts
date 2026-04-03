// @sovereign/db — index.ts
// Package @sovereign/db v0.1.0
// DB Foundation Layer — Sovereign Business Engine v4.0
//
// ============================================================================
// WHAT THIS PACKAGE PROVIDES:
// ============================================================================
//
// 1. SovereignDatabase type — Supabase-typed database schema
//    → Gunakan saat init: createClient<SovereignDatabase>(url, key)
//
// 2. Table definitions (Row/Insert/Update shapes per table)
//    → Semua canonical tables dari docs/24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
//
// 3. Client factories (createServerClient, createAnonClient)
//    → Typed Supabase client untuk server-side dan public operations
//
// 4. Domain helpers (query helpers per domain)
//    → leads, orders, wa-logs, ai-tasks
//
// ============================================================================
// USAGE PATTERN:
// ============================================================================
//
// Server-side Hono route (Cloudflare Worker):
//   import { createServerClient, insertLead, listLeads } from '@sovereign/db'
//
//   app.post('/api/leads', async (c) => {
//     const db = createServerClient(c.env)
//     const result = await insertLead(db, { name: 'Alice', source: 'fashionkas_form' })
//     if (result.error) return c.json({ error: result.error }, 500)
//     return c.json(result.data, 201)
//   })
//
// Public anon (lead capture form):
//   import { createAnonClient, insertLead } from '@sovereign/db'
//
//   const db = createAnonClient({ SUPABASE_URL, SUPABASE_ANON_KEY })
//   const result = await insertLead(db, payload)
//
// ============================================================================
// SECURITY REMINDER:
// ============================================================================
//
// ✅ createServerClient → server-side only (Hono handlers, Workers)
// ✅ createAnonClient   → public surfaces (Fashionkas, Resellerkas)
// ❌ JANGAN expose SUPABASE_SERVICE_ROLE_KEY ke client/browser
// ❌ JANGAN commit .dev.vars ke repo
//
// ============================================================================

export const DB_VERSION = '0.1.0'
export const DB_PLACEHOLDER = false

// --- Schema: Table Definitions & Database Type ---
export type {
  SovereignDatabase,
  TableName,

  // Domain 1 — Identity
  UsersTable,

  // Domain 2 — Commerce Core
  LeadsTable,
  CustomersTable,
  ProductsTable,
  OrdersTable,
  OrderItemsTable,

  // Domain 3 — WA Automation
  WaLogsTable,

  // Domain 4 — AI Agent State
  AITasksTable,
  AIInsightsTable,

  // Domain 5 — Governance
  DecisionLogsTable,
  ProofEntriesTable,
  WeeklyReviewsTable,

  // Domain 6 — Agent Ops
  AgentRunsTable,
  CreditLedgerTable,
} from './schema'

export {
  DB_TABLES,
  DOMAIN_STATUS,
} from './schema'

// --- Client: Factories & Helpers ---
export type {
  SovereignServerClient,
  SovereignAnonClient,
  DbEnvConfig,
  DbError,
  DbResult,
} from './client'

export {
  createServerClient,
  createAnonClient,
  normalizeDbError,
  wrapResult,
} from './client'

// --- Domain Helpers: leads ---
export type {
  LeadRow,
  LeadInsert,
  LeadUpdate,
} from './helpers/leads'

export {
  getLeadById,
  listLeads,
  searchLeads,
  insertLead,
  updateLead,
  updateLeadAIScore,
} from './helpers/leads'

// --- Domain Helpers: orders ---
export type {
  OrderRow,
  OrderInsert,
  OrderUpdate,
  OrderItemRow,
  OrderItemInsert,
} from './helpers/orders'

export {
  getOrderById,
  getOrderByNumber,
  listOrdersByCustomer,
  listOrders,
  generateOrderNumber,
  insertOrder,
  updateOrder,
  getOrderItems,
  insertOrderItems,
  getTotalRevenue,
} from './helpers/orders'

// --- Domain Helpers: wa-logs ---
export type {
  WaLogRow,
  WaLogInsert,
  WaLogUpdate,
} from './helpers/wa-logs'

export {
  getWaLogById,
  listPendingApprovals,
  listWaLogsByLead,
  insertWaLog,
  approveWaLog,
  updateWaLogStatus,
  rejectWaLog,
} from './helpers/wa-logs'

// --- Domain Helpers: ai-tasks ---
export type {
  AITaskRow,
  AITaskInsert,
  AITaskUpdate,
  AIInsightRow,
  AIInsightInsert,
  AgentRunRow,
  AgentRunInsert,
} from './helpers/ai-tasks'

export {
  getAITaskById,
  listTasksPendingApproval,
  listTasksByAgent,
  insertAITask,
  updateAITaskStatus,
  listInsightsByType,
  insertAIInsight,
  generateRunNumber,
  insertAgentRun,
  updateAgentRunStatus,
} from './helpers/ai-tasks'

// --- Legacy placeholder export (tetap untuk backward compat) ---
export type { DbConfig } from './legacy'
