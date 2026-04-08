# 39 — AI OPERATING KERNEL
Classification: Sovereign OS Layer — Continuity System
Status: OFFICIAL — LIVING
Version: 1.0
Last Updated: 2026-04-08
Source Authority: Repo canon — current-handoff.md (sha:6a9754e758bf), MASTER-ARCHITECT-PROMPT-v2.txt (sha:d512e394c84a), CREDENTIAL-AND-ACCESS-READINESS.md (sha:3a54186f9d88), new-convo-boot.txt (sha:9b7b430538b4), 29-AI-DEV-HANDOFF-PACK.md (sha:71ebc2a203db)
Repo Status: REPO-ABSENT — push-ready, awaiting GitHub auth

---

## Purpose

AI Operating Kernel adalah **fondasi continuity sistem Sovereign lintas session**.

Tanpa kernel ini, setiap AI yang masuk ke sistem harus di-brief ulang dari awal.
Dengan kernel ini, AI dapat masuk ke state yang benar dengan membaca operating memory,
bukan mengandalkan chat history.

---

## Core Principle

```
Living docs + repo + handoff = official memory of the system
Chat history = supplemental nuance only
```

---

## Memory Layer Architecture

### Layer 1 — Founder Brain (Strategic Core)
- File: `founder-brain.md` (sha: ecf35e493f90 — repo v1.0)
- Berisi: objective, winning definition, non-negotiables, decision style, energy rules
- Canonical Doc: Doc 40 — FOUNDER-BRAIN.md

### Layer 2 — Current State (Operational Anchor)
- File: `current-handoff.md` (sha: 6a9754e758bf — repo, 317 lines)
- Berisi: latest verified session, operational status, blockers, next target
- Rule: do not rewrite verified sections without new proof

### Layer 3 — Source-of-Truth Map (Navigation)
- Files: `repo-target.md`, `CREDENTIAL-AND-ACCESS-READINESS.md`
- Berisi: canonical repo target, boundary rules, credential gate
- Critical: repo-target.md menyebutkan repo sebagai "Private" — verified by API sebagai PUBLIC (drift noted)

### Layer 4 — Active Priorities (Execution Board)
- File: `active-priority.md` (sha: 8590672683f1 — repo v1.0)
- Berisi: NOW/NEXT/LATER/NOT NOW, current session target, blockers
- Canonical Doc: Doc 41 — ACTIVE-PRIORITY.md

### Layer 5 — Session Boot Source (Entry Protocol)
- Files: `new-convo-boot.txt`, `MASTER-ARCHITECT-PROMPT-v2.txt`
- Berisi: entry instruction, identity protocol, first-trust-file order
- Canonical Doc: Doc 42 — NEW-CONVO-BOOT.md

---

## Source-of-Truth Priority Order

```
1. current-handoff.md          → operational state anchor
2. active-priority.md          → live priority board
3. founder-brain.md            → strategic core memory
4. 19-DECISION-LOG.md          → decision audit trail
5. 21-PROOF-TRACKER-LIVE.md    → proof and verification log
6. repo-target.md              → canonical repo boundary
7. 29-AI-DEV-HANDOFF-PACK.md   → AI dev onboarding rules
8. 00-MASTER-INDEX.md          → full doc map (37 docs)
9. relevant sprint/task docs   → session-specific context
10. conversation history        → supplemental nuance only
```

---

## Session Entry Logic

When a new AI session begins:

```
STEP 1: Determine session type
  → founder-facing? → activate Founder Operating Copilot (Doc 38)
  → execution-facing? → activate AI Dev Executor mode

STEP 2: Read operating memory in order
  → current-handoff.md → latest verified state
  → active-priority.md → current priorities
  → founder-brain.md → strategic intent

STEP 3: Run Credential & Access Gate (for execution sessions)
  → check repo access
  → check push capability
  → check .env / .dev.vars
  → produce PROCEED / BLOCKED decision

STEP 4: Identify
  → what is already verified (do not disturb)
  → current blockers
  → founder manual actions required
  → highest-value next step

STEP 5: Execute or advise — within verified scope only
```

