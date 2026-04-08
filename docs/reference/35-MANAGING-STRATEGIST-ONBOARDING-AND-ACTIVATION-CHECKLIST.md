# 35 – MANAGING STRATEGIST ONBOARDING & ACTIVATION CHECKLIST
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT INTERNAL FRAMEWORK — Digunakan saat activation trigger terpenuhi
**Version:** 1.1 | **Tanggal:** 2026-04-06 | **Updated:** 2026-04-06

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**
> Dokumen ini adalah checklist operasional untuk proses onboarding Managing Strategist.
> Berlaku hanya setelah semua trigger di `30-MANAGING-STRATEGIST-ROLE-PACK.md` terpenuhi.

---

## 1. PURPOSE

Dokumen ini menterjemahkan arsitektur governance (docs 30–34) menjadi **urutan langkah operasional yang konkret** untuk proses aktivasi Managing Strategist.

Tujuannya:
1. Memastikan Founder tidak improvisasi saat hari aktivasi tiba
2. Memastikan orang yang masuk punya struktur yang jelas sejak hari pertama
3. Memastikan akses diberikan secara bertahap (observer → candidate → active)
4. Memastikan semua approval gate dilalui sebelum eskalasi akses

> *"Bukan siapa orangnya, tapi apakah strukturnya sudah siap."*

---

## 2. PRE-ACTIVATION GATE — WAJIB LUNAS SEMUA

Sebelum proses onboarding dimulai, Founder wajib verifikasi semua kondisi berikut:

### Gate 1 — System Readiness

| Kondisi | Cara Verifikasi | Status |
|---------|----------------|--------|
| Sistem live tanpa major incident > 1 bulan | Lihat `18-BUILD-SPRINT-LOG.md` — tidak ada blocker kritis selama 30 hari | ⬜ |
| Dashboard operasional bisa digunakan | Buka `https://sovereign-orchestrator.pages.dev` — semua core feature jalan | ⬜ |
| WA/Fonnte integration stabil | `wa_logs` ada entry `CONFIRMED` konsisten > 2 minggu | ⬜ |
| SOP dasar sudah hidup | `14-OPERATIONAL-RUNBOOK.md` sudah dijalankan minimal 1 onboarding nyata | ⬜ |

### Gate 2 — Revenue Readiness

| Kondisi | Cara Verifikasi | Status |
|---------|----------------|--------|
| Minimal 1 klien aktif (bukan trial) | Supabase `customers` — ada record dengan `status: active` | ⬜ |
| Revenue proof ada (minimal 1 pembayaran real) | Supabase `revenue_log` — ada entry nyata | ⬜ |
| Founder tidak lagi 100% mode chaos/manual | Founder daily ops < 90 menit/hari untuk 2 minggu berturut | ⬜ |

### Gate 3 — Governance Readiness

| Kondisi | Cara Verifikasi | Status |
|---------|----------------|--------|
| Docs 30–34 masih current dan tidak ada drift | Re-read semua docs — masih aligned dengan sistem aktual | ⬜ |
| Approval workflow sudah dipahami Founder | `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md` — sudah di-review | ⬜ |
| RBAC permission boundary sudah jelas | `31-RBAC-PERMISSION-MATRIX.md` — sudah di-review untuk implementasi | ⬜ |
| Profit-sharing framework sudah terdokumentasi | `33-PARTNERSHIP-AND-PROFIT-SHARING-MILESTONES.md` — Stage 0 kondisi terpenuhi | ⬜ |
| External publishing boundaries sudah ditetapkan | `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` — channel readiness checklist sudah siap | ⬜ |

> **Jika ada satu gate yang belum lunas → TUNDA aktivasi. Jangan lanjut.**

---

## 2.4 ACTIVATION EVIDENCE PACK — BUKTI WAJIB SEBELUM GATE DINYATAKAN LUNAS

Setiap gate pada Section 2 tidak boleh dinyatakan "lunas" hanya berdasarkan ingatan Founder.
Semua gate wajib memiliki bukti minimum yang dapat diperiksa ulang.

