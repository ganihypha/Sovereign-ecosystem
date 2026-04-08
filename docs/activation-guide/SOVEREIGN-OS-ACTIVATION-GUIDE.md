# 🏛️ SOVEREIGN OS — ACTIVATION & OPERATION GUIDE

**Version**: 4.0 (Canonical-Grade)  
**Status**: Fully Operational  
**Classification**: FOUNDER ACCESS ONLY

---

## 📋 EXECUTIVE SUMMARY

**Sovereign OS** adalah operating system tiga-layer (L1/L2/L3) untuk mengelola operasi bisnis dengan AI Developer. Sistem ini memisahkan **strategic command** (L1 Founder), **orchestration** (L2 AI), dan **execution** (L3 AI) untuk memastikan operasi yang terkontrol, tersertifikasi, dan institutional-grade.

---

## 🏗️ ARSITEKTUR SOVEREIGN OS

### Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│  L1: FOUNDER (Strategic Command)                        │
│  - Membuat keputusan strategis                          │
│  - Memberikan bounded brief ke L2                       │
│  - Menerima proof dari L3 via L2                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  L2: AI ORCHESTRATOR (Sovereign Brain)                  │
│  - Intake assessment dari L1                            │
│  - Bounded brief creation untuk L3                      │
│  - Quality control & verification                       │
│  - Return proof collection                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  L3: AI EXECUTOR (Technical Execution)                  │
│  - Menerima bounded brief dari L2                       │
│  - Eksekusi teknis (code, deploy, test)                │
│  - Generate return proof untuk L2                       │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure (Canonical)

```
sovereign-ecosystem/
├── governance/              # Layer governance & STACK docs
│   ├── stack/              # STACK-00 through STACK-07
│   ├── continuity/         # OS kernel docs (38-42)
│   └── doctrine/           # Sovereign Private Chair (43)
├── ops/                    # Operational documents
│   ├── live/              # active-priority.md
│   ├── handoff/           # current-handoff.md, L2-INTAKE
│   ├── logs/              # Build sprint, decision, proof tracker
│   ├── audit/             # Quality audits
│   ├── registry/          # Asset registry
│   └── templates/         # Reusable templates
├── docs/                   # Documentation
│   ├── indexes/           # OS-INDEX, credential-map, etc
│   ├── reference/         # Business docs (00-37)
│   └── sessions/          # Session summaries
└── workspace/             # Active work
    ├── projects/          # Project folders
    ├── implementation/    # Implementation artifacts
    ├── experiments/       # Experiments & POCs
    └── outputs/           # Generated outputs
```

---

## 📚 STACK DOCUMENTS (STACK-00 through STACK-07)

STACK adalah **core governance layer** Sovereign OS. Ini adalah dokumen-dokumen yang mengatur cara kerja setiap layer.

### STACK-00: STACK GOVERNANCE INDEX
- **Purpose**: Master index untuk semua STACK documents
- **Contains**: Overview struktur governance dan referensi ke semua STACK docs

### STACK-01: L1 MASTER SYSTEM PROMPT
- **Purpose**: System prompt untuk Founder (L1)
- **Contains**: 
  - Cara Founder berinteraksi dengan L2
  - Format bounded brief
  - Expected behavior dari L1

### STACK-02: L1 OPERATING SOP
- **Purpose**: Standard Operating Procedure untuk L1
- **Contains**:
  - Workflow L1 ke L2
  - Decision-making protocols
  - Escalation procedures

### STACK-03: L1-TO-L2 HANDOFF PACK
- **Purpose**: Template & protocol untuk handoff L1 ke L2
- **Contains**:
  - Handoff document structure
  - Required information checklist
  - Acceptance criteria

### STACK-04: L2 INTAKE TEMPLATE
- **Purpose**: Template untuk L2 melakukan intake assessment
- **Contains**:
  - Assessment checklist
  - Scope definition
  - Risk analysis framework

