import { pgTable, text, timestamp, date, numeric, jsonb, boolean, index, integer, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { organizationalUnits } from './core';
import { statusEnum, academicDegreeEnum, academicTitleEnum, genderEnum, maritalStatusEnum, politicalTheoryEnum, researchWorkTypeEnum } from './enums';
import { profileStaffSeq, profileWorkHistoriesSeq, profileEducationHistoriesSeq, profileExtraInfoSeq, profileFamilyRelationsSeq, profileHealthRecordsSeq, profilePositionsSeq, profileResearchWorksSeq } from './sequences';

export const profileStaff = pgTable('profile_staff', {
  id: integer('id').primaryKey().default(sql`nextval('profile_staff_id_seq')`).notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  emailVnu: text('email_vnu'),
  emailPersonal: text('email_personal'),
  phoneWork: text('phone_work'),
  phoneHome: text('phone_home'),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  idNumber: text('id_number'),
  idIssuedDate: date('id_issued_date'),
  idIssuedBy: text('id_issued_by'),
  nationality: text('nationality').default('Việt Nam'),
  ethnicity: text('ethnicity'),
  religion: text('religion'),
  maritalStatus: maritalStatusEnum('marital_status'),
  policyObject: text('policy_object'),
  nickName: text('nick_name'),
  passportNumber: text('passport_number'),
  passportIssuedAt: date('passport_issued_at'),
  passportIssuedBy: text('passport_issued_by'),
  insuranceNumber: text('insurance_number'),
  insuranceJoinedAt: date('insurance_joined_at'),
  addrHometown: jsonb('addr_hometown'),
  addrBirthplace: jsonb('addr_birthplace'),
  addrPermanent: jsonb('addr_permanent'),
  addrCurrent: jsonb('addr_current'),
  academicDegree: academicDegreeEnum('academic_degree'),
  academicTitle: academicTitleEnum('academic_title'),
  eduLevelGeneral: text('edu_level_general'),
  stateManagement: text('state_management'),
  politicalTheory: politicalTheoryEnum('political_theory'),
  foreignLangLevel: text('foreign_lang_level'),
  itLevel: text('it_level'),
  staffType: text('staff_type').notNull(),
  employmentStatus: text('employment_status').default('active').notNull(),
  joinDate: date('join_date'),
  retireDate: date('retire_date'),
  profileStatus: text('profile_status').default('draft').notNull(),
  avatarDefault: boolean('avatar_default').default(true).notNull(),
  note: text('note'),
  origin: text('origin'),
  lastUpdatedBy: integer('last_updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    staffEmploymentIdx: index('idx_staff_employment').on(table.employmentStatus),
    staffProfileStatusIdx: index('idx_staff_profile_status').on(table.profileStatus),
    staffUnitIdx: index('idx_staff_unit').on(table.unitId),
  };
});

export const profileWorkHistories = pgTable('profile_work_histories', {
  id: integer('id').primaryKey().default(sql`nextval('profile_work_histories_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  historyType: text('history_type').notNull(),
  fromDate: date('from_date'),
  toDate: date('to_date'),
  unitName: text('unit_name').notNull(),
  positionName: text('position_name'),
  activityType: text('activity_type'),
  status: statusEnum('status').default('pending').notNull(),
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    workHistProfileIdx: index('idx_work_hist_profile').on(table.profileId),
    workHistTypeIdx: index('idx_work_hist_type').on(table.profileId, table.historyType),
  };
});

export const profileEducationHistories = pgTable('profile_education_histories', {
  id: integer('id').primaryKey().default(sql`nextval('profile_education_histories_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  eduType: text('edu_type').notNull(),
  fromDate: date('from_date'),
  toDate: date('to_date'),
  degreeLevel: text('degree_level'),
  institution: text('institution'),
  major: text('major'),
  trainingForm: text('training_form'),
  field: text('field'),
  isStudying: boolean('is_studying').default(false).notNull(),
  certName: text('cert_name'),
  langName: text('lang_name'),
  langLevel: text('lang_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    eduHistProfileIdx: index('idx_edu_hist_profile').on(table.profileId),
    eduHistTypeIdx: index('idx_edu_hist_type').on(table.profileId, table.eduType),
  };
});

export const profileExtraInfo = pgTable('profile_extra_info', {
  id: integer('id').primaryKey().default(sql`nextval('profile_extra_info_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().unique().references(() => profileStaff.id, { onDelete: 'cascade' }),
  arrestHistory: text('arrest_history'),
  oldRegimeWork: text('old_regime_work'),
  foreignOrgRelations: text('foreign_org_relations'),
  foreignRelatives: text('foreign_relatives'),
  incomeSalary: numeric('income_salary', { precision: 15, scale: 2 }),
  incomeOtherSources: numeric('income_other_sources', { precision: 15, scale: 2 }),
  houseTypeGranted: text('house_type_granted'),
  houseAreaGranted: numeric('house_area_granted', { precision: 8, scale: 2 }),
  houseTypeOwned: text('house_type_owned'),
  houseAreaOwned: numeric('house_area_owned', { precision: 8, scale: 2 }),
  landGrantedM2: numeric('land_granted_m2', { precision: 10, scale: 2 }),
  landPurchasedM2: numeric('land_purchased_m2', { precision: 10, scale: 2 }),
  landBusinessM2: numeric('land_business_m2', { precision: 10, scale: 2 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const profileFamilyRelations = pgTable('profile_family_relations', {
  id: integer('id').primaryKey().default(sql`nextval('profile_family_relations_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  side: text('side').default('self').notNull(),
  relationship: text('relationship').notNull(),
  fullName: text('full_name').notNull(),
  birthYear: integer('birth_year'),
  description: text('description'),
  status: statusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIdx: index('idx_family_profile').on(table.profileId),
  };
});

export const profileHealthRecords = pgTable('profile_health_records', {
  id: integer('id').primaryKey().default(sql`nextval('profile_health_records_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().unique().references(() => profileStaff.id, { onDelete: 'cascade' }),
  healthStatus: text('health_status'),
  weightKg: numeric('weight_kg', { precision: 5, scale: 1 }),
  heightCm: numeric('height_cm', { precision: 5, scale: 1 }),
  bloodType: text('blood_type'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const profilePositions = pgTable('profile_positions', {
  id: integer('id').primaryKey().default(sql`nextval('profile_positions_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  positionName: text('position_name').notNull(),
  positionType: text('position_type'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  decisionRef: text('decision_ref'),
  isPrimary: boolean('is_primary').default(false),
});

export const profileResearchWorks = pgTable('profile_research_works', {
  id: integer('id').primaryKey().default(sql`nextval('profile_research_works_id_seq')`).notNull(),
  profileId: integer('profile_id').notNull().references(() => profileStaff.id, { onDelete: 'cascade' }),
  workType: researchWorkTypeEnum('work_type').notNull(),
  title: text('title').notNull(),
  journalName: text('journal_name'),
  indexing: text('indexing'),
  publishYear: integer('publish_year'),
  doi: text('doi'),
  academicYear: text('academic_year'),
  status: text('status').default('pending'),
  avatarDefault: boolean('avatar_default').default(true).notNull(),
  projectCode: text('project_code'),
  extra: jsonb('extra').notNull().default({}),
  verifiedBy: integer('verified_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    researchProfileIdx: index('idx_research_profile').on(table.profileId),
    researchYearIdx: index('idx_research_year').on(table.publishYear),
    researchTypeIdx: index('idx_research_type').on(table.profileId, table.workType),
    researchProjectCodeIdx: index('idx_research_project_code').on(table.projectCode).where(sql`project_code IS NOT NULL`),
  };
});
