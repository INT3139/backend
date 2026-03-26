export type ID = number

// --- Base Enums ---
export type UnitType = 'school' | 'faculty' | 'department' | 'lab'
export type Gender = 'Nam' | 'Nữ' | 'Khác'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
export type AcademicDegree = 'bachelor' | 'master' | 'phd'
export type AcademicTitle = 'gs' | 'pgs'
export type PoliticalTheory = 'sơ cấp' | 'trung cấp' | 'cao cấp' | 'cử nhân'
export type EmploymentStatus = 'active' | 'retired' | 'resigned' | 'transferred'
export type HistoryType = 'chinh_quyen' | 'dang' | 'cong_doan' | 'doan' | 'quan_ngu_chinh_tri'
export type CommonStatus = 'pending' | 'approved' | 'rejected'
export type EduType = 'degree' | 'certificate' | 'foreign_lang' | 'it'
export type LangLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type ContractType = 'probation' | 'fixed_term' | 'indefinite' | 'part_time'
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'
export type AwardLevel = 'co_so' | 'dhqg' | 'bo' | 'chinh_phu' | 'nha_nuoc'
export type RewardStatus = 'draft' | 'submitted' | 'ballot_done' | 'approved' | 'rejected'
export type TitleLevel = 'unit' | 'university' | 'ministry'
export type UpgradeType = 'NBL thường xuyên' | 'NBL trước hạn' | 'NBL vượt bậc'
export type EvidenceType = 'teaching' | 'research_paper' | 'research_project' | 'other_task'
export type AppointmentType = 'new' | 'reappoint' | 'transfer' | 'dismiss'
export type AppointmentStatus = 'active' | 'expired' | 'dismissed' | 'transferred'
export type WorkflowStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled'
export type WorkflowAction = 'approve' | 'reject' | 'request_revision' | 'ballot_submit' | 'forward'
export type AttachmentCategory = 'evidence' | 'decision' | 'ballot_minutes' | 'cv' | 'contract_doc' | 'other'
export type NotificationChannel = 'in_app' | 'email'
export type NotificationStatus = 'pending' | 'sent' | 'read' | 'failed'
export type DisciplineType = 'khien_trach' | 'canh_cao' | 'ha_bac_luong' | 'buoc_thoi_viec'
export type ScopeType = 'school' | 'faculty' | 'department' | 'self'
export type ResearchWorkType = 'journal_paper' | 'conference_paper' | 'book' | 'book_chapter' | 'patent' | 'software' | 'other'

// --- Common Objects ---
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

// --- Auth & Permissions ---
export interface AuthUser {
  id: ID
  username: string
  email: string
  fullName: string
  unitId: ID | null
}

export interface UserScope {
  scopeType: ScopeType; 
  unitId: ID | null
}

export interface ResourceScope {
  resourceType: string
  resourceId: ID
  ownerId: ID | null
  unitId: ID | null
}

// --- Workflow ---
export interface WorkflowInitPayload {
  definitionCode: string
  resourceType: string
  resourceId: ID
  initiatedBy: ID
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

// --- System ---
export interface NotificationPayload {
  templateCode: string
  recipientId: ID
  resourceType?: string
  resourceId?: ID
  payload: Record<string, unknown>
  scheduledAt?: Date
}

export interface AuditLogData {
  actorId: ID | null
  action: string
  resourceType: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  actorIp?: string
  userAgent?: string
  method?: string
  path?: string
  statusCode?: number
  requestId?: string
}

// --- Profile & History ---
export interface AddressInfo {
  province?: string
  district?: string
  ward?: string
  detail?: string
}

export interface EducationHistoryInput {
  profileId: ID
  eduType: EduType
  fromDate?: string | Date
  toDate?: string | Date
  degreeLevel?: string
  institution?: string
  major?: string
  trainingForm?: string
  field?: string
  isStudying?: boolean
  certName?: string
  langName?: string
  langLevel?: LangLevel
}

export interface FamilyRelationInput {
  profileId: ID
  side: string
  relationship: string
  fullName: string
  birthYear?: number
  description?: string
  status?: CommonStatus
}

export interface HealthRecordInput {
  profileId: ID
  healthStatus?: string
  weightKg?: string | number
  heightCm?: string | number
  bloodType?: string
  notes?: string
}
