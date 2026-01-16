// Mock SMS Provider for development and testing

import type { SMSProvider, SMSSendResult, SMSBatchResult, SMSRecipient } from './types'
import { isValidVietnamesePhone, normalizePhone } from './types'

export class MockSMSProvider implements SMSProvider {
  name = 'mock'
  private delay: number
  private failRate: number

  constructor(options?: { delay?: number; failRate?: number }) {
    this.delay = options?.delay ?? 500
    this.failRate = options?.failRate ?? 0.05 // 5% fail rate by default
  }

  validatePhone(phone: string): boolean {
    return isValidVietnamesePhone(phone)
  }

  async send(phone: string, message: string): Promise<SMSSendResult> {
    await this.simulateDelay()

    const normalized = normalizePhone(phone)
    const shouldFail = Math.random() < this.failRate

    if (!this.validatePhone(phone)) {
      return {
        success: false,
        recipient: normalized,
        error: 'Invalid phone number',
        provider: this.name,
        sentAt: new Date(),
      }
    }

    if (shouldFail) {
      return {
        success: false,
        recipient: normalized,
        error: 'Simulated failure',
        provider: this.name,
        sentAt: new Date(),
      }
    }

    console.log(`[MockSMS] Sent to ${normalized}: ${message.substring(0, 50)}...`)

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      recipient: normalized,
      provider: this.name,
      sentAt: new Date(),
    }
  }

  async sendBatch(recipients: SMSRecipient[], message: string): Promise<SMSBatchResult> {
    const results: SMSSendResult[] = []
    let totalSent = 0
    let totalFailed = 0

    // Process in parallel with concurrency limit
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map((r) => this.send(r.phone, message))
      )

      for (const result of batchResults) {
        results.push(result)
        if (result.success) totalSent++
        else totalFailed++
      }
    }

    return { totalSent, totalFailed, results }
  }

  async getBalance(): Promise<number> {
    await this.simulateDelay()
    return 999999 // Unlimited for mock
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay))
  }
}
