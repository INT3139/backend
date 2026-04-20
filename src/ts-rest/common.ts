import { z } from 'zod';

export const createApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
  });

export const ApiMessageResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const createPaginatedResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
