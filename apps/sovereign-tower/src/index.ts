// sovereign-tower — src/index.ts
// Cloudflare Worker Entry Point — Sovereign Tower
// Sovereign Business Engine v4.0 — Session 3a
// ⚠️ FOUNDER ACCESS ONLY — PT WASKITA CAKRAWARTI DIGITAL ⚠️
//
// Cloudflare Worker handler: setiap request → createApp().fetch(request, env, ctx)
//
// Dev:        wrangler pages dev dist --ip 0.0.0.0 --port 3001
// Typecheck:  tsc --noEmit
// Deploy:     Session 3b+ (tidak di-deploy dari Session 3a)

import { createApp } from './app'

// =============================================================================
// CLOUDFLARE WORKER EXPORT
// Hono app di-export sebagai default export yang implement fetch handler
// =============================================================================

const app = createApp()

export default app
