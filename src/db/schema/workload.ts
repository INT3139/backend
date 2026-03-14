import { pgTable, serial, text, numeric, boolean, timestamp, index, unique, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profileStaff } from './profile';
import { users } from './auth';
import { evidenceTypeEnum, statusEnum } from './enums';

export const workloadQuotaParameters = pgTable('workload_quota_parameters', {
  id: serial('id').primaryKey().notNull(),
  academicYear: text('academic_year').notNull(),
  paramType: text('param_type').notNull(),
  paramKey: text('param_key').notNull(),
  paramValue: numeric('param_value').notNull(),
  description: text('description'),
  setBy: integer('set_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    yearKeyUnq: unique().on(table.academicYear, table.paramKey),
    yearIdx: index('idx_quota_params_year').on(table.academicYear),
  };
});

export const workloadAnnualSummaries = pgTable('workload_annual_summaries', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  totalTeaching: numeric('total_teaching').default('0').notNull(),
  totalResearch: numeric('total_research').default('0').notNull(),
  totalOther: numeric('total_other').default('0').notNull(),
  quotaTeaching: numeric('quota_teaching'),
  quotaResearch: numeric('quota_research'),
  isTeachingViolation: boolean('is_teaching_violation').default(false).notNull(),
  isResearchViolation: boolean('is_research_violation').default(false).notNull(),
  finalizedAt: timestamp('finalized_at', { withTimezone: true }),
}, (table) => {
  return {
    profileYearUnq: unique().on(table.profileId, table.academicYear),
    violationIdx: index('idx_annual_violations').on(table.isTeachingViolation, table.isResearchViolation).where(sql`is_teaching_violation = true OR is_research_violation = true`),
    yearIdx: index('idx_annual_year').on(table.academicYear),
  };
});

export const workloadEvidences = pgTable('workload_evidences', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  evidenceType: evidenceTypeEnum('evidence_type').notNull(),
  title: text('title').notNull(),
  hoursClaimed: numeric('hours_claimed'),
  coefApplied: numeric('coef_applied').default('1.0').notNull(),
  hoursConverted: numeric('hours_converted').generatedAlwaysAs(sql`hours_claimed * coef_applied`),
  status: statusEnum('status').default('pending').notNull(),
  reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectReason: text('reject_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    pendingIdx: index('idx_evidences_pending').on(table.status).where(sql`status = 'pending'`),
    profileYearIdx: index('idx_evidences_profile_year').on(table.profileId, table.academicYear),
  };
});

export const workloadIndividualQuotas = pgTable('workload_individual_quotas', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  teachingHours: numeric('teaching_hours').notNull(),
  researchHours: numeric('research_hours').notNull(),
  otherHours: numeric('other_hours').default('0').notNull(),
  reductionPct: numeric('reduction_pct').default('0').notNull(),
  reductionReason: text('reduction_reason'),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileYearUnq: unique().on(table.profileId, table.academicYear),
    yearIdx: index('idx_ind_quotas_year').on(table.academicYear),
    reductionPctCheck: sql`CHECK (reduction_pct >= 0 AND reduction_pct <= 1)`,
  };
});
