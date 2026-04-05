# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 11: CUSTOMER JOURNEY & SALES FUNNEL
# (Dari Orang Asing → Paying Customer → Loyal Advocate)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Strategi 3 akun Instagram yang bagus tidak otomatis jadi sales funnel. Funnel perlu peta eksplisit: orang masuk dari mana, lihat apa, klik ke mana, bayar kapan."*

---

## BAGIAN 1: GAMBARAN FUNNEL KESELURUHAN

```
╔══════════════════════════════════════════════════════════════════════╗
║              SOVEREIGN SALES FUNNEL — FULL MAP                       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  AWARENESS         INTEREST          CONSIDERATION    DECISION       ║
║  ─────────         ────────          ─────────────    ────────       ║
║                                                                      ║
║  3 IG Channels     Content Click     Demo / Trial     Bayar          ║
║  Organic Search    Bio Link Visit    WA Chat          Setup          ║
║  WOM / Referral    Katalog View      Objection        Onboard        ║
║  Scout Outreach    Form Inquiry      Handler          Use            ║
║       │                │                 │               │           ║
║       ▼                ▼                 ▼               ▼           ║
║  COLD AUDIENCE    WARM LEAD        HOT LEAD        CUSTOMER          ║
║                                                                      ║
║  (ScraperAPI)    (Organic IG)    (Form/WA Inquiry) (Dashboard)       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## BAGIAN 2: TIGA JALUR MASUK (Entry Points)

### 🔵 JALUR A — Scout Outreach (Cold → Warm)
*Sumber: ScraperAPI + Scout Agent*

```
LANGKAH DETAIL:

1. Scout Agent temukan profil IG fashion (query: "reseller fashion jakarta")
   Tool: ScraperAPI → Instagram search
   Output: List username + followers + bio

2. AI Scoring (ScoutScorer LangGraph):
   Score > 70 → HOT lead
   Score 50-70 → WARM lead
   Score < 50 → skip atau nurture

3. Closer Agent — Day 0 WA (MessageComposer):
   "Halo kak [nama]! Saya Haidar dari FashionKas.
   Lihat [nama_toko] dan tertarik banget — kayaknya cocok banget sama
   sistem reseller otomatis yang lagi kita kembangkan.
   Boleh ngobrol 10 menit soal ini?"

4. Response tracking:
   ✅ Reply → masuk CONSIDERATION jalur ini
   ❌ Tidak reply → Day 3 follow-up
   ❌ Tidak reply 3x → cold archive, bukan di-spam

5. Day 3 WA:
   "Hai kak [nama], sekedar follow-up.
   Kemarin sempet lihat [nama_toko] dan kayaknya punya potensi besar.
   Ada waktu sebentar untuk ngobrol minggu ini?"

6. Jika masih tidak reply → Day 7, Day 14 → archive.
   Jika reply kapanpun → handoff ke CONSIDERATION flow.

ESTIMASI CONVERSION:
  100 leads scraped → 40 HOT → 32 WA terkirim → 8-10 reply → 2-4 demo → 1-2 closing
  Conversion rate: 1-2% dari scrape, 5-12% dari outreach
```

---

### 🟢 JALUR B — Inbound IG (Warm → Hot)
*Sumber: Konten @fashionkas.official + @resellerkas.official + @haidar_faras_m*

```
LANGKAH DETAIL:

1. User lihat konten IG (salah satu dari 3 akun):
   @fashionkas.official → konten produk, testimonial reseller, "join reseller"
   @resellerkas.official → konten edukasi reseller, sistem, behind the scenes
   @haidar_faras_m → build in public, "from 5 jam/hari → 30 menit", hasil nyata

2. User klik bio link:
   @fashionkas → link ke katalog / form reseller
   @resellerkas → link ke landing mini "Gabung Reseller"
   @haidar_faras_m → link ke WhatsApp langsung atau form inquiry

3. Aksi yang dilakukan user (pilih salah satu):
   a. Isi form Google: nama, nomor WA, jumlah reseller sekarang, pain utama
   b. DM langsung: "Kak mau tanya soal sistemnya"
   c. Klik link katalog → lihat produk → mulai tanya harga

4. Response oleh Sovereign Engine:
   a. Form → masuk ke ai_tasks → Closer Agent kirim WA Day 0
   b. DM → Founder reply manual (WARM, sudah interest tinggi)
   c. Katalog view → tidak ada action (passive nurture)

5. WA atau DM reply → masuk CONSIDERATION.

