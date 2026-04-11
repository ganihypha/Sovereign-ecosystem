# IMPERIAL COUNTERPART PRIVILEGE MATRIX v1

**Version:** 1.0  
**Status:** Official Canonical Draft  
**Classification:** Strictly Private / Founder-Side Governance  
**Document Type:** Privilege Matrix + Access Register  
**Scope:** Detail privilege per counterpart level per control domain

**Ref Induk:** IMPERIAL_COUNTERPART_PROTOCOL_V1  
**Ref Pendukung:** PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1, PRIVATE_CHAIR_CHAMBER_ARCHITECTURE_V1  
**Ref Turunan:** COUNTERPART_LEVEL_ASSIGNMENT_RECORD_V1

---

## 1. Purpose

Dokumen ini menjabarkan secara eksplisit hak dan batasan akses counterpart pada setiap level aktivasi (C0-C5) terhadap setiap control domain yang diatur dalam PRIVATE_CHAIR_ACCESS_CONTROL_SPEC_V1. Ini adalah turunan operasional dari IMPERIAL_COUNTERPART_PROTOCOL_V1 yang membakukan privilege menjadi tabel kontrol konkret.

---

## 2. Permission Legend

| Kode | Arti |
|---|---|
| **N** | None — tidak ada akses |
| **V** | View — hanya melihat |
| **C** | Comment — dapat memberi catatan tanpa mengubah status |
| **P** | Propose — dapat mengusulkan perubahan/keputusan |
| **A** | Approve — dapat memberi persetujuan formal (bounded) |
| **A*** | Approve dengan batasan — hanya pada area yang didelegasikan Founder |

---

## 3. Privilege Matrix: Counterpart Level vs Control Domain

### 3.1 Canonical Living Docs

| Level | Permission | Catatan |
|---|---|---|
| C0 | N | Tidak ada akses |
| C1 | N | Belum dibuka |
| C2 | V | View selected summaries |
| C3 | V/C | View + comment |
| C4 | V/C/P | View + comment + propose |
| C5 | V/C/P | Full counterpart view |

### 3.2 Private Chair Doctrine & Chamber Docs

| Level | Permission | Catatan |
|---|---|---|
| C0 | N | Tidak ada akses |
| C1 | N | Belum dibuka |
| C2 | V | View Charter dan Pact |
| C3 | V/C | View + comment pada Charter |
| C4 | V/C/P | Full view + propose amendments |
| C5 | V/C/P | Full counterpart access |

### 3.3 Session Truth Register

| Level | Permission | Catatan |
|---|---|---|
| C0 | N | Tidak ada akses |
| C1 | N | Belum dibuka |
| C2 | N | Truth register masih founder-only |
| C3 | V | View status summary |
| C4 | V/C | View + comment |
| C5 | V/C | View + comment (tidak boleh mengubah status) |

### 3.4 Status Promotion (APPROVED / VERIFIED / CLOSED)

| Level | APPROVED | VERIFIED | CLOSED |
|---|---|---|---|
| C0 | N | N | N |
| C1 | N | N | N |
| C2 | N | N | N |
| C3 | P | N | N |
| C4 | P/A* | C | N |
| C5 | P/A* | C | C |

### 3.5 Repository & Codebase

| Level | Read | Write | Catatan |
|---|---|---|---|
| C0 | N | N | Tidak ada akses |
| C1 | N | N | Belum dibuka |
| C2 | N | N | Repo masih tertutup |
| C3 | V* | N | View hanya bila Founder approve |
| C4 | V* | N | View selected repos |
| C5 | V* | P* | View + propose changes (tidak direct write) |

### 3.6 Production Deployment

| Level | Permission | Catatan |
|---|---|---|
| C0-C5 | N | Counterpart tidak memiliki deploy rights pada level manapun |

Deploy rights adalah domain Founder + L2/L3 saja.

### 3.7 Secrets & Credential Handling

| Level | Permission | Catatan |
|---|---|---|
| C0-C4 | N | Tidak ada akses ke secrets |
| C5 | N* | Status-only visibility bila Founder approve; raw values tetap N |

Raw secret values adalah hak eksklusif Founder pada semua level counterpart.

### 3.8 Audit Logs & Verification Logs

| Level | Permission | Catatan |
|---|---|---|
| C0 | N | Tidak ada akses |
| C1 | N | Belum dibuka |
| C2 | N | Belum dibuka |
| C3 | V | View summary audit |
| C4 | V | View detailed audit |
| C5 | V | View full audit trail |

### 3.9 Dashboard Operational Visibility

| Level | Permission | Catatan |
|---|---|---|
| C0 | N | Tidak ada akses |
| C1 | N | Belum dibuka |
| C2 | V* | View dashboard lite (bila Founder approve) |
| C3 | V* | View selected metrics |
| C4 | V | View operational dashboard |
| C5 | V | Full dashboard visibility |

### 3.10 Exception Escalation

| Level | Permission | Catatan |
|---|---|---|
| C0-C1 | N | Tidak bisa escalate |
| C2 | N | Belum dibuka |
| C3 | P | Dapat mengusulkan exception |
| C4 | P | Dapat mengusulkan exception |
| C5 | P | Dapat mengusulkan exception |

Keputusan exception tetap di tangan Founder.

### 3.11 Revocation Authority

| Level | Permission | Catatan |
|---|---|---|
| C0-C5 | N | Counterpart tidak memiliki revocation authority pada level manapun |

Revocation adalah hak eksklusif Founder.

---

## 4. Escalation and De-escalation Rules

### 4.1 Escalation (naik level)
- Harus ada bukti readiness pada level sebelumnya
- Founder consent diperlukan
- Dicatat di COUNTERPART_LEVEL_ASSIGNMENT_RECORD_V1
- Privilege baru berlaku setelah assignment record ditandatangani

### 4.2 De-escalation (turun level)
- Founder dapat menurunkan level kapan saja
- Alasan harus didokumentasikan di COUNTERPART_STATUS_CHANGE_LOG_V1
- Privilege langsung berkurang sesuai level baru
- Tidak ada masa transisi default — downgrade bersifat immediate

---

## 5. Special Rules

1. **No cumulative rights.** Privilege hanya berlaku pada level saat ini. Naik ke C3 bukan berarti menambah C2 + C3; ia menggantikan C2.
2. **No delegation.** Counterpart tidak boleh mendelegasikan privilege yang dimiliki ke pihak lain.
3. **No assumption.** Privilege yang tidak secara eksplisit diberikan dianggap N (None).
4. **Founder can override.** Founder dapat memberikan atau mencabut privilege di luar matrix ini melalui keputusan resmi yang terdokumentasi.

---

## 6. Official Decision

**IMPERIAL COUNTERPART PRIVILEGE MATRIX v1** menjabarkan hak akses counterpart secara eksplisit per level per domain. Matrix ini memastikan tidak ada ambiguitas dalam privilege counterpart dan memperkuat prinsip bahwa akses bersifat earned, bounded, dan revocable. Dokumen ini siap dibekukan sebagai bagian dari Governance Canon v1.

---

*Governance Canon v1 — Imperial Counterpart Privilege Matrix*
