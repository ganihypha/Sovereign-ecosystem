# PRIVATE CHAIR OPS RUNBOOK v1

**Version:** 1.0
**Status:** Official Canonical Draft
**Classification:** Strictly Private / Founder-Side Governance
**Document Type:** Operational Runbook
**Scope:** Panduan operasional untuk menjalankan Private Chair Chamber menggunakan Sovereign Tower sebagai control substrate

**Ref Induk:** PRIVATE_CHAIR_CHAMBER_ARCHITECTURE_V1
**Ref Pendukung:** PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1, CHAMBER_TO_TOWER_INTEGRATION_MAP_V1
**Ref Turunan:** PRIVATE_CHAIR_REVIEW_CADENCE_V1, PRIVATE_CHAIR_MAINTENANCE_CHECKLIST_V1

---

## 1. Purpose

Dokumen ini adalah panduan operasional untuk menjalankan Private Chair Chamber di atas Sovereign Tower infrastructure. Bukan doctrine tambahan, melainkan petunjuk pelaksanaan: kapan membuka chamber, apa yang perlu diperiksa, bagaimana menjalankan review/approval/audit, dan bagaimana menjaga boundary antara governance ops dan product execution.

---

## 2. Chamber Operating Model

Private Chair Chamber **tidak beroperasi secara publik**. Chamber aktif saat Founder:
- Menjalankan approval/rejection terhadap queued items
- Melakukan review berkala terhadap counterpart state
- Mengaudit proof dan lifecycle summary
- Memeriksa governance health dan boundary integrity
- Menentukan arah strategis dan exception handling

Chamber **bukan** tempat coding, deploy, atau issue handling harian. Itu adalah territory Tower (control substrate) dan L3 (execution).

---

## 3. Daily/Regular Ops Checklist

### 3.1 Approval Queue Review
**Frekuensi:** Sesuai kebutuhan (ketika ada item pending)
**Tool:** Sovereign Tower — `/api/wa/queue` atau `/dashboard`

| Step | Action | Tool |
|------|--------|------|
| 1 | Buka Founder Dashboard Lite | `GET /dashboard` |
| 2 | Periksa pending approval queue | Dashboard → Pending section |
| 3 | Review setiap item: konten, target, konteks | Item detail |
| 4 | Approve atau Reject dengan alasan | `POST /api/wa/queue/:id/approve` atau `reject` |
| 5 | Jika approved, trigger send | `POST /api/agents/send-approved/:id` |
| 6 | Verifikasi delivery status | Check `wa_logs` via dashboard/audit |

### 3.2 Audit Trail Review
**Frekuensi:** Per keputusan penting, atau mingguan
**Tool:** `GET /api/wa/audit/:id`

| Step | Action |
|------|--------|
| 1 | Pilih item yang membutuhkan audit trail review |
| 2 | Query lifecycle audit endpoint |
| 3 | Verifikasi: apakah status transitions benar? |
| 4 | Verifikasi: apakah rejection_reason tercatat? |
| 5 | Verifikasi: apakah timestamps konsisten? |
| 6 | Catat anomali jika ditemukan |

### 3.3 System Health Check
**Frekuensi:** Saat membuka chamber session
**Tool:** `GET /health` + `GET /api/wa/status`

| Check | Expected |
|-------|----------|
| `build_session` | Sesuai session terakhir yang verified |
| `is_ready_to_send` | `true` |
| `fonnte_env_report` | Semua tokens present |
| `pending_approval_count` | Diketahui (bukan error) |

---

## 4. Counterpart Review Ops

### 4.1 Kapan Review Dilakukan
Lihat PRIVATE_CHAIR_REVIEW_CADENCE_V1 untuk jadwal lengkap. Secara umum:
- **Checkpoint review** setiap 30 hari jika counterpart level ≥ C2
- **Ad-hoc review** jika ada anomali, drift, atau trigger event
- **Regression review** jika ada pelanggaran atau trust breakdown

### 4.2 Review Flow
```
Trigger → Founder opens COUNTERPART_REVIEW_CHECKPOINT_NOTE_V1 template
→ Fill: evidence, observations, recommendation
→ Decision: maintain / promote / hold / regress
→ If regress: open COUNTERPART_REGRESSION_REVOCATION_NOTE_V1
→ Update COUNTERPART_LEVEL_ASSIGNMENT_RECORD_V1
→ Update COUNTERPART_STATUS_CHANGE_LOG_V1
```

### 4.3 Revocation Flow
```
Trigger (violation detected)
→ Immediate: suspend privileged access
→ Freeze status promotion
→ Audit lane & logs
→ Rotate sensitive credentials jika perlu
→ Founder issues final decision via COUNTERPART_REGRESSION_REVOCATION_NOTE_V1
→ Update all registers
```

---

## 5. Exception Handling

### 5.1 Exception Classes
Merujuk PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1 Section 12:

| Class | Action |
|-------|--------|
| **Proceed** | Lanjut, akses cukup, scope jelas |
| **Proceed With Limitations** | Lanjut, tapi domain tertentu dibatasi |
| **Blocked Pending Manual Injection** | Tunggu tindakan Founder (credential injection, dll) |
| **Push-Ready After Manual Injection** | Semua siap kecuali credential — lanjut setelah Founder inject |

### 5.2 Eskalasi
- L3 tidak bisa resolve → eskalasi ke L2
- L2 tidak bisa resolve → eskalasi ke L1 (Chamber)
- L1 membutuhkan final authority → eskalasi ke L0 (Founder Sovereignty)
- Counterpart TIDAK bisa meng-override eskalasi ke L0

---

## 6. Truth Sync Ops

### 6.1 Source-of-Truth Order
1. `current-handoff.md`
2. `active-priority.md`
3. `founder-brain.md`
4. Verified closeout / session summary
5. Repository state
6. Deployment state

### 6.2 Drift Detection
Jika realitas teknis dan living docs tidak sinkron:
1. Identifikasi mana yang lebih baru
2. Jika repo lebih baru → update living docs
3. Jika living docs lebih baru → verify repo matches
4. Catat drift di maintenance log
5. Jangan biarkan drift bertahan lebih dari 1 session

---

## 7. Hard Boundaries

| Boundary | Rule |
|----------|------|
| Chamber ≠ Tower | Tower = substrate; Chamber = governance seat |
| Chamber ≠ Product | BarberKas = product lane; Chamber = governance |
| Approval ≠ Send | Approval is clear gate, not auto-execution |
| Verified ≠ Claimed | Proof must exist before status promotion |
| Counterpart access ≠ Founder access | Counterpart earned, bounded, revocable |
| Doctrine ≠ Ops | Canon frozen; ops is execution of frozen canon |

---

## 8. Official Use Rule

Runbook ini boleh digunakan langsung sebagai panduan operasional. Jika ada konflik antara runbook dan doctrine canon, **doctrine canon menang**. Runbook adalah turunan operational dari canon — bukan pengganti.

---

*Governance Canon v1 — Private Chair Ops Runbook*
*"Chamber operates on proof and boundary, not on assumption and expansion."*
