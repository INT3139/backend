import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from '@/core/middlewares/errorHandler';

export const validateBody   = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => { const r = s.safeParse(req.body);   if (!r.success) throw new ValidationError('Invalid body',   r.error.flatten().fieldErrors as any); req.body = r.data; next() }
export const validateQuery  = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => { const r = s.safeParse(req.query);  if (!r.success) throw new ValidationError('Invalid query',  r.error.flatten().fieldErrors as any); req.query = r.data as any; next() }
export const validateParams = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => { const r = s.safeParse(req.params); if (!r.success) throw new ValidationError('Invalid params', r.error.flatten().fieldErrors as any); next() }

export function validateUUID(id: unknown, field = 'id'): string {
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id
  throw new ValidationError(`${field} must be a valid UUID`)
}
