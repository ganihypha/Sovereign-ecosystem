# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 29: AI DEV HANDOFF PACK
# (Panduan Lengkap untuk AI Developer — Reading Order, Execution Rules, Response Format)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-03 | Versi: 1.0

---

> *"AI dev yang baca dokumen secara acak = AI dev yang bakal salah eksekusi. Dokumen ini adalah onboarding kit agar AI dev paham konteks, prioritas, constraints, dan cara output yang benar sebelum menyentuh kode apa pun."*

---

## 🎯 TUJUAN DOKUMEN INI

Ini adalah **pintu masuk pertama** untuk setiap AI Developer yang bekerja di Sovereign Ecosystem.

Sebelum:
- Membuat kode baru
- Mengubah kode existing
- Membuat repo baru
- Mengubah database schema
- Membuat deployment baru

AI Dev WAJIB baca dokumen ini terlebih dahulu.

---

## 📌 PROJECT SUMMARY

```
╔══════════════════════════════════════════════════════════════════════╗
║                  SOVEREIGN BUSINESS ENGINE v4.0                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Founder:      Haidar Faras Maulia                                   ║
║  Company:      PT Waskita Cakrawarti Digital                         ║
║  Mission:      Build AI-powered business engine untuk fashion        ║
║                reseller Indonesia (Tier 1-3)                         ║
║                                                                      ║
║  Target:       Rp 75 Jt/bulan (Fase 3)                              ║
║  CCA Goal:     Claude Certified Architect Foundations — Week 12      ║
║  Live URL:     https://sovereign-orchestrator.pages.dev              ║
║                                                                      ║
║  Stack:        Hono + TypeScript + Cloudflare Pages + Supabase       ║
║  Agents:       LangGraph.js (edge) + CrewAI (deep analysis)          ║
║  WA:           Fonnte API                                            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 📚 READING ORDER WAJIB

### Untuk Sesi Build (Sprint/Feature)
Baca dalam urutan ini sebelum eksekusi:

```
1. 00-MASTER-INDEX.md          → Pahami 29 dokumen, posisi sekarang, next action
2. 26-CANONICAL-ARCHITECTURE-MAP.md  → Pahami target ecosystem + layer rules
3. 23-REPO-INVENTORY.md        → Pahami repo mana yang jadi apa
4. 24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md → Pahami DB structure
5. 28-MIGRATION-PHASE-PLAN.md  → Pahami phase mana yang sedang dikerjakan
6. 04-PROMPT-CONTRACT.md       → Pahami rules untuk agent development
7. 08-ACCEPTANCE-CRITERIA.md   → Pahami standar DONE

Baru setelah itu:
8. 07-MODULE-TASK-BREAKDOWN.md → Pilih task spesifik yang dikerjakan
9. 17-TASK-PROMPT-PACK-TEMPLATE.md → Format task yang benar
```

### Untuk Sesi Migrasi
```
1. 28-MIGRATION-PHASE-PLAN.md  → Phase mana yang aktif?
2. 27-MOTHER-REPO-STRUCTURE.md → Target folder structure
3. 23-REPO-INVENTORY.md        → Repo yang terlibat
4. 24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md → DB yang terlibat
5. 25-DEPLOYMENT-INVENTORY.md  → Deployment yang terlibat
6. 19-DECISION-LOG.md          → Keputusan yang sudah dibuat (jangan override!)
```

### Untuk Sesi Architecture Review
```
1. 01-NORTH-STAR-PRD.md        → North star alignment check
2. 02-SYSTEM-ARCHITECTURE-BRIEF.md → System big picture
3. 26-CANONICAL-ARCHITECTURE-MAP.md → Target architecture
4. 16-DISTILLED-BUILD-RULES.md → Quick decision rules
5. 06-SOVEREIGN-ARCHITECT-NOTES.md → Anthropic principles + CCA-F patterns
```

---

## 🚦 EXECUTION RULES — WAJIB DIIKUTI

### Rule 1: Selalu Cek Phase Aktif
```
Sebelum menulis kode apa pun, tanya diri sendiri:
"Ini masuk Phase berapa?"
"Apakah phase sebelumnya sudah selesai?"
Lihat di: 28-MIGRATION-PHASE-PLAN.md
```

### Rule 2: Jangan Ubah Yang Tidak Diminta
```
Hanya ubah/buat apa yang diminta dalam task.
Jangan "sekalian refactor" bagian lain.
Jangan "sekalian migrate DB" kalau task-nya hanya build feature.
```

### Rule 3: Output Harus Sesuai Format
```
Setiap output HARUS punya:
- File(s) yang dibuat/diubah
- Acceptance test yang bisa dirun
- Bukti output (curl command / test result)
- Apa yang belum dilakukan (jika ada batasan)
```

### Rule 4: Jangan Expose Credential
```
TIDAK BOLEH:
- Hardcode API key di kode
- Commit .dev.vars ke git
- Print credential ke log
- Expose credential di response API

