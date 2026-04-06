# 22 – WEEKLY FOUNDER REVIEW
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** LIVING DOCUMENT – Isi setiap Minggu (hari Ahad/Senin pagi)
**Repo:** https://github.com/ganihypha/Sovereign.private.real.busines.orchest

---

## CARA PAKAI DOKUMEN INI

> **Prinsip:** Ini bukan laporan untuk orang lain. Ini cermin mingguan untuk diri sendiri.
> Jawab 5 pertanyaan inti dengan jujur. Maksimal 30 menit per review.
> Buat entry baru di atas (terbaru di atas, terlama di bawah).

**5 Pertanyaan Inti Tiap Minggu:**
1. **APA yang dibangun minggu ini?** (output konkret)
2. **PROOF apa yang ada?** (bukti verifiable)
3. **Sales/Monetisasi** – progress pipeline klien?
4. **CCA-F** – bab apa yang dibaca minggu ini?
5. **Fokus minggu depan** – 3 prioritas teratas

**Jika tidak ada yang bisa diisi → pertanda minggu terbuang → perlu introspeksi.**

---

## REVIEW TEMPLATE (Copy-paste untuk minggu baru)

```markdown
---

## WEEK [N] – [Tanggal Senin] s/d [Tanggal Minggu]
**Sprint:** Sprint [X] | **Hari ke-[N] build**

### 1. APA YANG DIBANGUN?
*(Tulis output konkret – file, route, fitur, tabel. Bukan "belajar" atau "planning")*

| Task | Output | Status |
|------|--------|--------|
| Task X.X | [hasil] | ✅ DONE / 🔴 BLOCKED / 🟡 IN PROGRESS |

**Commit terakhir:** [hash] – [message]
**Lines of code added:** ~[N]

### 2. PROOF APA YANG ADA?
*(Link ke 21-PROOF-TRACKER-LIVE.md atau screenshot langsung)*

- [ ] Build proof (route/fitur live): [Y/N]
- [ ] WA automation proof: [Y/N]
- [ ] Dashboard screenshot: [Y/N]
- [ ] Client outcome: [Y/N]
- [ ] Revenue proof: [Y/N]

**Bukti terkuat minggu ini:** [deskripsi singkat]

### 3. SALES / MONETISASI
*(Progress pipeline – bukan rencana, tapi yang sudah terjadi)*

| Stage | Nama (alias) | Progress | Next Action |
|-------|-------------|---------|-------------|
| Awareness | - | - | - |
| Conversation | - | - | - |
| Demo/Trial | - | - | - |
| Closing | - | - | - |
| Active Client | - | - | - |

**MRR minggu ini: Rp [amount]** (target Phase 1: Rp 2.250.000)
**Total revenue bulan ini: Rp [amount]**

### 4. CCA-F PROGRESS
*(Bab/domain yang dibaca, bukan yang direncanakan)*

| Domain | Materi dibaca | Durasi | Takeaway |
|--------|--------------|--------|---------|
| D[N] | [judul] | [X jam] | [insight] |

**Total jam study minggu ini: [X jam]**
**Kumulatif: [X jam] / target 40 jam**
**Exam registration:** 🔴 Belum / 🟡 Terdaftar / ✅ Selesai

### 5. KEPUTUSAN MINGGU INI
*(Keputusan teknis/bisnis yang dibuat – mirror ke 19-DECISION-LOG.md)*

- ADR-[XX]: [keputusan singkat]

### 6. BLOCKER & HAMBATAN
*(Jujur – apa yang menghambat? External atau internal?)*

| Blocker | Jenis | Dampak | Action |
|---------|-------|--------|--------|
| [apa] | External/Internal | [dampak] | [langkah] |

### 7. FOKUS MINGGU DEPAN
*(Maksimal 3 prioritas – spesifik dan measurable)*

1. **[PRIORITAS 1]:** [Task ID] – [expected output] – [deadline/hari]
2. **[PRIORITAS 2]:** [Task ID] – [expected output] – [deadline/hari]
3. **[PRIORITAS 3]:** [Task ID] – [expected output] – [deadline/hari]

### 8. ENERGY & KONDISI FOUNDER
*(Singkat – ini penting untuk sustainability)*

- Energi: 🟢 Tinggi / 🟡 Sedang / 🔴 Rendah
- Fokus: 🟢 Tajam / 🟡 Terganggu / 🔴 Buyar
- Catatan: [jika ada]

### SKOR MINGGU INI: [N]/10
*(Self-score jujur. 10 = semua prioritas selesai + ada proof + ada progress sales)*

---
```

---

## WEEKLY LOG (Terbaru di atas)

---

## WEEK 0 – Pre-Sprint – 2026-04-03 s/d 2026-04-06
**Sprint:** Pre-Sprint (Dokumentasi) | **Hari ke-1 operasional**

### 1. APA YANG DIBANGUN?

| Task | Output | Status |
|------|--------|--------|
| Dokumentasi 17 docs strategic | 17 Markdown files di sovereign-docs | ✅ DONE |
| Living docs 5 file (18-22) | 18-BUILD-LOG, 19-DECISION, 20-CRED-REG, 21-PROOF, 22-REVIEW | ✅ DONE |
| Operating rhythm dikunci | Template + format weekly review | ✅ DONE |

