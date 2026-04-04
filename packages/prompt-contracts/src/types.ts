// @sovereign/prompt-contracts — types.ts
// Core TypeScript type definitions untuk Prompt Contract Model
// Sovereign Business Engine v4.0 — Session 2e
// ⚠️ DESIGN RULES:
//   - Pure TypeScript: no external runtime dependency
//   - Cloudflare Worker friendly (no Node.js APIs)
//   - App-agnostic: usable by agents, tower, handoff packs
//   - Human-gate dan cost-control concepts WAJIB ada
//   - Semua string yang bisa berubah = type literal | union

// =============================================================================
// PRIMITIVES
// =============================================================================

/** Format ISO 8601 date string */
export type ISODateString = string

/** Semua possible session phase di Sovereign Ecosystem */
export type SovereignPhase =
  | 'phase-0'      // Audit
  | 'phase-1'      // Mother Repo Skeleton
  | 'phase-2'      // Shared Core Packages
  | 'phase-3'      // Sovereign Tower Hardening
  | 'phase-4'      // Agent Layer
  | 'phase-5'      // Customer Layer
  | 'phase-6'      // Full Productionization

/** Session type untuk mengklasifikasikan tujuan sesi */
export type SessionType =
  | 'execution'       // Eksekusi task baru
  | 'build-module'    // Build modul/fitur baru
  | 'database'        // Database migration/schema task
  | 'auth'            // Authentication/authorization task
  | 'integration'     // External API integration task
  | 'agent'           // AI Agent build/config task
  | 'handoff-summary' // Session summary / handoff ke session berikutnya
  | 'audit'           // Audit/review session
  | 'governance'      // Docs, ADR, decision records
  | 'infra'           // Infrastructure/deployment task

/** Status sesi atau task */
export type ContractStatus =
  | 'draft'       // Belum final
  | 'active'      // Sedang dieksekusi
  | 'done'        // Selesai semua AC
  | 'blocked'     // Ada blocker, tidak bisa lanjut
  | 'partial'     // Sebagian selesai, ada yang di-skip/deferred
  | 'cancelled'   // Dibatalkan

/** Priority level untuk task dan blocker */
export type Priority = 'critical' | 'high' | 'medium' | 'low'

/** Apakah perlu human review/approval sebelum action dilaksanakan */
export type HumanGateLevel =
  | 'none'        // Tidak perlu approval
  | 'review'      // Founder perlu review output tapi tidak perlu approve
  | 'approve'     // Founder WAJIB approve sebelum action
  | 'confirm-irreversible' // Action irreversible, konfirmasi eksplisit wajib

// =============================================================================
// COST CONTROL
// Mengontrol scope dan credit usage per session
// =============================================================================

/** Rules cost-control / narrow-session execution */
export interface CostControlRules {
  /** Batasi jumlah file yang boleh diubah dalam satu session */
  max_files_touched?: number
  /** Jangan bikin external API call yang berbayar kecuali diizinkan */
  allow_paid_api_calls: boolean
  /** Batasi eksekusi agent run (tidak boleh buat agent chain panjang) */
  allow_agent_runs: boolean
  /** Hanya eksekusi satu package/module per session */
  single_package_focus: boolean
  /** Estimasi credit budget session ini (dalam USD) */
  estimated_credit_budget_usd?: number
  /** Catatan tambahan soal cost control */
  notes?: string
}

// =============================================================================
// SCOPE
// Mendefinisikan batasan IN-SCOPE dan OUT-OF-SCOPE
// =============================================================================

/** Satu item scope dengan deskripsi dan alasan */
export interface ScopeItem {
  item: string
  rationale?: string
}

/** Definisi scope penuh untuk sebuah session */
export interface PromptScope {
  /** Apa saja yang BOLEH dikerjakan */
  in_scope: ScopeItem[] | string[]
  /** Apa saja yang DILARANG dikerjakan */
  out_of_scope: ScopeItem[] | string[]
  /** Package/module/folder yang BOLEH disentuh */
  allowed_paths?: string[]
  /** Package/module/folder yang TIDAK BOLEH disentuh */
  forbidden_paths?: string[]
}

// =============================================================================
// BLOCKERS
// =============================================================================

/** Satu blocker item yang mencegah session selesai */
export interface PromptBlocker {
  id: string                    // e.g. "BLOCKER-2E-01"
  description: string           // Apa yang memblokir
  severity: Priority            // Seberapa parah
  workaround?: string           // Apakah ada workaround sementara
  resolution_required_before?: string // Session/task yang perlu resolve ini dulu
}

// =============================================================================
// ACCEPTANCE CRITERIA
// =============================================================================

/** Satu item acceptance criteria */
export interface AcceptanceCriterion {
  id: string                    // e.g. "AC-01", "AC-2E-01"
  description: string           // Kriteria yang harus dipenuhi
  verification_method?: string  // Cara verify (curl, tsc, manual check, dll)
  status?: 'pass' | 'fail' | 'skip' | 'pending'
  notes?: string
}

// =============================================================================
// OUTPUTS
// =============================================================================