### STACK-05: L2 OPERATING SOP
- **Purpose**: Standard Operating Procedure untuk L2 Orchestrator
- **Contains**:
  - L2 workflow (intake → brief → verify → return)
  - Quality gates
  - Communication protocols

### STACK-06: L2-TO-L3 EXECUTION BRIEF
- **Purpose**: Template bounded brief dari L2 ke L3
- **Contains**:
  - Brief structure
  - Success criteria
  - Constraints & boundaries
  - Return proof requirements

### STACK-07: L3 RETURN PROOF TEMPLATE
- **Purpose**: Template untuk L3 memberikan proof ke L2
- **Contains**:
  - Proof format
  - Evidence requirements
  - Testing & validation artifacts

---

## 🔄 SOVEREIGN OS WORKFLOW

### Standard Operating Flow

```
1. L1 FOUNDER BRIEF
   ↓
2. L2 INTAKE ASSESSMENT
   - Review founder brief
   - Scope definition
   - Risk & dependency analysis
   ↓
3. L2 CREATES BOUNDED BRIEF FOR L3
   - Clear objectives
   - Success criteria
   - Constraints
   - Return proof format
   ↓
4. L3 EXECUTES
   - Technical implementation
   - Testing
   - Documentation
   ↓
5. L3 RETURNS PROOF TO L2
   - Code artifacts
   - Test results
   - Deployment URLs
   - Documentation
   ↓
6. L2 VERIFIES & RETURNS TO L1
   - Quality check
   - Proof consolidation
   - Session summary
```

---

## 🚀 CARA MENGAKTIFKAN SOVEREIGN OS DI CONVERSATION BARU

### Option 1: Quick Boot (Recommended)

Gunakan prompt ini di conversation baru:

```
SOVEREIGN OS BOOT — SESSION [X]

Context: Saya adalah Founder dari Sovereign Business Engine v4.0. 
Kita menggunakan Sovereign OS untuk mengelola development operations.

Aktivasi: LEVEL 2 ORCHESTRATOR MODE

Repository: https://github.com/ganihypha/Sovereign-ecosystem
Branch: main

Required Reading:
1. governance/stack/STACK-05-L2-OPERATING-SOP.md
2. ops/handoff/current-handoff.md
3. docs/indexes/OS-INDEX.md

Credentials: Available in .dev.vars (19 env vars)

Session Objective: [URAIKAN TUJUAN SESSION INI]

Request: Lakukan L2 Intake Assessment sesuai STACK-04, kemudian berikan
rekomendasi untuk bounded brief L3.
```

### Option 2: Full Boot Sequence

Untuk session yang memerlukan full context:

```
SOVEREIGN OS FULL BOOT — SESSION [X]

LEVEL: L2 ORCHESTRATOR MODE
CLASSIFICATION: FOUNDER ACCESS ONLY

=== CONTEXT LOADING ===

1. ORGANIZATIONAL CONTEXT
   - Company: PT Waskita Cakrawarti Digital
   - Product: Sovereign Business Engine v4.0
   - Architecture: 3-layer (L1 Founder / L2 Orchestrator / L3 Executor)

2. REPOSITORY STATUS
   - Canonical Repo: https://github.com/ganihypha/Sovereign-ecosystem
   - Branch: main
   - Last Session: [4A/4B/etc]
   - Status: [Production/Development]

3. SYSTEM FILES (WAJIB BACA)
   Path: /home/user/webapp/sovereign-ecosystem/
   
   Priority Read:
   - governance/stack/STACK-00-STACK-GOVERNANCE-INDEX.md
   - governance/stack/STACK-05-L2-OPERATING-SOP.md
   - governance/continuity/39-AI-OPERATING-KERNEL.md
   - ops/handoff/current-handoff.md
   - ops/live/41-ACTIVE-PRIORITY.md
   - docs/indexes/OS-INDEX.md

4. CREDENTIALS
   Location: .dev.vars (19 env vars)
   Include: Supabase, Cloudflare, GitHub, Groq, Fonnte

5. DEVELOPMENT ENVIRONMENT
   - pnpm workspace (monorepo)
   - Main app: apps/sovereign-tower
   - Port: 3001 (wrangler pages dev)
   - PM2: sovereign-tower

=== SESSION OBJECTIVE ===

[URAIKAN TUJUAN SESSION INI SECARA DETAIL]

=== L2 INSTRUCTIONS ===

1. Clone canonical repo jika belum ada
2. Baca dokumen governance wajib
3. Review ops/handoff/current-handoff.md
4. Lakukan L2 Intake Assessment (STACK-04)
5. Buat bounded brief untuk L3 (STACK-06)
6. Supervisi eksekusi L3
7. Collect & verify return proof (STACK-07)
8. Update current-handoff.md
9. Commit & push ke GitHub

AKTIVASI SEKARANG.
```

