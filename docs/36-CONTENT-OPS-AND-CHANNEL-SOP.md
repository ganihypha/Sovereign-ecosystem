# 36 – CONTENT OPS & CHANNEL SOP
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT FRAMEWORK — Berlaku setelah Managing Strategist diaktifkan
**Version:** 1.1 | **Tanggal:** 2026-04-06 | **Updated:** 2026-04-06

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**
> Dokumen ini mengoperasionalisasi governance dari `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md`
> menjadi SOP yang bisa dijalankan harian. Jangan gunakan tanpa membaca doc 34 terlebih dahulu.

---

## 1. PURPOSE

Dokumen ini mengubah aturan governance di `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` menjadi:
- Workflow operasional yang berulang dan dapat dijalankan
- Jadwal dan ritme publishing yang jelas
- SOP per channel (Instagram, WhatsApp, Landing Page)
- Template management dan approval flow
- Logging dan audit trail untuk semua aktivitas market-facing

**Prinsip utama doc ini:**
> *"Governance rules tanpa SOP = aturan yang tidak bisa dijalankan konsisten."*
> *"SOP tanpa governance rules = aktivitas tanpa batas yang aman."*
> Doc 34 + Doc 36 = governance + operasionalisasi yang lengkap.

---

## 2. SAAT INI — STATUS OPERASIONAL

| Channel | Status | Siapa Handle | SOP Status |
|---------|--------|-------------|------------|
| Instagram @fashionkas | Founder-only | Founder | SOP ini berlaku saat MS aktif |
| Instagram @resellerkas | Founder-only | Founder | SOP ini berlaku saat MS aktif |
| Instagram @haidar_faras_m | Founder ONLY — permanent | Founder | Tidak didelegasikan — tidak ada SOP untuk MS |
| WhatsApp via Fonnte | Founder-triggered | Founder | SOP ini berlaku saat MS aktif |
| Landing page | Founder | Founder | Perubahan copy butuh Founder approval |

> **Saat ini semua channel dipegang Founder.**
> **SOP ini aktif saat Managing Strategist diaktifkan dan onboarding Phase 3 selesai.**

---

## 2.1 CANONICAL OPERATING LOCATIONS

SOP ini tidak boleh bergantung pada tool pilihan yang berubah-ubah tanpa owner yang jelas.

### Temporary Canonical Source of Truth
Sampai sistem final (Supabase module) tersedia, gunakan struktur berikut:

| Kebutuhan | Temporary Canonical Location | Owner | Future Canonical System |
|-----------|-------------------------------|-------|-------------------------|
| Content Queue | Google Sheet yang ditetapkan Founder — satu file aktif | Managing Strategist (isi), Founder (approve) | Internal content queue module |
| Approved Template Registry | Google Sheet / doc registry yang ditetapkan Founder | Founder (approver), MS (propose) | Template registry system |
| Content Log | Google Sheet sementara (format JSON-like per row) | Founder | Supabase `content_log` table |
| WA Logs | `wa_logs` Supabase — canonical permanent | System / Founder oversight | Tetap canonical |
| Approval Notes | Founder comment / cell note di content queue sheet | Founder | Approval module |

### Rules
1. Hanya boleh ada **satu canonical queue aktif** per periode.
2. Hanya boleh ada **satu approved template registry aktif** — tidak boleh tersebar di beberapa file.
3. Jika lokasi tool berpindah, Founder wajib menetapkan tanggal cut-over yang jelas dan dicatat.
4. Tidak boleh ada approval yang tersebar di banyak tempat tanpa referensi silang yang jelas.

---

## 3. INSTAGRAM SOP

### 3.1 — Ritme Publishing (Weekly)

```
RITME KONTEN MINGGUAN (Target setelah MS aktif):

Senin   : 1 Feed post — Product highlight atau tips bisnis
Rabu    : 1 Story — Behind the scenes / customer snapshot (non-klaim)
Jumat   : 1 Feed post — Social proof atau educational content
Sabtu   : Story repost — Konten customer yang relevan

Minimal: 2 feed post + 2 story per minggu
Maksimal: 4 feed post + 5 story per minggu
(Lebih dari ini harus ada persetujuan Founder)
```

### 3.2 — Content Queue Workflow

