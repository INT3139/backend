import dayjs from "dayjs"
import type { FullProfileRow } from "@/modules/profile/profile.service"
import { SimpleDocxBuilder } from "@/services/simple-docx"

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
    const builder = new SimpleDocxBuilder(`Ly lich 2C ${profile.id}`)
    const researchWorks = this.normalizeResearchWorks(profile.researchWorks?.data)
    const workHistory = this.normalizeList(profile.workHistory)
    const education = this.normalizeList(profile.education)
    const family = this.normalizeList(profile.family)
    const positions = this.normalizeList(profile.positions)
    const salaryHistoryRows = this.buildSalarySummaryRows(profile)
    const rewardRows = this.buildRewardRows(profile.rewards ?? null)

    builder
      .addTitle("SO YEU LY LICH 2C/TCTW")
      .addParagraph(`Ho so nhan su: ${profile.id}`, { bold: true })
      .addParagraph(`Ngay xuat: ${this.formatDate(new Date())}`)
      .addSpacer()
      .addHeading("1. Thong tin chung")
      .addTable(
        [
          ["Ho va ten", this.value(profile.user?.fullName).toUpperCase(), "Gioi tinh", this.mapValue(profile.gender, GENDER_LABELS)],
          ["Ngay sinh", this.formatDate(profile.dateOfBirth), "So dinh danh", this.value(profile.idNumber)],
          ["Noi sinh", this.formatAddress(profile.addrBirthplace), "Que quan", this.formatAddress(profile.addrHometown)],
          ["Dan toc", this.value(profile.ethnicity), "Ton giao", this.value(profile.religion)],
          ["Quoc tich", this.value(profile.nationality, "Viet Nam"), "Tinh trang hon nhan", this.mapValue(profile.maritalStatus, MARITAL_STATUS_LABELS)],
          ["Email VNU", this.value(profile.emailVnu), "Email ca nhan", this.value(profile.emailPersonal)],
          ["Dien thoai co quan", this.value(profile.phoneWork), "Dien thoai nha", this.value(profile.phoneHome)],
          ["Ho khau thuong tru", this.formatAddress(profile.addrPermanent), "Noi o hien tai", this.formatAddress(profile.addrCurrent)],
          ["Ngay vao truong", this.formatDate(profile.joinDate), "Loai nhan su", this.value(profile.staffType)],
          ["Trang thai cong tac", this.value(profile.employmentStatus), "Trang thai ho so", this.value(profile.profileStatus)],
        ],
        { widths: [2200, 3300, 2200, 3300] },
      )
      .addHeading("2. Trinh do va chuyen mon")
      .addTable(
        [
          ["Hoc vi", this.mapValue(profile.academicDegree, DEGREE_LABELS), "Hoc ham", this.mapValue(profile.academicTitle, TITLE_LABELS)],
          ["Hoc van pho thong", this.value(profile.eduLevelGeneral), "Ly luan chinh tri", this.value(profile.politicalTheory)],
          ["Quan ly nha nuoc", this.value(profile.stateManagement), "Ngoai ngu", this.value(profile.foreignLangLevel)],
          ["Tin hoc", this.value(profile.itLevel), "Bi danh", this.value(profile.nickName)],
        ],
        { widths: [2200, 3300, 2200, 3300] },
      )

    builder.addHeading("3. Qua trinh dao tao")
    if (education.length === 0) {
      builder.addParagraph("Khong co du lieu dao tao.")
    } else {
      builder.addTable(
        [
          ["Thoi gian", "Loai", "Co so dao tao", "Chuyen nganh/Noi dung", "Van bang/Ket qua"],
          ...education.map((item: any) => [
            this.formatPeriod(item.fromDate, item.toDate, item.isStudying),
            this.value(item.eduType),
            this.value(item.institution),
            this.firstNonEmpty(item.major, item.field, item.trainingForm),
            this.firstNonEmpty(item.degreeLevel, item.certName, item.langName),
          ]),
        ],
        { widths: [1700, 1600, 2500, 2500, 1700] },
      )
    }

    builder.addHeading("4. Qua trinh cong tac")
    if (workHistory.length === 0) {
      builder.addParagraph("Khong co du lieu qua trinh cong tac.")
    } else {
      builder.addTable(
        [
          ["Thoi gian", "Don vi", "Chuc danh", "Loai hoat dong"],
          ...workHistory.map((item: any) => [
            this.formatPeriod(item.fromDate, item.toDate),
            this.value(item.unitName),
            this.value(item.positionName),
            this.firstNonEmpty(item.activityType, item.historyType),
          ]),
        ],
        { widths: [1800, 3200, 2200, 2200] },
      )
    }

    builder.addHeading("5. Chuc vu dam nhiem")
    if (positions.length === 0) {
      builder.addParagraph("Khong co du lieu chuc vu.")
    } else {
      builder.addTable(
        [
          ["Thoi gian", "Chuc vu", "Loai", "Ghi chu"],
          ...positions.map((item: any) => [
            this.formatPeriod(item.startDate, item.endDate),
            this.value(item.positionName),
            this.value(item.positionType),
            item.isPrimary ? "Chinh" : this.value(item.decisionRef),
          ]),
        ],
        { widths: [1800, 3200, 2200, 2200] },
      )
    }

    builder.addHeading("6. Quan he gia dinh")
    if (family.length === 0) {
      builder.addParagraph("Khong co du lieu quan he gia dinh.")
    } else {
      builder.addTable(
        [
          ["Nhanh", "Quan he", "Ho ten", "Nam sinh", "Mo ta"],
          ...family.map((item: any) => [
            item.side === "spouse" ? "Ben vo/chong" : "Ban than",
            this.value(item.relationship),
            this.value(item.fullName),
            this.value(item.birthYear),
            this.value(item.description),
          ]),
        ],
        { widths: [1500, 1800, 2800, 1100, 2800] },
      )
    }

    builder.addHeading("7. Luong, suc khoe va thong tin bo sung")
    builder.addTable(
      [
        ["Ngach/chuc danh", this.value(profile.salary?.occupationTitle), "Ma ngach", this.value(profile.salary?.occupationCode)],
        ["Bac luong", this.value(profile.salary?.salaryGrade), "He so", this.value(profile.salary?.salaryCoefficient)],
        ["Ngay huong", this.formatDate(profile.salary?.effectiveDate), "Ngay nang bac tiep", this.formatDate(profile.salary?.nextGradeDate)],
        ["Suc khoe", this.value(profile.healthRecords?.healthStatus), "Nhom mau", this.value(profile.healthRecords?.bloodType)],
        ["Chieu cao", this.withUnit(profile.healthRecords?.heightCm, "cm"), "Can nang", this.withUnit(profile.healthRecords?.weightKg, "kg")],
        ["Tien luong/nam", this.formatMoney(profile.extraInfo?.incomeSalary), "Thu nhap khac/nam", this.formatMoney(profile.extraInfo?.incomeOtherSources)],
        ["Nha duoc cap/thu e", this.value(profile.extraInfo?.houseTypeGranted), "Nha tu mua/xay", this.value(profile.extraInfo?.houseTypeOwned)],
        ["Dien tich nha duoc cap", this.withUnit(profile.extraInfo?.houseAreaGranted, "m2"), "Dien tich nha so huu", this.withUnit(profile.extraInfo?.houseAreaOwned, "m2")],
        ["Dat duoc cap", this.withUnit(profile.extraInfo?.landGrantedM2, "m2"), "Dat tu mua", this.withUnit(profile.extraInfo?.landPurchasedM2, "m2")],
        ["Dat SXKD", this.withUnit(profile.extraInfo?.landBusinessM2, "m2"), "Quan he nuoc ngoai", this.value(profile.extraInfo?.foreignOrgRelations)],
        ["Than nhan nuoc ngoai", this.value(profile.extraInfo?.foreignRelatives), "Che do cu/bi bat", this.firstNonEmpty(profile.extraInfo?.oldRegimeWork, profile.extraInfo?.arrestHistory)],
      ],
      { widths: [2200, 3300, 2200, 3300] },
    )

    builder.addHeading("8. Khen thuong va ky luat")
    if (rewardRows.length === 0) {
      builder.addParagraph("Khong co du lieu khen thuong, danh hieu hoac ky luat.")
    } else {
      builder.addTable(
        [["Nhom", "Noi dung", "Moc thoi gian"], ...rewardRows],
        { widths: [1500, 5700, 2600] },
      )
    }

    builder.addHeading("9. Tong hop nghien cuu khoa hoc")
    if (researchWorks.length === 0) {
      builder.addParagraph("Khong co du lieu nghien cuu khoa hoc.")
    } else {
      builder.addTable(
        [
          ["Loai", "Tieu de", "Nam", "Thong tin bo sung"],
          ...researchWorks.map((item) => [
            this.mapValue(item.workType, RESEARCH_TYPE_LABELS),
            this.value(item.title),
            this.value(item.publishYear),
            this.buildResearchExtra(item),
          ]),
        ],
        { widths: [1800, 4000, 900, 3100] },
      )
    }

    builder.addHeading("10. Qua trinh luong")
    if (salaryHistoryRows.length === 0) {
      builder.addParagraph("Khong co du lieu qua trinh luong.")
    } else {
      builder.addTable([["Ngay hieu luc", "Ma ngach", "Bac", "He so", "So quyet dinh"], ...salaryHistoryRows], {
        widths: [2000, 1800, 1200, 1600, 3400],
      })
    }

    return builder.build()
  }

  async exportScientific(profile: ExportProfile): Promise<Buffer> {
    const builder = new SimpleDocxBuilder(`Ly lich khoa hoc ${profile.id}`)
    const researchWorks = this.normalizeResearchWorks(profile.researchWorks?.data)
    const positions = this.normalizeList(profile.positions)
    const education = this.normalizeList(profile.education)
    const summaryRows = this.buildResearchSummaryRows(researchWorks)

    builder
      .addTitle("LY LICH KHOA HOC")
      .addParagraph(`Ho ten: ${this.value(profile.user?.fullName)}`, { bold: true })
      .addParagraph(`Don vi/Nhom nhan su: ${this.value(profile.staffType)} | Ma ho so: ${profile.id}`)
      .addParagraph(`Ngay xuat: ${this.formatDate(new Date())}`)
      .addSpacer()
      .addHeading("1. Thong tin ca nhan")
      .addTable(
        [
          ["Ho va ten", this.value(profile.user?.fullName), "Ngay sinh", this.formatDate(profile.dateOfBirth)],
          ["Email VNU", this.value(profile.emailVnu), "Email ca nhan", this.value(profile.emailPersonal)],
          ["Dien thoai", this.firstNonEmpty(profile.phoneWork, profile.phoneHome), "Don vi cong tac", this.value(profile.staffType)],
          ["Hoc vi", this.mapValue(profile.academicDegree, DEGREE_LABELS), "Hoc ham", this.mapValue(profile.academicTitle, TITLE_LABELS)],
          ["Linh vuc/ghi chu", this.value(profile.note), "Nguon goc", this.value(profile.origin)],
        ],
        { widths: [2200, 3300, 2200, 3300] },
      )

    builder.addHeading("2. Qua trinh dao tao")
    if (education.length === 0) {
      builder.addParagraph("Khong co du lieu dao tao.")
    } else {
      builder.addTable(
        [
          ["Thoi gian", "Loai", "Co so dao tao", "Chuyen nganh", "Ket qua"],
          ...education.map((item: any) => [
            this.formatPeriod(item.fromDate, item.toDate, item.isStudying),
            this.value(item.eduType),
            this.value(item.institution),
            this.firstNonEmpty(item.major, item.field),
            this.firstNonEmpty(item.degreeLevel, item.certName, item.langName, item.langLevel),
          ]),
        ],
        { widths: [1700, 1500, 2800, 2500, 1500] },
      )
    }

    builder.addHeading("3. Chuc danh va vi tri chuyen mon")
    if (positions.length === 0) {
      builder.addParagraph("Khong co du lieu chuc danh.")
    } else {
      builder.addTable(
        [
          ["Thoi gian", "Vi tri", "Loai", "Thong tin quyet dinh"],
          ...positions.map((item: any) => [
            this.formatPeriod(item.startDate, item.endDate),
            this.value(item.positionName),
            this.value(item.positionType),
            this.firstNonEmpty(item.decisionRef, item.isPrimary ? "Chinh" : ""),
          ]),
        ],
        { widths: [1800, 3200, 2200, 2200] },
      )
    }

    builder.addHeading("4. Tong quan cong bo va san pham khoa hoc")
    if (summaryRows.length === 0) {
      builder.addParagraph("Khong co du lieu nghien cuu khoa hoc.")
    } else {
      builder.addTable([["Loai cong trinh", "So luong"], ...summaryRows], { widths: [7000, 2400] })
    }

    builder.addHeading("5. Danh muc chi tiet cong trinh")
    if (researchWorks.length === 0) {
      builder.addParagraph("Khong co cong trinh nao de liet ke.")
    } else {
      builder.addTable(
        [
          ["Loai", "Tieu de", "Nam", "Tap chi/Hoi nghi/NXB", "Chi tiet"],
          ...researchWorks.map((item) => [
            this.mapValue(item.workType, RESEARCH_TYPE_LABELS),
            this.value(item.title),
            this.value(item.publishYear),
            this.firstNonEmpty(item.journalName, item.projectCode, item.academicYear),
            this.buildResearchExtra(item),
          ]),
        ],
        { widths: [1700, 3200, 900, 2300, 1900] },
      )
    }

    builder.addHeading("6. Khen thuong lien quan")
    const rewardRows = this.buildRewardRows(profile.rewards ?? null)
    if (rewardRows.length === 0) {
      builder.addParagraph("Khong co du lieu khen thuong.")
    } else {
      builder.addTable([["Nhom", "Noi dung", "Moc thoi gian"], ...rewardRows], {
        widths: [1500, 5700, 2600],
      })
    }

    return builder.build()
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

    return parts.join("\n")
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
