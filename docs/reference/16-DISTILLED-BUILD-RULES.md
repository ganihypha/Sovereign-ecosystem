# 🏛️ SOVEREIGN BUSINESS ENGINE v4.0
# DOKUMEN 16: DISTILLED BUILD RULES — QUICK REFERENCE CARD
# (10 Aturan Inti + Anti-Pattern Cheatsheet — Print & Tempel di Meja)
### ⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
### Arsitek: Haidar Faras Maulia | Tanggal: 2026-04-02

---

> *"Setiap keputusan arsitektur harus bisa di-justify dengan satu dari 10 rules ini.
>  Kalau tidak bisa — mungkin keputusannya salah."*

---

## 🚦 QUICK DECISION MATRIX

```
SITUASI → KEPUTUSAN

Perlu enforce behavior 100%?          → KODE, bukan prompt
Output dipakai kode/DB/UI?            → JSON schema wajib
Task bisa parallelkan?                → Multi-agent parallel
Task punya specialization berbeda?    → Multi-agent pipeline
Input terlalu besar untuk 1 prompt?   → Summary + progressive load
External API mungkin gagal?           → Timeout + retry + fallback
Aksi tidak bisa di-undo?              → Human gate dulu
Perlu simpan state agent?             → ai_tasks table, bukan memory
Fitur butuh dimatikan/dihidupkan?     → Feature flag, bukan hardcode
Perlu trace agent reasoning?          → LangSmith logging aktif
```

---

## 📋 10 RULES (LENGKAP)

### RULE 1: PROGRAMMATIC > PROMPT ENFORCEMENT ⭐
*(Rule terpenting — masuk soal CCA-F)*

```
PROMPT GUIDANCE:
  "Tolong jangan kirim WA ke nomor yang sama dua kali hari ini"
  ❌ TIDAK reliable — LLM bisa lupa, bisa di-bypass

PROGRAMMATIC:
  SELECT id FROM wa_logs WHERE phone=$1 AND created_at > NOW()-'24h'
  IF row exists → BLOCK, return RATE_LIMITED error
  ✅ 100% reliable — database tidak berbohong

APLIKASI DI ENGINE:
  Rate limit WA    → cek wa_logs di DB
  Auth gate        → verify JWT di kode
  Supabase RLS     → Row Level Security policy
  Score range      → Math.max(0, Math.min(100, score))
  Tool access      → allowed_tools schema, bukan system prompt
```

### RULE 2: MINIMAL FOOTPRINT

```
Setiap agent hanya punya akses ke tools yang BENAR-BENAR dibutuhkan

ScoutScorer allowed:     scraper_api, serpapi, supabase.leads (read)
ScoutScorer forbidden:   supabase.orders, supabase.customers, wa.send

MessageComposer allowed: supabase.leads (read), supabase.outreach_logs (read)
MessageComposer forbidden: wa.send, supabase.orders, scoring

IMPLEMENTASI:
  Definisikan allowed_tools di setiap agent constructor
  Middleware check: kalau agent panggil tool di luar list → reject + log
```

### RULE 3: STRUCTURED OUTPUT WAJIB

```
KAPAN JSON WAJIB:
  ✅ Output dipakai kode lain (render UI, simpan DB, jadi input agent lain)
  ✅ Output perlu di-validate sebelum disimpan
  
KAPAN PROSE BOLEH:
  Hanya untuk output yang dibaca langsung manusia (executive summary)

ENGINE SCHEMA:
  ScoutScorer → { lead_id, score, label, reasoning, highlights[], 
                  concerns[], recommended_action, confidence }
  MessageComposer → { lead_id, phone, message, template_used,
                      personalization_elements[], tone, est_response_prob }
  InsightGenerator → { insights: [{ id, type, layer, title, body, 
                        action, confidence, urgency, data_basis }] }
```

### RULE 4: SINGLE vs MULTI-AGENT

