# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 13: MODULE SPEC — MONETIZABLE FEATURES
# (5 Modul yang Langsung Bisa Dijual — Spec Granular per Fitur Komersial)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Architecture doc menjelaskan layer besar. Dokumen ini menjelaskan apa yang benar-benar dirasakan dan dibeli customer — satu fitur dalam satu waktu."*

---

## PETA MODUL KOMERSIAL

```
╔══════════════════════════════════════════════════════════════════════╗
║   TIER 1 (Starter)    │  TIER 2 (Growth)   │  TIER 3 (Enterprise)   ║
╠══════════════════════════════════════════════════════════════════════╣
║  ✅ Lead Inbox        │  + AI Lead Finder   │  + Market Intel        ║
║  ✅ WA Follow-up      │  + AI WA Composer   │  + AI Crew Analysis    ║
║  ✅ Order Capture     │  + Auto-Sequence    │  + Revenue Forecast    ║
║  ✅ Sales Report      │  + Analytics Plus   │  + Custom AI Agents    ║
║  ✅ Owner Dashboard   │  + Reseller Mgmt+   │  + Source Code License ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## MODUL 1: LEAD INBOX (Semua Tier)

### Apa Ini (Bahasa Customer):
> *"Kumpulkan semua calon reseller di satu tempat — siapa yang tertarik, siapa yang perlu difollow-up, siapa yang sudah jadi customer."*

### Pain yang Diselesaikan:
```
Sebelum: "Saya simpan kontak calon reseller di HP, tapi gak tau mana yang sudah 
          dihubungi dan mana yang belum."

Sesudah: "Semua ada di dashboard. Ada label HOT/WARM/COLD, ada catatan, ada 
          histori kontak. Tidak ada yang kelewatan."
```

### Fitur dalam Modul (Bahasa User):
| # | Fitur | Deskripsi | Tier |
|---|-------|-----------|------|
| 1.1 | Tambah lead manual | Input nama, toko, nomor WA | Semua |
| 1.2 | Filter HOT/WARM/COLD | Lihat lead berdasarkan kategori | Semua |
| 1.3 | Catatan per lead | Simpan konteks "sudah ngobrol tentang apa" | Semua |
| 1.4 | Status tracking | New / Contacted / Negotiating / Converted / Lost | Semua |
| 1.5 | Temukan lead dari IG | AI scrape Instagram, auto-add ke inbox | Tier 2+ |
| 1.6 | AI Scoring | AI labeling HOT/WARM/COLD berdasarkan profil | Tier 2+ |
| 1.7 | Bulk import | Upload daftar leads via CSV | Tier 2+ |

### API yang Melayani Modul Ini:
```
GET  /api/scout/leads          → List semua leads + filter
POST /api/scout/leads          → Tambah lead manual
PUT  /api/scout/leads/:id      → Update data/status
DELETE /api/scout/leads/:id    → Hapus lead
POST /api/scout/gather         → Scrape leads dari IG (Tier 2+)
POST /api/scout/ai-score       → AI scoring (Tier 2+)
```

### UI Component:
```
Halaman: /app/scout

Layout:
  Header: "Lead Inbox — 10 total | 6 HOT | 2 WARM | 2 COLD"
  Filter bar: [Semua] [HOT] [WARM] [COLD] [Converted]
  Search: cari by nama toko atau username
  
  Table columns:
    Nama Toko | Platform | Score | Label | Status | Aksi
    
  Per baris action buttons:
    [AI Score] [Compose WA] [View Detail] [Edit] [Delete]
    
  "Gather from IG" button (Tier 2+):
    → Input: query keyword
    → Output: toast "X leads added"
