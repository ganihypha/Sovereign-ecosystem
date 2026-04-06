# 37 – INCIDENT & CRISIS COMMUNICATION PLAYBOOK
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT FRAMEWORK — Berlaku segera setelah dibaca dan dipahami Founder
**Version:** 1.1 | **Tanggal:** 2026-04-06 | **Updated:** 2026-04-06

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**

---

## 1. PURPOSE

Dokumen ini mendefinisikan prosedur respons terhadap insiden dan krisis komunikasi yang melibatkan channel market-facing Sovereign Ecosystem.

Tujuan:
1. Founder (dan Managing Strategist jika sudah aktif) punya protokol yang jelas saat insiden terjadi
2. Respons tidak improvised — ada struktur yang sudah disiapkan sebelumnya
3. System Truth tetap terjaga bahkan di bawah tekanan eksternal
4. Semua insiden terdokumentasi dan dapat diaudit

**Prinsip utama:**
> *"Insiden yang ditangani dengan struktur lebih baik daripada respons yang cepat tapi tidak terkontrol."*
> *"Market Expression harus selalu kembali ke System Truth — bukan terbalik."*
> (ref: `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` Section 7)

---

## 2. DEFINISI INSIDEN

Insiden adalah situasi yang:
- Mengancam reputasi brand di channel public
- Melibatkan klaim atau janji yang tidak sesuai System Truth
- Melibatkan kebocoran informasi yang seharusnya internal
- Melibatkan gangguan sistem yang berdampak ke customer / market
- Melibatkan konflik komunikasi yang berpotensi eskalasi ke publik

> **Insiden bukan:** Bug teknis biasa, pertanyaan produk dari customer, komentar negatif tunggal yang isolated.

---

## 3. SEVERITY LEVELS

### Level 1 — INFORMATIONAL (Pantau, Tidak Perlu Aksi Segera)

| Kriteria | Contoh |
|---------|--------|
| Komentar negatif tunggal, tidak viral | 1 komentar tidak puas di post IG |
| Pertanyaan yang ambigu tapi tidak menyerang | "Ini beneran works atau cuma marketing?" |
| Minor miscommunication yang sudah bisa diklarifikasi | MS salah sebut harga, sudah dikoreksi |

**Handling:** MS bisa handle sendiri menggunakan template respons yang sudah approved. Log ke content log. Tidak perlu eskalasi segera, tapi dicatat di weekly report.

---

### Level 2 — ELEVATED (Eskalasi ke Founder dalam 4 Jam)

| Kriteria | Contoh |
|---------|--------|
| Komentar negatif yang mulai mendapat traksi (> 5 like/reply) | Thread komplain yang di-engage banyak orang |
| Klaim atau janji yang dibuat MS di luar scope yang approved | MS menjanjikan fitur yang belum ada |
| Pertanyaan sensitif dari pihak luar (media, influencer, bisnis kompetitor) | DM dari akun media nanya tentang cara kerja sistem |
| Customer complaint yang berpotensi churn dan publik | Customer post screenshot percakapan dengan caption negatif |
| Kesalahan publish konten yang belum diapprove | Post yang terpublish sebelum Founder approve |

**Handling:** MS STOP semua aktivitas channel yang relevan. Eskalasi ke Founder segera. Tidak ada respons publik sebelum Founder decide.

---

### Level 3 — CRITICAL (Founder Respons Segera — Aktivasi Playbook Penuh)

| Kriteria | Contoh |
|---------|--------|
| Viral negatif — konten menyerang brand menyebar luas | Post atau story tentang Sovereign/Fashionkas/Resellerkas dengan ribuan engagement negatif |
| Kebocoran informasi internal | Screenshot percakapan internal, data customer, atau credential tersebar |
| Klaim hukum atau ancaman formal | Notifikasi atau pesan dari kuasa hukum / lembaga resmi |
| Sistemik breach atau akses tidak sah | Ada pihak yang mengklaim akses ke sistem internal |
| Klaim yang berpotensi menimbulkan kerugian finansial | Klaim palsu tentang refund, fraud, atau malpraktik |

**Handling:** Founder mengambil alih semua channel. Semua aktivitas MS di channel tersebut di-freeze. Playbook Level 3 diaktifkan.

---

## 4. RESPONSE PROTOCOL PER SEVERITY

### Respons Level 1

```
1. MS identifikasi sebagai Level 1
2. Gunakan template respons yang sudah approved
3. Respons dalam 2-4 jam (hari operasional)
4. Log ke content log: [INCIDENT-L1] [timestamp] [ringkasan]
5. Catat di weekly report — section "Incident & Anomali"
6. Tidak perlu Founder approval jika template sudah pre-approved
```

