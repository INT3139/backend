import ExcelJS from 'exceljs'
import { db } from '@/configs/db'
import { profileStaff, users, organizationalUnits, workloadAnnualSummaries, rewardTitles, salaryLogs } from '@/db/schema'
import { eq, and, desc, sql, or } from 'drizzle-orm'
import { ID } from '@/types'

export class ExportService {
  private async wb(sheet: string, headers: string[], rows: any[], cols: string[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(sheet)
    ws.addRow(headers); ws.getRow(1).font = { bold: true }
    rows.forEach(r => ws.addRow(cols.map(k => r[k] ?? '')))
    return Buffer.from(await wb.xlsx.writeBuffer() as ArrayBuffer)
  }

  async exportStaffList(filter: Record<string, unknown>, _: ID): Promise<Buffer> {
    const conditions = []
    if (filter.employmentStatus) {
        conditions.push(eq(profileStaff.employmentStatus, filter.employmentStatus as any))
    }

    const rows = await db.select({
        full_name: users.fullName,
        date_of_birth: profileStaff.dateOfBirth,
        academic_degree: profileStaff.academicDegree,
        unit_name: organizationalUnits.name,
        employment_status: profileStaff.employmentStatus
    })
    .from(profileStaff)
    .innerJoin(users, eq(users.id, profileStaff.userId))
    .leftJoin(organizationalUnits, eq(organizationalUnits.id, profileStaff.unitId))
    .where(and(...conditions))

    return this.wb('Danh sách cán bộ', ['Họ tên','Ngày sinh','Trình độ','Đơn vị','Trạng thái'], rows, ['full_name','date_of_birth','academic_degree','unit_name','employment_status'])
  }

  async exportWorkloadReport(year: string, unitId?: ID): Promise<Buffer> {
    const conditions = [eq(workloadAnnualSummaries.academicYear, year)]
    if (unitId) {
        conditions.push(eq(profileStaff.unitId, unitId))
    }

    const rows = await db.select({
        full_name: users.fullName,
        academic_year: workloadAnnualSummaries.academicYear,
        total_teaching: workloadAnnualSummaries.totalTeaching,
        quota_teaching: workloadAnnualSummaries.quotaTeaching,
        is_teaching_violation: workloadAnnualSummaries.isTeachingViolation,
        is_research_violation: workloadAnnualSummaries.isResearchViolation
    })
    .from(workloadAnnualSummaries)
    .innerJoin(profileStaff, eq(profileStaff.id, workloadAnnualSummaries.profileId))
    .innerJoin(users, eq(users.id, profileStaff.userId))
    .where(and(...conditions))

    return this.wb('Báo cáo định mức', ['Họ tên','Năm học','Giờ thực','Định mức','Vi phạm dạy','Vi phạm NCKH'], rows, ['full_name','academic_year','total_teaching','quota_teaching','is_teaching_violation','is_research_violation'])
  }

  async exportRewardReport(year: string, unitId?: ID): Promise<Buffer> {
    const conditions = [eq(rewardTitles.awardedYear, year)]
    if (unitId) {
        conditions.push(eq(profileStaff.unitId, unitId))
    }

    const rows = await db.select({
        full_name: users.fullName,
        title_name: rewardTitles.titleName,
        title_level: rewardTitles.titleLevel,
        awarded_year: rewardTitles.awardedYear
    })
    .from(rewardTitles)
    .innerJoin(profileStaff, eq(profileStaff.id, rewardTitles.profileId))
    .innerJoin(users, eq(users.id, profileStaff.userId))
    .where(and(...conditions))

    return this.wb('Báo cáo thi đua', ['Họ tên','Danh hiệu','Cấp','Năm'], rows, ['full_name','title_name','title_level','awarded_year'])
  }

  async exportSalaryHistory(profileId: ID): Promise<Buffer> {
    const rows = await db.select({
        occupation_code: salaryLogs.occupationCode,
        salary_grade: salaryLogs.salaryGrade,
        salary_coefficient: salaryLogs.salaryCoefficient,
        effective_date: salaryLogs.effectiveDate,
        decision_number: salaryLogs.decisionNumber
    })
    .from(salaryLogs)
    .where(eq(salaryLogs.profileId, profileId))
    .orderBy(desc(salaryLogs.effectiveDate))

    return this.wb('Nhật ký lương', ['Mã CDNN','Bậc','Hệ số','Ngày hưởng','Số QĐ'], rows, ['occupation_code','salary_grade','salary_coefficient','effective_date','decision_number'])
  }
}

export const exportService = new ExportService()
