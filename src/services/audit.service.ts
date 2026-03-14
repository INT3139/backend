import { db } from '@/configs/db'
import { sysAuditLogs } from '@/db/schema/system'
import { eq, and, desc } from 'drizzle-orm'
import { AuditLogData, ID } from '@/types'
import { logger } from '@/configs/logger'

export class AuditService {
  async log(data: AuditLogData): Promise<void> {
    try {
      await db.insert(sysAuditLogs).values({
        actorId: data.actorId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        actorIp: data.actorIp as any
      })
    } catch (err) {
      logger.error('Failed to write audit log', { err, data })
    }
  }

  async getLogs(filter: { resourceType?: string; resourceId?: string; actorId?: ID }, limit = 50, offset = 0) {
    const conditions = []
    if (filter.resourceType) conditions.push(eq(sysAuditLogs.resourceType, filter.resourceType))
    if (filter.resourceId) conditions.push(eq(sysAuditLogs.resourceId, filter.resourceId))
    if (filter.actorId) conditions.push(eq(sysAuditLogs.actorId, filter.actorId))

    return db.select().from(sysAuditLogs)
      .where(and(...conditions))
      .orderBy(desc(sysAuditLogs.eventTime))
      .limit(limit)
      .offset(offset)
  }

  async getResourceHistory(type: string, id: string) {
    return db.select().from(sysAuditLogs)
      .where(and(
        eq(sysAuditLogs.resourceType, type),
        eq(sysAuditLogs.resourceId, id)
      ))
      .orderBy(desc(sysAuditLogs.eventTime))
  }
}

export const auditService = new AuditService()