HARUS:
- Selalu pakai env vars
- Selalu pakai .dev.vars untuk dev
- Selalu pakai Cloudflare Secrets untuk prod
```

### Rule 5: Catat Keputusan
```
Setiap keputusan arsitektur yang dibuat AI Dev HARUS dicatat
ke format ADR di 19-DECISION-LOG.md.
Minimal: konteks, pilihan, keputusan, konsekuensi.
```

### Rule 6: Validate Sebelum Irreversible Action
```
Sebelum:
- DELETE table / data
- Matikan deployment
- Merge database
- Hapus repo

Harus ada:
- Konfirmasi eksplisit dari Founder
- Backup yang sudah dibuat
- Rollback plan yang jelas
```

### Rule 7: Human Gate untuk Agent Actions
```
Semua agent action yang irreversible WAJIB ada human gate:
- WA blast ke banyak nomor → Founder approve dulu
- Auto-delete leads → Founder approve dulu
- External API call yang berbayar > $1 → Founder approve dulu
```

---

## 🎯 TUJUAN MIGRASI (Kenapa Ini Penting)

```
SAAT INI (April 2026):
  4 repo liar yang tidak terintegrasi
  Database mungkin tersebar di beberapa project
  Deployment manual tanpa CI/CD
  Shared code tidak ada (setiap app duplicate logic)

TARGET (Post-Migration):
  1 canonical mother repo sebagai governance center
  1 canonical database (Sovereign Bridge)
  CI/CD untuk semua app
  Shared packages untuk semua common logic
  Full agent orchestration layer
  CCA-F evidence vault

PRINSIP:
  Integrate first, rebuild later only if needed
  Migrasi bertahap (domain-by-domain, phase-by-phase)
  Repo lama tetap jalan selama transisi
  Keputusan selalu evidence-based
```

---

## 📋 REPO LIST

| Repo | URL | Role | Access |
|------|-----|------|--------|
| Fashionkas | https://github.com/ganihypha/Fashionkas.git | Public brand surface | Public |
| Resellerkas | https://github.com/ganihypha/Resellerkas.git | Reseller surface | Public |
| Sovereign Private OS | https://github.com/ganihypha/Sovereign.private.real.busines.orchest.git | Founder command center | Private |
| Mother Repo (NEW) | TBD — dibuat di Phase 1 | Canonical integration home | Private |

---

## 🔒 CONSTRAINTS — YANG TIDAK BOLEH DILAKUKAN

```
❌ JANGAN merge semua repo sekaligus
❌ JANGAN rebuild app dari nol tanpa instruksi eksplisit
❌ JANGAN merge semua database sekaligus
❌ JANGAN ganti deployment semua sekaligus
❌ JANGAN expose private info (credential, decision log) ke public
❌ JANGAN treat Fashionkas sebagai brain/control center
❌ JANGAN skip acceptance criteria dari 08-ACCEPTANCE-CRITERIA.md
❌ JANGAN abaikan decision log di 19-DECISION-LOG.md
❌ JANGAN override keputusan yang sudah ada tanpa ADR baru
```

---

## ✅ NON-GOALS (Yang BUKAN Tujuan Migrasi)

```
- Bukan untuk bikin brand/visual baru
- Bukan untuk ganti tech stack dari Hono ke framework lain
- Bukan untuk bikin fitur baru sebelum migration foundation selesai
- Bukan untuk belajar tech baru yang tidak sesuai blueprint
- Bukan untuk redesign UX/UI (fokus dulu ke backend integration)
```

---

## 📝 ACCEPTANCE STANDARD

Setiap output dari AI Dev dianggap DONE jika dan hanya jika:

```
1. FILE OUTPUT
   ✅ Semua file yang dijanjikan sudah dibuat / diubah
   ✅ Kode bisa di-build tanpa error (npm run build pass)
   ✅ TypeScript tidak ada type errors

