import { Request, Response, NextFunction } from 'express'
import { queryOne } from '@/configs/db'
import { verifyToken } from '../auth/jwt'
import { UnauthorizedError } from './errorHandler'

export async function authenticate(req: Request, _: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided')
    
    const payload = verifyToken(header.slice(7))
    const row = await queryOne<any>(
        'SELECT id,username,email,full_name,unit_id,is_active FROM users WHERE id=$1 AND deleted_at IS NULL', 
        [payload.sub]
    )
    if (!row || !row.is_active) throw new UnauthorizedError('Account inactive')
        
    req.user   = { id: row.id, username: row.username, email: row.email, fullName: row.full_name, unitId: row.unit_id }
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
