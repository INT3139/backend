-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP TYPE public.appointment_records;

CREATE TYPE public.appointment_records AS (
	id uuid,
	profile_id uuid,
	unit_id uuid,
	position_name text,
	term_years int4,
	start_date date,
	end_date date,
	appointment_type text,
	status text,
	decision_number text,
	workflow_id uuid,
	created_by uuid,
	created_at timestamptz);

-- DROP TYPE public.gtrgm;

CREATE TYPE public.gtrgm (
	INPUT = gtrgm_in,
	OUTPUT = gtrgm_out,
	ALIGNMENT = 4,
	STORAGE = plain,
	CATEGORY = U,
	DELIMITER = ',');

-- DROP TYPE public.organizational_units;

CREATE TYPE public.organizational_units AS (
	id uuid,
	code text,
	"name" text,
	unit_type text,
	parent_id uuid,
	created_at timestamptz,
	deleted_at timestamptz);

-- DROP TYPE public.permissions;

CREATE TYPE public.permissions AS (
	id uuid,
	code text,
	description text,
	"domain" text,
	"module" text,
	"action" text,
	is_active bool,
	created_at timestamptz);

-- DROP TYPE public.profile_education_histories;

CREATE TYPE public.profile_education_histories AS (
	id uuid,
	profile_id uuid,
	edu_type text,
	from_date date,
	to_date date,
	degree_level text,
	institution text,
	major text,
	training_form text,
	field text,
	is_studying bool,
	cert_name text,
	lang_name text,
	lang_level text,
	created_at timestamptz);

-- DROP TYPE public.profile_extra_info;

CREATE TYPE public.profile_extra_info AS (
	id uuid,
	profile_id uuid,
	arrest_history text,
	old_regime_work text,
	foreign_org_relations text,
	foreign_relatives text,
	income_salary numeric(15,2),
	income_other_sources numeric(15,2),
	house_type_granted text,
	house_area_granted numeric(8,2),
	house_type_owned text,
	house_area_owned numeric(8,2),
	land_granted_m2 numeric(10,2),
	land_purchased_m2 numeric(10,2),
	land_business_m2 numeric(10,2),
	updated_at timestamptz);

-- DROP TYPE public.profile_family_relations;

CREATE TYPE public.profile_family_relations AS (
	id uuid,
	profile_id uuid,
	side text,
	relationship text,
	full_name text,
	birth_year int4,
	description text,
	status text,
	created_at timestamptz);

-- DROP TYPE public.profile_health_records;

CREATE TYPE public.profile_health_records AS (
	id uuid,
	profile_id uuid,
	health_status text,
	weight_kg numeric(5,1),
	height_cm numeric(5,1),
	blood_type text,
	notes text,
	updated_at timestamptz);

-- DROP TYPE public.profile_positions;

CREATE TYPE public.profile_positions AS (
	id uuid,
	profile_id uuid,
	unit_id uuid,
	position_name text,
	position_type text,
	start_date date,
	end_date date,
	decision_ref text,
	is_primary bool);

-- DROP TYPE public.profile_research_works;

CREATE TYPE public.profile_research_works AS (
	id uuid,
	profile_id uuid,
	work_type text,
	title text,
	journal_name text,
	indexing text,
	publish_year int4,
	doi text,
	academic_year text,
	status text,
	verified_by uuid,
	created_at timestamptz);

-- DROP TYPE public.profile_staff;

CREATE TYPE public.profile_staff AS (
	id uuid,
	user_id uuid,
	unit_id uuid,
	email_vnu text,
	email_personal text,
	phone_work text,
	phone_home text,
	date_of_birth date,
	gender text,
	id_number text,
	id_issued_date date,
	id_issued_by text,
	nationality text,
	ethnicity text,
	religion text,
	marital_status text,
	policy_object text,
	nick_name text,
	passport_number text,
	passport_issued_at date,
	passport_issued_by text,
	insurance_number text,
	insurance_joined_at date,
	addr_hometown jsonb,
	addr_birthplace jsonb,
	addr_permanent jsonb,
	addr_current jsonb,
	academic_degree text,
	academic_title text,
	edu_level_general text,
	state_management text,
	political_theory text,
	foreign_lang_level text,
	it_level text,
	staff_type text,
	employment_status text,
	join_date date,
	retire_date date,
	profile_status text,
	last_updated_by uuid,
	created_at timestamptz,
	updated_at timestamptz);

-- DROP TYPE public.profile_work_histories;

CREATE TYPE public.profile_work_histories AS (
	id uuid,
	profile_id uuid,
	history_type text,
	from_date date,
	to_date date,
	unit_name text,
	position_name text,
	activity_type text,
	status text,
	approved_by uuid,
	created_at timestamptz);

-- DROP TYPE public.recruitment_candidates;

CREATE TYPE public.recruitment_candidates AS (
	id uuid,
	proposal_id uuid,
	full_name text,
	email text,
	phone text,
	"degree" text,
	status text,
	notes text,
	created_at timestamptz);

-- DROP TYPE public.recruitment_contract_extensions;

CREATE TYPE public.recruitment_contract_extensions AS (
	id uuid,
	profile_id uuid,
	decision_number text,
	signed_date date,
	extension_period text,
	start_date date,
	end_date date,
	using_unit_id uuid,
	position_name text,
	created_at timestamptz);

-- DROP TYPE public.recruitment_contracts;

CREATE TYPE public.recruitment_contracts AS (
	id uuid,
	profile_id uuid,
	contract_number text,
	contract_type text,
	start_date date,
	end_date date,
	recruiting_unit_id uuid,
	current_contract bool,
	assigned_work text,
	policy_object text,
	insurance_joined_at date,
	salary_grade text,
	status text,
	workflow_id uuid,
	signed_at timestamptz,
	created_by uuid,
	created_at timestamptz);

-- DROP TYPE public.recruitment_info;

CREATE TYPE public.recruitment_info AS (
	id uuid,
	profile_id uuid,
	recruiting_unit_id uuid,
	recruitment_date date,
	salary_form text,
	previous_occupation text,
	edu_sector_start_year int4,
	vnu_start_date date,
	work_seniority_years numeric(5,2),
	longest_job text,
	job_group text,
	job_position_vnu text,
	job_position_unit text,
	main_assigned_work text,
	work_unit_count int4,
	notes text,
	created_at timestamptz);

-- DROP TYPE public.recruitment_proposals;

CREATE TYPE public.recruitment_proposals AS (
	id uuid,
	proposing_unit uuid,
	position_name text,
	required_degree text,
	required_exp_years int4,
	quota int4,
	reason text,
	academic_year text,
	status text,
	workflow_id uuid,
	created_by uuid,
	created_at timestamptz);

-- DROP TYPE public.resource_scopes;

CREATE TYPE public.resource_scopes AS (
	resource_type text,
	resource_id uuid,
	owner_id uuid,
	unit_id uuid,
	created_at timestamptz);

-- DROP TYPE public.reward_commendations;

CREATE TYPE public.reward_commendations AS (
	id uuid,
	profile_id uuid,
	decision_number text,
	decision_date date,
	award_level text,
	award_name text,
	"content" text,
	academic_year text,
	is_highest_award bool,
	status text,
	attachment_id uuid,
	created_at timestamptz);

-- DROP TYPE public.reward_disciplinary_records;

CREATE TYPE public.reward_disciplinary_records AS (
	id uuid,
	profile_id uuid,
	discipline_type text,
	reason text,
	decision_number text,
	unit_name text,
	issued_date date,
	issued_by uuid,
	is_highest bool,
	related_title_id uuid,
	attachment_id uuid,
	status text,
	created_at timestamptz);

-- DROP TYPE public.reward_profiles;

CREATE TYPE public.reward_profiles AS (
	id uuid,
	profile_id uuid,
	academic_year text,
	self_assessment text,
	months_worked int4,
	leave_days int4,
	is_eligible bool,
	ineligible_reason text,
	ballot_result jsonb,
	status text,
	workflow_id uuid,
	created_at timestamptz);

-- DROP TYPE public.reward_titles;

CREATE TYPE public.reward_titles AS (
	id uuid,
	profile_id uuid,
	title_name text,
	title_level text,
	awarded_year text,
	decision_number text,
	awarded_by text,
	is_highest bool,
	attachment_id uuid,
	status text,
	revoked_at timestamptz,
	revoke_reason text,
	created_at timestamptz);

-- DROP TYPE public.role_permissions;

CREATE TYPE public.role_permissions AS (
	role_id uuid,
	permission_code text);

-- DROP TYPE public.roles;

CREATE TYPE public.roles AS (
	id uuid,
	code text,
	"name" text,
	description text,
	created_at timestamptz,
	deleted_at timestamptz);

-- DROP TYPE public.salary_info;

CREATE TYPE public.salary_info AS (
	id uuid,
	profile_id uuid,
	occupation_group text,
	occupation_title text,
	occupation_code text,
	salary_grade int4,
	salary_coefficient numeric(5,2),
	is_over_grade bool,
	effective_date date,
	decision_number text,
	position_allowance numeric(5,2),
	responsibility_allowance numeric(5,2),
	teacher_incentive_pct numeric(5,2),
	regional_allowance numeric(5,2),
	other_allowance numeric(5,2),
	harmful_allowance numeric(5,2),
	seniority_allowance_pct numeric(5,2),
	enjoyment_rate_pct numeric(5,2),
	actual_coefficient numeric(5,2),
	next_grade_date date,
	next_seniority_date date,
	updated_at timestamptz);

-- DROP TYPE public.salary_logs;

CREATE TYPE public.salary_logs AS (
	id uuid,
	profile_id uuid,
	occupation_code text,
	salary_grade int4,
	salary_coefficient numeric(5,2),
	salary_level numeric(15,2),
	is_over_grade bool,
	position_allowance numeric(5,2),
	effective_date date,
	next_grade_date date,
	decision_number text,
	occupation_group text,
	created_at timestamptz);

