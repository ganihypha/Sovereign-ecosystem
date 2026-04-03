// @sovereign/types — Placeholder
// Phase 2: Shared TypeScript types akan diisi di sini

// TODO Phase 2:
// - api.ts: API request/response types
// - agents.ts: Agent input/output types
// - business.ts: Business domain types (Lead, Customer, Order, Product)

export const TYPES_VERSION = '0.0.1'
export const TYPES_PLACEHOLDER = true

// Placeholder business types — akan diperluas di Phase 2
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed'