**Template respons Level 1 (contoh untuk komentar skeptis):**
```
"Hai [nama/kak], terima kasih sudah tanya langsung!
[Jawab poin spesifik yang ditanyakan dengan fakta yang terverifikasi]
Kalau mau lihat lebih detail, boleh DM ya — senang bantu."
```
> Catatan: Isi template harus diisi dengan fakta nyata, bukan klaim.

---

### Respons Level 2

```
STEP 1 — FREEZE (Immediate)
  MS: Stop semua aktivitas di channel yang bersangkutan
  Tidak ada posting baru sampai Founder decide
  Tidak ada respons baru ke thread/komentar yang bersangkutan

STEP 2 — DOCUMENT (dalam 15 menit)
  MS membuat incident brief:
  - Screenshot situasi
  - Ringkasan: apa yang terjadi, sejak kapan, sudah sejauh mana
  - Apakah ada MS action yang berkontribusi ke insiden ini?
  - Link ke konten / percakapan yang terlibat

STEP 3 — ESCALATE (segera)
  Format WA ke Founder:
  "[SOVEREIGN ESCALATION — LEVEL 2] — [ringkasan 1 kalimat]
   Detail terlampir. Butuh Founder decision sebelum respons apapun."

STEP 4 — FOUNDER ASSESS & DECIDE (dalam 4 jam)
  Founder melihat brief dari MS
  Founder putuskan: respons publik / tidak / respons private / hold semua
  Founder kasih instruksi jelas ke MS tentang apa yang boleh dan tidak boleh dilakukan

STEP 5 — EXECUTE (setelah Founder decide)
  Implementasi instruksi Founder
  Log semua aksi di content log: [INCIDENT-L2] [timestamp] [action taken]
  Catat keputusan di 19-DECISION-LOG.md jika menghasilkan ADR baru
```

---

### Respons Level 3

```
STEP 1 — FULL FREEZE (Immediate)
  Founder mengambil alih semua channel
  MS tidak melakukan APAPUN di channel yang bersangkutan
  Semua akses MS ke channel tersebut di-pause jika memungkinkan

STEP 2 — SITUATIONAL ASSESSMENT (dalam 30 menit)
  Founder assess:
  - Apa yang terjadi dan skala
  - Apakah ada data yang bocor?
  - Apakah ada pihak eksternal yang terlibat (media, hukum)?
  - Apakah ada sistem yang perlu di-lock?

STEP 3 — CONTAINMENT (sebelum respons apapun)
  Jika kebocoran data: segera audit akses dan lock credential yang mungkin terekspos
  Jika viral negatif: jangan hapus konten asli sebelum Founder konsultasi (bisa jadi backfire)
  Jika ancaman hukum: JANGAN respons tanpa konsultan hukum

STEP 4 — HOLD ALL PUBLIC RESPONSE (sementara)
  Tidak ada pernyataan publik sampai Founder punya gambaran lengkap
  Jika terpaksa harus respons (misalnya komentar terus masuk):
  Gunakan template holding response:
  "Terima kasih sudah menghubungi kami. Kami sedang menindaklanjuti hal ini
   dan akan memberikan informasi lebih lanjut secepatnya."
  (Tidak mengakui, tidak menyangkal, tidak berjanji)

STEP 5 — CORRECTIVE COMMUNICATION
  Setelah Founder punya gambaran lengkap dan situasi terkendali:
  Founder (atau dengan konsultan hukum jika perlu) menyusun respons resmi
  Respons harus: faktual, tidak defensif, tidak over-promise perbaikan
  Publish via channel yang paling relevan

STEP 6 — DOCUMENTATION & LEARNING
  Dokumentasikan insiden lengkap di ADR baru di 19-DECISION-LOG.md:
    - Apa yang terjadi
    - Bagaimana respons
    - Apa yang bisa diperbaiki di governance / SOP
  Update docs yang relevan jika ada gap yang teridentifikasi
  Jika ada dugaan breach keamanan: audit credential registry 20-CREDENTIAL-REGISTRY.md
```

---

## 5. CHANNEL-SPECIFIC FREEZE PROTOCOL

### Instagram Freeze
```
Jika channel IG perlu di-freeze:
□ Jadwalkan semua post yang tersisa di-pause atau hapus dari queue
□ Disable Meta Business Suite scheduling jika ada
□ Instruksikan MS untuk tidak login sampai ada izin Founder
□ Founder handle semua respons secara langsung
□ Log: [CHANNEL FREEZE — IG — timestamp — alasan]
```

### WhatsApp / Fonnte Freeze
```
Jika WA channel perlu di-freeze:
□ Founder memastikan tidak ada pesan yang sedang dalam approval queue
□ Revoke sementara akses MS ke approval request WA
□ Semua outbound WA ke-hold sampai situasi clear
□ Incoming WA: Founder handle secara langsung
□ Log: [CHANNEL FREEZE — WA — timestamp — alasan]
```