-- DROP TYPE public.salary_upgrade_proposals;

CREATE TYPE public.salary_upgrade_proposals AS (
	id uuid,
	profile_id uuid,
	current_occupation_code text,
	current_grade int4,
	current_coefficient numeric(5,2),
	current_effective_date date,
	current_title text,
	attachment_id uuid,
	status text,
	proposed_grade int4,
	proposed_coefficient numeric(5,2),
	proposed_next_date date,
	upgrade_type text,
	workflow_id uuid,
	created_at timestamptz);

-- DROP TYPE public.sys_attachments;

CREATE TYPE public.sys_attachments AS (
	id uuid,
	resource_type text,
	resource_id uuid,
	uploaded_by uuid,
	file_name text,
	file_size_bytes int8,
	mime_type text,
	storage_key text,
	storage_bucket text,
	category text,
	is_verified bool,
	verified_by uuid,
	verified_at timestamptz,
	uploaded_at timestamptz,
	deleted_at timestamptz);

-- DROP TYPE public.sys_audit_logs;

CREATE TYPE public.sys_audit_logs AS (
	id bigserial,
	event_time timestamptz,
	actor_id uuid,
	actor_ip inet,
	"action" text,
	resource_type text,
	resource_id text,
	schema_name text,
	table_name text,
	old_values jsonb,
	new_values jsonb,
	diff jsonb,
	session_id text,
	request_id text);

-- DROP TYPE public.sys_audit_logs_2026;

CREATE TYPE public.sys_audit_logs_2026 AS (
	id int8,
	event_time timestamptz,
	actor_id uuid,
	actor_ip inet,
	"action" text,
	resource_type text,
	resource_id text,
	schema_name text,
	table_name text,
	old_values jsonb,
	new_values jsonb,
	diff jsonb,
	session_id text,
	request_id text);

-- DROP TYPE public.sys_notification_templates;

CREATE TYPE public.sys_notification_templates AS (
	id uuid,
	code text,
	title_template text,
	body_template text,
	channel _text,
	created_at timestamptz);

-- DROP TYPE public.sys_notifications;

CREATE TYPE public.sys_notifications AS (
	id uuid,
	template_code text,
	recipient_id uuid,
	resource_type text,
	resource_id uuid,
	payload jsonb,
	channel text,
	status text,
	scheduled_at timestamptz,
	sent_at timestamptz,
	read_at timestamptz,
	created_at timestamptz);

-- DROP TYPE public.sys_scheduled_alerts;

CREATE TYPE public.sys_scheduled_alerts AS (
	id uuid,
	code text,
	template_code text,
	source_query text,
	days_before int4,
	last_run_at timestamptz,
	is_active bool);

-- DROP TYPE public.user_roles;

CREATE TYPE public.user_roles AS (
	id uuid,
	user_id uuid,
	role_id uuid,
	scope_type text,
	scope_unit_id uuid,
	granted_by uuid,
	granted_at timestamptz,
	expires_at timestamptz);

-- DROP TYPE public.users;

CREATE TYPE public.users AS (
	id uuid,
	username text,
	email text,
	password_hash text,
	full_name text,
	unit_id uuid,
	is_active bool,
	last_login_at timestamptz,
	created_at timestamptz,
	deleted_at timestamptz);

-- DROP TYPE public.wf_definitions;

CREATE TYPE public.wf_definitions AS (
	id uuid,
	code text,
	"name" text,
	"module" text,
	steps jsonb,
	is_active bool,
	created_at timestamptz);

-- DROP TYPE public.wf_instances;

CREATE TYPE public.wf_instances AS (
	id uuid,
	definition_id uuid,
	resource_type text,
	resource_id uuid,
	initiated_by uuid,
	status text,
	current_step int4,
	metadata jsonb,
	started_at timestamptz,
	completed_at timestamptz,
	due_at timestamptz);

-- DROP TYPE public.wf_step_logs;

CREATE TYPE public.wf_step_logs AS (
	id uuid,
	instance_id uuid,
	step_number int4,
	step_name text,
	actor_id uuid,
	"action" text,
	"comment" text,
	ballot_data jsonb,
	acted_at timestamptz);

-- DROP TYPE public.workload_annual_summaries;

CREATE TYPE public.workload_annual_summaries AS (
	id uuid,
	profile_id uuid,
	academic_year text,
	total_teaching numeric,
	total_research numeric,
	total_other numeric,
	quota_teaching numeric,
	quota_research numeric,
	is_teaching_violation bool,
	is_research_violation bool,
	finalized_at timestamptz);

-- DROP TYPE public.workload_evidences;

CREATE TYPE public.workload_evidences AS (
	id uuid,
	profile_id uuid,
	academic_year text,
	evidence_type text,
	title text,
	hours_claimed numeric,
	coef_applied numeric,
	hours_converted numeric,
	status text,
	reviewed_by uuid,
	reviewed_at timestamptz,
	reject_reason text,
	created_at timestamptz);

-- DROP TYPE public.workload_individual_quotas;

CREATE TYPE public.workload_individual_quotas AS (
	id uuid,
	profile_id uuid,
	academic_year text,
	teaching_hours numeric,
	research_hours numeric,
	other_hours numeric,
	reduction_pct numeric,
	reduction_reason text,
	calculated_at timestamptz);

-- DROP TYPE public.workload_quota_parameters;

CREATE TYPE public.workload_quota_parameters AS (
	id uuid,
	academic_year text,
	param_type text,
	param_key text,
	param_value numeric,
	description text,
	set_by uuid,
	created_at timestamptz);

-- DROP TYPE public._appointment_records;

CREATE TYPE public._appointment_records (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.appointment_records,
	DELIMITER = ',');

-- DROP TYPE public._gtrgm;

CREATE TYPE public._gtrgm (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.gtrgm,
	DELIMITER = ',');

-- DROP TYPE public._organizational_units;

CREATE TYPE public._organizational_units (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.organizational_units,
	DELIMITER = ',');

-- DROP TYPE public._permissions;

CREATE TYPE public._permissions (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.permissions,
	DELIMITER = ',');

-- DROP TYPE public._profile_education_histories;

CREATE TYPE public._profile_education_histories (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_education_histories,
	DELIMITER = ',');

-- DROP TYPE public._profile_extra_info;

CREATE TYPE public._profile_extra_info (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_extra_info,
	DELIMITER = ',');

-- DROP TYPE public._profile_family_relations;

CREATE TYPE public._profile_family_relations (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_family_relations,
	DELIMITER = ',');

-- DROP TYPE public._profile_health_records;

CREATE TYPE public._profile_health_records (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_health_records,
	DELIMITER = ',');

-- DROP TYPE public._profile_positions;

CREATE TYPE public._profile_positions (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_positions,
	DELIMITER = ',');

-- DROP TYPE public._profile_research_works;

CREATE TYPE public._profile_research_works (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_research_works,
	DELIMITER = ',');

-- DROP TYPE public._profile_staff;

CREATE TYPE public._profile_staff (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_staff,
	DELIMITER = ',');

-- DROP TYPE public._profile_work_histories;

CREATE TYPE public._profile_work_histories (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.profile_work_histories,
	DELIMITER = ',');

-- DROP TYPE public._recruitment_candidates;

CREATE TYPE public._recruitment_candidates (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.recruitment_candidates,
	DELIMITER = ',');

-- DROP TYPE public._recruitment_contract_extensions;

CREATE TYPE public._recruitment_contract_extensions (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.recruitment_contract_extensions,
	DELIMITER = ',');

-- DROP TYPE public._recruitment_contracts;

CREATE TYPE public._recruitment_contracts (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.recruitment_contracts,
	DELIMITER = ',');

-- DROP TYPE public._recruitment_info;

CREATE TYPE public._recruitment_info (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.recruitment_info,
	DELIMITER = ',');

-- DROP TYPE public._recruitment_proposals;

CREATE TYPE public._recruitment_proposals (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.recruitment_proposals,
	DELIMITER = ',');

-- DROP TYPE public._resource_scopes;

CREATE TYPE public._resource_scopes (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.resource_scopes,
	DELIMITER = ',');

-- DROP TYPE public._reward_commendations;

CREATE TYPE public._reward_commendations (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.reward_commendations,
	DELIMITER = ',');

-- DROP TYPE public._reward_disciplinary_records;

CREATE TYPE public._reward_disciplinary_records (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.reward_disciplinary_records,
	DELIMITER = ',');

-- DROP TYPE public._reward_profiles;

CREATE TYPE public._reward_profiles (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.reward_profiles,
	DELIMITER = ',');

-- DROP TYPE public._reward_titles;

CREATE TYPE public._reward_titles (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.reward_titles,
	DELIMITER = ',');

-- DROP TYPE public._role_permissions;

CREATE TYPE public._role_permissions (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.role_permissions,
	DELIMITER = ',');

-- DROP TYPE public._roles;

CREATE TYPE public._roles (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.roles,
	DELIMITER = ',');

-- DROP TYPE public._salary_info;

CREATE TYPE public._salary_info (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.salary_info,
	DELIMITER = ',');

-- DROP TYPE public._salary_logs;

CREATE TYPE public._salary_logs (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.salary_logs,
	DELIMITER = ',');

-- DROP TYPE public._salary_upgrade_proposals;

CREATE TYPE public._salary_upgrade_proposals (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.salary_upgrade_proposals,
	DELIMITER = ',');

-- DROP TYPE public._sys_attachments;

CREATE TYPE public._sys_attachments (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_attachments,
	DELIMITER = ',');

-- DROP TYPE public._sys_audit_logs;

CREATE TYPE public._sys_audit_logs (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_audit_logs,
	DELIMITER = ',');

-- DROP TYPE public._sys_audit_logs_2026;

CREATE TYPE public._sys_audit_logs_2026 (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_audit_logs_2026,
	DELIMITER = ',');

