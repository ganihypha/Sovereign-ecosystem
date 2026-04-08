# 32 – HUMAN APPROVAL & ESCALATION FLOW
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT INTERNAL FRAMEWORK
**Version:** 1.0 | **Tanggal:** 2026-04-05

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**

---

## 1. PURPOSE

Dokumen ini mendefinisikan:

1. **Kapan approval Founder wajib diperlukan** sebelum aksi dieksekusi
2. **Bagaimana Managing Strategist mengeskalasi** hal yang melampaui batas aksesnya
3. **Siapa yang memutuskan apa** dalam berbagai skenario operasional

Prinsip utama:
> *"Sensitive atau irreversible actions must remain human-gated."*
> — Sovereign Architecture Principles

---

## 2. APPROVAL TIERS

### Tier 0 — Auto-Approve (No Approval Needed)
Aksi yang aman dan reversibel, bisa dieksekusi langsung:

| Aksi | Siapa | Keterangan |
|------|-------|-----------|
| Baca dashboard operasional | Managing Strategist | Read-only, tidak ada efek |
| Update status lead | Managing Strategist | Reversibel |
| Tambah catatan ke onboarding | Managing Strategist | Reversibel |
| Kirim follow-up reminder (pre-approved template) | Managing Strategist | Dalam scope template yang sudah ada |
| Isi weekly review form | Managing Strategist | Living doc, tidak ada efek sistem |

---

### Tier 1 — Async Approval (Founder bisa approve dalam 24 jam)
Aksi yang berdampak moderat, perlu konfirmasi tapi tidak urgent:

| Aksi | Request Oleh | Approve Oleh | Channel |
|------|-------------|-------------|---------|
| Kirim WA ke lead baru (single, non-template) | Managing Strategist | Founder | Approval queue / WA |
| Tambah lead baru ke pipeline | Managing Strategist | Auto (jika dalam tier limit) | — |
| Ubah template WA yang sudah ada | Managing Strategist | Founder | Approval queue |
| Flag customer sebagai "perlu eskalasi" | Managing Strategist | Founder review | Approval queue |
| Approve onboarding customer baru | Managing Strategist | Founder (jika > Starter tier) | — |

---

### Tier 2 — Synchronous Approval (Founder harus aktif konfirmasi sebelum eksekusi)
Aksi yang berdampak signifikan atau berpotensi irreversibel:

| Aksi | Keterangan |
|------|-----------|
| WA broadcast ke > 5 penerima | Tidak boleh jalan tanpa konfirmasi aktif |
| Delete data customer / lead | Irreversibel — butuh konfirmasi eksplisit |
| Ubah pricing tier customer | Finansial — butuh Founder decision |
| Aktifkan fitur AI agent baru | Berpotensi menimbulkan biaya eksternal |
| Onboarding partner bisnis baru | Komitmen eksternal — Founder only |

---

### Tier 3 — Founder Only (Tidak bisa didelegasikan)
Aksi yang hanya boleh dilakukan langsung oleh Founder:

| Aksi | Alasan |
|------|--------|
| Deployment ke production | Sovereign infrastructure |
| DB schema change | Irreversibel, affects semua data |
| Rotate / update secrets / credentials | Security-critical |
| Ubah RBAC / assign role | Governance control |
| Approve profit-sharing atau partnership | Finansial dan legal |
| Override atau revert keputusan strategis | Canonical authority |

---

## 3. ESCALATION FLOW

### Kondisi yang harus dieskalasiakan ke Founder

Managing Strategist **wajib** eskalasi jika:

- [ ] Customer mengeluh serius dan tidak bisa diselesaikan di level operasional
- [ ] Ada potensi churn customer yang bisa berdampak finansial material
- [ ] Ada permintaan fitur / perubahan dari customer yang tidak ada di roadmap
- [ ] Ada data anomali yang mencurigakan (order tidak wajar, akses tidak normal)
- [ ] Ada kebutuhan mengirim pesan yang tidak sesuai template yang sudah di-approve
- [ ] Ada kebutuhan membuat komitmen atau janji kepada customer melebihi scope current tier
- [ ] Ada indikasi breach keamanan atau akses tidak sah

---

### Cara Eskalasi (Sementara — sampai sistem approval tersedia)

