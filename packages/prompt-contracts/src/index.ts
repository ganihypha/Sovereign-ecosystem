// @sovereign/prompt-contracts — Placeholder
// Phase 2: Agent prompts + schemas akan diisi di sini
// Lihat: docs/04-PROMPT-CONTRACT.md (jika tersedia)

// TODO Phase 2:
// - scout-scorer.ts: ScoutScorer agent prompt + schema
// - message-composer.ts: MessageComposer prompt + schema
// - insight-generator.ts: InsightGenerator prompt + schema
// - market-validator.ts: MarketValidator (CrewAI) prompt

export const PROMPTS_VERSION = '0.0.1'
export const PROMPTS_PLACEHOLDER = true

// Placeholder output schema types
export type ScoutScorerOutput = { score: number; reasoning: string; tags: string[] }
export type MessageComposerOutput = { message: string; tone: string; cta: string }
export type InsightGeneratorOutput = { insights: string[]; recommendations: string[]; week: string }
