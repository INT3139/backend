import fs from "fs"
import path from "path"
import dayjs from "dayjs"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import type { FullProfileRow } from "@/modules/profile/profile.service"

type RewardBundle = {
  commendations?: any[]
  titles?: any[]
  discipline?: any[]
} | null

type ExportProfile = FullProfileRow & {
  user?: {
    fullName?: string | null
    username?: string
    email?: string
  }
  salary?: any | null
  rewards?: RewardBundle
}

const GENDER_LABELS: Record<string, string> = {
  male: "Nam",
  female: "Nu",
  other: "Khac",
  Nam: "Nam",
  Nữ: "Nu",
  Khác: "Khac",
}

const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: "Doc than",
  married: "Da ket hon",
  divorced: "Ly hon",
  widowed: "Goa",
}

const DEGREE_LABELS: Record<string, string> = {
  bachelor: "Cu nhan",
  master: "Thac si",
  phd: "Tien si",
}

const TITLE_LABELS: Record<string, string> = {
  gs: "GS",
  pgs: "PGS",
}

const RESEARCH_TYPE_LABELS: Record<string, string> = {
  research_project: "De tai nghien cuu",
  book: "Sach",
  training_product: "San pham dao tao",
  research_product: "San pham nghien cuu",
  patent: "Bang sang che/GPHI",
  journal_paper: "Bai bao tap chi",
  conference_paper: "Bao cao hoi nghi",
  book_chapter: "Chuong sach",
  other: "Khac",
}

export class ProfileExportService {
  async export2C(profile: ExportProfile): Promise<Buffer> {
    const templatePath = this.resolveTemplatePath("2C.template.docx")
    return this.renderTemplate(templatePath, this.buildTemplateData(profile))
  }

  async exportScientific(profile: ExportProfile): Promise<Buffer> {
    const templatePath = this.resolveTemplatePath("Ly_lich_khoa_hoc.template.docx")
    return this.renderTemplate(templatePath, this.buildTemplateData(profile))
  }