### Evidence Pack Minimum

| Gate | Bukti Minimum | Bentuk Bukti | Disimpan Oleh |
|------|---------------|--------------|---------------|
| System Readiness | Dashboard berjalan, log stabil, SOP dasar pernah dipakai | Screenshot dashboard, log sample, catatan runbook | Founder |
| Revenue Readiness | Minimal 1 klien aktif + 1 pembayaran real | Screenshot Supabase / export `revenue_log` | Founder |
| Governance Readiness | Docs 30–34 sudah dibaca ulang dan dinyatakan aligned | Founder note / checklist review date | Founder |

### Evidence Checklist

Sebelum aktivasi dimulai, Founder wajib memastikan evidence pack berisi minimal:
- [ ] Screenshot dashboard operasional yang aktif
- [ ] Bukti `wa_logs` stabil > 2 minggu (minimal ada entry `CONFIRMED` konsisten)
- [ ] Bukti ada minimal 1 klien aktif (`customers` table: `status: active`)
- [ ] Bukti ada minimal 1 pembayaran real (`revenue_log` ada entry nyata)
- [ ] Catatan bahwa docs 30–34 sudah direview ulang dan masih aligned
- [ ] Baseline founder daily ops time selama 2 minggu terakhir (catat angka aktual)
- [ ] Catatan singkat alasan mengapa aktivasi dianggap layak dimulai sekarang

> Tanpa evidence pack lengkap, gate dianggap belum lunas penuh. Proses onboarding tidak boleh dimulai.

---

## 3. PHASE 1 — OBSERVER ONBOARDING (Minggu 1–2)

Role saat ini: `managing_strategist_candidate` — read-only observer.

### Step 1 — Briefing Founder (Sebelum akses apapun diberikan)

```
Founder menjelaskan kepada kandidat:

1. Sistem Sovereign — apa ini, untuk apa, ke mana arah
2. Role Managing Strategist — bukan pengganti Founder, tapi penguat ritme
3. Batasan yang tidak bisa dikompromikan:
   - Tidak punya akses credentials
   - Tidak deploy ke production
   - Tidak ubah arsitektur tanpa sinkronisasi
4. Upgrade path — berbasis bukti, bukan waktu atau loyalitas
5. Profit-sharing — hanya setelah milestone, bukan di awal
6. Eskalasi protocol — kapan dan bagaimana melapor ke Founder
```

**Output:** Kandidat memahami struktur sebelum melihat sistem apapun.

---

### Step 2 — Akses Observer Terbatas + Access Provisioning Table

#### Step 2A — ACCESS PROVISIONING TABLE

Semua akses yang diberikan selama onboarding harus tercatat eksplisit. Tidak ada akses yang dianggap aktif tanpa catatan.

| Resource | Observer | Candidate / Trial | Active Managing Strategist | Granted By | Revoked By | Bukti Pemberian |
|----------|----------|-------------------|----------------------------|------------|------------|------------------|
| Dashboard ops view | View only | View + limited edit | Sesuai RBAC aktif | Founder | Founder | Catatan aktivasi / screenshot |
| Weekly review template | Read | Fill draft | Fill + submit | Founder | Founder | Link / shared file note |
| Runbook section 1–4 | Read | Read | Read + execute | Founder | Founder | Shared file note |
| Lead tracker | No access | Limited update + notes | Limited update | Founder | Founder | Role note |
| WA approved template send | No access | Limited use (Founder approve per template) | Limited use | Founder | Founder | Approval record |
| Credential / secrets | No | No | No | Founder only | Founder only | N/A — tidak pernah diberikan |

**Provisioning Rules:**
1. Tidak ada akses yang dianggap aktif kalau belum dicatat.
2. Tidak ada akses sensitif yang diberikan secara verbal saja.
3. Semua revoke harus dilakukan maksimal pada hari yang sama saat role diturunkan/dinonaktifkan.

---

