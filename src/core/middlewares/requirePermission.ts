import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from './errorHandler'
import { permissionService } from '../permissions/permission.service'

export const requirePermission = (code: string) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError()
      if (!(await permissionService.hasPermission(req.userId as number, code))) throw new ForbiddenError(`Missing: ${code}`)
      next()
    } catch (e) { next(e) }
  }

export const requireAnyPermission = (...codes: string[]) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError()
      const results = await Promise.all(codes.map(c => permissionService.hasPermission(req.userId as number, c)))
      if (!results.some(Boolean)) throw new ForbiddenError(`Missing one of: ${codes.join(', ')}`)
      next()
    } catch (e) { next(e) }
  }

export const requireAllPermissions = (...codes: string[]) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError()
      const results = await Promise.all(codes.map(c => permissionService.hasPermission(req.userId as number, c)))
      if (!results.every(Boolean)) throw new ForbiddenError(`Missing all of: ${codes.join(', ')}`)
      next()
    } catch (e) { next(e) }
  }
