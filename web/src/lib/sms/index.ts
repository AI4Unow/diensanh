// SMS Service - Provider abstraction layer

import type { SMSProvider, SMSProviderConfig, SMSSendResult, SMSBatchResult, SMSRecipient } from './types'
import { MockSMSProvider } from './mock-provider'

let currentProvider: SMSProvider | null = null

/**
 * Initialize SMS provider based on config
 */
export function initSMSProvider(config: SMSProviderConfig): SMSProvider {
  switch (config.provider) {
    case 'mock':
      currentProvider = new MockSMSProvider({ delay: config.sandbox ? 100 : 500 })
      break
    case 'esms':
      // TODO: Implement eSMS provider for Vietnam
      console.warn('eSMS provider not implemented, falling back to mock')
      currentProvider = new MockSMSProvider()
      break
    case 'speedsms':
      // TODO: Implement SpeedSMS provider for Vietnam
      console.warn('SpeedSMS provider not implemented, falling back to mock')
      currentProvider = new MockSMSProvider()
      break
    case 'twilio':
      // TODO: Implement Twilio provider
      console.warn('Twilio provider not implemented, falling back to mock')
      currentProvider = new MockSMSProvider()
      break
    default:
      currentProvider = new MockSMSProvider()
  }
  return currentProvider
}

/**
 * Get current SMS provider
 */
export function getSMSProvider(): SMSProvider {
  if (!currentProvider) {
    // Default to mock provider in development
    currentProvider = new MockSMSProvider()
  }
  return currentProvider
}

/**
 * Send SMS to single recipient
 */
export async function sendSMS(phone: string, message: string): Promise<SMSSendResult> {
  const provider = getSMSProvider()
  return provider.send(phone, message)
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(recipients: SMSRecipient[], message: string): Promise<SMSBatchResult> {
  const provider = getSMSProvider()
  return provider.sendBatch(recipients, message)
}

/**
 * Get SMS balance (if supported by provider)
 */
export async function getSMSBalance(): Promise<number | null> {
  const provider = getSMSProvider()
  if (provider.getBalance) {
    return provider.getBalance()
  }
  return null
}

// Export types
export * from './types'