```
STEP 1 — IDEASI (Managing Strategist)
  □ Buat 3-5 ide konten untuk minggu berjalan
  □ Format: [Tipe] | [Caption draft] | [Visual brief] | [Channel]
  □ Simpan di content queue doc atau Notion/Sheets yang disepakati
  □ Deadline: setiap Jumat sore untuk minggu berikutnya

STEP 2 — REVIEW (Founder)
  □ Review content queue yang dikirim MS
  □ Approve / revisi / reject per item
  □ Founder merespons dalam 24 jam (hari kerja)
  □ Format approval: [APPROVED] / [REVISI: ...] / [HOLD]

STEP 3 — FINALISASI (Managing Strategist)
  □ Implementasi revisi Founder
  □ Siapkan visual (via Canva atau tool yang disepakati)
  □ Jadwalkan via Meta Business Suite atau tool yang disepakati
  □ Konfirmasi ke Founder bahwa konten sudah terjadwal

STEP 4 — POSTING & MONITORING
  □ Pantau engagement 24 jam setelah post
  □ Respons comment umum (sesuai template respons)
  □ Catat anomali (serangan, spam, komentar negatif massal) → ESKALASI ke Founder segera
```

### 3.3 — Comment & DM Response Rules

```
BOLEH direspons langsung oleh Managing Strategist:
  ✅ Pertanyaan produk umum ("Ada ukuran apa aja?")
  ✅ Pertanyaan harga umum (sesuai pricing sheet 10-REVENUE-OFFER-SHEET.md)
  ✅ Ucapan terima kasih / testimonial positif
  ✅ Pertanyaan cara daftar reseller (jawab dengan template yang sudah ada)

HARUS ESKALASI ke Founder:
  🔐 Keluhan serius tentang produk atau pengalaman
  🔐 Permintaan custom harga atau deal khusus
  🔐 Pertanyaan tentang kemitraan atau kolaborasi
  🔐 Komentar negatif yang viral atau menyerang brand
  🔐 Media / jurnalis yang menghubungi
  🔐 DM yang mengarah ke potential high-value client
```

### 3.3A COMMENT / DM MODERATION DECISION TREE

Gunakan tabel berikut agar respons tidak bergantung pada intuisi spontan MS:

| Tipe Masuk | Respons Awal | Siapa Handle | Aksi |
|------------|--------------|--------------|------|
| Pertanyaan produk umum | Jawab dengan template yang sudah approved | Managing Strategist | Direct handle |
| Pertanyaan harga umum | Jawab sesuai pricing sheet approved | Managing Strategist | Direct handle |
| Skeptis sopan / pertanyaan validitas | Jawab dengan fakta terverifikasi dari System Truth | Managing Strategist | Direct handle |
| Testimoni positif | Ucapkan terima kasih | Managing Strategist | Direct handle |
| Complaint publik yang berkembang | Jangan debat, dokumentasikan, stop respons lebih lanjut | Founder decision | **Escalate** |
| Partnership inquiry | Tahan respons detail — jangan komit apapun | Founder | **Escalate** |
| Media / jurnalis / outlet | Jangan jawab substantif | Founder | **Escalate segera** |
| Spam / abuse / komentar serangan | Screenshot, hide jika aman, log | Founder aware | **Escalate-lite + log** |
| Potensi high-value lead | Respons aman + singkat awal, lalu eskalasi | Founder | **Escalate** |

**Golden Rule:** Jika Managing Strategist ragu apakah sebuah DM/comment masuk kategori aman — **default action adalah jangan improvisasi, eskalasi ke Founder.**

---

### 3.4 — Brand Voice Quick Guide

```
TONE: Profesional tapi hangat. Tidak kaku. Tidak terlalu casual.
BAHASA: Indonesia utama. English hanya untuk technical terms.
EMOJI: Maksimal 2 per caption. Tidak pakai emoji yang trivial.
HASHTAG: 5-10 per post. Relevant, tidak spam.

BOLEH diklaim:
  ✅ Fungsi yang sudah live ("Dashboard yang bisa lacak order realtime")
  ✅ Hasil nyata dari klien yang sudah ada proof-nya (dengan izin klien)
  ✅ Positioning yang sudah konsisten ("Sistem operasional untuk fashion reseller")

TIDAK BOLEH diklaim:
  🚫 Angka revenue atau growth yang belum diverifikasi
  🚫 Fitur yang belum live ("Coming soon" harus labeled jelas)
  🚫 Janji timeline yang belum dikonfirmasi Founder
  🚫 Social proof klien tanpa izin eksplisit
  🚫 Klaim market share atau perbandingan kompetitor
```

---

## 4. WHATSAPP SOP

### 4.1 — Template Management

