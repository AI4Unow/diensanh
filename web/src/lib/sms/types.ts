// SMS Provider types and interfaces

export interface SMSRecipient {
  phone: string
  name?: string
  villageId?: string
  householdId?: string
}

export interface SMSSendRequest {
  recipients: SMSRecipient[]
  message: string
  scheduledAt?: Date
}

export interface SMSSendResult {
  success: boolean
  messageId?: string
  recipient: string
  error?: string
  provider: string
  sentAt: Date
}

export interface SMSBatchResult {
  totalSent: number
  totalFailed: number
  results: SMSSendResult[]
}

export interface SMSProvider {
  name: string
  send(phone: string, message: string): Promise<SMSSendResult>
  sendBatch(recipients: SMSRecipient[], message: string): Promise<SMSBatchResult>
  getBalance?(): Promise<number>
  validatePhone(phone: string): boolean
}

export interface SMSProviderConfig {
  provider: 'esms' | 'speedsms' | 'twilio' | 'mock'
  apiKey?: string
  apiSecret?: string
  brandName?: string
  sandbox?: boolean
}

// Vietnamese phone number validation
export function isValidVietnamesePhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  // Vietnamese phone: starts with 0 or +84, followed by 9 digits
  const regex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  return regex.test(cleaned)
}

// Normalize phone to E.164 format (+84...)
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '')
  if (cleaned.startsWith('+84')) return cleaned
  if (cleaned.startsWith('84')) return '+' + cleaned
  if (cleaned.startsWith('0')) return '+84' + cleaned.slice(1)
  return cleaned
}
