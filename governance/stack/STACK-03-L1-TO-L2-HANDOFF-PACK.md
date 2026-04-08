# STACK-03 — L1 to L2 Handoff Pack

**Canonical ID:** STACK-03  
**Version:** v1.0  
**Status:** Canon  
**Layer Owner:** L1→L2 bridge  
**Primary Purpose:** Provide the official handoff structure L1 uses to transfer bounded work to L2.  
**Depends On:** STACK-00, STACK-01, STACK-02  
**Used By:** L1, L2, STACK-04  
**Drafting Mode:** canon-grade  
**Change Control:** Bridge change. Revisions affect handoff clarity, intake quality, and downstream orchestration stability.  
**Non-Negotiables:** Every handoff must include intent, scope, constraints, expected output, success condition, and escalation rule. L1 prepares the handoff; L2 executes it.  
**Last Updated:** 2026-04-08

## 1. Purpose
This document defines the official package L1 uses to transfer work to L2 in a way that is explicit, bounded, and resistant to ambiguity.

## 2. Mandatory Handoff Fields
Every L1 → L2 handoff must contain:
- Handoff Header
- Session Intent
- Task Type
- Normalized Scope
- Layer Boundary
- Known Context
- Source-of-Truth Direction
- Constraints
- Required Output from L2
- Success Condition
- Escalation Rule
- Handoff Direction

## 3. Official Template
```text
[L1 TO L2 HANDOFF PACK]

A. Handoff Header
- Handoff Title:
- Handoff Version:
- Drafting Mode:
- Prepared By: Layer 1 (L1)
- Intended Receiver: Layer 2 (L2)
- Session Date / Context:
- Related Prompt / Artifact Version:

B. Session Intent
- Primary objective:
- Why this session exists:
- Desired end state:
- What success should look like from the founder perspective:

C. Task Type
- architecture / orchestration-prep / hardening / audit-prep / readiness-framing / execution-planning / documentation / escalation-prep / other

D. Normalized Scope
In Scope:
- item 1
- item 2
- item 3

Out of Scope:
- item 1
- item 2
- item 3

Deferred / Later:
- item 1
- item 2

E. Layer Boundary
What L1 has already done:
- item 1
- item 2

What L2 is expected to do:
- item 1
- item 2
- item 3

What L2 must NOT do:
- item 1
- item 2
- item 3

What should only move to L3 if justified:
- item 1
- item 2

F. Known Context
Relevant documents:
- doc 1
- doc 2
- doc 3

Relevant prior prompts:
- prompt 1
- prompt 2

Relevant operating assumptions:
- assumption 1
- assumption 2

Known risks:
- risk 1
- risk 2

Known blockers:
- blocker 1
- blocker 2

G. Source-of-Truth Direction
Priority order for this session:
1.
2.
3.
4.

H. Constraints
- no secret exposure
- no false verification
- no role collapse
- no scope expansion without reason
- no unstated readiness assumptions
- no runtime claim without evidence

I. Required Output from L2
- item 1
- item 2
- item 3
- item 4

J. Success Condition
- condition 1
- condition 2
- condition 3

K. Escalation Rule
L2 must return to L1 if:
- trigger 1
- trigger 2
- trigger 3

L. Handoff Direction
Recommended next responsible layer after L2:
- remain in L2 / prepare L3 handoff / return to L1 / documentation only
```

## 4. Minimum Guardrails
Every handoff implicitly carries:
1. L2 must not collapse into L1 or L3.  
2. L2 must preserve provided scope.  
3. L2 must not assume missing readiness facts.  
4. L2 must not claim verification without evidence.  
5. L2 must report drift explicitly if found.  
6. L2 must return to L1 if the handoff is materially ambiguous.

## 5. Closing Statement
STACK-03 is the official bridge document that moves work from L1 into L2 in a disciplined, auditable form.