2. FUNCTIONAL TEST
   ✅ curl test atau unit test tersedia dan PASS
   ✅ Happy path berjalan sesuai spec
   ✅ Error cases dihandle dengan proper response

3. ACCEPTANCE CRITERIA
   ✅ Semua kriteria dari 08-ACCEPTANCE-CRITERIA.md untuk modul ini PASS
   ✅ Quality gate terpenuhi

4. DOCUMENTATION
   ✅ ADR dicatat jika ada keputusan arsitektur
   ✅ Proof dicatat di 21-PROOF-TRACKER-LIVE.md
   ✅ Sprint log diupdate di 18-BUILD-SPRINT-LOG.md

5. SECURITY
   ✅ Tidak ada credential hardcoded
   ✅ Env vars dipakai dengan benar
   ✅ RLS Supabase aktif untuk tabel baru
```

---

## 📋 RESPONSE FORMAT YANG DIHARAPKAN

Setiap respons AI Dev yang signifikan harus mengikuti format ini:

```markdown
## TASK: [nama task]
**Status:** DONE / IN PROGRESS / BLOCKED

### OUTPUT
- File(s) yang dibuat/diubah
- Route yang ditambahkan
- Table yang dibuat

### TEST COMMAND
```bash
curl -X POST https://... -H "Authorization: Bearer TOKEN" -d '...'
# Expected response: { "success": true, ... }
```

### ACCEPTANCE CRITERIA STATUS
| Criteria | Status |
|----------|--------|
| [criteria 1] | ✅ PASS |
| [criteria 2] | ✅ PASS |

### KEPUTUSAN DIBUAT
- ADR-XXX: [keputusan] → Alasan: [alasan singkat]

### NEXT STEP
- Task berikutnya: [nama task]
- Blocker: [jika ada]
```

---

## 🚀 PROMPT TEMPLATES PER FASE

### Prompt untuk Phase 0 — Audit
```
Saya sedang di Phase 0 Sovereign Ecosystem Migration.
Tujuan: Audit semua yang ada sebelum mengubah apa pun.

Bantu saya:
1. Review repo list di 23-REPO-INVENTORY.md dan identifikasi info yang masih kosong
2. Review DB inventory di 24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md
3. Buat audit checklist yang bisa saya jalankan

CONSTRAINTS:
- Jangan ubah kode apa pun
- Jangan deploy apa pun
- Output hanya: daftar pertanyaan audit + template isian
```

### Prompt untuk Phase 1 — Mother Repo Skeleton
```
Phase 0 audit sudah selesai. Saya siap ke Phase 1.

Berdasarkan 27-MOTHER-REPO-STRUCTURE.md, bantu saya:
1. Init mother repo dengan Turborepo
2. Setup folder tree sesuai doc 27
3. Buat placeholder packages (package.json kosong)
4. Setup tsconfig.base.json + root .gitignore

CONSTRAINTS:
- Jangan tambahkan kode app dulu
- Jangan setup GitHub Actions dulu (Phase 3+)
- Ikuti naming conventions dari doc 27

OUTPUT yang diharapkan:
- Repo structure yang bisa di-clone
- npx turbo build jalan (walaupun output kosong)
```

### Prompt untuk Phase 3 — Sprint Task
```
Saya sedang mengerjakan Phase 3 — Sovereign Tower Hardening.
Task saat ini: [nama task dari 07-MODULE-TASK-BREAKDOWN.md]

Context files yang relevan:
- 03-BUILD-SPEC-PER-MODULE.md → spec modul ini
- 08-ACCEPTANCE-CRITERIA.md → standar done
- 04-PROMPT-CONTRACT.md → agent rules (jika task ini agent)
- 20-CREDENTIAL-REGISTRY.md → env vars yang tersedia

