# STACK-06 — L2 to L3 Execution Brief

**Canonical ID:** STACK-06  
**Version:** v1.0  
**Status:** Canon  
**Layer Owner:** L2→L3 bridge  
**Primary Purpose:** Provide the bounded execution brief L2 must use before L3 performs implementation or technical action.  
**Depends On:** STACK-00, STACK-05  
**Used By:** L2, L3, STACK-07  
**Drafting Mode:** canon-grade  
**Change Control:** Execution bridge change. Revisions affect scope control, dependency disclosure, and proof discipline for L3 work.  
**Non-Negotiables:** No L3 action without a bounded brief. Scope, forbidden actions, proof requirements, and verification checklist are mandatory.  
**Last Updated:** 2026-04-08

## 1. Purpose
This document defines the official execution brief L2 uses to direct L3 in a bounded, auditable, and proof-oriented way.

## 2. Official Template
```text
[L2 TO L3 EXECUTION BRIEF]

A. Brief Header
- Brief Title:
- Brief Version:
- Prepared By: Layer 2 (L2)
- Intended Receiver: Layer 3 (L3)
- Session / Context:
- Related L1 Handoff Version:
- Related L2 Intake / SOP Version:
- Drafting Mode:

B. Execution Objective
- Primary objective:
- Why L3 is being engaged:
- Desired end state:
- What counts as meaningful completion:

C. Execution Type
- implementation / modification / patch / test-only / audit execution / environment preparation / documentation implementation / mixed

D. Exact Scope
In Scope:
- item 1
- item 2
- item 3

Out of Scope:
- item 1
- item 2
- item 3

Do Not Touch:
- file / area 1
- file / area 2

E. Execution Context
- Relevant repo / workspace:
- Relevant documents:
- Relevant prior decisions:
- Known risks:
- Known blockers:

F. Preconditions
L3 should only proceed if:
- condition 1
- condition 2
- condition 3

G. Required Inputs
- input 1
- input 2
- input 3

H. Allowed Actions
- action 1
- action 2
- action 3

I. Forbidden Actions
- action 1
- action 2
- action 3
- exposing secrets
- expanding scope without approval
- claiming completion without evidence

J. Expected Outputs from L3
- output 1
- output 2
- output 3
- output 4

K. Proof Requirements
- changed file list
- diff summary
- test output
- screenshots / logs / notes as relevant

L. Verification Checklist
- scope respected
- forbidden actions not taken
- requested changes actually made
- tests/checks actually run if required
- blockers reported honestly
```

## 3. Brief Law
L3 must stay inside the brief. If the brief is ambiguous or incomplete, L3 must return to L2 rather than improvising beyond scope.

## 4. Closing Statement
STACK-06 is the official boundary contract that makes L3 execution controllable and reviewable.
