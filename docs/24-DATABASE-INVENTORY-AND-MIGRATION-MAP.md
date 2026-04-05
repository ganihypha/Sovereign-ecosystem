# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 24: DATABASE INVENTORY & MIGRATION MAP
# (Inventory Supabase + Peta Migrasi Domain-by-Domain)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"Jangan merge semua database sekaligus. Migrasi domain-by-domain, bukan app-by-app. Dokumen ini adalah peta datamu — tanpa ini, AI dev akan asal merge dan data production bisa hancur."*

---

## 🎯 TUJUAN DOKUMEN INI

Dokumen ini menjawab:
- Supabase project mana yang sekarang ada?
- Domain data apa yang disimpan di mana?
- Mana yang overlap / redundan?
- Mana canonical database target?
- Urutan migrasi per domain yang aman?

**AI Dev WAJIB baca dokumen ini sebelum menyentuh database mana pun.**

---

## 📋 DATABASE INVENTORY TABLE

| # | Nama DB Project | Supabase URL (partial) | Domain Data | Key Tables | Auth? | Status | Critical? | Target Action |
|---|-----------------|------------------------|-------------|------------|-------|--------|-----------|---------------|
| 1 | **sovereign-main** (primary) | https://[id].supabase.co | Core operational: users, leads, orders, customers, agents | users, leads, products, orders, customers, wa_logs (planned) | ✅ YES | ✅ LIVE (8 tabel aktif) | ✅ SANGAT CRITICAL | 🎯 JADIKAN CANONICAL BRIDGE DB |
| 2 | **fashionkas-db** (if separate) | TBD — audit Phase 0 | Brand surface: lead capture, contact forms | TBD | TBD | ⚠️ PERLU AUDIT | TBD | 🔄 AUDIT → kemungkinan MERGE ke canonical |
| 3 | **resellerkas-db** (if separate) | TBD — audit Phase 0 | Reseller ops: orders, products, contacts | TBD | TBD | ⚠️ PERLU AUDIT | TBD | 🔄 AUDIT → kemungkinan MERGE ke canonical |

> **NOTE:** Isi baris fashionkas-db dan resellerkas-db setelah Phase 0 Audit.
> Bisa jadi mereka pakai 1 Supabase project yang sama — isi saat audit.

---

## 🗄️ TABEL EXISTING — sovereign-main (8 TABEL AKTIF)

Berdasarkan 00-MASTER-INDEX.md, sistem v3.0 sudah punya 8 tabel:

| # | Nama Tabel | Domain | Kritis? | Status |
|---|------------|--------|---------|--------|
| 1 | `users` | Auth / Identity | ✅ CRITICAL | ✅ Live |
| 2 | `leads` | Lead management | ✅ CRITICAL | ✅ Live |
| 3 | `products` | Product catalog | ✅ CRITICAL | ✅ Live |
| 4 | `orders` | Order management | ✅ CRITICAL | ✅ Live |
| 5 | `customers` | Customer data | ✅ CRITICAL | ✅ Live |
| 6 | (tabel 6 — TBD audit) | TBD | TBD | ✅ Live |
| 7 | (tabel 7 — TBD audit) | TBD | TBD | ✅ Live |
| 8 | (tabel 8 — TBD audit) | TBD | TBD | ✅ Live |

### Tabel yang Direncanakan (Sprint 1 Phase 1)
| # | Nama Tabel | Domain | Sprint |
|---|------------|--------|--------|
| 9 | `wa_logs` | WA Automation audit trail | Sprint 1 |
| 10 | `ai_tasks` | AI task queue | Sprint 1 |
| 11 | `ai_insights` | AI insights storage | Sprint 1 |
| 12 | `order_items` | Order line items | Sprint 1 |

---

## 🎯 CANONICAL DATABASE TARGET