-- DROP TYPE public._sys_notification_templates;

CREATE TYPE public._sys_notification_templates (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_notification_templates,
	DELIMITER = ',');

-- DROP TYPE public._sys_notifications;

CREATE TYPE public._sys_notifications (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_notifications,
	DELIMITER = ',');

-- DROP TYPE public._sys_scheduled_alerts;

CREATE TYPE public._sys_scheduled_alerts (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.sys_scheduled_alerts,
	DELIMITER = ',');

-- DROP TYPE public._user_roles;

CREATE TYPE public._user_roles (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.user_roles,
	DELIMITER = ',');

-- DROP TYPE public._users;

CREATE TYPE public._users (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.users,
	DELIMITER = ',');

-- DROP TYPE public._wf_definitions;

CREATE TYPE public._wf_definitions (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.wf_definitions,
	DELIMITER = ',');

-- DROP TYPE public._wf_instances;

CREATE TYPE public._wf_instances (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.wf_instances,
	DELIMITER = ',');

-- DROP TYPE public._wf_step_logs;

CREATE TYPE public._wf_step_logs (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.wf_step_logs,
	DELIMITER = ',');

-- DROP TYPE public._workload_annual_summaries;

CREATE TYPE public._workload_annual_summaries (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.workload_annual_summaries,
	DELIMITER = ',');

-- DROP TYPE public._workload_evidences;

CREATE TYPE public._workload_evidences (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.workload_evidences,
	DELIMITER = ',');

-- DROP TYPE public._workload_individual_quotas;

CREATE TYPE public._workload_individual_quotas (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.workload_individual_quotas,
	DELIMITER = ',');

-- DROP TYPE public._workload_quota_parameters;

CREATE TYPE public._workload_quota_parameters (
	INPUT = array_in,
	OUTPUT = array_out,
	RECEIVE = array_recv,
	SEND = array_send,
	ANALYZE = array_typanalyze,
	ALIGNMENT = 8,
	STORAGE = any,
	CATEGORY = A,
	ELEMENT = public.workload_quota_parameters,
	DELIMITER = ',');

-- DROP SEQUENCE public.sys_audit_logs_id_seq;

CREATE SEQUENCE public.sys_audit_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.sys_audit_logs_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.sys_audit_logs_id_seq TO postgres;
-- public.permissions definition

-- Drop table

-- DROP TABLE public.permissions;

CREATE TABLE public.permissions ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, description text NULL, "domain" text GENERATED ALWAYS AS (split_part(code, '.'::text, 1)) STORED NULL, "module" text GENERATED ALWAYS AS (split_part(code, '.'::text, 2)) STORED NULL, "action" text GENERATED ALWAYS AS (split_part(code, '.'::text, 3)) STORED NULL, is_active bool DEFAULT true NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT permissions_code_key UNIQUE (code), CONSTRAINT permissions_pkey PRIMARY KEY (id));
CREATE INDEX idx_permissions_domain_module ON public.permissions USING btree (domain, module);

-- Permissions

ALTER TABLE public.permissions OWNER TO postgres;
GRANT ALL ON TABLE public.permissions TO postgres;


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, "name" text NOT NULL, description text NULL, created_at timestamptz DEFAULT now() NOT NULL, deleted_at timestamptz NULL, CONSTRAINT roles_code_key UNIQUE (code), CONSTRAINT roles_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.roles OWNER TO postgres;
GRANT ALL ON TABLE public.roles TO postgres;


-- public.sys_notification_templates definition

-- Drop table

-- DROP TABLE public.sys_notification_templates;

CREATE TABLE public.sys_notification_templates ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, title_template text NOT NULL, body_template text NOT NULL, channel _text DEFAULT '{in_app}'::text[] NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT sys_notification_templates_code_key UNIQUE (code), CONSTRAINT sys_notification_templates_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.sys_notification_templates OWNER TO postgres;
GRANT ALL ON TABLE public.sys_notification_templates TO postgres;


-- public.wf_definitions definition

-- Drop table

-- DROP TABLE public.wf_definitions;

CREATE TABLE public.wf_definitions ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, "name" text NOT NULL, "module" text NOT NULL, steps jsonb DEFAULT '[]'::jsonb NOT NULL, is_active bool DEFAULT true NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT wf_definitions_code_key UNIQUE (code), CONSTRAINT wf_definitions_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.wf_definitions OWNER TO postgres;
GRANT ALL ON TABLE public.wf_definitions TO postgres;


-- public.organizational_units definition

-- Drop table

-- DROP TABLE public.organizational_units;

CREATE TABLE public.organizational_units ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, "name" text NOT NULL, unit_type text NOT NULL, parent_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, deleted_at timestamptz NULL, CONSTRAINT organizational_units_code_key UNIQUE (code), CONSTRAINT organizational_units_pkey PRIMARY KEY (id), CONSTRAINT organizational_units_unit_type_check CHECK ((unit_type = ANY (ARRAY['school'::text, 'faculty'::text, 'department'::text, 'lab'::text]))), CONSTRAINT organizational_units_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);
CREATE INDEX idx_units_parent ON public.organizational_units USING btree (parent_id);
CREATE INDEX idx_units_type ON public.organizational_units USING btree (unit_type);

-- Permissions

ALTER TABLE public.organizational_units OWNER TO postgres;
GRANT ALL ON TABLE public.organizational_units TO postgres;


-- public.role_permissions definition

-- Drop table

-- DROP TABLE public.role_permissions;

CREATE TABLE public.role_permissions ( role_id uuid NOT NULL, permission_code text NOT NULL, CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_code), CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE);
CREATE INDEX idx_role_perms_code ON public.role_permissions USING btree (permission_code);

-- Table Triggers

create trigger trg_audit_role_permissions after
insert
    or
delete
    or
update
    on
    public.role_permissions for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.role_permissions OWNER TO postgres;
GRANT ALL ON TABLE public.role_permissions TO postgres;


-- public.sys_scheduled_alerts definition

-- Drop table

-- DROP TABLE public.sys_scheduled_alerts;

CREATE TABLE public.sys_scheduled_alerts ( id uuid DEFAULT gen_random_uuid() NOT NULL, code text NOT NULL, template_code text NOT NULL, source_query text NOT NULL, days_before int4 NOT NULL, last_run_at timestamptz NULL, is_active bool DEFAULT true NOT NULL, CONSTRAINT sys_scheduled_alerts_code_key UNIQUE (code), CONSTRAINT sys_scheduled_alerts_pkey PRIMARY KEY (id), CONSTRAINT sys_scheduled_alerts_template_code_fkey FOREIGN KEY (template_code) REFERENCES public.sys_notification_templates(code));

-- Permissions

ALTER TABLE public.sys_scheduled_alerts OWNER TO postgres;
GRANT ALL ON TABLE public.sys_scheduled_alerts TO postgres;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( id uuid DEFAULT gen_random_uuid() NOT NULL, username text NOT NULL, email text NOT NULL, password_hash text NOT NULL, full_name text NOT NULL, unit_id uuid NULL, is_active bool DEFAULT true NOT NULL, last_login_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, deleted_at timestamptz NULL, CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id), CONSTRAINT users_username_key UNIQUE (username), CONSTRAINT users_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);
CREATE INDEX idx_users_active ON public.users USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_users_unit ON public.users USING btree (unit_id);

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;


-- public.wf_instances definition

-- Drop table

-- DROP TABLE public.wf_instances;

CREATE TABLE public.wf_instances ( id uuid DEFAULT gen_random_uuid() NOT NULL, definition_id uuid NOT NULL, resource_type text NOT NULL, resource_id uuid NOT NULL, initiated_by uuid NOT NULL, status text DEFAULT 'pending'::text NOT NULL, current_step int4 DEFAULT 1 NOT NULL, metadata jsonb DEFAULT '{}'::jsonb NOT NULL, started_at timestamptz DEFAULT now() NOT NULL, completed_at timestamptz NULL, due_at timestamptz NULL, CONSTRAINT wf_instances_pkey PRIMARY KEY (id), CONSTRAINT wf_instances_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text]))), CONSTRAINT wf_instances_definition_id_fkey FOREIGN KEY (definition_id) REFERENCES public.wf_definitions(id), CONSTRAINT wf_instances_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id));
CREATE INDEX idx_wf_instances_actor ON public.wf_instances USING btree (initiated_by);
CREATE INDEX idx_wf_instances_resource ON public.wf_instances USING btree (resource_type, resource_id);
CREATE INDEX idx_wf_instances_status ON public.wf_instances USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'in_progress'::text]));

-- Table Triggers

create trigger trg_audit_wf_instances after
insert
    or
delete
    or
update
    on
    public.wf_instances for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.wf_instances OWNER TO postgres;
GRANT ALL ON TABLE public.wf_instances TO postgres;


-- public.wf_step_logs definition

-- Drop table

-- DROP TABLE public.wf_step_logs;

CREATE TABLE public.wf_step_logs ( id uuid DEFAULT gen_random_uuid() NOT NULL, instance_id uuid NOT NULL, step_number int4 NOT NULL, step_name text NOT NULL, actor_id uuid NULL, "action" text NOT NULL, "comment" text NULL, ballot_data jsonb NULL, acted_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT wf_step_logs_action_check CHECK ((action = ANY (ARRAY['approve'::text, 'reject'::text, 'request_revision'::text, 'ballot_submit'::text, 'forward'::text]))), CONSTRAINT wf_step_logs_pkey PRIMARY KEY (id), CONSTRAINT wf_step_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT wf_step_logs_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.wf_instances(id) ON DELETE CASCADE);
CREATE INDEX idx_step_logs_instance ON public.wf_step_logs USING btree (instance_id);

-- Table Triggers

create trigger trg_audit_wf_step_logs after
insert
    or
delete
    or