```
PROSES TEMPLATE BARU:

STEP 1 — MS membuat draft template
  Format:
  [NAMA TEMPLATE] : [Trigger/use case]
  ---
  [Isi pesan — max 500 karakter untuk outreach, 800 untuk support]
  ---
  [Variabel: {nama}, {produk}, dsb]

STEP 2 — Founder review dan approve
  Founder approve via WA atau platform approval queue
  Approval harus eksplisit — tidak ada auto-approve

STEP 3 — Template disimpan di template registry
  Lokasi: [Tentukan lokasi — Notion, Google Sheets, atau doc dedicated]
  Format: ID | Nama | Tipe | Isi | Status | Approved By | Tanggal

STEP 4 — MS hanya bisa pakai template yang sudah [APPROVED]
  Template [DRAFT] atau [REVISI] tidak boleh dikirim
```

### 4.2 — WA Send Workflow

```
SINGLE SEND (Managing Strategist ke 1 lead / customer):

STEP 1 — Pilih lead/customer dari pipeline
STEP 2 — Pilih template yang sudah approved
STEP 3 — Preview pesan — cek nama dan variabel benar
STEP 4 — Submit approval request ke Founder (Tier 1 — async)
STEP 5 — Tunggu Founder approve (max 24 jam hari kerja)
STEP 6 — Setelah approved → kirim via platform
STEP 7 — Konfirmasi bahwa `wa_logs` mencatat entry dengan status benar

CATATAN: Untuk follow-up sequence yang SUDAH ada template approved,
MS boleh kirim langsung (Tier 0) tanpa approval tiap kali.
Founder cukup approve template-nya sekali.
```

### 4.2A FAILURE HANDLING — WA SEND EXCEPTIONS

Jika terjadi kegagalan atau kondisi tidak normal pada workflow WA, gunakan aturan berikut:

| Situasi | Tindakan Wajib |
|---------|----------------|
| Template approved tapi send gagal | Cek `wa_logs` untuk status, jangan re-send buta, catat status FAILED, lapor ke Founder jika berulang |
| Variabel salah / nama salah terisi | **Jangan kirim.** Perbaiki variabel dulu, preview ulang, baru re-submit ke approval queue |
| Founder belum approve > 24 jam kerja | Status tetap HOLD. **Tidak boleh kirim.** Catat delay di weekly report |
| Lead sudah cold terlalu lama (> 14 hari tidak respons) | Masukkan ke weekly report, tandai sebagai cold, jangan improvisasi pesan baru di luar template |
| Customer balas di luar script / template | Respons aman + singkat jika masih pertanyaan umum. Jika sensitif atau berpotensi eskalasi → eskalasi ke Founder |

**Re-send Rule:** Tidak boleh ada re-send lebih dari **1 kali** tanpa pengecekan sebab kegagalan. Jika gagal 2 kali → hentikan dan lapor ke Founder.

---

### 4.3 — WA Logging Discipline

Semua WA outbound yang dikirim oleh atau atas nama MS harus:

```
□ Tercatat di wa_logs dengan field minimum:
  - timestamp
  - recipient_number
  - template_used
  - sent_by: 'managing_strategist'
  - status: CONFIRMED / ATTEMPTED / FAILED
  - approved_by: 'founder' / 'auto_template'

□ Tidak ada pesan yang dikirim tanpa log
□ Tidak ada auto-send loop tanpa trigger eksplisit
□ Broadcast ke > 5 penerima: Founder only, tidak bisa didelegasikan
```

---

## 5. CONTENT APPROVAL MATRIX

| Konten | Dibuat Oleh | Approve Oleh | Timeframe | Channel |
|--------|------------|--------------|-----------|---------|
| Feed post IG (non-strategic) | Managing Strategist | Founder | < 24 jam | Instagram |
| Story IG (informational) | Managing Strategist | Auto — jika dalam template | — | Instagram |
| Story IG (social proof) | Managing Strategist | Founder | < 24 jam | Instagram |
| WA follow-up (template approved) | Managing Strategist | Auto — template pre-approved | — | WA/Fonnte |
| WA non-template ke lead baru | Managing Strategist | Founder (Tier 1) | < 24 jam | WA/Fonnte |
| WA broadcast (> 5) | Founder | Founder only | Sebelum eksekusi | WA/Fonnte |
| Landing page copy minor | Managing Strategist | Founder | < 24 jam | Web |
| Landing page copy major / pricing | Founder | Founder only | — | Web |
| Partnership announcement | Founder | Founder only | — | Semua |
| Pricing update | Founder | Founder only | — | Semua |
| Product launch / pivot | Founder | Founder only | — | Semua |

---

## 5.1 LANDING PAGE COPY SOP

