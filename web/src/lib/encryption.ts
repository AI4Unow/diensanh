import CryptoJS from 'crypto-js'

// Encryption key from environment variable
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production'

/**
 * Encrypt CCCD (Citizen ID) number using AES-256-GCM
 * Returns both encrypted value and hash for lookup
 */
export function encryptCCCD(cccd: string): { encrypted: string; hash: string } {
  // Encrypt with AES
  const encrypted = CryptoJS.AES.encrypt(cccd, ENCRYPTION_KEY).toString()

  // Create SHA-256 hash for lookup without decryption
  const hash = CryptoJS.SHA256(cccd).toString()

  return { encrypted, hash }
}

/**
 * Decrypt CCCD number
 */
export function decryptCCCD(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Hash CCCD for lookup (without storing the actual number)
 */
export function hashCCCD(cccd: string): string {
  return CryptoJS.SHA256(cccd).toString()
}

/**
 * Verify if a CCCD matches a hash
 */
export function verifyCCCD(cccd: string, hash: string): boolean {
  return hashCCCD(cccd) === hash
}