Sebelum platform approval flow diimplementasikan:

```
1. Buat catatan eskalasi di weekly review dengan tag [ESCALATE]:
   [ESCALATE] Customer X mengeluh tentang Y — butuh Founder input
   
2. Tambahkan ke blockers di 18-BUILD-SPRINT-LOG.md jika blocking

3. WA langsung ke Founder untuk hal yang time-sensitive
   Subject format: "[SOVEREIGN ESCALATION] — <ringkasan singkat>"

4. Catat keputusan Founder di 19-DECISION-LOG.md jika menghasilkan ADR baru
```

---

### Future Platform Approval Flow (Implementasi di Sovereign Tower)

```
Managing Strategist
    │
    ▼ (aksi butuh approval)
Submit approval_request ke /api/approvals/request
    │
    ▼
Approval queue disimpan di Supabase (tabel: approval_requests)
    │
    ▼
Founder terima notifikasi (WA atau dashboard alert)
    │
    ├── Approve → aksi dieksekusi, dicatat di audit log
    └── Reject  → aksi dibatalkan, Managing Strategist dapat notifikasi

Semua approval dicatat di audit_log dengan:
  - requested_by
  - action_type
  - payload_summary (bukan raw data sensitif)
  - approved_by
  - timestamp
  - decision (approved / rejected)
  - reason (opsional)
```

---

## 4. WA SEND APPROVAL GATE (Khusus Session 3f+)

WA routes yang sudah diaktifkan di Session 3f mengikuti aturan approval berikut:

| Route | Requires Approval | Default |
|-------|------------------|---------|
| `POST /api/wa/test` | `requires_approval: false` | Test ke nomor founder sendiri |
| `POST /api/wa/send` | `requires_approval: false` (single, founder-triggered) | Founder harus trigger |
| `POST /api/wa/broadcast` | `requires_approval: true` | **BELUM DIAKTIFKAN** |

**Prinsip Session 3f:**
- Semua send dilog ke `wa_logs` terlebih dahulu sebelum dikirim
- Status selalu honest: `CONFIRMED`, `ATTEMPTED_NOT_CONFIRMED`, `FAILED`, `REJECTED_BY_FOUNDER`
- Tidak ada auto-send loop tanpa trigger founder
- Broadcast tetap disabled sampai approval flow diimplementasikan

---

## 5. DECISION ESCALATION MATRIX

Matriks singkat untuk memutuskan siapa yang harus menangani situasi:

| Situasi | Level | Siapa Handle | Timeframe |
|---------|-------|-------------|-----------|
| Customer pertanyaan umum | Tier 0 | Managing Strategist | Segera |
| Customer complaint minor | Tier 0-1 | Managing Strategist → eskalasi jika perlu | < 24 jam |
| Customer minta fitur baru | Tier 2 | Eskalasi ke Founder | < 24 jam |
| Customer complaint serius / churn risk | Tier 2 | Eskalasi ke Founder | < 4 jam |
| Request WA broadcast | Tier 2 | Founder decision | Sebelum eksekusi |
| Data anomali / security concern | Tier 3 | Founder immediately | Segera |
| Deployment / infra issue | Tier 3 | Founder only | Segera |

---

## 6. LOGGING REQUIREMENTS

Semua aksi yang melewati approval flow harus dicatat dengan minimum:

```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "action_type": "wa_send | lead_update | ...",
  "requested_by": "role_name",
  "approval_tier": 0 | 1 | 2 | 3,
  "approved_by": "founder | auto",
  "status": "pending | approved | rejected | executed",
  "outcome": "success | failed | blocked",
  "note": "optional context"
}
```

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT INTERNAL FRAMEWORK |
| Dibuat | 2026-04-05 |
| Sumber distilasi | `doc.manahing.stratgst.1.1.1.1.q.1...txt` + `nw.prompt.fr.gmini.1.1.1.q.q.1.txt` |
| Dokumen Terkait | `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `31-RBAC-PERMISSION-MATRIX.md`, `evidence/architecture/ADR-012-wa-routes-activation.md` |
| Review | Saat approval flow platform diimplementasikan |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT INTERNAL FRAMEWORK — bukan dokumen legal atau perjanjian formal*
