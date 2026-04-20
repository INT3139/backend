import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const ProfileSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  unitId: z.number().int(),
  emailVnu: z.string().email().optional(),
  emailPersonal: z.string().email().optional(),
  phoneWork: z.string().optional(),
  phoneHome: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(),
  idNumber: z.string().optional(),
  idIssuedDate: z.date().optional(),
  idIssuedBy: z.string().optional(),
  nationality: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  maritalStatus: z.string().optional(),
  policyObject: z.string().optional(),
  nickName: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssuedAt: z.date().optional(),
  passportIssuedBy: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceJoinedAt: z.date().optional(),
  addrHometown: z.record(z.any()).optional(),
  addrBirthplace: z.record(z.any()).optional(),
  addrPermanent: z.record(z.any()).optional(),
  addrCurrent: z.record(z.any()).optional(),
  academicDegree: z.string().optional(),
  academicTitle: z.string().optional(),
  eduLevelGeneral: z.string().optional(),
  stateManagement: z.string().optional(),
  politicalTheory: z.string().optional(),
  foreignLangLevel: z.string().optional(),
  itLevel: z.string().optional(),
  staffType: z.string().optional(),
  employmentStatus: z.string().optional(),
  joinDate: z.date().optional(),
  retireDate: z.date().optional(),
  profileStatus: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarDefault: z.boolean().optional(),
  note: z.string().optional(),
  origin: z.string().optional()
});

export const EducationSchema = z.object({
  id: z.number().int().optional(),
  eduType: z.enum(['degree', 'certificate', 'foreign_lang', 'it']),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  degreeLevel: z.string().optional(),
  institution: z.string().optional(),
  major: z.string().optional(),
  trainingForm: z.string().optional(),
  field: z.string().optional(),
  isStudying: z.boolean().optional(),
  certName: z.string().optional(),
  langName: z.string().optional(),
  langLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional()
});

