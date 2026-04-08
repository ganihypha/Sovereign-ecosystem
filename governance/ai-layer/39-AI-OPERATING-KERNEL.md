# DOC 39 — AI OPERATING KERNEL

**Classification:** System Architecture / Memory System  
**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-08

---

## Purpose

AI Operating Kernel adalah **memory system** dan **context kernel** yang menjadi fondasi operasional Founder Operating Copilot dan seluruh AI executors dalam ekosistem Sovereign.

Kernel ini mendefinisikan:
- Bagaimana memori sistem bekerja
- Apa yang menjadi source of truth
- Bagaimana context dibangun dan dijaga
- Bagaimana continuity terjaga lintas session

---

## I. Core Principle: Docs > Chat

### The Fundamental Rule

**DO NOT rely on chat history as primary memory.**

Instead, rely on:
1. **Living docs** — current-handoff, founder-brain, active-priority
2. **Canonical repo** — ganihypha/Sovereign-ecosystem
3. **Handoff packs** — 29-AI-DEV-HANDOFF-PACK.md
4. **Verified session state** — session summaries dengan status VERIFIED
5. **Uploaded founder/session files** — file yang di-upload founder sebagai sumber

**Prinsip:** Chat history adalah **supplemental nuance**, bukan **primary truth**.

---

## II. Five Memory Layers

AI Operating Kernel terdiri dari **5 lapisan memori inti**:

### 1. Founder Brain
**File:** `governance/ai-layer/40-FOUNDER-BRAIN.md`

**Isi:**
- Tujuan founder (vision, mission, values)
- Red lines (apa yang tidak boleh dilanggar)
- Definisi menang (apa artinya sukses)
- Style founder (cara berpikir, cara komunikasi)

**Fungsi:** Memori strategis inti yang menjaga agar semua keputusan aligned dengan intent founder.

### 2. Current State
**File:** `docs/current-handoff.md`

**Isi:**
- Latest verified session
- Operational truth saat ini
- Pending founder manual actions
- Next scoped target
- Do-not-touch boundaries

**Fungsi:** State anchor operasional untuk continuation AI Developer.

### 3. Source of Truth Map
**Files:** `docs/indexes/*.md`, `docs/00-MASTER-INDEX.md`

**Isi:**
- Peta docs di repo
- Struktur governance
- Evidence location
- Session summaries
- Handoff packs

**Fungsi:** Peta navigasi untuk menemukan dokumen yang tepat dengan cepat.

### 4. Active Priorities
**File:** `governance/ai-layer/41-ACTIVE-PRIORITY.md`

**Isi:**
- NOW — Apa yang sedang dikerjakan sekarang
- NEXT — Apa yang akan dikerjakan setelah NOW selesai
- LATER — Backlog yang sudah jelas tapi belum urgent
- NOT NOW — Apa yang explicitly tidak dikerjakan

**Fungsi:** Menjaga fokus dan mencegah scope creep.

### 5. Session Boot Source
**File:** `governance/ai-layer/42-NEW-CONVO-BOOT.md`

**Isi:**
- Prompt starter universal untuk AI Dev baru
- Instruksi membaca docs inti
- Operating doctrine
- Guardrails dan boundaries

**Fungsi:** Pintu masuk konteks yang benar untuk AI Dev baru.

---

## III. Context Kernel Architecture

```
┌─────────────────────────────────────────────────┐
│          FOUNDER OPERATING COPILOT              │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │      AI OPERATING KERNEL (5 LAYERS)       │ │
│  │                                           │ │
│  │  1. Founder Brain      (strategic core)  │ │
│  │  2. Current State      (operational)     │ │
│  │  3. Source of Truth    (navigation)      │ │
│  │  4. Active Priorities  (focus)           │ │
│  │  5. Session Boot       (entry point)     │ │
│  └───────────────────────────────────────────┘ │
│                       ↓                         │
│              Living Docs + Repo + Handoff       │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              AI DEV EXECUTORS                    │
│  - Read kernel first                             │
│  - Build context from docs                       │
│  - Execute scoped work                           │
│  - Update living docs                            │
└─────────────────────────────────────────────────┘
```

---

## IV. How Context Is Built

### Step-by-Step Context Building

When an AI Dev starts a new session, it must:

1. **Read Session Boot Source** (`42-NEW-CONVO-BOOT.md`)  
   → Get operating doctrine and entry instructions

2. **Read Current State** (`current-handoff.md`)  
   → Understand latest verified session and operational truth

3. **Read Founder Brain** (`40-FOUNDER-BRAIN.md`)  
   → Understand founder's intent, red lines, and definition of success

4. **Read Active Priorities** (`41-ACTIVE-PRIORITY.md`)  
   → Understand what is NOW, NEXT, LATER, and NOT NOW

5. **Navigate Source of Truth Map** (`docs/indexes/`)  
   → Find relevant docs, evidence, and handoff packs

6. **Read Relevant Session Summaries**  
   → Understand past verified work and decisions

7. **Check Uploaded Files (if any)**  
   → Integrate new materials from founder

