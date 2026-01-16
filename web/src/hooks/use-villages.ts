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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Village } from '@/types'

const VILLAGES_KEY = ['villages']

/**
 * Fetch all villages
 */
export function useVillages() {
  return useQuery({
    queryKey: VILLAGES_KEY,
    queryFn: async () => {
      const q = query(collection(db, 'villages'), orderBy('region'), orderBy('name'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Village[]
    },
  })
}

/**
 * Fetch a single village by ID
 */
export function useVillage(villageId: string | undefined) {
  return useQuery({
    queryKey: [...VILLAGES_KEY, villageId],
    queryFn: async () => {
      if (!villageId) return null
      const docRef = doc(db, 'villages', villageId)
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null
      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate(),
      } as Village
    },
    enabled: !!villageId,
  })
}

/**
 * Create a new village
 */
export function useCreateVillage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Village, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'villages'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VILLAGES_KEY })
    },
  })
}

/**
 * Update a village
 */
export function useUpdateVillage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Village> & { id: string }) => {
      const docRef = doc(db, 'villages', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VILLAGES_KEY })
      queryClient.invalidateQueries({ queryKey: [...VILLAGES_KEY, variables.id] })
    },
  })
}

/**
 * Delete a village
 */
export function useDeleteVillage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (villageId: string) => {
      const docRef = doc(db, 'villages', villageId)
      await deleteDoc(docRef)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VILLAGES_KEY })
    },
  })
}

/**
 * Get villages grouped by region
 */
export function useVillagesByRegion() {
  const { data: villages, ...rest } = useVillages()

  const grouped = villages?.reduce(
    (acc, village) => {
      const region = village.region
      if (!acc[region]) {
        acc[region] = []
      }
      acc[region].push(village)
      return acc
    },
    {} as Record<string, Village[]>
  )

  return { data: grouped, ...rest }
}
