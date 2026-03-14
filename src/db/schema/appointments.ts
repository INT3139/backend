import { pgTable, serial, text, integer, date, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profileStaff } from './profile';
import { organizationalUnits } from './core';
import { users } from './auth';
import { wfInstances } from './workflow';
import { appointmentTypeEnum, appointmentStatusEnum } from './enums';

export const appointmentRecords = pgTable('appointment_records', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'restrict' }),
  unitId: integer('unit_id').notNull().references(() => organizationalUnits.id),
  positionName: text('position_name').notNull(),
  termYears: integer('term_years').default(5).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  appointmentType: appointmentTypeEnum('appointment_type').notNull(),
  status: appointmentStatusEnum('status').default('active').notNull(),
  decisionNumber: text('decision_number'),
  workflowId: integer('workflow_id').references(() => wfInstances.id, { onDelete: 'set null' }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    endDateIdx: index('idx_appoint_end_date').on(table.endDate).where(sql`status = 'active'`),
    profileIdx: index('idx_appoint_profile').on(table.profileId),
    unitIdx: index('idx_appoint_unit').on(table.unitId),
  };
});