update
    on
    public.wf_step_logs for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.wf_step_logs OWNER TO postgres;
GRANT ALL ON TABLE public.wf_step_logs TO postgres;


-- public.workload_quota_parameters definition

-- Drop table

-- DROP TABLE public.workload_quota_parameters;

CREATE TABLE public.workload_quota_parameters ( id uuid DEFAULT gen_random_uuid() NOT NULL, academic_year text NOT NULL, param_type text NOT NULL, param_key text NOT NULL, param_value numeric NOT NULL, description text NULL, set_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT workload_quota_parameters_academic_year_param_key_key UNIQUE (academic_year, param_key), CONSTRAINT workload_quota_parameters_pkey PRIMARY KEY (id), CONSTRAINT workload_quota_parameters_set_by_fkey FOREIGN KEY (set_by) REFERENCES public.users(id) ON DELETE SET NULL);
CREATE INDEX idx_quota_params_year ON public.workload_quota_parameters USING btree (academic_year);

-- Permissions

ALTER TABLE public.workload_quota_parameters OWNER TO postgres;
GRANT ALL ON TABLE public.workload_quota_parameters TO postgres;


-- public.profile_staff definition

-- Drop table

-- DROP TABLE public.profile_staff;

CREATE TABLE public.profile_staff ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, unit_id uuid NULL, email_vnu text NULL, email_personal text NULL, phone_work text NULL, phone_home text NULL, date_of_birth date NULL, gender text NULL, id_number text NULL, id_issued_date date NULL, id_issued_by text NULL, nationality text DEFAULT 'Việt Nam'::text NULL, ethnicity text NULL, religion text NULL, marital_status text NULL, policy_object text NULL, nick_name text NULL, passport_number text NULL, passport_issued_at date NULL, passport_issued_by text NULL, insurance_number text NULL, insurance_joined_at date NULL, addr_hometown jsonb NULL, addr_birthplace jsonb NULL, addr_permanent jsonb NULL, addr_current jsonb NULL, academic_degree text NULL, academic_title text NULL, edu_level_general text NULL, state_management text NULL, political_theory text NULL, foreign_lang_level text NULL, it_level text NULL, staff_type text NOT NULL, employment_status text DEFAULT 'active'::text NOT NULL, join_date date NULL, retire_date date NULL, profile_status text DEFAULT 'draft'::text NOT NULL, last_updated_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_staff_academic_degree_check CHECK ((academic_degree = ANY (ARRAY['bachelor'::text, 'master'::text, 'phd'::text]))), CONSTRAINT profile_staff_academic_title_check CHECK ((academic_title = ANY (ARRAY['gs'::text, 'pgs'::text]))), CONSTRAINT profile_staff_employment_status_check CHECK ((employment_status = ANY (ARRAY['active'::text, 'retired'::text, 'resigned'::text, 'transferred'::text]))), CONSTRAINT profile_staff_gender_check CHECK ((gender = ANY (ARRAY['Nam'::text, 'Nữ'::text, 'Khác'::text]))), CONSTRAINT profile_staff_marital_status_check CHECK ((marital_status = ANY (ARRAY['single'::text, 'married'::text, 'divorced'::text, 'widowed'::text]))), CONSTRAINT profile_staff_pkey PRIMARY KEY (id), CONSTRAINT profile_staff_political_theory_check CHECK ((political_theory = ANY (ARRAY['sơ cấp'::text, 'trung cấp'::text, 'cao cấp'::text]))), CONSTRAINT profile_staff_profile_status_check CHECK ((profile_status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'approved'::text]))), CONSTRAINT profile_staff_staff_type_check CHECK ((staff_type = ANY (ARRAY['lecturer'::text, 'researcher'::text, 'staff'::text]))), CONSTRAINT profile_staff_user_id_key UNIQUE (user_id), CONSTRAINT profile_staff_last_updated_by_fkey FOREIGN KEY (last_updated_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT profile_staff_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL, CONSTRAINT profile_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT);
CREATE INDEX idx_staff_employment ON public.profile_staff USING btree (employment_status);
CREATE INDEX idx_staff_profile_status ON public.profile_staff USING btree (profile_status);
CREATE INDEX idx_staff_unit ON public.profile_staff USING btree (unit_id);

-- Table Triggers

create trigger trg_staff_updated_at before
update
    on
    public.profile_staff for each row execute function fn_set_updated_at();
create trigger trg_audit_profile_staff after
insert
    or
delete
    or
update
    on
    public.profile_staff for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_staff OWNER TO postgres;
GRANT ALL ON TABLE public.profile_staff TO postgres;


-- public.profile_work_histories definition

-- Drop table

-- DROP TABLE public.profile_work_histories;

CREATE TABLE public.profile_work_histories ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, history_type text NOT NULL, from_date date NULL, to_date date NULL, unit_name text NOT NULL, position_name text NULL, activity_type text NULL, status text DEFAULT 'pending'::text NOT NULL, approved_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_work_histories_history_type_check CHECK ((history_type = ANY (ARRAY['chinh_quyen'::text, 'dang'::text, 'cong_doan'::text, 'doan'::text, 'quan_ngu_chinh_tri'::text]))), CONSTRAINT profile_work_histories_pkey PRIMARY KEY (id), CONSTRAINT profile_work_histories_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT profile_work_histories_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT profile_work_histories_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_work_hist_profile ON public.profile_work_histories USING btree (profile_id);
CREATE INDEX idx_work_hist_type ON public.profile_work_histories USING btree (profile_id, history_type);

-- Table Triggers

create trigger trg_audit_profile_work_histories after
insert
    or
delete
    or
update
    on
    public.profile_work_histories for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_work_histories OWNER TO postgres;
GRANT ALL ON TABLE public.profile_work_histories TO postgres;


-- public.recruitment_contract_extensions definition

-- Drop table

-- DROP TABLE public.recruitment_contract_extensions;

CREATE TABLE public.recruitment_contract_extensions ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, decision_number text NULL, signed_date date NULL, extension_period text NULL, start_date date NULL, end_date date NULL, using_unit_id uuid NULL, position_name text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT recruitment_contract_extensions_pkey PRIMARY KEY (id), CONSTRAINT recruitment_contract_extensions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT recruitment_contract_extensions_using_unit_id_fkey FOREIGN KEY (using_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);
CREATE INDEX idx_extensions_profile ON public.recruitment_contract_extensions USING btree (profile_id);

-- Table Triggers

create trigger trg_audit_recruitment_contract_extensions after
insert
    or
delete
    or
update
    on
    public.recruitment_contract_extensions for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.recruitment_contract_extensions OWNER TO postgres;
GRANT ALL ON TABLE public.recruitment_contract_extensions TO postgres;


-- public.recruitment_contracts definition

-- Drop table

-- DROP TABLE public.recruitment_contracts;

CREATE TABLE public.recruitment_contracts ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, contract_number text NULL, contract_type text NOT NULL, start_date date NOT NULL, end_date date NULL, recruiting_unit_id uuid NULL, current_contract bool DEFAULT false NOT NULL, assigned_work text NULL, policy_object text NULL, insurance_joined_at date NULL, salary_grade text NULL, status text DEFAULT 'draft'::text NOT NULL, workflow_id uuid NULL, signed_at timestamptz NULL, created_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT recruitment_contracts_contract_type_check CHECK ((contract_type = ANY (ARRAY['probation'::text, 'fixed_term'::text, 'indefinite'::text, 'part_time'::text]))), CONSTRAINT recruitment_contracts_pkey PRIMARY KEY (id), CONSTRAINT recruitment_contracts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'expired'::text, 'terminated'::text, 'renewed'::text]))), CONSTRAINT fk_contracts_workflow FOREIGN KEY (workflow_id) REFERENCES public.wf_instances(id) ON DELETE SET NULL, CONSTRAINT recruitment_contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT recruitment_contracts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE RESTRICT, CONSTRAINT recruitment_contracts_recruiting_unit_id_fkey FOREIGN KEY (recruiting_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);
CREATE INDEX idx_contracts_end_date ON public.recruitment_contracts USING btree (end_date) WHERE (status = 'active'::text);
CREATE INDEX idx_contracts_profile ON public.recruitment_contracts USING btree (profile_id);
CREATE INDEX idx_contracts_status ON public.recruitment_contracts USING btree (status);

-- Table Triggers

create trigger trg_audit_recruitment_contracts after
insert
    or
delete
    or
update
    on
    public.recruitment_contracts for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.recruitment_contracts OWNER TO postgres;
GRANT ALL ON TABLE public.recruitment_contracts TO postgres;


-- public.recruitment_info definition

-- Drop table

-- DROP TABLE public.recruitment_info;

CREATE TABLE public.recruitment_info ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, recruiting_unit_id uuid NULL, recruitment_date date NULL, salary_form text NULL, previous_occupation text NULL, edu_sector_start_year int4 NULL, vnu_start_date date NULL, work_seniority_years numeric(5, 2) NULL, longest_job text NULL, job_group text NULL, job_position_vnu text NULL, job_position_unit text NULL, main_assigned_work text NULL, work_unit_count int4 NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT recruitment_info_pkey PRIMARY KEY (id), CONSTRAINT recruitment_info_profile_id_key UNIQUE (profile_id), CONSTRAINT recruitment_info_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT recruitment_info_recruiting_unit_id_fkey FOREIGN KEY (recruiting_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);

-- Permissions

ALTER TABLE public.recruitment_info OWNER TO postgres;
GRANT ALL ON TABLE public.recruitment_info TO postgres;


-- public.recruitment_proposals definition

-- Drop table

-- DROP TABLE public.recruitment_proposals;