---

## Credential and Access Gate

Per `CREDENTIAL-AND-ACCESS-READINESS.md` (sha: 3a54186f9d88):

Before any execution session, must confirm:
- [ ] Canonical repo target is known
- [ ] Repo exists and is accessible
- [ ] Branch strategy is known
- [ ] Push permission status is known
- [ ] .env / .dev.vars presence confirmed
- [ ] Required secrets identified and classified

Gate outputs one of:
- `PROCEED` — all clear
- `PROCEED WITH LIMITATIONS` — partial access
- `BLOCKED PENDING ACCESS` — cannot proceed
- `PUSH-READY AFTER MANUAL INJECTION` — needs founder action first

---

## Current Kernel State (as of 2026-04-08)

| Item | Status |
|------|--------|
| Canonical repo | ganihypha/Sovereign-ecosystem (PUBLIC — drift from repo-target.md claim of Private) |
| Latest verified session | 4A ✅ VERIFIED AND READY TO CLOSE |
| Production URL | https://95365d08.sovereign-tower.pages.dev |
| ScoutScorer | LIVE — llama-3.1-8b-instant (GROQ) |
| Remaining founder action | Configure Fonnte webhook URL |
| Next session target | Session 4B (scope TBD by Founder) |
| Docs 38-43 in repo | ABSENT — not yet pushed |
| GitHub push auth | MISSING — gh auth not configured |
| .env / .dev.vars | NOT PRESENT in sandbox |

---

## Continuity Rules

- Never rewrite verified session records (3D, 3E, 3F, 3G, 4A are locked)
- Never mark anything VERIFIED without real proof
- Never assume repo push access without checking
- Never hardcode or expose credential values in docs
- Never start from zero when operating memory exists
- Always flag conflicts between docs and chat — trust docs first

---

## Runtime Memory Structure

```
SOVEREIGN OS MEMORY STACK
═══════════════════════════════════════════════════
┌─────────────────────────────────────────────────┐
│ LAYER 5 — Session Entry                         │
│ new-convo-boot.txt / MASTER-ARCHITECT-PROMPT-v2  │
├─────────────────────────────────────────────────┤
│ LAYER 4 — Active Priorities                     │
│ active-priority.md                              │
├─────────────────────────────────────────────────┤
│ LAYER 3 — Source-of-Truth Map                   │
│ repo-target.md / CREDENTIAL-AND-ACCESS-READINESS│
├─────────────────────────────────────────────────┤
│ LAYER 2 — Current State                         │
│ current-handoff.md                              │
├─────────────────────────────────────────────────┤
│ LAYER 1 — Founder Brain (Strategic Core)        │
│ founder-brain.md                                │
└─────────────────────────────────────────────────┘
```

---

## Success Criteria

A session using this kernel is successful when:
- AI entered correct state without requiring founder re-briefing
- Verified sections were not disturbed
- Decisions were converted to living doc updates
- Credential discipline was maintained
- System is easier to continue after the session than before

---

## Relationship to Other Docs

| Doc | Relationship |
|-----|--------------|
| Doc 38 — Founder Operating Copilot | Uses this kernel as continuity foundation |
| Doc 40 — Founder Brain | Canonical upgrade of `founder-brain.md` |
| Doc 41 — Active Priority | Canonical upgrade of `active-priority.md` |
| Doc 42 — New Convo Boot | Canonical upgrade of `new-convo-boot.txt` |
| CREDENTIAL-AND-ACCESS-READINESS.md | Gate template used in Layer 3 |
| 29-AI-DEV-HANDOFF-PACK.md | Full AI dev onboarding rules |

---

## Document Control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-04-08 | CREATED — repo-sourced canon, replacing sandbox draft |

---
*Sovereign OS — Doc 39 | Founder-Only*
