// User roles
export type UserRole = 'commune_admin' | 'village_leader' | 'resident'

// Gender type
export type Gender = 'male' | 'female' | 'other'

// User document in Firestore
export interface UserDoc {
  uid: string
  phone: string
  displayName: string
  role: UserRole
  villageId?: string // For village leaders
  createdAt: Date
  updatedAt: Date
}

// Village types
export type VillageType = 'thon' | 'kdc'
export type VillageRegion = 'dien_sanh_cu' | 'hai_truong' | 'hai_dinh'

// Village document
export interface Village {
  id: string
  name: string
  code: string
  region: VillageRegion
  type: VillageType
  leaderId?: string
  leaderName?: string
  leaderPhone?: string
  householdCount: number
  residentCount: number
  createdAt: Date
  updatedAt: Date
}

// Household document
export interface Household {
  id: string
  villageId: string
  code: string // So ho khau
  headName: string
  headId?: string // Reference to head resident
  headPhone?: string
  phone?: string
  address: string
  memberCount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Resident document
export interface Resident {
  id: string
  householdId: string
  villageId: string
  name: string
  fullName?: string
  birthDate?: Date
  dateOfBirth?: string
  gender: Gender
  idNumberEncrypted?: string // CCCD encrypted
  idNumberHash?: string // SHA-256 hash for lookup
  phone?: string
  relationship: string // Quan he voi chu ho
  occupation?: string
  notes?: string
  isHead: boolean
  createdAt: Date
  updatedAt: Date
}

// Task types
export type TaskType = 'survey' | 'notification' | 'report' | 'other'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'

// Task document
export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string[] // villageIds
  createdBy: string // uid
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// SMS Message types
export type SMSStatus = 'pending' | 'sent' | 'failed' | 'delivered'

export interface SMSMessage {
  id: string
  recipients: string[] // phone numbers
  content: string
  status: SMSStatus
  sentBy: string // uid
  sentAt?: Date
  deliveredCount: number
  failedCount: number
  createdAt: Date
}

// Request types
export type RequestType = 'certificate' | 'complaint' | 'suggestion' | 'other'
export type RequestStatus = 'pending' | 'processing' | 'resolved' | 'rejected'

export interface Request {
  id: string
  type: RequestType
  title: string
  content: string
  submittedBy: string // uid or phone
  submitterName: string
  submitterPhone: string
  villageId?: string
  status: RequestStatus
  response?: string
  respondedBy?: string
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Announcement document
export interface Announcement {
  id: string
  title: string
  content: string
  targetVillages: string[] // villageIds, empty = all
  isPublic: boolean
  createdBy: string
  publishedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
