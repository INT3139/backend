import { pgSequence } from 'drizzle-orm/pg-core';

// Core
export const organizationalUnitsSeq = pgSequence('organizational_units_id_seq');

// Auth
export const rolesSeq = pgSequence('roles_id_seq');
export const permissionsSeq = pgSequence('permissions_id_seq');
export const usersSeq = pgSequence('users_id_seq');
export const userRolesSeq = pgSequence('user_roles_id_seq');

// Profile
export const profileStaffSeq = pgSequence('profile_staff_id_seq');
export const profileWorkHistoriesSeq = pgSequence('profile_work_histories_id_seq');
export const profileEducationHistoriesSeq = pgSequence('profile_education_histories_id_seq');
export const profileExtraInfoSeq = pgSequence('profile_extra_info_id_seq');
export const profileFamilyRelationsSeq = pgSequence('profile_family_relations_id_seq');
export const profileHealthRecordsSeq = pgSequence('profile_health_records_id_seq');

// Workflow
export const wfDefinitionsSeq = pgSequence('wf_definitions_id_seq');
export const wfInstancesSeq = pgSequence('wf_instances_id_seq');
export const wfStepLogsSeq = pgSequence('wf_step_logs_id_seq');

// Recruitment
export const recruitmentProposalsSeq = pgSequence('recruitment_proposals_id_seq');
export const recruitmentCandidatesSeq = pgSequence('recruitment_candidates_id_seq');
export const recruitmentContractsSeq = pgSequence('recruitment_contracts_id_seq');
export const recruitmentContractExtensionsSeq = pgSequence('recruitment_contract_extensions_id_seq');
export const recruitmentInfoSeq = pgSequence('recruitment_info_id_seq');

// Reward
export const rewardCommendationsSeq = pgSequence('reward_commendations_id_seq');
export const rewardProfilesSeq = pgSequence('reward_profiles_id_seq');
export const rewardTitlesSeq = pgSequence('reward_titles_id_seq');
export const rewardDisciplinaryRecordsSeq = pgSequence('reward_disciplinary_records_id_seq');

// Salary
export const salaryInfoSeq = pgSequence('salary_info_id_seq');
export const salaryLogsSeq = pgSequence('salary_logs_id_seq');
export const salaryUpgradeProposalsSeq = pgSequence('salary_upgrade_proposals_id_seq');

// Workload
export const workloadQuotaParametersSeq = pgSequence('workload_quota_parameters_id_seq');
export const workloadAnnualSummariesSeq = pgSequence('workload_annual_summaries_id_seq');
export const workloadEvidencesSeq = pgSequence('workload_evidences_id_seq');
export const workloadIndividualQuotasSeq = pgSequence('workload_individual_quotas_id_seq');

// System
export const sysAttachmentsSeq = pgSequence('sys_attachments_id_seq');
export const sysAuditLogsSeq = pgSequence('sys_audit_logs_id_seq');
export const sysNotificationTemplatesSeq = pgSequence('sys_notification_templates_id_seq');
export const sysNotificationsSeq = pgSequence('sys_notifications_id_seq');
export const sysScheduledAlertsSeq = pgSequence('sys_scheduled_alerts_id_seq');

// Appointments
export const appointmentRecordsSeq = pgSequence('appointment_records_id_seq');
