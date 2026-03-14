import { pgTable, serial, text, timestamp, boolean, jsonb, bigint, integer, index, customType, bigserial, pgSequence } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { attachmentCategoryEnum, notificationChannelEnum, notificationStatusEnum } from './enums';

// Custom type for inet
const inet = customType<{ data: string }>({
  dataType() {
    return 'inet';
  },
});

export const sysAttachments = pgTable('sys_attachments', {
  id: serial('id').primaryKey().notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id').notNull(),
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
  fileName: text('file_name').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'bigint' }),
  mimeType: text('mime_type'),
  storageKey: text('storage_key').unique().notNull(),
  storageBucket: text('storage_bucket').default('hrm-files').notNull(),
  category: attachmentCategoryEnum('category'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedBy: integer('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    resourceIdx: index('idx_attach_resource').on(table.resourceType, table.resourceId),
    uploaderIdx: index('idx_attach_uploader').on(table.uploadedBy),
  };
});

export const sysAuditLogs = pgTable('sys_audit_logs', {
  id: bigint('id', { mode: 'bigint' }).default(sql`nextval('sys_audit_logs_id_seq')`).notNull(),
  eventTime: timestamp('event_time', { withTimezone: true }).defaultNow().notNull(),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actorIp: inet('actor_ip'),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  schemaName: text('schema_name'),
  tableName: text('table_name'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  diff: jsonb('diff'),
  sessionId: text('session_id'),
  requestId: text('request_id'),
}, (table) => {
  return {
    pk: sql`PRIMARY KEY (id, event_time)`,
  };
});

export const sysNotificationTemplates = pgTable('sys_notification_templates', {
  id: serial('id').primaryKey().notNull(),
  code: text('code').unique().notNull(),
  titleTemplate: text('title_template').notNull(),
  bodyTemplate: text('body_template').notNull(),
  channel: text('channel').array().default(['in_app']).notNull(), // Matching migration: _text
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sysNotifications = pgTable('sys_notifications', {
  id: serial('id').primaryKey().notNull(),
  templateCode: text('template_code').references(() => sysNotificationTemplates.code, { onDelete: 'set null' }),
  recipientId: integer('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type'),
  resourceId: integer('resource_id'),
  payload: jsonb('payload').default('{}').notNull(),
  channel: notificationChannelEnum('channel').default('in_app').notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).defaultNow().notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    recipientStatusIdx: index('idx_notif_recipient').on(table.recipientId, table.status),
    scheduledIdx: index('idx_notif_scheduled').on(table.scheduledAt).where(sql`status = 'pending'`),
  };
});

export const sysScheduledAlerts = pgTable('sys_scheduled_alerts', {
  id: serial('id').primaryKey().notNull(),
  code: text('code').unique().notNull(),
  templateCode: text('template_code').notNull().references(() => sysNotificationTemplates.code),
  sourceQuery: text('source_query').notNull(),
  daysBefore: integer('days_before').notNull(),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
});
