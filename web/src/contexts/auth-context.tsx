import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { User } from '@/config/firebase'
import type { UserDoc, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  userDoc: UserDoc | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  isAdmin: boolean
  isVillageLeader: boolean
  isResident: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const data = userSnap.data()
            setUserDoc({
              uid: firebaseUser.uid,
              phone: data.phone,
              displayName: data.displayName,
              role: data.role as UserRole,
              villageId: data.villageId,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            })
          } else {
            // User exists in Auth but not in Firestore
            // This might be a new user that needs registration
            setUserDoc(null)
          }
          setError(null)
        } catch (err) {
          console.error('Error fetching user document:', err)
          setError('Không thể tải thông tin người dùng')
          setUserDoc(null)
        }
      } else {
        setUserDoc(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserDoc(null)
    } catch (err) {
      console.error('Error signing out:', err)
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    userDoc,
    loading,
    error,
    logout,
    isAdmin: userDoc?.role === 'commune_admin',
    isVillageLeader: userDoc?.role === 'village_leader',
    isResident: userDoc?.role === 'resident',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
