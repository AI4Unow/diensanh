import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  collectionGroup,
  where,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Household } from '@/types'

import { MockStorage } from '@/lib/mock-storage'

import { APP_CONFIG } from '@/config/app-config'

const HOUSEHOLDS_KEY = ['households']

/**
 * Fetch all households for a village
 */
export function useHouseholds(villageId: string | undefined) {
  return useQuery({
    queryKey: [...HOUSEHOLDS_KEY, villageId],
    queryFn: async () => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        // If no villageId, return ALL households (for admins)
        return MockStorage.getHouseholds(villageId)
      }

      if (!villageId) {
        // collectionGroup query for all households (Admin view)
        const q = query(
          collectionGroup(db, 'households'),
          orderBy('headName')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => {
          const data = doc.data() as any
          return {
            id: doc.id,
            // Note: villageId might need to be extracted from ref parent if not in data
            // But usually we store it in data too
            villageId: doc.ref.parent.parent?.id || '',
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          }
        }) as Household[]
      }

      const q = query(
        collection(db, 'villages', villageId, 'households'),
        orderBy('headName')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        villageId,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Household[]
    },
    // Always enable to allow fetching for admin (all households) or specific village
    enabled: true,
  })
}

/**
 * Fetch a single household
 */
export function useHousehold(villageId: string | undefined, householdId: string | undefined) {
  return useQuery({
    queryKey: [...HOUSEHOLDS_KEY, villageId, householdId],
    queryFn: async () => {
      if (!householdId) return null

      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const household = MockStorage.getHousehold(householdId)
        return household || null
      }

      // If we have villageId, use direct doc reference (faster/cheaper)
      if (villageId) {
        const docRef = doc(db, 'villages', villageId, 'households', householdId)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists()) return null
        return {
          id: snapshot.id,
          villageId,
          ...snapshot.data(),
          createdAt: snapshot.data().createdAt?.toDate(),
          updatedAt: snapshot.data().updatedAt?.toDate(),
        } as Household
      }

      // If no villageId, search by ID using collectionGroup
      // Note: This assumes 'id' field is stored in the document. 
      // If not, we might need a different strategy or rely on the caller to provide villageId.
      // Alternatively, assuming we store 'id' in the doc data as shown in types.
      const q = query(
        collectionGroup(db, 'households'),
        where('id', '==', householdId) // OR documentId() == householdId if relying on doc keys
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      const docSnap = snapshot.docs[0]
      const data = docSnap.data() as any
      return {
        id: docSnap.id,
        // vital: extract villageId from parent path if not in data, though likely in data
        villageId: data.villageId || docSnap.ref.parent.parent?.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Household
    },
    enabled: !!householdId,
  })
}

/**
 * Create a new household
 */
export function useCreateHousehold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      villageId,
      ...data
    }: Omit<Household, 'id' | 'createdAt' | 'updatedAt'>) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newHousehold: Household = {
          id: `hh-${Date.now()}`,
          villageId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        MockStorage.createHousehold(newHousehold)
        return newHousehold.id
      }

      // Add household
      const docRef = await addDoc(collection(db, 'villages', villageId, 'households'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update village household count
      const villageRef = doc(db, 'villages', villageId)
      await updateDoc(villageRef, {
        householdCount: increment(1),
        updatedAt: serverTimestamp(),
      })

      return docRef.id
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...HOUSEHOLDS_KEY, variables.villageId] })
      queryClient.invalidateQueries({ queryKey: ['villages'] })
    },
  })
}

/**
 * Update a household
 */
export function useUpdateHousehold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      villageId,
      id,
      ...data
    }: Partial<Household> & { villageId: string; id: string }) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.updateHousehold(id, data)
        return
      }

      const docRef = doc(db, 'villages', villageId, 'households', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...HOUSEHOLDS_KEY, variables.villageId] })
      queryClient.invalidateQueries({
        queryKey: [...HOUSEHOLDS_KEY, variables.villageId, variables.id],
      })
    },
  })
}

/**
 * Delete a household
 */
export function useDeleteHousehold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ villageId, householdId }: { villageId: string; householdId: string }) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.deleteHousehold(householdId)
        return
      }

      const docRef = doc(db, 'villages', villageId, 'households', householdId)
      await deleteDoc(docRef)

      // Update village household count
      const villageRef = doc(db, 'villages', villageId)
      await updateDoc(villageRef, {
        householdCount: increment(-1),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...HOUSEHOLDS_KEY, variables.villageId] })
      queryClient.invalidateQueries({ queryKey: ['villages'] })
    },
  })
}
