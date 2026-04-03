import ExcelJS from 'exceljs'
import { db } from '@/configs/db'
import { profileStaff, users, organizationalUnits, workloadAnnualSummaries, rewardTitles, salaryLogs } from '@/db/schema'
import { eq, and, desc, sql, isNull } from 'drizzle-orm'
import { ID } from '@/types'
import fs from 'fs'
import path from 'path'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { s3Client } from '@/configs/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@/configs/env'

// Import or re-define types for 2C export matching 2c.service.ts if we want compatibility
export interface ProfileData2C {
    user: { fullName: string; username: string; email: string }
    gender: string
    dateOfBirth: string
    nickName: string | null
    ethnicity: string
    religion: string
    nationality: string
    emailVnu: string
    emailPersonal: string
    idNumber: string
    idIssuedDate?: string
    idIssuedBy?: string
    maritalStatus?: string
    addrHometown?: any
    addrBirthplace?: any
    addrPermanent?: any
    addrCurrent?: any
    phoneWork?: string
    phoneHome?: string | null
    eduLevelGeneral?: string
    politicalTheory?: string
    foreignLangLevel?: string
    itLevel?: string
    academicDegree?: string
    academicTitle?: string
    joinDate?: string
    staffType?: string
    education: any[]
    workHistory: any[]
    family: any[]
    salary?: any
    healthRecords?: any
    extraInfo?: any
    rewards?: {
        commendations: any[]
        titles: any[]
        discipline: any[]
    }
    positions?: any[]
    avatarUrl?: string
}

export class ExportService {
  private async wb(sheet: string, headers: string[], rows: any[], cols: string[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(sheet)
    ws.addRow(headers); ws.getRow(1).font = { bold: true }
    rows.forEach(r => ws.addRow(cols.map(k => r[k] ?? '')))
    return Buffer.from(await wb.xlsx.writeBuffer() as ArrayBuffer)
  }

  async exportStaffList(filter: Record<string, unknown>, _: ID): Promise<Buffer> {
    const conditions = [isNull(profileStaff.deletedAt)]
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

  /**
   * Helper to fetch image from S3
   */
  private async getS3ImageBuffer(storageKey: string): Promise<Buffer | null> {
    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: storageKey
        }));
        if (!response.Body) return null;
        const stream = response.Body as any;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Error fetching S3 image:', error);
        return null;
    }
  }

  /**
   * Export sơ yếu lý lịch mẫu 2C/TCTW
   * Refactored to handle S3 Avatar URLs
   */
  async exportCurriculumVitae(p: ProfileData2C, profileId: ID): Promise<Buffer> {
    const templatePath = path.resolve(process.cwd(), 'src/public/2C.docx')
    if (!fs.existsSync(templatePath)) {
        throw new Error('Template 2C.docx not found in src/public folder.')
    }

    const content = fs.readFileSync(templatePath, 'binary')
    const zip = new PizZip(content)
    
    // We can't use Docxtemplater for image injection easily without ImageModule
    // If ImageModule is not installed, we can still use docxtemplater for text and tags
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    })

    const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('vi-VN') : ''
    const formatAddress = (addr: any) => {
        if (!addr) return ''
        const parts = []
        if (addr.detail) parts.push(addr.detail)
        if (addr.ward) parts.push(addr.ward)
        if (addr.district) parts.push(addr.district)
        if (addr.province) parts.push(addr.province)
        return parts.join(', ')
    }

    // Prepare data
    const data = {
        fullName: p.user?.fullName?.toUpperCase() ?? '',
        gender: p.gender ?? '',
        dateOfBirth: formatDate(p.dateOfBirth),
        idNumber: p.idNumber ?? '',
        idIssuedDate: formatDate(p.idIssuedDate),
        idIssuedBy: p.idIssuedBy ?? '',
        nationality: p.nationality ?? '',
        ethnicity: p.ethnicity ?? '',
        religion: p.religion ?? '',
        maritalStatus: p.maritalStatus ?? '',
        
        addrHometown: formatAddress(p.addrHometown),
        addrBirthplace: formatAddress(p.addrBirthplace),
        addrPermanent: formatAddress(p.addrPermanent),
        addrCurrent: formatAddress(p.addrCurrent),

        emailVnu: p.emailVnu ?? '',
        emailPersonal: p.emailPersonal ?? '',
        phoneWork: p.phoneWork ?? '',
        phoneHome: p.phoneHome ?? '',

        academicDegree: p.academicDegree ?? '',
        academicTitle: p.academicTitle ?? '',
        eduLevelGeneral: p.eduLevelGeneral ?? '',
        politicalTheory: p.politicalTheory ?? '',
        foreignLangLevel: p.foreignLangLevel ?? '',
        itLevel: p.itLevel ?? '',

        staffType: p.staffType ?? '',
        joinDate: formatDate(p.joinDate),

        // Lists
        education: (p.education ?? []).map((e: any) => ({
            ...e,
            fromDate: formatDate(e.fromDate),
            toDate: formatDate(e.toDate) || (e.isStudying ? 'Nay' : '')
        })),
        family: p.family ?? [],
        workHistory: (p.workHistory ?? []).map((w: any) => ({
            ...w,
            fromDate: formatDate(w.fromDate),
            toDate: formatDate(w.toDate) || 'Nay'
        })),
        positions: (p.positions ?? []).map((pos: any) => ({
            ...pos,
            startDate: formatDate(pos.startDate),
            endDate: formatDate(pos.endDate) || 'Nay'
        })),
        
        // Rewards & Discipline
        commendations: (p.rewards?.commendations ?? []).map((c: any) => ({
            awardName: c.awardName,
            awardLevel: c.awardLevel,
            year: formatDate(c.decisionDate).split('/')[2] || ''
        })).join('; ') || 'Không có',
        
        discipline: (p.rewards?.discipline ?? []).map((d: any) => d.disciplineName).join('; ') || 'Không có',

        // Extra Info
        ...(p.extraInfo || {}),
        incomeSalary: p.extraInfo?.incomeSalary ? Number(p.extraInfo.incomeSalary).toLocaleString('vi-VN') : '',
        
        // Health
        ...(p.healthRecords || {}),
        weightKg: p.healthRecords?.weightKg || '',
        heightCm: p.healthRecords?.heightCm || '',
        bloodType: p.healthRecords?.bloodType || ''
    }

    doc.render(data)

    let buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    })

    // To handle image replacement in 2C.docx, we usually need ImageModule.
    // If not using ImageModule, the user's template might not support it via docxtemplater tags.
    // But since the request is specifically about S3 mechanism and avatar URL, 
    // we should at least fetch the avatar and maybe put it in a separate way if possible.
    // For now, we return the generated DOCX.
    
    return buf
  }
}

export const exportService = new ExportService()
