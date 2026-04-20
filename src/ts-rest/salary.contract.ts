import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const SalaryInfoSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  occupationGroup: z.string().nullable(),
  occupationTitle: z.string().nullable(),
  occupationCode: z.string().nullable(),
  salaryGrade: z.number().int().nullable(),
  salaryCoefficient: z.number().nullable(),
  isOverGrade: z.boolean().nullable(),
  effectiveDate: z.date().nullable(),
  decisionNumber: z.string().nullable(),
  positionAllowance: z.number().nullable(),
  responsibilityAllowance: z.number().nullable(),
  teacherIncentivePct: z.number().nullable(),
  regionalAllowance: z.number().nullable(),
  otherAllowance: z.number().nullable(),
  harmfulAllowance: z.number().nullable(),
  seniorityAllowancePct: z.number().nullable(),
  enjoymentRatePct: z.number().nullable(),
  actualCoefficient: z.number().nullable(),
  nextGradeDate: z.date().nullable(),
  nextSeniorityDate: z.date().nullable(),
  updatedAt: z.date(),
});

export const SalaryUpgradeProposalSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  currentGrade: z.number().int().nullable(),
  currentCoefficient: z.number().nullable(),
  proposedGrade: z.number().int(),
  proposedCoefficient: z.number(),
  proposedNextDate: z.date(),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.date(),
});

// --- CONTRACT ---

export const salaryContract = c.router({
  getMySalary: {
    method: 'GET',
    path: '/me',
    responses: { 200: createApiResponse(SalaryInfoSchema) },
    summary: "Get current user's salary info",
  },
  getSalaryByProfileId: {
    method: 'GET',
    path: '/info/:profileId',
    pathParams: z.object({ profileId: z.coerce.number() }),
    responses: { 200: createApiResponse(SalaryInfoSchema) },
    summary: 'Get salary info by profile ID',
  },
  updateSalary: {
    method: 'PUT',
    path: '/info/:profileId',
    pathParams: z.object({ profileId: z.coerce.number() }),
    body: z.any(),
    responses: { 200: ApiMessageResponse },
    summary: 'Update salary info',
  },
  getProposals: {
    method: 'GET',
    path: '/proposals',
    query: PaginationQuerySchema.extend({
      status: z.string().optional(),
    }),
    responses: { 200: createPaginatedResponse(SalaryUpgradeProposalSchema) },
    summary: 'Get salary upgrade proposals',
  },
  createProposal: {
    method: 'POST',
    path: '/proposals',
    body: z.object({
      profileId: z.number().int(),
      proposedGrade: z.number().int(),
      proposedCoefficient: z.number(),
      proposedNextDate: z.string(),
    }),
    responses: { 201: ApiMessageResponse },
    summary: 'Create salary upgrade proposal',
  },
  getMyTasks: {
    method: 'GET',
    path: '/tasks',
    responses: { 200: createApiResponse(z.array(z.any())) },
    summary: 'Get pending salary workflow tasks for current user',
  },
  processTask: {
    method: 'POST',
    path: '/tasks/:instanceId',
    pathParams: z.object({ instanceId: z.coerce.number() }),
    body: z.object({
      action: z.enum(['approve', 'reject', 'request_revision', 'forward']),
      comment: z.string().optional(),
    }),
    responses: { 200: ApiMessageResponse },
    summary: 'Process a salary workflow task',
  },
  exportSalaryHistory: {
    method: 'GET',
    path: '/export/:profileId',
    pathParams: z.object({ profileId: z.coerce.number() }),
    responses: { 200: createApiResponse(z.object({ downloadUrl: z.string() })) },
    summary: 'Export salary history',
  },
}, {
  pathPrefix: '/salary'
});
