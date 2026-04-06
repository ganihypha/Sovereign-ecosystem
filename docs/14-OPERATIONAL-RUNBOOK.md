# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 14: OPERATIONAL RUNBOOK
# (SOP Lengkap: Onboarding, Setup, Daily Ops, Outreach, Closing, Troubleshooting)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Sistem yang bagus tapi tidak punya SOP = sistem yang tidak bisa dijalankan konsisten. Runbook ini adalah panduan operasional untuk Founder dan sebagai reference saat deploy ke customer."*

---

## BAGIAN 1: ONBOARDING CUSTOMER BARU (SOP Setup)

### Checklist Sebelum Mulai

```
PERSIAPAN FOUNDER (30 menit sebelum onboarding call):
□ Pastikan sistem live: buka https://sovereign-orchestrator.pages.dev
□ Test login dengan PIN 1945
□ Siapkan catatan: nama bisnis customer, tier yang dipilih
□ Siapkan screen recording tool (OBS / QuickTime)
□ Buka dokumen ini sebagai reference selama call
□ Test WA Fonnte: send ke nomor test (pastikan connected)
```

---

### SOP 1.1 — Setup Instance Customer Baru

**Durasi:** 30-60 menit (Founder kerja sendiri sebelum onboarding call)

```
STEP 1: Deploy instance baru di Cloudflare
─────────────────────────────────────────
□ Buka Cloudflare Dashboard → Pages
□ Duplicate project "sovereign-orchestrator"
  ATAU: clone repo → ubah project name → deploy baru
□ Project name: fashionops-[nama-customer] (contoh: fashionops-wardrobe-id)
□ Pastikan auto-deploy dari GitHub aktif
□ Catat URL: https://fashionops-[nama].pages.dev

STEP 2: Setup Supabase untuk customer
──────────────────────────────────────
□ Buat project Supabase baru (free tier cukup untuk Tier 1)
  Name: fashionops-[nama-customer]
□ Copy anon key + service key
□ Jalankan migration SQL:
  - Buka Supabase → SQL Editor
  - Paste dan jalankan schema lengkap (semua CREATE TABLE)
□ Seed data awal (produk template kalau customer mau)

STEP 3: Configure environment variables
────────────────────────────────────────
□ Buka Cloudflare → Pages → Settings → Environment Variables
□ Set untuk production:
  SUPABASE_URL = [URL project customer]
  SUPABASE_SERVICE_KEY = [service key customer]
  SUPABASE_ANON_KEY = [anon key customer]
  JWT_SECRET = [generate random 32 chars]
  MASTER_PIN = [PIN yang customer pilih, default 1945]
  FONNTE_TOKEN = [token milik customer atau shared]
  
STEP 4: Test deployment
───────────────────────
□ Buka URL baru → login dengan PIN yang di-set
□ Cek dashboard: semua stat = 0 (normal, database kosong)
□ Tambah 1 produk test → cek muncul di dashboard
□ Kirim WA test ke nomor sendiri → cek log
□ Jika semua oke → siap onboarding call

STEP 5: Kirim credentials ke customer
───────────────────────────────────────
□ Kirim via WA (BUKAN email):
  "Halo kak [nama]! FashionOps sudah siap. Detail akses:
   URL: https://fashionops-[nama].pages.dev
   PIN: [PIN mereka]
   Kita jadwalkan onboarding call kapan?"
```

---

### SOP 1.2 — Onboarding Call (1-2 jam)

**Format:** WA video call atau Zoom screen share

```
AGENDA ONBOARDING CALL:

[0-10 menit] Pendahuluan
  □ Perkenalkan sistem dan apa yang bisa dilakukan
  □ Pastikan customer sudah buka URL di HP/laptop
  □ Login bersama dengan PIN mereka

[10-30 menit] Setup Data Awal
  □ Tambah produk-produk mereka (customer input sendiri, Founder guide)
    → Pergi ke /app/inventory → Tambah Produk
    → Nama, harga, stok, kategori
  □ Tambah customer/reseller yang sudah aktif
    → Pergi ke /app/customers → Tambah Customer
    → Nama, nomor WA, tier (mulai dari Bronze)
  □ Input 2-3 order terbaru sebagai contoh
    → Pergi ke /app/orders → Tambah Order

[30-50 menit] Demo Core Workflows
  □ Workflow 1: Tambah order baru
    "Setiap ada order masuk dari WA/IG, begini caranya input..."
  □ Workflow 2: Update status order
    "Setelah order dikirim, klik ini untuk ubah ke Shipped..."
  □ Workflow 3: Kirim WA follow-up ke reseller
    "Pilih nama reseller, pilih template, klik Send..."
  □ Workflow 4: Lihat dashboard revenue
    "Setiap pagi, buka ini untuk lihat omzet kemarin..."

[50-70 menit] Q&A dan Custom Konfigurasi
  □ Jawab pertanyaan customer
  □ Sesuaikan template WA dengan bahasa mereka (kalau mau)
  □ Jelaskan apa yang akan terjadi di 30 hari pertama

[70-80 menit] Closing Onboarding
  □ Ingatkan cara akses kalau lupa: URL + PIN
  □ Berikan Quick Start Guide (PDF via WA)
  □ Jadwalkan check-in Day 7
  □ Jelaskan cara hubungi support: WA langsung ke Founder
```

