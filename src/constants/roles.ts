export const ROLE = {
    LECTURER: 'lecturer',
    DEPT_HEAD: 'dept_head',
    FACULTY_LEADER: 'faculty_leader',

    CV_HRM: 'cv_hrm',
    CV_WORKLOAD: 'cv_workload',
    CV_SALARY: 'cv_salary',
    CV_REWARD: 'cv_reward',

    HRM_DIRECTOR: 'hrm_director',
    HEADMASTER: 'headmaster',
    SYS_ADMIN: 'sys_admin',
} as const;

export const PORT_ROLE_MAP: Record<string, string[]> = {
    'admin': [ROLE.SYS_ADMIN, ROLE.HEADMASTER, ROLE.HRM_DIRECTOR],
    'cv': [ROLE.CV_HRM, ROLE.CV_SALARY, ROLE.CV_WORKLOAD, ROLE.CV_REWARD],
    'main': [ROLE.FACULTY_LEADER, ROLE.DEPT_HEAD, ROLE.LECTURER],
};