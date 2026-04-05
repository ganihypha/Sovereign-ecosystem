# 31 – RBAC PERMISSION MATRIX
## Sovereign Business Engine v4.0
**Architect:** Haidar Faras Maulia | **Company:** PT Waskita Cakrawarti Digital
**Status:** DRAFT INTERNAL FRAMEWORK — Siap untuk implementasi platform
**Version:** 1.0 | **Tanggal:** 2026-04-05

> ⚠️ **CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL**

---

## 1. PRINSIP RBAC SOVEREIGN

Role-Based Access Control (RBAC) di Sovereign Ecosystem mengikuti prinsip:

1. **Founder sebagai satu-satunya Sovereign Controller** — tidak ada role di atas atau setara founder
2. **Least Privilege** — setiap role hanya mendapat akses minimum yang dibutuhkan
3. **Milestone-Based Upgrade** — kenaikan role hanya setelah bukti nyata, bukan berdasarkan waktu
4. **Centralized Definition** — semua logika permission didefinisikan di Sovereign Tower, tidak di sub-apps
5. **Human-Gated Sensitive Actions** — aksi irreversible atau berisiko tinggi selalu butuh founder approval
6. **Audit Trail** — semua perubahan role dan akses tercatat

---

## 2. ROLE HIERARCHY

```
┌────────────────────────────────────────────────────────────┐
│  ROLE 1: founder                                           │
│  ─────────────────────────────────────────────────────── │
│  Full sovereign access. Satu-satunya yang bisa:           │
│  - assign/revoke role                                      │
│  - lihat credential registry                               │
│  - approve deployment                                      │
│  - approve DB schema change                               │
│  - approve irreversible AI actions                         │
│  - override semua aksi                                     │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  ROLE 2: managing_strategist_candidate                     │
│  ─────────────────────────────────────────────────────── │
│  Observer mode. Belum aktif penuh.                        │
│  Akses: view beberapa panel + checklist + onboarding notes │
│  Tidak bisa: approve, kirim pesan, ubah data apapun       │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  ROLE 3: managing_strategist                               │
│  ─────────────────────────────────────────────────────── │
│  Operations layer aktif.                                  │
│  Akses: dashboard ops, lead tracker, follow-up, onboarding │
│  Tidak bisa: credentials, deployment, DB, pricing         │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  ROLE 4: strategic_operations_partner                      │
│  ─────────────────────────────────────────────────────── │
│  Extended ops scope.                                      │
│  Akses: semua role 3 + approve hal operasional tertentu   │
│  Tidak bisa: canonical brain, credentials, architecture   │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  ROLE 5: managing_partner                                  │
│  ─────────────────────────────────────────────────────── │
│  Hanya setelah: trust, revenue proof, stability terbukti  │
│  DRAFT INTERNAL FRAMEWORK — butuh definisi ulang saat ini  │
└────────────────────────────────────────────────────────────┘
```

---

## 3. PERMISSION MATRIX — DETAIL

### Legenda

| Symbol | Arti |
|--------|------|
| ✅ | Full access |
| 👁️ | Read-only |
| 🚫 | No access |
| 🔐 | Founder approval required |
| ⚠️ | Limited scope |

---

### A. SYSTEM & DEPLOYMENT

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Deploy ke production | ✅ | 🚫 | 🚫 |
| Rollback deployment | ✅ | 🚫 | 🚫 |
| Lihat deployment log | ✅ | 🚫 | 🚫 |
| Ubah wrangler.jsonc | ✅ | 🚫 | 🚫 |
| Ubah environment variables | ✅ | 🚫 | 🚫 |
| Lihat health endpoint | ✅ | 👁️ | 👁️ |

---

### B. CREDENTIALS & SECRETS

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Lihat Credential Registry | ✅ | 🚫 | 🚫 |
| Lihat nilai token/key | ✅ | 🚫 | 🚫 |
| Rotate / regenerate token | ✅ | 🚫 | 🚫 |
| Push ke Cloudflare Secrets | ✅ | 🚫 | 🚫 |
| Akses .dev.vars | ✅ | 🚫 | 🚫 |

---

### C. DATABASE & MIGRATIONS

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Approve DB schema change | ✅ | 🚫 | 🚫 |
| Jalankan migration | ✅ | 🚫 | 🚫 |
| Lihat DB schema | ✅ | 🚫 | 🚫 |
| Read data operasional | ✅ | 👁️ | 👁️ |
| Write data operasional | ✅ | ⚠️ (scope terbatas) | ⚠️ |
| Delete data | ✅ | 🔐 | 🔐 |

---

### D. AI ACTIONS & AGENTS

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Trigger irreversible AI action | ✅ | 🔐 | 🔐 |
| Trigger AI scoring / insights | ✅ | ⚠️ (approved scope) | ⚠️ |
| Review AI output sebelum kirim | ✅ | ✅ | ✅ |
| Approve AI-composed WA message | ✅ | ⚠️ (jika di-scope) | ⚠️ |
| Broadcast WA | ✅ | 🔐 | 🔐 |

---