  private renderTemplate(templatePath: string, data: Record<string, string>): Buffer {
    const content = fs.readFileSync(templatePath, "binary")
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    doc.render(data)
    return doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    })
  }

  private resolveTemplatePath(fileName: string): string {
    const candidates = [
      path.resolve(process.cwd(), "src/public/export", fileName),
      path.resolve(process.cwd(), "dist/src/public/export", fileName),
    ]

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }

    throw new Error(`Template file not found: ${fileName}`)
  }

  private buildTemplateData(profile: ExportProfile): Record<string, string> {
    const researchWorks = this.normalizeResearchWorks(profile.researchWorks?.data)
    const workHistory = this.normalizeList(profile.workHistory)
    const education = this.normalizeList(profile.education)
    const family = this.normalizeList(profile.family)
    const positions = this.normalizeList(profile.positions)
    const salaryHistoryRows = this.buildSalarySummaryRows(profile)
    const rewardRows = this.buildRewardRows(profile.rewards ?? null)
    const researchSummaryRows = this.buildResearchSummaryRows(researchWorks)

    return {
      profileId: this.value(profile.id),
      exportDate: this.formatDate(new Date()),
      fullName: this.value(profile.user?.fullName),
      gender: this.mapValue(profile.gender, GENDER_LABELS),
      dateOfBirth: this.formatDate(profile.dateOfBirth),
      idNumber: this.value(profile.idNumber),
      birthplace: this.formatAddress(profile.addrBirthplace),
      hometown: this.formatAddress(profile.addrHometown),
      ethnicity: this.value(profile.ethnicity),
      religion: this.value(profile.religion),
      nationality: this.value(profile.nationality, "Viet Nam"),
      maritalStatus: this.mapValue(profile.maritalStatus, MARITAL_STATUS_LABELS),
      emailVnu: this.value(profile.emailVnu),
      emailPersonal: this.value(profile.emailPersonal),
      phoneWork: this.value(profile.phoneWork),
      phoneHome: this.value(profile.phoneHome),
      addrPermanent: this.formatAddress(profile.addrPermanent),
      addrCurrent: this.formatAddress(profile.addrCurrent),
      joinDate: this.formatDate(profile.joinDate),
      staffType: this.value(profile.staffType),
      employmentStatus: this.value(profile.employmentStatus),
      profileStatus: this.value(profile.profileStatus),
      academicDegree: this.mapValue(profile.academicDegree, DEGREE_LABELS),
      academicTitle: this.mapValue(profile.academicTitle, TITLE_LABELS),
      eduLevelGeneral: this.value(profile.eduLevelGeneral),
      politicalTheory: this.value(profile.politicalTheory),
      stateManagement: this.value(profile.stateManagement),
      foreignLangLevel: this.value(profile.foreignLangLevel),
      itLevel: this.value(profile.itLevel),
      nickName: this.value(profile.nickName),
      educationBlock: this.joinLines(
        education.map((item: any, index) =>
          `${index + 1}. ${this.formatPeriod(item.fromDate, item.toDate, item.isStudying)} | ${this.firstNonEmpty(item.major, item.field, item.trainingForm)} | ${this.firstNonEmpty(item.degreeLevel, item.certName, item.langName)} | ${this.value(item.institution)}`
        ),
      ),
      workHistoryBlock: this.joinLines(
        workHistory.map((item: any, index) =>
          `${index + 1}. ${this.formatPeriod(item.fromDate, item.toDate)} | ${this.value(item.unitName)} | ${this.value(item.positionName)} | ${this.firstNonEmpty(item.activityType, item.historyType)}`
        ),
      ),
      positionsBlock: this.joinLines(
        positions.map((item: any, index) =>
          `${index + 1}. ${this.formatPeriod(item.startDate, item.endDate)} | ${this.value(item.positionName)} | ${this.value(item.positionType)} | ${item.isPrimary ? "Chinh" : this.value(item.decisionRef)}`
        ),
      ),
      familyBlock: this.joinLines(
        family.map((item: any, index) =>
          `${index + 1}. ${item.side === "spouse" ? "Ben vo/chong" : "Ban than"} | ${this.value(item.relationship)} | ${this.value(item.fullName)} | ${this.value(item.birthYear)} | ${this.value(item.description)}`
        ),
      ),
      salaryBlock: this.joinLines([
        `Ngach/chuc danh: ${this.value(profile.salary?.occupationTitle)} | Ma ngach: ${this.value(profile.salary?.occupationCode)}`,
        `Bac luong: ${this.value(profile.salary?.salaryGrade)} | He so: ${this.value(profile.salary?.salaryCoefficient)}`,
        `Ngay huong: ${this.formatDate(profile.salary?.effectiveDate)} | Ngay nang bac tiep: ${this.formatDate(profile.salary?.nextGradeDate)}`,
      ]),
      healthBlock: this.joinLines([
        `Suc khoe: ${this.value(profile.healthRecords?.healthStatus)} | Nhom mau: ${this.value(profile.healthRecords?.bloodType)}`,
        `Chieu cao: ${this.withUnit(profile.healthRecords?.heightCm, "cm")} | Can nang: ${this.withUnit(profile.healthRecords?.weightKg, "kg")}`,
      ]),
      extraInfoBlock: this.joinLines([
        `Tien luong/nam: ${this.formatMoney(profile.extraInfo?.incomeSalary)} | Thu nhap khac/nam: ${this.formatMoney(profile.extraInfo?.incomeOtherSources)}`,
        `Nha duoc cap/thue: ${this.value(profile.extraInfo?.houseTypeGranted)} | Nha tu mua/xay: ${this.value(profile.extraInfo?.houseTypeOwned)}`,
        `Dat duoc cap: ${this.withUnit(profile.extraInfo?.landGrantedM2, "m2")} | Dat tu mua: ${this.withUnit(profile.extraInfo?.landPurchasedM2, "m2")}`,
      ]),
      rewardBlock: this.joinLines(
        rewardRows.map((row, index) => `${index + 1}. ${row[0]} | ${row[1]} | ${row[2]}`),
      ),
      researchSummaryBlock: this.joinLines(
        researchSummaryRows.map((row) => `${row[0]}: ${row[1]}`),
      ),
      researchBlock: this.joinLines(
        researchWorks.map((item, index) =>
          `${index + 1}. ${this.mapValue(item.workType, RESEARCH_TYPE_LABELS)} | ${this.value(item.title)} | ${this.value(item.publishYear)} | ${this.buildResearchExtra(item)}`
        ),
      ),
      salaryHistoryBlock: this.joinLines(
        salaryHistoryRows.map((row, index) => `${index + 1}. ${row.join(" | ")}`),
      ),
    }
  }

  private joinLines(lines: string[]): string {
    const filtered = lines.map((item) => item.trim()).filter(Boolean)
    return filtered.length > 0 ? filtered.join("\n") : ""
  }

  private normalizeList<T>(items: T[] | undefined | null): T[] {
    return Array.isArray(items) ? items.filter(Boolean) : []
  }

  private normalizeResearchWorks(items: any[] | undefined | null): any[] {
    return this.normalizeList(items).filter((item: any) => !item.deletedAt && item.status !== "rejected")
  }

  private buildRewardRows(rewards: RewardBundle): string[][] {
    if (!rewards) {
      return []
    }

    const commendations = this.normalizeList(rewards.commendations).map((item: any) => [
      "Khen thuong",
      `${this.value(item.awardName)} (${this.value(item.awardLevel)})`,
      this.formatDate(item.decisionDate),
    ])
    const titles = this.normalizeList(rewards.titles).map((item: any) => [
      "Danh hieu",
      `${this.value(item.titleName)} (${this.value(item.titleLevel)})`,
      this.value(item.awardedYear),
    ])
    const discipline = this.normalizeList(rewards.discipline).map((item: any) => [
      "Ky luat",
      this.firstNonEmpty(item.disciplineName, item.description),
      this.formatDate(item.issuedDate),
    ])

    return [...commendations, ...titles, ...discipline]
  }

  private buildResearchSummaryRows(items: any[]): string[][] {
    const counts = new Map<string, number>()
    for (const item of items) {
      const key = this.mapValue(item.workType, RESEARCH_TYPE_LABELS)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return Array.from(counts.entries()).map(([type, count]) => [type, String(count)])
  }

  private buildSalarySummaryRows(profile: ExportProfile): string[][] {
    const currentSalary = profile.salary
    if (!currentSalary) {
      return []
    }

    return [[
      this.formatDate(currentSalary.effectiveDate),
      this.value(currentSalary.occupationCode),
      this.value(currentSalary.salaryGrade),
      this.value(currentSalary.salaryCoefficient),
      this.value(currentSalary.decisionNumber),
    ]]
  }

  private buildResearchExtra(item: any): string {
    const parts = [
      item.indexing ? `Indexing: ${item.indexing}` : "",
      item.doi ? `DOI: ${item.doi}` : "",
      item.projectCode ? `Ma de tai: ${item.projectCode}` : "",
      item.academicYear ? `Nam hoc: ${item.academicYear}` : "",
      ...this.extractExtraDetails(item.extra),
    ].filter(Boolean)

    return parts.join("; ")
  }

  private extractExtraDetails(extra: unknown): string[] {
    if (!extra || typeof extra !== "object") {
      return []
    }

    return Object.entries(extra as Record<string, unknown>)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${String(value)}`)
  }

  private formatDate(value: unknown): string {
    if (!value) {
      return ""
    }

    const date = dayjs(value as any)
    return date.isValid() ? date.format("DD/MM/YYYY") : this.value(value)
  }

  private formatPeriod(fromDate: unknown, toDate: unknown, isOpenEnded = false): string {
    const from = this.formatDate(fromDate)
    const to = this.formatDate(toDate)

    if (from && to) {
      return `${from} - ${to}`
    }

    if (from) {
      return `${from} - ${isOpenEnded ? "Nay" : ""}`.trim()
    }

    return to || ""
  }

  private formatAddress(value: any): string {
    if (!value || typeof value !== "object") {
      return ""
    }

    return [value.detail, value.ward, value.district, value.province].filter(Boolean).join(", ")
  }

  private formatMoney(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return ""
    }

    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? `${numberValue.toLocaleString("en-US")} VND` : this.value(value)
  }

  private withUnit(value: unknown, unit: string): string {
    const normalized = this.value(value)
    return normalized ? `${normalized} ${unit}` : ""
  }

  private mapValue(value: unknown, dictionary: Record<string, string>): string {
    const normalized = this.value(value)
    return normalized ? dictionary[normalized] ?? normalized : ""
  }

  private firstNonEmpty(...values: unknown[]): string {
    for (const value of values) {
      const normalized = this.value(value)
      if (normalized) {
        return normalized
      }
    }
    return ""
  }

  private value(value: unknown, fallback = ""): string {
    if (value === null || value === undefined) {
      return fallback
    }

    const normalized = String(value).trim()
    return normalized || fallback
  }
}

export const profileExportService = new ProfileExportService()
