# ADR-003: Auth Foundation Pattern — Web Crypto API + Hono Middleware
# Session: 2c
# Status: ACCEPTED
# Tanggal: 2026-04-04
# Author: AI Dev (Session 2c)

---

## Context

Saat membangun `@sovereign/auth` sebagai shared auth foundation untuk Cloudflare Workers
(Sovereign Tower + future apps), perlu memilih approach untuk:

1. JWT sign/verify implementation
2. TypeScript environment target untuk type resolution
3. Middleware pattern untuk Hono framework

Constraints utama:
- Harus kompatibel dengan Cloudflare Workers runtime (NO Node.js APIs)
- Harus reusable dan app-agnostic
- Harus zero external dependency untuk JWT operations
- TypeScript strict mode 0 errors

---

## Decisions

### S2C-001: Web Crypto API (SubtleCrypto) untuk JWT — bukan library eksternal

**Keputusan**: Implementasikan JWT murni menggunakan `crypto.subtle` (Web Crypto API).
Tidak menggunakan library seperti `jose`, `jsonwebtoken`, atau `hono/jwt`.

**Alasan**:
- Cloudflare Workers tidak mendukung Node.js `crypto` module
- `jose` menambah dependency dan bundle size tanpa manfaat signifikan di Workers context
- Web Crypto API sudah built-in di semua modern environments (Browser, Workers, Deno, Bun)
- Zero external dependency = lebih sedikit supply chain risk
- HS256 (HMAC-SHA256) cukup untuk use case sovereign ecosystem

**Implementasi**:
- Base64url encoding/decoding manual (bukan Buffer.from yang Node.js only)
- `crypto.subtle.importKey` + `crypto.subtle.sign/verify` untuk HMAC
- `TextEncoder` untuk string → Uint8Array conversion

**Alternatif yang ditolak**:
- `jose` — dependency besar, overhead tidak perlu
- `jsonwebtoken` — Node.js only, tidak kompatibel Workers
- `hono/jwt` — cukup untuk simple use case tapi kurang kontrol untuk custom payload
- `@tsndr/cloudflare-worker-jwt` — dependency eksternal, lebih baik own implementation

---

### S2C-002: tsconfig `lib: ["ES2022", "WebWorker"]`

**Keputusan**: Tambahkan `"WebWorker"` ke lib array, bukan `"DOM"`.

**Alasan**:
- `"WebWorker"` menyediakan semua Web APIs yang tersedia di Cloudflare Workers:
  `btoa`, `atob`, `crypto`, `CryptoKey`, `TextEncoder`, `Response`, `Request`, `fetch`
- Lebih precise dari `"DOM"` — menghindari browser-specific APIs yang tidak ada di Workers
- Konsisten dengan Cloudflare Workers runtime environment

**Alternatif yang ditolak**:
- `"DOM"` — terlalu broad, termasuk APIs yang tidak ada di Workers
- `"ES2022"` saja — tidak cukup untuk Web Crypto API types

---

### S2C-003: Hono middleware pattern dengan c.set('jwtPayload')

**Keputusan**: Store verified JWT payload ke Hono context variable `jwtPayload`
menggunakan `c.set()` / `c.get()`, dengan type deklarasi `SovereignAuthVariables`.

**Alasan**:
- Pattern standar Hono untuk shared state antar middleware dan route handler
- Type-safe via `SovereignAuthVariables` type yang di-export
- App yang menggunakan dapat declare `Hono<{ Variables: SovereignAuthVariables }>` 
  untuk fully typed `c.get('jwtPayload')`

**Implementasi pattern di Tower**:
```typescript
import { jwtMiddleware, founderOnly } from '@sovereign/auth'
import type { SovereignAuthVariables } from '@sovereign/auth'

type Env = { Bindings: CloudflareBindings, Variables: SovereignAuthVariables }
const app = new Hono<Env>()

app.use('/api/*', (c, next) => jwtMiddleware({ JWT_SECRET: c.env.JWT_SECRET })(c, next))
```

---

### S2C-004: Tidak menggunakan Supabase auth di packages/auth

**Keputusan**: `packages/auth` tidak mengimport atau bergantung pada `packages/db`
atau Supabase auth session management.

**Alasan**:
- Hindari circular dependency (db → auth → db)
- Auth foundation layer harus stateless — JWT only
- Supabase user lookup (jika diperlukan) adalah tanggung jawab route handler,
  bukan middleware foundation

**Catatan untuk Phase 3**:
Jika perlu lookup user dari DB saat validasi token, lakukan di route handler:
```typescript
app.get('/api/profile', jwtMiddleware(cfg), async (c) => {
  const payload = c.get('jwtPayload')
  const db = createServerClient(c.env)
  const user = await getUserById(db, payload.sub)  // dari @sovereign/db
  return c.json(user)
})
```

---

## Consequences

**Positif**:
- Zero external dependency untuk JWT operations
- Fully portable ke semua modern JS runtimes
- TypeScript strict 0 errors
- Clear separation: auth = JWT + guards, DB access = route handler responsibility

**Negatif / Trade-offs**:
- Base64url encoding manual (sedikit verbose) — acceptable trade-off
- Tidak ada built-in refresh token (dapat ditambah Phase 3 jika diperlukan)
- Testing membutuhkan environment dengan Web Crypto API (Node.js 18+ atau Workers)

---

## Related ADRs
- ADR-001: Monorepo dengan Turborepo (Session 1)
- ADR-002: DB schema pattern — Supabase typed client (Session 2b)
- ADR-004: Integrations pattern (Session 2d — TBD)
