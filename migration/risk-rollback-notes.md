# SOVEREIGN BUSINESS ENGINE v4.0
# MIGRATION RISK & ROLLBACK NOTES
## Session 3c — Sprint 1 DB Migration
### Date: 2026-04-04 | Author: AI Developer (Session 3c)
### ⚠️ CLASSIFIED — FOUNDER MUST READ BEFORE RUNNING ANY MIGRATION

---

> **PERINGATAN**: Dokumen ini WAJIB dibaca founder sebelum menjalankan migration apapun.
> Setiap migration yang sudah dirun tidak bisa di-"undo" secara otomatis.
> Ikuti rollback procedure dengan hati-hati.

---

## 🚨 GOLDEN RULES SEBELUM MIGRATION

```
1. SELALU BACKUP Supabase sebelum run (Supabase Dashboard → Settings → Backups)
2. RUN DI LOCAL/DEV DULU sebelum production
3. VERIFY dependency tables sudah ada sebelum run setiap file
4. SATU FILE SATU SESI — jangan run semua sekaligus tanpa verifikasi
5. SIMPAN log output Supabase SQL Editor setelah setiap run
```

---

## 📊 RISK MATRIX

| Migration | Risk Level | Risk Description | Mitigation |
|-----------|-----------|------------------|-----------|
| 001-wa-logs.sql | 🟡 MEDIUM | Depends on leads/customers/users LIVE | Dry-run check queries provided |
| 002-ai-tasks.sql | 🟡 MEDIUM | Adds FK to wa_logs (alters existing table) | Run AFTER 001 verified |
| 003-ai-insights.sql | 🟢 LOW | Only depends on ai_tasks | Run AFTER 002 verified |
| 004-order-items.sql | 🟡 MEDIUM | Depends on orders/products LIVE | Pre-check queries provided |
| 005-credit-ledger.sql | 🟢 LOW | Only depends on ai_tasks | Run AFTER 002 verified |

---

## 🔁 ROLLBACK PROCEDURES

### Rollback 001-wa-logs.sql
```sql
-- Jika 002-ai-tasks.sql SUDAH dirun, hapus FK dulu:
ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS fk_wa_logs_ai_task;
-- Kemudian hapus tabel:
DROP TABLE IF EXISTS wa_logs CASCADE;
-- Verifikasi:
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wa_logs');
-- Expected: false
```

### Rollback 002-ai-tasks.sql
```sql
-- PENTING: Hapus FK dari wa_logs dulu:
ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS fk_wa_logs_ai_task;
-- Hapus tabel ai_tasks (CASCADE akan hapus FK di ai_insights, credit_ledger):
DROP TABLE IF EXISTS ai_tasks CASCADE;
-- Verifikasi:
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tasks');
-- Expected: false
```

### Rollback 003-ai-insights.sql
```sql
-- Simple — tidak ada tabel lain yang depend ke ai_insights:
DROP TABLE IF EXISTS ai_insights CASCADE;
```

### Rollback 004-order-items.sql
```sql
-- Simple — tidak ada tabel lain yang depend ke order_items:
DROP TABLE IF EXISTS order_items CASCADE;
-- CATATAN: Jika ada data di order_items, ini akan HAPUS SEMUA DATA
-- Backup dulu sebelum rollback!
```

### Rollback 005-credit-ledger.sql
```sql
-- Simple:
DROP TABLE IF EXISTS credit_ledger CASCADE;
```

### Full Sprint 1 Rollback (semua sekaligus)
```sql
-- Urutan rollback: hapus dari yang paling dependen ke yang paling dasar
-- CATATAN: ini akan HAPUS SEMUA DATA yang sudah masuk ke tabel baru

-- Step 1: Hapus tabel yang dependen ke ai_tasks dulu
DROP TABLE IF EXISTS credit_ledger CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;

-- Step 2: Hapus FK dari wa_logs ke ai_tasks
ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS fk_wa_logs_ai_task;

-- Step 3: Hapus ai_tasks
DROP TABLE IF EXISTS ai_tasks CASCADE;

-- Step 4: Hapus wa_logs
DROP TABLE IF EXISTS wa_logs CASCADE;

-- Step 5: Hapus order_items (independent)
DROP TABLE IF EXISTS order_items CASCADE;

-- Verifikasi semua sudah hilang:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('wa_logs','ai_tasks','ai_insights','order_items','credit_ledger');
-- Expected: 0 rows
```

