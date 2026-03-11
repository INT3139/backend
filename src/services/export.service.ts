import ExcelJS from 'exceljs'
import { query } from '@/configs/db'
import { UUID } from '@/types'

export class ExportService {
  private async wb(sheet: string, headers: string[], rows: any[], cols: string[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(sheet)
    ws.addRow(headers); ws.getRow(1).font = { bold: true }
    rows.forEach(r => ws.addRow(cols.map(k => r[k] ?? '')))
    return Buffer.from(await wb.xlsx.writeBuffer() as ArrayBuffer)
  }

  async exportStaffList(filter: Record<string, unknown>, _: UUID): Promise<Buffer> {
    const rows = await query(`SELECT u.full_name,ps.date_of_birth,ps.academic_degree,ou.name as unit_name,ps.employment_status FROM profile_staff ps JOIN users u ON u.id=ps.user_id LEFT JOIN organizational_units ou ON ou.id=ps.unit_id WHERE ps.employment_status=COALESCE($1,ps.employment_status)`, [filter.employmentStatus??null])
    return this.wb('Danh sách cán bộ', ['Họ tên','Ngày sinh','Trình độ','Đơn vị','Trạng thái'], rows, ['full_name','date_of_birth','academic_degree','unit_name','employment_status'])
  }

  async exportWorkloadReport(year: string, unitId?: UUID): Promise<Buffer> {
    const rows = await query(`SELECT u.full_name,was.academic_year,was.total_teaching,was.quota_teaching,was.is_teaching_violation,was.is_research_violation FROM workload_annual_summaries was JOIN profile_staff ps ON ps.id=was.profile_id JOIN users u ON u.id=ps.user_id WHERE was.academic_year=$1 AND ($2::uuid IS NULL OR ps.unit_id=$2)`, [year, unitId??null])
    return this.wb('Báo cáo định mức', ['Họ tên','Năm học','Giờ thực','Định mức','Vi phạm dạy','Vi phạm NCKH'], rows, ['full_name','academic_year','total_teaching','quota_teaching','is_teaching_violation','is_research_violation'])
  }

  async exportRewardReport(year: string, unitId?: UUID): Promise<Buffer> {
    const rows = await query(`SELECT u.full_name,rt.title_name,rt.title_level,rt.awarded_year FROM reward_titles rt JOIN profile_staff ps ON ps.id=rt.profile_id JOIN users u ON u.id=ps.user_id WHERE rt.awarded_year=$1 AND ($2::uuid IS NULL OR ps.unit_id=$2)`, [year, unitId??null])
    return this.wb('Báo cáo thi đua', ['Họ tên','Danh hiệu','Cấp','Năm'], rows, ['full_name','title_name','title_level','awarded_year'])
  }

  async exportSalaryHistory(profileId: UUID): Promise<Buffer> {
    const rows = await query('SELECT occupation_code,salary_grade,salary_coefficient,effective_date,decision_number FROM salary_logs WHERE profile_id=$1 ORDER BY effective_date DESC', [profileId])
    return this.wb('Nhật ký lương', ['Mã CDNN','Bậc','Hệ số','Ngày hưởng','Số QĐ'], rows, ['occupation_code','salary_grade','salary_coefficient','effective_date','decision_number'])
  }
}

export const exportService = new ExportService()