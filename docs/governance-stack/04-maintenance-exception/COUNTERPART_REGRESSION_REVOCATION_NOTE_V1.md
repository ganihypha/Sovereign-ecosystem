# COUNTERPART REGRESSION / REVOCATION NOTE v1

**Version:** 1.0  
**Status:** Official Canonical Template  
**Classification:** Strictly Private / Founder-Side Governance  
**Document Type:** Corrective Action Template — Regression and Revocation  
**Scope:** Template untuk mendokumentasikan penurunan level, pembekuan akses, atau pencabutan permanen counterpart

**Ref Induk:** IMPERIAL_COUNTERPART_PROTOCOL_V1  
**Ref Pendukung:** COUNTERPART_REVIEW_CHECKPOINT_NOTE_V1, PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1  
**Ref Turunan:** COUNTERPART_STATUS_CHANGE_LOG_V1

---

## Instruksi Penggunaan

Note ini dibuat ketika Founder memutuskan untuk menurunkan level, membekukan akses, atau mencabut akses counterpart secara permanen. Dokumen ini berfungsi sebagai catatan corrective action dan bagian dari governance audit trail.

---

## REGRESSION / REVOCATION NOTE

### Nomor Note
**RR-[YYYY]-[NNN]**  
Contoh: RR-2026-001

### Tanggal
[YYYY-MM-DD]

### Jenis Tindakan

| Jenis | Pilih |
|---|---|
| **De-escalation** — penurunan level | [ ] |
| **Suspension** — pembekuan sementara | [ ] |
| **Revocation** — pencabutan permanen | [ ] |

### Subyek

| Field | Isi |
|---|---|
| **Nama Counterpart** | [isi] |
| **Level sebelum tindakan** | [C0-C5] |
| **Level setelah tindakan** | [C0-C5] |

---

### Trigger / Alasan

[Jelaskan apa yang memicu tindakan ini. Harus spesifik dan merujuk pada fakta.]

**Trigger categories** (tandai yang berlaku):

| Trigger | Berlaku? |
|---|---|
| Pelanggaran secret hygiene | [ ] |
| Role collapse | [ ] |
| Scope drift oleh counterpart | [ ] |
| Status claim tanpa proof | [ ] |
| Boundary violation | [ ] |
| Trust rhythm breakdown | [ ] |
| Counterpart fit berubah | [ ] |
| Governance boundary dilanggar | [ ] |
| Permintaan Founder (tanpa pelanggaran) | [ ] |
| Hasil checkpoint review | [ ] |
| Lainnya: [jelaskan] | [ ] |

---

### Bukti / Evidence

[Sebutkan bukti yang mendukung tindakan ini. Contoh: log, catatan checkpoint, observasi langsung, atau dokumen terkait.]

| No | Bukti | Sumber | Tanggal |
|---|---|---|---|
| 1 | [deskripsi bukti] | [sumber] | [YYYY-MM-DD] |
| 2 | [deskripsi bukti] | [sumber] | [YYYY-MM-DD] |

---

### Tindakan yang Diambil

#### Langkah Immediate (dalam 24 jam)

| No | Tindakan | Status |
|---|---|---|
| 1 | Suspend privileged access | [ ] Done |
| 2 | Freeze status promotion/closeout | [ ] Done |
| 3 | Notify counterpart (jika berlaku) | [ ] Done |

#### Langkah Follow-up (dalam 7 hari)

| No | Tindakan | Status |
|---|---|---|
| 4 | Audit lane dan log terkait | [ ] Done |
| 5 | Rotate secrets bila diperlukan | [ ] Done / N/A |
| 6 | Update COUNTERPART_LEVEL_ASSIGNMENT_RECORD_V1 | [ ] Done |
| 7 | Update COUNTERPART_STATUS_CHANGE_LOG_V1 | [ ] Done |

---

### Keputusan Formal

| Field | Isi |
|---|---|
| **Keputusan** | [DE-ESCALATED / SUSPENDED / REVOKED] |
| **Level baru** | [C0-C5] |
| **Efektif sejak** | [YYYY-MM-DD] |
| **Durasi** | [permanen / sampai YYYY-MM-DD / sampai review] |

### Kondisi Pemulihan (untuk Suspension)

[Jika tindakan adalah Suspension, jelaskan apa yang harus terjadi agar akses dapat dipulihkan.]

| Kondisi | Deskripsi |
|---|---|
| 1 | [kondisi pemulihan] |
| 2 | [kondisi pemulihan] |

**Evaluasi pemulihan dijadwalkan:** [YYYY-MM-DD atau "tidak dijadwalkan"]

### Kondisi Finality (untuk Revocation)

[Jika tindakan adalah Revocation, tegaskan bahwa ini bersifat permanen.]

- Revocation bersifat **final** kecuali Founder secara eksplisit membuat Decision Note baru untuk reactivation.
- Semua privilege yang tercatat di IMPERIAL_COUNTERPART_PRIVILEGE_MATRIX_V1 dikembalikan ke N (None).
- Dossier counterpart diarsipkan.

---

### Tanda Tangan

| Field | Isi |
|---|---|
| **Pembuat keputusan** | [Founder] |
| **Tanggal** | [YYYY-MM-DD] |

---

## Catatan Penting

1. Note ini bersifat **confidential** dan merupakan bagian dari governance audit trail.
2. Note tidak boleh dihapus atau dimodifikasi setelah ditandatangani. Koreksi dilakukan melalui Note baru.
3. Untuk Revocation, seluruh privilege harus di-reset ke C0 tanpa pengecualian.
4. Untuk Suspension, harus ada jadwal evaluasi pemulihan yang jelas.

---

*Governance Canon v1 — Counterpart Regression / Revocation Note*