```

### Acceptance Criteria (Customer-Facing):
```
✅ Customer bisa tambah 50 leads dalam 10 menit (manual entry)
✅ Label HOT/WARM/COLD tampil dengan warna yang jelas
✅ Filter bekerja instan tanpa reload
✅ Setiap lead punya kolom notes untuk catatan
✅ Tidak ada data yang hilang (persistent di Supabase)
```

---

## MODUL 2: WA FOLLOW-UP ENGINE (Semua Tier)

### Apa Ini (Bahasa Customer):
> *"Kirim WhatsApp ke reseller dengan sekali klik — bisa manual satu-satu, atau otomatis berurutan (Day 0, 3, 7, 14)."*

### Pain yang Diselesaikan:
```
Sebelum: "Setiap hari saya ketik WhatsApp yang isinya hampir sama ke calon reseller.
          Kadang lupa siapa yang sudah dihubungi dan yang belum."

Sesudah: "Klik 'Send WA', pesan sudah pergi. Ada log semua WA yang dikirim.
          AI yang nulis pesannya — personal, bukan copy-paste template."
```

### Fitur dalam Modul:
| # | Fitur | Deskripsi | Tier |
|---|-------|-----------|------|
| 2.1 | Kirim WA manual | Pilih template, pilih nomor, klik send | Semua |
| 2.2 | Template WA | 4 template siap pakai (Day 0/3/7/14) | Semua |
| 2.3 | Log WA terkirim | Histori semua WA dengan status (sent/failed) | Semua |
| 2.4 | Device status | Cek apakah WA Fonnte terhubung | Semua |
| 2.5 | AI Compose | AI buat pesan personal (nama toko disebut) | Tier 2+ |
| 2.6 | Auto-sequence | Day 0/3/7/14 otomatis terscheduled | Tier 2+ |
| 2.7 | Bulk send | Kirim ke 10+ nomor sekaligus | Tier 2+ |
| 2.8 | Response tracking | Mark WA sebagai "dibalas" untuk follow-up prioritas | Semua |

### API yang Melayani Modul Ini:
```
POST /api/wa/send               → Single send via Fonnte
POST /api/wa/broadcast          → Bulk send
GET  /api/wa/status             → Device status check
POST /api/closer/ai-compose     → AI compose message (Tier 2+)
POST /api/closer/sequence       → Schedule Day 0/3/7/14 (Tier 2+)
GET  /api/closer/logs           → Audit trail WA
```

### UI Component:
```
Halaman: /app/closer

Tab 1: "Compose & Send"
  Dropdown: Pilih lead (dari HOT leads)
  Dropdown: Template (Day 0 / Day 3 / Day 7 / Day 14 / Custom)
  Tombol "Generate with AI" → preview pesan
  Preview box: pesan hasil AI (bisa diedit manual)
  Tombol "Send via Fonnte" → confirmation dialog → send
  
Tab 2: "WA Log"
  Table: Phone | Pesan (preview) | Status | Template | Tanggal
  Filter: [Semua] [Sent] [Failed] [Replied]
  
Widget kecil (top right): 
  "WhatsApp Status: 🟢 Connected" atau "🔴 Disconnected"
```

### Acceptance Criteria:
```
✅ Pesan WA benar-benar terkirim dan diterima (test ke nomor sendiri)
✅ Log mencatat setiap WA yang dikirim
✅ AI compose menghasilkan pesan yang menyebut nama toko yang benar
✅ Device status widget update real-time
✅ Rate limit: tidak bisa kirim 2x ke nomor yang sama dalam 24 jam
✅ Error handled: Fonnte disconnected → pesan error jelas, bukan crash
```

---

## MODUL 3: ORDER CAPTURE & MANAGEMENT (Semua Tier)

### Apa Ini (Bahasa Customer):
> *"Input dan kelola semua order di satu tempat — dari pending sampai selesai. Tidak ada order yang kelewatan atau lupa diproses."*

### Pain yang Diselesaikan:
```
Sebelum: "Order masuk dari IG DM, WA, dan teman-teman. Saya simpan di WhatsApp
          tapi sering tercecer. Tidak tahu mana yang sudah dikirim."

Sesudah: "Semua order ada di dashboard. Status jelas: pending, proses, selesai.
          Satu klik update status. Rekap otomatis."
