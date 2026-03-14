import { db } from '@/configs/db'
import { sysNotifications, sysNotificationTemplates } from '@/db/schema/system'
import { users } from '@/db/schema/auth'
import { eq, and, ne, inArray, lte, desc } from 'drizzle-orm'
import { cacheService } from '@/core/cache/cache.service'
import { renderTemplate } from '@/utils/notification'
import { NotificationPayload, ID } from '@/types'
import { logger } from '@/configs/logger'
import nodemailer from 'nodemailer'
import { env } from '@/configs/env'

export class NotificationService {
  private smtp = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } })

  async enqueue(p: NotificationPayload): Promise<void> {
    await db.insert(sysNotifications).values({
      templateCode: p.templateCode,
      recipientId: p.recipientId,
      resourceType: p.resourceType ?? null,
      resourceId: p.resourceId ?? null,
      payload: p.payload,
      channel: 'in_app',
      scheduledAt: p.scheduledAt ?? new Date()
    })
    await cacheService.incrementUnread(p.recipientId)
  }

  async enqueueBulk(payloads: NotificationPayload[]): Promise<void> { await Promise.all(payloads.map(p => this.enqueue(p))) }

  async renderTemplate(code: string, data: Record<string, unknown>) {
    const rows = await db.select({
      titleTemplate: sysNotificationTemplates.titleTemplate,
      bodyTemplate: sysNotificationTemplates.bodyTemplate
    }).from(sysNotificationTemplates).where(eq(sysNotificationTemplates.code, code))
    const tpl = rows[0]
    if (!tpl) return { title: '', body: '' }
    return { title: renderTemplate(tpl.titleTemplate, data), body: renderTemplate(tpl.bodyTemplate, data) }
  }

  async markAsRead(id: ID, userId: ID): Promise<void> {
    await db.update(sysNotifications)
      .set({ status: 'read', readAt: new Date() })
      .where(and(eq(sysNotifications.id, id), eq(sysNotifications.recipientId, userId)))
  }

  async markAllAsRead(userId: ID): Promise<void> {
    await db.update(sysNotifications)
      .set({ status: 'read', readAt: new Date() })
      .where(and(eq(sysNotifications.recipientId, userId), ne(sysNotifications.status, 'read')))
    await cacheService.resetUnread(userId)
  }

  async getUnread(userId: ID) {
    return db.select().from(sysNotifications)
      .where(and(
        eq(sysNotifications.recipientId, userId),
        inArray(sysNotifications.status, ['pending', 'sent'])
      ))
      .orderBy(desc(sysNotifications.createdAt))
      .limit(50)
  }

  async flushPending(batch = 50): Promise<{ sent: number; failed: number }> {
    const rows = await db.select({
      id: sysNotifications.id,
      recipientId: sysNotifications.recipientId,
      templateCode: sysNotifications.templateCode,
      payload: sysNotifications.payload,
      channel: sysNotifications.channel
    }).from(sysNotifications)
      .where(and(
        eq(sysNotifications.status, 'pending'),
        lte(sysNotifications.scheduledAt, new Date())
      ))
      .limit(batch)

    let sent = 0, failed = 0
    for (const r of rows) {
      try {
        if (r.channel === 'email') {
          const userRows = await db.select({ email: users.email }).from(users).where(eq(users.id, r.recipientId))
          const u = userRows[0]
          if (u && r.templateCode) {
            const rendered = await this.renderTemplate(r.templateCode, r.payload as Record<string, unknown>);
            await this.sendEmail(u.email, rendered.title, rendered.body)
          }
        }
        await db.update(sysNotifications)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(sysNotifications.id, r.id))
        sent++
      } catch (err) {
        logger.error('Notification send failed', { err, id: r.id })
        await db.update(sysNotifications)
          .set({ status: 'failed' })
          .where(eq(sysNotifications.id, r.id))
        failed++
      }
    }
    return { sent, failed }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.smtp.sendMail({ from: env.SMTP_USER, to, subject, html })
  }
}

export const notificationService = new NotificationService()
