import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const WorkflowInstanceSchema = z.object({
  id: z.number().int(),
  workflowCode: z.string(),
  resourceType: z.string(),
  resourceId: z.number().int(),
  currentStep: z.number().int(),
  status: z.enum(['active', 'completed', 'cancelled']),
  initiatorId: z.number().int(),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// --- CONTRACT ---

export const workflowContract = c.router({
  getTasks: {
    method: 'GET',
    path: '/tasks',
    responses: { 200: createApiResponse(z.array(z.any())) },
    summary: 'Get pending tasks for current user',
  },
  getStatus: {
    method: 'GET',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 200: createApiResponse(WorkflowInstanceSchema) },
    summary: 'Get workflow status',
  },
  advance: {
    method: 'POST',
    path: '/:id/advance',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      action: z.string(),
      comment: z.string().optional(),
    }),
    responses: { 200: createApiResponse(WorkflowInstanceSchema) },
    summary: 'Advance workflow',
  },
  cancel: {
    method: 'POST',
    path: '/:id/cancel',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({ reason: z.string() }),
    responses: { 200: ApiMessageResponse },
    summary: 'Cancel workflow',
  },
  updateMetadata: {
    method: 'PATCH',
    path: '/:id/metadata',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({ metadata: z.record(z.string(), z.any()) }),
    responses: { 200: ApiMessageResponse },
    summary: 'Update workflow metadata',
  },
  advanceItem: {
    method: 'POST',
    path: '/:id/:key/advance',
    pathParams: z.object({ id: z.coerce.number(), key: z.string() }),
    body: z.object({
      action: z.string().optional(),
      comment: z.string().optional(),
    }),
    responses: { 200: createApiResponse(WorkflowInstanceSchema) },
    summary: 'Advance a specific metadata item',
  },
  cancelItem: {
    method: 'POST',
    path: '/:id/:key/cancel',
    pathParams: z.object({ id: z.coerce.number(), key: z.string() }),
    body: z.object({
      action: z.string().optional(),
      comment: z.string().optional(),
    }),
    responses: { 200: createApiResponse(WorkflowInstanceSchema) },
    summary: 'Cancel/Reject a specific metadata item',
  },
}, {
  pathPrefix: '/workflow'
});