CREATE TABLE public.recruitment_proposals ( id uuid DEFAULT gen_random_uuid() NOT NULL, proposing_unit uuid NOT NULL, position_name text NOT NULL, required_degree text NULL, required_exp_years int4 NULL, quota int4 DEFAULT 1 NOT NULL, reason text NULL, academic_year text NULL, status text DEFAULT 'draft'::text NOT NULL, workflow_id uuid NULL, created_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT recruitment_proposals_pkey PRIMARY KEY (id), CONSTRAINT recruitment_proposals_quota_check CHECK ((quota > 0)), CONSTRAINT recruitment_proposals_required_degree_check CHECK ((required_degree = ANY (ARRAY['bachelor'::text, 'master'::text, 'phd'::text]))), CONSTRAINT recruitment_proposals_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'processing'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT fk_proposals_workflow FOREIGN KEY (workflow_id) REFERENCES public.wf_instances(id) ON DELETE SET NULL, CONSTRAINT recruitment_proposals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT recruitment_proposals_proposing_unit_fkey FOREIGN KEY (proposing_unit) REFERENCES public.organizational_units(id));
CREATE INDEX idx_proposals_status ON public.recruitment_proposals USING btree (status);
CREATE INDEX idx_proposals_unit ON public.recruitment_proposals USING btree (proposing_unit);

-- Permissions

ALTER TABLE public.recruitment_proposals OWNER TO postgres;
GRANT ALL ON TABLE public.recruitment_proposals TO postgres;


-- public.resource_scopes definition

-- Drop table

-- DROP TABLE public.resource_scopes;

CREATE TABLE public.resource_scopes ( resource_type text NOT NULL, resource_id uuid NOT NULL, owner_id uuid NULL, unit_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT resource_scopes_pkey PRIMARY KEY (resource_type, resource_id), CONSTRAINT resource_scopes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT resource_scopes_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL);
CREATE INDEX idx_resource_scopes_owner ON public.resource_scopes USING btree (owner_id);
CREATE INDEX idx_resource_scopes_unit ON public.resource_scopes USING btree (unit_id);

-- Permissions

ALTER TABLE public.resource_scopes OWNER TO postgres;
GRANT ALL ON TABLE public.resource_scopes TO postgres;


-- public.reward_commendations definition

-- Drop table

-- DROP TABLE public.reward_commendations;

CREATE TABLE public.reward_commendations ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, decision_number text NULL, decision_date date NULL, award_level text NOT NULL, award_name text NOT NULL, "content" text NULL, academic_year text NULL, is_highest_award bool DEFAULT false NOT NULL, status text DEFAULT 'pending'::text NOT NULL, attachment_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT reward_commendations_award_level_check CHECK ((award_level = ANY (ARRAY['co_so'::text, 'dhqg'::text, 'bo'::text, 'chinh_phu'::text, 'nha_nuoc'::text]))), CONSTRAINT reward_commendations_pkey PRIMARY KEY (id), CONSTRAINT reward_commendations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text]))), CONSTRAINT reward_commendations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_commend_profile ON public.reward_commendations USING btree (profile_id);

-- Table Triggers

create trigger trg_audit_reward_commendations after
insert
    or
delete
    or
update
    on
    public.reward_commendations for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.reward_commendations OWNER TO postgres;
GRANT ALL ON TABLE public.reward_commendations TO postgres;


-- public.reward_profiles definition

-- Drop table

-- DROP TABLE public.reward_profiles;

CREATE TABLE public.reward_profiles ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, academic_year text NOT NULL, self_assessment text NULL, months_worked int4 NULL, leave_days int4 DEFAULT 0 NOT NULL, is_eligible bool DEFAULT true NOT NULL, ineligible_reason text NULL, ballot_result jsonb NULL, status text DEFAULT 'draft'::text NOT NULL, workflow_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT reward_profiles_pkey PRIMARY KEY (id), CONSTRAINT reward_profiles_profile_id_academic_year_key UNIQUE (profile_id, academic_year), CONSTRAINT reward_profiles_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'ballot_done'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT fk_reward_profiles_workflow FOREIGN KEY (workflow_id) REFERENCES public.wf_instances(id) ON DELETE SET NULL, CONSTRAINT reward_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_reward_profiles_status ON public.reward_profiles USING btree (status);
CREATE INDEX idx_reward_profiles_year ON public.reward_profiles USING btree (academic_year);

-- Permissions

ALTER TABLE public.reward_profiles OWNER TO postgres;
GRANT ALL ON TABLE public.reward_profiles TO postgres;


-- public.reward_titles definition

-- Drop table

-- DROP TABLE public.reward_titles;

CREATE TABLE public.reward_titles ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, title_name text NOT NULL, title_level text NOT NULL, awarded_year text NOT NULL, decision_number text NULL, awarded_by text NULL, is_highest bool DEFAULT false NOT NULL, attachment_id uuid NULL, status text DEFAULT 'pending'::text NOT NULL, revoked_at timestamptz NULL, revoke_reason text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT reward_titles_pkey PRIMARY KEY (id), CONSTRAINT reward_titles_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'revoked'::text]))), CONSTRAINT reward_titles_title_level_check CHECK ((title_level = ANY (ARRAY['unit'::text, 'university'::text, 'ministry'::text]))), CONSTRAINT reward_titles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_reward_titles_profile ON public.reward_titles USING btree (profile_id);
CREATE INDEX idx_reward_titles_year ON public.reward_titles USING btree (awarded_year);

-- Table Triggers

create trigger trg_audit_reward_titles after
insert
    or
delete
    or
update
    on
    public.reward_titles for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.reward_titles OWNER TO postgres;
GRANT ALL ON TABLE public.reward_titles TO postgres;


-- public.salary_info definition

-- Drop table

-- DROP TABLE public.salary_info;

CREATE TABLE public.salary_info ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, occupation_group text NULL, occupation_title text NULL, occupation_code text NULL, salary_grade int4 NULL, salary_coefficient numeric(5, 2) NULL, is_over_grade bool DEFAULT false NOT NULL, effective_date date NULL, decision_number text NULL, position_allowance numeric(5, 2) NULL, responsibility_allowance numeric(5, 2) NULL, teacher_incentive_pct numeric(5, 2) NULL, regional_allowance numeric(5, 2) NULL, other_allowance numeric(5, 2) NULL, harmful_allowance numeric(5, 2) NULL, seniority_allowance_pct numeric(5, 2) NULL, enjoyment_rate_pct numeric(5, 2) NULL, actual_coefficient numeric(5, 2) NULL, next_grade_date date NULL, next_seniority_date date NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT salary_info_pkey PRIMARY KEY (id), CONSTRAINT salary_info_profile_id_key UNIQUE (profile_id), CONSTRAINT salary_info_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_salary_next_grade ON public.salary_info USING btree (next_grade_date);

-- Table Triggers

create trigger trg_audit_salary_info after
insert
    or
delete
    or
update
    on
    public.salary_info for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.salary_info OWNER TO postgres;
GRANT ALL ON TABLE public.salary_info TO postgres;


-- public.salary_logs definition

-- Drop table

-- DROP TABLE public.salary_logs;

CREATE TABLE public.salary_logs ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, occupation_code text NULL, salary_grade int4 NULL, salary_coefficient numeric(5, 2) NULL, salary_level numeric(15, 2) NULL, is_over_grade bool DEFAULT false NOT NULL, position_allowance numeric(5, 2) NULL, effective_date date NULL, next_grade_date date NULL, decision_number text NULL, occupation_group text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT salary_logs_pkey PRIMARY KEY (id), CONSTRAINT salary_logs_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_salary_logs_date ON public.salary_logs USING btree (profile_id, effective_date DESC);
CREATE INDEX idx_salary_logs_profile ON public.salary_logs USING btree (profile_id);

-- Table Triggers

create trigger trg_audit_salary_logs after
insert
    or
delete
    or
update
    on
    public.salary_logs for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.salary_logs OWNER TO postgres;
GRANT ALL ON TABLE public.salary_logs TO postgres;


-- public.salary_upgrade_proposals definition

-- Drop table

-- DROP TABLE public.salary_upgrade_proposals;

CREATE TABLE public.salary_upgrade_proposals ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, current_occupation_code text NULL, current_grade int4 NULL, current_coefficient numeric(5, 2) NULL, current_effective_date date NULL, current_title text NULL, attachment_id uuid NULL, status text DEFAULT 'pending'::text NOT NULL, proposed_grade int4 NULL, proposed_coefficient numeric(5, 2) NULL, proposed_next_date date NULL, upgrade_type text NULL, workflow_id uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT salary_upgrade_proposals_pkey PRIMARY KEY (id), CONSTRAINT salary_upgrade_proposals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT salary_upgrade_proposals_upgrade_type_check CHECK ((upgrade_type = ANY (ARRAY['NBL thường xuyên'::text, 'NBL trước hạn'::text, 'NBL vượt bậc'::text]))), CONSTRAINT fk_salary_upgrade_workflow FOREIGN KEY (workflow_id) REFERENCES public.wf_instances(id) ON DELETE SET NULL, CONSTRAINT salary_upgrade_proposals_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_salary_upgrade_profile ON public.salary_upgrade_proposals USING btree (profile_id);
CREATE INDEX idx_salary_upgrade_status ON public.salary_upgrade_proposals USING btree (status);

-- Table Triggers

create trigger trg_audit_salary_upgrade_proposals after
insert
    or
delete
    or
update
    on
    public.salary_upgrade_proposals for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.salary_upgrade_proposals OWNER TO postgres;
GRANT ALL ON TABLE public.salary_upgrade_proposals TO postgres;


-- public.sys_attachments definition

-- Drop table

-- DROP TABLE public.sys_attachments;