Founder memberikan akses **read-only** ke:

| Resource | Level Akses | Cara Akses |
|----------|-------------|-----------|
| Dashboard operasional | View only — tidak ada tombol aksi | Founder kasih URL + PIN observer |
| `22-WEEKLY-FOUNDER-REVIEW.md` (template) | Read only | Share file/link |
| `14-OPERATIONAL-RUNBOOK.md` (bagian 1–4) | Read only — untuk memahami workflow | Share file/link |
| `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` | Read only | Share file/link |

**Yang TIDAK diberikan di fase ini:**
- Akses Supabase langsung
- Akses Cloudflare
- Akses GitHub repo
- Credential atau token apapun
- WA Fonnte trigger

---

### Step 3A — SHADOWING AGENDA (MINGGU 1)

Observer tidak hanya "mengamati" secara umum, tetapi mengikuti urutan shadowing yang jelas selama 5 hari pertama:

**Hari 1 — Operational Overview**
- [ ] Melihat struktur dashboard dan memahami navigasi utama
- [ ] Memahami ritme daily ops Founder secara keseluruhan
- [ ] Mencatat istilah, alur, dan pertanyaan dasar yang muncul

**Hari 2 — Lead & Follow-Up Rhythm**
- [ ] Mengamati cara Founder cek lead pipeline
- [ ] Mengamati cara follow-up diputuskan (siapa yang diprioritaskan, mengapa)
- [ ] Mencatat perbedaan antara lead dingin / hangat / prioritas

**Hari 3 — Customer Continuity & Onboarding**
- [ ] Mengamati alur onboarding customer baru
- [ ] Mengamati area yang sering menjadi bottleneck
- [ ] Mencatat titik yang butuh ketelitian tinggi

**Hari 4 — Content / Channel Review**
- [ ] Mengamati bagaimana Founder menilai konten / copy sebelum publish
- [ ] Mengamati approval mindset — apa yang di-approve cepat vs lambat vs ditahan
- [ ] Mencatat contoh hal yang langsung dieksekusi vs harus di-escalate

**Hari 5 — Reflection & Clarification**
- [ ] Kandidat menyusun 1 halaman ringkasan observasi (bebas format)
- [ ] Kandidat menyusun daftar pertanyaan prioritas untuk Founder
- [ ] Submit ke Founder sebelum akhir Hari 5
- [ ] Founder review dan menilai: apakah observer siap lanjut ke trial?

---

### Step 3 — First-Week Observation Checklist

Kandidat menyelesaikan selama minggu pertama:

- [ ] Baca `14-OPERATIONAL-RUNBOOK.md` lengkap dan catat pertanyaan
- [ ] Baca `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` — pahami brand voice dan channel rules
- [ ] Observasi minimal 1 siklus daily ops Founder (boleh via screen share atau log)
- [ ] Isi 1 entry `22-WEEKLY-FOUNDER-REVIEW.md` format sebagai latihan (tidak dipublish)
- [ ] Submit daftar pertanyaan / observasi awal ke Founder (via WA atau doc)

**Output dari Founder:** Founder review observasi, berikan feedback, putuskan lanjut ke Phase 2 atau tidak.

---

## 4. PHASE 2 — TRIAL ACTIVATION (Minggu 3–4)

Role: `managing_strategist_candidate` → naik ke `managing_strategist` jika Phase 1 clear.

### Step 4 — Founder Activation Decision

Founder memutuskan lanjut ke trial berdasarkan:

- [ ] Observasi Phase 1 menunjukkan pemahaman yang cukup
- [ ] Tidak ada red flag dalam komunikasi atau ekspektasi
- [ ] Kandidat sudah paham batasan non-scope (tidak minta akses credentials, tidak over-commit)
- [ ] Founder sendiri merasa siap mendelegasikan sebagian ritme operasional

**Keputusan ini tidak bisa diminta oleh kandidat. Hanya Founder yang putuskan.**

---

### Step 5 — Akses Trial (Scope Terbatas)

