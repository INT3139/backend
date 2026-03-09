export type UUID = string

export type ScopeType = 'school' | 'faculty' | 'department' | 'self'

export type WorkflowStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled'

export type StaffType = 'lecturer' | 'researcher' | 'staff'

export type EmploymentStatus = 'active' | 'retired' | 'resigned' | 'transferred'

export interface PaginationQuery {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthUser {
  id: UUID
  username: string
  email: string
  fullName: string
  unitId: UUID | null
}

export interface ResourceScope {
  resourceType: string
  resourceId: UUID
  ownerId: UUID | null
  unitId: UUID | null
}

export interface WorkflowInitPayload {
  definitionCode: string
  resourceType: string
  resourceId: UUID
  initiatedBy: UUID
  metadata?: Record<string, unknown>
  dueAt?: Date
}

export interface BallotData {
  total: number
  approve: number
  reject: number
  abstain: number
  pct: number
  passed: boolean
}

export interface NotificationPayload {
  templateCode: string
  recipientId: UUID
  resourceType?: string
  resourceId?: UUID
  payload: Record<string, unknown>
  scheduledAt?: Date
}
