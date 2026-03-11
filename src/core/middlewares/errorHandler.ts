import { logger } from "@/configs/logger";
import { HTTP } from "@/constants/httpStatus";
import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code?: string) {
    super(message); this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
export class NotFoundError     extends AppError { constructor(r = 'Resource') { super(`${r} not found`, HTTP.NOT_FOUND) } }
export class ForbiddenError    extends AppError { constructor(m = 'Forbidden') { super(m, HTTP.FORBIDDEN) } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized') { super(m, HTTP.UNAUTHORIZED) } }
export class ConflictError     extends AppError { constructor(m: string) { super(m, HTTP.CONFLICT) } }
export class ValidationError   extends AppError {
  constructor(message: string, public fields?: Record<string, unknown>) { super(message, HTTP.BAD_REQUEST) }
}

export function errorHandler(err: Error, req: Request, res: Response, _: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: { message: err.message, code: err.code, ...(err instanceof ValidationError && err.fields ? { fields: err.fields } : {}) } })
    return
  }
  logger.error('Unhandled error', { err, path: req.path, requestId: req.requestId })
  res.status(HTTP.INTERNAL_SERVER_ERROR).json({ success: false, error: { message: 'Internal server error' } })
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => { Promise.resolve(fn(req, res, next)).catch(next) }
}
