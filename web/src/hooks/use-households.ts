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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Household } from '@/types'

const HOUSEHOLDS_KEY = ['households']

/**
 * Fetch all households for a village
 */
export function useHouseholds(villageId: string | undefined) {
  return useQuery({
    queryKey: [...HOUSEHOLDS_KEY, villageId],
    queryFn: async () => {
      if (!villageId) return []
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
    enabled: !!villageId,
  })
}

/**
 * Fetch a single household
 */
export function useHousehold(villageId: string | undefined, householdId: string | undefined) {
  return useQuery({
    queryKey: [...HOUSEHOLDS_KEY, villageId, householdId],
    queryFn: async () => {
      if (!villageId || !householdId) return null
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
    },
    enabled: !!villageId && !!householdId,
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