ESTIMASI CONVERSION:
  Inbound sudah warm → conversion ke demo: 20-40%
  Demo ke closing: 40-60%
  Overall inbound CVR: 8-24%
  
KONTEN YANG MENDRIVE CONVERSION (prioritas):
  🥇 "Case study: [nama bisnis] dari X ke Y dalam Z hari" 
  🥈 "Demo 60 detik: ini tampilan dashboardnya"
  🥉 "5 tools yang owner fashion pakai — dan kenapa saya buang 4-nya"
```

---

### 🟣 JALUR C — Personal Brand Direct (Hot → Decision)
*Sumber: @haidar_faras_m — Build in Public*

```
LANGKAH DETAIL:

1. User follow @haidar_faras_m karena konten teknis/bisnis.
2. Lihat serangkaian konten:
   - "Saya build AI engine untuk otomasi bisnis fashion"
   - "Ini hasilnya setelah 3 bulan: [data nyata]"
   - "Yang bikin saya takjub: sistem ini bisa dikonfigurasi untuk bisnis kamu"

3. User DM: "Kak, gue mau beli sistemnya" atau "Bisa bantu setup ini di bisnis gue?"

4. Founder qualify dengan pertanyaan ringan:
   "Bisnis kamu di fashion juga? Berapa reseller aktif sekarang?"

5. Jika fit:
   → Langsung ke CONSIDERATION
   → Demo private dashboard via screen share
   → Tawarkan Tier 2 atau 3

ESTIMASI CONVERSION:
  Jalur ini paling tinggi intent: 40-60% → paying customer
  Tapi volume paling kecil (quality > quantity)
  
KUNCI KONTEN di @haidar_faras_m:
  ✅ Tunjukkan HASIL NYATA bukan feature list
  ✅ Angka spesifik: "dari 40 jam → 4 jam per minggu"
  ✅ Tunjukkan proses build (vulnerability = trust)
  ✅ JANGAN terlalu "vendor" — lebih ke "co-founder sharing journey"
```

---

## BAGIAN 3: CONSIDERATION STAGE (Demo & Objection)

### Flow Standard Demo:

```
1. Konfirmasi jadwal (WA):
   "Kapan bisa 15-20 menit untuk lihat sistemnya?
   Gue bisa screen share langsung jadi kamu bisa lihat dashboard-nya."

2. Pre-demo checklist (Founder harus tahu sebelum demo):
   □ Nama bisnis mereka
   □ Berapa reseller aktif
   □ Pakai tools apa sekarang
   □ Pain paling besar mereka (tanya dulu via WA)

3. Demo flow (15-20 menit via Zoom/WA video):
   [0-2 menit] Buka dashboard, tunjukkan tampilan → impresi visual pertama
   [2-5 menit] Tunjukkan order management → "ini yang replace Excel kamu"
   [5-8 menit] Tunjukkan send WA dengan 1 klik → demo ke nomor sendiri
   [8-12 menit] Tunjukkan AI lead scoring → "AI yang decide siapa yang worth difollow-up"
   [12-15 menit] Tunjukkan revenue dashboard → "ini yang kamu lihat tiap pagi"
   [15-20 menit] Q&A + objection handling

4. Close setelah demo:
   "Gimana, kira-kira cocok gak sama flow bisnis kamu?
   Kalau mau langsung coba, saya bisa setup dalam 1 hari.
   Pilih yang mana dulu — mulai dari Starter dulu atau langsung Growth?"

5. Jika tidak langsung close:
   → Tawarkan "Trial 14 hari gratis, setup dulu, kalau cocok baru bayar"
   → Set reminder untuk follow-up 3 hari kemudian
```

---

## BAGIAN 4: DECISION STAGE (Closing)

### Closing Scripts:

**Script 1: Direct Close (setelah demo positif)**
```
"Oke kak, kelihatannya [nama bisnis] cocok banget sama ini.
Biar gue langsung setup hari ini / besok ya?
Setup fee-nya Rp [X], terus Rp [Y]/bulan.
Transfer ke BCA [nomor rekening], konfirmasi via WA nanti ya."
```

**Script 2: Soft Close (ada hesitasi)**
```
"Gue ngerti, gak perlu buru-buru.
Gini aja — coba 14 hari gratis dulu.
Gue setup hari ini, kamu pakai, kalau setelah 2 minggu rasanya worth it, baru bayar setup fee.
Kalau gak cocok, gak ada kewajiban. Deal?"
```

**Script 3: ROI Close (objection harga)**
```
"Harga Rp 300K/bulan ini kira-kira setara dengan 6 jam kerja kamu per bulan.
Kamu sekarang buang berapa jam per bulan untuk rekap order dan follow-up WA?
Kalau jawabannya lebih dari 6 jam — ini sebenarnya menghemat waktu kamu."
```

---

## BAGIAN 5: POST-PURCHASE JOURNEY (Retention & Advocacy)

```
DAY 1: Onboarding
  □ Setup instance customer (Founder kerja ~30-60 menit)
  □ Kirim link + PIN via WA
  □ Onboarding call 1-2 jam (screen share, tunjukkan cara pakai)
  □ Kirim "Quick Start Guide" PDF via WA