Landing page termasuk channel market-facing yang wajib mengikuti prinsip System Truth (ref: `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` Section 7).

### Minor Change — Managing Strategist boleh mengusulkan
Yang dianggap **minor:**
- Perbaikan grammar atau ejaan
- Perapihan CTA yang tidak mengubah janji atau makna
- Perbaikan struktur kalimat tanpa mengubah klaim
- Update wording ringan yang tidak menyentuh pricing / capability claim

**Handling:** MS mengusulkan dalam format change note tertulis → Founder wajib approve sebelum publish → catat di content log.

### Major Change — Founder Only
Yang dianggap **major:**
- Perubahan headline utama atau tagline
- Perubahan positioning atau value proposition
- Perubahan pricing atau paket penawaran
- Perubahan klaim hasil / ROI / capability yang dijanjikan
- Penambahan fitur, janji, atau timeline baru
- Perubahan partnership message atau afiliasi

**Handling:** Founder pegang langsung. MS tidak boleh mengeksekusi perubahan major tanpa instruksi eksplisit.

### Landing Page Change Workflow
```
1. MS mengusulkan change note (minor atau major)
2. Founder menilai: minor atau major?
3. Jika minor + approved → MS execute, log perubahan
4. Jika major → Founder handle langsung
5. Semua perubahan dicatat di content log
6. Jika perubahan salah arah atau klaim bergeser → rollback ke copy sebelumnya
```

---

## 6. CONTENT LOG & AUDIT TRAIL

Semua aktivitas publishing harus dicatat. Minimum log entry:

```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "channel": "instagram_fashionkas | wa | landing_page",
  "content_type": "feed_post | story | wa_send | page_update",
  "created_by": "managing_strategist | founder",
  "approved_by": "founder | auto_template",
  "approval_date": "ISO8601",
  "status": "draft | approved | published | rejected | archived",
  "content_summary": "singkat, max 100 karakter",
  "note": "optional"
}
```

**Lokasi log:** Supabase `content_log` table (future) atau Google Sheets sementara (canonical — lihat Section 2.1).
**Audit cadence:** Founder review content log setiap Senin bersamaan dengan weekly review.

---

## 6.1 CONTENT OPS KPI

Agar SOP ini dapat dievaluasi dan kinerja MS terukur, gunakan KPI minimum berikut:

| KPI | Target Minimum | Review Cadence |
|-----|----------------|----------------|
| Content queue submitted on time | > 90% | Weekly |
| Founder approval turnaround | < 24 jam kerja | Weekly |
| Approved-to-published ratio | > 90% | Weekly |
| Comment / DM response timeliness | Sesuai SLA yang ditetapkan | Weekly |
| WA log completeness | 100% semua outbound tercatat | Weekly |
| Template compliance | 100% hanya gunakan approved template | Weekly |
| Incident trigger dari content ops | Serendah mungkin — target 0 major preventable incident/bulan | Monthly |

### Review Rule
Jika 2 KPI utama gagal selama 2 minggu berturut-turut, Founder wajib review apakah:
- SOP perlu diperjelas
- Scope terlalu besar untuk kapasitas MS
- Approval bottleneck ada di sisi Founder (bukan MS)
- MS perlu re-briefing atau scope dikurangi

---

## 7. WEEKLY CONTENT OPS RHYTHM

```
SENIN (Managing Strategist):
  □ Review minggu lalu — apa yang perform baik / buruk?
  □ Cek approved templates — ada yang perlu update?
  □ Siapkan content ideas untuk minggu ini

SENIN (Founder):
  □ Review weekly content report dari MS
  □ Approve / revisi content queue
  □ Review content log dari minggu lalu

RABU (Managing Strategist):
  □ Finalisasi konten yang sudah diapprove
  □ Jadwalkan posting
  □ Konfirmasi ke Founder bahwa queue minggu ini siap

JUMAT (Managing Strategist):
  □ Submit content queue draft untuk minggu depan ke Founder
  □ Catat anomali engagement atau isu channel yang muncul minggu ini

ONGOING (Managing Strategist):
  □ Monitor comment IG — respons yang dalam scope template
  □ Log WA send — pastikan semua tercatat di wa_logs
  □ Flag hal yang butuh Founder attention di weekly report
```

---

## 8. ESKALASI — KAPAN BERHENTI DAN LAPOR

Managing Strategist wajib **berhenti dan eskalasi segera** jika:

