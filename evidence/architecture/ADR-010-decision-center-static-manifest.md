# ADR-010: Decision Center Wiring Pattern — Static ADR Manifest

**Status:** ACCEPTED  
**Date:** 2026-04-04  
**Session:** 3d  
**Author:** AI Dev Executor (Session 3d)  
**Reviewer:** Haidar Faras Maulia (Founder)

---

## Context

Decision Center (`/api/modules/decision-center`) perlu menampilkan daftar ADR (Architecture Decision Records) yang tersimpan di `evidence/architecture/*.md`.

Problem: **Cloudflare Workers tidak punya akses filesystem** — tidak bisa `fs.readdir` atau `fs.readFile` saat runtime. Ini adalah hard constraint dari Cloudflare edge runtime.

Opsi yang dievaluasi:
1. **Dynamic filesystem read** — ❌ TIDAK bisa di Cloudflare Workers
2. **Read dari Supabase DB** — memerlukan tabel `decision_logs` yang belum di-scope ke Sprint 1
3. **Static manifest dalam kode** — ✅ BISA, auditable, deterministic, tanpa dependency baru
4. **CDN/R2 bucket** — overhead terlalu besar untuk static docs

---

## Decision

Gunakan **static ADR manifest** yang di-embed langsung di kode `modules.ts`.

Format: array of objects `{ id, title, status, date, file, summary }`.

Update manifest dilakukan **manual per session** oleh AI Dev saat ada ADR baru ditambahkan ke `evidence/architecture/`.

---

## Rationale

- **Zero dependency tambahan** — tidak butuh tabel baru, tidak butuh storage baru
- **Deterministic** — manifest selalu tersedia bahkan tanpa DB/env
- **Auditable** — diff git langsung terlihat saat ada perubahan ADR
- **Fast** — tidak ada latency query, langsung dari memory
- **Consistent dengan Cloudflare Pages constraints**

---

## Consequences

**Positif:**
- Decision Center selalu available bahkan dalam fallback mode (tanpa DB)
- Easy to maintain: tambah satu baris array saat ada ADR baru
- No runtime failure risk

**Negatif / Trade-off:**
- Manual sync required: ADR baru di `evidence/architecture/` harus juga ditambahkan ke manifest
- Tidak real-time: jika ADR ditambahkan tapi manifest tidak di-update, ada gap
- Jika ADR count besar (100+), manifest mulai berat

**Mitigasi:**
- Setiap session yang menambah ADR wajib update manifest di `modules.ts`
- Future: tambah lint/test yang verify manifest consistent dengan `evidence/architecture/` file list

---

## Future Considerations

Jika perlu dynamic ADR management di masa depan:
- Buat tabel `decision_logs` di Supabase
- Migrate manifest ke DB (satu kali import)
- Tambah POST endpoint untuk submit ADR baru via form
- Sesuaikan saat session yang menjangkau scope ini

---

## Related ADRs

- ADR-003: Auth pattern (untuk endpoint protection)
- ADR-008: DB adapter pattern (untuk fallback consistent)
- ADR-009: Migration hardening (tabel yang sudah live di Sprint 1)

---

*ADR-010 dibuat saat session 3d — decision center wiring*
