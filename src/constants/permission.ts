export const PERM = {
    PROFILE: {
        READ: 'hrm.profile.read',
        WRITE: 'hrm.profile.write',
        APPROVE: 'hrm.profile.approve',
        REJECT: 'hrm.profile.reject',
        EXPORT: 'hrm.profile.export',
        DELETE: 'hrm.profile.delete',
        STATUS: 'hrm.profile.status'
    },
    RECRUITMENT: {
        READ: 'hrm.recruitment.read',
        WRITE: 'hrm.recruitment.write',
        APPROVE: 'hrm.recruitment.approve',
        EXPORT: 'hrm.recruitment.export'
    },
    CONTRACT: {
        READ: 'hrm.contract.read',
        WRITE: 'hrm.contract.write',
        APPROVE: 'hrm.contract.approve',
        TERMINATE: 'hrm.contract.terminate',
        EXTEND: 'hrm.contract.extend',
        EXPORT: 'hrm.contract.export'
    },
    SALARY: {
        READ: 'hrm.salary.read',
        SELF_READ: 'hrm.salary.self_read',
        WRITE: 'hrm.salary.write',
        APPROVE: 'hrm.salary.approve',
        PROPOSE: 'hrm.salary.propose',
        EXPORT: 'hrm.salary.export'
    },
    APPOINTMENT: {
        READ: 'hrm.appointment.read',
        WRITE: 'hrm.appointment.write',
        APPROVE: 'hrm.appointment.approve',
        BALLOT: 'hrm.appointment.ballot',
        DISMISS: 'hrm.appointment.dismiss',
        EXTEND: 'hrm.appointment.extend',
        EXPORT: 'hrm.appointment.export',
        ALERT_READ: 'hrm.appointment.alert_read'
    },
    WORKLOAD: {
        READ: 'hrm.workload.read',
        SELF_READ: 'hrm.workload.self_read',
        WRITE: 'hrm.workload.write',
        APPROVE: 'hrm.workload.approve',
        ADMIN: 'hrm.workload.admin',
        FINALIZE: 'hrm.workload.finalize',
        EXPORT: 'hrm.workload.export'
    },
    REWARD: {
        READ: 'hrm.reward.read',
        SELF_READ: 'hrm.reward.self_read',
        WRITE: 'hrm.reward.write',
        APPROVE: 'hrm.reward.approve',
        BALLOT: 'hrm.reward.ballot',
        FINALIZE: 'hrm.reward.finalize',
        EXPORT: 'hrm.reward.export',
        DISCIPLINE: 'hrm.reward.discipline'
    },
    STATS: {
        UNIT: 'hrm.stats.unit.read',
        SCHOOL: 'hrm.stats.school.read',
        SALARY: 'hrm.stats.salary.read',
        WORKLOAD: 'hrm.stats.workload.read',
        REWARD: 'hrm.stats.reward.read'
    },
    SYSTEM: {
        ROLE_GRANT: 'system.auth.role.grant',
        USER_MANAGE: 'system.auth.user.manage',
        PASSWORD_RESET: 'system.auth.password.reset',
        PERM_MANAGE: 'system.auth.permission.manage',
        ROLE_MANAGE: 'system.auth.role.manage',
        AUDIT_READ: 'system.audit.read',
        AUDIT_EXPORT: 'system.audit.export',
        CONFIG_READ: 'system.config.read',
        CONFIG_WRITE: 'system.config.write',
        SCHEDULER_MANAGE: 'system.scheduler.manage',
        ATTACHMENT_UPLOAD: 'hrm.attachment.upload',
        ATTACHMENT_DOWNLOAD: 'hrm.attachment.download',
        ATTACHMENT_DELETE: 'hrm.attachment.delete',
    },
} as const