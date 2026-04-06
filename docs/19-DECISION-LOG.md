# 19 – DECISION LOG / ADR MINI
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** LIVING DOCUMENT – Tambah entry tiap keputusan strategis/teknis
**Repo:** https://github.com/ganihypha/Sovereign.private.real.busines.orchest

---

## CARA PAKAI DOKUMEN INI

> **Prinsip:** Setiap keputusan penting WAJIB dicatat. Bukan jurnal – ini kontrak intelektual.
> Tulis KONTEKS (kenapa keputusan ini perlu dibuat), PILIHAN yang ada, KEPUTUSAN FINAL, dan KONSEKUENSI.

**Format ADR:**
```
### ADR-XXX – [JUDUL KEPUTUSAN]
- Tanggal: YYYY-MM-DD
- Status: ACCEPTED | DEPRECATED | SUPERSEDED by ADR-XXX
- Konteks: [situasi yang memaksa keputusan ini]
- Pilihan yang dipertimbangkan: [A, B, C]
- Keputusan: [pilihan yang dipilih + alasan singkat]
- Konsekuensi: [dampak positif / trade-off / risiko]
- Review: [kapan keputusan ini perlu dievaluasi ulang]
```

---

## KEPUTUSAN FOUNDATION (Stack & Architecture)

### ADR-001 – Gunakan Cloudflare Pages + Hono.js sebagai Runtime
- **Tanggal:** 2026-03-01
- **Status:** ACCEPTED
- **Konteks:** Butuh runtime ringan, globally distributed, zero cold start untuk dashboard founder privat.
- **Pilihan:** (A) Vercel + Next.js, (B) Cloudflare Pages + Hono.js, (C) Railway + Express.js
- **Keputusan:** B – Cloudflare Pages + Hono.js
- **Alasan:** Edge runtime = zero cold start; Hono 2x lebih ringan dari Next.js API; Cloudflare gratis tier lebih generous; wrangler CLI sudah dikuasai.
- **Konsekuensi:** (+) deploy murah, cepat; (-) tidak bisa jalankan long-running process; solusi: gunakan Supabase untuk semua state.
- **Review:** Evaluasi ulang jika kebutuhan real-time WebSocket muncul.

### ADR-002 – Gunakan Supabase sebagai Primary Database
- **Tanggal:** 2026-03-01
- **Status:** ACCEPTED
- **Konteks:** Butuh database relasional dengan auth built-in, REST API otomatis, dan row-level security.
- **Pilihan:** (A) Cloudflare D1, (B) Supabase, (C) PlanetScale
- **Keputusan:** B – Supabase
- **Alasan:** Auth bawaan; REST API auto-generated; dashboard GUI untuk inspeksi data; sudah ada 8 tabel aktif di v3.0.
- **Konsekuensi:** (+) development speed tinggi; (-) vendor lock-in Supabase; solusi: abstraksi query via service layer.
- **Review:** Tidak perlu diganti kecuali cost > Rp 500K/bulan.

### ADR-003 – Gunakan Fonnte sebagai WhatsApp Gateway
- **Tanggal:** 2026-03-15
- **Status:** ACCEPTED (pending token)
- **Konteks:** Butuh kirim WA ke leads, log pesan, dan otomatisasi follow-up tanpa WhatsApp Business API resmi (mahal, approval lama).
- **Pilihan:** (A) WhatsApp Business API official, (B) Fonnte, (C) Wablas, (D) WAbotkit self-hosted
- **Keputusan:** B – Fonnte
- **Alasan:** API sederhana (POST + token); harga terjangkau; banyak dipakai developer Indonesia; no-code setup device.
- **Konsekuensi:** (+) cepat setup; (-) bergantung Fonnte uptime; solusi: fallback manual outreach jika Fonnte down.
- **Review:** Evaluasi jika > 1000 pesan/hari – mungkin perlu upgrade plan atau switch ke official API.

### ADR-004 – Gunakan LangChain + LangGraph untuk AI Agent Orchestration
- **Tanggal:** 2026-03-20
- **Status:** ACCEPTED
- **Konteks:** Butuh 3 AI agents (ScoutScorer, MessageComposer, InsightGenerator) yang bisa diorkestrasi, dengan state management antar agent.
- **Pilihan:** (A) Custom prompt chain, (B) LangChain + LangGraph, (C) CrewAI standalone, (D) Mastra.ai
- **Keputusan:** B (LangChain + LangGraph) + C (CrewAI) secara bertahap
- **Alasan:** LangGraph untuk state machine agent workflow; CrewAI untuk multi-agent collaboration di fase akhir; kombinasi ini covered di CCA-F exam.
- **Konsekuensi:** (+) aligned dengan CCA-F curriculum; (-) learning curve LangGraph; solusi: mulai simple chain dulu, LangGraph di Sprint 4.
- **Review:** Post-Sprint 2 – evaluasi apakah LangGraph perlu atau cukup sequential chain.

