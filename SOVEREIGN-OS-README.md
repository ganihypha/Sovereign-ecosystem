# SOVEREIGN OS - Operating System Layer
**Version:** v1.0  
**Status:** Canonical Structure — Operational  
**Last Updated:** 2026-04-08  
**Owner:** PT Waskita Cakrawarti Digital (Founder: Haidar Faras Maulia)

---

## 🎯 PURPOSE

Sovereign OS adalah **operating system layer** yang mengatur governance, orchestration, execution, dan official records untuk seluruh Sovereign Business Engine ecosystem.

Ini **bukan sekadar folder structure** — ini adalah **full operating model** yang mengkonversi founder intent menjadi bounded orchestration, bounded execution, dan official historical records.

---

## 🏗️ ARCHITECTURE

```
Founder Intent
    ↓
Layer 1 (L1) — Founder Operating Copilot
    ↓ [Handoff Pack]
Layer 2 (L2) — Master Architect / Orchestration
    ↓ [Execution Brief]
Layer 3 (L3) — AI Dev Executor / Implementation
    ↓ [Proof Return]
L2 Verification → Canon Promotion
```

---

## 📁 DIRECTORY STRUCTURE

```
sovereign-os/
├── governance/          ← Canon law, architecture, doctrine
│   ├── stack/           ← STACK-00 to STACK-07 (layer definitions)
│   ├── continuity/      ← Docs 38-42 (OS operating kernel)
│   └── doctrine/        ← Doc 43 (governance doctrine)
│
├── ops/                 ← Live operational state
│   ├── live/            ← active-priority.md, current-state.md
│   ├── handoff/         ← current-handoff.md, handoff-history.md
│   ├── logs/            ← decision-log, execution-log, proof-tracker
│   ├── audit/           ← gate-audit, drift-audit, verification-audit
│   ├── registry/        ← session-registry, task-registry, proof-registry
│   └── templates/       ← Handoff templates, brief templates
│
├── docs/                ← Reference documents (Docs 00-37)
│   ├── indexes/         ← Master indexes, architecture maps
│   ├── reference/       ← Business docs (PRD, revenue, CCA-F, etc)
│   ├── architecture/    ← System architecture references
│   ├── revenue/         ← Revenue strategy docs
│   ├── execution/       ← Execution guides
│   ├── runbooks/        ← Operational runbooks
│   ├── infrastructure/  ← Infrastructure docs
│   └── governance-support/ ← Governance support materials
│
└── workspace/           ← Active implementation work
    ├── projects/        ← Active project work
    ├── implementation/  ← Implementation artifacts
    ├── experiments/     ← Experimental work
    └── outputs/         ← Generated outputs
```

---

## 📚 DOCUMENT REGISTRY

### **Governance Canon (HIGHEST AUTHORITY)**

#### **Stack Layer (Layer Definitions)**
- `governance/stack/STACK-00-STACK-GOVERNANCE-INDEX.md` — Master navigation
- `governance/stack/STACK-01-L1-MASTER-SYSTEM-PROMPT.md` — L1 identity & role
- `governance/stack/STACK-02-L1-OPERATING-SOP.md` — L1 operating procedures
- `governance/stack/STACK-03-L1-TO-L2-HANDOFF-PACK.md` — L1→L2 handoff
- `governance/stack/STACK-04-L2-INTAKE-TEMPLATE.md` — L2 intake normalization
- `governance/stack/STACK-05-L2-OPERATING-SOP.md` — L2 orchestration procedures
- `governance/stack/STACK-06-L2-TO-L3-EXECUTION-BRIEF.md` — L2→L3 brief
- `governance/stack/STACK-07-L3-RETURN-PROOF-TEMPLATE.md` — L3→L2 proof return

#### **Continuity Layer (Operating Kernel)**
- `governance/continuity/38-FOUNDER-OPERATING-COPILOT.md` — L1 AI layer
- `governance/continuity/39-AI-OPERATING-KERNEL.md` — Continuity system
- `governance/continuity/40-FOUNDER-BRAIN.md` — Strategic core memory
- `governance/continuity/42-NEW-CONVO-BOOT.md` — Session entry protocol

#### **Doctrine Layer (Governance Doctrine)**
- `governance/doctrine/43-THE-SOVEREIGN-PRIVATE-CHAIR.md` — Highest trust governance