Founder mengaktifkan akses berikut secara bertahap:

| Resource | Level Akses | Catatan |
|----------|-------------|---------|
| Dashboard operasional (ops view) | View + edit lead status + onboarding notes | Bukan full dashboard |
| Lead pipeline tracker | Baca + update status + tambah catatan | Tidak bisa delete |
| Onboarding checklist | Jalankan checklist customer baru | Dalam scope SOP yang ada |
| Weekly review form | Isi + submit ke Founder | Founder review setiap minggu |
| WA (follow-up template) | Kirim template yang sudah pre-approved | Founder approve template dulu |

**Yang masih TIDAK diberikan:**
- Credential / secrets apapun
- Deployment access
- DB access langsung
- Kemampuan kirim WA broadcast
- Approval authority atas order > Starter tier

---

### Step 6 — Trial Week Deliverables

Setiap minggu selama trial, kandidat submit ke Founder:

```
FORMAT WEEKLY TRIAL REPORT:

1. OPERATIONAL STATUS
   - Checklist harian terisi: Y/N (% completion)
   - Lead yang di-update: [jumlah]
   - Customer onboarding yang dijalankan: [jumlah]
   - Follow-up WA yang dikirim (dari template): [jumlah]

2. FRICTION / BLOCKERS
   - Hal yang tidak bisa diselesaikan: [list]
   - Hal yang butuh Founder decision: [list dengan tag ESCALATE]
   - Saran perbaikan SOP (jika ada): [list]

3. OBSERVATIONS
   - Sinyal pertumbuhan yang perlu diperhatikan
   - Customer yang perlu perhatian lebih
   - Anomali yang perlu dicek Founder

4. PERTANYAAN UNTUK FOUNDER
   - [list pertanyaan dengan konteks]
```

---

### Step 7 — End-of-Trial Review (Akhir Minggu 4)

Founder melakukan review 1:1 dengan kandidat:

| Area Review | Pertanyaan Kunci |
|------------|-----------------|
| Operational rhythm | Apakah checklist konsisten diisi? Apakah ritme stabil? |
| Escalation quality | Apakah escalation dibuat dengan konteks yang tepat? Tidak under/over-escalate? |
| Boundary respect | Apakah kandidat menghormati batasan non-scope tanpa perlu diingatkan? |
| Communication quality | Apakah tone komunikasi ke customer sudah sesuai brand voice? |
| Initiative quality | Apakah inisiatif yang diberikan membantu atau menambah kompleksitas? |

**Keputusan setelah review:**
- ✅ Lanjut ke Phase 3 (Full Activation)
- ⏳ Perpanjang trial 2 minggu dengan area perbaikan yang jelas
- 🚫 Stop — tidak dilanjutkan (dengan alasan yang jelas dan terdokumentasi)

---

## 4.1 END-OF-TRIAL DECISION RUBRIC

Founder tidak boleh memberi keputusan trial hanya berdasarkan "feeling cocok". Gunakan rubric minimum berikut:

| Area | Minimum Acceptable | Good | Red Flag |
|------|--------------------|------|----------|
| Checklist consistency | > 80% | > 90% | < 80% |
| Boundary respect | Tidak melanggar scope | Proaktif menjaga scope tanpa diingatkan | Mendorong akses di luar scope |
| Escalation quality | Eskalasi cukup jelas | Eskalasi tepat + ringkas + kontekstual | Under/over-escalate berulang |
| Communication tone | Aman & sopan | Sesuai brand voice penuh | Terlalu informal / terlalu kaku |
| Initiative quality | Tidak menambah chaos | Membantu Founder melihat prioritas | Menambah kompleksitas tanpa manfaat |

### Keputusan Trial
- **PASS** → lanjut ke Phase 3
- **EXTEND** → trial diperpanjang 2 minggu, wajib ada area perbaikan tertulis yang jelas
- **STOP** → aktivasi dibatalkan, alasan terdokumentasi singkat di `19-DECISION-LOG.md`

