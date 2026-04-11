# PRIVATE CHAIR MAINTENANCE CHECKLIST v1

**Version:** 1.0
**Status:** Official Canonical Draft
**Classification:** Strictly Private / Founder-Side Governance
**Document Type:** Maintenance Checklist
**Scope:** Checklist berkala untuk menjaga governance health, access integrity, drift prevention, dan canon integrity

**Ref Induk:** PRIVATE_CHAIR_REVIEW_CADENCE_V1
**Ref Pendukung:** PRIVATE_CHAIR_OPS_RUNBOOK_V1, CHAMBER_TO_TOWER_INTEGRATION_MAP_V1
**Ref Turunan:** (tidak ada)

---

## 1. Purpose

Checklist ini adalah instrumen maintenance berkala. Digunakan saat melakukan Governance Health Review (setiap 30 hari). Tujuannya: memastikan seluruh governance stack dalam kondisi sehat, boundary tidak bocor, dan tidak ada drift yang tidak terdeteksi.

---

## 2. Canon Integrity Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Semua 13 canon files masih ada di `docs/governance-stack/`? | ☐ | |
| 2.2 | Canon Register (`00-canon/`) masih accurate? | ☐ | |
| 2.3 | Naming convention UPPER_SNAKE_CASE + V1 masih konsisten? | ☐ | |
| 2.4 | Cross-references antar dokumen masih valid (no broken refs)? | ☐ | |
| 2.5 | Tidak ada dokumen liar di luar canon register? | ☐ | |
| 2.6 | Ops docs (folder 05-ops/) masih sesuai dengan canon? | ☐ | |

---

## 3. Boundary Integrity Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | Private Chair tetap private (tidak berubah jadi brand/product)? | ☐ | |
| 3.2 | Tower tetap substrate (tidak berubah jadi governance seat)? | ☐ | |
| 3.3 | BarberKas tetap product lane (tidak tercampur governance)? | ☐ | |
| 3.4 | Counterpart access tetap bounded dan earned? | ☐ | |
| 3.5 | Tidak ada lane mixing antara governance dan product? | ☐ | |
| 3.6 | Doctrine frozen — tidak ada modifikasi tanpa formal process? | ☐ | |

---

## 4. Living Docs Health Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | `current-handoff.md` reflects latest session state? | ☐ | |
| 4.2 | `active-priority.md` reflects current blockers? | ☐ | |
| 4.3 | `founder-brain.md` masih accurate? | ☐ | |
| 4.4 | Session summaries up-to-date? | ☐ | |
| 4.5 | Tidak ada drift > 1 session antara docs dan repo? | ☐ | |

---

## 5. Access & Credential Health Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Credential status masih accurate (available/blocked/founder-only)? | ☐ | |
| 5.2 | Tidak ada credential yang bocor ke public? | ☐ | |
| 5.3 | `.dev.vars` dan `.env` di-gitignore? | ☐ | |
| 5.4 | Cloudflare secrets masih correct? | ☐ | |
| 5.5 | Counterpart access level masih sesuai LEVEL_ASSIGNMENT_RECORD? | ☐ | |
| 5.6 | Tidak ada access yang diberikan tanpa dicatat? | ☐ | |

---

## 6. Tower Substrate Health Check

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.1 | `GET /health` returns correct `build_session`? | ☐ | |
| 6.2 | `GET /api/wa/status` — `is_ready_to_send: true`? | ☐ | |
| 6.3 | Approval queue functional (`GET /api/wa/queue`)? | ☐ | |
| 6.4 | Audit trail endpoint working (`GET /api/wa/audit/:id`)? | ☐ | |
| 6.5 | Founder Dashboard Lite accessible (`GET /dashboard`)? | ☐ | |
| 6.6 | Migration state matches current schema? | ☐ | |

---

## 7. Counterpart State Check (if any active)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | Current counterpart level? | ☐ | C0/C1/C2/C3/C4/C5 |
| 7.2 | Last checkpoint review date? | ☐ | |
| 7.3 | Any pending level change? | ☐ | |
| 7.4 | Any anomaly or red flag? | ☐ | |
| 7.5 | STATUS_CHANGE_LOG up-to-date? | ☐ | |

---

## 8. Maintenance Result

| Field | Value |
|-------|-------|
| **Date** | ________________ |
| **Performed by** | Founder |
| **Overall status** | ☐ HEALTHY / ☐ NEEDS PATCH / ☐ NEEDS ESCALATION |
| **Issues found** | ________________ |
| **Actions taken** | ________________ |
| **Next scheduled maintenance** | ________________ |

---

## 9. Official Use Rule

Checklist ini wajib diisi setiap 30 hari saat Governance Health Review. Jika ada section yang gagal (NEEDS PATCH atau NEEDS ESCALATION), catat di maintenance result dan tindak lanjuti sebelum review berikutnya. Jangan biarkan checklist ini menjadi formalitas tanpa isi.

---

*Governance Canon v1 — Private Chair Maintenance Checklist*
*"Governance that is never maintained is governance that is already dying."*
