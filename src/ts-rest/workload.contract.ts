import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const WorkloadEvidenceSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  academicYear: z.string(),
  evidenceType: z.enum(['teaching', 'research_paper', 'research_project', 'other_task']),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']),
  reviewedBy: z.number().int().nullable(),
  reviewedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const WorkloadSummarySchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  academicYear: z.string(),
  teachingHours: z.number(),
  researchHours: z.number(),
  otherHours: z.number(),
  totalHours: z.number(),
  status: z.string().nullable(),
});

// --- CONTRACT ---

export const workloadContract = c.router({
  getMyWorkload: {
    method: 'GET',
    path: '/me',
    query: z.object({ academicYear: z.string().optional() }),
    responses: { 
      200: createApiResponse(z.object({
        quota: z.any(),
        summary: WorkloadSummarySchema.nullable(),
        evidences: z.array(WorkloadEvidenceSchema),
      })) 
    },
    summary: "Get current user's workload info",
  },
  createEvidence: {
    method: 'POST',
    path: '/evidences',
    body: z.object({
      academicYear: z.string(),
      evidenceType: z.enum(['teaching', 'research_paper', 'research_project', 'other_task']),
      title: z.string(),
      description: z.string().optional(),
      hours: z.number().optional(),
    }),
    responses: { 201: createApiResponse(WorkloadEvidenceSchema) },
    summary: 'Create workload evidence',
  },
  getEvidences: {
    method: 'GET',
    path: '/evidences',
    query: PaginationQuerySchema.extend({ status: z.string().optional() }),
    responses: { 200: createPaginatedResponse(WorkloadEvidenceSchema) },
    summary: 'Get workload evidences for review',
  },
  approveEvidence: {
    method: 'POST',
    path: '/evidences/:id/approve',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Approve workload evidence',
  },
  rejectEvidence: {
    method: 'POST',
    path: '/evidences/:id/reject',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({ rejectReason: z.string() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Reject workload evidence',
  },
  getSummaries: {
    method: 'GET',
    path: '/summaries',
    query: z.object({ academicYear: z.string().optional() }),
    responses: { 200: createPaginatedResponse(WorkloadSummarySchema) },
    summary: 'Get workload summaries',
  },
}, {
  pathPrefix: '/workload'
});
