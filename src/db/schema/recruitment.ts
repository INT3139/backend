import { pgTable, serial, text, date, boolean, timestamp, integer, index, numeric } from 'drizzle-orm/pg-core';
import { profileStaff } from './profile';
import { organizationalUnits } from './core';
import { users } from './auth';
import { wfInstances } from './workflow';
import { academicDegreeEnum, statusEnum, contractTypeEnum, contractStatusEnum } from './enums';

export const recruitmentProposals = pgTable('recruitment_proposals', {
  id: serial('id').primaryKey().notNull(),
  proposingUnit: integer('proposing_unit').notNull().references(() => organizationalUnits.id),
  positionName: text('position_name').notNull(),
  requiredDegree: academicDegreeEnum('required_degree'),
  requiredExpYears: integer('required_exp_years'),
  quota: integer('quota').default(1).notNull(),
  reason: text('reason'),
  academicYear: text('academic_year'),
  status: statusEnum('status').default('pending').notNull(), // Matching migration status but naming it for enum
  workflowId: integer('workflow_id').references(() => wfInstances.id, { onDelete: 'set null' }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('idx_proposals_status').on(table.status),
    unitIdx: index('idx_proposals_unit').on(table.proposingUnit),
  };
});

export const recruitmentCandidates = pgTable('recruitment_candidates', {
  id: serial('id').primaryKey().notNull(),
  proposalId: integer('proposal_id').notNull().references(() => recruitmentProposals.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  degree: text('degree'),
  status: text('status'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const recruitmentContracts = pgTable('recruitment_contracts', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'restrict' }),
  contractNumber: text('contract_number'),
  contractType: contractTypeEnum('contract_type').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  recruitingUnitId: integer('recruiting_unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  currentContract: boolean('current_contract').default(false).notNull(),
  assignedWork: text('assigned_work'),
  policyObject: text('policy_object'),
  insuranceJoinedAt: date('insurance_joined_at'),
  salaryGrade: text('salary_grade'),
  status: contractStatusEnum('status').default('draft').notNull(),
  workflowId: integer('workflow_id').references(() => wfInstances.id, { onDelete: 'set null' }),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    endDateIdx: index('idx_contracts_end_date').on(table.endDate).where(sql`status = 'active'`),
    profileIdx: index('idx_contracts_profile').on(table.profileId),
    statusIdx: index('idx_contracts_status').on(table.status),
  };
});

import { sql } from 'drizzle-orm';

export const recruitmentContractExtensions = pgTable('recruitment_contract_extensions', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  decisionNumber: text('decision_number'),
  signedDate: date('signed_date'),
  extensionPeriod: text('extension_period'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  usingUnitId: integer('using_unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  positionName: text('position_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_extensions_profile').on(table.profileId),
  };
});

export const recruitmentInfo = pgTable('recruitment_info', {
  id: serial('id').primaryKey().notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  recruitingUnitId: integer('recruiting_unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  recruitmentDate: date('recruitment_date'),
  salaryForm: text('salary_form'),
  previousOccupation: text('previous_occupation'),
  eduSectorStartYear: integer('edu_sector_start_year'),
  vnuStartDate: date('vnu_start_date'),
  workSeniorityYears: numeric('work_seniority_years', { precision: 5, scale: 2 }),
  longestJob: text('longest_job'),
  jobGroup: text('job_group'),
  jobPositionVnu: text('job_position_vnu'),
  jobPositionUnit: text('job_position_unit'),
  mainAssignedWork: text('main_assigned_work'),
  workUnitCount: integer('work_unit_count'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