```

### Fitur dalam Modul:
| # | Fitur | Deskripsi | Tier |
|---|-------|-----------|------|
| 3.1 | Tambah order | Input: customer, produk, jumlah, harga, catatan | Semua |
| 3.2 | Status tracking | Pending → Processing → Shipped → Completed → Cancelled | Semua |
| 3.3 | Line items | Multi-produk dalam satu order | Semua |
| 3.4 | Filter & search | Filter by status, customer, tanggal | Semua |
| 3.5 | Order summary | Total items, total harga per order | Semua |
| 3.6 | Quick status update | Klik status di tabel tanpa buka detail | Semua |
| 3.7 | Export ke CSV | Download data order | Tier 2+ |
| 3.8 | Unpaid invoice alert | Highlight order yang belum lunas | Semua |

### API yang Melayani Modul Ini:
```
GET    /api/orders              → List orders dengan filter
POST   /api/orders              → Buat order baru
PUT    /api/orders/:id          → Update order (status, data)
DELETE /api/orders/:id          → Hapus order
GET    /api/orders/:id/items    → Line items per order
POST   /api/orders/:id/items    → Tambah item ke order
```

### UI Component:
```
Halaman: /app/orders

Summary bar: "Total: 8 | Pending: 2 | Processing: 1 | Completed: 5"
Filter: [Semua] [Pending] [Processing] [Completed] [Cancelled]
Search: cari by nama customer atau produk
Tombol: [+ Tambah Order]

Table columns:
  # | Customer | Produk (summary) | Total | Status | Tanggal | Aksi
  
Status badge: klik langsung ubah status (dropdown inline)

Modal "Tambah Order":
  - Dropdown customer (dari customers table)
  - Add product line items (produk + qty + harga)
  - Auto-calculate total
  - Notes field
  - Status awal: Pending
```

### Acceptance Criteria:
```
✅ Order baru tersimpan dan muncul di tabel dalam 1 detik
✅ Update status dari tabel tanpa buka halaman baru (inline edit)
✅ Total otomatis dihitung dari line items
✅ Filter bekerja benar (status sesuai yang dipilih)
✅ Order yang sudah "completed" ikut ke revenue calculation di dashboard
✅ Unpaid orders (pending/processing) ikut ke unpaid invoice total
```

---

## MODUL 4: SALES REPORT & ANALYTICS (Semua Tier)

### Apa Ini (Bahasa Customer):
> *"Lihat berapa omzet hari ini, minggu ini, bulan ini. Produk apa yang paling laku. Customer mana yang paling banyak beli. Semua otomatis — tidak perlu Excel."*

### Pain yang Diselesaikan:
```
Sebelum: "Saya rekap omzet tiap malam dari catatan chat. Kadang salah hitung.
          Tidak tahu produk mana yang sebaiknya di-restock."

Sesudah: "Buka dashboard, angka sudah ada. Revenue hari ini, minggu ini, bulan ini.
          Langsung tahu yang mana worth di-push."
```

### Fitur dalam Modul:
| # | Fitur | Deskripsi | Tier |
|---|-------|-----------|------|
| 4.1 | Revenue summary | Total hari ini / minggu / bulan | Semua |
| 4.2 | Revenue growth % | Perbandingan vs periode lalu | Semua |
| 4.3 | Top products | Produk terlaris berdasarkan order | Semua |
| 4.4 | Unpaid invoices | Total order belum lunas | Semua |
| 4.5 | AOV (Average Order Value) | Rata-rata nilai per order | Semua |
| 4.6 | Customer stats | Siapa yang paling banyak order | Semua |
| 4.7 | Conversion funnel | Lead → Contacted → Converted | Tier 2+ |
| 4.8 | AI-generated insights | "Produk X naik 30% — pertimbangkan restock" | Tier 2+ |
| 4.9 | Revenue forecast | Prediksi 7 hari ke depan | Tier 3 |

### API yang Melayani Modul Ini:
```
GET /api/dashboard/stats          → Summary metrics
GET /api/dashboard/activity       → Recent orders + leads
GET /api/dashboard/ai-insights    → AI insights (Tier 2+)
GET /api/reports/revenue          → Revenue breakdown
GET /api/reports/products         → Product analytics
GET /api/reports/leads            → Lead conversion analytics
```

### UI Component:
```
Halaman: /app/dashboard (utama) + /app/reports (detail)

