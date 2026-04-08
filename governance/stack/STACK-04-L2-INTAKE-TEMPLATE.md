# STACK-04 — L2 Intake Template

**Canonical ID:** STACK-04  
**Version:** v1.0  
**Status:** Canon  
**Layer Owner:** L2  
**Primary Purpose:** Provide the official intake-normalization template used by L2 after receiving a handoff from L1.  
**Depends On:** STACK-00, STACK-03  
**Used By:** L2, STACK-05  
**Drafting Mode:** canon-grade  
**Change Control:** Bridge change. Revisions affect how L2 classifies handoff integrity and starts orchestration.  
**Non-Negotiables:** L2 must normalize before acting, classify handoff integrity, lock role boundary, and identify escalation risk before orchestration proceeds.  
**Last Updated:** 2026-04-08

## 1. Purpose
This template is the official front door for L2. It ensures L2 receives and normalizes L1 handoffs in a way that is structurally safe before deeper orchestration begins.

## 2. Official Template
```text
L2 INTAKE TEMPLATE

1. Intake Header
- Intake Title:
- Intake Version:
- Receiver Layer: L2
- Source Layer: L1
- Session Type:
- Intake Timestamp / Context:
- Related Handoff Version:

2. Received Intent
- Primary objective received from L1:
- Desired end state:
- Founder-sensitive nuance:
- Why this session exists:

3. Task Normalization
Normalize into one of:
- architecture
- orchestration
- hardening
- audit
- readiness framing
- execution planning
- documentation
- escalation
- mixed / needs clarification

4. Scope Normalization
In Scope:
- item 1
- item 2
- item 3

Out of Scope:
- item 1
- item 2
- item 3

Deferred:
- item 1
- item 2

5. Handoff Integrity Check
Check whether handoff includes:
- clear intent
- usable scope
- known constraints
- known context
- expected output
- success condition
- escalation rule

6. Role Boundary Check
- what L1 already completed:
- what L2 is expected to do:
- what L2 must not do:
- what should only move to L3 if justified:

7. Source-of-Truth Setup
Priority order provided by L1:
1.
2.
3.
4.

8. Constraint Register
- hard constraints
- soft constraints
- review-needed constraints

9. Required Output Check
- output 1
- output 2
- output 3

10. Success Condition Check
- condition 1
- condition 2
- condition 3

11. Escalation Triggers
- trigger 1
- trigger 2
- trigger 3

12. Readiness to Orchestrate
Classify as:
- ready for orchestration
- ready with limitations
- handoff incomplete
- blocked pending clarification
- return to L1
```

## 3. Intake Decisions
L2 should classify the handoff as one of:
- HANDOFF COMPLETE
- HANDOFF PARTIAL
- HANDOFF AMBIGUOUS
- RETURN TO L1 REQUIRED

## 4. Closing Statement
STACK-04 defines the required normalization layer between L1 handoff and L2 orchestration behavior.