CREATE TABLE public.sys_attachments ( id uuid DEFAULT gen_random_uuid() NOT NULL, resource_type text NOT NULL, resource_id uuid NOT NULL, uploaded_by uuid NOT NULL, file_name text NOT NULL, file_size_bytes int8 NULL, mime_type text NULL, storage_key text NOT NULL, storage_bucket text DEFAULT 'hrm-files'::text NOT NULL, category text NULL, is_verified bool DEFAULT false NOT NULL, verified_by uuid NULL, verified_at timestamptz NULL, uploaded_at timestamptz DEFAULT now() NOT NULL, deleted_at timestamptz NULL, CONSTRAINT sys_attachments_category_check CHECK ((category = ANY (ARRAY['evidence'::text, 'decision'::text, 'ballot_minutes'::text, 'cv'::text, 'contract_doc'::text, 'other'::text]))), CONSTRAINT sys_attachments_pkey PRIMARY KEY (id), CONSTRAINT sys_attachments_storage_key_key UNIQUE (storage_key), CONSTRAINT sys_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id), CONSTRAINT sys_attachments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL);
CREATE INDEX idx_attach_resource ON public.sys_attachments USING btree (resource_type, resource_id);
CREATE INDEX idx_attach_uploader ON public.sys_attachments USING btree (uploaded_by);

-- Permissions

ALTER TABLE public.sys_attachments OWNER TO postgres;
GRANT ALL ON TABLE public.sys_attachments TO postgres;


-- public.sys_audit_logs definition

-- Drop table

-- DROP TABLE public.sys_audit_logs;

CREATE TABLE public.sys_audit_logs ( id bigserial NOT NULL, event_time timestamptz DEFAULT now() NOT NULL, actor_id uuid NULL, actor_ip inet NULL, "action" text NOT NULL, resource_type text NOT NULL, resource_id text NULL, schema_name text NULL, table_name text NULL, old_values jsonb NULL, new_values jsonb NULL, diff jsonb NULL, session_id text NULL, request_id text NULL, CONSTRAINT sys_audit_logs_pkey PRIMARY KEY (id, event_time), CONSTRAINT sys_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL) PARTITION BY RANGE (event_time);

-- Permissions

ALTER TABLE public.sys_audit_logs OWNER TO postgres;
GRANT ALL ON TABLE public.sys_audit_logs TO postgres;


-- public.sys_audit_logs_2026 definition

CREATE TABLE public.sys_audit_logs_2026 PARTITION OF public.sys_audit_logs  FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');


-- public.sys_notifications definition

-- Drop table

-- DROP TABLE public.sys_notifications;

CREATE TABLE public.sys_notifications ( id uuid DEFAULT gen_random_uuid() NOT NULL, template_code text NULL, recipient_id uuid NOT NULL, resource_type text NULL, resource_id uuid NULL, payload jsonb DEFAULT '{}'::jsonb NOT NULL, channel text DEFAULT 'in_app'::text NOT NULL, status text DEFAULT 'pending'::text NOT NULL, scheduled_at timestamptz DEFAULT now() NOT NULL, sent_at timestamptz NULL, read_at timestamptz NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT sys_notifications_channel_check CHECK ((channel = ANY (ARRAY['in_app'::text, 'email'::text]))), CONSTRAINT sys_notifications_pkey PRIMARY KEY (id), CONSTRAINT sys_notifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'read'::text, 'failed'::text]))), CONSTRAINT sys_notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE, CONSTRAINT sys_notifications_template_code_fkey FOREIGN KEY (template_code) REFERENCES public.sys_notification_templates(code) ON DELETE SET NULL);
CREATE INDEX idx_notif_recipient ON public.sys_notifications USING btree (recipient_id, status);
CREATE INDEX idx_notif_scheduled ON public.sys_notifications USING btree (scheduled_at) WHERE (status = 'pending'::text);

-- Permissions

ALTER TABLE public.sys_notifications OWNER TO postgres;
GRANT ALL ON TABLE public.sys_notifications TO postgres;


-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles ( id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, role_id uuid NOT NULL, scope_type text DEFAULT 'school'::text NOT NULL, scope_unit_id uuid NULL, granted_by uuid NULL, granted_at timestamptz DEFAULT now() NOT NULL, expires_at timestamptz NULL, CONSTRAINT user_roles_pkey PRIMARY KEY (id), CONSTRAINT user_roles_scope_type_check CHECK ((scope_type = ANY (ARRAY['school'::text, 'faculty'::text, 'department'::text, 'self'::text]))), CONSTRAINT user_roles_user_id_role_id_scope_unit_id_key UNIQUE (user_id, role_id, scope_unit_id), CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE, CONSTRAINT user_roles_scope_unit_id_fkey FOREIGN KEY (scope_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL, CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE);
CREATE INDEX idx_user_roles_expires ON public.user_roles USING btree (expires_at) WHERE (expires_at IS NOT NULL);
CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);

-- Table Triggers

create trigger trg_audit_user_roles after
insert
    or
delete
    or
update
    on
    public.user_roles for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.user_roles OWNER TO postgres;
GRANT ALL ON TABLE public.user_roles TO postgres;


-- public.workload_annual_summaries definition

-- Drop table

-- DROP TABLE public.workload_annual_summaries;

CREATE TABLE public.workload_annual_summaries ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, academic_year text NOT NULL, total_teaching numeric DEFAULT 0 NOT NULL, total_research numeric DEFAULT 0 NOT NULL, total_other numeric DEFAULT 0 NOT NULL, quota_teaching numeric NULL, quota_research numeric NULL, is_teaching_violation bool DEFAULT false NOT NULL, is_research_violation bool DEFAULT false NOT NULL, finalized_at timestamptz NULL, CONSTRAINT workload_annual_summaries_pkey PRIMARY KEY (id), CONSTRAINT workload_annual_summaries_profile_id_academic_year_key UNIQUE (profile_id, academic_year), CONSTRAINT workload_annual_summaries_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_annual_violations ON public.workload_annual_summaries USING btree (is_teaching_violation, is_research_violation) WHERE ((is_teaching_violation = true) OR (is_research_violation = true));
CREATE INDEX idx_annual_year ON public.workload_annual_summaries USING btree (academic_year);

-- Permissions

ALTER TABLE public.workload_annual_summaries OWNER TO postgres;
GRANT ALL ON TABLE public.workload_annual_summaries TO postgres;


-- public.workload_evidences definition

-- Drop table

-- DROP TABLE public.workload_evidences;

CREATE TABLE public.workload_evidences ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, academic_year text NOT NULL, evidence_type text NOT NULL, title text NOT NULL, hours_claimed numeric NULL, coef_applied numeric DEFAULT 1.0 NOT NULL, hours_converted numeric GENERATED ALWAYS AS (hours_claimed * coef_applied) STORED NULL, status text DEFAULT 'pending'::text NOT NULL, reviewed_by uuid NULL, reviewed_at timestamptz NULL, reject_reason text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT workload_evidences_evidence_type_check CHECK ((evidence_type = ANY (ARRAY['teaching'::text, 'research_paper'::text, 'research_project'::text, 'other_task'::text]))), CONSTRAINT workload_evidences_pkey PRIMARY KEY (id), CONSTRAINT workload_evidences_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT workload_evidences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT workload_evidences_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL);
CREATE INDEX idx_evidences_pending ON public.workload_evidences USING btree (status) WHERE (status = 'pending'::text);
CREATE INDEX idx_evidences_profile_year ON public.workload_evidences USING btree (profile_id, academic_year);

-- Permissions

ALTER TABLE public.workload_evidences OWNER TO postgres;
GRANT ALL ON TABLE public.workload_evidences TO postgres;


-- public.workload_individual_quotas definition

-- Drop table

-- DROP TABLE public.workload_individual_quotas;

CREATE TABLE public.workload_individual_quotas ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, academic_year text NOT NULL, teaching_hours numeric NOT NULL, research_hours numeric NOT NULL, other_hours numeric DEFAULT 0 NOT NULL, reduction_pct numeric DEFAULT 0 NOT NULL, reduction_reason text NULL, calculated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT workload_individual_quotas_pkey PRIMARY KEY (id), CONSTRAINT workload_individual_quotas_profile_id_academic_year_key UNIQUE (profile_id, academic_year), CONSTRAINT workload_individual_quotas_reduction_pct_check CHECK (((reduction_pct >= (0)::numeric) AND (reduction_pct <= (1)::numeric))), CONSTRAINT workload_individual_quotas_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_ind_quotas_year ON public.workload_individual_quotas USING btree (academic_year);

-- Permissions

ALTER TABLE public.workload_individual_quotas OWNER TO postgres;
GRANT ALL ON TABLE public.workload_individual_quotas TO postgres;


-- public.appointment_records definition

-- Drop table

-- DROP TABLE public.appointment_records;

CREATE TABLE public.appointment_records ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, unit_id uuid NOT NULL, position_name text NOT NULL, term_years int4 DEFAULT 5 NOT NULL, start_date date NOT NULL, end_date date NOT NULL, appointment_type text NOT NULL, status text DEFAULT 'active'::text NOT NULL, decision_number text NULL, workflow_id uuid NULL, created_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT appointment_records_appointment_type_check CHECK ((appointment_type = ANY (ARRAY['new'::text, 'reappoint'::text, 'transfer'::text, 'dismiss'::text]))), CONSTRAINT appointment_records_pkey PRIMARY KEY (id), CONSTRAINT appointment_records_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'dismissed'::text, 'transferred'::text]))), CONSTRAINT appointment_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT appointment_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE RESTRICT, CONSTRAINT appointment_records_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.organizational_units(id), CONSTRAINT fk_appointments_workflow FOREIGN KEY (workflow_id) REFERENCES public.wf_instances(id) ON DELETE SET NULL);
CREATE INDEX idx_appoint_end_date ON public.appointment_records USING btree (end_date) WHERE (status = 'active'::text);
CREATE INDEX idx_appoint_profile ON public.appointment_records USING btree (profile_id);
CREATE INDEX idx_appoint_unit ON public.appointment_records USING btree (unit_id);

-- Table Triggers

create trigger trg_audit_appointment_records after
insert
    or
delete
    or
update
    on
    public.appointment_records for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.appointment_records OWNER TO postgres;
