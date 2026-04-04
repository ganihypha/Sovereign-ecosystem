// @sovereign/integrations — scaffold/fonnte.scaffold.ts
// FonnteClientScaffold — Type-safe Scaffold Implementation
//
// ⚠️ INI ADALAH SCAFFOLD — BUKAN PRODUCTION IMPLEMENTATION
// ⚠️ Tidak ada HTTP call ke Fonnte API di file ini
// ⚠️ Semua method return mock response dengan flag SCAFFOLD_NOT_IMPLEMENTED
//
// Tujuan scaffold ini:
// 1. Verifikasi bahwa IWaClient interface sudah benar (type-checking)
// 2. Placeholder yang aman untuk testing integration contract
// 3. Template untuk implementasi live di Phase 3 (fonnte.client.ts)
//
// Untuk live implementation Phase 3:
// → Buat packages/integrations/src/clients/fonnte.client.ts
// → Implements IWaClient dengan real fetch() calls ke FONNTE_API_BASE
// → Inject FonnteEnvConfig dari c.env di Hono Worker

import type { IWaClient } from '../contracts/wa-client.contract'
import type {
  FonnteEnvConfig,
  FonnteSendPayload,
  FonnteSendFilePayload,
  FonnteValidateNumberPayload,
  FonnteResponse,
  FonnteDevice,
} from '../types/fonnte'
import {
  WA_CLIENT_HUMAN_GATE_REQUIRED,
  WA_HUMAN_GATE_CONSTRAINT,
} from '../contracts/wa-client.contract'

// =============================================================================
// SCAFFOLD ERROR
// =============================================================================

/** Error khusus untuk scaffold — dilempar jika scaffold dipanggil tanpa mock mode */
export class ScaffoldNotImplementedError extends Error {
  constructor(method: string, provider: string) {
    super(`[SCAFFOLD] ${provider}.${method}() is not implemented. This is a scaffold — use Phase 3 live client.`)
    this.name = 'ScaffoldNotImplementedError'
  }
}

// =============================================================================
// SCAFFOLD RESPONSE HELPERS
// =============================================================================

function scaffoldSuccessResponse(method: string): FonnteResponse {
  return {
    status: true,
    id: `SCAFFOLD_${method.toUpperCase()}_${Date.now()}`,
    detail: `[SCAFFOLD] ${method} mock response — no real WA message was sent`,
  }
}

function scaffoldErrorResponse(reason: string): FonnteResponse {
  return {
    status: false,
    reason: `[SCAFFOLD] ${reason}`,
  }
}

// =============================================================================
// FONNTE CLIENT SCAFFOLD
// =============================================================================

/**
 * FonnteClientScaffold — Type-safe placeholder untuk IWaClient
 *
 * Implements IWaClient sepenuhnya untuk:
 * - Type checking (pastikan interface sudah benar)
 * - Testing integration contract tanpa network call
 * - Development tanpa FONNTE_TOKEN aktif
 *
 * @example
 * // Di development / testing:
 * const wa = new FonnteClientScaffold({ FONNTE_TOKEN: 'placeholder' })
 * const result = await wa.sendMessage({ target: '628xxx', message: 'test' })
 * // result.status = true, tapi tidak ada WA terkirim
 *
 * // Di production (Phase 3):
 * // Ganti dengan: import { FonnteClient } from './clients/fonnte.client'
 * // const wa = new FonnteClient({ FONNTE_TOKEN: c.env.FONNTE_TOKEN })
 */
export class FonnteClientScaffold implements IWaClient {
  private readonly config: FonnteEnvConfig
  private readonly scaffoldMode: 'mock' | 'error'

  /**
   * @param config - FonnteEnvConfig (token tidak dipakai di scaffold)
   * @param scaffoldMode
   *   - 'mock' (default): return mock success response
   *   - 'error': return mock error response (untuk testing error handling)
   */
  constructor(
    config: FonnteEnvConfig,
    scaffoldMode: 'mock' | 'error' = 'mock'
  ) {
    this.config = config
    this.scaffoldMode = scaffoldMode

    // Log warning di scaffold mode
    console.warn(
      `[SCAFFOLD] FonnteClientScaffold initialized — NO real WA calls will be made.\n` +
      `Human gate constraint: ${WA_HUMAN_GATE_CONSTRAINT} = ${String(WA_CLIENT_HUMAN_GATE_REQUIRED)}\n` +
      `Replace with FonnteClient from Phase 3 for live integration.`
    )
  }

  async sendMessage(payload: FonnteSendPayload): Promise<FonnteResponse> {
    console.warn(`[SCAFFOLD] sendMessage called — target: ${payload.target}, message length: ${payload.message.length} chars. NOT SENT.`)

    if (this.scaffoldMode === 'error') {
      return scaffoldErrorResponse('sendMessage mock error mode')
    }

    return scaffoldSuccessResponse('sendMessage')
  }

  async sendFile(payload: FonnteSendFilePayload): Promise<FonnteResponse> {
    console.warn(`[SCAFFOLD] sendFile called — target: ${payload.target}, url: ${payload.url}. NOT SENT.`)

    if (this.scaffoldMode === 'error') {
      return scaffoldErrorResponse('sendFile mock error mode')
    }

    return scaffoldSuccessResponse('sendFile')
  }

  async validateNumber(payload: FonnteValidateNumberPayload): Promise<FonnteResponse> {
    console.warn(`[SCAFFOLD] validateNumber called — target: ${payload.target}. MOCK RESPONSE.`)

    if (this.scaffoldMode === 'error') {
      return scaffoldErrorResponse('validateNumber mock error mode')
    }

    return {
      status: true,
      id: undefined,
      detail: '[SCAFFOLD] Number validation mock — assume valid',
      data: { valid: true, target: payload.target },
    }
  }

  async getDevices(): Promise<FonnteDevice[]> {
    console.warn('[SCAFFOLD] getDevices called. MOCK RESPONSE.')

    if (this.scaffoldMode === 'error') {
      return []
    }

    return [
      {
        name: 'SCAFFOLD_DEVICE',
        device: '6281234567890',
        status: 'connected',
        quota: 999,
        expired: '2099-12-31',
      },
    ]
  }

  async isReady(): Promise<boolean> {
    // Scaffold selalu ready (kecuali mode error)
    return this.scaffoldMode !== 'error'
  }

  /** Expose config untuk testing (tanpa expose token) */
  getConfigInfo(): { hasToken: boolean; baseUrl: string } {
    return {
      hasToken: !!this.config.FONNTE_TOKEN && this.config.FONNTE_TOKEN.length > 0,
      baseUrl: this.config.FONNTE_BASE_URL ?? 'https://api.fonnte.com',
    }
  }
}