---

## 5. PHASE 3 — FULL ACTIVATION

Role: `managing_strategist` — aktif penuh sesuai `31-RBAC-PERMISSION-MATRIX.md`.

### Step 8 — Formal Activation

Founder melakukan:

- [ ] Update role di platform ke `managing_strategist`
- [ ] Catat aktivasi di `19-DECISION-LOG.md` sebagai ADR baru
- [ ] Konfirmasi scope kepada kandidat: apa yang sekarang bisa dan tidak bisa dilakukan
- [ ] Berikan akses sesuai permission matrix `31-RBAC-PERMISSION-MATRIX.md`
- [ ] Ingatkan: profit-sharing belum aktif — masih di Stage 0, akan aktif setelah Stage 1 trigger terpenuhi

---

### Step 9 — First-Month Active Checklist

Selama bulan pertama aktivasi penuh:

**Ritme Harian Managing Strategist:**

```
□ Morning check (10 menit):
  - Buka dashboard ops view
  - Cek lead pipeline — ada yang perlu follow-up hari ini?
  - Cek customer continuity — ada yang renewal soon?
  - Cek ada escalation yang belum direspons Founder?

□ Siang (15 menit jika ada kebutuhan):
  - Update status lead
  - Kirim follow-up WA (dalam template yang diapprove)
  - Tambah catatan onboarding jika ada interaksi customer

□ End-of-day note (5 menit):
  - Catat satu hal yang butuh Founder perhatian besok
  - Catat satu hal yang berjalan baik hari ini
```

**Ritme Mingguan Managing Strategist:**

```
□ Isi Weekly Trial Report (lihat Step 6 format)
□ Kirim ke Founder sebelum Senin pagi
□ Catat friction atau saran di report — jangan didiamkan
□ Ikut sesi review 1:1 dengan Founder (Senin atau Selasa)
```

---

### Step 10 — Activation KPI Baseline

KPI yang dimonitor oleh Founder selama bulan pertama aktivasi:

| KPI | Target | Sumber Data |
|-----|--------|-------------|
| Operational checklist completion | > 90% setiap minggu | Weekly report |
| Follow-up consistency | > 90% lead yang dijadwalkan di-follow-up tepat waktu | `wa_logs` |
| Escalation quality | 0 over-commit tanpa Founder approval | Founder review |
| Brand voice compliance | 0 keluhan atau koreksi dari Founder | Founder review konten |
| Founder daily ops time | Turun ke < 75 menit/hari (dari baseline) | Self-report Founder |

---

## 5.1 FIRST 30 DAYS SUCCESS CRITERIA

Bulan pertama aktivasi penuh adalah fase validasi peran, bukan fase kenyamanan. Founder menggunakan standar berikut:

### Founder Review Standard — Managing Strategist Dianggap Lulus Bulan Pertama Jika:
- [ ] Checklist completion > 90%
- [ ] Tidak ada over-commit ke market tanpa Founder approval
- [ ] Tidak ada pelanggaran founder-only boundary (credentials, deployment, pricing)
- [ ] Follow-up WA consistency > 90% dari yang dijadwalkan
- [ ] Weekly report dikirim tepat waktu setiap minggu
- [ ] Founder daily ops time turun dari baseline yang dicatat di Evidence Pack
- [ ] Tidak ada insiden serius Level 2/3 yang disebabkan kelalaian operasional

### Jika Belum Lulus
Founder dapat:
- Memperpanjang masa validasi 2–4 minggu dengan area perbaikan yang spesifik
- Menurunkan sementara scope channel / task yang didelegasikan
- Mengulang briefing boundaries (ref: Section 6)
- Menunda semua pembahasan role upgrade lanjutan ke `strategic_operations_partner`

---

## 6. GOVERNANCE BOUNDARIES REMINDER

Setiap kali ada pergantian kandidat atau role upgrade, Founder wajib re-brief hal berikut:

