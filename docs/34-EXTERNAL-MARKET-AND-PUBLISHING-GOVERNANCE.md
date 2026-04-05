# 34 – EXTERNAL MARKET & PUBLISHING GOVERNANCE
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT FRAMEWORK — Berlaku setelah Managing Strategist diaktifkan
**Version:** 1.0 | **Tanggal:** 2026-04-05

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**

---

## 1. PURPOSE

Dokumen ini mendefinisikan aturan governance untuk semua aktivitas yang menghadap ke market (external):

- Siapa boleh publish apa
- Siapa pegang Instagram
- Siapa pegang WhatsApp continuity
- Siapa approve konten sebelum publish
- Apa yang boleh dan tidak boleh dijanjikan ke market
- Bagaimana brand voice dijaga

**Mengapa dokumen ini penting:**
Ketika ada human strategic layer kedua (Managing Strategist) yang berinteraksi dengan market, tanpa governance yang jelas, brand tone bisa campur, janji ke market bisa over-commit, dan channel bisa tidak aligned dengan kapasitas sistem. Governance ini mencegah chaos dari luar.

---

## 2. CHANNEL OWNERSHIP MAP

| Channel | Saat Ini | Setelah Managing Strategist Aktif |
|---------|----------|----------------------------------|
| Instagram @fashionkas | Founder | Founder (dapat delegate publishing rhythm) |
| Instagram @resellerkas | Founder | Founder (dapat delegate publishing rhythm) |
| Instagram @haidar_faras_m | Founder ONLY | Founder ONLY — tidak didelegasikan |
| WhatsApp Business (Fonnte) | Founder-triggered | Managing Strategist dengan approval scope |
| Email / newsletter | Founder | TBD |
| Landing page content | Founder | Perlu approval untuk perubahan copy strategis |

---

## 3. INSTAGRAM GOVERNANCE

### Yang boleh didelegasikan (setelah Managing Strategist aktif)

| Aktivitas | Siapa | Kondisi |
|-----------|-------|---------|
| Schedule feed post (non-strategic) | Managing Strategist | Konten sudah di-review Founder |
| Respon comment umum (Q&A produk) | Managing Strategist | Dalam template respons yang sudah ada |
| Story repost konten customer | Managing Strategist | Tidak ada klaim performance spesifik |
| Monitoring engagement | Managing Strategist | Read-only monitoring |

### Yang TIDAK boleh didelegasikan

| Aktivitas | Alasan |
|-----------|--------|
| Posting iklan berbayar | Finansial commitment — Founder only |
| Announce produk baru / pivot | Strategic positioning — Founder only |
| Claim revenue / social proof spesifik | Verifikasi data — Founder only |
| Collaborate dengan brand luar | Komitmen eksternal — Founder only |
| Respond to crisis / negative PR | Reputasi — Founder only |
| Personal branding @haidar_faras_m | Founder identity — tidak didelegasikan |

### Brand Voice Rules

- Tone: **Profesional tapi human, tidak kaku, tidak terlalu casual**
- Bahasa: Utamanya Bahasa Indonesia, mixing English hanya untuk technical terms
- Claim: **Jangan claim angka yang belum diverifikasi** (revenue, follower count, conversion rate)
- Positioning: Selalu consistent dengan "Sovereign Engineer, bukan pedagang fashion"
- Tidak boleh: Over-promise fitur yang belum dibangun

---

## 4. WHATSAPP CONTINUITY GOVERNANCE

### Fonnte Channel Rules

| Aksi WA | Siapa | Approval | Catatan |
|---------|-------|----------|---------|
| Send ke 1 lead (founder-triggered) | Founder | Auto | Via Sovereign Tower API |
| Send ke 1 lead (Managing Strategist request) | Managing Strategist | Founder approval | Async Tier 1 |
| Follow-up sequence (pre-approved template) | Managing Strategist | Template approval by Founder | Dalam scope template |
| Broadcast ke > 5 penerima | Founder | Founder direct | Tidak boleh delegasi |
| Reply WA inbound (support) | Managing Strategist | Dalam template | Tidak bisa janji di luar scope |

### WA Communication Rules

- **Tidak boleh janji hal yang belum di-spec** (fitur, timeline, harga khusus)
- **Semua WA outbound yang penting dicatat di wa_logs** — ini bukan opsional
- **Template diapprove Founder terlebih dahulu** sebelum digunakan
- **Tone konsisten** dengan brand voice di atas
- **Tidak ada auto-send loop** tanpa trigger explicit (anti-spam)

