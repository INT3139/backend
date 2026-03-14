import { pgTable, serial, text, date, numeric, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profileStaff } from './profile';
import { wfInstances } from './workflow';
import { statusEnum, upgradeTypeEnum } from './enums';

export const salaryInfo = pgTable('salary_info', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().unique().references(() => profileStaff.id, { onDelete: 'cascade' }),
  occupationGroup: text('occupation_group'),
  occupationTitle: text('occupation_title'),
  occupationCode: text('occupation_code'),
  salaryGrade: integer('salary_grade'),
  salaryCoefficient: numeric('salary_coefficient', { precision: 5, scale: 2 }),
  isOverGrade: boolean('is_over_grade').default(false).notNull(),
  effectiveDate: date('effective_date'),
  decisionNumber: text('decision_number'),
  positionAllowance: numeric('position_allowance', { precision: 5, scale: 2 }),
  responsibilityAllowance: numeric('responsibility_allowance', { precision: 5, scale: 2 }),
  teacherIncentivePct: numeric('teacher_incentive_pct', { precision: 5, scale: 2 }),
  regionalAllowance: numeric('regional_allowance', { precision: 5, scale: 2 }),
  otherAllowance: numeric('other_allowance', { precision: 5, scale: 2 }),
  harmfulAllowance: numeric('harmful_allowance', { precision: 5, scale: 2 }),
  seniorityAllowancePct: numeric('seniority_allowance_pct', { precision: 5, scale: 2 }),
  enjoymentRatePct: numeric('enjoyment_rate_pct', { precision: 5, scale: 2 }),
  actualCoefficient: numeric('actual_coefficient', { precision: 5, scale: 2 }),
  nextGradeDate: date('next_grade_date'),
  nextSeniorityDate: date('next_seniority_date'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    nextGradeIdx: index('idx_salary_next_grade').on(table.nextGradeDate),
  };
});

export const salaryLogs = pgTable('salary_logs', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  occupationCode: text('occupation_code'),
  salaryGrade: integer('salary_grade'),
  salaryCoefficient: numeric('salary_coefficient', { precision: 5, scale: 2 }),
  salaryLevel: numeric('salary_level', { precision: 15, scale: 2 }),
  isOverGrade: boolean('is_over_grade').default(false).notNull(),
  positionAllowance: numeric('position_allowance', { precision: 5, scale: 2 }),
  effectiveDate: date('effective_date'),
  nextGradeDate: date('next_grade_date'),
  decisionNumber: text('decision_number'),
  occupationGroup: text('occupation_group'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    dateIdx: index('idx_salary_logs_date').on(table.profileId, table.effectiveDate),
    profileIdx: index('idx_salary_logs_profile').on(table.profileId),
  };
});

export const salaryUpgradeProposals = pgTable('salary_upgrade_proposals', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  currentOccupationCode: text('current_occupation_code'),
  currentGrade: integer('current_grade'),
  currentCoefficient: numeric('current_coefficient', { precision: 5, scale: 2 }),
  currentEffectiveDate: date('current_effective_date'),
  currentTitle: text('current_title'),
  attachmentId: integer('attachment_id'),
  status: statusEnum('status').default('pending').notNull(),
  proposedGrade: integer('proposed_grade'),
  proposedCoefficient: numeric('proposed_coefficient', { precision: 5, scale: 2 }),
  proposedNextDate: date('proposed_next_date'),
  upgradeType: upgradeTypeEnum('upgrade_type'),
  workflowId: integer('workflow_id').references(() => wfInstances.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_salary_upgrade_profile').on(table.profileId),
    statusIdx: index('idx_salary_upgrade_status').on(table.status),
  };
});
