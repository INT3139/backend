import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from '@/core/middlewares/errorHandler';
import { ID } from '@/types';

export const validateQuery = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => { const r = s.safeParse(req.query); if (!r.success) throw new ValidationError('Invalid query', r.error.flatten().fieldErrors as any); req.query = r.data as any; next() }
export const validateParams = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => { const r = s.safeParse(req.params); if (!r.success) throw new ValidationError('Invalid params', r.error.flatten().fieldErrors as any); next() }

export function validateID(id: unknown, field = 'id'): ID {
  const num = Number(id)
  if (!isNaN(num) && Number.isInteger(num) && num > 0) return num as ID
  throw new ValidationError(`${field} must be a valid positive integer ID`)
}

export const validateBody = (s: ZodSchema) => (req: Request, _: Response, next: NextFunction) => {
  const r = s.safeParse(req.body)
  if (!r.success) return next(new ValidationError('Invalid body', r.error.flatten().fieldErrors as any))
  req.body = r.data
  next()
}