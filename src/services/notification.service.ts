import { query, queryOne } from '@/configs/db'
import { cacheService } from '@/core/cache/cache.service'
import { renderTemplate } from '@/utils/notification'
import { NotificationPayload, UUID } from '@/types'
import { logger } from '@/configs/logger'
import nodemailer from 'nodemailer'
import { env } from '@/configs/env'

export class NotificationService {
  private smtp = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } })

  async enqueue(p: NotificationPayload): Promise<void> {
    await query(`INSERT INTO sys_notifications (template_code,recipient_id,resource_type,resource_id,payload,channel,scheduled_at) VALUES ($1,$2,$3,$4,$5::jsonb,'in_app',COALESCE($6,now()))`,
      [p.templateCode, p.recipientId, p.resourceType??null, p.resourceId??null, JSON.stringify(p.payload), p.scheduledAt??null])
    await cacheService.incrementUnread(p.recipientId)
  }

  async enqueueBulk(payloads: NotificationPayload[]): Promise<void> { await Promise.all(payloads.map(p => this.enqueue(p))) }

  async renderTemplate(code: string, data: Record<string, unknown>) {
    const tpl = await queryOne<{ title_template: string; body_template: string }>('SELECT title_template,body_template FROM sys_notification_templates WHERE code=$1', [code])
    if (!tpl) return { title: '', body: '' }
    return { title: renderTemplate(tpl.title_template, data), body: renderTemplate(tpl.body_template, data) }
  }

  async markAsRead(id: UUID, userId: UUID): Promise<void> {
    await query('UPDATE sys_notifications SET status=$1,read_at=now() WHERE id=$2 AND recipient_id=$3', ['read', id, userId])
  }

  async markAllAsRead(userId: UUID): Promise<void> {
    await query("UPDATE sys_notifications SET status='read',read_at=now() WHERE recipient_id=$1 AND status!='read'", [userId])
    await cacheService.resetUnread(userId)
  }

  async getUnread(userId: UUID) {
    return query("SELECT * FROM sys_notifications WHERE recipient_id=$1 AND status IN ('pending','sent') ORDER BY created_at DESC LIMIT 50", [userId])
  }

  async flushPending(batch = 50): Promise<{ sent: number; failed: number }> {
    const rows = await query<any>(`SELECT id,recipient_id,template_code,payload,channel FROM sys_notifications WHERE status='pending' AND scheduled_at<=now() LIMIT $1`, [batch])
    let sent = 0, failed = 0
    for (const r of rows) {
      try {
        if (r.channel === 'email') {
          const u = await queryOne<{ email: string }>('SELECT email FROM users WHERE id=$1', [r.recipient_id])
          if (u) { const rendered = await this.renderTemplate(r.template_code, r.payload); await this.sendEmail(u.email, rendered.title, rendered.body) }
        }
        await query("UPDATE sys_notifications SET status='sent',sent_at=now() WHERE id=$1", [r.id])
        sent++
      } catch (err) {
        logger.error('Notification send failed', { err, id: r.id })
        await query("UPDATE sys_notifications SET status='failed' WHERE id=$1", [r.id])
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