import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Task } from '@/types'
import { MockStorage } from '@/lib/mock-storage'
import { APP_CONFIG } from '@/config/app-config'

export interface DashboardStats {
  villageCount: number
  householdCount: number
  residentCount: number
  pendingTasks: number
  pendingRequests: number
  sentMessages: number
}



/**
 * Fetch dashboard statistics from Firestore
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let totalHouseholds = 0
        let totalResidents = 0

        const villages = MockStorage.getVillages()
        const tasks = MockStorage.getTasks()

        villages.forEach((v) => {
          totalHouseholds += v.householdCount || 0
          totalResidents += v.residentCount || 0
        })

        return {
          villageCount: villages.length,
          householdCount: totalHouseholds,
          residentCount: totalResidents,
          pendingTasks: tasks.filter((t: Task) => t.status === 'pending').length,
          pendingRequests: 0, // Mock
          sentMessages: 0, // Mock
        }
      }

      // Fetch all data in parallel
      const [villagesSnap, tasksSnap, requestsSnap, messagesSnap] = await Promise.all([
        getDocs(collection(db, 'villages')),
        getDocs(query(collection(db, 'tasks'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'requests'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'messages'), where('status', '==', 'sent'))),
      ])

      // Calculate totals from villages
      let totalHouseholds = 0
      let totalResidents = 0

      villagesSnap.docs.forEach((doc) => {
        const data = doc.data()
        totalHouseholds += data.householdCount || 0
        totalResidents += data.residentCount || 0
      })

      return {
        villageCount: villagesSnap.size,
        householdCount: totalHouseholds,
        residentCount: totalResidents,
        pendingTasks: tasksSnap.size,
        pendingRequests: requestsSnap.size,
        sentMessages: messagesSnap.size,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}