```
SINGLE AGENT kalau:
  Task bisa selesai dalam 1 context window
  Tidak ada parallelism opportunity
  Tidak butuh specialization berbeda

MULTI-AGENT kalau:
  PIPELINE: output A → input B (Gather → Score → Compose → Send)
  PARALLEL: sama data, beda output (Insight + Anomaly berjalan bersamaan)
  SPECIALIZATION: beda domain expertise per agent

ENGINE:
  PIPELINE: ScraperAPI → ScoutScorer → MessageComposer → Fonnte
  PARALLEL: InsightGenerator ∥ AnomalyDetector (run bersamaan)
  CREW:     MarketAnalyst + DataScientist + StrategyAdvisor (CrewAI)
```

### RULE 5: TOKEN BUDGET

```
Jangan boros token. Injeksi SUMMARY bukan RAW DATA ke prompt.

BUDGET PER AGENT:
  ScoutScorer:      input ≤4K, output ≤500 tokens
  MessageComposer:  input ≤2K, output ≤300 tokens
  InsightGenerator: input ≤6K, output ≤800 tokens
  CrewAI reports:   input ≤8K, output ≤2K tokens

BAD: "Ini semua 500 leads: [500 rows JSON]..."
GOOD: "Ada 500 leads: 45 HOT (score avg 87), 120 WARM, 335 COLD.
       Top 5 HOT uncontacted: [5 rows]"

CACHING:
  Product list, brand info, pricing → cache di Cloudflare KV
  TTL: 1 jam untuk data yang jarang berubah
```

### RULE 6: HUMAN-IN-THE-LOOP GATES

```
WAJIB HUMAN CONFIRM (system stop & wait):
  ✅ WA bulk send (>5 nomor sekaligus)
  ✅ Kickoff LeadResearchCrew (costly, on-demand)
  ✅ Mass status update "SKIP" untuk leads
  ✅ Trigger outreach sequence Day 0 pertama kali

AUTO (tidak perlu konfirmasi):
  ❌ AI score single lead
  ❌ Generate insights
  ❌ Status check Fonnte
  ❌ Refresh stats dashboard
  ❌ Single WA send dari UI closer
```

### RULE 7: TIMEOUT + RETRY + FALLBACK

```
SETIAP external API call:
  Timeout:  ScraperAPI 10s | OpenAI 30s | Fonnte 5s | CrewAI 300s
  Retry:    max 2x, exponential backoff (wait 1s, then 3s)
  Fallback: ScraperAPI fail → return partial data, flag for manual
            OpenAI fail     → return deterministic score only
            Fonnte fail     → save to queue, show "WA tertunda"

PATTERN TEMPLATE:
  async function callWithRetry(fn, maxAttempts=2, delay=1000) {
    for (let i = 0; i <= maxAttempts; i++) {
      try {
        return await fn()
      } catch(e) {
        if (i === maxAttempts) return { error: e.message, fallback: true }
        await sleep(delay * (i + 1))
      }
    }
  }
```

### RULE 8: AUDIT TRAIL WAJIB

```
SETIAP AI agent task harus di-log ke ai_tasks:
  BEFORE start: INSERT { agent, task_type, status: 'running', input }
  AFTER done:   UPDATE { status: 'completed', output, duration_ms }
  ON error:     UPDATE { status: 'failed', error }

SETIAP WA send harus di-log ke wa_logs:
  BEFORE send:  INSERT { phone, message, status: 'pending', lead_id }
  AFTER send:   UPDATE { status: 'sent', fonnte_id }
  ON error:     UPDATE { status: 'failed', error_message }

KENAPA:
  Debug → bisa trace kenapa agent gagal
  Business proof → bukti WA terkirim untuk validasi
  Rate limiting → source of truth (bukan memory)
```

### RULE 9: GRACEFUL DEGRADATION

```
HIERARCHY (dari best ke worst):
  Level 1: Full AI mode     → semua service available ✅
  Level 2: Degraded AI mode → OpenAI rate-limited → template statis
  Level 3: Manual mode      → service down → UI tetap ada, fitur disabled
  Level 4: Emergency mode   → Supabase down → static maintenance page

ATURAN UI:
  Kalau fitur tidak available → tampilkan state dengan pesan jelas
  JANGAN: blank screen, infinite spinner, 500 error page tanpa pesan
  HARUS: "AI Scoring tidak tersedia saat ini. [Refresh] atau gunakan skor manual."

NEVER:
  - Silent failure (berhasil padahal gagal)
  - Crash loop (keep retrying forever)
  - Return partial data tanpa flag bahwa data tidak lengkap
```

