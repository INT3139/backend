export const calcConvertedHours = (raw: number, coef: number) => +(raw * coef).toFixed(2)

export function calcReductionPct(types: string[]): number {
  const map: Record<string, number> = { headmaster: 0.50, vice_headmaster: 0.40, faculty_dean: 0.30, vice_dean: 0.20, dept_head: 0.15, vice_dept: 0.10 }
  return types.reduce((acc, t) => Math.max(acc, map[t] ?? 0), 0)
}

export function calcBaseQuota(staffType: string, title?: string): number {
  if (title === 'gs') return 350; if (title === 'pgs') return 320
  if (staffType === 'lecturer') return 280; return 0
}

export const isTeachingViolation  = (actual: number, quota: number) => actual < quota * 0.5
export const isResearchViolation  = (actual: number, quota: number) => actual < quota
export const isAdminViolation     = (actual: number, quota: number) => actual < quota * 0.75    