---

## 📖 KEY DOCUMENTS UNTUK ACTIVATION

### Minimal Read (Quick Boot)
1. **STACK-05-L2-OPERATING-SOP.md** — Cara kerja L2
2. **current-handoff.md** — Status terkini project
3. **OS-INDEX.md** — Master index semua dokumen

### Full Context Read (Complete Boot)
1. **STACK-00** through **STACK-07** — Semua governance
2. **39-AI-OPERATING-KERNEL.md** — Core AI operating principles
3. **40-FOUNDER-BRAIN.md** — Founder's strategic thinking model
4. **41-ACTIVE-PRIORITY.md** — Current priorities
5. **42-NEW-CONVO-BOOT.md** — Boot protocols
6. **43-THE-SOVEREIGN-PRIVATE-CHAIR.md** — Doctrine & principles

---

## 🎯 OPERASI SOVEREIGN OS DALAM PRAKTIK

### Contoh Session Flow

**Session 4A — ScoutScorer Implementation** ✅ VERIFIED

```
L1 FOUNDER BRIEF:
"Implementasi ScoutScorer Agent dengan WhatsApp integration"

L2 INTAKE ASSESSMENT:
- Review existing ScoutScorer spec
- Verify credential readiness (Supabase, Fonnte)
- Define success criteria: E2E test passing
- Create bounded brief for L3

L2-TO-L3 BOUNDED BRIEF:
- Objective: Implement ScoutScorer with WhatsApp webhook
- Constraints: Use Cloudflare Workers, Supabase
- Success: Test with live Fonnte webhook
- Return Proof: Working deployment URL + test evidence

L3 EXECUTION:
- Code implementation
- Deploy to Cloudflare Pages
- Integration testing

L3 RETURN PROOF:
- Code: GitHub commit c775402
- Deploy URL: https://sovereign-tower.pages.dev
- Test: E2E test passing (score: 85)
- Evidence: Screenshot + logs

L2 VERIFICATION:
- Quality check: PASSED
- Session summary created
- Proof tracker updated
- Handoff document updated

STATUS: ✅ SESSION 4A CLOSED
```

---

## 🔐 CREDENTIAL MANAGEMENT

### Lokasi Credentials

```bash
# Development
/home/user/webapp/sovereign-ecosystem/.dev.vars

# Production (Cloudflare)
npx wrangler pages secret list --project-name sovereign-tower
```

### Required Credentials (19 env vars)

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
JWT_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
GROQ_API_KEY
GITHUB_TOKEN
FONNTE_DEVICE_TOKEN
FONNTE_ACCOUNT_TOKEN
SCRAPERAPI_KEY
# + 8 additional vars
```

### Setup Credentials

```bash
# Clone repo
git clone https://github.com/ganihypha/Sovereign-ecosystem.git

# Copy .dev.vars dari secure location
cp /path/to/secure/.dev.vars .

# Verify protection
grep "\.dev\.vars" .gitignore
```

---

## 🛠️ DEVELOPMENT OPERATIONS

### Start Development Server

```bash
cd /home/user/webapp/sovereign-ecosystem/apps/sovereign-tower

