import { useMutation } from '@tanstack/react-query'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { UserRole } from '@/types'

interface LoginVariables {
  phone: string
  pass: string
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ phone, pass }: LoginVariables) => {
      // Format phone to email
      // Remove leading 0 if present to standardise, but let's keep it simple for now and just append domain
      // actually, standard practice is usually to keep the number as is or valid international format.
      // Let's assume the user inputs '09...' or '9...'
      // We will ensure a consistent email format: `[phone]@diensanh.local`

      const email = `${phone}@diensanh.local`

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, pass)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          // Setup for simple testing: IF login fails, try to CREATE the user?
          // The prompt said "created with Email/Password... assume users are pre-created... OR add temporary Register"
          // "Decision: ... I'll implementation a simple creating user if not found logic"

          // Let's try to create if sign in fails (likely user doesn't exist)
          // CAUTION: This means anyone can create an account with any phone number if they pick a password.
          // For a "Refractor auth system... for simplicity and testing first", this is acceptable.
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, pass)
          } catch (createError: any) {
            throw error; // Throw the original login error or the create error
          }
        } else {
          throw error
        }
      }

      const user = userCredential.user

      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng sau khi đăng nhập')
      }

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create new user in Firestore
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
          phone: phone, // Store original phone input
          displayName: phone,
          role: 'resident', // Default role
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