### E. WHATSAPP & COMMUNICATION

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Single WA send ke lead | ✅ | ⚠️ (founder-gated saat ini) | ⚠️ |
| WA broadcast | ✅ | 🔐 | 🔐 |
| Lihat WA logs | ✅ | 👁️ | 👁️ |
| Template management | ✅ | ⚠️ | ✅ |

---

### F. OPERATIONAL DASHBOARD

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Lihat dashboard penuh | ✅ | 👁️ (ops view only) | 👁️ |
| Lihat revenue detail | ✅ | 🚫 | 👁️ (summary only) |
| Lihat lead pipeline | ✅ | ✅ | ✅ |
| Edit lead status | ✅ | ✅ | ✅ |
| Lihat order list | ✅ | ✅ | ✅ |
| Approve order | ✅ | ⚠️ | ✅ |

---

### G. GOVERNANCE & DECISIONS

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Tambah ADR | ✅ | 🔐 (request only) | 🔐 |
| Ubah Canonical Architecture Map | ✅ | 🚫 | 🚫 |
| Ubah pricing / tier | ✅ | 🚫 | 🚫 |
| Approve partnership | ✅ | 🚫 | 🔐 |
| Approve profit-sharing | ✅ | 🚫 | 🚫 |

---

### H. ROLE MANAGEMENT

| Permission | founder | managing_strategist | strategic_ops_partner |
|-----------|---------|---------------------|----------------------|
| Assign role ke user | ✅ | 🚫 | 🚫 |
| Revoke role | ✅ | 🚫 | 🚫 |
| Lihat audit log role | ✅ | 🚫 | 🚫 |
| Request upgrade role | 🚫 | ✅ (request only) | ✅ (request only) |

---

## 4. UPGRADE PATH — TRIGGER CONDITIONS

### Candidate → Managing Strategist

Semua kondisi berikut harus terpenuhi:

- [ ] SOP operasional sudah hidup dan dijalankan
- [ ] Dashboard operasional sudah rapi dan bisa digunakan
- [ ] Founder tidak lagi bekerja sepenuhnya dalam mode chaos/manual
- [ ] Follow-up dan continuity rhythm sudah stabil
- [ ] Aktivasi dilakukan oleh Founder melalui platform

### Managing Strategist → Strategic Operations Partner

Semua kondisi berikut harus terpenuhi:

- [ ] Managing Strategist berjalan > 3 bulan dengan KPI terpenuhi
- [ ] Founder daily ops time turun ke < 60 menit/hari untuk ops rutin
- [ ] Customer follow-up consistency > 90%
- [ ] Renewal reminder discipline berjalan
- [ ] WA response rate stabil
- [ ] Founder memutuskan upgrade berdasarkan bukti

### Strategic Operations Partner → Managing Partner

> ⚠️ DRAFT INTERNAL FRAMEWORK — definisi "Managing Partner" sebagai legal entity
> belum diputuskan. Ini hanya level upgrade internal, bukan perjanjian formal.

- [ ] Revenue stability > 6 bulan berturut-turut
- [ ] Trust terbukti melalui track record nyata
- [ ] Profit-sharing framework sudah matang (lihat `33-PARTNERSHIP-AND-PROFIT-SHARING-MILESTONES.md`)
- [ ] Mutual agreement antara Founder dan partner

---

## 5. IMPLEMENTATION NOTES (Future)

Ketika RBAC diimplementasikan di Sovereign Tower:

```typescript
// src/lib/rbac.ts (future)
type SovereignRole =
  | 'founder'
  | 'managing_strategist_candidate'
  | 'managing_strategist'
  | 'strategic_operations_partner'
  | 'managing_partner'

type Permission =
  | 'deploy:production'
  | 'credentials:read'
  | 'db:schema:change'
  | 'ai:irreversible'
  | 'wa:broadcast'
  | 'role:assign'
  | 'dashboard:revenue:full'
  // ... extend sesuai kebutuhan

const rolePermissions: Record<SovereignRole, Permission[]> = {
  founder: ['*'], // semua permission
  managing_strategist: [
    'dashboard:ops:read',
    'leads:read',
    'leads:write',
    'followup:write',
    // tidak include: deploy, credentials, db:schema, role:assign
  ],
  // ... dst
}

// Centralized check — dipakai oleh semua route di Tower
export function hasPermission(role: SovereignRole, permission: Permission): boolean {
  if (role === 'founder') return true
  return rolePermissions[role]?.includes(permission) ?? false
}
```

**PENTING:** Semua role logic harus di-define di Sovereign Tower (`packages/auth` atau `apps/sovereign-tower/src/lib/`), bukan di sub-apps (Fashionkas, Resellerkas, dll.).

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Versi | 1.0 |
| Status | DRAFT INTERNAL FRAMEWORK |
| Dibuat | 2026-04-05 |
| Sumber distilasi | `doc.manahing.stratgst.1.1.1.1.q.1...txt` + `nw.prompt.fr.gmini.1.1.1.q.q.1.txt` (raw founder notes) |
| Dokumen Terkait | `30-MANAGING-STRATEGIST-ROLE-PACK.md`, `32-HUMAN-APPROVAL-AND-ESCALATION-FLOW.md` |
| Review | Saat implementasi RBAC di platform dimulai |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL*
*DRAFT INTERNAL FRAMEWORK — bukan dokumen legal atau perjanjian formal*
