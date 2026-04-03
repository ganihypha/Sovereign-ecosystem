// @sovereign/integrations — Placeholder
// Phase 2: External API clients akan diisi di sini

// TODO Phase 2:
// - supabase.ts: Supabase client + helpers
// - fonnte.ts: Fonnte WA API client (BLOCKER: butuh FONNTE_TOKEN)
// - scraperapi.ts: ScraperAPI Instagram client
// - openai.ts: OpenAI / Groq LLM client
// - crewai.ts: CrewAI integration

export const INTEGRATIONS_VERSION = '0.0.1'
export const INTEGRATIONS_PLACEHOLDER = true

// Placeholder integration types
export type FonnteConfig = { token: string; baseUrl?: string }
export type LLMConfig = { apiKey: string; baseUrl: string; model: string }
export type ScraperConfig = { apiKey: string }