---

### SOP 1.3 — Quick Start Guide (Kirim ke Customer)

```
Template PDF / dokumen yang dikirim ke customer setelah onboarding:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASHIONOPS QUICK START GUIDE
[Nama Bisnis Customer]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 AKSES DASHBOARD
URL: https://fashionops-[nama].pages.dev
PIN: [PIN customer]
(Simpan di kontak HP / bookmark browser)

📋 WORKFLOW HARIAN (5-15 menit/hari)

Pagi:
1. Buka dashboard → lihat Revenue Today + Orders
2. Cek apakah ada order Pending → update status
3. Lihat Hot Leads → ada yang perlu dihubungi?

Setiap ada order masuk:
1. /app/orders → + Tambah Order
2. Isi: customer, produk, jumlah, total
3. Simpan → status otomatis Pending

Setelah order dikirim:
1. Cari order → klik status → pilih "Shipped"
2. Selesai

Kirim WA ke reseller:
1. /app/closer → pilih nama → pilih template
2. Preview pesan → Send

📞 SUPPORT
WA: [nomor Founder]
Jam support: [jam operasional]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## BAGIAN 2: DAILY OPERATIONS (SOP Operasi Harian)

### SOP 2.1 — Founder Daily Routine (30 menit/hari)

```
08:00 — Morning Check (10 menit)
  □ Buka dashboard: Revenue Today, Orders, Hot Leads
  □ Cek alert: ada unpaid invoice? ada hot lead uncontacted?
  □ Cek AI insights (kalau sudah aktif): ada aksi urgent?
  □ Cek WA status Fonnte: Connected ✅?

08:10 — Lead Actions (10 menit)
  □ Lihat Hot Leads (score ≥ 80)
  □ Yang belum dicontact → buka Closer Agent → Compose + Send Day 0
  □ Yang sudah dicontact tapi belum reply → cek schedule Day 3/7/14

08:20 — Order Actions (5 menit)
  □ Cek orders status=pending → ada yang perlu diproses?
  □ Update status order yang sudah dikirim (Pending → Shipped)
  □ Mark order yang sudah dibayar lunas

08:25 — Scout Actions (5 menit)
  □ Kalau ada waktu: Gather from IG (query baru)
  □ AI score batch leads baru
  □ Note: kalau tidak ada time, lakukan seminggu 2-3x saja

Selesai. Total: 30 menit.
```

### SOP 2.2 — Weekly Review (Senin Pagi, 30 menit)

```
WEEKLY REVIEW CHECKLIST:

📊 REVENUE CHECK (5 menit)
  □ Dashboard → Reports → Revenue tab
  □ Minggu lalu vs target: tercapai atau tidak?
  □ Growth %: naik atau turun?
  □ Unpaid invoices: ada yang perlu di-follow-up?
  □ AOV (average order value): berapa?

🎯 LEAD PIPELINE (10 menit)
  □ Leads baru minggu lalu: berapa?
  □ HOT leads berapa?
  □ Yang sudah di-outreach berapa?
  □ Yang reply berapa? Yang convert berapa?
  □ Hot lead yang belum di-contact → outreach SEKARANG

🤖 AI PERFORMANCE (5 menit, kalau sudah aktif)
  □ AI insights: berapa yang actionable (is_actioned)?
  □ Scout scoring accuracy: ada yang salah label?
  □ WA response rate: di atas 20%?

