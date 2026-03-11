import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from './errorHandler'
import { permissionService } from '../permissions/permission.service'
import { abacService } from '../permissions/abac';

export const requireResource = (perm: string, type: string, getId: (r: Request) => string) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError()
      if (!(await permissionService.hasPermission(req.userId, perm))) throw new ForbiddenError(`Missing: ${perm}`)
      const scopes = await permissionService.getScopesForUser(req.userId)
      if (!(await abacService.canAccess(scopes, type, getId(req)))) throw new ForbiddenError('Access denied')
      next()
    } catch (e) { next(e) }
  }

export const requireSelfOrPermission = (perm: string, getOwner: (r: Request) => Promise<string>) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError()
      if (req.userId === await getOwner(req)) return next()
      if (!(await permissionService.hasPermission(req.userId, perm))) throw new ForbiddenError(`Missing: ${perm}`)
      next()
    } catch (e) { next(e) }
  }