export const FamilySchema = z.object({
  id: z.number().int().optional(),
  side: z.enum(['self', 'spouse']),
  relationship: z.string(),
  fullName: z.string(),
  birthYear: z.number().int().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

export const WorkHistorySchema = z.object({
  id: z.number().int().optional(),
  historyType: z.enum(['chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri']),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  unitName: z.string(),
  positionName: z.string().optional(),
  activityType: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

export const ExtraInfoSchema = z.object({
  arrestHistory: z.string().optional(),
  oldRegimeWork: z.string().optional(),
  foreignOrgRelations: z.string().optional(),
  foreignRelatives: z.string().optional(),
  incomeSalary: z.number().optional(),
  incomeOtherSources: z.number().optional(),
  houseTypeGranted: z.string().optional(),
  houseAreaGranted: z.number().optional(),
  houseTypeOwned: z.string().optional(),
  houseAreaOwned: z.number().optional(),
  landGrantedM2: z.number().optional(),
  landPurchasedM2: z.number().optional(),
  landBusinessM2: z.number().optional()
});

export const HealthSchema = z.object({
  healthStatus: z.string().optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  bloodType: z.string().optional(),
  notes: z.string().optional()
});

export const PositionSchema = z.object({
  id: z.number().int().optional(),
  unitId: z.number().int().optional(),
  positionName: z.string(),
  positionType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  decisionRef: z.string().optional(),
  isPrimary: z.boolean().optional()
});

const ResearchWorkBaseSchema = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  publishYear: z.number().int().optional(),
  academicYear: z.string().optional(),
  projectCode: z.string().optional(),
  journalName: z.string().optional(),
  indexing: z.string().optional(),
  doi: z.string().optional(),
});

export const ResearchWorkSchema = z.discriminatedUnion('workType', [
  ResearchWorkBaseSchema.extend({ workType: z.literal('research_project'), extra: z.object({ host_org: z.string(), level: z.string() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('book'), extra: z.object({ publisher: z.string(), pub_date: z.string().optional(), isbn: z.string().optional() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('training_product'), extra: z.object({ student_name: z.string(), degree_level: z.string(), thesis_type: z.string().optional() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('research_product'), extra: z.object({ product_type: z.string(), level: z.string().optional(), application: z.string().optional() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('patent'), extra: z.object({ application_number: z.string().optional(), granted_number: z.string().optional(), country: z.string().optional() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('journal_paper'), extra: z.object({}).strict() }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('conference_paper'), extra: z.object({}).strict() }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('book_chapter'), extra: z.object({ book_title: z.string(), editors: z.string().optional(), pages: z.string().optional() }) }),
  ResearchWorkBaseSchema.extend({ workType: z.literal('other'), extra: z.record(z.any()) }),
]);

// --- CONTRACT ---

export const profileContract = c.router({
  getMyProfile: {
    method: 'GET',
    path: '/me',
    responses: { 200: createApiResponse(ProfileSchema) },
    summary: 'Get current user profile',
  },
  getProfiles: {
    method: 'GET',
    path: '/',
    query: PaginationQuerySchema,
    responses: { 200: createPaginatedResponse(ProfileSchema) },
    summary: 'Get all profiles',
  },
  getProfileById: {
    method: 'GET',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(ProfileSchema) },
    summary: 'Get profile by ID',
  },
  createProfile: {
    method: 'POST',
    path: '/',
    body: ProfileSchema.omit({ id: true }),
    responses: { 201: createApiResponse(ProfileSchema) },
    summary: 'Create new profile',
  },
  updateProfile: {
    method: 'PUT',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: ProfileSchema.partial(),
    responses: { 200: createApiResponse(ProfileSchema) },
    summary: 'Update profile',
  },
  partialUpdateProfile: {
    method: 'PATCH',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: ProfileSchema.partial(),
    responses: { 200: createApiResponse(ProfileSchema) },
    summary: 'Partial update profile',
  },
  removeAvatar: {
    method: 'DELETE',
    path: '/:id/avatar',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Remove profile avatar',
  },
  deleteProfile: {
    method: 'DELETE',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete profile',
  },
  approveProfile: {
    method: 'POST',
    path: '/:id/approve',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Approve profile',
  },
  changeStatus: {
    method: 'PATCH',
    path: '/:id/status',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({ status: z.string() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Change employment status',
  },
  getEducation: {
    method: 'GET',
    path: '/:id/education',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(z.array(EducationSchema)) },
    summary: 'Get education history',
  },
  addEducation: {
    method: 'POST',
    path: '/:id/education',
    pathParams: z.object({ id: z.coerce.number() }),
    body: EducationSchema.omit({ id: true }),
    responses: { 201: createApiResponse(EducationSchema) },
    summary: 'Add education record',
  },
  getFamily: {
    method: 'GET',
    path: '/:id/family',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(z.array(FamilySchema)) },
    summary: 'Get family relations',
  },
  addFamily: {
    method: 'POST',
    path: '/:id/family',
    pathParams: z.object({ id: z.coerce.number() }),
    body: FamilySchema.omit({ id: true }),
    responses: { 201: createApiResponse(FamilySchema) },
    summary: 'Add family record',
  },
  getWorkHistory: {
    method: 'GET',
    path: '/:id/work-history',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(z.array(WorkHistorySchema)) },
    summary: 'Get work history',
  },
  addWorkHistory: {
    method: 'POST',
    path: '/:id/work-history',
    pathParams: z.object({ id: z.coerce.number() }),
    body: WorkHistorySchema.omit({ id: true }),
    responses: { 201: createApiResponse(WorkHistorySchema) },
    summary: 'Add work history record',
  },
  getExtraInfo: {
    method: 'GET',
    path: '/:id/extra',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(ExtraInfoSchema) },
    summary: 'Get extra info',
  },
  getHealth: {
    method: 'GET',
    path: '/:id/health',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(HealthSchema) },
    summary: 'Get health records',
  },
  getPositions: {
    method: 'GET',
    path: '/:id/positions',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(z.array(PositionSchema)) },
    summary: 'Get position history',
  },
  getResearchWorks: {
    method: 'GET',
    path: '/:id/research-works',
    pathParams: z.object({ id: z.coerce.number() }),
    query: z.object({
      type: z.string().optional(),
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    }),
    responses: { 
      200: createApiResponse(z.object({
        data: z.array(ResearchWorkSchema),
        summary: z.array(z.object({ type: z.string(), count: z.number() })),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number(),
        })
      })) 
    },
    summary: 'Get research works',
  },
}, {
  pathPrefix: '/profiles'
});
