# STACK-00 — Stack Governance Index

**Canonical ID:** STACK-00  
**Version:** v1.0  
**Status:** Canon  
**Layer Owner:** Cross-layer governance document authored from L1 perspective  
**Primary Purpose:** Provide the master navigation, dependency map, governance shell, and change-control index for the full L1 → L2 → L3 stack.  
**Depends On:** None  
**Used By:** STACK-01 through STACK-07, founder/operator review, stack maintenance  
**Drafting Mode:** canon-grade  
**Change Control:** Any change affecting registry, ordering, document ownership, or stack law requires coordinated review because it can impact multiple downstream docs.  
**Non-Negotiables:** L1 creates; L2 orchestrates; L3 executes. Executed, tested, and verified remain distinct. Drift must be surfaced. L2 must not hand to L3 without a bounded brief. L3 must not return strong completion claims without proof.  
**Last Updated:** 2026-04-08

## 1. Purpose
This document is the master governance and navigation layer for the canon stack. It defines what documents belong to the stack, the order in which they should be read, how they relate to one another, and how changes must be controlled.

## 2. Stack Law
The stack is governed by one primary law:

> **L1 creates**  
> **L2 orchestrates**  
> **L3 executes**

This law is binding across all canon documents.

## 3. Canon Registry
| Canon ID | Canonical Filename | Owner | Primary Function | Upstream | Downstream |
|---|---|---|---|---|---|
| STACK-00 | STACK-00-STACK-GOVERNANCE-INDEX.md | Cross-layer | Master navigation & governance shell | — | STACK-01 to STACK-07 |
| STACK-01 | STACK-01-L1-MASTER-SYSTEM-PROMPT.md | L1 | Identity, role law, style, response contract for L1 | STACK-00 | STACK-02 |
| STACK-02 | STACK-02-L1-OPERATING-SOP.md | L1 | Internal operating SOP for L1 | STACK-01 | STACK-03 |
| STACK-03 | STACK-03-L1-TO-L2-HANDOFF-PACK.md | L1→L2 | Official handoff package from L1 to L2 | STACK-02 | STACK-04 |
| STACK-04 | STACK-04-L2-INTAKE-TEMPLATE.md | L2 | Intake normalization template for L2 | STACK-03 | STACK-05 |
| STACK-05 | STACK-05-L2-OPERATING-SOP.md | L2 | Main operating SOP for L2 | STACK-04 | STACK-06 |
| STACK-06 | STACK-06-L2-TO-L3-EXECUTION-BRIEF.md | L2→L3 | Bounded execution brief to L3 | STACK-05 | STACK-07 |
| STACK-07 | STACK-07-L3-RETURN-PROOF-TEMPLATE.md | L3→L2 | Structured return / proof package from L3 | STACK-06 | L2 review / next L1 cycle |

## 4. Reading Order
1. STACK-00 — Stack Governance Index  
2. STACK-01 — L1 Master System Prompt  
3. STACK-02 — L1 Operating SOP  
4. STACK-03 — L1 to L2 Handoff Pack  
5. STACK-04 — L2 Intake Template  
6. STACK-05 — L2 Operating SOP  
7. STACK-06 — L2 to L3 Execution Brief  
8. STACK-07 — L3 Return / Proof Template

## 5. Dependency Model
```text
STACK-00
  ↓
STACK-01
  ↓
STACK-02
  ↓
STACK-03
  ↓
STACK-04
  ↓
STACK-05
  ↓
STACK-06
  ↓
STACK-07
```

Changes higher in the chain have broader downstream impact than changes lower in the chain.

## 6. Document Classes
- **Foundation Docs:** STACK-01, STACK-02  
- **Bridge Docs:** STACK-03, STACK-04, STACK-06, STACK-07  
- **Core Orchestration Doc:** STACK-05

## 7. Canon Status Model
Recommended lifecycle states:
- working-draft
- operator-grade
- canon-draft
- canon
- superseded
- archived

For this release, STACK-00 through STACK-07 are designated **Canon v1.0**.

## 8. Change Control Rules
- Changes to STACK-01 or STACK-02 are **foundation changes**.
- Changes to STACK-03 or STACK-04 are **bridge changes**.
- Changes to STACK-05 are **core orchestration changes**.
- Changes to STACK-06 or STACK-07 are **execution / proof discipline changes**.
- Every canon revision should record: what changed, why it changed, impacted documents, and compatibility impact.

## 9. Governance Rules
1. **Role Integrity:** No canon doc may blur L1, L2, and L3.  
2. **Status Integrity:** Planned, prepared, executed, tested, and verified must remain distinct.  
3. **Handoff Integrity:** Bridge docs must be usable, bounded, and explicit.  
4. **Proof Integrity:** Strong completion claims require proof.  
5. **Drift Visibility:** Conflicts must be surfaced, not buried.

## 10. Adoption Order
- **Phase A — Foundation:** STACK-01, STACK-02  
- **Phase B — Bridge to Orchestration:** STACK-03, STACK-04  
- **Phase C — Orchestration Core:** STACK-05  
- **Phase D — Execution Discipline:** STACK-06, STACK-07

## 11. Closing Statement
STACK-00 establishes the canon stack as an ordered system rather than a loose collection of prompts. It is the authoritative navigation and governance shell for STACK-01 through STACK-07.
