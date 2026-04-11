# PRIVATE CHAIR ACCESS CONTROL SPEC v1

**Version:** 1.0  
**Status:** Official Canonical Draft  
**Classification:** Strictly Private / Founder-Side Governance  
**Document Type:** Access Control Specification  
**Scope:** Role model, access matrix, permission boundary, enforcement rules, exception handling

**Ref Induk:** PRIVATE_CHAIR_CHAMBER_DOC_V1  
**Ref Pendukung:** PRIVATE_CHAIR_CHAMBER_ARCHITECTURE_V1, IMPERIAL_COUNTERPART_PROTOCOL_V1  
**Ref Turunan:** IMPERIAL_COUNTERPART_PRIVILEGE_MATRIX_V1

---

## 1. Purpose

Dokumen ini menetapkan spesifikasi kontrol akses untuk **Private Chair Chamber** sebagai lapisan governance privat dalam ekosistem Sovereign. Tujuannya adalah menerjemahkan doctrine menjadi aturan akses yang konkret: siapa boleh melihat, siapa boleh mengusulkan, siapa boleh mengorkestrasi, siapa boleh mengeksekusi, siapa boleh menyetujui, dan siapa yang memegang otoritas final. Dokumen ini juga menetapkan bagaimana boundary ditegakkan, bagaimana exception diproses, dan kapan akses harus dibatasi, ditahan, atau dicabut.

---

## 2. Governing Principles

Spesifikasi ini berdiri di atas prinsip berikut: **founder sovereignty is central**, **Private Chair governs the present**, **no verified without proof**, **role separation is mandatory**, dan **secret hygiene is non-negotiable**. Seluruh aturan akses harus tunduk pada prinsip-prinsip ini. Akses tidak boleh diberikan hanya karena kedekatan, gelar, atau asumsi; akses harus **earned, bounded, and provable**.

---

## 3. Access Control Model

Model kontrol akses Private Chair menggunakan lima hukum inti:

1. **Default Deny** — akses dianggap tertutup sampai diberikan secara eksplisit.
2. **Need-to-Know** — visibilitas hanya diberikan sesuai kebutuhan fungsi, bukan rasa ingin tahu.
3. **Need-to-Prove** — hak promotion ke approved/verified/closed hanya sah bila disertai proof.
4. **No Role Collapse** — L1, L2, dan L3 tidak boleh bercampur tanpa alasan yang sah.
5. **Founder Final Authority** — untuk keputusan survival, architecture, security, legal, revocation, dan final exception, otoritas terakhir tetap di tangan Founder.

---

## 4. Role Definitions

### 4.1 Founder
Pemegang otoritas final. Menetapkan intent, guardrail, batas aktivasi, approval law, keputusan exception, dan keputusan revocation. Satu-satunya otoritas yang dapat memberi atau mencabut hak dengan implikasi sistemik.

### 4.2 Private Chair Counterpart
Pasangan / holder kedua pada founder-side seat untuk konteks present governance. Memiliki pengaruh tinggi dalam arah, nilai, ritme, dan boundary, tetapi **bukan co-founder equal equity**, **bukan sovereign override**, dan **bukan pemegang hak veto atas Founder**. Akses bersifat bertahap dan harus earned through fit, trust, rhythm, and proof.

### 4.3 L2 Orchestrator
Bertanggung jawab melakukan normalization, scope lock, readiness check, source-of-truth sync, dan orchestration. Boleh mengatur alur kerja dan memvalidasi kesiapan, tetapi tidak memegang otoritas final governance dan tidak boleh mempromosikan status VERIFIED tanpa proof.

### 4.4 L3 Executor
Bertugas mengeksekusi tugas yang telah dibatasi: build, test, patch, deploy, verifikasi teknis, dan return proof. Tidak memegang hak doctrine, tidak boleh memperluas scope sendiri, dan tidak boleh mengakses atau menebak raw secrets di luar jalur yang sah.

### 4.5 Heir Path / Steward-in-Formation
Bukan jalur akses produksi. Ia adalah jalur pembentukan stewardship. Keturunan tidak mendapat akses kontrol inti hanya karena hubungan darah; akses harus earned dan diberikan bertahap.

---

## 5. Permission Levels

- **N — None:** tidak memiliki akses.
- **V — View:** dapat melihat.
- **C — Comment:** dapat memberi catatan/rekomendasi tanpa mengubah status.
- **P — Propose:** dapat mengusulkan perubahan atau keputusan.
- **O — Orchestrate:** dapat mengatur alur, scope, readiness, dan handoff.
- **E — Execute:** dapat menjalankan tugas teknis yang telah dibatasi.
- **A — Approve:** dapat memberi persetujuan formal pada area yang ditentukan.
- **F — Final Authority:** keputusan final dan override sah.

---

## 6. Control Domains

Spesifikasi ini berlaku atas domain berikut:

1. Canonical Living Docs
2. Private Strategy & Chamber Docs
3. Session Truth & Status Promotion
4. Repository & Codebase
5. Deployment & Production Environment
6. Secrets & Credential Handling
7. Operational Dashboard & Logs
8. Verification, Audit, and Closeout
9. Exception, Revocation, and Emergency Handling

---

## 7. Access Matrix

Legenda: `N=None`, `V=View`, `C=Comment`, `P=Propose`, `O=Orchestrate`, `E=Execute`, `A=Approve`, `F=Final Authority`.

