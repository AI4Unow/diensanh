import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APP_CONFIG } from '@/config/app-config'
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
import { MockStorage } from '@/lib/mock-storage'

const VILLAGES_KEY = ['villages']

/**
 * Fetch all villages
 */
export function useVillages() {
  return useQuery({
    queryKey: VILLAGES_KEY,
    queryFn: async () => {
      // MOCK DATA INJECTION FOR TESTING
      // In a real scenario, checks would be more robust.
      // For now, we return mocks to unblock UI testing.
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500)) // simulate network
        return MockStorage.getVillages()
      }

      const q = query(collection(db, 'villages'), orderBy('region'), orderBy('name'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      }) as Village[]
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

      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const village = MockStorage.getVillage(villageId)
        return village || null
      }

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