📱 3-LAYER VALIDATION (5 menit)
  □ @fashionkas: berapa reseller baru signup minggu ini?
  □ @resellerkas: engagement naik atau turun?
  □ @haidar_faras_m: followers growth? DM masuk dari potential client?

🎯 NEXT WEEK PRIORITIES (5 menit)
  □ 3 hal terpenting untuk dikerjakan minggu ini
  □ Lead mana yang harus diprioritaskan?
  □ Konten apa yang perlu diposting?
```

---

## BAGIAN 3: OUTREACH SOP

### SOP 3.1 — Cold Outreach via Scout Agent

```
STEP 1: Gather Leads
  Frekuensi: 2-3x per minggu
  
  /app/scout → klik "Gather from IG"
  Query yang terbukti bekerja:
    "reseller fashion jakarta"
    "toko baju online murah"
    "jualan baju cod"
    "reseller dropship fashion"
    "toko fashion online [kota]"
  
  Limit per gather: 20-30 leads
  
STEP 2: AI Score Batch
  □ Setelah gather → klik "AI Score All"
  □ Tunggu 1-2 menit (50 leads × ~2 detik = ~2 menit)
  □ Review hasilnya: focus ke HOT (merah/hijau)
  
STEP 3: Outreach HOT Leads
  Aturan: outreach HANYA ke leads dengan score ≥ 70
  
  Untuk setiap HOT lead:
  □ Buka detail lead → cek profil (apakah nyata?)
  □ Buka Closer Agent → pilih lead → template "Day 0"
  □ Klik "Generate with AI" → review pesan
    - Cek: nama toko disebut dengan benar?
    - Cek: pesan < 500 karakter?
    - Cek: tidak lebih dari 2 emoji?
  □ Edit manual kalau ada yang kurang pas
  □ Klik "Send via Fonnte"
  □ Konfirmasi → sent
  
STEP 4: Tracking Response
  □ Setiap hari, cek WA Log (/app/closer → tab "WA Log")
  □ Yang reply → mark sebagai "Replied" di wa_logs
  □ Yang reply → follow-up manual: "Halo kak, terima kasih sudah balas..."
  □ Yang tidak reply setelah 3 hari → Day 3 auto-sequence (atau manual trigger)
  
ATURAN OUTREACH:
  ✅ Max 30 outreach/hari (Fonnte rate limit)
  ✅ Jangan kirim ke nomor yang sama 2x dalam 24 jam
  ✅ Stop setelah 3x tidak reply (archive, jangan spam)
  ✅ Selalu review pesan AI sebelum send (tidak blind send)
```

### SOP 3.2 — Inbound Lead Handling

```
Saat ada DM masuk ke IG atau WA inquiry:

STEP 1: Kualifikasi dalam 2 pertanyaan
  Q1: "Bisnis kamu di fashion juga kak? Jualan apa?"
  Q2: "Sekarang pakai tools apa untuk kelola order dan reseller?"

STEP 2: Score manual berdasarkan jawaban
  Cocok (lanjut ke demo):
    → Owner fashion dengan problem nyata di order/reseller management
    → Sudah punya reseller tapi masih manual
    → Sudah jualan tapi chaos
    
  Tidak cocok (nurture saja):
    → Baru mau mulai jualan (belum punya operasi)
    → Sudah punya sistem yang lengkap
    → Bisnis yang sangat berbeda dari fashion/reseller

STEP 3: Kalau cocok → tawarkan demo
  Script:
  "Wah, ini persis masalah yang FashionOps dirancang untuk solve.
   Boleh gue tunjukkan demo 15-20 menit?
   Kita bisa screen share via WA Video atau Zoom.
   Kapan kamu available?"

STEP 4: Sebelum demo → input ke Lead Inbox
  /app/scout → Tambah Lead manual
  Isi: nama toko, nomor WA, platform, notes dari conversation
  Set status: "Consideration"
```

---

## BAGIAN 4: CUSTOMER HANDLING SOP

### SOP 4.1 — Active Customer Support

```
RESPONSE TIME TARGET:
  WA support hours: Senin-Sabtu, 09:00-21:00 WIB
  Response time: < 2 jam di jam support
  
KATEGORI MASALAH DAN HANDLING:

🟢 PERTANYAAN CARA PAKAI (Level 1)
  Contoh: "Gimana cara tambah produk baru?"
  Handling: Jawab via WA, kirim screenshot atau video 30 detik
  Target resolve: < 30 menit

