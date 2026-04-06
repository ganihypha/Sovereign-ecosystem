# 33 – PARTNERSHIP & PROFIT-SHARING MILESTONES
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT INTERNAL FRAMEWORK — Review sebelum diaktifkan
**Version:** 1.0 | **Tanggal:** 2026-04-05

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**
> 
> ⚠️ **PENTING:** Dokumen ini adalah **draft framework internal**, bukan perjanjian legal yang mengikat.
> Semua angka dan struktur bersifat indikatif dan harus direvisi bersama konsultan hukum sebelum diaktifkan.

---

## 1. PURPOSE

Dokumen ini mendefinisikan:

1. **Kapan** Managing Strategist mendapat akses profit-sharing
2. **Berapa** persentase atau bentuk sharing yang berlaku per milestone
3. **Bagaimana** proof milestone diverifikasi sebelum sharing aktif
4. **Apa saja** batasan dan non-scope yang berlaku

Prinsip:
> *"Profit-sharing must follow proof and documented milestones."*
> *"Upgrade path must be staged and evidence-based."*

---

## 2. MENGAPA MILESTONE-BASED, BUKAN FLAT-RATE

| Model | Risiko | Keputusan |
|-------|--------|-----------|
| Flat-rate sejak awal | Sharing tanpa proof — Founder menanggung semua biaya operasional | 🚫 Tidak dipakai |
| Berdasarkan perasaan / loyalitas | Tidak terukur, berpotensi konflik | 🚫 Tidak dipakai |
| Time-based (setelah X bulan) | Tidak menghargai kontribusi nyata | 🚫 Tidak dipakai |
| **Milestone-based** | Berbasis bukti nyata, terukur, fair | ✅ Dipakai |

---

## 3. MILESTONE FRAMEWORK

### Stage 0 — Pre-Activation (Saat Ini)

**Status:** Role Managing Strategist **DORMANT**. Belum ada sharing karena sistem belum proven.

**Trigger untuk lanjut ke Stage 1:**
- [ ] Sistem live dan berjalan > 1 bulan tanpa major incident
- [ ] Minimal 1 klien aktif (bukan trial, bukan test)
- [ ] Revenue proof ada (minimal 1 pembayaran real dari klien)
- [ ] Founder sudah tidak sepenuhnya dalam mode chaos/manual
- [ ] Managing Strategist sudah di-onboard dan diaktifkan oleh Founder

---

### Stage 1 — Operational Contribution (Managing Strategist)

**Kondisi:** Role aktif, sistem sudah proven di level minimum.

**Bentuk sharing (DRAFT — indikatif):**

| Komponen | Bentuk | Catatan |
|----------|--------|---------|
| Operational contribution fee | Fixed atau % kecil dari revenue | Hanya aktif jika revenue ada |
| Retensi customer yang ditangani | Bonus per renewal | Terukur dan verifiable |

**Bukti yang wajib ada sebelum Stage 1 dimulai:**
- [ ] Revenue proof: minimal Rp X/bulan selama 2 bulan berturut-turut (founder isi angka aktual)
- [ ] SOP berjalan: checklist operasional terisi > 90% setiap minggu
- [ ] KPI terpenuhi: response rate > 90%, onboarding clean, follow-up konsisten
- [ ] Weekly review diisi oleh Managing Strategist setiap minggu

---

### Stage 2 — Growth Coordination (Strategic Operations Partner)

**Kondisi:** Stage 1 berjalan > 3 bulan dengan proof KPI terpenuhi.

**Bentuk sharing (DRAFT — indikatif):**

| Komponen | Bentuk | Catatan |
|----------|--------|---------|
| Growth coordination fee | % lebih besar dari revenue | Berbasis target yang disepakati |
| New client contribution | Bonus per klien baru yang dikontribusikan | Terukur dari attribution yang clear |
| Retention rate | Bonus per kuartal jika retention > threshold | Terukur dari data sistem |

**Bukti yang wajib ada sebelum Stage 2 dimulai:**
- [ ] Stage 1 track record > 3 bulan (weekly review ada, KPI ada)
- [ ] Revenue growth terjadi (minimal flat, tidak turun)
- [ ] Founder memutuskan upgrade berdasarkan track record nyata
- [ ] Mutual agreement tertulis tentang perluasan scope

---

