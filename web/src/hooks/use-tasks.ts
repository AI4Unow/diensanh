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
  where,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Task, TaskStatus, TaskPriority } from '@/types'

import { MockStorage } from '@/lib/mock-storage'

const TASKS_KEY = ['tasks']

/**
 * Fetch all tasks with optional filters
 */
export function useTasks(options?: { status?: TaskStatus; villageId?: string }) {
  return useQuery({
    queryKey: [...TASKS_KEY, options],
    queryFn: async () => {
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        let tasks = [...MockStorage.getTasks()]

        if (options?.status) {
          const status = options.status
          tasks = tasks.filter(t => t.status === status)
        }

        if (options?.villageId) {
          const villageId = options.villageId
          tasks = tasks.filter(t => t.assignedTo.includes(villageId))
        }

        return tasks.map(t => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          createdAt: typeof t.createdAt === 'string' ? new Date(t.createdAt) : t.createdAt,
          updatedAt: typeof t.updatedAt === 'string' ? new Date(t.updatedAt) : t.updatedAt,
        }))
      }

      let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

      if (options && options.status) {
        constraints.push(where('status', '==', options.status));
      }

      if (options && options.villageId) {
        constraints.push(where('assignedTo', 'array-contains', options.villageId));
      }

      const q = query(collection(db, 'tasks'), ...constraints);

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        }
      }) as Task[]
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

      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const task = MockStorage.getTask(taskId)
        return task || null
      }

      const docRef = doc(db, 'tasks', taskId)
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null

      const data = snapshot.data()!
      return {
        id: snapshot.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
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
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...data,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        MockStorage.createTask(newTask)
        return newTask.id
      }

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
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.updateTask(id, data)
        return
      }

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
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        MockStorage.deleteTask(taskId)
        return
      }

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
      // MOCK DATA INJECTION
      if (APP_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const stats = {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          overdue: 0,
        }

        const now = new Date()
        MockStorage.getTasks().forEach((task) => {
          stats.total++
          switch (task.status) {
            case 'pending':
              stats.pending++
              break
            case 'in_progress':
              stats.inProgress++
              break
            case 'completed':
              stats.completed++
              break
            case 'cancelled':
              stats.cancelled++
              break
          }

          if (task.dueDate && task.status !== 'completed' && task.status !== 'cancelled') {
            const dueDate = new Date(task.dueDate)
            if (dueDate < now) stats.overdue++
          }
        })

        return stats
      }

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
        const data = doc.data() as any
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
