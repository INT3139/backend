import { pgTable, serial, text, date, boolean, timestamp, integer, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profileStaff } from './profile';
import { users } from './auth';
import { wfInstances } from './workflow';
import { awardLevelEnum, statusEnum, rewardStatusEnum, titleLevelEnum, disciplineTypeEnum } from './enums';

export const rewardCommendations = pgTable('reward_commendations', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  decisionNumber: text('decision_number'),
  decisionDate: date('decision_date'),
  awardLevel: awardLevelEnum('award_level').notNull(),
  awardName: text('award_name').notNull(),
  content: text('content'),
  academicYear: text('academic_year'),
  isHighestAward: boolean('is_highest_award').default(false).notNull(),
  status: statusEnum('status').default('pending').notNull(),
  attachmentId: integer('attachment_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_commend_profile').on(table.profileId),
  };
});

export const rewardProfiles = pgTable('reward_profiles', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  academicYear: text('academic_year').notNull(),
  selfAssessment: text('self_assessment'),
  monthsWorked: integer('months_worked'),
  leaveDays: integer('leave_days').default(0).notNull(),
  isEligible: boolean('is_eligible').default(true).notNull(),
  ineligibleReason: text('ineligible_reason'),
  ballotResult: jsonb('ballot_result'),
  status: rewardStatusEnum('status').default('draft').notNull(),
  workflowId: integer('workflow_id').references(() => wfInstances.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileYearUnq: unique().on(table.profileId, table.academicYear),
    statusIdx: index('idx_reward_profiles_status').on(table.status),
    yearIdx: index('idx_reward_profiles_year').on(table.academicYear),
  };
});

export const rewardTitles = pgTable('reward_titles', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  titleName: text('title_name').notNull(),
  titleLevel: titleLevelEnum('title_level').notNull(),
  awardedYear: text('awarded_year').notNull(),
  decisionNumber: text('decision_number'),
  awardedBy: text('awarded_by'),
  isHighest: boolean('is_highest').default(false).notNull(),
  attachmentId: integer('attachment_id'),
  status: statusEnum('status').default('pending').notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokeReason: text('revoke_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_reward_titles_profile').on(table.profileId),
    yearIdx: index('idx_reward_titles_year').on(table.awardedYear),
  };
});

export const rewardDisciplinaryRecords = pgTable('reward_disciplinary_records', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  disciplineType: disciplineTypeEnum('discipline_type').notNull(),
  reason: text('reason').notNull(),
  decisionNumber: text('decision_number'),
  unitName: text('unit_name'),
  issuedDate: date('issued_date').notNull(),
  issuedBy: integer('issued_by').references(() => users.id, { onDelete: 'set null' }),
  isHighest: boolean('is_highest').default(false).notNull(),
  relatedTitleId: integer('related_title_id').references(() => rewardTitles.id, { onDelete: 'set null' }),
  attachmentId: integer('attachment_id'),
  status: statusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_disciplinary_profile').on(table.profileId),
  };
});