### Stage 3 — Managing Partner (Jika Berlaku)

> ⚠️ **DRAFT INTERNAL FRAMEWORK**
> Tahap ini memerlukan definisi legal yang jelas: apakah sebagai karyawan, mitra, pemegang saham, atau kontraktor.
> **Jangan aktivasi tanpa konsultasi hukum.**

**Kondisi (semua wajib terpenuhi):**
- [ ] Revenue stability terbukti > 6 bulan berturut-turut
- [ ] Trust track record nyata dari Stage 1 + Stage 2
- [ ] Mutual agreement yang explicit dan voluntary
- [ ] Profit-sharing framework sudah dinegosiasikan dan disetujui tertulis
- [ ] Status legal hubungan bisnis sudah jelas (kontrak, bukan asumsi)

---

## 4. GOVERNANCE RULES UNTUK PROFIT-SHARING

### Yang TIDAK boleh dilakukan

- 🚫 Memberikan sharing sebelum ada revenue proof
- 🚫 Memberikan sharing sebelum ada kontribusi nyata yang terukur
- 🚫 Bersifat retroaktif tanpa kesepakatan eksplisit
- 🚫 Dicatat sebagai hutang tanpa dasar yang jelas
- 🚫 Diputuskan secara emosional atau berdasarkan janji verbal saja

### Yang HARUS dilakukan

- ✅ Semua sharing harus berdasarkan milestone yang sudah terdokumentasi
- ✅ Semua angka harus diverifikasi dari data sistem (bukan estimasi)
- ✅ Semua keputusan sharing dicatat di Decision Log (19-DECISION-LOG.md)
- ✅ Founder adalah satu-satunya yang bisa approve sharing
- ✅ Jika ada keraguan, konsultasi hukum sebelum komitmen

---

## 5. TRUST RESERVE / CASH RESERVE

Sebelum profit-sharing bisa aktif, Sovereign harus memiliki:

| Reserve | Tujuan | Minimum |
|---------|--------|---------|
| Operational reserve | Cover 3 bulan operational cost tanpa revenue | Founder tentukan |
| Emergency reserve | Untuk unexpected downtime, tool cost, dll | Founder tentukan |
| Partnership reserve | Pool yang siap untuk sharing jika milestone terpenuhi | Founder tentukan |

**Partnership reserve tidak boleh diambil dari operational cash yang dibutuhkan untuk sistem.**

---

## 6. METRICS YANG DIPAKAI UNTUK MILESTONE VERIFICATION

| Metric | Sumber Data | Siapa Verifikasi |
|--------|------------|-----------------|
| Monthly Revenue | Supabase `revenue_log` | Founder |
| Client count aktif | Supabase `customers` | Founder |
| Follow-up consistency | `wa_logs` + manual check | Founder |
| Weekly review completion | `weekly_reviews` table | Founder |
| Onboarding completion rate | Checklist + customer data | Founder |
| Customer retention rate | Renewal data | Founder |

---

## 7. FOUNDER REMINDER

Dokumen ini dibuat untuk memastikan bahwa ketika hari aktivasi tiba, Founder punya:

1. **Struktur yang jelas** — bukan improvisasi di momen penting
2. **Metrics yang terukur** — bukan keputusan berdasarkan perasaan
3. **Perlindungan yang tepat** — sistem tidak berisiko karena sharing terlalu awal
4. **Fairness yang nyata** — kontribusi nyata mendapat penghargaan nyata

> Bangun sekarang, aktifkan nanti.
> Rancang kursinya sekarang, dudukkan orangnya nanti.
> Siapkan sharing framework sekarang, jalankan setelah proof ada.

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT INTERNAL FRAMEWORK |
| Dibuat | 2026-04-05 |
| Sumber distilasi | `doc.manahing.stratgst.1.1.1.1.q.1...txt` |
| Dokumen Terkait | `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `31-RBAC-PERMISSION-MATRIX.md`, `35-MANAGING-STRATEGIST-ONBOARDING-AND-ACTIVATION-CHECKLIST.md` (checklist aktivasi) |
| Review | Saat activation trigger (Stage 0 → Stage 1) terpenuhi |
| Legal Note | Semua angka bersifat indikatif — perlu review hukum sebelum diaktifkan |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT INTERNAL FRAMEWORK — bukan dokumen legal atau perjanjian formal*