### RULE 10: FEATURE FLAGS PER TIER

```
JANGAN hardcode tier check di mana-mana.
HARUS punya satu source of truth untuk fitur per tier.

IMPLEMENTATION:
  const FEATURE_FLAGS: Record<string, Tier[]> = {
    'lead_ai_scoring':   ['growth', 'enterprise'],
    'wa_ai_compose':     ['growth', 'enterprise'],
    'wa_auto_sequence':  ['growth', 'enterprise'],
    'reports_forecast':  ['enterprise'],
    'crewai_analysis':   ['enterprise'],
    // Semua tier dapat:
    'lead_manual_entry': ['starter', 'growth', 'enterprise'],
    'wa_manual_send':    ['starter', 'growth', 'enterprise'],
    'reports_basic':     ['starter', 'growth', 'enterprise'],
  }

  function requireFeature(feature: string) {
    return middleware that checks customerTier vs FEATURE_FLAGS[feature]
  }

RESPONSE kalau tier tidak cukup:
  { error: 'UPGRADE_REQUIRED', 
    feature: 'lead_ai_scoring',
    available_from: 'growth',
    upgrade_url: '/pricing' }
```

---

## ⚡ ANTI-PATTERN CHEATSHEET (8 Larangan Keras)

```
╔══════════════════════════════════════════════════════════════════════╗
║  #  NAMA                   BAD                    GOOD              ║
╠══════════════════════════════════════════════════════════════════════╣
║  1  God Agent              1 agent semua bisa     1 agent 1 fungsi  ║
║  2  Prompt Security        "jangan akses orders"  allowed_tools list ║
║  3  Context Stuffing       500 rows JSON ke prompt summary + top 5   ║
║  4  Silent Fallback        return [] kalau error  throw + log error  ║
║  5  Stateless Workflow     tidak log AI task      log di ai_tasks    ║
║  6  Hardcoded Threshold    if score > 80           THRESHOLDS config  ║
║  7  Blocking Worker        LangGraph di CF Worker  async + polling   ║
║  8  Raw LLM to DB          save output langsung   validate schema    ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Detail Tiap Anti-Pattern:

**#1 GOD AGENT**
```
BAD:  1 agent: scrape IG + score + compose WA + kirim + generate report
GOOD: ScoutScorer | MessageComposer | InsightGenerator | AnomalyDetector
WHY:  Testability, debuggability, token efficiency, single responsibility
```

**#2 PROMPT-ONLY SECURITY**
```
BAD:  System prompt: "Kamu tidak boleh akses tabel orders"
GOOD: allowed_tools: ['supabase_leads_read', 'serpapi'] (tidak include orders)
WHY:  LLM bisa di-jailbreak, prompt bisa dilupakan, tidak ada audit trail
```

**#3 CONTEXT STUFFING**
```
BAD:  prompt = "Analisis leads ini: " + JSON.stringify(allLeads) // bisa 50K tokens
GOOD: prompt = `Ada ${total} leads. HOT: ${hot} (avg score ${avgScore}). 
               Top 5 untuk diproses: ${top5.map(l => l.shop_name).join(', ')}`
WHY:  Cost, latency, dan accuracy semua turun kalau context terlalu panjang
```

**#4 SILENT FALLBACK**
```
BAD:  catch (e) { return [] }  // caller tidak tahu kalau gagal
GOOD: catch (e) { 
        await logError(ai_tasks, e)
        throw new Error(`ScraperAPI failed: ${e.message}`)
      }