Dashboard — Stat Cards (4 cards):
  [Revenue Hari Ini] [Orders Total] [Hot Leads] [Customers]
  Setiap card: angka besar + perubahan % vs kemarin

Dashboard — Engine Status:
  Brand Machine @fashionkas: 🟢 ACTIVE
  Growth Engine @resellerkas: 🟢 ACTIVE
  Trust Engine @haidar_faras_m: 🟢 ACTIVE

Dashboard — AI Insights (Tier 2+):
  3 insight terbaru dengan action button

Reports Page:
  Tab: Revenue | Products | Leads | Customers
  Revenue chart: bar chart per hari/minggu/bulan
  Products table: nama, terjual, revenue, trend
```

### Acceptance Criteria:
```
✅ Revenue hari ini akurat (sama dengan sum orders status=completed hari ini)
✅ Growth % ada nilainya (tidak blank kalau ada data minggu lalu)
✅ Top product muncul berdasarkan jumlah terjual
✅ Dashboard load < 2 detik
✅ Tidak ada angka "null" — kalau data kosong, tampilkan "0" atau "-"
✅ AI insights muncul di dashboard (Tier 2+)
```

---

## MODUL 5: OWNER DASHBOARD / COMMAND CENTER (Semua Tier)

### Apa Ini (Bahasa Customer):
> *"Halaman utama yang tunjukkan semuanya: bisnis kamu hari ini sehat atau tidak. Satu pandang, tahu harus ngapain."*

### Pain yang Diselesaikan:
```
Sebelum: "Pagi-pagi saya harus buka 5 aplikasi: WA, IG, Excel, Notes, kalkulator.
          Baru bisa tahu bisnis kemarin gimana."

Sesudah: "Buka 1 link, masukkan PIN, semuanya ada. Revenue, order, leads, 
          AI langsung kasih tahu yang mana harus dikerjakan hari ini."
```

### Fitur dalam Modul:
| # | Fitur | Deskripsi | Tier |
|---|-------|-----------|------|
| 5.1 | PIN login | 4-digit access, tidak ada username/password | Semua |
| 5.2 | Stat cards | Revenue, Orders, Leads, Customers — satu pandang | Semua |
| 5.3 | Engine status | 3 layer brand: active/inactive | Semua |
| 5.4 | Recent activity | 10 order + 10 lead terbaru | Semua |
| 5.5 | AI Daily Brief | 3 hal yang harus dikerjakan hari ini | Tier 2+ |
| 5.6 | Alert system | Unpaid invoice, hot lead uncontacted, WA disconnected | Semua |
| 5.7 | Mobile responsive | Bisa buka dari HP | Semua |
| 5.8 | Quick actions | Tambah order, tambah lead, kirim WA — dari dashboard | Semua |

### API yang Melayani Modul Ini:
```
GET /api/auth/login           → PIN authentication
GET /api/auth/verify          → Token validation
GET /api/dashboard/stats      → All metrics
GET /api/dashboard/activity   → Recent activity
GET /api/dashboard/ai-insights → AI brief (Tier 2+)
```

### UI Component:
```
Landing Page (/):
  Header: "SOVEREIGN BUSINESS ENGINE" + 3 brand tiles
  CTA: "Founder Access" → redirect ke /app/login

Login Page (/app/login):
  PIN keypad 4-digit
  "Enter your 4-digit PIN"
  Max 5 attempts

Dashboard (/app/dashboard):
  Sidebar navigation (desktop) / hamburger (mobile)
  Main area: stat cards + activity + AI brief
  
