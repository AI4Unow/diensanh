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
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { encryptCCCD, decryptCCCD, hashCCCD } from '@/lib/encryption'
import type { Resident } from '@/types'
import { APP_CONFIG } from '@/config/app-config'
import { MockStorage } from '@/lib/mock-storage'

const RESIDENTS_KEY = ['residents']

/**
 * Fetch all residents for a household
 */
export function useResidents(villageId: string | undefined, householdId: string | undefined) {
  return useQuery({
    queryKey: [...RESIDENTS_KEY, villageId, householdId],
    queryFn: async () => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MockStorage.getResidents(villageId, householdId)
      }

      if (!villageId || !householdId) return []
      const q = query(
        collection(db, 'villages', villageId, 'households', householdId, 'residents'),
        orderBy('isHead', 'desc'),
        orderBy('name')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          villageId,
          householdId,
          ...data,
          birthDate: data.birthDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      }) as Resident[]
    },
    enabled: !!villageId && !!householdId,
  })
}

/**
 * Fetch a single resident
 */
export function useResident(
  villageId: string | undefined,
  householdId: string | undefined,
  residentId: string | undefined
) {
  return useQuery({
    queryKey: [...RESIDENTS_KEY, villageId, householdId, residentId],
    queryFn: async () => {
      if (!villageId || !householdId || !residentId) return null

      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return MockStorage.getResident(residentId)
      }

      const docRef = doc(
        db,
        'villages',
        villageId,
        'households',
        householdId,
        'residents',
        residentId
      )
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null
      return {
        id: snapshot.id,
        villageId,
        householdId,
        ...snapshot.data(),
        birthDate: snapshot.data().birthDate?.toDate(),
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate(),
      } as Resident
    },
    enabled: !!villageId && !!householdId && !!residentId,
  })
}

interface CreateResidentInput extends Omit<Resident, 'id' | 'createdAt' | 'updatedAt' | 'idNumberEncrypted' | 'idNumberHash'> {
  idNumber?: string // Plain CCCD number to be encrypted
}

/**
 * Create a new resident with CCCD encryption
 */
export function useCreateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ villageId, householdId, idNumber, ...data }: CreateResidentInput) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newResident: Resident = {
          id: `res-${Date.now()}`,
          villageId,
          householdId,
          ...data,
          // For mock, we skip complex encryption simulation
          idNumberHash: idNumber ? 'mock-hash' : undefined,
          birthDate: data.birthDate, // Assuming date is passed correctly
          createdAt: new Date(),
          updatedAt: new Date(),
          isHead: data.isHead || false,
          gender: data.gender || 'other',
          relationship: data.relationship || '',
          name: data.name || '',
        }
        MockStorage.createResident(newResident)
        return newResident.id
      }

      // Encrypt CCCD if provided
      let encryptedData = {}
      if (idNumber) {
        const { encrypted, hash } = encryptCCCD(idNumber)
        encryptedData = {
          idNumberEncrypted: encrypted,
          idNumberHash: hash,
        }
      }

      // Add resident
      const docRef = await addDoc(
        collection(db, 'villages', villageId, 'households', householdId, 'residents'),
        {
          ...data,
          ...encryptedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      )

      // Update household member count
      const householdRef = doc(db, 'villages', villageId, 'households', householdId)
      await updateDoc(householdRef, {
        memberCount: increment(1),
        updatedAt: serverTimestamp(),
      })

      // Update village resident count
      const villageRef = doc(db, 'villages', villageId)
      await updateDoc(villageRef, {
        residentCount: increment(1),
        updatedAt: serverTimestamp(),
      })

      return docRef.id
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...RESIDENTS_KEY, variables.villageId, variables.householdId],
      })
      queryClient.invalidateQueries({ queryKey: ['households', variables.villageId] })
      queryClient.invalidateQueries({ queryKey: ['villages'] })
    },
  })
}

interface UpdateResidentInput extends Partial<Omit<Resident, 'idNumberEncrypted' | 'idNumberHash'>> {
  villageId: string
  householdId: string
  id: string
  idNumber?: string // Plain CCCD number to be encrypted
}

/**
 * Update a resident with CCCD encryption
 */
export function useUpdateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ villageId, householdId, id, idNumber, ...data }: UpdateResidentInput) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.updateResident(id, data)
        return
      }

      // Encrypt CCCD if provided
      let encryptedData = {}
      if (idNumber) {
        const { encrypted, hash } = encryptCCCD(idNumber)
        encryptedData = {
          idNumberEncrypted: encrypted,
          idNumberHash: hash,
        }
      }

      const docRef = doc(db, 'villages', villageId, 'households', householdId, 'residents', id)
      await updateDoc(docRef, {
        ...data,
        ...encryptedData,
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...RESIDENTS_KEY, variables.villageId, variables.householdId],
      })
      queryClient.invalidateQueries({
        queryKey: [...RESIDENTS_KEY, variables.villageId, variables.householdId, variables.id],
      })
    },
  })
}

/**
 * Delete a resident
 */
export function useDeleteResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      villageId,
      householdId,
      residentId,
    }: {
      villageId: string
      householdId: string
      residentId: string
    }) => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.deleteResident(residentId)
        return
      }

      const docRef = doc(db, 'villages', villageId, 'households', householdId, 'residents', residentId)
      await deleteDoc(docRef)

      // Update household member count
      const householdRef = doc(db, 'villages', villageId, 'households', householdId)
      await updateDoc(householdRef, {
        memberCount: increment(-1),
        updatedAt: serverTimestamp(),
      })

      // Update village resident count
      const villageRef = doc(db, 'villages', villageId)
      await updateDoc(villageRef, {
        residentCount: increment(-1),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...RESIDENTS_KEY, variables.villageId, variables.householdId],
      })
      queryClient.invalidateQueries({ queryKey: ['households', variables.villageId] })
      queryClient.invalidateQueries({ queryKey: ['villages'] })
    },
  })
}

/**
 * Search resident by CCCD hash (without decryption)
 */
export function useSearchResidentByCCCD(cccd: string | undefined, villageId?: string) {
  return useQuery({
    queryKey: ['residents', 'search', cccd],
    queryFn: async () => {
      if (!cccd) return null
      const hash = hashCCCD(cccd)

      // Search across all villages or specific village
      // Note: This requires a collection group query
      const q = villageId
        ? query(
          collection(db, 'villages', villageId, 'households'),
          where('idNumberHash', '==', hash)
        )
        : null // Collection group queries need special setup

      if (!q) return null

      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      return snapshot.docs[0].data() as any
    },
    enabled: !!cccd,
  })
}

/**
 * Decrypt CCCD for display (use sparingly, only for authorized users)
 */
export function decryptResidentCCCD(encryptedCCCD: string): string {
  return decryptCCCD(encryptedCCCD)
}