WHY:  Debugging jadi impossible, data corruption mungkin terjadi
```

**#5 STATELESS WORKFLOW**
```
BAD:  Tidak ada record bahwa agent sedang running
GOOD: INSERT INTO ai_tasks { agent, status: 'running' } → process → UPDATE { status: 'completed' }
WHY:  Tidak bisa monitor, tidak bisa retry yang tepat, tidak ada audit
```

**#6 HARDCODED THRESHOLDS**
```
BAD:  if (score >= 80) label = 'HOT'
GOOD: const SCORING = { HOT: 80, WARM: 60, COOL: 40, COLD: 0 }
      label = Object.entries(SCORING).find(([k,v]) => score >= v)?.[0]
WHY:  Kalau bisnis berubah, harus ganti di 10 tempat. Config = 1 tempat.
```

**#7 BLOCKING WORKER**
```
BAD:  Cloudflare Worker → await runLangGraph5AgentPipeline() // timeout 10ms!
GOOD: Worker → INSERT ai_tasks { status: 'pending' } → return { task_id }
      Polling: GET /api/ai/tasks/:id → cek status → return result kalau done
WHY:  Cloudflare Workers FREE = 10ms CPU limit. Async + polling = tidak masalah.
```

**#8 UNVALIDATED LLM OUTPUT**
```
BAD:  const result = await openai.chat(...)
      await supabase.from('leads').update({ score: result.score })
GOOD: const result = await openai.chat(...)
      const validated = ScoutOutputSchema.parse(result)  // zod/joi validate
      if (!validated.success) throw new Error('Invalid agent output')
      await supabase.from('leads').update({ score: validated.data.score })
WHY:  LLM bisa return format yang salah, null fields, atau hallucinated values
```

---

## 🗺️ CCA-F EXAM CHEATSHEET

```
5 DOMAIN + BOBOT:
  Domain 1: Agentic Architecture    ~27%  ← PELAJARI DULUAN
  Domain 2: Prompting & Context     ~20%
  Domain 3: Claude Code             ~20%  ← PELAJARI DULUAN  
  Domain 4: MCP Design              ~17%
  Domain 5: Safety & Production     ~16%

TOP 5 KONSEP YANG SERING KELUAR:
  1. PROGRAMMATIC > PROMPT untuk behavior enforcement
  2. Single vs multi-agent: kapan dan mengapa
  3. Tool schema design: required fields, type safety
  4. Human-in-the-loop: kapan wajib, kapan tidak perlu
  5. Minimal footprint: agent hanya akses yang dibutuhkan

POLA SOAL:
  "Arsitek ingin memastikan agent tidak pernah menghapus data. 
   Cara terbaik adalah..."
  → Jawaban: Define allowed_tools (programmatic), bukan system prompt

  "Sistem butuh proses 1000 leads per hari. Single agent vs multi-agent?"
  → Jawaban: Multi-agent parallel, karena leads bisa di-proses independen

  "Agent menghasilkan output yang kadang tidak valid. Solusi?"
  → Jawaban: Validate JSON schema sebelum disimpan + retry kalau invalid

REFERENSI:
  Kursus: https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
  Exam: $99, 60 soal, 120 menit, proctored
  Target: Minggu 12 (seiring build Sprint 6)
```

---

## 🔗 REFERENSI SILANG KE DOKUMEN LAIN

| Topic | Dokumen | Section |
|-------|---------|---------|
| Semua rules dengan contoh task prompt | 15-MASTER-INTELLIGENCE-PACK.md | Pack D |
| Sprint tasks lengkap | 07-MODULE-TASK-BREAKDOWN.md | Sprint 1-6 |
| Acceptance test per module | 08-ACCEPTANCE-CRITERIA.md | Per modul |
| CCA-F mapping lengkap | 09-CCA-ALIGNMENT-MAP.md | 5 domain |
| Prompt contract per agent | 04-PROMPT-CONTRACT.md | 5 agents |
| Feature flag implementasi | 13-MODULE-SPEC-MONETIZABLE.md | Tier mapping |

---

## 📋 DOCUMENT CONTROL

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-04-02 | Distilled Build Rules v1.0 — 10 rules, 8 anti-patterns, CCA-F cheatsheet |

---
*⚠️ CLASSIFIED — FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️*