---

## 5. CONTENT APPROVAL MATRIX

### Apa yang perlu approval sebelum publish

| Konten | Siapa Request | Siapa Approve | Timeframe |
|--------|--------------|--------------|-----------|
| Feed post Instagram (non-strategic) | Managing Strategist | Founder | < 24 jam |
| Story IG (informational) | Managing Strategist | Auto (dalam template) | — |
| WA broadcast message | Founder / Managing Strategist | Founder | Sebelum send |
| Landing page copy change | Managing Strategist | Founder | < 24 jam |
| Pricing announcement | Founder | Founder only | — |
| Partnership announcement | Founder | Founder only | — |
| Crisis response | Founder | Founder only | Segera |

---

## 6. WHAT MAY / MAY NOT BE PROMISED TO MARKET

### Boleh dijanjikan

- ✅ Fungsi yang sudah live dan terverifikasi
- ✅ Response time yang sudah terbukti bisa dipenuhi
- ✅ Pricing yang sudah ada di `10-REVENUE-OFFER-SHEET.md`
- ✅ Outcome yang sudah ada proof nyata (lihat `21-PROOF-TRACKER-LIVE.md`)
- ✅ Free trial atau demo jika Founder sudah approve

### Tidak boleh dijanjikan

- 🚫 Fitur yang belum dibangun tanpa label "coming soon" yang jelas
- 🚫 Timeline yang belum dikonfirmasi dengan Founder
- 🚫 Angka ROI atau revenue klien tanpa data verifiable
- 🚫 Harga custom di luar pricing sheet tanpa Founder approval
- 🚫 Partnership atau kolaborasi tanpa Founder approval
- 🚫 Akses ke sistem internal yang tidak ada di product spec

---

## 7. FOUNDING PRINCIPLE — MARKET EXPRESSION vs SYSTEM TRUTH

```
╔══════════════════════════════════════════════════════════╗
║  SYSTEM TRUTH         │  MARKET EXPRESSION              ║
║  ─────────────────    │  ─────────────────              ║
║  Dipegang Founder     │  Dipegang/shared Managing Str.  ║
║                       │                                  ║
║  - Architecture       │  - Narasi brand                 ║
║  - Data & proof       │  - Engagement rhythm            ║
║  - Pricing truth      │  - Customer communication       ║
║  - Product reality    │  - Publishing cadence           ║
║  - Credential         │  - Campaign coordination        ║
║  - Decision log       │  - Response continuity          ║
╚══════════════════════════════════════════════════════════╝

KEY RULE:
Market Expression harus selalu REFLECT System Truth.
Jika tidak selaras → Market Expression harus dikoreksi ke System Truth.
Jangan terbalik: jangan ubah System Truth untuk mengikuti market expression yang sudah terlanjur.
```

---

## 8. CHANNEL READINESS CHECKLIST

Sebelum mendelegasikan channel apapun ke Managing Strategist:

- [ ] Template konten untuk channel tersebut sudah dibuat dan diapprove
- [ ] Brand voice guidelines sudah dijelaskan
- [ ] Approval workflow sudah jelas (siapa approve apa)
- [ ] Batas klaim sudah dikomunikasikan ("jangan claim ini tanpa verifikasi")
- [ ] Escalation path sudah jelas (kapan harus laporkan ke Founder)
- [ ] Audit trail mechanism ada (bisa dilihat siapa post/kirim apa kapan)

---

## 9. SAAT INI — STATUS

| Channel | Status | Siapa Handle | Notes |
|---------|--------|-------------|-------|
| Instagram (semua) | Founder-only | Founder | Managing Strategist belum aktif |
| WhatsApp via Fonnte | Founder-triggered (Session 3f live) | Founder | wa_logs aktif, single send only |
| Landing page | Founder | Founder | — |

> **Dokumen ini aktif sebagai pedoman saat Managing Strategist diaktifkan.**
> Saat ini semua channel dipegang Founder.

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT FRAMEWORK |
| Dibuat | 2026-04-05 |
| Sumber distilasi | `nw.prompt.fr.gmini.1.1.1.q.q.1.txt` — external publishing governance insights |
| Dokumen Terkait | `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `31-RBAC-PERMISSION-MATRIX.md`, `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md`, `14-OPERATIONAL-RUNBOOK.md` |
| Review | Saat Managing Strategist onboarding dimulai |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
