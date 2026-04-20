import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, ApiMessageResponse } from './common';

const c = initContract();

// --- SCHEMAS ---

export const AttachmentSchema = z.object({
  id: z.number().int(),
  fileName: z.string(),
  fileSize: z.number().int(),
  mimeType: z.string(),
  s3Key: z.string(),
  resourceType: z.string().nullable(),
  resourceId: z.number().int().nullable(),
  uploadedBy: z.number().int(),
  createdAt: z.date(),
});

export const AttachmentUploadResponseSchema = z.object({
  id: z.number().int(),
  fileName: z.string(),
  url: z.string(),
});

// --- CONTRACT ---

export const attachmentContract = c.router({
  uploadAttachment: {
    method: 'POST',
    path: '/',
    body: z.any(), // handled by multer
    responses: { 
      201: createApiResponse(AttachmentUploadResponseSchema) 
    },
    summary: 'Upload file',
  },
  downloadAttachment: {
    method: 'GET',
    path: '/:id/download',
    pathParams: z.object({ id: z.coerce.number() }),
    responses: { 
      200: createApiResponse(z.object({ downloadUrl: z.string() })) 
    },
    summary: 'Get download URL',
  },
  deleteAttachment: {
    method: 'DELETE',
    path: '/:id',
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.any().optional(),
    responses: { 200: ApiMessageResponse },
    summary: 'Delete file',
  },
  listAttachments: {
    method: 'GET',
    path: '/',
    query: z.object({
      resourceType: z.string().optional(),
      resourceId: z.coerce.number().optional(),
    }),
    responses: { 200: createApiResponse(z.array(AttachmentSchema)) },
    summary: 'List files for resource',
  },
}, {
  pathPrefix: '/attachments'
});