---

## 6. CORRECTIVE COMMUNICATION PATTERNS

## 6.1 DO-NOT-SAY RULES

Selama insiden aktif, pihak internal (Founder atau Managing Strategist) **tidak boleh:**

- Menyalahkan pihak luar secara publik
- Mengakui kesalahan spesifik sebelum investigasi selesai
- Menjanjikan refund / kompensasi tanpa Founder approval
- Membocorkan detail internal, sistem, data, atau percakapan privat
- Berdebat panjang di komentar publik
- Menyampaikan estimasi waktu penyelesaian yang belum pasti
- Menggunakan bahasa defensif, menyerang, atau emosional
- Menghapus komentar / konten tanpa assessment terlebih dahulu

**Safe Principle:** Jika kalimat itu belum diverifikasi, belum diapprove Founder, atau berpotensi memicu implikasi lebih besar — kalimat itu tidak boleh dikirim.

---

Gunakan pola ini sebagai panduan saat menyusun respons publik:

### Pola A — Klarifikasi Miskomunikasi
```
Situasi: Ada informasi yang salah tersebar tentang produk/harga/fitur

Pattern:
"[Nama/Kak], terima kasih sudah menginformasikan ini.
Setelah kami cek, informasi yang beredar tidak sepenuhnya akurat.
Faktanya: [fakta yang terverifikasi dari System Truth].
Mohon maaf atas kebingungan yang mungkin timbul."

Rules:
✅ Gunakan fakta yang sudah diverifikasi dari data nyata
✅ Koreksi dengan tenang, bukan defensif
🚫 Jangan sebutkan nama/akun pihak yang menyebarkan info salah
🚫 Jangan berjanji lebih dari yang bisa dipenuhi
```

### Pola B — Respons Keluhan Serius
```
Situasi: Customer atau pihak luar mengklaim ada masalah serius

Pattern:
"Terima kasih sudah menghubungi kami langsung.
Kami mengambil ini dengan serius dan sedang menindaklanjuti.
Kalau berkenan, kami ingin mendengar detail lebih lanjut melalui jalur privat:
[kontak yang ditunjuk untuk insiden ini]."

Rules:
✅ Akui bahwa laporan diterima
✅ Alihkan ke jalur privat untuk detail
🚫 Jangan mengakui kesalahan spesifik sebelum investigasi selesai
🚫 Jangan memberikan kompensasi atau janji publik
```

### Pola C — Holding Response (saat masih menginvestigasi)
```
Situasi: Insiden terjadi dan belum ada gambaran lengkap

Pattern:
"Terima kasih atas pesan Anda. Kami mendengar dan sedang menindaklanjuti.
Kami akan memberikan update secepatnya."

Rules:
✅ Singkat dan netral
✅ Tidak mengakui, tidak menyangkal
🚫 Jangan berjanji waktu spesifik yang tidak bisa dipenuhi
🚫 Jangan gunakan lebih dari 1 kali untuk situasi yang sama
```

---

## 7. INCIDENT LOG FORMAT

Setiap insiden Level 2 dan Level 3 wajib dicatat:

```json
{
  "incident_id": "INC-[YYYYMMDD]-[urutan]",
  "timestamp_detected": "ISO8601",
  "severity_level": 2 | 3,
  "channel": "instagram_fashionkas | instagram_resellerkas | wa | web | other",
  "detected_by": "founder | managing_strategist | external",
  "incident_summary": "deskripsi singkat max 200 karakter",
  "trigger": "apa yang memicu insiden",
  "contributing_action": "apakah ada aksi MS/Founder yang berkontribusi",
  "response_timeline": {
    "detected": "timestamp",
    "escalated": "timestamp",
    "founder_engaged": "timestamp",
    "contained": "timestamp",
    "resolved": "timestamp"
  },
  "actions_taken": ["list aksi yang diambil"],
  "outcome": "resolved | ongoing | escalated_to_legal | monitoring",
  "lessons_learned": "opsional — untuk update SOP",
  "adr_created": "ADR-XXX atau null"
}
```

---

## 7.1 INCIDENT RESOLUTION CRITERIA

Insiden tidak boleh dianggap selesai hanya karena thread sudah sepi atau tidak ada respons baru dari publik.

### Minimum Resolution Criteria — Semua Wajib Terpenuhi:
- [ ] Channel sudah stabil (tidak ada aktivitas insiden yang masih berjalan)
- [ ] Tidak ada eskalasi baru dalam periode observasi yang wajar (minimum 24 jam untuk L2, 72 jam untuk L3)
- [ ] Respons resmi / holding stance sudah jelas dan terdokumentasi
- [ ] Root cause minimum sudah dipahami (walaupun belum 100% lengkap)
- [ ] Semua aksi penting sudah dicatat di incident log
- [ ] Pelajaran utama sudah ditulis
- [ ] Jika perlu, doc terkait (34, 36, 37) sudah diupdate