---

### **Operational State (LIVE TRUTH)**

#### **Live State**
- `ops/live/41-ACTIVE-PRIORITY.md` — Current priorities (NOW/NEXT/NOT NOW)

#### **Handoff Zone**
- `ops/handoff/current-handoff.md` — Current operational state anchor

#### **Logs**
- `ops/logs/19-DECISION-LOG.md` — Decision audit trail
- `ops/logs/18-BUILD-SPRINT-LOG.md` — Sprint execution log
- `ops/logs/21-PROOF-TRACKER-LIVE.md` — Proof and verification log

---

### **Reference Docs (SUPPORTING MATERIAL)**
- `docs/indexes/` — Master indexes, architecture maps
- `docs/reference/` — 36 business documents (00-37)

See `docs/indexes/00-MASTER-INDEX.md` for complete document catalog.

---

## 🔐 SECURITY & CREDENTIALS

**CRITICAL:** This directory contains `.dev.vars` file with **all production credentials**.

### **Credential Status:**
✅ Supabase (Database)  
✅ JWT Secret (Auth)  
✅ Cloudflare (Deploy)  
✅ GROQ API (AI/LLM)  
✅ GitHub Token (Repo)  
✅ Fonnte (WhatsApp)  
✅ ScraperAPI (Instagram Scout)

### **Security Rules:**
- `.dev.vars` is in `.gitignore` — **NEVER commit to git**
- All credentials are also stored in Cloudflare Secrets (production)
- Rotate credentials every 90 days (JWT_SECRET) or when suspected leak

---

## 🎯 CURRENT STATE

**Latest Verified Session:** Session 3G & 4A ✅ VERIFIED AND READY TO CLOSE

**Production URLs:**
- Sovereign Tower: `https://sovereign-tower.pages.dev`
- Canonical Repo: `https://github.com/ganihypha/sovereign-ecosystem`

**Active Features:**
✅ Auth Gate (JWT + PIN)  
✅ WA Integration (Webhook + Queue + Broadcast)  
✅ ScoutScorer Agent (GROQ llama-3.1-8b-instant)  
✅ Dashboard & Modules  
✅ Decision Center  
✅ Founder Review  

---

## 📋 SOURCE OF TRUTH HIERARCHY

When conflicts exist, prefer truth in this order:

1. **Explicit founder decision**
2. **Current approved L1 handoff**
3. **Current approved L2 decision artifacts**
4. **Governance canon** (STACK docs + continuity doctrine)
5. **Current live operational state**
6. **Verified proof artifacts**
7. **Supporting reference docs**
8. **Legacy or historical material**
9. **Assumptions**

**No lower tier may silently override a higher tier.**

---

## 🚀 NEXT STEPS

### **For L2 Orchestration:**
1. Read `governance/stack/STACK-05-L2-OPERATING-SOP.md`
2. Check `ops/handoff/current-handoff.md` for operational state
3. Review `ops/live/41-ACTIVE-PRIORITY.md` for priorities
4. Prepare L2 intake assessment using `governance/stack/STACK-04-L2-INTAKE-TEMPLATE.md`

### **For L3 Execution:**
1. Wait for L2 bounded brief (via `governance/stack/STACK-06-L2-TO-L3-EXECUTION-BRIEF.md`)
2. Execute within bounded scope
3. Return proof using `governance/stack/STACK-07-L3-RETURN-PROOF-TEMPLATE.md`

### **For Founder:**
1. Check `ops/live/41-ACTIVE-PRIORITY.md` for current focus
2. Review `ops/logs/` for decision trail and proof
3. Issue new intent via L1 (Doc 38)

---

## ⚠️ NON-NEGOTIABLES

1. **No role collapse** — L1, L2, and L3 must remain distinct
2. **No false readiness** — readiness must be evidence-based
3. **No false verification** — proof ≠ verification
4. **No undocumented meaningful work** — if it matters, record it
5. **No secret exposure** — credentials must not leak into docs
6. **No silent canonization** — nothing becomes canon implicitly
7. **No silent supersession** — replaced rules must be marked

---

## 📞 CONTACT

**Owner:** Haidar Faras Maulia  
**Company:** PT Waskita Cakrawarti Digital  
**Classification:** ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY

---

*Last Updated: 2026-04-08 | Sovereign OS v1.0 | Canonical Structure Established*
