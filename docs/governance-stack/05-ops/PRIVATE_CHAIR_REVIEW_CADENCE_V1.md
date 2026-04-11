# PRIVATE CHAIR REVIEW CADENCE v1

**Version:** 1.0
**Status:** Official Canonical Draft
**Classification:** Strictly Private / Founder-Side Governance
**Document Type:** Review Schedule / Cadence Protocol
**Scope:** Jadwal dan ritme review berkala untuk Private Chair Chamber operations

**Ref Induk:** PRIVATE_CHAIR_OPS_RUNBOOK_V1
**Ref Pendukung:** IMPERIAL_COUNTERPART_PROTOCOL_V1, COUNTERPART_REVIEW_CHECKPOINT_NOTE_V1
**Ref Turunan:** (tidak ada)

---

## 1. Purpose

Dokumen ini menetapkan kapan dan bagaimana review dilakukan di dalam orbit Private Chair Chamber. Tanpa cadence yang jelas, governance berisiko menjadi reaktif — hanya aktif saat ada masalah. Review cadence memastikan Chamber berfungsi sebagai sistem yang hidup, bukan arsip pasif.

---

## 2. Review Types

### 2.1 Truth Sync Review
**Purpose:** Memastikan living docs, repo state, dan deployment state tidak drift.
**Frekuensi:** Setiap session baru atau setiap 7 hari (mana yang lebih dulu).

| Check | Action |
|-------|--------|
| current-handoff.md reflects latest session? | Update jika drift |
| active-priority.md reflects current blockers? | Update jika drift |
| founder-brain.md still accurate? | Patch jika ada perubahan prioritas |
| Deployment state matches handoff? | Verify `build_session` |
| Repo push status accurate? | Verify latest commit pushed |

### 2.2 Governance Health Review
**Purpose:** Memastikan governance canon masih intact, boundary tidak bocor, dan ops berjalan sesuai doctrine.
**Frekuensi:** Setiap 30 hari.

| Check | Action |
|-------|--------|
| Canon files masih 13 dan intact? | Verify checksums |
| Naming convention masih konsisten? | Spot check |
| Cross-references masih valid? | Spot check |
| Ada drift antara doctrine dan operasi? | Audit dan catat |
| Ada lane mixing? | Cek boundary integrity |
| Tower routes masih sesuai integration map? | Verify mapping |

### 2.3 Counterpart Checkpoint Review
**Purpose:** Mengevaluasi state, fitness, dan alignment counterpart (jika aktif).
**Frekuensi:** Setiap 30 hari jika level ≥ C2; setiap 90 hari jika C0-C1.
**Template:** COUNTERPART_REVIEW_CHECKPOINT_NOTE_V1

| Evaluation Area | Criteria |
|----------------|----------|
| Fit | Apakah counterpart fit masih selaras? |
| Rhythm | Apakah shared rhythm terjaga? |
| Trust | Apakah trust markers bertambah atau berkurang? |
| Boundary | Apakah counterpart menghormati boundary? |
| Contribution | Apakah ada kontribusi nyata pada arah/nilai/ritme? |
| Red flags | Apakah ada anomali, pelanggaran, atau drift? |

### 2.4 Access Audit Review
**Purpose:** Memastikan akses yang diberikan masih sesuai dengan kebutuhan dan level.
**Frekuensi:** Setiap 60 hari, atau setelah setiap level change.

| Check | Action |
|-------|--------|
| Counterpart access level masih accurate? | Verify di COUNTERPART_LEVEL_ASSIGNMENT_RECORD_V1 |
| Ada privilege yang sudah tidak relevan? | Revoke atau downgrade |
| Ada access yang diberikan tapi belum dicatat? | Formalize dan catat |
| Secret/credential hygiene terjaga? | Verify — no leaks, no guessing |

### 2.5 Emergency/Ad-Hoc Review
**Purpose:** Triggered oleh event luar biasa.
**Frekuensi:** Saat trigger terjadi (tidak terjadwal).

| Trigger | Action |
|---------|--------|
| Secret leak atau suspicion | Immediate access suspension + credential rotation |
| Trust breakdown | Immediate regression review |
| Major system failure | Truth sync + impact assessment |
| Boundary violation | Audit + escalation ke L0 |
| Counterpart misconduct | Regression/revocation protocol |

---

## 3. Cadence Calendar Summary

| Review Type | Frequency | Owner | Template |
|-------------|-----------|-------|----------|
| Truth Sync | Per session / 7 days | Founder + L2 | No template — checklist in runbook |
| Governance Health | 30 days | Founder | PRIVATE_CHAIR_MAINTENANCE_CHECKLIST_V1 |
| Counterpart Checkpoint | 30 days (C2+) / 90 days (C0-C1) | Founder | COUNTERPART_REVIEW_CHECKPOINT_NOTE_V1 |
| Access Audit | 60 days / per level change | Founder | Part of checkpoint |
| Emergency | On trigger | Founder (L0) | COUNTERPART_REGRESSION_REVOCATION_NOTE_V1 |

---

## 4. Review Output Requirements

Setiap review harus menghasilkan salah satu dari:
1. **"Status maintained"** — tidak ada perubahan yang diperlukan
2. **"Patch applied"** — perubahan kecil dilakukan (drift fix, doc update)
3. **"Escalation required"** — masalah membutuhkan keputusan Founder-level
4. **"Level change"** — counterpart level naik atau turun
5. **"Revocation initiated"** — proses pencabutan akses dimulai

Output harus dicatat. Jangan biarkan review terjadi tanpa jejak.

---

## 5. Official Use Rule

Cadence ini adalah panduan minimum. Founder boleh melakukan review lebih sering. Founder tidak boleh melewatkan governance health review lebih dari 45 hari. Jika counterpart aktif (≥ C2), checkpoint review tidak boleh dilewatkan lebih dari 45 hari.

---

*Governance Canon v1 — Private Chair Review Cadence*
*"Governance that is never reviewed is governance that is already drifting."*