```
STOP DAN ESKALASI SEGERA:
  ⚠️ Ada komentar negatif yang mulai viral atau menyerang brand
  ⚠️ Ada DM dari media, jurnalis, atau influencer besar
  ⚠️ Ada pertanyaan tentang informasi yang belum pernah di-publish
  ⚠️ Ada akun lain yang mengklaim afiliasi dengan Sovereign/Fashionkas/Resellerkas
  ⚠️ Ada laporan dari follower tentang konten yang tidak sesuai
  ⚠️ Ada error atau misfeed di platform yang tidak bisa difix di level MS
  ⚠️ Ada permintaan kolaborasi dari brand lain
  
FORMAT ESKALASI: "[SOVEREIGN ESCALATION] — [ringkasan 1 kalimat] — [level: info/urgent/kritis]"
Kirim via WA langsung ke Founder.
```

---

## 8.1 APPROVAL DELAY RULE

Jika Founder belum memberikan keputusan approval dalam waktu target (< 24 jam kerja):

- Konten tetap berstatus **HOLD** — tidak boleh diposting otomatis
- Managing Strategist tidak boleh menafsirkan **diam sebagai persetujuan**
- Item yang tertunda dicatat dalam weekly report section "Pending Approvals"
- Jika keterlambatan approval mulai mengganggu ritme konten secara konsisten, Founder dan MS wajib menyepakati perbaikan alur (apakah approval window perlu diperlebar atau jadwal posting perlu disesuaikan)

> **Silence is not approval. Absence of rejection is not approval. Only explicit approval counts.**

---

## 9. TIDAK DALAM SCOPE DOC INI

Doc ini **tidak** mendefinisikan:
- Governance rules channel ownership → lihat `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md`
- Approval tiers dan escalation flow → lihat `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md`
- RBAC permission untuk channel access → lihat `31-RBAC-PERMISSION-MATRIX.md`
- Brand strategy dan positioning → lihat `01-NORTH-STAR-PRD.md` dan `10-REVENUE-OFFER-SHEET.md`
- Crisis response playbook → lihat `37-INCIDENT-AND-CRISIS-COMMUNICATION-PLAYBOOK.md`

---

## APPENDIX A — MINIMUM TEMPLATE REGISTRY STRUCTURE

Registry template minimum harus memiliki field berikut untuk setiap template yang diajukan:

| ID | Nama Template | Use Case | Channel | Status | Approved By | Tanggal Approve | Last Review |
|----|---------------|----------|---------|--------|-------------|-----------------|-------------|
| T-001 | General Inquiry Reply | Pertanyaan produk umum dari follower | Instagram DM / WA | APPROVED | Founder | — | — |
| T-002 | Pricing Reply | Pertanyaan harga dari prospek | Instagram DM / WA | APPROVED | Founder | — | — |
| T-003 | Reseller Onboarding Reply | Cara daftar reseller | WA | APPROVED | Founder | — | — |
| T-004 | Follow-up Warm Lead | Lead hangat yang belum respons 3–5 hari | WA | APPROVED | Founder | — | — |
| T-005 | Follow-up Inactive Lead | Lead yang belum respons > 14 hari | WA | APPROVED | Founder | — | — |
| T-006 | Thank-you / Testimonial Reply | Balasan testimoni positif | Instagram comment / WA | APPROVED | Founder | — | — |
| T-007 | Escalation Holding Reply | Saat escalation sedang diproses Founder | WA / Instagram | APPROVED | Founder | — | — |
| T-008 | Partnership Deferral Reply | Merespons inquiry partnership dengan netral | Instagram DM / WA | APPROVED | Founder | — | — |

**Rules:**
- Jika template belum ada di registry dengan status **APPROVED**, template tidak boleh dipakai
- Template baru diajukan oleh MS → Founder approve → baru masuk registry dengan status APPROVED
- Template yang perlu direvisi di-mark **REVISION** — tidak boleh dipakai sampai kembali ke APPROVED

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT FRAMEWORK |
| Dibuat | 2026-04-06 |
| Dokumen Terkait | `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` (governance rules), `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md` (approval tiers), `31-RBAC-PERMISSION-MATRIX.md` (permission), `14-OPERATIONAL-RUNBOOK.md` (runbook), `37-INCIDENT-AND-CRISIS-COMMUNICATION-PLAYBOOK.md` (crisis), `35-MANAGING-STRATEGIST-ONBOARDING-AND-ACTIVATION-CHECKLIST.md` (onboarding) |
| Review | Saat Managing Strategist diaktifkan, 30 hari pertama pelaksanaan, lalu review bulanan |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT FRAMEWORK — operasionalisasi governance, bukan perjanjian legal*
