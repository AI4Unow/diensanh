import { useMutation } from '@tanstack/react-query'
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, sendOTP } from '@/config/firebase'
import type { UserRole } from '@/types'

interface SendOtpVariables {
  phone: string
  verifier: RecaptchaVerifier
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: async ({ phone, verifier }: SendOtpVariables) => {
      return await sendOTP(phone, verifier)
    },
  })
}

interface VerifyOtpVariables {
  otp: string
  confirmationResult: ConfirmationResult
  phone: string
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async ({ otp, confirmationResult }: VerifyOtpVariables) => {
      const result = await confirmationResult.confirm(otp)
      const user = result.user

      if (!user) {
        throw new Error('User not found after verification')
      }

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create new user
        const newUser: {
          uid: string
          phone: string
          displayName: string
          role: UserRole
          createdAt: ReturnType<typeof serverTimestamp>
          updatedAt: ReturnType<typeof serverTimestamp>
          lastLogin?: ReturnType<typeof serverTimestamp>
        } = {
          uid: user.uid,
          phone: user.phoneNumber || '',
          displayName: user.phoneNumber || '',
          role: 'resident',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        }

        await setDoc(userRef, newUser)
      } else {
        // Update existing user lastLogin
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      return user
    },
  })
}
