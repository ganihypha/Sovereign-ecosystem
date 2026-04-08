# 🏛️ SOVEREIGN OS — ONE-PAGE CHEAT SHEET

**Quick Reference untuk Aktivasi & Operasi Sovereign OS v4.0**

---

## 🎯 WHAT IS SOVEREIGN OS?

Operating system 3-layer untuk mengelola development dengan AI:
- **L1 FOUNDER**: Strategic command (kasih brief)
- **L2 AI ORCHESTRATOR**: Orchestration & quality control
- **L3 AI EXECUTOR**: Technical execution (coding, testing, deploy)

---

## 🚀 QUICK ACTIVATION (Copy-Paste Ini)

```
SOVEREIGN OS BOOT — SESSION [4C/4D/etc]

Aktivasi: L2 ORCHESTRATOR MODE
Repo: https://github.com/ganihypha/Sovereign-ecosystem
Branch: main

Session Objective: [URAIKAN TUJUAN]

Request:
1. Clone repo & setup environment
2. Baca governance/stack/STACK-05-L2-OPERATING-SOP.md
3. Review ops/handoff/current-handoff.md
4. Lakukan L2 Intake Assessment
5. Buat bounded brief untuk L3
6. Supervisi execution
7. Verify & collect proof
```

---

## 📚 KEY DOCUMENTS

**Must Read (Priority Order):**
1. `STACK-05-L2-OPERATING-SOP.md` — Cara kerja L2
2. `current-handoff.md` — Status project terkini
3. `OS-INDEX.md` — Master index

**STACK Documents:**
- **STACK-00**: Index | **STACK-01**: L1 Prompt | **STACK-02**: L1 SOP
- **STACK-03**: L1→L2 Handoff | **STACK-04**: L2 Intake ⭐
- **STACK-05**: L2 SOP ⭐ | **STACK-06**: L2→L3 Brief ⭐
- **STACK-07**: L3 Proof ⭐

---

## 🔄 WORKFLOW

```
1. FOUNDER BRIEF → 2. L2 INTAKE → 3. L2 BOUNDED BRIEF → 
4. L3 EXECUTE → 5. L3 PROOF → 6. L2 VERIFY → 7. REPORT
```

---

## 📂 DIRECTORY STRUCTURE

```
sovereign-ecosystem/
├── governance/         ← STACK + OS docs
│   ├── stack/         ← STACK-00 to STACK-07
│   ├── continuity/    ← OS kernel (38-42)
│   └── doctrine/      ← Doctrine (43)
├── ops/               ← Operations
│   ├── live/          ← active-priority.md
│   ├── handoff/       ← current-handoff.md ⭐
│   └── logs/          ← Sprint, decision, proof logs
├── docs/              ← Documentation
│   ├── indexes/       ← OS-INDEX, credential-map
│   ├── reference/     ← Business docs (00-37)
│   └── sessions/      ← Session summaries
└── apps/              ← Code
    └── sovereign-tower/ ← Main app
```

---

## ✅ L2 ORCHESTRATOR CHECKLIST

**Setup:**
- [ ] Clone repo
- [ ] Read STACK-05, current-handoff, OS-INDEX
- [ ] Understand session objective

**Execute:**
- [ ] L2 Intake Assessment (STACK-04)
- [ ] Create L3 Bounded Brief (STACK-06)
- [ ] Monitor L3 execution
- [ ] Collect L3 Return Proof (STACK-07)

**Complete:**
- [ ] Verify quality gates
- [ ] Update current-handoff.md
- [ ] Update logs (sprint, decision, proof tracker)
- [ ] Commit & push to GitHub
- [ ] Report to Founder

---

## 🔐 CREDENTIALS

**Location**: `/home/user/webapp/sovereign-ecosystem/.dev.vars`

**Contains**: 19 env vars
- Supabase (URL, keys)
- Cloudflare (Account ID, API token)
- GitHub, Groq, Fonnte, ScraperAPI

**Protection**: .gitignore active (never commit)

---

## 🛠️ COMMON COMMANDS

```bash
# Clone repo
git clone https://github.com/ganihypha/Sovereign-ecosystem.git

# Setup
cd sovereign-ecosystem
cp /secure/.dev.vars .
pnpm install

# Build
cd apps/sovereign-tower
pnpm build

# Dev
pm2 start ecosystem.config.cjs
pm2 logs --nostream

# Deploy
pnpm deploy
```

---

## 🚨 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| AI tidak aktif L2 | Use explicit activation prompt |
| Repo tidak clone | Check GitHub auth |
| Credentials missing | Copy .dev.vars from secure location |
| AI skip quality gates | Reference STACK-07 explicitly |

---

## 🎯 SUCCESS INDICATORS

Sovereign OS works if:
- ✅ AI reads context automatically
- ✅ AI does L2 intake assessment
- ✅ AI creates bounded brief
- ✅ AI verifies proof before reporting
- ✅ AI updates docs (handoff, logs, tracker)

---

## 🔗 QUICK LINKS

- **Repo**: https://github.com/ganihypha/Sovereign-ecosystem
- **Prod**: https://sovereign-tower.pages.dev
- **Last Session**: 4A (ScoutScorer) ✅

---

## 📖 FULL DOCUMENTATION

**In This Folder:**
- `README.md` — Package overview
- `SOVEREIGN-OS-ACTIVATION-GUIDE.md` — Complete guide (18KB)
- `VISUAL-ARCHITECTURE-GUIDE.md` — Visual diagrams (21KB)
- `QUICK-BOOT-PROMPT.txt` — 5 ready-to-use prompts (6KB)

---

## 💡 PRO TIPS

1. **Be Specific**: Clear objective = better results
2. **Trust Process**: L2 will orchestrate properly
3. **Review Proof**: Always verify before accept
4. **Update Docs**: Keep handoff & logs current
5. **One Session = One Goal**: Keep scope bounded

---

*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY*

*Print this page & keep handy for quick reference! 🚀*
