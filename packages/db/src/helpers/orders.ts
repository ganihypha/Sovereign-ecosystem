// @sovereign/db — helpers/orders.ts
// Query helpers untuk domain Orders + OrderItems
// Domain 2 Commerce Core — sovereign-main.orders (✅ LIVE) + order_items (🔴 PLANNED Sprint 1)

import type { SovereignServerClient, DbResult } from '../client'
import { wrapResult, normalizeDbError } from '../client'
import type { OrdersTable, OrderItemsTable } from '../schema'
import { DB_TABLES } from '../schema'

export type OrderRow = OrdersTable['Row']
export type OrderInsert = OrdersTable['Insert']
export type OrderUpdate = OrdersTable['Update']
export type OrderItemRow = OrderItemsTable['Row']
export type OrderItemInsert = OrderItemsTable['Insert']

// =============================================================================
// ORDERS READ
// =============================================================================

export async function getOrderById(
  client: SovereignServerClient,
  id: string
): Promise<DbResult<OrderRow>> {
  const { data, error } = await client
    .from(DB_TABLES.ORDERS)
    .select('*')
    .eq('id', id)
    .single()

  return wrapResult(data, error)
}

export async function getOrderByNumber(
  client: SovereignServerClient,
  orderNumber: string
): Promise<DbResult<OrderRow>> {
  const { data, error } = await client
    .from(DB_TABLES.ORDERS)
    .select('*')
    .eq('order_number', orderNumber)
    .single()

  return wrapResult(data, error)
}

export async function listOrdersByCustomer(
  client: SovereignServerClient,
  customerId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<DbResult<OrderRow[]>> {
  const { limit = 20, offset = 0 } = options
  const { data, error } = await client
    .from(DB_TABLES.ORDERS)
    .select('*')
    .eq('customer_id', customerId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  return wrapResult(data, error)
}

export async function listOrders(
  client: SovereignServerClient,
  options: {
    status?: OrderRow['order_status']
    payment_status?: OrderRow['payment_status']
    source?: OrderRow['source']
    limit?: number
    offset?: number
  } = {}
): Promise<DbResult<OrderRow[]>> {
  const { status, payment_status, source, limit = 20, offset = 0 } = options

  let query = client
    .from(DB_TABLES.ORDERS)
    .select('*')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('order_status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)
  if (source) query = query.eq('source', source)

  const { data, error } = await query
  return wrapResult(data, error)
}

// =============================================================================
// ORDERS WRITE
// =============================================================================

/**
 * Generate order number format: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${date}-${rand}`
}

export async function insertOrder(
  client: SovereignServerClient,
  payload: Omit<OrderInsert, 'order_number'> & { order_number?: string }
): Promise<DbResult<OrderRow>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.ORDERS)
    .insert({
      ...payload,
      order_number: payload.order_number ?? generateOrderNumber(),
      discount: payload.discount ?? 0,
      shipping_cost: payload.shipping_cost ?? 0,
      payment_status: payload.payment_status ?? 'unpaid',
      order_status: payload.order_status ?? 'pending',
      created_at: payload.created_at ?? now,
      updated_at: payload.updated_at ?? now,
    })
    .select()
    .single()

  return wrapResult(data, error)
}

export async function updateOrder(
  client: SovereignServerClient,
  id: string,
  payload: OrderUpdate
): Promise<DbResult<OrderRow>> {
  const { data, error } = await client
    .from(DB_TABLES.ORDERS)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return wrapResult(data, error)
}

// =============================================================================
// ORDER ITEMS (PLANNED Sprint 1)
// Helper sudah tersedia, tapi tabel belum live di production
// =============================================================================

export async function getOrderItems(
  client: SovereignServerClient,
  orderId: string
): Promise<DbResult<OrderItemRow[]>> {
  const { data, error } = await client
    .from(DB_TABLES.ORDER_ITEMS)
    .select('*')
    .eq('order_id', orderId)

  return wrapResult(data, error)
}

export async function insertOrderItems(
  client: SovereignServerClient,
  items: OrderItemInsert[]
): Promise<DbResult<OrderItemRow[]>> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from(DB_TABLES.ORDER_ITEMS)
    .insert(items.map(item => ({
      ...item,
      created_at: item.created_at ?? now,
    })))
    .select()

  return wrapResult(data, error)
}

// =============================================================================
// REVENUE AGGREGATION (baca dari orders)
// =============================================================================

/**
 * Total revenue dari orders yang sudah paid/completed
 * Return: Rupiah INTEGER
 */
export async function getTotalRevenue(
  client: SovereignServerClient,
  options: {
    from?: string   // ISO date string
    to?: string     // ISO date string
    source?: OrderRow['source']
  } = {}
): Promise<DbResult<number>> {
  let query = client
    .from(DB_TABLES.ORDERS)
    .select('total')
    .in('payment_status', ['paid'])
    .in('order_status', ['completed', 'delivered', 'shipped', 'processing', 'confirmed'])

  if (options.from) query = query.gte('created_at', options.from)
  if (options.to) query = query.lte('created_at', options.to)
  if (options.source) query = query.eq('source', options.source)

  const { data, error } = await query
  if (error) return { data: null, error: normalizeDbError(error) }
  if (!data) return { data: 0, error: null }

  const total = data.reduce((sum, row) => sum + (row.total ?? 0), 0)
  return { data: total, error: null }
}
