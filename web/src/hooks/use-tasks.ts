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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Task, TaskStatus, TaskPriority } from '@/types'

const TASKS_KEY = ['tasks']

/**
 * Fetch all tasks with optional filters
 */
export function useTasks(options?: { status?: TaskStatus; villageId?: string }) {
  return useQuery({
    queryKey: [...TASKS_KEY, options],
    queryFn: async () => {
      let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))

      if (options?.status) {
        q = query(
          collection(db, 'tasks'),
          where('status', '==', options.status),
          orderBy('createdAt', 'desc')
        )
      }

      if (options?.villageId) {
        q = query(
          collection(db, 'tasks'),
          where('assignedTo', 'array-contains', options.villageId),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Task[]
    },
  })
}

/**
 * Fetch a single task
 */
export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: [...TASKS_KEY, taskId],
    queryFn: async () => {
      if (!taskId) return null
      const docRef = doc(db, 'tasks', taskId)
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null
      return {
        id: snapshot.id,
        ...snapshot.data(),
        dueDate: snapshot.data().dueDate?.toDate(),
        completedAt: snapshot.data().completedAt?.toDate(),
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate(),
      } as Task
    },
    enabled: !!taskId,
  })
}

interface CreateTaskInput {
  title: string
  description: string
  type: Task['type']
  priority: TaskPriority
  assignedTo: string[]
  createdBy: string
  dueDate?: Date
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...data,
        status: 'pending' as TaskStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  type?: Task['type']
  priority?: TaskPriority
  status?: TaskStatus
  assignedTo?: string[]
  dueDate?: Date
  completedAt?: Date
}

/**
 * Update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTaskInput) => {
      const docRef = doc(db, 'tasks', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
      queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, variables.id] })
    },
  })
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      await deleteDoc(doc(db, 'tasks', taskId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

/**
 * Get task statistics
 */
export function useTaskStats() {
  return useQuery({
    queryKey: [...TASKS_KEY, 'stats'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'tasks'))
      const stats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
      }

      const now = new Date()
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        stats.total++

        switch (data.status) {
          case 'pending': stats.pending++; break
          case 'in_progress': stats.inProgress++; break
          case 'completed': stats.completed++; break
          case 'cancelled': stats.cancelled++; break
        }

        if (data.dueDate && data.status !== 'completed' && data.status !== 'cancelled') {
          const dueDate = data.dueDate.toDate()
          if (dueDate < now) stats.overdue++
        }
      })

      return stats
    },
  })
}
