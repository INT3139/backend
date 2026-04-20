import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, createPaginatedResponse, PaginationQuerySchema, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const AdminUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  unitId: z.number().int().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

export const AdminRoleSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const AdminUnitSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  unitType: z.enum(['school', 'faculty', 'department', 'lab']),
  parentId: z.number().int().nullable(),
});

export const AuditLogSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().nullable(),
  eventType: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  eventTime: z.date(),
  clientIp: z.string().nullable(),
  details: z.record(z.any()).nullable(),
});

export const SchedulerJobSchema = z.object({
  name: z.string(),
  nextRun: z.string().optional(),
  lastRun: z.string().optional(),
  status: z.string().optional(),
});

// --- CONTRACT ---

export const adminContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',
    query: PaginationQuerySchema,
    responses: { 
      200: createPaginatedResponse(AdminUserSchema) 
    },
    summary: 'Get list of users',
  },
  createUser: {
    method: 'POST',
    path: '/users',
    body: z.object({
      username: z.string().min(3),
      email: z.string().email(),
      fullName: z.string(),
      password: z.string().min(6),
      unitId: z.number().int().optional(),
    }),
    responses: { 201: createApiResponse(AdminUserSchema) },
    summary: 'Create new user',
  },
  updateUser: {
    method: 'PUT',
    path: '/users/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      fullName: z.string().optional(),
      unitId: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }),
    responses: { 200: createApiResponse(AdminUserSchema) },
    summary: 'Update user',
  },
  deleteUser: {
    method: 'DELETE',
    path: '/users/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete user',
  },
  assignRole: {
    method: 'POST',
    path: '/users/:id/roles',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      roleId: z.number().int(),
      scopeType: z.enum(['school', 'faculty', 'department', 'self']).optional(),
      scopeUnitId: z.number().int().optional().nullable(),
      expiresAt: z.string().optional(),
    }),
    responses: { 200: ApiMessageResponse },
    summary: 'Assign role to user',
  },
  revokeRole: {
    method: 'DELETE',
    path: '/users/:id/roles/:roleId',
    pathParams: z.object({ id: z.coerce.number(), roleId: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Revoke role from user',
  },
  getRoles: {
    method: 'GET',
    path: '/roles',
    responses: { 200: createApiResponse(z.array(AdminRoleSchema)) },
    summary: 'Get all roles',
  },
  getUnits: {
    method: 'GET',
    path: '/units',
    responses: { 200: createApiResponse(z.array(AdminUnitSchema)) },
    summary: 'Get all units',
  },
  getAuditLogs: {
    method: 'GET',
    path: '/audit-logs',
    query: PaginationQuerySchema,
    responses: { 200: createPaginatedResponse(AuditLogSchema) },
    summary: 'Get audit logs',
  },
  getPermissions: {
    method: 'GET',
    path: '/permissions',
    responses: { 
      200: createApiResponse(z.array(z.object({
        id: z.number(),
        code: z.string(),
        name: z.string(),
      }))) 
    },
    summary: 'Get all permissions',
  },
  getSchedulerJobs: {
    method: 'GET',
    path: '/scheduler/jobs',
    responses: { 200: createApiResponse(z.array(SchedulerJobSchema)) },
    summary: 'Get all scheduler jobs',
  },
  triggerJob: {
    method: 'POST',
    path: '/scheduler/jobs/:name/trigger',
    pathParams: z.object({ name: z.string() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Trigger a scheduler job',
  },
}, {
  pathPrefix: '/admin'
});
