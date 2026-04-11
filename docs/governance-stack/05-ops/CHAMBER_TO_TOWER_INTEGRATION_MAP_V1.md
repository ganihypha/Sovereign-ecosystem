# CHAMBER TO TOWER INTEGRATION MAP v1

**Version:** 1.0
**Status:** Official Canonical Draft
**Classification:** Strictly Private / Founder-Side Governance
**Document Type:** Integration Map / Operational Mapping
**Scope:** Mapping eksplisit antara Private Chair Chamber ops dan Sovereign Tower routes/endpoints

**Ref Induk:** PRIVATE_CHAIR_CHAMBER_ARCHITECTURE_V1
**Ref Pendukung:** PRIVATE_CHAIR_OPS_RUNBOOK_V1, PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1
**Ref Turunan:** (tidak ada)

---

## 1. Purpose

Dokumen ini memetakan secara eksplisit bagaimana Private Chair Chamber menggunakan Sovereign Tower sebagai control substrate. Tujuannya: jangan sampai Chamber ops "mengambang" tanpa koneksi ke sistem nyata, dan jangan sampai Tower dipakai di luar boundary yang sah.

---

## 2. Architectural Relationship

```
┌─────────────────────────────────────────────┐
│  L0 — FOUNDER SOVEREIGNTY                   │
│  Final authority, revocation, override       │
├─────────────────────────────────────────────┤
│  L1 — PRIVATE CHAIR CHAMBER                 │
│  Governance decisions, approval law          │
│  Strategic direction, boundary enforcement   │
├─────────────────────────────────────────────┤
│  L1.5 — COUNTERPART LAYER (if activated)    │
│  Earned access, bounded influence            │
├─────────────────────────────────────────────┤
│  L2 — ORCHESTRATION (via Tower substrate)   │
│  Scope lock, readiness gate, truth sync     │
├─────────────────────────────────────────────┤
│  L3 — EXECUTION (via Tower routes)          │
│  Build, deploy, test, return proof          │
├─────────────────────────────────────────────┤
│  L4 — AUDIT & MEMORY (via Tower audit)      │
│  Logs, lifecycle, proof packs, truth reg    │
└─────────────────────────────────────────────┘
```

---

## 3. Chamber Ops → Tower Route Mapping

### 3.1 Authority Actions (L1 → Tower)

| Chamber Op | Tower Route | Method | Purpose |
|-----------|-------------|--------|---------|
| **Approve queued item** | `/api/wa/queue/:id/approve` | POST | Founder approval → status `approved` |
| **Reject queued item** | `/api/wa/queue/:id/reject` | POST | Founder rejection + reason → `rejected_by_founder` |
| **Execute approved send** | `/api/agents/send-approved/:id` | POST | Trigger send after approval gate cleared |

### 3.2 Visibility Actions (L1 reads from Tower)

| Chamber Op | Tower Route | Method | Purpose |
|-----------|-------------|--------|---------|
| **View approval queue** | `/api/wa/queue` | GET | See pending + approved items |
| **View audit trail** | `/api/wa/audit/:id` | GET | Full lifecycle history per item |
| **View system health** | `/health` | GET | Build session, system status |
| **View WA status** | `/api/wa/status` | GET | Token status, pending count, env report |
| **View dashboard** | `/dashboard` | GET | Founder Dashboard Lite (HTML) |
| **View dashboard data** | `/api/dashboard/wa` | GET | Dashboard JSON feed |
| **View today overview** | `/api/dashboard/today` | GET | Aggregated daily metrics |

### 3.3 Execution Routes (L3 — Tower executes for Chamber)

| Tower Route | Method | Chamber Relevance |
|-------------|--------|-------------------|
| `/api/agents/scout-score` | POST | L3 execution — score lead |
| `/api/agents/scout-score/batch` | POST | L3 execution — batch score |
| `/api/agents/insights` | POST | L3 execution — generate insights |
| `/api/agents/compose-message` | POST | L3 execution — compose WA message |
| `/api/wa/webhook` | POST | L3 inbound — receive WA webhook |
| `/api/wa/broadcast` | POST | L3 execution — gated broadcast |

