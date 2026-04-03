# ADR-002: Database Schema sebagai TypeScript Types (Supabase Pattern)

**Status:** ACCEPTED  
**Tanggal:** 2026-04-03  
**Session:** 2b — @sovereign/db Foundation

---

## Konteks

Package `@sovereign/db` butuh mendefinisikan shape database agar semua apps dan agents punya typed access ke Sovereign Bridge (sovereign-main Supabase).

Pilihan: ORM (Drizzle, Prisma) atau Supabase typed client pattern.

## Pilihan yang Dipertimbangkan

1. **Supabase typed client (Row/Insert/Update pattern)** — define table shapes sebagai TypeScript types, gunakan Supabase client yang sudah fully typed
2. **Drizzle ORM** — schema as code, full ORM query builder
3. **Raw SQL + manual types** — tulis query langsung, define types manual

## Keputusan

**Supabase typed client pattern** — `SovereignDatabase` type aggregate, table shapes sebagai `Row/Insert/Update` TypeScript types.

## Alasan

- Cloudflare Workers environment: ORM runtime (Prisma) tidak support edge runtime
- Supabase-js v2 sudah punya TypeScript generics yang kuat
- Pattern ini standard di ekosistem Supabase + Cloudflare Workers
- Tidak ada overhead runtime, semua type-level saja
- Drizzle juga bisa, tapi complexity lebih tinggi untuk saat ini

## Konsekuensi

- Schema didefinisikan sebagai TypeScript types (bukan generate dari DB)
- Perlu manual sync jika DB schema berubah di production
- Supabase `createClient<SovereignDatabase>()` memberikan full type safety
- Migration SQL tetap manual (tidak auto-generated dari schema types)

## Migration Note

Tabel LIVE (Domain 1 & 2 core): `users`, `leads`, `customers`, `products`, `orders`  
Tabel PLANNED Sprint 1: `wa_logs`, `ai_tasks`, `ai_insights`, `order_items`  
SQL scripts ada di: `migration/sql/001-004`
