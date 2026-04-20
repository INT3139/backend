import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const RecruitmentProposalSchema = z.object({
  id: z.number().int(),
  proposingUnit: z.number().int(),
  positionName: z.string(),
  academicYear: z.string(),
  quantity: z.number().int().nullable(),
  status: z.enum(['draft', 'submitted', 'processing', 'approved', 'rejected']),
  reason: z.string().nullable(),
  createdAt: z.date(),
});

export const CandidateSchema = z.object({
  id: z.number().int(),
  proposalId: z.number().int(),
  fullName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  status: z.enum(['pending', 'interviewing', 'accepted', 'rejected', 'hired']),
  createdAt: z.date(),
});

// --- CONTRACT ---

export const recruitmentContract = c.router({
  getProposals: {
    method: 'GET',
    path: '/proposals',
    query: PaginationQuerySchema.extend({
      unitId: z.coerce.number().optional(),
      status: z.string().optional(),
    }),
    responses: { 
      200: createPaginatedResponse(RecruitmentProposalSchema) 
    },
    summary: 'Get recruitment proposals',
  },
  getProposalById: {
    method: 'GET',
    path: '/proposals/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(RecruitmentProposalSchema) },
    summary: 'Get proposal by ID',
  },
  createProposal: {
    method: 'POST',
    path: '/proposals',
    body: z.object({
      proposingUnit: z.number().int(),
      positionName: z.string(),
      academicYear: z.string(),
      quota: z.number().int().optional(),
      reason: z.string().optional(),
    }),
    responses: { 201: createApiResponse(RecruitmentProposalSchema) },
    summary: 'Create recruitment proposal',
  },
  updateProposal: {
    method: 'PUT',
    path: '/proposals/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      positionName: z.string().optional(),
      quantity: z.number().int().optional(),
      reason: z.string().optional(),
    }),
    responses: { 200: createApiResponse(RecruitmentProposalSchema) },
    summary: 'Update recruitment proposal',
  },
  getMyTasks: {
    method: 'GET',
    path: '/tasks',
    responses: { 200: createApiResponse(z.array(z.any())) },
    summary: 'Get pending recruitment workflow tasks for current user',
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
    summary: 'Process a recruitment workflow task',
  },
  getCandidates: {
    method: 'GET',
    path: '/proposals/:id/candidates',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(z.array(CandidateSchema)) },
    summary: 'Get candidates for proposal',
  },
  getMyRecruitment: {
    method: 'GET',
    path: '/me',
    responses: { 200: createApiResponse(z.any()) },
    summary: "Get current user's recruitment info and contracts",
  },
  getRecruitmentByProfileId: {
    method: 'GET',
    path: '/info/:profileId',
    pathParams: z.object({ profileId: z.coerce.number() }),
    responses: { 200: createApiResponse(z.any()) },
    summary: 'Get recruitment info and contracts by profile ID',
  },
  createCandidate: {
    method: 'POST',
    path: '/candidates',
    body: z.object({
      proposalId: z.number().int(),
      fullName: z.string(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
    }),
    responses: { 201: createApiResponse(CandidateSchema) },
    summary: 'Create recruitment candidate',
  },
  updateCandidate: {
    method: 'PUT',
    path: '/candidates/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      fullName: z.string().optional(),
      status: z.enum(['pending', 'interviewing', 'accepted', 'rejected', 'hired']).optional(),
    }),
    responses: { 200: createApiResponse(CandidateSchema) },
    summary: 'Update recruitment candidate',
  },
  deleteCandidate: {
    method: 'DELETE',
    path: '/candidates/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete recruitment candidate',
  },
}, {
  pathPrefix: '/recruitment'
});
