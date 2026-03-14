import { Request, Response, NextFunction } from 'express'
import { logger } from '@/configs/logger'
import { db } from '@/configs/db'
import { sysAuditLogs } from '@/db/schema/system'

export function auditContext(req: Request, res: Response, next: NextFunction): void {
  if (req.userId) (res.locals as any).actorId = req.userId
  next()
}

export async function logAction(actorId: number|null, action: string, resourceType: string, resourceId?: string, meta?: Record<string, unknown>, ip?: string): Promise<void> {
  try {
    await db.insert(sysAuditLogs).values({
      actorId: actorId as any,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      newValues: meta,
      actorIp: ip as any
    })
  } catch (err) { logger.error('Audit log failed', { err }) }
}
