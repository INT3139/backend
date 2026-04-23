import { Request, Response, NextFunction } from 'express'
import { db } from '@/configs/db'
import { users, roles, userRoles } from '@/db/schema/auth'
import { eq, and, isNull } from 'drizzle-orm'
import { verifyToken } from '../auth/jwt'
import { UnauthorizedError } from './errorHandler'
import { AuthUser } from '@/types'

export async function authenticate(req: Request, _: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided')
    
    const payload = verifyToken(header.slice(7))
    const [row] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        unitId: users.unitId,
        isActive: users.isActive
    })
    .from(users)
    .where(and(eq(users.id, payload.sub as any), isNull(users.deletedAt)))
    .limit(1)

    if (!row || !row.isActive) throw new UnauthorizedError('Account inactive')
        
    const user: AuthUser = { 
        id: row.id, 
        username: row.username, 
        email: row.email, 
        fullName: row.fullName, 
        unitId: row.unitId,
        port: payload.port,
        activeRoles: payload.activeRoles
    }

    req.user   = user
    req.userId = row.id
    next()
  } catch (err) {
    next(err instanceof UnauthorizedError ? err : new UnauthorizedError('Invalid token'))
  }
}

export async function authenticateOptional(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.headers.authorization) return next()
  await authenticate(req, res, next)
}
