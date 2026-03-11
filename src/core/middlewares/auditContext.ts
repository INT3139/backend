import { Request, Response, NextFunction } from 'express'
import { logger } from '@/configs/logger'
import { query } from '@/configs/db'

export function auditContext(req: Request, res: Response, next: NextFunction): void {
  if (req.userId) (res.locals as any).actorId = req.userId
  next()
}

export async function logAction(actorId: string|null, action: string, resourceType: string, resourceId?: string, meta?: Record<string, unknown>, ip?: string): Promise<void> {
  try {
    await query(`INSERT INTO sys_audit_logs (actor_id,action,resource_type,resource_id,new_values,actor_ip) VALUES ($1,$2,$3,$4,$5::jsonb,$6::inet)`,
      [actorId, action, resourceType, resourceId ?? null, meta ? JSON.stringify(meta) : null, ip ?? null])
  } catch (err) { logger.error('Audit log failed', { err }) }
}
