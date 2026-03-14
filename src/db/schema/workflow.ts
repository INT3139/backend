import { pgTable, text, timestamp, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { workflowStatusEnum, workflowActionEnum } from './enums';
import { wfDefinitionsSeq, wfInstancesSeq, wfStepLogsSeq } from './sequences';

export const wfDefinitions = pgTable('wf_definitions', {
  id: integer('id').primaryKey().default(sql`nextval('wf_definitions_id_seq')`).notNull(),
  code: text('code').unique().notNull(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  steps: jsonb('steps').default('[]').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const wfInstances = pgTable('wf_instances', {
  id: integer('id').primaryKey().default(sql`nextval('wf_instances_id_seq')`).notNull(),
  definitionId: integer('definition_id').notNull().references(() => wfDefinitions.id),
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id').notNull(),
  initiatedBy: integer('initiated_by').notNull().references(() => users.id),
  status: workflowStatusEnum('status').default('pending').notNull(),
  currentStep: integer('current_step').default(1).notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueAt: timestamp('due_at', { withTimezone: true }),
}, (table) => {
  return {
    actorIdx: index('idx_wf_instances_actor').on(table.initiatedBy),
    resourceIdx: index('idx_wf_instances_resource').on(table.resourceType, table.resourceId),
    statusIdx: index('idx_wf_instances_status').on(table.status),
  };
});

export const wfStepLogs = pgTable('wf_step_logs', {
  id: integer('id').primaryKey().default(sql`nextval('wf_step_logs_id_seq')`).notNull(),
  instanceId: integer('instance_id').notNull().references(() => wfInstances.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  stepName: text('step_name').notNull(),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: workflowActionEnum('action').notNull(),
  comment: text('comment'),
  ballotData: jsonb('ballot_data'),
  actedAt: timestamp('acted_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    instanceIdx: index('idx_step_logs_instance').on(table.instanceId),
  };
});