### ADR-005 – Tiga Tier Pricing: Starter / Growth / Enterprise
- **Tanggal:** 2026-03-25
- **Status:** ACCEPTED
- **Konteks:** Perlu model monetisasi yang bisa menjaring UKM kecil (entry), reseller serius (growth), dan brand mandiri (enterprise).
- **Pilihan:** (A) Flat pricing, (B) Usage-based, (C) Tier-based, (D) Custom only
- **Keputusan:** C – 3 tier: Starter (1.5jt setup + 300K/bln), Growth (3.5jt + 750K/bln), Enterprise (7.5-15jt + 1.5-3jt/bln)
- **Alasan:** Tier memudahkan sales conversation; entry point rendah mengurangi barrier; upsell path jelas (2 bulan pertama).
- **Konsekuensi:** (+) predictable MRR; (-) feature flag implementation wajib ada; solusi: middleware tier check sudah di-spec di doc 13.
- **Review:** Evaluasi setelah 3 klien pertama – apakah Growth tier cukup menarik.

---

## KEPUTUSAN OPERASIONAL

### ADR-006 – Freeze Fitur Baru Sampai Sprint 1 Selesai
- **Tanggal:** 2026-04-02
- **Status:** ACCEPTED
- **Konteks:** Terlalu banyak fitur direncanakan sebelum core infrastructure selesai. Risk: scope creep membuat WA routes tidak pernah jadi.
- **Pilihan:** (A) Build semua paralel, (B) Freeze fitur baru sampai core selesai
- **Keputusan:** B – Feature freeze sampai Task 1.1, 1.2, 1.3 selesai
- **Konsekuensi:** (+) fokus; (-) beberapa ide ditunda; semua ide baru masuk ke backlog di bawah.
- **Review:** Evaluasi setelah Sprint 1 selesai.

### ADR-007 – Tidak Pakai OpenAI, Ganti ke GROQ (Pending Evaluasi)
- **Tanggal:** 2026-04-03
- **Status:** UNDER REVIEW
- **Konteks:** OpenAI API key belum tersedia. GROQ menawarkan Llama3 gratis dengan rate limit lebih murah untuk dev/test.
- **Pilihan:** (A) Tunggu OpenAI key, (B) Pakai GROQ dulu untuk dev, switch OpenAI untuk prod, (C) Pakai GROQ permanent
- **Keputusan:** B – Pakai GROQ untuk Sprint 1-2, evaluasi ulang untuk Sprint 3+
- **Alasan:** Tidak perlu bayar untuk testing agent logic; GROQ API compatible dengan OpenAI SDK (tinggal ganti base URL).
- **Konsekuensi:** (+) bisa mulai build agent tanpa blocking; (-) perlu update base URL saat switch; solusi: abstraksi LLM provider di `src/lib/llm.ts`.
- **Review:** Saat Sprint 3 dimulai – evaluasi performa GROQ vs OpenAI untuk MessageComposer.

### ADR-008 – Dokumentasi Operasional Hidup, Bukan Arsip Statis
- **Tanggal:** 2026-04-03
- **Status:** ACCEPTED
- **Konteks:** Setelah 17 dokumen strategic selesai, pola yang muncul: dokumentasi lengkap tapi eksekusi ngambang. Dokumen strategis cukup – yang kurang adalah operating rhythm.
- **Pilihan:** (A) Terus tambah dokumen strategis, (B) Buat dokumen operasional living (sprint log, decision log, proof tracker, weekly review)
- **Keputusan:** B – Stop dokumen baru yang sifatnya blueprint; fokus ke living docs 18-22
- **Konsekuensi:** (+) eksekusi lebih terarah; (+) bukti nyata terakumulasi; (-) butuh disiplin update mingguan.
- **Review:** Evaluasi setelah 4 minggu pertama – apakah living docs konsisten diisi.

---

## KEPUTUSAN TIERING / FEATURE

### ADR-009 – Lead Inbox: Max 50 Lead Tier Starter
- **Tanggal:** 2026-04-02
- **Status:** ACCEPTED
- **Konteks:** Perlu batasi resource per tier untuk menjaga cost-to-serve terkontrol.
- **Keputusan:** Starter = 50 leads, Growth = 500 leads, Enterprise = unlimited
- **Implementasi:** Feature flag di middleware (sudah di-spec di doc 13)
- **Review:** Setelah 3 bulan live – adjust berdasarkan usage data nyata.

### ADR-010 – AI Features Hanya di Growth dan Enterprise
- **Tanggal:** 2026-04-02
- **Status:** ACCEPTED
- **Konteks:** AI inference cost per request ~$0.001-0.01. Starter tier margin terlalu tipis jika AI diaktifkan.
- **Keputusan:** ScoutScorer, MessageComposer, InsightGenerator – hanya Growth+
- **Konsekuensi:** (+) Starter bisa harga murah; (+) upgrade path jelas; (-) Starter mungkin terasa kurang powerful.
- **Review:** Jika churn Starter tinggi karena "kurang fitur", pertimbangkan limited AI trial.

---

## KEPUTUSAN GOVERNANCE & ROLE ARCHITECTURE