**Status repo:** 22 docs total, git committed, archive tersedia

### 2. PROOF APA YANG ADA?

- [x] Dokumentasi: 22 file Markdown, commit history ada
- [ ] Build proof: ❌ Belum ada – Sprint 1 belum mulai
- [ ] WA automation: ❌ FONNTE_TOKEN missing
- [ ] Revenue: ❌ Rp 0

**Bukti terkuat minggu ini:** Archive 22 dokumen sovereign-docs v5.0

### 3. SALES / MONETISASI

| Stage | Nama | Progress | Next Action |
|-------|------|---------|-------------|
| - | - | - | Mulai outreach setelah Sprint 1 selesai |

**MRR: Rp 0** | **Target Phase 1: Rp 2.250.000/bulan**

**Sales siap dimulai setelah:**
- Sprint 1 selesai (ada demo yang bisa dishow)
- Minimal 1 screenshot dashboard live
- Gunakan docs 10, 11, 12, 13, 14 sebagai sales kit

### 4. CCA-F PROGRESS

| Domain | Materi | Durasi | Takeaway |
|--------|--------|--------|---------|
| - | Belum mulai | 0 | - |

**Target minggu ini:** Mulai D1 (Agentic Architecture) – baca LangGraph docs

### 5. KEPUTUSAN MINGGU INI

- ADR-007: Pakai GROQ untuk dev (ganti OpenAI) – lihat 19-DECISION-LOG.md
- ADR-008: Stop dokumen blueprint, fokus living docs – lihat 19-DECISION-LOG.md

### 6. BLOCKER & HAMBATAN

| Blocker | Jenis | Dampak | Action |
|---------|-------|--------|--------|
| FONNTE_TOKEN belum ada | External | Sprint 1 Task 1.2 blocked | Daftar fonnte.com sekarang |
| LLM_API_KEY belum ada | External | Sprint 2+ blocked | Daftar GROQ console.groq.com |

### 7. FOKUS MINGGU DEPAN (Week 1)

1. **Dapat FONNTE_TOKEN:** Daftar fonnte.com + setup device WA → update 20-CREDENTIAL-REGISTRY.md
2. **Dapat GROQ API Key:** Daftar console.groq.com → update 20-CREDENTIAL-REGISTRY.md
3. **Sprint 1 Task 1.1:** Buat 4 tabel Supabase baru (wa_messages, wa_templates, orders, revenue_log)

### 8. ENERGY & KONDISI FOUNDER

- Energi: 🟢 Tinggi – dokumentasi selesai, momentum ada
- Fokus: 🟡 Perlu dikunci ke eksekusi
- Catatan: Jangan tambah dokumen baru lagi. Build sekarang.

### SKOR MINGGU 0: 6/10
*(Dokumentasi selesai = bagus. Tapi 0 routes live, 0 revenue. Minggu 1 harus ada proof nyata.)*

---

## RHYTHM MINGGUAN (Jadwal Ideal)

| Hari | Fokus | Durasi | Dokumen aktif |
|------|-------|--------|---------------|
| Senin | Direction – baca weekly review lama, set 3 prioritas | 30 mnt | 22-WEEKLY-REVIEW, 00-INDEX |
| Selasa | Build – Sprint task, AI Developer session | 2-4 jam | 07-TASK-BREAKDOWN, 17-PROMPT-PACK, 18-BUILD-LOG |
| Rabu | Build – lanjut Sprint task | 2-4 jam | 08-ACCEPTANCE-CRITERIA, 18-BUILD-LOG |
| Kamis | Build – finalisasi task, collect proof | 2-4 jam | 21-PROOF-TRACKER, 18-BUILD-LOG |
| Jumat | Sales – outreach, demo, follow-up klien | 2 jam | 10-OFFER-SHEET, 11-FUNNEL, 12-PROOF-TRUST |
| Sabtu | CCA-F – belajar 1 domain, 1-2 jam | 1-2 jam | 09-CCA-ALIGNMENT, 16-BUILD-RULES |
| Minggu | Founder Review – isi doc ini, reset mental | 30 mnt | 22-WEEKLY-REVIEW, 19-DECISION-LOG |

---

## METRIC MINGGUAN (Track Progress)

| Minggu | Tasks Done | Routes Live | Proof Items | MRR (IDR) | CCA Hours | Skor |
|--------|-----------|-------------|-------------|-----------|-----------|------|
| W0 | 0 build tasks | 0 | 22 docs | 0 | 0 | 6/10 |
| W1 | - | - | - | - | - | - |
| W2 | - | - | - | - | - | - |
| W3 | - | - | - | - | - | - |
| W4 | - | - | - | - | - | - |

---

*Document Control: v1.0 – 2026-04-03 – Living Document*
*Update 2026-04-06: Governance Layer diperluas ke docs 35–37 (onboarding checklist, content ops SOP, crisis playbook)*
*CLASSIFIED – FOUNDER ACCESS ONLY*
