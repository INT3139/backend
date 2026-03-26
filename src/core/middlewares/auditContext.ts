import { Request, Response, NextFunction } from 'express'
import { logger } from '@/configs/logger'
import { db } from '@/configs/db'
import { sysAuditLogs } from '@/db/schema/system'

export function auditContext(req: Request, res: Response, next: NextFunction): void {
  // Capture request metadata for later logging
  (res.locals as any).auditInfo = {
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path,
    requestId: req.headers['x-request-id'] || (req as any).id
  }
  
  if (req.userId) (res.locals as any).actorId = req.userId
  next()
}

export async function logAction(
  actorId: number | null, 
  action: string, 
  resourceType: string, 
  resourceId?: string, 
  meta?: Record<string, unknown>, 
  reqOrIp?: Request | string
): Promise<void> {
  try {
    let auditData: any = {
      actorId: actorId as any,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      newValues: meta,
    }

    if (typeof reqOrIp === 'string') {
      auditData.actorIp = reqOrIp
    } else if (reqOrIp && (reqOrIp as Request).ip) {
      const req = reqOrIp as Request
      auditData.actorIp = req.ip || req.socket.remoteAddress
      auditData.userAgent = req.get('User-Agent')
      auditData.method = req.method
      auditData.path = req.path
      auditData.requestId = req.headers['x-request-id'] || (req as any).id
    }

    await db.insert(sysAuditLogs).values(auditData)
  } catch (err) { 
    logger.error('Audit log failed', { err }) 
  }
}
