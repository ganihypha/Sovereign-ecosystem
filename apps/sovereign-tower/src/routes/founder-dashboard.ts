// sovereign-tower — src/routes/founder-dashboard.ts
// Founder Dashboard Lite — Session 4G
// Sovereign Business Engine v4.0
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Session 4G Scope (BOUNDED):
//   - GET /dashboard        → HTML dashboard UI (Founder Dashboard Lite)
//   - GET /api/dashboard/wa → JSON data feed for dashboard
//
// Dashboard Lite Features (minimal, governance-first):
//   - View pending messages (requires_approval=true, status=pending)
//   - View approved messages (status=approved, ready to send)
//   - View recent send states (sent/delivered/failed in last 24h)
//   - Approve / Reject actions (POST to existing routes)
//   - Send approved action (POST to /api/agents/send-approved/:id)
//   - WA system health status
//
// Design Principles:
//   - Narrow scope: WA approval lane only (no analytics, no big redesign)
//   - Governance clarity: status labels are explicit
//   - Founder-safe: no auto-send buttons, all actions require explicit click
//   - Lightweight: single HTML page, Tailwind CSS CDN, no build step
//
// ADR-020: Session 4G — governance hardening + founder dashboard lite

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { TowerEnv } from '../lib/app-config'
import type { SovereignAuthVariables } from '@sovereign/auth'
import { tryCreateDbClient, hasDbCredentials } from '../lib/db-adapter'
import {
  getGateQueue,
  getRecentWaLogs,
  hasFonnteCredentials,
  getFonnteEnvReport,
  checkWaLogsTableExists,
  WA_STATUS_LABELS,
} from '../lib/wa-adapter'

type DashboardContext = { Bindings: TowerEnv; Variables: SovereignAuthVariables }

export const founderDashboardRouter = new Hono<DashboardContext>()

// =============================================================================
// GET /api/dashboard/wa — JSON data feed for dashboard
// =============================================================================

/**
 * GET /api/dashboard/wa
 * Returns structured JSON data for the Founder Dashboard Lite.
 * Used by both the HTML dashboard and for programmatic access.
 */
founderDashboardRouter.get('/wa', async (c: Context<DashboardContext>) => {
  const env = c.env

  const dbReady = hasDbCredentials(env)
  const waReady = hasFonnteCredentials(env)
  const fonnteReport = getFonnteEnvReport(env)

  let queueItems: any[] = []
  let recentLogs: any[] = []
  let waLogsAvailable = false

  if (dbReady) {
    const db = tryCreateDbClient(env)
    if (db) {
      waLogsAvailable = await checkWaLogsTableExists(db)
      if (waLogsAvailable) {
        queueItems = await getGateQueue(db, 20)
        recentLogs = await getRecentWaLogs(db, 10)
      }
    }
  }

  const pendingItems = queueItems.filter((i: any) => i.status === 'pending')
  const approvedItems = queueItems.filter((i: any) => i.status === 'approved')

  return c.json({
    ok: true,
    session: '4g',
    timestamp: new Date().toISOString(),
    system_health: {
      db_ready: dbReady,
      wa_ready: waReady,
      wa_logs_available: waLogsAvailable,
      fonnte_send_token_source: fonnteReport.send_token_source,
      fonnte_device_token_length: fonnteReport.token_length_check?.FONNTE_DEVICE_TOKEN ?? null,
    },
    queue_summary: {
      pending_review: pendingItems.length,
      approved_ready_to_send: approvedItems.length,
      total_action_needed: queueItems.length,
    },
    pending_items: pendingItems.map((i: any) => ({
      id: i.id,
      phone: i.phone,
      message_preview: (i.message_body as string)?.slice(0, 150) ?? '',
      status: i.status,
      status_label: WA_STATUS_LABELS[i.status as keyof typeof WA_STATUS_LABELS] ?? i.status,
      sent_by: i.sent_by,
      created_at: i.created_at,
      actions: {
        approve: `/api/wa/queue/${i.id}/approve`,
        reject: `/api/wa/queue/${i.id}/reject`,
      },
    })),
    approved_items: approvedItems.map((i: any) => ({
      id: i.id,
      phone: i.phone,
      message_preview: (i.message_body as string)?.slice(0, 150) ?? '',
      status: i.status,
      status_label: WA_STATUS_LABELS[i.status as keyof typeof WA_STATUS_LABELS] ?? i.status,
      approved_at: i.approved_at ?? null,
      sent_by: i.sent_by,
      created_at: i.created_at,
      actions: {
        send: `/api/agents/send-approved/${i.id}`,
      },
    })),
    recent_activity: recentLogs.slice(0, 5).map((log: any) => ({
      id: log.id,
      direction: log.direction,
      phone: log.phone,
      status: log.status,
      status_label: WA_STATUS_LABELS[log.status as keyof typeof WA_STATUS_LABELS] ?? log.status,
      sent_by: log.sent_by,
      fonnte_message_id: log.fonnte_message_id ?? null,
      created_at: log.created_at,
    })),
  })
})