```
╔══════════════════════════════════════════════════════════════╗
║          SOVEREIGN BRIDGE — CANONICAL SHARED DATABASE        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Project Name: sovereign-main (existing)                     ║
║  Platform: Supabase                                          ║
║  Role: Single Source of Truth untuk seluruh ecosystem        ║
║  Access: Semua app/agent baca/tulis lewat sini               ║
║                                                              ║
║  Yang akan disimpan:                                         ║
║  ✅ users / auth / roles                                     ║
║  ✅ leads (dari semua surface)                               ║
║  ✅ customers                                                ║
║  ✅ orders / order_items                                     ║
║  ✅ products                                                 ║
║  ✅ offers                                                   ║
║  ✅ wa_logs (WA automation trail)                            ║
║  ✅ ai_tasks (agent task queue)                              ║
║  ✅ ai_insights (agent output)                               ║
║  ✅ proof (CCA evidence + business proof)                    ║
║  ✅ decision_logs (ADR records)                              ║
║  ✅ weekly_reviews (founder review)                          ║
║  ✅ agent_runs / logs                                        ║
║  ✅ credential_registry (metadata, BUKAN nilai aktual)       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🗺️ DOMAIN MIGRATION MAP

### Priority Order: Dari yang Paling Critical ke Least Critical

| Priority | Domain | Tables Involved | Source DB | Target DB | Overlap Risk | Migration Approach | Status |
|----------|--------|----------------|-----------|-----------|-------------|-------------------|--------|
| P0 | **Auth / Users** | `users`, auth config | sovereign-main | sovereign-main (sudah di sini) | Low | KEEP — sudah canonical | ✅ DONE |
| P0 | **Core Operational** | `leads`, `customers`, `products`, `orders` | sovereign-main | sovereign-main | Low | KEEP — sudah canonical | ✅ DONE |
| P1 | **WA Automation** | `wa_logs` | sovereign-main (planned) | sovereign-main | None | CREATE di Sprint 1 | 🔴 NOT STARTED |
| P1 | **AI Agent State** | `ai_tasks`, `ai_insights` | sovereign-main (planned) | sovereign-main | None | CREATE di Sprint 1 | 🔴 NOT STARTED |
| P1 | **Order Line Items** | `order_items` | sovereign-main (planned) | sovereign-main | Low | CREATE di Sprint 1 | 🔴 NOT STARTED |
| P2 | **Fashionkas Leads** | leads from brand surface | fashionkas-db (TBD) | sovereign-main | ⚠️ MUNGKIN OVERLAP dengan leads | AUDIT → MERGE/PIPE | ⚠️ PERLU AUDIT |
| P2 | **Resellerkas Data** | orders, contacts from reseller surface | resellerkas-db (TBD) | sovereign-main | ⚠️ MUNGKIN OVERLAP | AUDIT → MERGE/PIPE | ⚠️ PERLU AUDIT |
| P3 | **Proof / Evidence** | proof records, CCA evidence | sovereign-main | sovereign-main | None | CREATE saat Phase 5 | 🔴 NOT STARTED |
| P3 | **Decision Logs** | ADR records | sovereign-main | sovereign-main | None | CREATE saat Phase 3 | 🔴 NOT STARTED |
| P3 | **Agent Runs / Logs** | agent execution logs, task history | sovereign-main | sovereign-main | None | CREATE saat Phase 4+ | 🔴 NOT STARTED |
| P4 | **Weekly Reviews** | founder review entries | sovereign-main | sovereign-main | None | CREATE saat Phase 3 | 🔴 NOT STARTED |

---

## 📐 MIGRATION STRATEGY RULES

```
ATURAN MIGRASI DATABASE — WAJIB DIIKUTI:

1. JANGAN merge semua database sekaligus
   → Migrasi domain-by-domain, bukan app-by-app

2. JANGAN destructive cutover
   → App lama boleh tetap ke DB lama selama transisi
   → Mulai kirim event/data ke canonical DB dulu
   → Baru pindah total setelah stable

3. Pakai ADAPTER pattern selama transisi
   → Dual-write: tulis ke DB lama + canonical
   → Validasi data match sebelum switch off DB lama

4. Canonical DB = sovereign-main
   → Ini yang diperkuat, BUKAN diganti
   → Semua app akhirnya point ke sini

