# ADR-001: Monorepo dengan Turborepo sebagai Mother Repo Strategy
**Status:** ACCEPTED
**Tanggal:** 2026-04-03
**Session:** 1 — Mother Repo Skeleton

---

## Konteks
Sovereign Ecosystem memiliki 4 repo terpisah yang tidak terintegrasi.
Dibutuhkan governance center yang bisa menyatukan shared packages tanpa merge semua repo.

## Pilihan yang Dipertimbangkan
1. **Monorepo Turborepo** — semua packages dalam satu repo, apps tetap independent
2. **Multi-repo** — setiap app/package punya repo sendiri, tidak ada canonical home
3. **Full monorepo** — semua app masuk satu repo (terlalu radical)

## Keputusan
**Turborepo monorepo** untuk packages + governance, apps tetap standalone repo.

## Alasan
- Packages shared perlu satu sumber kebenaran
- Apps (Fashionkas, Resellerkas, Tower) tetap independent brand + deploy
- Turborepo build caching menghemat waktu build
- Sesuai dokumen 27-MOTHER-REPO-STRUCTURE.md

## Konsekuensi
- Apps import @sovereign/* via workspace atau npm publish
- Phase 2: packages di-implement
- Phase 3-4: apps disambungkan ke packages
