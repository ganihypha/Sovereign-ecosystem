// sovereign-tower — src/lib/module-registry.ts
// Module Registry: definisi 7 internal modules Sovereign Tower
// Sovereign Business Engine v4.0 — Session 3a
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Setiap module adalah placeholder yang akan di-implement di sesi berikutnya.
// Tujuan Session 3a: definisikan metadata stabil → extension di 3b+ mudah.

// =============================================================================
// MODULE TYPES
// =============================================================================

/** Status sebuah module */
export type TowerModuleStatus =
  | 'placeholder'     // Scaffold only — belum ada logic
  | 'in-progress'     // Sedang dibangun
  | 'ready'           // Siap dipakai (basic)
  | 'blocked'         // Menunggu dependency / blocker
  | 'deprecated'      // Tidak lagi digunakan

/** Access level module — semua Tower modules = founder_only */
export type TowerModuleAccess = 'founder_only'

/** Satu Tower Module definition */
export interface TowerModule {
  /** ID unik module — kebab-case */
  id: string
  /** Nama tampilan module */
  title: string
  /** Deskripsi singkat tujuan module */
  purpose: string
  /** Access level — semua founder_only */
  access: TowerModuleAccess
  /** Status implementasi saat ini */
  status: TowerModuleStatus
  /** Route path utama module */
  route_path: string
  /** Packages yang dibutuhkan module ini */
  depends_on: string[]
  /** Blocker yang mencegah implementasi (jika ada) */
  blockers?: string[]
  /** Apa yang harus dikerjakan di session berikutnya */
  next_session_hint: string
  /** Session di mana module ini mulai di-implement */
  implement_in_session?: string
}

// =============================================================================
// MODULE REGISTRY
// 7 internal modules Sovereign Tower
// =============================================================================

/** Registry lengkap semua Tower modules */
export const TOWER_MODULE_REGISTRY: TowerModule[] = [
  // ────────────────────────────────────────────────────────────────────────
  // MODULE 1: today-dashboard
  // Landing page internal — ringkasan harian founder
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'today-dashboard',
    title: 'Today Dashboard',
    purpose: 'Ringkasan harian founder: leads baru, revenue hari ini, alert AI, task pending. Entry point utama Sovereign Tower.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/dashboard/today',
    depends_on: ['@sovereign/db', '@sovereign/auth', '@sovereign/types'],
    blockers: [],
    next_session_hint: 'Session 3b: Wire ke @sovereign/db — baca leads count + revenue sum dari canonical DB. Tambah simple metrics aggregation.',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 2: build-ops
  // Manajemen sprint & task operational AI dev
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'build-ops',
    title: 'Build Ops',
    purpose: 'Track sprint progress, session log, AI dev task tracker, phase migration status. Founder control center untuk build operations.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/build-ops',
    depends_on: ['@sovereign/db', '@sovereign/auth', '@sovereign/prompt-contracts'],
    blockers: [],
    next_session_hint: 'Session 3b: Tambah endpoint baca phase-tracker.md atau DB table session_logs jika tersedia. Wire ke prompt-contracts untuk session metadata.',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 3: ai-resource-manager
  // Monitor penggunaan AI credits & token budget
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ai-resource-manager',
    title: 'AI Resource Manager',
    purpose: 'Track penggunaan token AI (Groq, OpenAI, Anthropic), estimasi cost, alert budget. Mencegah credit bleed-out.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/ai-resource-manager',
    depends_on: ['@sovereign/db', '@sovereign/auth', '@sovereign/types'],
    blockers: ['credit_ledger table tidak ada di DB sebelum migration Sprint 1'],
    next_session_hint: 'Session 3b: Wire ke @sovereign/db credit_ledger table setelah Sprint 1 DB migration. Buat simple cost dashboard endpoint.',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 4: revenue-ops
  // Dashboard revenue, order tracking, konversi
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'revenue-ops',
    title: 'Revenue Ops',
    purpose: 'Monitor revenue harian/mingguan, tracking orders, konversi lead → customer, alert revenue target Rp 75jt/bulan.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/revenue-ops',
    depends_on: ['@sovereign/db', '@sovereign/auth', '@sovereign/types'],
    blockers: [],
    next_session_hint: 'Session 3b: Wire ke @sovereign/db orders table. Buat simple revenue aggregation endpoint (sum orders by date range).',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 5: proof-center
  // Kumpulkan & display bukti nyata (screenshot, KPI, revenue proof)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'proof-center',
    title: 'Proof Center',
    purpose: 'Kumpulkan bukti nyata: screenshot revenue, lead conversions, WA transactions, AI outputs. Mendukung CCA-F evidence vault.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/proof-center',
    depends_on: ['@sovereign/db', '@sovereign/auth'],
    blockers: [],
    next_session_hint: 'Session 3b: Buat simple proof entry endpoint. Wire ke @sovereign/db atau R2 storage untuk file uploads. Support CCA evidence format.',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 6: decision-center
  // Architecture Decision Records (ADR) management
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'decision-center',
    title: 'Decision Center',
    purpose: 'Kelola Architecture Decision Records (ADR), keputusan strategis, dan governance log. Source of truth untuk semua keputusan teknis.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/decision-center',
    depends_on: ['@sovereign/db', '@sovereign/auth'],
    blockers: [],
    next_session_hint: 'Session 3b: Buat endpoint list + create ADR. Wire ke decision_logs table (dari @sovereign/db schema) atau markdown files di /evidence/architecture/.',
    implement_in_session: '3b',
  },

  // ────────────────────────────────────────────────────────────────────────
  // MODULE 7: founder-review
  // Weekly 5-question review + reflection
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'founder-review',
    title: 'Founder Review',
    purpose: 'Weekly 5-question founder reflection: revenue progress, build progress, blockers, lessons, next week priorities. Structured thinking tool.',
    access: 'founder_only',
    status: 'placeholder',
    route_path: '/api/modules/founder-review',
    depends_on: ['@sovereign/db', '@sovereign/auth', '@sovereign/types'],
    blockers: [],
    next_session_hint: 'Session 3b: Buat endpoint create + list weekly_reviews. Wire ke canonical DB weekly_reviews table. Standardize 5-question format.',
    implement_in_session: '3b',
  },
]

// =============================================================================
// REGISTRY HELPERS
// =============================================================================

/** Lookup satu module by ID */
export function getModuleById(id: string): TowerModule | undefined {
  return TOWER_MODULE_REGISTRY.find((m) => m.id === id)
}

/** List semua module yang siap (status !== placeholder) */
export function getReadyModules(): TowerModule[] {
  return TOWER_MODULE_REGISTRY.filter((m) => m.status === 'ready')
}

/** List semua module yang masih placeholder */
export function getPlaceholderModules(): TowerModule[] {
  return TOWER_MODULE_REGISTRY.filter((m) => m.status === 'placeholder')
}

/** List semua module yang blocked */
export function getBlockedModules(): TowerModule[] {
  return TOWER_MODULE_REGISTRY.filter(
    (m) => m.status === 'blocked' || (m.blockers && m.blockers.length > 0)
  )
}

/** Summary statistics module registry */
export function getRegistrySummary() {
  const total = TOWER_MODULE_REGISTRY.length
  const byStatus = TOWER_MODULE_REGISTRY.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1
    return acc
  }, {})

  return {
    total,
    by_status: byStatus,
    all_founder_only: TOWER_MODULE_REGISTRY.every((m) => m.access === 'founder_only'),
    module_ids: TOWER_MODULE_REGISTRY.map((m) => m.id),
  }
}
