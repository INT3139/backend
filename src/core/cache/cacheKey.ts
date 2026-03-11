export const CacheKey = {
  permCodes:               (u: string)          => `perm:codes:${u}`,
  permScopes:              (u: string)          => `perm:scopes:${u}`,
  permCatalog:             ()                   => `perm:catalog`,
  profileFull:             (id: string)         => `profile:full:${id}`,
  staffListByUnit:         (id: string)         => `staff:list:unit:${id}`,
  orgTree:                 ()                   => `org:tree`,
  orgUnit:                 (id: string)         => `org:unit:${id}`,
  quotaParams:             (yr: string)         => `workload:params:${yr}`,
  individualQuota:         (id: string, yr: string) => `workload:quota:${id}:${yr}`,
  annualSummary:           (id: string, yr: string) => `workload:summary:${id}:${yr}`,
  salaryInfo:              (id: string)         => `salary:info:${id}`,
  appointmentAlertSummary: ()                   => `appointment:alert:summary`,
  workflowInstance:        (id: string)         => `wf:instance:${id}`,
  workflowDefinition:      (code: string)       => `wf:def:${code}`,
  unreadCount:             (u: string)          => `notif:unread:${u}`,
  roleList:                ()                   => `roles:list`,
  rolePermissions:         (id: string)         => `roles:perms:${id}`,
} as const

export const CacheTTL = {
  PERM_CODES: 15*60, PERM_SCOPES: 15*60, PERM_CATALOG: 60*60,
  PROFILE_FULL: 10*60, STAFF_LIST: 5*60,
  ORG_TREE: 24*60*60, ORG_UNIT: 60*60,
  QUOTA_PARAMS: 24*60*60, INDIVIDUAL_QUOTA: 30*60, ANNUAL_SUMMARY: 30*60,
  SALARY_INFO: 15*60, APPOINTMENT_ALERT: 60*60,
  WORKFLOW_INSTANCE: 5*60, WORKFLOW_DEF: 24*60*60,
  ROLE_LIST: 60*60, ROLE_PERMS: 60*60,
} as const
