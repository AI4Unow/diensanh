import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

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
