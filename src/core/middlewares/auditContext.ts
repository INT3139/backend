import { Request, Response, NextFunction } from 'express'
import { logger } from '@/configs/logger'
import { db } from '@/configs/db'
import { sysAuditLogs } from '@/db/schema/system'
import { calculateDiff } from '@/utils/diff'

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
  meta?: {
    oldValues?: any;
    newValues?: any;
    tableName?: string;
    schemaName?: string;
    statusCode?: number;
    [key: string]: any;
  }, 
  reqOrIp?: Request | string
): Promise<void> {
  try {
    const oldValues = meta?.oldValues || null
    const newValues = meta?.newValues || (meta && !meta.oldValues ? meta : null)
    
    let auditData: any = {
      actorId: actorId as any,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      oldValues,
      newValues,
      diff: calculateDiff(oldValues, newValues),
      tableName: meta?.tableName,
      schemaName: meta?.schemaName || 'public',
      statusCode: meta?.statusCode || 200,
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
      // Nếu không truyền statusCode thủ công, thử lấy từ res (nếu có cách truy cập)
    }

    await db.insert(sysAuditLogs).values(auditData)
  } catch (err) { 
    logger.error('Audit log failed', { err }) 
  }
}