**Result:** AI Dev now has **complete context** without rebriefing.

---

## V. Source of Truth Priority

When conflict exists between sources, prioritize in this order:

| Priority | Source | Reason |
|----------|--------|--------|
| 1 | `current-handoff.md` | Operational state anchor |
| 2 | `active-priority.md` | Current focus and boundaries |
| 3 | `founder-brain.md` | Strategic intent |
| 4 | `repo-target.md` | Deployment and repo state |
| 5 | `19-DECISION-LOG.md` | Historical decisions |
| 6 | `21-PROOF-TRACKER-LIVE.md` | Verification evidence |
| 7 | `29-AI-DEV-HANDOFF-PACK.md` | AI Dev instructions |
| 8 | Uploaded founder files | New materials |
| 9 | Session summaries | Past verified work |
| 10 | Conversation history | Supplemental nuance |

---

## VI. Continuity Preservation Rules

### 1. Preserve Verified Work

- **DO NOT** disturb verified session scope without explicit founder approval
- **DO NOT** rewrite verified evidence language
- **DO NOT** mark anything VERIFIED without real proof
- **DO NOT** casually reopen closed sessions

### 2. Reduce Drift

- **DO** use living docs as single source of truth
- **DO** update docs when state changes
- **DO** merge/sync instead of duplicating docs
- **DO** maintain consistent terminology

### 3. Protect Founder Energy

- **DO** build context from docs, not from founder re-explanation
- **DO** capture decisions in decision log
- **DO** maintain clear handoff for next session
- **DO** minimize rebriefing tax

---

## VII. Memory Update Protocol

### When to Update Living Docs

Update living docs when:
- ✅ New decision is final (→ decision log)
- ✅ Session is verified (→ session summary)
- ✅ State changes operationally (→ current-handoff)
- ✅ Priorities shift (→ active-priority)
- ✅ Founder clarifies intent (→ founder-brain)

### How to Update

1. **Read existing doc first** — Never overwrite without reading
2. **Append/enhance > rewrite** — Preserve continuity
3. **Commit with clear message** — Explain what changed and why
4. **Cross-reference related docs** — Maintain source of truth map

---

## VIII. Integration with Founder Operating Copilot

AI Operating Kernel adalah **memori sistem** yang digunakan oleh Founder Operating Copilot untuk:

1. **Intent Capture** → Write to founder-brain & decision log
2. **Context Keeping** → Maintain current-handoff & source of truth map
3. **Decision Support** → Read founder-brain & active-priority
4. **Brief Architecture** → Use kernel to build AI Dev briefs
5. **Sync Control** → Ensure all docs stay synchronized

**Prinsip:** Kernel adalah **struktur memori**, Copilot adalah **operator memori**.

---

## IX. Anti-Patterns to Avoid

❌ **Relying on chat history as primary memory**  
→ Use living docs instead

❌ **Asking founder to repeat context every session**  
→ Build context from kernel

❌ **Creating duplicate docs with different names**  
→ Merge/sync instead of duplicating

❌ **Leaving new docs floating without placement**  
→ Integrate into source of truth map

❌ **Ignoring verified boundaries**  
→ Respect do-not-touch zones

❌ **Skipping doc updates after state changes**  
→ Keep living docs synchronized

---

## X. Success Criteria

AI Operating Kernel dianggap berhasil jika:

✅ AI Dev baru dapat build context lengkap dalam < 5 menit  
✅ Rebriefing tax menurun drastis (founder tidak harus repeat context)  
✅ Continuity terjaga lintas session tanpa lost context  
✅ Living docs menjadi single source of truth yang dapat dipercaya  
✅ Drift dan duplikasi minimal  
✅ Verified work terlindungi

---

## XI. Related Documents

- **Doc 38:** [FOUNDER-OPERATING-COPILOT.md](./38-FOUNDER-OPERATING-COPILOT.md) — Definisi AI layer dekat founder
- **Doc 40:** [FOUNDER-BRAIN.md](./40-FOUNDER-BRAIN.md) — Strategic memory kernel
- **Doc 41:** [ACTIVE-PRIORITY.md](./41-ACTIVE-PRIORITY.md) — Focus kernel
- **Doc 42:** [NEW-CONVO-BOOT.md](./42-NEW-CONVO-BOOT.md) — Entry kernel
- **Current Handoff:** [current-handoff.md](../../docs/current-handoff.md) — Operational state anchor

---

## Closing Statement

AI Operating Kernel adalah fondasi memory system yang membuat Sovereign dapat beroperasi dengan continuity tinggi, rebriefing tax rendah, dan drift minimal.

Kernel ini adalah **struktur kesadaran operasional** yang menjaga agar founder tidak harus menjelaskan ulang, AI Dev dapat masuk dengan context lengkap, dan verified work tetap terlindungi.

---

**Document Control:**
- **File:** `governance/ai-layer/39-AI-OPERATING-KERNEL.md`
- **Version:** 1.0
- **Status:** Active
- **Next Review:** After 3-5 sessions using this kernel