DAY 7: Check-in
  □ WA: "Hai kak [nama], sudah seminggu pakai FashionOps.
         Ada yang perlu dibantu? Feature apa yang paling sering dipakai?"
  □ Note feedback → pakai untuk improve sistem

DAY 14: Value Reinforcement
  □ WA: "Kak, minggu ke-2 nih. Berapa order masuk minggu kemarin di dashboard?
         Bandingkan sama sebelumnya — saving waktu berapa jam?"
  □ Kalau jawab positif → minta testimonial (screenshot chat / rekaman WA)

DAY 30: Renewal + Upsell
  □ Ingatkan pembayaran bulan kedua
  □ Tanya: "Ada fitur baru yang kamu mau? Kita lagi develop AI scoring —
            mau di-include bulan depan?"
  □ Jika sudah aktif pakai → tawarkan upgrade ke tier berikutnya

DAY 60+: Advocacy Ask
  □ "Kak, ada teman owner fashion yang kira-kira cocok juga pakai FashionOps?
     Kalau referral-nya jadi customer, kamu dapat 1 bulan gratis."
  □ Referral program: 1 referral = 1 bulan free (Rp 300K value)
```

---

## BAGIAN 6: FUNNEL METRICS (Cara Ukur Performa)

```
TAHAP          METRIC UTAMA             TARGET AWAL
─────────────────────────────────────────────────────────
Awareness      IG reach per minggu      > 1.000 akun
               Follower growth/minggu   > 50 followers

Interest       Bio link clicks          > 50 klik/minggu
               WA inquiry masuk         > 5/minggu
               Form filled              > 3/minggu

Consideration  Demo booked              > 2/minggu
               Demo show rate           > 80%

Decision       Demo-to-close rate       > 30%
               Trial-to-paid rate       > 70%

Retention      30-day active usage      > 80%
               Month 2 renewal          > 70%
               NPS (Would you refer?)   > 8/10

Revenue        Monthly new customers    1 (Month 1) → 3 (Month 2) → 5+ (Month 3)
               MRR growth               +Rp 1-3 jt/bulan
               Churn rate               < 10%/bulan
```

### Dashboard Tracking (Sovereign Engine KPIs):
```sql
-- Tambahkan ke Supabase tracking:
CREATE TABLE funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT CHECK (stage IN ('awareness','interest','consideration','decision','retention')),
  channel TEXT CHECK (channel IN ('scout','inbound_fk','inbound_rk','inbound_founder','referral')),
  event_type TEXT,
  lead_id UUID REFERENCES leads(id),
  customer_id UUID REFERENCES customers(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## BAGIAN 7: CONTENT CALENDAR ALIGNMENT (IG Posting Guide)

```
@fashionkas.official — Conversion-focused:
  Senin:   "Reseller spotlight" — testimoni reseller sukses
  Rabu:    "Produk baru" — dengan CTA join reseller
  Jumat:   "Behind the scenes" — proses packing, operasi
  Sabtu:   "Selamat join [nama]!" — welcome post untuk reseller baru
  
@resellerkas.official — Community-focused:
  Selasa:  "Tips jualan baju online" — edukasi value
  Kamis:   "Q&A: pertanyaan reseller" — engagement
  Minggu:  "Weekly recap" — hasil minggu ini (order, reseller baru)
  
@haidar_faras_m — Build in Public:
  Senin:   "Weekly log" — apa yang dibangun minggu lalu
  Kamis:   "Lesson learned" — satu insight dari operasi nyata
  Sabtu:   "Data drop" — "Ini angkanya bulan ini: [metric nyata]"
  
RULE: Minimal 1 konten per minggu per akun yang tunjukkan HASIL NYATA.
      Bukan feature. Bukan teori. HASIL.
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Customer Journey & Funnel v1.0 — 3 jalur masuk, demo flow, retention, metrics |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