# Build first
pnpm build

# Start with PM2
pm2 start ecosystem.config.cjs

# Check status
pm2 logs sovereign-tower --nostream

# Test
curl http://localhost:3001/health
```

### Deploy to Production

```bash
cd /home/user/webapp/sovereign-ecosystem/apps/sovereign-tower

# Deploy
pnpm deploy

# Verify
curl https://sovereign-tower.pages.dev/health
```

---

## 📊 TRACKING & DOCUMENTATION

### Required Updates Per Session

1. **ops/handoff/current-handoff.md**
   - Update session status
   - Add latest developments
   - Update blockers

2. **ops/logs/18-BUILD-SPRINT-LOG.md**
   - Log sprint activities
   - Record technical decisions

3. **ops/logs/19-DECISION-LOG.md**
   - Document architectural decisions
   - Rationale & alternatives

4. **ops/logs/21-PROOF-TRACKER-LIVE.md**
   - Add session proof
   - Link to artifacts
   - Status update

5. **docs/sessions/session-[X]-summary.md**
   - Session summary
   - Achievements
   - Next steps

---

## ✅ SOVEREIGN OS QUALITY GATES

### L2 Verification Checklist

Before closing any session, L2 harus verify:

- ✅ **Code Quality**: No TypeScript errors, proper types
- ✅ **Testing**: Unit tests pass, E2E test pass
- ✅ **Deployment**: Production URL accessible
- ✅ **Documentation**: README updated, inline comments
- ✅ **Credentials**: Secrets not exposed, .gitignore active
- ✅ **Git**: Committed, pushed, tagged
- ✅ **Proof**: Return proof complete (code + tests + URLs)
- ✅ **Handoff**: current-handoff.md updated
- ✅ **Logs**: Sprint log + decision log updated
- ✅ **Tracker**: Proof tracker updated

---

## 🚨 TROUBLESHOOTING

### Issue: Sovereign OS Tidak Aktif di Session Baru

**Solution**: Gunakan activation prompt (Option 1 atau 2) di atas.

### Issue: AI Tidak Mengikuti STACK Governance

**Solution**: 
1. Reference STACK document spesifik
2. Contoh: "Sesuai STACK-05-L2-OPERATING-SOP, kamu harus..."

### Issue: Repository Tidak Tersync

**Solution**:
```bash
cd /home/user/webapp/sovereign-ecosystem
git pull origin main
```

### Issue: Credentials Missing

**Solution**:
```bash
# Copy dari secure location
cp /secure/.dev.vars /home/user/webapp/sovereign-ecosystem/

# Atau extract dari uploaded file
grep "^[A-Z_]" credential-source.txt > .dev.vars
```

---

## 📝 CONTOH PROMPT AKTIVASI PER USE CASE

### Use Case 1: New Feature Development

```
SOVEREIGN OS BOOT — SESSION 4C

Aktivasi: L2 ORCHESTRATOR MODE
Repo: https://github.com/ganihypha/Sovereign-ecosystem

Session Objective: Implementasi WhatsApp Broadcast Scheduler

Context:
- Session sebelumnya: 4A & 4B (ScoutScorer) ✅ VERIFIED
- Feature baru: Scheduled broadcast untuk WhatsApp
- Tech stack: Cloudflare Workers + Cron Triggers + Supabase

Request:
1. Clone repo & setup environment
2. Baca governance/stack/STACK-05-L2-OPERATING-SOP.md
3. Review ops/handoff/current-handoff.md
4. Lakukan L2 Intake Assessment
5. Buat bounded brief untuk L3 execution
6. Supervisi implementation
7. Verify & collect return proof
```

### Use Case 2: Bug Fix

```
SOVEREIGN OS BOOT — SESSION 4D

Aktivasi: L2 ORCHESTRATOR MODE
Repo: https://github.com/ganihypha/Sovereign-ecosystem

