import { initializeApp } from 'firebase/app'
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import type { ConfirmationResult, User } from 'firebase/auth'
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator
} from 'firebase/firestore'

// Firebase configuration from environment variables
// Using diensanh-45eb1 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7X1EJmzjEeWx2kuLTTH-UbOAxT5YMOII",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "diensanh-45eb1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "diensanh-45eb1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "diensanh-45eb1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847174741608",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847174741608:web:86df47e099a0cc231f95dd",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth with local persistence
export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)

// Initialize Firestore with offline persistence
export const db = getFirestore(app)

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser')
  }
})

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

// reCAPTCHA verifier for phone auth
let recaptchaVerifier: RecaptchaVerifier | null = null

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Reset reCAPTCHA
      recaptchaVerifier?.clear()
    }
  })

  return recaptchaVerifier
}

// Send OTP to phone number
export async function sendOTP(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Format Vietnamese phone number
  const formattedPhone = formatVietnamesePhone(phoneNumber)
  return signInWithPhoneNumber(auth, formattedPhone, verifier)
}

// Format Vietnamese phone number to E.164 format
export function formatVietnamesePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Handle different formats
  if (digits.startsWith('84')) {
    return `+${digits}`
  } else if (digits.startsWith('0')) {
    return `+84${digits.slice(1)}`
  } else {
    return `+84${digits}`
  }
}

export { app }
export type { User, ConfirmationResult }