### Outcome Labels (Founder yang menentukan label akhir)
- `resolved` — insiden selesai sepenuhnya
- `monitoring` — selesai tapi masih perlu dipantau
- `external_legal_review` — perlu konsultasi hukum
- `followup_required` — ada tindakan lanjutan yang belum selesai

---

## 8. POST-INCIDENT REVIEW

Setelah setiap insiden Level 2 atau Level 3 resolved, Founder wajib melakukan:

```
POST-INCIDENT REVIEW CHECKLIST:

□ Apakah ada gap di governance docs yang perlu ditutup?
  → Update 34, 36, atau 37 jika perlu

□ Apakah ada gap di approval flow yang memungkinkan insiden terjadi?
  → Update 32 jika perlu

□ Apakah ada credential atau akses yang perlu di-rotate?
  → Update 20-CREDENTIAL-REGISTRY.md

□ Apakah insiden ini perlu jadi ADR?
  → Tambahkan ke 19-DECISION-LOG.md

□ Apakah Managing Strategist perlu re-briefing?
  → Jadwalkan sesi 1:1 untuk review pelajaran dari insiden

□ Apakah SOP perlu diupdate?
  → Update doc yang relevan dengan pelajaran yang jelas
```

---

## 9. PREVENTION — MENGURANGI RISIKO INSIDEN

---

## 9.1 TABLETOP DRILL & READINESS REVIEW

Playbook ini tidak boleh hanya dibaca satu kali. Perlu diuji secara berkala:

### Minimum Cadence
- Founder review playbook ini setiap **6 bulan**
- Mini tabletop walkthrough minimal setiap **quarter** (3 bulan)
- **Wajib 1 simulasi ringan** sebelum Managing Strategist memegang channel secara aktif:
  - Skenario 1: post yang terpublish sebelum approved
  - Skenario 2: komentar negatif yang mulai mendapat traksi > 5 engagement
  - Skenario 3: inquiry sensitif dari pihak luar (media / kompetitor)

### Tujuan Drill
- Menguji apakah severity classification dipahami dengan benar
- Menguji apakah freeze protocol bisa dijalankan tanpa panduan
- Menguji apakah holding response tidak melanggar governance
- Mengidentifikasi gap yang belum tercover sebelum insiden nyata terjadi

---

## 9.2 POST-INCIDENT OWNER ACTIONS

Setelah insiden ditutup, Founder wajib menentukan owner untuk setiap follow-up berikut:

| Kebutuhan | Owner | Deadline |
|----------|-------|----------|
| Update governance doc (34, 36, 37 jika ada gap) | Founder | Dalam 1 minggu |
| Update SOP / template yang berkaitan | Founder / MS sesuai scope | Dalam 1 minggu |
| Re-brief role boundaries ke MS | Founder | Dalam 3 hari |
| Credential audit jika insiden melibatkan akses | Founder | Segera / dalam 24 jam |
| Incident retrospective note di `19-DECISION-LOG.md` | Founder | Dalam 1 minggu |

> Tanpa owner follow-up yang jelas, insiden dianggap belum benar-benar selesai secara sistem.

---

Langkah preventif yang harus berjalan rutin:

| Aktivitas | Frekuensi | Siapa | Tujuan |
|-----------|-----------|-------|--------|
| Review content log | Setiap Senin | Founder | Cek tidak ada anomali publish |
| Audit approved templates | Setiap bulan | Founder + MS | Pastikan template masih sesuai System Truth |
| Review channel readiness checklist | Sebelum setiap delegasi baru | Founder | Pastikan MS siap sebelum kanal baru didelegasikan |
| Cek WA logs anomali | Setiap Senin | Founder | Deteksi early jika ada send yang tidak sesuai |
| Re-brief brand voice | Setiap 3 bulan | Founder ke MS | Pastikan alignment tidak drift |
| Audit credential status | Setiap bulan | Founder | Pastikan tidak ada access yang stale atau expired |

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT FRAMEWORK |
| Dibuat | 2026-04-06 |
| Dokumen Terkait | `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` (governance), `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md` (escalation tiers), `36-CONTENT-OPS-AND-CHANNEL-SOP.md` (content SOP), `35-MANAGING-STRATEGIST-ONBOARDING-AND-ACTIVATION-CHECKLIST.md` (onboarding), `14-OPERATIONAL-RUNBOOK.md` (operational runbook), `19-DECISION-LOG.md` (post-incident ADR), `20-CREDENTIAL-REGISTRY.md` (credential audit) |
| Review | Setelah setiap insiden Level 2/3, setiap 6 bulan secara proaktif, dan sebelum delegasi channel besar ke MS |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT FRAMEWORK — panduan operasional, bukan perjanjian legal*