GRANT ALL ON TABLE public.appointment_records TO postgres;


-- public.profile_education_histories definition

-- Drop table

-- DROP TABLE public.profile_education_histories;

CREATE TABLE public.profile_education_histories ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, edu_type text NOT NULL, from_date date NULL, to_date date NULL, degree_level text NULL, institution text NULL, major text NULL, training_form text NULL, field text NULL, is_studying bool DEFAULT false NOT NULL, cert_name text NULL, lang_name text NULL, lang_level text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_education_histories_edu_type_check CHECK ((edu_type = ANY (ARRAY['degree'::text, 'certificate'::text, 'foreign_lang'::text, 'it'::text]))), CONSTRAINT profile_education_histories_lang_level_check CHECK ((lang_level = ANY (ARRAY['A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'C1'::text, 'C2'::text]))), CONSTRAINT profile_education_histories_pkey PRIMARY KEY (id), CONSTRAINT profile_education_histories_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_edu_hist_profile ON public.profile_education_histories USING btree (profile_id);
CREATE INDEX idx_edu_hist_type ON public.profile_education_histories USING btree (profile_id, edu_type);

-- Table Triggers

create trigger trg_audit_profile_education_histories after
insert
    or
delete
    or
update
    on
    public.profile_education_histories for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_education_histories OWNER TO postgres;
GRANT ALL ON TABLE public.profile_education_histories TO postgres;


-- public.profile_extra_info definition

-- Drop table

-- DROP TABLE public.profile_extra_info;

CREATE TABLE public.profile_extra_info ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, arrest_history text NULL, old_regime_work text NULL, foreign_org_relations text NULL, foreign_relatives text NULL, income_salary numeric(15, 2) NULL, income_other_sources numeric(15, 2) NULL, house_type_granted text NULL, house_area_granted numeric(8, 2) NULL, house_type_owned text NULL, house_area_owned numeric(8, 2) NULL, land_granted_m2 numeric(10, 2) NULL, land_purchased_m2 numeric(10, 2) NULL, land_business_m2 numeric(10, 2) NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_extra_info_pkey PRIMARY KEY (id), CONSTRAINT profile_extra_info_profile_id_key UNIQUE (profile_id), CONSTRAINT profile_extra_info_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);

-- Table Triggers

create trigger trg_audit_profile_extra_info after
insert
    or
delete
    or
update
    on
    public.profile_extra_info for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_extra_info OWNER TO postgres;
GRANT ALL ON TABLE public.profile_extra_info TO postgres;


-- public.profile_family_relations definition

-- Drop table

-- DROP TABLE public.profile_family_relations;

CREATE TABLE public.profile_family_relations ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, side text DEFAULT 'self'::text NOT NULL, relationship text NOT NULL, full_name text NOT NULL, birth_year int4 NULL, description text NULL, status text DEFAULT 'pending'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_family_relations_pkey PRIMARY KEY (id), CONSTRAINT profile_family_relations_side_check CHECK ((side = ANY (ARRAY['self'::text, 'spouse'::text]))), CONSTRAINT profile_family_relations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT profile_family_relations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);
CREATE INDEX idx_family_profile ON public.profile_family_relations USING btree (profile_id);

-- Table Triggers

create trigger trg_audit_profile_family_relations after
insert
    or
delete
    or
update
    on
    public.profile_family_relations for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_family_relations OWNER TO postgres;
GRANT ALL ON TABLE public.profile_family_relations TO postgres;


-- public.profile_health_records definition

-- Drop table

-- DROP TABLE public.profile_health_records;

CREATE TABLE public.profile_health_records ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, health_status text NULL, weight_kg numeric(5, 1) NULL, height_cm numeric(5, 1) NULL, blood_type text NULL, notes text NULL, updated_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_health_records_blood_type_check CHECK ((blood_type = ANY (ARRAY['A'::text, 'B'::text, 'AB'::text, 'O'::text, '0'::text]))), CONSTRAINT profile_health_records_pkey PRIMARY KEY (id), CONSTRAINT profile_health_records_profile_id_key UNIQUE (profile_id), CONSTRAINT profile_health_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE);

-- Table Triggers

create trigger trg_audit_profile_health_records after
insert
    or
delete
    or
update
    on
    public.profile_health_records for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.profile_health_records OWNER TO postgres;
GRANT ALL ON TABLE public.profile_health_records TO postgres;


-- public.profile_positions definition

-- Drop table

-- DROP TABLE public.profile_positions;

CREATE TABLE public.profile_positions ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, unit_id uuid NOT NULL, position_name text NOT NULL, position_type text NOT NULL, start_date date NOT NULL, end_date date NULL, decision_ref text NULL, is_primary bool DEFAULT false NOT NULL, CONSTRAINT profile_positions_pkey PRIMARY KEY (id), CONSTRAINT profile_positions_position_type_check CHECK ((position_type = ANY (ARRAY['leadership'::text, 'party'::text, 'union'::text, 'academic'::text]))), CONSTRAINT profile_positions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT profile_positions_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.organizational_units(id) ON DELETE RESTRICT);
CREATE INDEX idx_positions_current ON public.profile_positions USING btree (profile_id) WHERE (end_date IS NULL);
CREATE INDEX idx_positions_profile ON public.profile_positions USING btree (profile_id);

-- Permissions

ALTER TABLE public.profile_positions OWNER TO postgres;
GRANT ALL ON TABLE public.profile_positions TO postgres;


-- public.profile_research_works definition

-- Drop table

-- DROP TABLE public.profile_research_works;

CREATE TABLE public.profile_research_works ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, work_type text NOT NULL, title text NOT NULL, journal_name text NULL, indexing text NULL, publish_year int4 NULL, doi text NULL, academic_year text NULL, status text DEFAULT 'pending'::text NOT NULL, verified_by uuid NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT profile_research_works_indexing_check CHECK ((indexing = ANY (ARRAY['Q1'::text, 'Q2'::text, 'Q3'::text, 'Q4'::text, 'Scopus'::text, 'domestic'::text]))), CONSTRAINT profile_research_works_pkey PRIMARY KEY (id), CONSTRAINT profile_research_works_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))), CONSTRAINT profile_research_works_work_type_check CHECK ((work_type = ANY (ARRAY['journal'::text, 'conference'::text, 'project'::text, 'patent'::text]))), CONSTRAINT profile_research_works_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT profile_research_works_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL);
CREATE INDEX idx_research_indexing ON public.profile_research_works USING btree (indexing);
CREATE INDEX idx_research_profile ON public.profile_research_works USING btree (profile_id);
CREATE INDEX idx_research_year ON public.profile_research_works USING btree (academic_year);

-- Permissions

ALTER TABLE public.profile_research_works OWNER TO postgres;
GRANT ALL ON TABLE public.profile_research_works TO postgres;


-- public.recruitment_candidates definition

-- Drop table

-- DROP TABLE public.recruitment_candidates;

CREATE TABLE public.recruitment_candidates ( id uuid DEFAULT gen_random_uuid() NOT NULL, proposal_id uuid NOT NULL, full_name text NOT NULL, email text NULL, phone text NULL, "degree" text NULL, status text DEFAULT 'applied'::text NOT NULL, notes text NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT recruitment_candidates_pkey PRIMARY KEY (id), CONSTRAINT recruitment_candidates_status_check CHECK ((status = ANY (ARRAY['applied'::text, 'shortlisted'::text, 'passed'::text, 'failed'::text, 'hired'::text]))), CONSTRAINT recruitment_candidates_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.recruitment_proposals(id) ON DELETE CASCADE);
CREATE INDEX idx_candidates_proposal ON public.recruitment_candidates USING btree (proposal_id);
CREATE INDEX idx_candidates_status ON public.recruitment_candidates USING btree (status);

-- Permissions

ALTER TABLE public.recruitment_candidates OWNER TO postgres;
GRANT ALL ON TABLE public.recruitment_candidates TO postgres;


-- public.reward_disciplinary_records definition

-- Drop table

-- DROP TABLE public.reward_disciplinary_records;

CREATE TABLE public.reward_disciplinary_records ( id uuid DEFAULT gen_random_uuid() NOT NULL, profile_id uuid NOT NULL, discipline_type text NOT NULL, reason text NOT NULL, decision_number text NULL, unit_name text NULL, issued_date date NOT NULL, issued_by uuid NULL, is_highest bool DEFAULT false NOT NULL, related_title_id uuid NULL, attachment_id uuid NULL, status text DEFAULT 'pending'::text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, CONSTRAINT reward_disciplinary_records_discipline_type_check CHECK ((discipline_type = ANY (ARRAY['khien_trach'::text, 'canh_cao'::text, 'ha_bac_luong'::text, 'buoc_thoi_viec'::text]))), CONSTRAINT reward_disciplinary_records_pkey PRIMARY KEY (id), CONSTRAINT reward_disciplinary_records_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text]))), CONSTRAINT reward_disciplinary_records_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON DELETE SET NULL, CONSTRAINT reward_disciplinary_records_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile_staff(id) ON DELETE CASCADE, CONSTRAINT reward_disciplinary_records_related_title_id_fkey FOREIGN KEY (related_title_id) REFERENCES public.reward_titles(id) ON DELETE SET NULL);
CREATE INDEX idx_disciplinary_profile ON public.reward_disciplinary_records USING btree (profile_id);

-- Table Triggers

create trigger trg_audit_reward_disciplinary_records after
insert
    or
delete
    or
update
    on
    public.reward_disciplinary_records for each row execute function fn_audit_log();

-- Permissions

ALTER TABLE public.reward_disciplinary_records OWNER TO postgres;
GRANT ALL ON TABLE public.reward_disciplinary_records TO postgres;



-- DROP FUNCTION public.armor(bytea);

CREATE OR REPLACE FUNCTION public.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- Permissions