// =============================================================================
// GET /dashboard — Founder Dashboard Lite HTML UI
// =============================================================================

/**
 * GET /dashboard
 * Serves the Founder Dashboard Lite HTML page.
 * Uses Tailwind CSS CDN for styling — no build step needed.
 * All API calls are made client-side using fetch() with Bearer token.
 */
founderDashboardRouter.get('/', async (c: Context<DashboardContext>) => {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sovereign Tower — Founder Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <style>
    .status-pending { @apply bg-yellow-100 text-yellow-800 border border-yellow-300; }
    .status-approved { @apply bg-blue-100 text-blue-800 border border-blue-300; }
    .status-sent { @apply bg-indigo-100 text-indigo-800 border border-indigo-300; }
    .status-delivered { @apply bg-green-100 text-green-800 border border-green-300; }
    .status-failed { @apply bg-red-100 text-red-800 border border-red-300; }
    .status-rejected { @apply bg-gray-100 text-gray-600 border border-gray-300; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .loading-pulse { animation: pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">

<!-- HEADER -->
<header class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
      <i class="fas fa-tower-broadcast text-white text-sm"></i>
    </div>
    <div>
      <h1 class="font-bold text-white text-lg leading-tight">Sovereign Tower</h1>
      <p class="text-xs text-gray-400">Founder Dashboard Lite — Session 4G</p>
    </div>
  </div>
  <div class="flex items-center gap-3">
    <div id="health-indicator" class="flex items-center gap-2 text-xs text-gray-400">
      <div class="w-2 h-2 rounded-full bg-gray-600 loading-pulse"></div>
      <span>Connecting...</span>
    </div>
    <button onclick="loadDashboard()" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded-lg border border-gray-700 transition-colors">
      <i class="fas fa-rotate-right mr-1"></i>Refresh
    </button>
  </div>
</header>

<!-- AUTH BANNER -->
<div id="auth-banner" class="bg-amber-900/50 border-b border-amber-700/50 px-6 py-3 hidden">
  <div class="max-w-4xl mx-auto flex items-center gap-3">
    <i class="fas fa-key text-amber-400 text-sm"></i>
    <div class="flex-1">
      <p class="text-sm text-amber-200 font-medium">Token JWT diperlukan untuk mengakses data</p>
      <p class="text-xs text-amber-400 mt-0.5">Paste JWT token founder di bawah ini untuk masuk</p>
    </div>
  </div>
  <div class="max-w-4xl mx-auto mt-2 flex gap-2">
    <input id="token-input" type="password" placeholder="eyJhbGciOiJIUzI1NiJ9..." 
      class="flex-1 px-3 py-2 bg-gray-900 border border-amber-700/50 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500">
    <button onclick="setToken()" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg transition-colors font-medium">
      Masuk
    </button>
  </div>
</div>

<!-- MAIN CONTENT -->
<main class="max-w-5xl mx-auto px-4 py-6 space-y-6">

  <!-- SYSTEM STATUS CARDS -->
  <section id="system-status" class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p class="text-xs text-gray-500 mb-1">DB Status</p>
      <p id="stat-db" class="text-lg font-bold text-gray-400 loading-pulse">—</p>
    </div>
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p class="text-xs text-gray-500 mb-1">WA Provider</p>
      <p id="stat-wa" class="text-lg font-bold text-gray-400 loading-pulse">—</p>
    </div>
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p class="text-xs text-gray-500 mb-1">Menunggu Review</p>
      <p id="stat-pending" class="text-2xl font-bold text-yellow-400 loading-pulse">—</p>
    </div>
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p class="text-xs text-gray-500 mb-1">Siap Kirim</p>
      <p id="stat-approved" class="text-2xl font-bold text-blue-400 loading-pulse">—</p>
    </div>
  </section>

  <!-- PENDING REVIEW SECTION -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <i class="fas fa-clock text-yellow-400"></i>
        Menunggu Review Founder
        <span id="pending-count-badge" class="bg-yellow-900/50 text-yellow-400 border border-yellow-700/50 text-xs px-2 py-0.5 rounded-full"></span>
      </h2>
    </div>
    <div id="pending-list" class="space-y-2">
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center text-sm text-gray-500 loading-pulse">
        Memuat data...
      </div>
    </div>
  </section>

  <!-- APPROVED / READY TO SEND SECTION -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <i class="fas fa-check-circle text-blue-400"></i>
        Disetujui — Siap Kirim
        <span id="approved-count-badge" class="bg-blue-900/50 text-blue-400 border border-blue-700/50 text-xs px-2 py-0.5 rounded-full"></span>
      </h2>
    </div>
    <div id="approved-list" class="space-y-2">
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center text-sm text-gray-500 loading-pulse">
        Memuat data...
      </div>
    </div>
  </section>

  <!-- RECENT ACTIVITY SECTION -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <i class="fas fa-history text-gray-400"></i>
        Aktivitas Terakhir
      </h2>
    </div>
    <div id="activity-list" class="space-y-1.5">
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center text-sm text-gray-500 loading-pulse">
        Memuat data...
      </div>
    </div>
  </section>

</main>

<!-- REJECT MODAL -->
<div id="reject-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
  <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl fade-in">
    <h3 class="font-semibold text-white mb-1 flex items-center gap-2">
      <i class="fas fa-times-circle text-red-400"></i> Tolak Pesan
    </h3>
    <p id="reject-preview" class="text-xs text-gray-400 mb-3 bg-gray-800 rounded-lg p-3"></p>
    <label class="text-xs text-gray-400 block mb-1">Alasan penolakan (opsional):</label>
    <textarea id="reject-reason" rows="2" placeholder="Contoh: Terlalu agresif, tunggu follow-up dulu..." 
      class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"></textarea>
    <div class="flex gap-2 mt-4">
      <button onclick="closeRejectModal()" class="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg border border-gray-700 transition-colors">
        Batal
      </button>
      <button onclick="confirmReject()" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg font-medium transition-colors">
        <i class="fas fa-times mr-1"></i> Tolak
      </button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div id="toast" class="fixed bottom-4 right-4 z-50 hidden">
  <div id="toast-inner" class="px-4 py-3 rounded-xl text-sm font-medium shadow-xl max-w-xs fade-in"></div>
</div>

<script>
// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
let token = localStorage.getItem('sovereign_jwt') || '';
let rejectTargetId = null;
let rejectTargetPreview = '';
let isLoading = false;

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
function setToken() {
  const input = document.getElementById('token-input').value.trim();
  if (!input) return showToast('Token tidak boleh kosong', 'error');
  token = input;
  localStorage.setItem('sovereign_jwt', token);
  document.getElementById('auth-banner').classList.add('hidden');
  showToast('Token tersimpan', 'success');
  loadDashboard();
}

function checkAuth() {
  if (!token) {
    document.getElementById('auth-banner').classList.remove('hidden');
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  if (!token) throw new Error('NO_TOKEN');
  const res = await fetch(path, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    showToast('Token tidak valid atau expired. Masukkan ulang token.', 'error');
    document.getElementById('auth-banner').classList.remove('hidden');
    token = '';
    localStorage.removeItem('sovereign_jwt');
    throw new Error('UNAUTHORIZED');
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
async function loadDashboard() {
  if (isLoading) return;
  if (!checkAuth()) {
    renderEmptyStates();
    return;
  }
  isLoading = true;
  try {
    const data = await apiFetch('/api/dashboard/wa');
    if (!data.ok) throw new Error(data.error || 'Unknown error');
    renderDashboard(data);
  } catch (err) {
    if (err.message !== 'NO_TOKEN' && err.message !== 'UNAUTHORIZED') {
      showToast('Gagal memuat data: ' + err.message, 'error');
    }
    renderEmptyStates();
  } finally {
    isLoading = false;
  }
}

function renderDashboard(data) {
  // Health indicator
  const health = data.system_health;
  const isHealthy = health.db_ready && health.wa_ready;
  const indicator = document.getElementById('health-indicator');
  indicator.innerHTML = \`
    <div class="w-2 h-2 rounded-full \${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}"></div>
    <span>\${isHealthy ? 'Sistem OK' : 'Ada Masalah'}</span>
  \`;

  // Stats
  document.getElementById('stat-db').textContent = health.db_ready ? '✅ OK' : '❌ Error';
  document.getElementById('stat-db').className = 'text-lg font-bold ' + (health.db_ready ? 'text-green-400' : 'text-red-400');
  document.getElementById('stat-wa').textContent = health.wa_ready ? '✅ OK' : '❌ Error';
  document.getElementById('stat-wa').className = 'text-lg font-bold ' + (health.wa_ready ? 'text-green-400' : 'text-red-400');
  
  const pendingCount = data.queue_summary.pending_review;
  const approvedCount = data.queue_summary.approved_ready_to_send;
  document.getElementById('stat-pending').textContent = pendingCount;
  document.getElementById('stat-pending').className = 'text-2xl font-bold ' + (pendingCount > 0 ? 'text-yellow-400' : 'text-gray-400');
  document.getElementById('stat-approved').textContent = approvedCount;
  document.getElementById('stat-approved').className = 'text-2xl font-bold ' + (approvedCount > 0 ? 'text-blue-400' : 'text-gray-400');

  // Badges
  document.getElementById('pending-count-badge').textContent = pendingCount > 0 ? pendingCount + ' item' : '';
  document.getElementById('approved-count-badge').textContent = approvedCount > 0 ? approvedCount + ' item' : '';

  // Pending list
  renderPendingList(data.pending_items);

  // Approved list
  renderApprovedList(data.approved_items);

  // Activity list
  renderActivityList(data.recent_activity);
}

function renderPendingList(items) {
  const container = document.getElementById('pending-list');
  if (!items || items.length === 0) {
    container.innerHTML = \`
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center fade-in">
        <i class="fas fa-check-circle text-green-500 text-xl mb-2 block"></i>
        <p class="text-sm text-gray-400">Tidak ada pesan yang menunggu review</p>
      </div>
    \`;
    return;
  }
  container.innerHTML = items.map(item => \`
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 fade-in" id="pending-\${item.id}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono text-gray-500">\${item.phone}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">\${item.status_label}</span>
            <span class="text-xs text-gray-500">\${item.sent_by}</span>
          </div>
          <p class="text-sm text-gray-200 leading-relaxed">\${escHtml(item.message_preview)}\${item.message_preview.length >= 150 ? '...' : ''}</p>
          <p class="text-xs text-gray-600 mt-1">\${formatTime(item.created_at)}</p>
        </div>
        <div class="flex gap-1.5 shrink-0">
          <button onclick="approveItem('\${item.id}', '\${escAttr(item.message_preview)}')" 
            class="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-700/50 text-xs rounded-lg transition-colors font-medium">
            <i class="fas fa-check mr-1"></i>Setujui
          </button>
          <button onclick="openRejectModal('\${item.id}', '\${escAttr(item.message_preview)}')"
            class="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/50 text-xs rounded-lg transition-colors">
            <i class="fas fa-times mr-1"></i>Tolak
          </button>
        </div>
      </div>
    </div>
  \`).join('');
}

function renderApprovedList(items) {
  const container = document.getElementById('approved-list');
  if (!items || items.length === 0) {
    container.innerHTML = \`
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center fade-in">
        <p class="text-sm text-gray-500">Tidak ada pesan yang sudah disetujui dan menunggu pengiriman</p>
      </div>
    \`;
    return;
  }
  container.innerHTML = items.map(item => \`
    <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 fade-in" id="approved-\${item.id}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono text-gray-500">\${item.phone}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 border border-blue-800/50">\${item.status_label}</span>
            \${item.approved_at ? '<span class="text-xs text-gray-500">approved ' + formatTime(item.approved_at) + '</span>' : ''}
          </div>
          <p class="text-sm text-gray-200 leading-relaxed">\${escHtml(item.message_preview)}\${item.message_preview.length >= 150 ? '...' : ''}</p>
        </div>
        <div class="shrink-0">
          <button onclick="sendApproved('\${item.id}')" 
            class="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 border border-indigo-700/50 text-xs rounded-lg transition-colors font-medium">
            <i class="fas fa-paper-plane mr-1"></i>Kirim Sekarang
          </button>
        </div>
      </div>
    </div>
  \`).join('');
}

function renderActivityList(items) {
  const container = document.getElementById('activity-list');
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="text-center text-xs text-gray-600 py-3">Belum ada aktivitas</div>';
    return;
  }
  const statusColors = {
    pending: 'text-yellow-500', approved: 'text-blue-400', sent: 'text-indigo-400',
    delivered: 'text-green-400', failed: 'text-red-400', rejected_by_founder: 'text-gray-500', read: 'text-teal-400'
  };
  container.innerHTML = items.map(log => \`
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors fade-in">
      <i class="fas \${log.direction === 'inbound' ? 'fa-arrow-down text-cyan-500' : 'fa-arrow-up text-indigo-500'} text-xs w-4 text-center"></i>
      <span class="text-xs font-mono text-gray-500 w-20 truncate">\${log.phone}</span>
      <span class="text-xs \${statusColors[log.status] || 'text-gray-400'} w-24 truncate">\${log.status_label}</span>
      \${log.fonnte_message_id ? '<span class="text-xs text-gray-600 font-mono">#' + log.fonnte_message_id + '</span>' : ''}
      <span class="text-xs text-gray-700 ml-auto">\${formatTime(log.created_at)}</span>
    </div>
  \`).join('');
}

function renderEmptyStates() {
  ['pending-list', 'approved-list', 'activity-list'].forEach(id => {
    document.getElementById(id).innerHTML = '<div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center text-sm text-gray-600">—</div>';
  });
  ['stat-db', 'stat-wa', 'stat-pending', 'stat-approved'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '—';
    el.className = 'text-lg font-bold text-gray-600';
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
async function approveItem(id, preview) {
  if (!confirm('Setujui pesan ini?\\n\\n"' + preview.slice(0, 100) + '"')) return;
  try {
    const res = await apiFetch('/api/wa/queue/' + id + '/approve', { method: 'POST' });
    if (res.success) {
      showToast('✅ Pesan disetujui — siap untuk dikirim', 'success');
      setTimeout(loadDashboard, 800);
    } else {
      showToast('Gagal: ' + (res.error?.message || 'Unknown error'), 'error');
    }
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function openRejectModal(id, preview) {
  rejectTargetId = id;
  rejectTargetPreview = preview;
  document.getElementById('reject-preview').textContent = preview.slice(0, 100) + (preview.length > 100 ? '...' : '');
  document.getElementById('reject-reason').value = '';
  document.getElementById('reject-modal').classList.remove('hidden');
}

function closeRejectModal() {
  document.getElementById('reject-modal').classList.add('hidden');
  rejectTargetId = null;
}

async function confirmReject() {
  if (!rejectTargetId) return;
  const reason = document.getElementById('reject-reason').value.trim();
  try {
    const body = reason ? JSON.stringify({ reason }) : '{}';
    const res = await apiFetch('/api/wa/queue/' + rejectTargetId + '/reject', {
      method: 'POST', body,
    });
    closeRejectModal();
    if (res.success) {
      showToast('Pesan ditolak dan diarsipkan', 'info');
      setTimeout(loadDashboard, 800);
    } else {
      showToast('Gagal menolak: ' + (res.error?.message || 'Unknown'), 'error');
    }
  } catch (e) {
    closeRejectModal();
    showToast('Error: ' + e.message, 'error');
  }
}

async function sendApproved(id) {
  if (!confirm('Kirim pesan ini sekarang ke WhatsApp?')) return;
  try {
    const res = await apiFetch('/api/agents/send-approved/' + id, { method: 'POST' });
    if (res.ok) {
      showToast('🚀 Pesan terkirim! Fonnte ID: ' + (res.fonnte_message_id || '-'), 'success');
      setTimeout(loadDashboard, 1000);
    } else {
      showToast('Gagal kirim: ' + (res.error || res.message || 'Unknown'), 'error');
    }
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  const inner = document.getElementById('toast-inner');
  const colors = { success: 'bg-green-800 text-green-100', error: 'bg-red-900 text-red-100', info: 'bg-gray-800 text-gray-100' };
  inner.className = 'px-4 py-3 rounded-xl text-sm font-medium shadow-xl max-w-xs fade-in ' + (colors[type] || colors.info);
  inner.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return Math.floor(diff) + 'd lalu';
    if (diff < 3600) return Math.floor(diff/60) + 'mnt lalu';
    if (diff < 86400) return Math.floor(diff/3600) + 'j lalu';
    return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
  } catch { return iso.slice(0, 16); }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(str) {
  return String(str).replace(/'/g,"\\\\'").replace(/"/g,'\\\\"').replace(/\\n/g,' ').slice(0, 100);
}

// Close modal on outside click
document.getElementById('reject-modal').addEventListener('click', function(e) {
  if (e.target === this) closeRejectModal();
});

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
if (token) {
  loadDashboard();
} else {
  document.getElementById('auth-banner').classList.remove('hidden');
  renderEmptyStates();
  document.getElementById('health-indicator').innerHTML = '<div class="w-2 h-2 rounded-full bg-gray-600"></div><span>Belum login</span>';
}

// Auto-refresh every 30 seconds
setInterval(() => { if (token && !isLoading) loadDashboard(); }, 30000);
</script>
</body>
</html>`;

  return c.html(html)
})
