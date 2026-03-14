CREATE TYPE "public"."academic_degree" AS ENUM('bachelor', 'master', 'phd');--> statement-breakpoint
CREATE TYPE "public"."academic_title" AS ENUM('gs', 'pgs');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('active', 'expired', 'dismissed', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."appointment_type" AS ENUM('new', 'reappoint', 'transfer', 'dismiss');--> statement-breakpoint
CREATE TYPE "public"."attachment_category" AS ENUM('evidence', 'decision', 'ballot_minutes', 'cv', 'contract_doc', 'other');--> statement-breakpoint
CREATE TYPE "public"."award_level" AS ENUM('co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('draft', 'active', 'expired', 'terminated', 'renewed');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('probation', 'fixed_term', 'indefinite', 'part_time');--> statement-breakpoint
CREATE TYPE "public"."discipline_type" AS ENUM('khien_trach', 'canh_cao', 'ha_bac_luong', 'buoc_thoi_viec');--> statement-breakpoint
CREATE TYPE "public"."edu_type" AS ENUM('degree', 'certificate', 'foreign_lang', 'it');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('active', 'retired', 'resigned', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('teaching', 'research_paper', 'research_project', 'other_task');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('Nam', 'Nữ', 'Khác');--> statement-breakpoint
CREATE TYPE "public"."history_type" AS ENUM('chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri');--> statement-breakpoint
CREATE TYPE "public"."lang_level" AS ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."political_theory" AS ENUM('sơ cấp', 'trung cấp', 'cao cấp', 'cử nhân');--> statement-breakpoint
CREATE TYPE "public"."reward_status" AS ENUM('draft', 'submitted', 'ballot_done', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."scope_type" AS ENUM('school', 'faculty', 'department', 'self');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."title_level" AS ENUM('unit', 'university', 'ministry');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('school', 'faculty', 'department', 'lab');--> statement-breakpoint
CREATE TYPE "public"."upgrade_type" AS ENUM('NBL thường xuyên', 'NBL trước hạn', 'NBL vượt bậc');--> statement-breakpoint
CREATE TYPE "public"."workflow_action" AS ENUM('approve', 'reject', 'request_revision', 'ballot_submit', 'forward');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('pending', 'in_progress', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE SEQUENCE "public"."appointment_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."organizational_units_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."profile_education_histories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."profile_extra_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."profile_family_relations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."profile_staff_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."profile_work_histories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."recruitment_candidates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."recruitment_contract_extensions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."recruitment_contracts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."recruitment_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."recruitment_proposals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."reward_commendations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."reward_disciplinary_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."reward_profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."reward_titles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."salary_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."salary_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."salary_upgrade_proposals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."sys_attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."sys_audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."sys_notification_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."sys_notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."sys_scheduled_alerts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."user_roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."wf_definitions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."wf_instances_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."wf_step_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."workload_annual_summaries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."workload_evidences_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."workload_individual_quotas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."workload_quota_parameters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "organizational_units" (
	"id" integer PRIMARY KEY DEFAULT nextval('organizational_units_id_seq') NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"unit_type" "unit_type" NOT NULL,
	"parent_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "organizational_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" integer PRIMARY KEY DEFAULT nextval('permissions_id_seq') NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"domain" text GENERATED ALWAYS AS (split_part(code, '.', 1)) STORED,
	"module" text GENERATED ALWAYS AS (split_part(code, '.', 2)) STORED,
	"action" text GENERATED ALWAYS AS (split_part(code, '.', 3)) STORED,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_code" text NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_code_pk" PRIMARY KEY("role_id","permission_code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY DEFAULT nextval('roles_id_seq') NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" integer PRIMARY KEY DEFAULT nextval('user_roles_id_seq') NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"scope_type" "scope_type" DEFAULT 'school' NOT NULL,
	"scope_unit_id" integer,
	"granted_by" integer,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "user_roles_user_id_role_id_scope_unit_id_unique" UNIQUE("user_id","role_id","scope_unit_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY DEFAULT nextval('users_id_seq') NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"unit_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profile_education_histories" (
	"id" integer PRIMARY KEY DEFAULT nextval('profile_education_histories_id_seq') NOT NULL,
	"profile_id" integer NOT NULL,
	"edu_type" "edu_type" NOT NULL,
	"from_date" date,
	"to_date" date,
	"degree_level" text,
	"institution" text,
	"major" text,
	"training_form" text,
	"field" text,
	"is_studying" boolean DEFAULT false NOT NULL,
	"cert_name" text,
	"lang_name" text,
	"lang_level" "lang_level",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_extra_info" (
	"id" integer PRIMARY KEY DEFAULT nextval('profile_extra_info_id_seq') NOT NULL,
	"profile_id" integer NOT NULL,
	"arrest_history" text,
	"old_regime_work" text,
	"foreign_org_relations" text,
	"foreign_relatives" text,
	"income_salary" numeric(15, 2),
	"income_other_sources" numeric(15, 2),
	"house_type_granted" text,
	"house_area_granted" numeric(8, 2),
	"house_type_owned" text,
	"house_area_owned" numeric(8, 2),
	"land_granted_m2" numeric(10, 2),
	"land_purchased_m2" numeric(10, 2),
	"land_business_m2" numeric(10, 2),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_family_relations" (
	"id" integer PRIMARY KEY DEFAULT nextval('profile_family_relations_id_seq') NOT NULL,
	"profile_id" integer NOT NULL,
	"side" text DEFAULT 'self' NOT NULL,
	"relationship" text NOT NULL,
	"full_name" text NOT NULL,
	"birth_year" integer,
	"description" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_staff" (
	"id" integer PRIMARY KEY DEFAULT nextval('profile_staff_id_seq') NOT NULL,
	"user_id" integer NOT NULL,
	"unit_id" integer,
	"email_vnu" text,
	"email_personal" text,
	"phone_work" text,
	"phone_home" text,
	"date_of_birth" date,
	"gender" "gender",
	"id_number" text,
	"id_issued_date" date,
	"id_issued_by" text,
	"nationality" text DEFAULT 'Việt Nam',
	"ethnicity" text,
	"religion" text,
	"marital_status" "marital_status",
	"policy_object" text,
	"nick_name" text,
	"passport_number" text,
	"passport_issued_at" date,
	"passport_issued_by" text,
	"insurance_number" text,
	"insurance_joined_at" date,
	"addr_hometown" jsonb,
	"addr_birthplace" jsonb,
	"addr_permanent" jsonb,
	"addr_current" jsonb,
	"academic_degree" "academic_degree",
	"academic_title" "academic_title",
	"edu_level_general" text,
	"state_management" text,
	"political_theory" "political_theory",
	"foreign_lang_level" text,
	"it_level" text,
	"staff_type" text NOT NULL,
	"employment_status" "employment_status" DEFAULT 'active' NOT NULL,
	"join_date" date,
	"retire_date" date,
	"profile_status" text DEFAULT 'draft' NOT NULL,
	"last_updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profile_work_histories" (
	"id" integer PRIMARY KEY DEFAULT nextval('profile_work_histories_id_seq') NOT NULL,
	"profile_id" integer NOT NULL,
	"history_type" "history_type" NOT NULL,
	"from_date" date,
	"to_date" date,
	"unit_name" text NOT NULL,
	"position_name" text,
	"activity_type" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"approved_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wf_definitions" (
	"id" integer PRIMARY KEY DEFAULT nextval('wf_definitions_id_seq') NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"steps" jsonb DEFAULT '[]' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wf_definitions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "wf_instances" (
	"id" integer PRIMARY KEY DEFAULT nextval('wf_instances_id_seq') NOT NULL,
	"definition_id" integer NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" integer NOT NULL,
	"initiated_by" integer NOT NULL,
	"status" "workflow_status" DEFAULT 'pending' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"due_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "wf_step_logs" (
	"id" integer PRIMARY KEY DEFAULT nextval('wf_step_logs_id_seq') NOT NULL,
	"instance_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" text NOT NULL,
	"actor_id" integer,
	"action" "workflow_action" NOT NULL,
	"comment" text,
	"ballot_data" jsonb,
	"acted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"degree" text,
	"status" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_contract_extensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"decision_number" text,
	"signed_date" date,
	"extension_period" text,
	"start_date" date,
	"end_date" date,
	"using_unit_id" integer,
	"position_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"contract_number" text,
	"contract_type" "contract_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"recruiting_unit_id" integer,
	"current_contract" boolean DEFAULT false NOT NULL,
	"assigned_work" text,
	"policy_object" text,
	"insurance_joined_at" date,
	"salary_grade" text,
	"status" "contract_status" DEFAULT 'draft' NOT NULL,
	"workflow_id" integer,
	"signed_at" timestamp with time zone,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"recruiting_unit_id" integer,
	"recruitment_date" date,
	"salary_form" text,
	"previous_occupation" text,
	"edu_sector_start_year" integer,
	"vnu_start_date" date,
	"work_seniority_years" numeric(5, 2),
	"longest_job" text,
	"job_group" text,
	"job_position_vnu" text,
	"job_position_unit" text,
	"main_assigned_work" text,
	"work_unit_count" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitment_proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposing_unit" integer NOT NULL,
	"position_name" text NOT NULL,
	"required_degree" "academic_degree",
	"required_exp_years" integer,
	"quota" integer DEFAULT 1 NOT NULL,
	"reason" text,
	"academic_year" text,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"workflow_id" integer,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_commendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"decision_number" text,
	"decision_date" date,
	"award_level" "award_level" NOT NULL,
	"award_name" text NOT NULL,
	"content" text,
	"academic_year" text,
	"is_highest_award" boolean DEFAULT false NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"attachment_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_disciplinary_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"discipline_type" "discipline_type" NOT NULL,
	"reason" text NOT NULL,
	"decision_number" text,
	"unit_name" text,
	"issued_date" date NOT NULL,
	"issued_by" integer,
	"is_highest" boolean DEFAULT false NOT NULL,
	"related_title_id" integer,
	"attachment_id" integer,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"self_assessment" text,
	"months_worked" integer,
	"leave_days" integer DEFAULT 0 NOT NULL,
	"is_eligible" boolean DEFAULT true NOT NULL,
	"ineligible_reason" text,
	"ballot_result" jsonb,
	"status" "reward_status" DEFAULT 'draft' NOT NULL,
	"workflow_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reward_profiles_profile_id_academic_year_unique" UNIQUE("profile_id","academic_year")
);
--> statement-breakpoint
CREATE TABLE "reward_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"title_name" text NOT NULL,
	"title_level" "title_level" NOT NULL,
	"awarded_year" text NOT NULL,
	"decision_number" text,
	"awarded_by" text,
	"is_highest" boolean DEFAULT false NOT NULL,
	"attachment_id" integer,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"occupation_group" text,
	"occupation_title" text,
	"occupation_code" text,
	"salary_grade" integer,
	"salary_coefficient" numeric(5, 2),
	"is_over_grade" boolean DEFAULT false NOT NULL,
	"effective_date" date,
	"decision_number" text,
	"position_allowance" numeric(5, 2),
	"responsibility_allowance" numeric(5, 2),
	"teacher_incentive_pct" numeric(5, 2),
	"regional_allowance" numeric(5, 2),
	"other_allowance" numeric(5, 2),
	"harmful_allowance" numeric(5, 2),
	"seniority_allowance_pct" numeric(5, 2),
	"enjoyment_rate_pct" numeric(5, 2),
	"actual_coefficient" numeric(5, 2),
	"next_grade_date" date,
	"next_seniority_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salary_info_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "salary_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"occupation_code" text,
	"salary_grade" integer,
	"salary_coefficient" numeric(5, 2),
	"salary_level" numeric(15, 2),
	"is_over_grade" boolean DEFAULT false NOT NULL,
	"position_allowance" numeric(5, 2),
	"effective_date" date,
	"next_grade_date" date,
	"decision_number" text,
	"occupation_group" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_upgrade_proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"current_occupation_code" text,
	"current_grade" integer,
	"current_coefficient" numeric(5, 2),
	"current_effective_date" date,
	"current_title" text,
	"attachment_id" integer,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"proposed_grade" integer,
	"proposed_coefficient" numeric(5, 2),
	"proposed_next_date" date,
	"upgrade_type" "upgrade_type",
	"workflow_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workload_annual_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"total_teaching" numeric DEFAULT '0' NOT NULL,
	"total_research" numeric DEFAULT '0' NOT NULL,
	"total_other" numeric DEFAULT '0' NOT NULL,
	"quota_teaching" numeric,
	"quota_research" numeric,
	"is_teaching_violation" boolean DEFAULT false NOT NULL,
	"is_research_violation" boolean DEFAULT false NOT NULL,
	"finalized_at" timestamp with time zone,
	CONSTRAINT "workload_annual_summaries_profile_id_academic_year_unique" UNIQUE("profile_id","academic_year")
);
--> statement-breakpoint
CREATE TABLE "workload_evidences" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"evidence_type" "evidence_type" NOT NULL,
	"title" text NOT NULL,
	"hours_claimed" numeric,
	"coef_applied" numeric DEFAULT '1.0' NOT NULL,
	"hours_converted" numeric GENERATED ALWAYS AS (hours_claimed * coef_applied) STORED,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp with time zone,
	"reject_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workload_individual_quotas" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"academic_year" text NOT NULL,
	"teaching_hours" numeric NOT NULL,
	"research_hours" numeric NOT NULL,
	"other_hours" numeric DEFAULT '0' NOT NULL,
	"reduction_pct" numeric DEFAULT '0' NOT NULL,
	"reduction_reason" text,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workload_individual_quotas_profile_id_academic_year_unique" UNIQUE("profile_id","academic_year")
);
--> statement-breakpoint
CREATE TABLE "workload_quota_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"academic_year" text NOT NULL,
	"param_type" text NOT NULL,
	"param_key" text NOT NULL,
	"param_value" numeric NOT NULL,
	"description" text,
	"set_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workload_quota_parameters_academic_year_param_key_unique" UNIQUE("academic_year","param_key")
);
--> statement-breakpoint
CREATE TABLE "sys_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"fileName" text NOT NULL,
	"file_size_bytes" bigint,
	"mime_type" text,
	"storage_key" text NOT NULL,
	"storage_bucket" text DEFAULT 'hrm-files' NOT NULL,
	"category" "attachment_category",
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" integer,
	"verified_at" timestamp with time zone,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sys_attachments_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "sys_audit_logs" (
	"id" bigint DEFAULT nextval('sys_audit_logs_id_seq') NOT NULL,
	"event_time" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" integer,
	"actor_ip" "inet",
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"schema_name" text,
	"table_name" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"diff" jsonb,
	"session_id" text,
	"request_id" text
);
--> statement-breakpoint
CREATE TABLE "sys_notification_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title_template" text NOT NULL,
	"body_template" text NOT NULL,
	"channel" text[] DEFAULT '{"in_app"}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_notification_templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_code" text,
	"recipient_id" integer NOT NULL,
	"resource_type" text,
	"resource_id" integer,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_scheduled_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"template_code" text NOT NULL,
	"source_query" text NOT NULL,
	"days_before" integer NOT NULL,
	"last_run_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "sys_scheduled_alerts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "appointment_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"position_name" text NOT NULL,
	"term_years" integer DEFAULT 5 NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"appointment_type" "appointment_type" NOT NULL,
	"status" "appointment_status" DEFAULT 'active' NOT NULL,
	"decision_number" text,
	"workflow_id" integer,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizational_units" ADD CONSTRAINT "organizational_units_parent_id_organizational_units_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_scope_unit_id_organizational_units_id_fk" FOREIGN KEY ("scope_unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_organizational_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_education_histories" ADD CONSTRAINT "profile_education_histories_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_extra_info" ADD CONSTRAINT "profile_extra_info_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_family_relations" ADD CONSTRAINT "profile_family_relations_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD CONSTRAINT "profile_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD CONSTRAINT "profile_staff_unit_id_organizational_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_staff" ADD CONSTRAINT "profile_staff_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_work_histories" ADD CONSTRAINT "profile_work_histories_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_work_histories" ADD CONSTRAINT "profile_work_histories_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wf_instances" ADD CONSTRAINT "wf_instances_definition_id_wf_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."wf_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wf_instances" ADD CONSTRAINT "wf_instances_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wf_step_logs" ADD CONSTRAINT "wf_step_logs_instance_id_wf_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."wf_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wf_step_logs" ADD CONSTRAINT "wf_step_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_proposal_id_recruitment_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."recruitment_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contract_extensions" ADD CONSTRAINT "recruitment_contract_extensions_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contract_extensions" ADD CONSTRAINT "recruitment_contract_extensions_using_unit_id_organizational_units_id_fk" FOREIGN KEY ("using_unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contracts" ADD CONSTRAINT "recruitment_contracts_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contracts" ADD CONSTRAINT "recruitment_contracts_recruiting_unit_id_organizational_units_id_fk" FOREIGN KEY ("recruiting_unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contracts" ADD CONSTRAINT "recruitment_contracts_workflow_id_wf_instances_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wf_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_contracts" ADD CONSTRAINT "recruitment_contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_info" ADD CONSTRAINT "recruitment_info_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_info" ADD CONSTRAINT "recruitment_info_recruiting_unit_id_organizational_units_id_fk" FOREIGN KEY ("recruiting_unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_proposals" ADD CONSTRAINT "recruitment_proposals_proposing_unit_organizational_units_id_fk" FOREIGN KEY ("proposing_unit") REFERENCES "public"."organizational_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_proposals" ADD CONSTRAINT "recruitment_proposals_workflow_id_wf_instances_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wf_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_proposals" ADD CONSTRAINT "recruitment_proposals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_commendations" ADD CONSTRAINT "reward_commendations_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_disciplinary_records" ADD CONSTRAINT "reward_disciplinary_records_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_disciplinary_records" ADD CONSTRAINT "reward_disciplinary_records_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_disciplinary_records" ADD CONSTRAINT "reward_disciplinary_records_related_title_id_reward_titles_id_fk" FOREIGN KEY ("related_title_id") REFERENCES "public"."reward_titles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_profiles" ADD CONSTRAINT "reward_profiles_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_profiles" ADD CONSTRAINT "reward_profiles_workflow_id_wf_instances_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wf_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_titles" ADD CONSTRAINT "reward_titles_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_info" ADD CONSTRAINT "salary_info_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_logs" ADD CONSTRAINT "salary_logs_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_upgrade_proposals" ADD CONSTRAINT "salary_upgrade_proposals_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salary_upgrade_proposals" ADD CONSTRAINT "salary_upgrade_proposals_workflow_id_wf_instances_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wf_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workload_annual_summaries" ADD CONSTRAINT "workload_annual_summaries_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workload_evidences" ADD CONSTRAINT "workload_evidences_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workload_evidences" ADD CONSTRAINT "workload_evidences_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workload_individual_quotas" ADD CONSTRAINT "workload_individual_quotas_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workload_quota_parameters" ADD CONSTRAINT "workload_quota_parameters_set_by_users_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_attachments" ADD CONSTRAINT "sys_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_attachments" ADD CONSTRAINT "sys_attachments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_audit_logs" ADD CONSTRAINT "sys_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_notifications" ADD CONSTRAINT "sys_notifications_template_code_sys_notification_templates_code_fk" FOREIGN KEY ("template_code") REFERENCES "public"."sys_notification_templates"("code") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_notifications" ADD CONSTRAINT "sys_notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_scheduled_alerts" ADD CONSTRAINT "sys_scheduled_alerts_template_code_sys_notification_templates_code_fk" FOREIGN KEY ("template_code") REFERENCES "public"."sys_notification_templates"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_records" ADD CONSTRAINT "appointment_records_profile_id_profile_staff_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile_staff"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_records" ADD CONSTRAINT "appointment_records_unit_id_organizational_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."organizational_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_records" ADD CONSTRAINT "appointment_records_workflow_id_wf_instances_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."wf_instances"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_records" ADD CONSTRAINT "appointment_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_permissions_domain_module" ON "permissions" USING btree ("domain","module");--> statement-breakpoint
CREATE INDEX "idx_role_perms_code" ON "role_permissions" USING btree ("permission_code");--> statement-breakpoint
CREATE INDEX "idx_user_roles_expires" ON "user_roles" USING btree ("expires_at") WHERE expires_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_user_roles_user" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX "idx_users_unit" ON "users" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_edu_hist_profile" ON "profile_education_histories" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_edu_hist_type" ON "profile_education_histories" USING btree ("profile_id","edu_type");--> statement-breakpoint
CREATE INDEX "idx_family_profile" ON "profile_family_relations" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_staff_employment" ON "profile_staff" USING btree ("employment_status");--> statement-breakpoint
CREATE INDEX "idx_staff_profile_status" ON "profile_staff" USING btree ("profile_status");--> statement-breakpoint
CREATE INDEX "idx_staff_unit" ON "profile_staff" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_work_hist_profile" ON "profile_work_histories" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_work_hist_type" ON "profile_work_histories" USING btree ("profile_id","history_type");--> statement-breakpoint
CREATE INDEX "idx_wf_instances_actor" ON "wf_instances" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX "idx_wf_instances_resource" ON "wf_instances" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_wf_instances_status" ON "wf_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_step_logs_instance" ON "wf_step_logs" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_extensions_profile" ON "recruitment_contract_extensions" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_end_date" ON "recruitment_contracts" USING btree ("end_date") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_contracts_profile" ON "recruitment_contracts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_status" ON "recruitment_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_proposals_status" ON "recruitment_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_proposals_unit" ON "recruitment_proposals" USING btree ("proposing_unit");--> statement-breakpoint
CREATE INDEX "idx_commend_profile" ON "reward_commendations" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_disciplinary_profile" ON "reward_disciplinary_records" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_reward_profiles_status" ON "reward_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reward_profiles_year" ON "reward_profiles" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "idx_reward_titles_profile" ON "reward_titles" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_reward_titles_year" ON "reward_titles" USING btree ("awarded_year");--> statement-breakpoint
CREATE INDEX "idx_salary_next_grade" ON "salary_info" USING btree ("next_grade_date");--> statement-breakpoint
CREATE INDEX "idx_salary_logs_date" ON "salary_logs" USING btree ("profile_id","effective_date");--> statement-breakpoint
CREATE INDEX "idx_salary_logs_profile" ON "salary_logs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_salary_upgrade_profile" ON "salary_upgrade_proposals" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_salary_upgrade_status" ON "salary_upgrade_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_annual_violations" ON "workload_annual_summaries" USING btree ("is_teaching_violation","is_research_violation") WHERE is_teaching_violation = true OR is_research_violation = true;--> statement-breakpoint
CREATE INDEX "idx_annual_year" ON "workload_annual_summaries" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "idx_evidences_pending" ON "workload_evidences" USING btree ("status") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "idx_evidences_profile_year" ON "workload_evidences" USING btree ("profile_id","academic_year");--> statement-breakpoint
CREATE INDEX "idx_ind_quotas_year" ON "workload_individual_quotas" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "idx_quota_params_year" ON "workload_quota_parameters" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "idx_attach_resource" ON "sys_attachments" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_attach_uploader" ON "sys_attachments" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_notif_recipient" ON "sys_notifications" USING btree ("recipient_id","status");--> statement-breakpoint
CREATE INDEX "idx_notif_scheduled" ON "sys_notifications" USING btree ("scheduled_at") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "idx_appoint_end_date" ON "appointment_records" USING btree ("end_date") WHERE status = 'active';--> statement-breakpoint
CREATE INDEX "idx_appoint_profile" ON "appointment_records" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_appoint_unit" ON "appointment_records" USING btree ("unit_id");