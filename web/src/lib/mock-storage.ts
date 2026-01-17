import type { Village, Household, Task, Resident } from '@/types'
import { MOCK_VILLAGES, MOCK_HOUSEHOLDS, MOCK_TASKS, MOCK_RESIDENTS } from './mock-data'

const STORAGE_KEYS = {
    VILLAGES: 'diensanh:mock:villages',
    HOUSEHOLDS: 'diensanh:mock:households',
    RESIDENTS: 'diensanh:mock:residents',
    TASKS: 'diensanh:mock:tasks',
}

class MockStorageService {
    // Villges
    getVillages(): Village[] {
        const stored = localStorage.getItem(STORAGE_KEYS.VILLAGES)
        if (stored) return JSON.parse(stored)

        // Initialize
        localStorage.setItem(STORAGE_KEYS.VILLAGES, JSON.stringify(MOCK_VILLAGES))
        return MOCK_VILLAGES
    }

    getVillage(id: string): Village | undefined {
        return this.getVillages().find(v => v.id === id)
    }

    // Households
    getHouseholds(villageId?: string): Household[] {
        const stored = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS)
        const allHouseholds: Household[] = stored ? JSON.parse(stored) : MOCK_HOUSEHOLDS

        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(MOCK_HOUSEHOLDS))
        }

        if (villageId) {
            return allHouseholds.filter(h => h.villageId === villageId)
        }
        return allHouseholds
    }

    getHousehold(id: string): Household | undefined {
        return this.getHouseholds().find(h => h.id === id)
    }

    createHousehold(household: Household): void {
        const households = this.getHouseholds()
        households.push(household)
        localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households))
    }

    updateHousehold(id: string, updates: Partial<Household>): void {
        const households = this.getHouseholds()
        const index = households.findIndex(h => h.id === id)
        if (index !== -1) {
            households[index] = { ...households[index], ...updates, updatedAt: new Date() }
            localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households))
        }
    }

    deleteHousehold(id: string): void {
        const households = this.getHouseholds().filter(h => h.id !== id)
        localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households))
    }

    // Residents
    getResidents(villageId?: string, householdId?: string): Resident[] {
        const stored = localStorage.getItem(STORAGE_KEYS.RESIDENTS)
        let allResidents: Resident[] = stored ? this.parseResidents(JSON.parse(stored)) : MOCK_RESIDENTS

        if (!stored) {
            localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(MOCK_RESIDENTS))
            allResidents = MOCK_RESIDENTS
        }

        let result = allResidents
        if (villageId) {
            result = result.filter(r => r.villageId === villageId)
        }
        if (householdId) {
            result = result.filter(r => r.householdId === householdId)
        }
        return result
    }

    getResident(id: string): Resident | undefined {
        return this.getResidents().find(r => r.id === id)
    }

    createResident(resident: Resident): void {
        const residents = this.getResidents()
        residents.push(resident)
        localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents))
    }

    updateResident(id: string, updates: Partial<Resident>): void {
        const residents = this.getResidents()
        const index = residents.findIndex(r => r.id === id)
        if (index !== -1) {
            residents[index] = { ...residents[index], ...updates, updatedAt: new Date() }
            localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents))
        }
    }

    deleteResident(id: string): void {
        const residents = this.getResidents().filter(r => r.id !== id)
        localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents))
    }

    // Tasks
    getTasks(): Task[] {
        const stored = localStorage.getItem(STORAGE_KEYS.TASKS)
        if (stored) return this.parseTasks(JSON.parse(stored))

        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(MOCK_TASKS))
        return MOCK_TASKS
    }

    getTask(id: string): Task | undefined {
        return this.getTasks().find(t => t.id === id)
    }

    createTask(task: Task): void {
        const tasks = this.getTasks()
        tasks.unshift(task) // Newest first
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    }

    updateTask(id: string, updates: Partial<Task>): void {
        const tasks = this.getTasks()
        const index = tasks.findIndex(t => t.id === id)
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() }
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
        }
    }

    deleteTask(id: string): void {
        const tasks = this.getTasks().filter(t => t.id !== id)
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    }

    // Helper to parse dates from JSON
    private parseTasks(tasks: any[]): Task[] {
        return tasks.map(t => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
            createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
            updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
        }))
    }

    private parseResidents(residents: any[]): Resident[] {
        return residents.map(r => ({
            ...r,
            birthDate: r.birthDate ? new Date(r.birthDate) : undefined,
            createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
        }))
    }
    // SMS Messages
    getSMSMessages(options?: { limit?: number; status?: 'pending' | 'sent' | 'failed' | 'delivered' }): any[] {
        const stored = localStorage.getItem('diensanh:mock:sms')
        let messages = stored ? JSON.parse(stored) : []

        // Parse dates
        messages = messages.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
            sentAt: m.sentAt ? new Date(m.sentAt) : undefined,
        }))

        // Sort by createdAt desc
        messages.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())

        if (options?.status) {
            messages = messages.filter((m: any) => m.status === options.status)
        }

        if (options?.limit) {
            messages = messages.slice(0, options.limit)
        }

        return messages
    }

    createSMS(message: any): void {
        const stored = localStorage.getItem('diensanh:mock:sms')
        const messages = stored ? JSON.parse(stored) : []
        messages.push(message)
        localStorage.setItem('diensanh:mock:sms', JSON.stringify(messages))
    }

    updateSMS(id: string, updates: any): void {
        const stored = localStorage.getItem('diensanh:mock:sms')
        const messages = stored ? JSON.parse(stored) : []
        const index = messages.findIndex((m: any) => m.id === id)

        if (index !== -1) {
            messages[index] = { ...messages[index], ...updates }
            localStorage.setItem('diensanh:mock:sms', JSON.stringify(messages))
        }
    }
}

export const MockStorage = new MockStorageService()