### ADR-011 – Managing Strategist Readiness Layer
- **Tanggal:** 2026-04-05
- **Status:** ACCEPTED
- **Konteks:** Sistem Sovereign tumbuh memerlukan lapisan manusia strategis kedua. Harus disiapkan di level arsitektur sebelum orangnya diaktifkan agar akses dan tanggung jawab tidak dadakan.
- **Pilihan:** (A) Tidak siapkan role sampai perlu (B) Siapkan role dormant sekarang di arsitektur
- **Keputusan:** B — Buat role Managing Strategist sebagai dormant role dengan permission matrix, escalation flow, dan activation trigger terdokumentasi
- **Alasan:** Konsisten dengan prinsip migration: incremental, evidence-based, tidak chaos. Role disiapkan di sistem, diaktifkan nanti berdasarkan proof.
- **Konsekuensi:** (+) Founder tidak improvisasi saat hari aktivasi tiba; (+) RBAC terdefinisi; (-) Butuh disiplin menjaga docs ini hidup
- **Docs dibuat:** `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `31-RBAC-PERMISSION-MATRIX.md`, `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md`, `33-PARTNERSHIP-AND-PROFIT-SHARING-MILESTONES.md`, `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md`
- **Cross-links:** `31-RBAC-PERMISSION-MATRIX.md` → `packages/auth/src/roles.ts` (future impl); `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md` → Session 3f WA approval gate; `34-EXTERNAL-MARKET-AND-PUBLISHING-GOVERNANCE.md` → `14-OPERATIONAL-RUNBOOK.md`
- **Review:** Saat activation trigger (Stage 0 → Stage 1) terpenuhi.

### ADR-012 – WA Routes Activation via Fonnte (Session 3f)
- **Tanggal:** 2026-04-05
- **Status:** ACCEPTED
- **Konteks:** Session 3f mengaktifkan WhatsApp/Fonnte integration secara narrowest safe scope. FONNTE_DEVICE_TOKEN ternyata berbeda dari FONNTE_ACCOUNT_TOKEN — perlu fix.
- **Pilihan:** (A) Pakai ACCOUNT_TOKEN untuk semua, (B) Pisahkan ACCOUNT_TOKEN untuk device check dan DEVICE_TOKEN untuk send
- **Keputusan:** B — getFonnteToken untuk send prioritaskan DEVICE_TOKEN, fonnteGetDeviceStatus tetap pakai ACCOUNT_TOKEN
- **Alasan:** Fonnte API requirement: device token untuk send, account token untuk management API.
- **Konsekuensi:** (+) WA send works; (+) status check works; (-) wajib maintain 2 token berbeda di Cloudflare Secrets
- **Review:** Jika Fonnte mengubah API auth model.

### ADR-013 – Repo-First Documentation Workflow Established
- **Tanggal:** 2026-04-06
- **Status:** ACCEPTED
- **Konteks:** Terdapat uploaded files (docs 30–34 variants) yang perlu diaudit terhadap repo. Diperlukan workflow yang jelas: clone repo dulu → audit current canonical docs → compare uploaded files as secondary → putuskan ADD/MERGE/UPDATE/SYNC/HOLD/PRIVATE.
- **Pilihan:** (A) Langsung copy uploaded files ke repo, (B) Repo-first audit sebelum setiap perubahan dokumentasi
- **Keputusan:** B — REPO-FIRST, DOCS-FIRST, AUDIT-BEFORE-EDIT sebagai mandatory workflow untuk semua sesi dokumentasi
- **Alasan:** Uploaded files bisa berupa conversational notes, raw founder thinking, duplikat, atau versi lebih lemah dari repo canon. Jika tidak di-audit dulu, risiko overwrting stronger docs dengan weaker drafts.
- **Hasil audit session ini:** Docs 30–34 di uploaded files = IDENTIK dengan repo. Tidak ada perubahan substantif yang diperlukan pada docs 30–34. Satu-satunya perubahan yang justified: update cross-link di ADR-011 dan penambahan ADR-013 ini.
- **Prinsip yang dikunci:** (1) Repo selalu primary source of truth; (2) Uploaded files selalu secondary; (3) PAT/auth untuk push deferred sampai tahap akhir; (4) Tidak membuat doc baru hanya karena nomor tersedia.
- **Review:** Setiap kali ada sesi upload dokumentasi baru.

---

## BACKLOG KEPUTUSAN (perlu diputuskan nanti)

| ID | Topik | Konteks | Deadline |
|----|-------|---------|----------|
| PENDING-001 | Apakah perlu mobile app native? | Dashboard saat ini web-only, klien minta app | Post-Sprint 5 |
| PENDING-002 | Stripe vs Xendit untuk payment? | Monetisasi klien perlu payment gateway | Sprint 5 |
| PENDING-003 | Multi-tenant vs single-tenant architecture? | Jika klien > 5, perlu tenant isolation | Sprint 4 |
| PENDING-004 | Apakah perlu onboarding wizard? | Klien non-teknis mungkin kesulitan setup | Sprint 3 |

---

*Document Control: v1.1 – 2026-04-06 – Living Document (ADR-013 ditambahkan: repo-first doc workflow)*
*CLASSIFIED – FOUNDER ACCESS ONLY*