/** Satu mandatory output yang harus dihasilkan session */
export interface MandatoryOutput {
  id: string                    // e.g. "OUT-01"
  description: string           // Apa yang harus dihasilkan
  output_type: 'file' | 'migration' | 'document' | 'api-route' | 'type-export' | 'test' | 'other'
  path?: string                 // Path file/folder jika relevan
  status?: 'done' | 'partial' | 'missing'
}

// =============================================================================
// REPORT FORMAT
// Format output laporan yang WAJIB dari AI dev
// =============================================================================

/** Template field untuk session report */
export interface ReportFormat {
  /** Nama task yang dikerjakan */
  task: string
  /** Status akhir: DONE / IN PROGRESS / BLOCKED / PARTIAL */
  status: ContractStatus
  /** Daftar output yang dihasilkan */
  outputs: string[]
  /** Daftar file/modul yang disentuh */
  files_touched: string[]
  /** Command untuk test/validasi output */
  test_commands?: string[]
  /** Status per acceptance criteria */
  acceptance_criteria_status: Array<{
    id: string
    description: string
    status: 'pass' | 'fail' | 'skip' | 'pending'
  }>
  /** Blocker yang ditemukan (jika ada) */
  blockers?: PromptBlocker[]
  /** Keputusan arsitektur yang dibuat */
  decisions_made?: string[]
  /** Rekomendasi next step */
  next_step: string
}

// =============================================================================
// MANDATORY CONTEXT
// Dokumen/sumber yang WAJIB dibaca sebelum eksekusi
// =============================================================================

/** Satu item mandatory context */
export interface MandatoryContextItem {
  source: string        // Nama file / package / session
  path?: string         // Path jika ada
  reason: string        // Kenapa ini wajib dibaca
}

// =============================================================================
// GOVERNANCE NOTES
// Catatan governance, ADR, dan keputusan
// =============================================================================

/** Catatan governance per session */
export interface GovernanceNote {
  type: 'adr' | 'constraint' | 'decision' | 'note'
  id?: string           // e.g. "ADR-005"
  content: string
  created_at?: ISODateString
}

// =============================================================================
// PROMPT CONTRACT — CORE MODEL
// Model utama yang mendefinisikan satu session/task prompt contract
// =============================================================================

/** Full typed Prompt Contract — model utama @sovereign/prompt-contracts */
export interface PromptContract {
  // --- Identity ---
  /** Nama session, e.g. "Session 2e: @sovereign/prompt-contracts Foundation" */
  session_name: string
  /** Session ID pendek untuk referensi, e.g. "2e", "3a" */
  session_id: string
  /** Phase migrasi, e.g. "phase-2" */
  phase: SovereignPhase
  /** Tipe session */
  session_type: SessionType
  /** Target repo GitHub URL */
  target_repo: string
  /** Versi contract ini */
  contract_version?: string

  // --- Role & Context ---
  /** Instruksi role untuk AI dev */
  role: string
  /** Deskripsi misi session ini */
  mission: string
  /** Objective utama — ringkasan singkat tujuan */
  objective: string

  // --- Context ---
  /** Daftar dokumen/package/session yang WAJIB dibaca sebelum eksekusi */
  mandatory_context: MandatoryContextItem[]

  // --- Scope ---
  /** Definisi scope: in-scope dan out-of-scope */
  scope: PromptScope

  // --- Tasks ---
  /** Instruksi task yang harus dikerjakan (urutan penting) */
  task_instructions: string[]

  // --- Design Requirements ---
  /** Design requirements / technical constraints */
  design_requirements?: string[]

  // --- Blockers ---
  /** Blocker yang diketahui sebelum/saat eksekusi */
  blockers?: PromptBlocker[]

  // --- Outputs ---
  /** Output wajib yang harus dihasilkan */
  mandatory_outputs: MandatoryOutput[]

  // --- Acceptance Criteria ---
  /** Acceptance criteria yang harus di-pass */
  acceptance_criteria: AcceptanceCriterion[]

  // --- Report Format ---
  /** Format laporan yang diharapkan dari AI dev */
  report_format: ReportFormat

  // --- Governance ---
  /** Human gate level — apakah perlu approval founder sebelum action */
  human_gate: HumanGateLevel
  /** Rules untuk mengontrol cost dan scope session */
  cost_control: CostControlRules
  /** Catatan governance, ADR references */
  governance_notes?: GovernanceNote[]

  // --- Next Step ---
  /** Rekomendasi session/task berikutnya setelah ini selesai */
  next_step_hint?: string

  // --- Metadata ---
  /** Tanggal contract dibuat */
  created_at?: ISODateString
  /** Author (biasanya "Haidar Faras Maulia" atau "AI Dev") */
  author?: string
}

// =============================================================================
// DEFINITION OF DONE
// Kriteria akhir sebuah session dianggap DONE
// =============================================================================

/** Definisi "done" untuk sebuah session */
export interface DefinitionOfDone {
  /** Semua kriteria yang harus dipenuhi agar session dianggap selesai */
  criteria: string[]
  /** Final guardrail — hal yang TIDAK boleh dilakukan */
  guardrails: string[]
}