🟡 BUG / ERROR (Level 2)
  Contoh: "Pas klik tombol send WA, ada error merah"
  Handling:
    □ Minta screenshot error
    □ Cek wa_logs di Supabase untuk error detail
    □ Cek Fonnte status: apakah WA masih connected?
    □ Fix di sistem → test → konfirmasi ke customer
  Target resolve: < 4 jam

🔴 DATA HILANG / CRITICAL (Level 3)
  Contoh: "Order tadi pagi hilang dari dashboard"
  Handling:
    □ JANGAN panik, data di Supabase sangat jarang hilang
    □ Cek Supabase langsung: query di SQL Editor
    □ Kalau data masih ada di DB tapi tidak muncul di UI → cek API
    □ Kalau data benar-benar tidak ada → restore dari Supabase backup
  Target resolve: < 2 jam
```

### SOP 4.2 — Renewal Reminder

```
Jadwal reminder:

T-7 hari sebelum jatuh tempo:
  WA: "Halo kak [nama]! Pembayaran FashionOps bulan [X] jatuh tempo [tanggal].
       Nomor rekening sama seperti sebelumnya: BCA [nomor].
       Ada pertanyaan? Tanya langsung ya."

T-1 hari:
  WA: "Reminder: besok jatuh tempo pembayaran FashionOps.
       Kalau ada kendala, kabarin dulu ya."

T+3 hari (kalau belum bayar):
  WA: "Halo kak, sepertinya pembayaran bulan ini belum masuk nih.
       Ada yang bisa gue bantu? Atau mau di-pause dulu sistemnya?"
       
T+7 hari: suspend akses (ubah MASTER_PIN ke random) sampai pembayaran masuk.
T+14 hari: jika tidak ada komunikasi → offboard customer.
```

---

## BAGIAN 5: TROUBLESHOOTING GUIDE

### SOP 5.1 — Fonnte WhatsApp Issues

```
PROBLEM: WA tidak terkirim, status "failed" di log

DIAGNOSIS STEPS:
1. Cek dashboard /api/wa/status → apakah "connected: true"?
2. Kalau disconnected:
   → Fonnte panel: https://fonnte.com → login
   → Cek device status
   → Scan ulang QR code jika perlu
3. Kalau connected tapi masih failed:
   → Cek nomor target: format benar? (628xxx)
   → Cek apakah nomor aktif di WA
   → Cek Fonnte rate limit: belum 1000 pesan/hari?
4. Cek FONNTE_TOKEN di Cloudflare Secrets: masih valid?
   → Fonnte panel → API Token → cek expired atau tidak

RESOLUTION:
  - WA disconnected → scan QR di Fonnte
  - Token expired → generate baru, update di Cloudflare Secrets
  - Nomor invalid → validasi format, skip nomor yang error
  - Rate limit → tunggu 24 jam atau upgrade Fonnte plan
```

### SOP 5.2 — ScraperAPI / Scout Issues

```
PROBLEM: Gather dari IG tidak return leads

DIAGNOSIS:
1. Cek SCRAPER_API_KEY masih valid: https://www.scraperapi.com/dashboard
   → Lihat remaining credits
   → Jika 0 → beli credit atau tunggu reset
2. Cek apakah IG API berubah (rate limit dari Instagram side)
   → Coba query berbeda
   → Coba limit lebih kecil (5-10 leads dulu)
3. Error 429 → ScraperAPI rate limit → retry setelah 60 detik

RESOLUTION:
  - Credit habis → top up di scraperapi.com
  - Query tidak return hasil → coba query yang lebih umum
  - Timeout → reduce batch size, coba lagi
```

### SOP 5.3 — AI / OpenAI Issues

```
PROBLEM: AI score tidak bekerja atau error

DIAGNOSIS:
1. Cek OPENAI_API_KEY masih valid dan ada credit
   → https://platform.openai.com/usage
2. Cek CF Workers log untuk error detail:
   → Cloudflare Dashboard → Workers → Logs
3. Error 429 (rate limit) → tunggu 1-2 menit, retry
4. Error 401 → API key expired atau salah

FALLBACK (kalau OpenAI down):
  → Scout scoring akan fallback ke algorithm score otomatis
  → MessageComposer akan fallback ke static template
  → InsightGenerator akan return empty array
  → Sistem tidak crash, tapi fitur AI tidak available sementara

RESOLUTION:
  - Key expired → generate baru di OpenAI dashboard → update Cloudflare Secrets
  - Credit habis → top up di platform.openai.com
  - OpenAI outage → cek status.openai.com → tunggu