```
NON-NEGOTIABLE BOUNDARIES:

1. Founder adalah satu-satunya sovereign controller
2. Credentials, secrets, dan .dev.vars = Founder only, tidak ada pengecualian
3. Deployment ke production = Founder only
4. DB schema change = Founder only
5. Broadcast WA = Founder approval sebelum eksekusi
6. Pricing dan partnership decisions = Founder only
7. Profit-sharing belum aktif sampai Stage 1 trigger terpenuhi
8. Semua commitment ke market harus selaras dengan System Truth
   (ref: 34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md)
9. Semua escalation harus terdokumentasi (ref: 32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md)
10. Role ini adalah DORMANT sampai Founder aktifkan — bukan otomatis aktif
```

---

## 6.1 ROLE ACKNOWLEDGEMENT & SIGN-OFF

Sebelum Phase 2 (Trial Activation) dimulai, kandidat wajib secara eksplisit menyatakan telah membaca dan memahami hal berikut:

- [ ] Founder adalah sovereign controller — tidak ada override tanpa approval
- [ ] Tidak ada akses credential / secrets dalam kondisi apapun
- [ ] Tidak ada production deployment
- [ ] Tidak ada DB schema decision
- [ ] Tidak ada market promise di luar approved System Truth
- [ ] Semua eskalasi harus mengikuti jalur resmi (`32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md`)
- [ ] Profit-sharing bukan hak otomatis — hanya aktif setelah Stage 1 milestone terpenuhi
- [ ] Role dapat diturunkan atau dihentikan kapan saja jika struktur tidak dijaga

**Founder Sign-off:** _________________________________ Tanggal: ___________
**Candidate Sign-off:** ________________________________ Tanggal: ___________

> Dokumen ini tidak memiliki kekuatan hukum sendiri, namun berfungsi sebagai governance record bahwa onboarding dilakukan dengan transparansi penuh.

---

## 7. OFFBOARDING / DEACTIVATION PROTOCOL

Jika role perlu dinonaktifkan (karena performa, keputusan bisnis, atau mutual decision):

### Access & Asset Recovery Checklist
- [ ] Revoke akses dashboard / tracker / tool operasional ke level lebih rendah atau nol
- [ ] Audit semua **draft konten** yang belum publish — tentukan owner baru atau hapus
- [ ] Audit semua **queue approval** yang masih pending — Founder take-over atau cancel
- [ ] Audit semua **follow-up WA** yang sedang berjalan — pastikan tidak ada yang menggantung
- [ ] Audit semua **file / sheet / workspace sementara** yang pernah dibagikan — cabut akses
- [ ] Pastikan tidak ada credential, token, atau akses sensitif yang pernah diberikan atau tersisa
- [ ] Catat keputusan deaktivasi di `19-DECISION-LOG.md`
- [ ] Komunikasikan alasan deaktivasi secara jelas dan tertulis kepada kandidat

### Recovery Note
Jika terdapat pekerjaan yang sedang berjalan saat deaktivasi:
- Founder mengambil alih langsung semua channel yang pernah didelegasikan, atau
- Founder menunjuk temporary owner untuk membereskan item yang tertinggal

> **Tidak boleh ada aktivitas market-facing yang tertinggal tanpa owner yang jelas.**

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.1 |
| Status | DRAFT INTERNAL FRAMEWORK |
| Dibuat | 2026-04-06 |
| Dokumen Terkait | `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `31-RBAC-PERMISSION-MATRIX.md`, `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md`, `33-PARTNERSHIP-AND-PROFIT-SHARING-MILESTONES.md`, `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md`, `36-CONTENT-OPS-AND-CHANNEL-SOP.md`, `37-INCIDENT-AND-CRISIS-COMMUNICATION-PLAYBOOK.md` |
| Review | Saat activation trigger (Stage 0 → Stage 1) terpenuhi, saat trial selesai (PASS/EXTEND/STOP), dan 30 hari setelah full activation |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT INTERNAL FRAMEWORK — bukan dokumen legal atau perjanjian formal*