Task instruksi lengkap:
[copy instruksi task dari 07-MODULE-TASK-BREAKDOWN.md]

CONSTRAINTS:
- Pakai Hono + TypeScript + Cloudflare Pages
- Semua DB access via Supabase (env vars dari .dev.vars)
- JWT validation wajib untuk semua private routes
- Output JSON schema harus sesuai spec di 03 dan 04

OUTPUT yang diharapkan:
- Kode file yang dibuat/diubah
- curl test commands
- Acceptance criteria status
```

---

## 📊 DOKUMEN REFERENSI QUICK MAP

| Butuh apa | Buka dokumen |
|-----------|-------------|
| Peta semua dokumen | `00-MASTER-INDEX.md` |
| North star + user definition | `01-NORTH-STAR-PRD.md` |
| System architecture big picture | `02-SYSTEM-ARCHITECTURE-BRIEF.md` |
| Spec teknis per modul | `03-BUILD-SPEC-PER-MODULE.md` |
| Agent rules + output schema | `04-PROMPT-CONTRACT.md` |
| Revenue targets + market | `05-REVENUE-SCORECARD.md` |
| Anthropic patterns + anti-patterns | `06-SOVEREIGN-ARCHITECT-NOTES.md` |
| Sprint tasks + instruksi | `07-MODULE-TASK-BREAKDOWN.md` |
| Standar DONE | `08-ACCEPTANCE-CRITERIA.md` |
| CCA-F domain mapping | `09-CCA-ALIGNMENT-MAP.md` |
| Offer + pricing | `10-REVENUE-OFFER-SHEET.md` |
| Quick decision rules | `16-DISTILLED-BUILD-RULES.md` |
| Template prompt ke AI dev | `17-TASK-PROMPT-PACK-TEMPLATE.md` |
| Sprint progress log | `18-BUILD-SPRINT-LOG.md` |
| Architecture decisions | `19-DECISION-LOG.md` |
| Credentials + env vars | `20-CREDENTIAL-REGISTRY.md` |
| Bukti nyata (proof) | `21-PROOF-TRACKER-LIVE.md` |
| Repo inventory + decisions | `23-REPO-INVENTORY.md` |
| DB inventory + migration map | `24-DATABASE-INVENTORY-AND-MIGRATION-MAP.md` |
| Deployment inventory | `25-DEPLOYMENT-INVENTORY.md` |
| Target architecture | `26-CANONICAL-ARCHITECTURE-MAP.md` |
| Folder tree mother repo | `27-MOTHER-REPO-STRUCTURE.md` |
| Migration phase plan | `28-MIGRATION-PHASE-PLAN.md` |
| **Kamu sedang baca ini** | `29-AI-DEV-HANDOFF-PACK.md` |

---

## 🔄 LIVING DOCS — YANG HARUS DIUPDATE SETIAP SESI

| Dokumen | Update kapan |
|---------|-------------|
| `18-BUILD-SPRINT-LOG.md` | Setiap sesi build |
| `19-DECISION-LOG.md` | Setiap keputusan arsitektur/teknis |
| `21-PROOF-TRACKER-LIVE.md` | Setiap ada output nyata |
| `28-MIGRATION-PHASE-PLAN.md` | Setiap phase checklist berubah |

---

## ✅ CHECKLIST SEBELUM MULAI KERJA

```
WAJIB SEBELUM EKSEKUSI TASK APA PUN:

[ ] Sudah baca 00-MASTER-INDEX untuk context
[ ] Sudah tahu phase yang sedang aktif (dari 28)
[ ] Sudah tahu repo yang akan disentuh (dari 23)
[ ] Sudah tahu DB yang akan disentuh (dari 24)
[ ] Sudah tahu credentials yang dibutuhkan (dari 20)
[ ] Sudah tahu acceptance criteria (dari 08)
[ ] Tidak ada blocker yang belum diselesaikan
[ ] Founder sudah approve scope task ini
```

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-03 | AI Dev Handoff Pack v1.0 — reading order, rules, templates, response format |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
