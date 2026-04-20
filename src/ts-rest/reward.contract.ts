import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const CommendationSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  awardLevel: z.enum(['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']),
  awardName: z.string(),
  decisionNumber: z.string().nullable(),
  decisionDate: z.date().nullable(),
  academicYear: z.string().nullable(),
  createdAt: z.date(),
});

export const RewardTitleSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  titleName: z.string(),
  titleLevel: z.enum(['unit', 'university', 'ministry']),
  awardedYear: z.string(),
  decisionNumber: z.string().nullable(),
  createdAt: z.date(),
});

export const DisciplineSchema = z.object({
  id: z.number().int(),
  profileId: z.number().int(),
  disciplineType: z.string(),
  reason: z.string(),
  decisionNumber: z.string().nullable(),
  unitName: z.string().nullable(),
  issuedDate: z.date(),
  createdAt: z.date(),
});

// --- CONTRACT ---

export const rewardContract = c.router({
  getMyRewards: {
    method: 'GET',
    path: '/me',
    responses: { 
      200: createApiResponse(z.object({
        commendations: z.array(CommendationSchema),
        titles: z.array(RewardTitleSchema),
        discipline: z.array(DisciplineSchema),
      })) 
    },
    summary: "Get current user's rewards",
  },
  getCommendations: {
    method: 'GET',
    path: '/commendations',
    query: PaginationQuerySchema.extend({
      academicYear: z.string().optional(),
    }),
    responses: { 200: createPaginatedResponse(CommendationSchema) },
    summary: 'Get all commendations',
  },
  createCommendation: {
    method: 'POST',
    path: '/commendations',
    body: z.object({
      profileId: z.number().int().positive(),
      decisionNumber: z.string().optional(),
      decisionDate: z.string().optional(),
      awardLevel: z.enum(['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']),
      awardName: z.string().min(1),
      academicYear: z.string().optional(),
    }),
    responses: { 201: createApiResponse(CommendationSchema) },
    summary: 'Create commendation',
  },
  updateCommendation: {
    method: 'PUT',
    path: '/commendations/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      awardName: z.string().optional(),
      awardLevel: z.string().optional(),
      decisionNumber: z.string().optional(),
    }),
    responses: { 200: createApiResponse(CommendationSchema) },
    summary: 'Update commendation',
  },
  deleteCommendation: {
    method: 'DELETE',
    path: '/commendations/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete commendation',
  },
  uploadCommendationAttachment: {
    method: 'POST',
    path: '/commendations/:id/attachments',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any(),
    responses: { 201: ApiMessageResponse },
    summary: 'Upload attachment for commendation',
  },
  getTitles: {
    method: 'GET',
    path: '/titles',
    query: PaginationQuerySchema,
    responses: { 200: createPaginatedResponse(RewardTitleSchema) },
    summary: 'Get all titles',
  },
  createTitle: {
    method: 'POST',
    path: '/titles',
    body: z.object({
      profileId: z.number().int(),
      titleName: z.string(),
      titleLevel: z.enum(['unit', 'university', 'ministry']),
      awardedYear: z.string(),
    }),
    responses: { 201: createApiResponse(RewardTitleSchema) },
    summary: 'Create title',
  },
  getDisciplinaryRecords: {
    method: 'GET',
    path: '/discipline',
    responses: { 200: createPaginatedResponse(DisciplineSchema) },
    summary: 'Get all disciplinary records',
  },
  createDiscipline: {
    method: 'POST',
    path: '/discipline',
    body: z.object({
      profileId: z.number().int(),
      disciplineType: z.string(),
      reason: z.string(),
      unitName: z.string().optional(),
      issuedDate: z.string(),
    }),
    responses: { 200: createApiResponse(DisciplineSchema) },
    summary: 'Create disciplinary record',
  },
  updateDiscipline: {
    method: 'PUT',
    path: '/discipline/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      reason: z.string().optional(),
    }),
    responses: { 200: createApiResponse(DisciplineSchema) },
    summary: 'Update disciplinary record',
  },
  deleteDiscipline: {
    method: 'DELETE',
    path: '/discipline/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete disciplinary record',
  },
  exportRewards: {
    method: 'GET',
    path: '/export',
    responses: { 200: createApiResponse(z.object({ downloadUrl: z.string() })) },
    summary: 'Export rewards and disciplinary records',
  },
}, {
  pathPrefix: '/reward'
});