Session Objective: Fix WhatsApp webhook authentication bug

Context:
- Issue: Webhook returning 401 Unauthorized
- Affected: ScoutScorer Agent (Session 4A)
- Priority: HIGH (production issue)

Request:
1. Quick boot (minimal context read)
2. Review ops/live/41-ACTIVE-PRIORITY.md
3. Diagnose authentication issue
4. Fix & test
5. Deploy hotfix
6. Update proof tracker
```

### Use Case 3: Documentation Update

```
SOVEREIGN OS BOOT — SESSION 4E

Aktivasi: L2 ORCHESTRATOR MODE
Repo: https://github.com/ganihypha/Sovereign-ecosystem

Session Objective: Update API documentation

Context:
- ScoutScorer API sudah deployed
- Need: Complete API docs untuk external consumption
- Format: OpenAPI 3.0 spec + README

Request:
1. Clone repo
2. Review existing API routes
3. Generate OpenAPI spec
4. Update README with examples
5. Commit & push
6. Update handoff doc
```

---

## 🎓 BEST PRACTICES

### Untuk Founder (L1)

1. **Be Specific**: Brief yang spesifik menghasilkan output yang lebih baik
2. **Set Boundaries**: Define success criteria & constraints jelas
3. **Trust the Process**: L2 akan orchestrate, L3 akan execute
4. **Review Return Proof**: Selalu verify proof sebelum accept

### Untuk L2 AI Orchestrator

1. **Always Read Context**: Clone repo, baca handoff doc
2. **Follow STACK**: Governance di STACK adalah law
3. **Create Bounded Brief**: Jangan overwhelm L3
4. **Verify Everything**: Quality gate harus pass semua
5. **Document Everything**: Update logs, tracker, handoff

### Untuk L3 AI Executor

1. **Follow Brief**: Jangan deviate dari bounded brief
2. **Generate Proof**: Code + tests + deployment + docs
3. **Ask Questions**: Kalau brief unclear, clarify dengan L2
4. **No Shortcuts**: Follow all best practices

---

## 📞 SUPPORT & ESCALATION

### L3 → L2 Escalation

Jika L3 encounter blocker:
1. Pause execution
2. Document blocker di logs
3. Request clarification dari L2
4. Wait for L2 response

### L2 → L1 Escalation

Jika L2 encounter strategic decision:
1. Pause orchestration
2. Prepare decision brief untuk L1
3. Request Founder input
4. Wait for L1 decision

### Emergency Protocol

Untuk production issues:
1. Mark as HIGH priority di active-priority.md
2. Quick boot (minimal context)
3. Hotfix & deploy immediately
4. Post-mortem documentation after

---

## 🏆 SUCCESS METRICS

Sovereign OS dianggap sukses jika:

- ✅ **Predictable**: Setiap session mengikuti flow yang sama
- ✅ **Traceable**: Semua decisions & proof terdokumentasi
- ✅ **Scalable**: Bisa handle multiple sessions parallel
- ✅ **Reliable**: 95%+ sessions closed successfully
- ✅ **Maintainable**: Mudah untuk onboard L2/L3 baru

---

## 📅 VERSION HISTORY

| Version | Date       | Changes                                      |
|---------|------------|----------------------------------------------|
| 4.0     | 2026-04-08 | Canonical-grade upgrade, institutional-ready |
| 3.0     | 2026-04-07 | Session 4A verified, ScoutScorer live        |
| 2.0     | 2026-04-03 | STACK governance finalized                   |
| 1.0     | 2026-03-15 | Initial Sovereign OS architecture            |

---

## 🔗 QUICK LINKS

- **GitHub**: https://github.com/ganihypha/Sovereign-ecosystem
- **Production**: https://sovereign-tower.pages.dev
- **Supabase**: https://ljixhglhoyivhidseubp.supabase.co
- **Cloudflare**: Account ID `618d52f63c689422eacf6638436c3e8b`

---

*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