Sidebar items:
  🏠 Dashboard
  🔍 Scout Agent (Lead Inbox)
  📱 Closer Agent (WA Outreach)
  🤖 AI Intelligence
  📦 Inventory
  📋 Orders
  👥 Customers
  📊 Reports
  🌐 Validation
  ⚙️ Settings
```

### Acceptance Criteria:
```
✅ Login dengan PIN benar → dashboard dalam < 2 detik
✅ Login dengan PIN salah → error jelas + counter attempts
✅ Dashboard load di mobile (375px) tanpa horizontal scroll
✅ Semua stat cards tampil angka real (tidak loading spinner selamanya)
✅ Alert muncul kalau ada unpaid invoice atau hot lead uncontacted
✅ Sidebar collapse di mobile, expand di desktop
✅ Quick action buttons bekerja (modal/redirect yang benar)
```

---

## MONETIZATION MAPPING

```
╔═══════════════════════════════════════════════════════════════╗
║  MODUL               TIER 1    TIER 2    TIER 3               ║
╠═══════════════════════════════════════════════════════════════╣
║  1. Lead Inbox         ✅ Full   ✅ +AI     ✅ +AI+Bulk         ║
║  2. WA Follow-up       ✅ Manual ✅ +AI+Seq ✅ +Advanced        ║
║  3. Order Capture      ✅ Full   ✅ +Export ✅ +API access       ║
║  4. Sales Report       ✅ Basic  ✅ +Insight✅ +Forecast         ║
║  5. Owner Dashboard    ✅ Full   ✅ +AI Brief✅ +Custom           ║
╠═══════════════════════════════════════════════════════════════╣
║  Setup Fee             1.5 jt   3.5 jt    7.5-15 jt           ║
║  Monthly               300K     750K      1.5-3 jt             ║
╚═══════════════════════════════════════════════════════════════╝

UPSELL PATH:
  Tier 1 customer → setelah 2 bulan → tunjukkan AI features yang mereka missing
  Demo: "Ini yang bisa dipakai kalau upgrade ke Growth..."
  Close: "Upgrade-nya cuma tambah Rp 450K/bulan, tapi hemat [X jam] extra."
```

---

## FEATURE FLAG IMPLEMENTATION

```typescript
// Cara implementasi feature flags per tier di Hono.js
// Simpan di customers.tier ('starter' | 'growth' | 'enterprise')

type CustomerTier = 'starter' | 'growth' | 'enterprise';

const FEATURE_FLAGS: Record<string, CustomerTier[]> = {
  'lead_manual_entry':    ['starter', 'growth', 'enterprise'],
  'lead_ai_scoring':      ['growth', 'enterprise'],
  'lead_ig_gather':       ['growth', 'enterprise'],
  'wa_manual_send':       ['starter', 'growth', 'enterprise'],
  'wa_ai_compose':        ['growth', 'enterprise'],
  'wa_auto_sequence':     ['growth', 'enterprise'],
  'reports_basic':        ['starter', 'growth', 'enterprise'],
  'reports_ai_insights':  ['growth', 'enterprise'],
  'reports_forecast':     ['enterprise'],
  'crewai_analysis':      ['enterprise'],
};

function hasFeature(customerTier: CustomerTier, feature: string): boolean {
  const allowedTiers = FEATURE_FLAGS[feature] || [];
  return allowedTiers.includes(customerTier);
}

// Middleware untuk check feature access
function requireFeature(feature: string) {
  return async (c: Context, next: Next) => {
    const customerTier = c.get('customerTier') as CustomerTier;
    if (!hasFeature(customerTier, feature)) {
      return c.json({ 
        error: 'Feature not available in your tier', 
        code: 'UPGRADE_REQUIRED',
        available_from: FEATURE_FLAGS[feature]?.[0] || 'growth'
      }, 403);
    }
    await next();
  };
}
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Module Spec Monetizable v1.0 — 5 modules, feature flags, tier mapping |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