---

## 4. Governance State Machine (Tower Implementation)

```
PENDING → APPROVED → SENT → DELIVERED
            │
            └→ REJECTED_BY_FOUNDER (with rejection_reason + rejected_at)
```

| State Transition | Tower Function | Chamber Meaning |
|-----------------|----------------|-----------------|
| `pending → approved` | `approveQueueItem()` | Founder clears the gate |
| `pending → rejected_by_founder` | `rejectQueueItem()` | Founder blocks with reason |
| `approved → sent` | `send-approved` route | Execution after approval |
| `sent → delivered` | Fontte callback/confirmation | Proof of delivery |

---

## 5. Counterpart Visibility Mapping

Jika counterpart diaktifkan di masa depan (level ≥ C2), visibility harus di-gate:

| Domain | Counterpart Access | Tower Implementation |
|--------|-------------------|---------------------|
| Approval queue | View only (no approve/reject) | Dashboard read-only view |
| Audit trail | View only | `/api/wa/audit/:id` read |
| System health | View only | `/health` + `/api/wa/status` read |
| Raw secrets | NONE | Not exposed in any route |
| Rejection reasons | View only | Included in audit trail |
| Send execution | NONE | Founder-only action |
| Deploy trigger | NONE | Not a Tower route function |

---

## 6. Proof Flow Architecture

```
L3 (Execution)     →  Produces proof (delivery confirmation, log entries)
        ↓
L4 (Audit/Memory)  →  Captures proof (wa_logs, audit trail, lifecycle)
        ↓
L2 (Orchestration)  →  Validates completeness (scope check, proof check)
        ↓
L1/L0 (Chamber)    →  Acknowledges status (VERIFIED / CLOSED)
```

### Tower Routes in Proof Flow

| Proof Step | Tower Route | Data |
|-----------|-------------|------|
| Execution result | (in wa_logs after send) | fonnte_message_id, sent_at, status |
| Audit capture | `GET /api/wa/audit/:id` | lifecycle_summary, timestamps |
| Lifecycle check | `GET /api/wa/queue` with filter | summary object, counts |
| Founder visibility | `GET /dashboard` | Visual proof in dashboard |

---

## 7. Secret/Credential Boundary

| Secret | Chamber Access | Tower Access | Notes |
|--------|---------------|--------------|-------|
| JWT_SECRET | Founder custody | Runtime use | Founder generates JWT, Tower validates |
| FONNTE_DEVICE_TOKEN | Status-only | Runtime use | Tower uses for send, Chamber sees status |
| FONNTE_ACCOUNT_TOKEN | Status-only | Runtime use | Tower uses for management calls |
| SUPABASE_SERVICE_ROLE_KEY | NONE | Runtime use | Tower accesses DB, Chamber sees results |
| GROQ_API_KEY | NONE | Runtime use | Tower runs AI agents, Chamber sees output |

---

## 8. Anti-Mixing Rules

| Rule | Explanation |
|------|-------------|
| Tower does NOT become Chamber | Tower serves approval/audit/visibility, but governance decisions are Chamber's domain |
| Chamber does NOT execute | Chamber approves/rejects/reviews; L3 executes via Tower routes |
| Dashboard is NOT the Chamber | Dashboard is a visibility tool; Chamber is a governance seat |
| API routes are NOT governance docs | Routes implement governance; docs define governance |
| Product routes stay separate | BarberKas routes (future) must NOT be mixed with governance routes |

---

## 9. Official Use Rule

Gunakan mapping ini sebagai referensi operasional saat menjalankan Chamber ops. Jika ada perubahan pada Tower routes (new routes, route deprecation, schema changes), mapping ini harus di-update. Jika Tower route bertentangan dengan Chamber doctrine, **doctrine menang, route harus diperbaiki**.

---

*Governance Canon v1 — Chamber to Tower Integration Map*
*"Tower serves Chamber; Chamber governs Tower. Neither replaces the other."*