---

## ⚠️ PARTIAL FAILURE SCENARIOS

### Scenario 1: 001 berhasil, 002 gagal di tengah
```
Situation: wa_logs table ada, ai_tasks table tidak ada/partial
Risk: FK dari wa_logs ke ai_tasks tidak ada → wa_logs.ai_task_id kolom ada tapi tanpa constraint
Action: 
  1. Cek apakah ai_tasks sudah ada: SELECT EXISTS(...WHERE table_name='ai_tasks')
  2. Jika tidak: run 002 ulang (CREATE TABLE IF NOT EXISTS aman untuk re-run)
  3. Jika partial: DROP TABLE ai_tasks CASCADE, run 002 ulang
```

### Scenario 2: 002 gagal saat ALTER TABLE wa_logs
```
Situation: ai_tasks sudah dibuat tapi FK ke wa_logs belum ditambahkan
Risk: wa_logs.ai_task_id tidak ada FK constraint
Action:
  Jalankan manual:
  ALTER TABLE wa_logs ADD CONSTRAINT fk_wa_logs_ai_task 
    FOREIGN KEY (ai_task_id) REFERENCES ai_tasks(id) ON DELETE SET NULL;
```

### Scenario 3: 004 gagal karena orders/products belum ada
```
Situation: Error "relation 'orders' does not exist"
Risk: order_items tidak dibuat
Action:
  1. Verify orders dan products sudah LIVE di Supabase
  2. Jika belum: periksa Sovereign Engine v3.0 schema
  3. Jangan lanjutkan sampai pre-requisites confirmed
```

---

## 🔒 IRREVERSIBLE ACTIONS (Human Gate Required)

Berikut actions yang **TIDAK BISA DI-UNDO** dan butuh persetujuan sadar founder:

| Action | Consequence | Gate |
|--------|------------|------|
| `DROP TABLE ... CASCADE` | Semua data dalam tabel terhapus permanen | Founder confirm backup ada |
| `ALTER TABLE ... DROP COLUMN` | Kolom dan datanya hilang permanen | Tidak dilakukan di Sprint 1 |
| Menjalankan migration di production | Schema berubah di live DB | Founder checklist lengkap |

---

## 📋 PRE-MIGRATION CHECKLIST (FOUNDER SIGN-OFF)

Sebelum menjalankan migration Sprint 1 di **PRODUCTION**:

```
[ ] Supabase backup sudah dibuat dan diverifikasi
[ ] .dev.vars sudah terisi semua credentials
[ ] Migration sudah ditest di Supabase SQL Editor (staging/local)
[ ] Tower app sudah bisa start dengan wrangler pages dev
[ ] Semua 5 migration files sudah dibaca dan dipahami
[ ] Rollback procedure sudah dipahami
[ ] Session 3d AI Dev siap untuk wire modules setelah migration
```

**Founder Sign-Off**: _________________________ | Date: __________

---

## 📌 SAFE MIGRATION BEHAVIORS (sudah diimplementasikan)

Semua 5 migration files sudah pakai pattern aman:

1. **`CREATE TABLE IF NOT EXISTS`** — aman untuk re-run (idempotent)
2. **`CREATE INDEX IF NOT EXISTS`** — aman untuk re-run
3. **`CREATE POLICY "..." ON ...`** — TIDAK idempotent (hapus policy dulu jika re-run)
4. **`ALTER TABLE ENABLE ROW LEVEL SECURITY`** — idempotent
5. **`ALTER TABLE ... ADD CONSTRAINT`** — TIDAK idempotent; error jika sudah ada

**Jika perlu re-run setelah partial failure:**
```sql
-- Drop policies dulu sebelum re-run:
DROP POLICY IF EXISTS "service_role_full_access" ON <table_name>;
-- Drop constraint jika 002 gagal:
ALTER TABLE wa_logs DROP CONSTRAINT IF EXISTS fk_wa_logs_ai_task;
```

---

*Document created: Session 3c — 2026-04-04*  
*Next review: After Sprint 1 migration execution*