```

### SOP 5.4 — Supabase Issues

```
PROBLEM: Data tidak muncul atau error database

DIAGNOSIS:
1. Cek Supabase status: https://status.supabase.com
2. Cek koneksi: curl https://[project].supabase.co/rest/v1/health
3. Cek RLS policies tidak block: coba langsung di SQL Editor
4. Cek SUPABASE_SERVICE_KEY: masih valid?

RESOLUTION:
  - Supabase outage → tunggu (biasanya < 1 jam)
  - RLS blocking → review policy di Supabase dashboard
  - Key expired → regenerate di Supabase Settings
  
BACKUP:
  - Supabase punya automatic backup (daily untuk paid, manual untuk free)
  - Untuk free tier: export manual setiap minggu
    → Supabase → Database → Backups → Download
```

### SOP 5.5 — Deployment Issues

```
PROBLEM: Update kode tidak reflect di production

DIAGNOSIS:
1. Cek GitHub Actions atau Cloudflare deployment:
   → Cloudflare Pages → Deployments → lihat latest deploy
   → Cek apakah status "Success" atau "Failed"
2. Kalau failed → lihat error log di deployment detail
3. Kalau success tapi tidak update:
   → Clear Cloudflare cache: Pages → Caching → Purge Cache
   → Hard refresh browser: Ctrl+Shift+R

RESOLUTION:
  - Build error → fix syntax error, push fix, tunggu redeploy
  - Env vars missing → tambah di Cloudflare Pages → Settings → Env Variables
  - Cache issue → purge Cloudflare cache
```

---

## BAGIAN 6: OFFBOARDING CUSTOMER

```
SOP Kalau Customer Berhenti Berlangganan:

STEP 1: Konfirmasi offboarding
  □ Tanya kenapa (untuk feedback, bukan untuk defend)
  □ Tawarkan pause 1 bulan gratis kalau ini soal cashflow
  □ Kalau tetap mau berhenti → lanjut

STEP 2: Export data customer
  □ Buka Supabase customer project
  □ Export semua tabel: orders, customers, leads, products
  □ Kirim CSV files ke customer via email/WA
  □ Customer berhak dapat data mereka sendiri

STEP 3: Archive instance
  □ Ubah MASTER_PIN ke random (disable access)
  □ Tandai di spreadsheet tracking: "Offboarded - [tanggal]"
  □ Jangan langsung hapus Supabase project (tunggu 30 hari kalau ada dispute)

STEP 4: Post-offboarding survey (opsional)
  WA 2 minggu setelah offboard:
  "Halo kak [nama], sudah beberapa minggu. Boleh gue tanya jujur:
   alasan utama stop pakai FashionOps apa?
   Jawaban kamu sangat membantu untuk improve sistemnya."
```

---

## BAGIAN 7: METRICS TRACKING (Founder Wajib Track)

```
SPREADSHEET TRACKING (update setiap Senin):

Tab 1: Customers
  Nama | Toko | Tier | Start Date | Monthly Fee | Status | Notes

Tab 2: Revenue
  Bulan | Setup Fees | MRR | Total | YoY Growth

Tab 3: Funnel
  Week | New Leads | Demos | Closings | Lost | Conversion Rate

Tab 4: Product Metrics
  Bulan | Avg Time Saved/Customer | NPS | Churn | Expansion Revenue

MINIMUM YANG HARUS DI-TRACK:
  ✅ Monthly Recurring Revenue (MRR)
  ✅ Churn rate per bulan
  ✅ New customers per bulan
  ✅ Customer acquisition channel (Scout/Inbound/Referral)
  ✅ NPS score (tanya customer tiap 3 bulan)
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Operational Runbook v1.0 — onboarding, daily ops, outreach, troubleshooting, offboarding |

**Dokumen Terkait (Governance Extension):**
- `35-MANAGING-STRATEGIST-ONBOARDING-AND-ACTIVATION-CHECKLIST.md` — checklist bertahap aktivasi Managing Strategist (pre-activation gates, phase 1–3, KPI baseline)
- `36-CONTENT-OPS-AND-CHANNEL-SOP.md` — SOP operasional channel publishing (Instagram, WA/Fonnte) setelah MS aktif
- `37-INCIDENT-AND-CRISIS-COMMUNICATION-PLAYBOOK.md` — protokol respons insiden dan krisis komunikasi market-facing

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