| Control Domain | Founder | Counterpart | L2 Orchestrator | L3 Executor | Heir Path |
|---|---|---|---|---|---|
| Canonical living docs | F | V/C/P | O | V | N |
| Private Chair doctrine/chamber docs | F | V/C/P | V/C | N | N |
| Session truth register | F | V/C | O | V | N |
| Status promotion to APPROVED | F | P/A* | O | N | N |
| Status promotion to VERIFIED | F | C | O | E (proof only) | N |
| Status promotion to CLOSED | F | C | O | N | N |
| Repo read access | F | V* | O/V | E | N |
| Repo write access | F | N/P* | O* | E | N |
| Production deploy trigger | F | N | O* | E* | N |
| Production config visibility | F | V* | V | V | N |
| Raw secret values | F | N* | N | N | N |
| Manual secret injection | F | N | N | N | N |
| Audit logs / verification logs | F | V* | O/V | E/V | N |
| Dashboard operational visibility | F | V* | V/O | V | N |
| Exception escalation | F | P | O | P | N |
| Revocation authority | F | N | P | N | N |

\* = hanya boleh diberikan bila Founder menyetujui secara eksplisit dan kebutuhan fungsionalnya nyata, bounded, dan terdokumentasi.

---

## 8. Secret and Credential Enforcement

Aturan berikut berlaku mutlak:

- Raw secrets tidak boleh ditempelkan ke dokumen biasa.
- File `.env` tidak boleh dibagikan sebagai artefak dokumentasi.
- Nilai credential tidak boleh ditebak, dihalusinasikan, atau dicetak tanpa kebutuhan yang sah.
- Status akses credential wajib diklasifikasikan: **available**, **founder-only**, **manual injection**, **production-only**, atau **blocked**.
- Manual secret injection adalah hak Founder, bukan lane operasional umum.

---

## 9. Verification and Status Promotion Law

Status `VERIFIED` hanya boleh diberikan bila seluruh syarat terpenuhi:

1. Target build / deploy diketahui.
2. Route atau capability yang diuji benar-benar live.
3. Ada item/fresh action yang sah untuk diuji.
4. Provider call / system call berhasil.
5. Log atau bukti operasional mencerminkan state yang benar.

`APPROVED` bukan berarti `SENT`. `APPROVED` juga bukan otomatis `VERIFIED`. `CLOSED` hanya sah bila proof, state sync, dan doc sync telah selesai. Status promotion harus dibaca sebagai tangga bukti, bukan kata-kata administratif.

---

## 10. Activation Gate for Counterpart Access

Akses counterpart ke Private Chair tidak boleh diberikan berdasarkan titel, emosi, atau kedekatan semata. Aktivasi harus melewati gate:

- Bukti realitas sistem
- Kesiapan Founder
- Counterpart fit
- Shared rhythm
- Historic worthiness

Semua akses counterpart harus dipandang sebagai **earned access**, bukan gifted access.

---

## 11. Exception Classes

### 11.1 Proceed
Akses cukup, readiness cukup, scope jelas, task boleh lanjut.

### 11.2 Proceed With Limitations
Task boleh lanjut, tetapi ada domain tertentu yang dibatasi.

### 11.3 Blocked Pending Manual Injection
Task tertahan karena credential hanya dapat dipenuhi melalui tindakan Founder.

### 11.4 Push-Ready After Manual Injection
Semua hal selain credential sudah siap; lane dapat berjalan segera setelah Founder melakukan injeksi manual.

---

## 12. Revocation Protocol

Akses harus segera dibekukan, diturunkan, atau dicabut bila terjadi:

- Pelanggaran secret hygiene
- Role collapse
- Scope drift
- Status claim tanpa proof
- Boundary violation
- Trust breakdown
- Counterpart fit failure

Urutan revocation minimum:
1. Suspend privileged access
2. Freeze status promotion / closeout
3. Audit lane dan log
4. Rotate secrets bila perlu
5. Founder mengeluarkan keputusan final

---

## 13. Enforcement Rules by Domain

### 13.1 Documents
Living docs adalah runtime memory. Write authority ke dokumen kanonik tidak boleh dibuka luas.

### 13.2 Repository
Repo access mengikuti prinsip least privilege. Read boleh lebih luas daripada write.

### 13.3 Deploy and Production
Deploy rights tidak otomatis mengikuti repo write. Production tetap domain berisiko tinggi.

### 13.4 Secrets
Visibilitas status secret dapat dibuka secara terbatas. Nilai raw secret tetap Founder-custodied.

### 13.5 Audit and Proof
Log, proof pack, dan verification artifact adalah prasyarat closeout. Tidak boleh ada promosi status tanpa jejak audit.

---

## 14. Official Decision

**PRIVATE CHAIR ACCESS CONTROL SPEC v1** menetapkan bahwa Private Chair adalah wilayah governance privat dengan akses bertingkat, boundary tegas, secret discipline ketat, dan founder final authority. Counterpart access bersifat earned and bounded; L2 bersifat orchestration-bound; L3 bersifat execution-bound; Heir Path tidak memiliki production authority. Semua status, akses, dan pengecualian harus tunduk pada proof, source-of-truth order, dan hukum boundary yang sah.

---

*Governance Canon v1 — Private Chair Access Control Spec*