5. Auth TIDAK boleh diduplikasi
   → 1 auth system saja (Supabase Auth di sovereign-main)
   → App lain pakai JWT yang digenerate dari sini

6. Credentials TIDAK disimpan sebagai value di DB
   → Hanya metadata (service name, status, lokasi)
   → Nilai asli di .dev.vars (dev) atau Cloudflare Secrets (prod)
```

---

## 🔍 PHASE 0 AUDIT CHECKLIST

```
DATABASE AUDIT — LAKUKAN SEBELUM MIGRASI APA PUN:

[ ] Cek: Berapa Supabase project yang aktif sekarang?
[ ] List semua tabel di sovereign-main (8 tabel — apa saja persis?)
[ ] Cek: Fashionkas pakai Supabase project sendiri atau pakai sovereign-main?
[ ] Cek: Resellerkas pakai Supabase project sendiri atau pakai sovereign-main?
[ ] Identifikasi: Tabel mana yang overlap antar project?
[ ] Identifikasi: Data mana yang sudah ada (jangan dihapus!)
[ ] Update tabel inventory di atas setelah audit
[ ] Tentukan: Yang perlu di-create baru vs yang sudah ada
```

---

## 🔗 DATA FLOW TARGET (Post-Migration)

```
FASHIONKAS (public)
    └── Lead capture form ──► POST /api/leads ──► sovereign-main.leads

RESELLERKAS (public)
    └── Reseller signup ────► POST /api/users ──► sovereign-main.users
    └── Order form ─────────► POST /api/orders ─► sovereign-main.orders

SOVEREIGN TOWER (private)
    └── Scout Agent ────────► READ/WRITE ────────► sovereign-main.leads
    └── Closer Agent ───────► READ/WRITE ────────► sovereign-main.wa_logs
    └── AI Tasks ───────────► READ/WRITE ────────► sovereign-main.ai_tasks
    └── Proof Tracker ──────► READ/WRITE ────────► sovereign-main.proof

CUSTOMER WORKSPACE
    └── Customer dashboard ─► READ ───────────────► sovereign-main (subset)
```

---

## 🛡️ KEAMANAN & COMPLIANCE

| Rule | Detail |
|------|--------|
| RLS (Row Level Security) | Wajib diaktifkan untuk semua tabel yang punya user data |
| Service Role Key | Hanya dipakai server-side (Hono API), TIDAK boleh exposed ke client |
| Anon Key | Hanya untuk operasi yang memang public (contoh: lead capture form) |
| Backup | Supabase auto-backup — tambah manual backup sebelum migrasi besar |
| Audit Trail | Semua operasi CRUD penting harus ada di wa_logs / ai_tasks / relevant log table |

---

## 📊 SCHEMA DOMAINS OVERVIEW

```
DOMAIN 1 — IDENTITY & ACCESS
  users (id, email, role, created_at)
  [auth dihandle Supabase Auth + JWT custom]

DOMAIN 2 — COMMERCE CORE
  leads (id, name, phone, ig_handle, score, source, status, created_at)
  customers (id, user_id, tier, onboarded_at, status)
  products (id, name, sku, price, stock, category)
  orders (id, customer_id, total, status, channel, created_at)
  order_items (id, order_id, product_id, qty, price)

DOMAIN 3 — WA AUTOMATION
  wa_logs (id, recipient, message, status, fonnte_id, sent_at)

DOMAIN 4 — AI AGENT STATE
  ai_tasks (id, agent, task_type, input, status, result, created_at)
  ai_insights (id, agent, insight_type, content, generated_at)

DOMAIN 5 — GOVERNANCE & PROOF
  decision_logs (id, adr_number, title, context, decision, consequences, date)
  proof_entries (id, category, title, evidence_url, verified, date)
  weekly_reviews (id, week_number, answers_json, created_at)

DOMAIN 6 — AGENT OPERATIONS
  agent_runs (id, agent_name, trigger, status, duration_ms, output, created_at)
  credit_ledger (id, service, action, tokens_used, cost_usd, date)
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | Database Inventory v1.0 — inventory + domain migration map |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