ALTER FUNCTION public.armor(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.armor(bytea) TO postgres;

-- DROP FUNCTION public.armor(bytea, _text, _text);

CREATE OR REPLACE FUNCTION public.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- Permissions

ALTER FUNCTION public.armor(bytea, _text, _text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.armor(bytea, _text, _text) TO postgres;

-- DROP FUNCTION public.crypt(text, text);

CREATE OR REPLACE FUNCTION public.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$
;

-- Permissions

ALTER FUNCTION public.crypt(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.crypt(text, text) TO postgres;

-- DROP FUNCTION public.dearmor(text);

CREATE OR REPLACE FUNCTION public.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$
;

-- Permissions

ALTER FUNCTION public.dearmor(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dearmor(text) TO postgres;

-- DROP FUNCTION public.decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$
;

-- Permissions

ALTER FUNCTION public.decrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.decrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$
;

-- Permissions

ALTER FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.digest(bytea, text);

CREATE OR REPLACE FUNCTION public.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- Permissions

ALTER FUNCTION public.digest(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.digest(bytea, text) TO postgres;

-- DROP FUNCTION public.digest(text, text);

CREATE OR REPLACE FUNCTION public.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- Permissions

ALTER FUNCTION public.digest(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.digest(text, text) TO postgres;

-- DROP FUNCTION public.encrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$
;

-- Permissions

ALTER FUNCTION public.encrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.encrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$
;

-- Permissions

ALTER FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.fn_audit_log();

CREATE OR REPLACE FUNCTION public.fn_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_actor_id  UUID;
    v_diff      JSONB := '{}';
    v_old       JSONB;
    v_new       JSONB;
    k           TEXT;
BEGIN
    -- Lấy user_id từ session variable (set bởi app: SET LOCAL app.current_user_id = '...')
    BEGIN
        v_actor_id := current_setting('app.current_user_id', TRUE)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_new := to_jsonb(NEW);
        INSERT INTO sys_audit_logs
            (actor_id, action, resource_type, table_name, schema_name, new_values)
        VALUES
            (v_actor_id, 'INSERT', TG_TABLE_NAME, TG_TABLE_NAME, TG_TABLE_SCHEMA, v_new);
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        -- Tính diff: chỉ lấy các field thực sự thay đổi
        FOR k IN SELECT jsonb_object_keys(v_new) LOOP
            IF v_old->k IS DISTINCT FROM v_new->k THEN
                v_diff := v_diff || jsonb_build_object(k,
                    jsonb_build_object('from', v_old->k, 'to', v_new->k));
            END IF;
        END LOOP;
        INSERT INTO sys_audit_logs
            (actor_id, action, resource_type, table_name, schema_name,
             resource_id, old_values, new_values, diff)
        VALUES
            (v_actor_id, 'UPDATE', TG_TABLE_NAME, TG_TABLE_NAME, TG_TABLE_SCHEMA,
             (v_new->>'id'), v_old, v_new, v_diff);
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        v_old := to_jsonb(OLD);
        INSERT INTO sys_audit_logs
            (actor_id, action, resource_type, table_name, schema_name,
             resource_id, old_values)
        VALUES
            (v_actor_id, 'DELETE', TG_TABLE_NAME, TG_TABLE_NAME, TG_TABLE_SCHEMA,
             (v_old->>'id'), v_old);
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.fn_audit_log() OWNER TO postgres;
GRANT ALL ON FUNCTION public.fn_audit_log() TO postgres;

-- DROP FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;

-- Permissions

ALTER FUNCTION public.fn_set_updated_at() OWNER TO postgres;
GRANT ALL ON FUNCTION public.fn_set_updated_at() TO postgres;

-- DROP FUNCTION public.gen_random_bytes(int4);

CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$
;

-- Permissions

ALTER FUNCTION public.gen_random_bytes(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_random_bytes(int4) TO postgres;

-- DROP FUNCTION public.gen_random_uuid();

CREATE OR REPLACE FUNCTION public.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$
;

-- Permissions

ALTER FUNCTION public.gen_random_uuid() OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_random_uuid() TO postgres;

-- DROP FUNCTION public.gen_salt(text);

CREATE OR REPLACE FUNCTION public.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$
;

-- Permissions

ALTER FUNCTION public.gen_salt(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_salt(text) TO postgres;

-- DROP FUNCTION public.gen_salt(text, int4);

CREATE OR REPLACE FUNCTION public.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$
;

-- Permissions

ALTER FUNCTION public.gen_salt(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_salt(text, int4) TO postgres;

-- DROP FUNCTION public.gin_extract_query_trgm(text, internal, int2, internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;

-- Permissions

ALTER FUNCTION public.gin_extract_query_trgm(text, internal, int2, internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, int2, internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.gin_extract_value_trgm(text, internal);

CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;

-- Permissions

ALTER FUNCTION public.gin_extract_value_trgm(text, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO postgres;

-- DROP FUNCTION public.gin_trgm_consistent(internal, int2, text, int4, internal, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;

-- Permissions

ALTER FUNCTION public.gin_trgm_consistent(internal, int2, text, int4, internal, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, int2, text, int4, internal, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.gin_trgm_triconsistent(internal, int2, text, int4, internal, internal, internal);

CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;

-- Permissions

ALTER FUNCTION public.gin_trgm_triconsistent(internal, int2, text, int4, internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, int2, text, int4, internal, internal, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_compress(internal);

CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_compress(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO postgres;

-- DROP FUNCTION public.gtrgm_consistent(internal, text, int2, oid, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_consistent(internal, text, int2, oid, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, int2, oid, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_decompress(internal);

CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_decompress(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO postgres;

-- DROP FUNCTION public.gtrgm_distance(internal, text, int2, oid, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_distance(internal, text, int2, oid, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, int2, oid, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_in(cstring);

CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_in(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO postgres;

-- DROP FUNCTION public.gtrgm_options(internal);

CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_options(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO postgres;

-- DROP FUNCTION public.gtrgm_out(gtrgm);

CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_out(gtrgm) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_out(gtrgm) TO postgres;

-- DROP FUNCTION public.gtrgm_penalty(internal, internal, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_penalty(internal, internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_picksplit(internal, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_picksplit(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal) TO postgres;

-- DROP FUNCTION public.gtrgm_union(internal, internal);

CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;

-- Permissions

ALTER FUNCTION public.gtrgm_union(internal, internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO postgres;

-- DROP FUNCTION public.hmac(text, text, text);

CREATE OR REPLACE FUNCTION public.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- Permissions

ALTER FUNCTION public.hmac(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.hmac(text, text, text) TO postgres;

-- DROP FUNCTION public.hmac(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- Permissions

ALTER FUNCTION public.hmac(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_armor_headers(in text, out text, out text);

CREATE OR REPLACE FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$
;

-- Permissions

ALTER FUNCTION public.pgp_armor_headers(in text, out text, out text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_armor_headers(in text, out text, out text) TO postgres;

-- DROP FUNCTION public.pgp_key_id(bytea);

CREATE OR REPLACE FUNCTION public.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$
;

-- Permissions

ALTER FUNCTION public.pgp_key_id(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt(text, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt(text, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO postgres;

-- DROP FUNCTION public.set_limit(float4);

CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;

-- Permissions

ALTER FUNCTION public.set_limit(float4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.set_limit(float4) TO postgres;

-- DROP FUNCTION public.show_limit();

CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;

-- Permissions

ALTER FUNCTION public.show_limit() OWNER TO postgres;
GRANT ALL ON FUNCTION public.show_limit() TO postgres;

-- DROP FUNCTION public.show_trgm(text);

CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;

-- Permissions

ALTER FUNCTION public.show_trgm(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.show_trgm(text) TO postgres;

-- DROP FUNCTION public.similarity(text, text);

CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;

-- Permissions

ALTER FUNCTION public.similarity(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.similarity(text, text) TO postgres;

-- DROP FUNCTION public.similarity_dist(text, text);

CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;

-- Permissions

ALTER FUNCTION public.similarity_dist(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO postgres;

-- DROP FUNCTION public.similarity_op(text, text);

CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;

-- Permissions

ALTER FUNCTION public.similarity_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.similarity_op(text, text) TO postgres;

-- DROP FUNCTION public.strict_word_similarity(text, text);

CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;

-- Permissions

ALTER FUNCTION public.strict_word_similarity(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO postgres;

-- DROP FUNCTION public.strict_word_similarity_commutator_op(text, text);

CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;

-- Permissions

ALTER FUNCTION public.strict_word_similarity_commutator_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO postgres;

-- DROP FUNCTION public.strict_word_similarity_dist_commutator_op(text, text);

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;

-- Permissions

ALTER FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO postgres;

-- DROP FUNCTION public.strict_word_similarity_dist_op(text, text);

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;

-- Permissions

ALTER FUNCTION public.strict_word_similarity_dist_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO postgres;

-- DROP FUNCTION public.strict_word_similarity_op(text, text);

CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;

-- Permissions

ALTER FUNCTION public.strict_word_similarity_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO postgres;

-- DROP FUNCTION public.word_similarity(text, text);

CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;

-- Permissions

ALTER FUNCTION public.word_similarity(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.word_similarity(text, text) TO postgres;

-- DROP FUNCTION public.word_similarity_commutator_op(text, text);

CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;

-- Permissions

ALTER FUNCTION public.word_similarity_commutator_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO postgres;

-- DROP FUNCTION public.word_similarity_dist_commutator_op(text, text);

CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;

-- Permissions

ALTER FUNCTION public.word_similarity_dist_commutator_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO postgres;

-- DROP FUNCTION public.word_similarity_dist_op(text, text);

CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;

-- Permissions

ALTER FUNCTION public.word_similarity_dist_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO postgres;

-- DROP FUNCTION public.word_similarity_op(text, text);

CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;

-- Permissions

ALTER FUNCTION public.word_similarity_op(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO postgres;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;