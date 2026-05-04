import { pgEnum } from 'drizzle-orm/pg-core';

export const unitTypeEnum = pgEnum('unit_type', ['school', 'faculty', 'department', 'lab']);

export const genderEnum = pgEnum('gender', ['Nam', 'Nữ', 'Khác']);

export const maritalStatusEnum = pgEnum('marital_status', ['single', 'married', 'divorced', 'widowed']);

export const academicDegreeEnum = pgEnum('academic_degree', ['bachelor', 'master', 'phd']);

export const academicTitleEnum = pgEnum('academic_title', ['gs', 'pgs']);

export const politicalTheoryEnum = pgEnum('political_theory', ['sơ cấp', 'trung cấp', 'cao cấp', 'cử nhân']);

export const employmentStatusEnum = pgEnum('employment_status', ['active', 'retired', 'resigned', 'transferred']);

export const historyTypeEnum = pgEnum('history_type', ['chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri']);

export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);

export const eduTypeEnum = pgEnum('edu_type', ['degree', 'certificate', 'foreign_lang', 'it']);

export const langLevelEnum = pgEnum('lang_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const contractTypeEnum = pgEnum('contract_type', ['probation', 'fixed_term', 'indefinite', 'part_time']);

export const contractStatusEnum = pgEnum('contract_status', ['draft', 'active', 'expired', 'terminated', 'renewed']);

export const awardLevelEnum = pgEnum('award_level', ['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']);

export const rewardStatusEnum = pgEnum('reward_status', ['draft', 'submitted', 'ballot_done', 'approved', 'rejected']);

export const titleLevelEnum = pgEnum('title_level', ['unit', 'university', 'ministry']);

export const upgradeTypeEnum = pgEnum('upgrade_type', ['NBL thường xuyên', 'NBL trước hạn', 'NBL vượt bậc']);

export const evidenceTypeEnum = pgEnum('evidence_type', ['teaching', 'research_paper', 'research_project', 'other_task']);

export const appointmentTypeEnum = pgEnum('appointment_type', ['new', 'reappoint', 'transfer', 'dismiss']);

export const appointmentStatusEnum = pgEnum('appointment_status', ['active', 'expired', 'dismissed', 'transferred']);

export const workflowStatusEnum = pgEnum('workflow_status', ['pending', 'in_progress', 'approved', 'rejected', 'cancelled']);

export const workflowActionEnum = pgEnum('workflow_action', ['approve', 'reject', 'request_revision', 'ballot_submit', 'forward', 'recall']);

export const attachmentCategoryEnum = pgEnum('attachment_category', ['evidence', 'decision', 'ballot_minutes', 'cv', 'contract_doc', 'other']);

export const notificationChannelEnum = pgEnum('notification_channel', ['in_app', 'email']);

export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'read', 'failed']);

export const disciplineTypeEnum = pgEnum('discipline_type', ['khien_trach', 'canh_cao', 'ha_bac_luong', 'buoc_thoi_viec']);

export const scopeTypeEnum = pgEnum('scope_type', ['school', 'faculty', 'department', 'self']);

export const researchWorkTypeEnum = pgEnum('research_work_type', [
    'research_project', // đề tài nghiên cứu khoa học
    'book', // sách
    'training_product', // sản phẩm đào tạo
    'research_product', // sản phẩm nghiên cứu
    'patent', // bằng sáng chế
    'journal_paper', // bài báo khoa học
    'conference_paper', // bài báo hội nghị
    'book_chapter',
    'other'
]);
