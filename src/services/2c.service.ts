/**
 * 2c.service.ts
 * Generate filled 2C Sơ yếu lý lịch DOCX from HRM profile data.
 *
 * Strategy: the 2C.docx template contains literal ASCII-dot placeholders
 * (e.g. "Sinh ngày: .......... tháng ..........").  We open the DOCX as a zip,
 * regex-replace the dot sequences in word/document.xml with real values,
 * then inject proper table rows for education, work-history and family.
 */

import * as fs from 'fs'
import PizZip from 'pizzip'

// ─────────────────────────────────────────────────────────────────────────────
// Types (public – used by profile.controller.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface Address {
    ward?: string
    street?: string
    district?: string
    province?: string
    country?: string
}

export interface EducationItem {
    fromDate: string
    toDate: string
    degreeLevel: string
    institution: string
    major: string
    trainingForm: string
}

export interface WorkHistoryItem {
    fromDate: string
    toDate: string | null
    positionName: string | null
    unitName: string
}

export interface FamilyMember {
    side: 'self' | 'spouse'
    relationship: string
    fullName: string
    birthYear: number
    description: string
}

export interface SalaryInfo {
    occupationTitle: string
    occupationCode: string
    salaryGrade: number
    salaryCoefficient: string
    effectiveDate: string
}

export interface HealthRecord {
    healthStatus: string
    weightKg: string
    heightCm: string | null
    bloodType: string
}

export interface CommendationItem {
    awardName: string
    decisionDate: string
    decisionNumber?: string
    awardLevel: string
    isHighestAward: boolean
}

export interface TitleItem {
    titleName: string
    awardedYear: string
    decisionNumber?: string
    titleLevel: string
    isHighest: boolean
}

export interface ProfileData {
    user: { fullName: string; username: string; email: string }
    gender: string
    dateOfBirth: string
    nickName: string | null
    ethnicity: string
    religion: string
    idNumber: string
    idIssuedDate?: string
    idIssuedBy?: string
    maritalStatus?: string
    addrHometown?: Address | null
    addrBirthplace?: Address | null
    addrPermanent?: Address | null
    addrCurrent?: Address | null
    phoneWork?: string
    phoneHome?: string | null
    eduLevelGeneral?: string
    politicalTheory?: string
    foreignLangLevel?: string
    itLevel?: string
    academicDegree?: string
    joinDate?: string
    staffType?: string
    education: EducationItem[]
    workHistory: WorkHistoryItem[]
    family: FamilyMember[]
    salary?: SalaryInfo | null
    healthRecords?: HealthRecord | null
    rewards?: {
        commendations: CommendationItem[]
        titles: TitleItem[]
        discipline: unknown[]
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const esc = (v: unknown): string =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

const fmtDay = (iso?: string | null) => (iso ? iso.substring(8, 10) : '')
const fmtMo  = (iso?: string | null) => (iso ? iso.substring(5, 7)  : '')
const fmtYr  = (iso?: string | null) => (iso ? iso.substring(0, 4)  : '')
/** "2002-07-01" → "07/2002" */
const fmtMonthYear = (iso?: string | null) =>
    iso ? `${iso.substring(5, 7)}/${iso.substring(0, 4)}` : ''

const fmtAddr = (a?: Address | null) =>
    [a?.street, a?.ward, a?.district, a?.province].filter(Boolean).join(', ')

const capitalize = (s?: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

// ─────────────────────────────────────────────────────────────────────────────
// OOXML snippet builders (for table row injection)
// ─────────────────────────────────────────────────────────────────────────────

const xmlP = (text: string, align: 'left' | 'center', sz = 22): string => {
    const jc = align === 'center' ? '<w:jc w:val="center"/>' : ''
    const sp = align === 'left' ? ' xml:space="preserve"' : ''
    return (
        `<w:p w:rsidR="0023262B" w:rsidRDefault="0023262B">` +
        `<w:pPr>${jc}<w:rPr><w:sz w:val="${sz}"/></w:rPr></w:pPr>` +
        `<w:r><w:rPr><w:sz w:val="${sz}"/></w:rPr>` +
        `<w:t${sp}>${esc(text)}</w:t></w:r></w:p>`
    )
}

const xmlCell = (w: number, ...paras: string[]): string =>
    `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr>${paras.join('')}</w:tc>`

const xmlRow = (...cells: string[]): string =>
    `<w:tr w:rsidR="0023262B" w:rsidRPr="00F42440">` +
    `<w:tblPrEx><w:tblCellMar>` +
    `<w:top w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/>` +
    `</w:tblCellMar></w:tblPrEx>${cells.join('')}</w:tr>`

/** "2002-07-01" → "07/2002" */
const fmtMY = (iso?: string | null) => {
    if (!iso) return ''
    const [y, m] = iso.substring(0, 10).split('-')
    return `${m}/${y}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Field replacement (regex against raw word/document.xml)
// ─────────────────────────────────────────────────────────────────────────────

function applyRegexFields(xml: string, d: ProfileData): string {
    const birth   = d.addrBirthplace ?? {}
    const home    = d.addrHometown ?? {}
    const curr    = d.addrCurrent ?? d.addrPermanent ?? {}
    const sal     = d.salary
    const hr      = d.healthRecords
    const phone   = d.phoneHome || d.phoneWork || ''

    const dobD = fmtDay(d.dateOfBirth)
    const dobM = fmtMo(d.dateOfBirth)
    const dobY = fmtYr(d.dateOfBirth)
    const joinD = fmtDay(d.joinDate)
    const joinM = fmtMo(d.joinDate)
    const joinY = fmtYr(d.joinDate)
    const salMo = fmtMonthYear(sal?.effectiveDate).split('/')[0] ?? ''
    const salYr = fmtMonthYear(sal?.effectiveDate).split('/')[1] ?? ''

    const currentJob = [...d.workHistory]
        .filter(w => !w.toDate)
        .sort((a, b) => b.fromDate.localeCompare(a.fromDate))[0]
    const jobTitle = currentJob?.positionName
        ? `${currentJob.positionName} - ${currentJob.unitName}`
        : currentJob?.unitName ?? ''

    const topEdu = [...d.education].sort((a, b) => b.toDate.localeCompare(a.toDate))[0]
    const degreeLabel = topEdu
        ? `${topEdu.degreeLevel} ${topEdu.major}, ${topEdu.toDate?.substring(0, 4) ?? ''}`
        : ''

    const titlesSorted = [...(d.rewards?.titles ?? [])].sort((a, b) =>
        b.awardedYear.localeCompare(a.awardedYear))
    const commendsSorted = [...(d.rewards?.commendations ?? [])].sort((a, b) =>
        b.decisionDate.localeCompare(a.decisionDate))
    const awardsText = [
        ...titlesSorted.map(t => `${t.titleName} (${t.awardedYear})`),
        ...commendsSorted.map(c => `${c.awardName} (${(c.decisionDate ?? '').substring(0, 4)})`),
    ].join('; ') || 'Không có'
    const disciplineText = (d.rewards?.discipline?.length ?? 0) > 0
        ? 'Có (xem hồ sơ kỷ luật)' : 'Không có'

    // Within a paragraph: (?:(?!<\/w:p>)[\s\S])*? — never crosses </w:p>
    const inPara = '(?:(?!<\\/w:p>)[\\s\\S])*?'

    type Rule = {
        label: string
        pattern: RegExp
        value: string | ((...args: string[]) => string)
    }

    const rules: Rule[] = [
        // ── Field 1: Họ tên — the name run is <w:t>: …… </w:t> with Unicode ellipsis
        {
            label: 'Họ tên',
            pattern: /(<w:t>: )[\u2026\u2025\u22EF…]+\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.user.fullName)}${p2}`,
        },
        // ── Field 1: Giới tính
        {
            label: 'Giới tính',
            pattern: /(Nam, nữ: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.gender)}${p2}`,
        },
        // ── Field 2: Tên gọi khác — tab then dots in next run
        {
            label: 'Tên gọi khác',
            pattern: new RegExp(
                `(Các tên gọi khác: <\\/w:t><\\/w:r>${inPara}<w:tab\\/>)<w:t>(\\.+)(<\\/w:t>)`, 's'),
            value: (_, p1, __, p3) => `${p1}<w:t>${esc(d.nickName ?? 'Không có')}${p3}`,
        },
        // ── Field 4: Ngày sinh DD tháng MM năm YYYY
        {
            label: 'Ngày sinh',
            pattern: /(Sinh ngày: )\.+( tháng )\.+( năm )\.+( <\/w:t>)/,
            value: (_, p1, p2, p3, p4) => `${p1}${dobD}${p2}${dobM}${p3}${dobY}${p4}`,
        },
        // ── Field 5: Nơi sinh
        {
            label: 'Nơi sinh',
            pattern: /(5\) Nơi sinh: )\.+(<\/w:t>)/,
            value: (_, p1, p2) =>
                `${p1}${esc([birth.ward, birth.district, birth.province].filter(Boolean).join(', '))}${p2}`,
        },
        // ── Field 6: Quê quán – xã (unique: only <w:t xml:space="preserve">: ..... </w:t>)
        {
            label: 'Quê quán - xã',
            pattern: new RegExp(
                `(phường\\)<\\/w:t><\\/w:r>${inPara}<w:t[^>]*>: )\\.+( <\\/w:t>${inPara}huyện, quận)`, 's'),
            value: (_, p1, p2) => `${p1}${esc(home.ward ?? '')}${p2}`,
        },
        // ── Field 6: Quê quán – huyện
        {
            label: 'Quê quán - huyện',
            pattern: new RegExp(
                `(huyện, quận\\):<\\/w:t><\\/w:r>${inPara}<w:t[^>]*> )\\.+( <\\/w:t>${inPara}tỉnh, TP)`, 's'),
            value: (_, p1, p2) => `${p1}${esc(home.district ?? '')}${p2}`,
        },
        // ── Field 6: Quê quán – tỉnh (last run in that paragraph)
        {
            label: 'Quê quán - tỉnh',
            pattern: new RegExp(
                `(tỉnh, TP\\):<\\/w:t><\\/w:r>${inPara}<w:t[^>]*> *)\\.+( *<\\/w:t><\\/w:r><\\/w:p>)`, 's'),
            value: (_, p1, p2) => `${p1}${esc(home.province ?? '')}${p2}`,
        },
        // ── Field 7: Nơi ở hiện nay
        {
            label: 'Nơi ở',
            pattern: new RegExp(
                `(đường phố, TP\\): <\\/w:t><\\/w:r>${inPara}<w:t[^>]*>)\\.+( <\\/w:t>)`, 's'),
            value: (_, p1, p2) => `${p1}${esc(fmtAddr(curr))}${p2}`,
        },
        // ── Field 7: Điện thoại
        {
            label: 'Điện thoại',
            pattern: /(đ\/thoại: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(phone)}${p2}`,
        },
        // ── Field 8: Dân tộc
        {
            label: 'Dân tộc',
            pattern: new RegExp(
                `(đê\\.\\.\\.\\): <\\/w:t><\\/w:r>${inPara}<w:t[^>]*>)\\.+( <\\/w:t>)`, 's'),
            value: (_, p1, p2) => `${p1}${esc(d.ethnicity)}${p2}`,
        },
        // ── Field 9: Tôn giáo
        {
            label: 'Tôn giáo',
            pattern: /(9\) Tôn giáo: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.religion)}${p2}`,
        },
        // ── Field 10: Thành phần gia đình xuất thân
        {
            label: 'Thành phần gia đình',
            pattern: new RegExp(
                `(gia đình xuất thân: <\\/w:t><\\/w:r>${inPara}<w:tab\\/>)<w:t>(\\.+)(<\\/w:t>)`, 's'),
            value: (_, p1, __, p3) => `${p1}<w:t>${esc(d.staffType ?? '')}${p3}`,
        },
        // ── Field 12: Ngày tuyển dụng DD / MM / YYYY
        {
            label: 'Ngày tuyển dụng',
            pattern: /(tuyển dụng: )\.+( \/ )\.+( \/ )\.+( <\/w:t>)/,
            value: (_, p1, p2, p3, p4) => `${p1}${joinD}${p2}${joinM}${p3}${joinY}${p4}`,
        },
        // ── Field 12: Cơ quan đầu tiên
        {
            label: 'Cơ quan đầu tiên',
            pattern: /(Vào cơ quan nào, ở dâu: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(currentJob?.unitName ?? '')}${p2}`,
        },
        // ── Field 13: Ngày vào cơ quan hiện tại DD / MM / YYYY
        {
            label: 'Ngày vào cơ quan',
            pattern: /(công tác: )\.+( \/ )\.+( \/ )\.+(, <\/w:t>)/,
            value: (_, p1, p2, p3, p4) => `${p1}${joinD}${p2}${joinM}${p3}${joinY}${p4}`,
        },
        // ── Field 17a: Giáo dục phổ thông
        {
            label: 'Giáo dục phổ thông',
            pattern: /(Giáo dục phổ thông: )\.+( <\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.eduLevelGeneral ?? '')}${p2}`,
        },
        // ── Field 17a: Học hàm học vị
        {
            label: 'Học hàm học vị',
            pattern: /(Học hàm, học vị cao nhất: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(degreeLabel)}${p2}`,
        },
        // ── Field 17b: Lý luận chính trị
        {
            label: 'Lý luận chính trị',
            pattern: /(Lý luận chính trị: )\.+( <\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(capitalize(d.politicalTheory))}${p2}`,
        },
        // ── Field 17b: Ngoại ngữ
        {
            label: 'Ngoại ngữ',
            pattern: /(- Ngoại ngữ: )\.+(<\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.foreignLangLevel ?? '')}${p2}`,
        },
        // ── Field 18: Công tác chính — tab then dots
        {
            label: 'Công tác chính',
            pattern: new RegExp(
                `(Công tác chính đang làm: <\\/w:t><\\/w:r>${inPara}<w:tab\\/>)<w:t>(\\.+)(<\\/w:t>)`, 's'),
            value: (_, p1, __, p3) => `${p1}<w:t>${esc(jobTitle)}${p3}`,
        },
        // ── Field 19: Ngạch công chức (occupation title)
        {
            label: 'Ngạch công chức',
            pattern: /(Ngạch công chức: )\.+( <\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(sal?.occupationTitle ?? '')}${p2}`,
        },
        // ── Field 19: Mã số
        {
            label: 'Mã số ngạch',
            pattern: /(mã số: )\.+(\) <\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(sal?.occupationCode ?? '')}${p2}`,
        },
        // ── Field 19: Bậc lương, hệ số, từ tháng MM/YYYY
        {
            label: 'Bậc lương hệ số',
            pattern: /(Bậc lương: )\.+(, hệ số: )\.+( từ tháng )\.+(\/)\.+(<\/w:t>)/,
            value: (_, p1, p2, p3, p4, p5) =>
                `${p1}${esc(String(sal?.salaryGrade ?? ''))}${p2}${esc(sal?.salaryCoefficient ?? '')}${p3}${esc(salMo)}${p4}${esc(salYr)}${p5}`,
        },
        // ── Field 22: Khen thưởng
        {
            label: 'Khen thưởng',
            pattern: new RegExp(
                `(Khen thưởng: <\\/w:t><\\/w:r>${inPara}<w:tab\\/>)<w:t>(\\.+)(<\\/w:t>)`, 's'),
            value: (_, p1, __, p3) =>
                `${p1}<w:t xml:space="preserve">${esc(awardsText.substring(0, 250))}${p3}`,
        },
        // ── Field 23: Kỷ luật
        {
            label: 'Kỷ luật',
            pattern: new RegExp(
                `(Kỷ luật${inPara}: <\\/w:t><\\/w:r>${inPara}<w:tab\\/>)<w:t>(\\.+)(<\\/w:t>)`, 's'),
            value: (_, p1, __, p3) => `${p1}<w:t>${esc(disciplineText)}${p3}`,
        },
        // ── Field 24: Tình trạng sức khỏe
        {
            label: 'Sức khỏe',
            pattern: /(Tình trạng sức khỏe: )\.+( <\/w:t>)/,
            value: (_, p1, p2) =>
                `${p1}${esc((hr?.healthStatus ?? '').replace('Loại A: ', 'Loại A - '))}${p2}`,
        },
        // ── Field 24: Cao, Cân nặng, Nhóm máu
        {
            label: 'Chiều cao cân nặng',
            pattern: /(Cao: 1m )\.+(, {1,2}Cân nặng: )\.+( \(kg\), Nhóm máu: )\.+(<\/w:t>)/,
            value: (_, p1, p2, p3, p4) =>
                `${p1}${esc(hr?.heightCm ?? '')}${p2}${esc(hr?.weightKg ?? '')}${p3}${esc(hr?.bloodType ?? '')}${p4}`,
        },
        // ── Field 25: Số CMND
        {
            label: 'CMND',
            pattern: /(chứng minh nhân dân: )\.+( <\/w:t>)/,
            value: (_, p1, p2) => `${p1}${esc(d.idNumber)}${p2}`,
        },
    ]

    let result = xml
    let filled = 0
    for (const rule of rules) {
        if (rule.pattern.test(result)) {
            result = result.replace(rule.pattern, rule.value as any)
            filled++
        } else {
            console.warn(`[export2C] No match: ${rule.label}`)
        }
    }
    console.log(`[export2C] Fields: ${filled}/${rules.length}`)
    return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Table row builders
// ─────────────────────────────────────────────────────────────────────────────

/** Field 26 – education (5 cols: 2628|2880|1620|1620|2572) */
function buildEducationRows(education: EducationItem[]): string {
    return [...education]
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
        .map(e =>
            xmlRow(
                xmlCell(2628, xmlP(e.institution, 'left')),
                xmlCell(2880, xmlP(e.major, 'left')),
                xmlCell(1620, xmlP(`${fmtMY(e.fromDate)} - ${fmtMY(e.toDate)}`, 'center')),
                xmlCell(1620, xmlP(e.trainingForm, 'center')),
                xmlCell(2572, xmlP(e.degreeLevel, 'left')),
            ),
        )
        .join('\n')
}

/** Field 27 – work history (2 cols: 1908|9414) */
function buildWorkHistoryRows(workHistory: WorkHistoryItem[]): string {
    return [...workHistory]
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
        .map(w => {
            const period = `${fmtMY(w.fromDate)} - ${w.toDate ? fmtMY(w.toDate) : 'nay'}`
            const position = w.positionName
                ? `${w.positionName} - ${w.unitName}`
                : `Giảng viên - ${w.unitName}`
            return xmlRow(
                xmlCell(1908, xmlP(period, 'center')),
                xmlCell(9414, xmlP(position, 'left')),
            )
        })
        .join('\n')
}

/** Field 30 – family (4 cols: 1008|2340|900|7072) */
function buildFamilyRows(members: FamilyMember[]): string {
    const ORDER = [
        'Ông nội', 'Bà nội', 'Ông ngoại', 'Bà ngoại',
        'Bố đẻ', 'Mẹ đẻ', 'Vợ', 'Chồng',
        'Con trai', 'Con gái', 'Anh trai', 'Chị gái', 'Em trai', 'Em gái',
    ]
    return [...members]
        .sort((a, b) => {
            const ia = ORDER.indexOf(a.relationship)
            const ib = ORDER.indexOf(b.relationship)
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
        })
        .map(m =>
            xmlRow(
                xmlCell(1008, xmlP(m.relationship, 'center')),
                xmlCell(2340, xmlP(m.fullName, 'left')),
                xmlCell(900, xmlP(String(m.birthYear), 'center')),
                xmlCell(7072, xmlP(m.description, 'left')),
            ),
        )
        .join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic table row injector
// ─────────────────────────────────────────────────────────────────────────────

function injectTableRows(
    xml: string,
    tablePattern: RegExp,
    rowPattern: RegExp,
    newRows: string,
    label: string,
): string {
    const tblMatch = tablePattern.exec(xml)
    if (!tblMatch) { console.warn(`[export2C] Table "${label}" not found`); return xml }

    const oldTable = tblMatch[1]
    const rowMatch = rowPattern.exec(oldTable)
    if (!rowMatch) { console.warn(`[export2C] Placeholder row in "${label}" not found`); return xml }

    const newTable = oldTable.replace(rowMatch[1], newRows)
    console.log(`[export2C] Table "${label}" filled`)
    return xml.replace(oldTable, newTable)
}

// Table patterns – identified by unique column-width signatures
const T_EDU = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="2628"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s
const T_WH  = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1908"\/>\s*<w:gridCol w:w="9414"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s
const T_FAM = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1008"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s

// Row patterns – find the existing placeholder row to replace
const R_DOTS  = /(<w:tr\b[^>]*>(?:(?!<w:tr\b).)*?\.{10,}(?:(?!<\/w:tr>).)*?<\/w:tr>)/s
const R_BOMME = /(<w:tr\b[^>]*>(?:(?!<w:tr\b).)*?Bố, mẹ(?:(?!<\/w:tr>).)*?<\/w:tr>)/s

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface Export2COptions {
    templatePath: string
    profile: ProfileData
    /** Optional photo — not injected in current version */
    photo?: unknown
}

/**
 * Generate a filled 2C lý lịch .docx.
 * Returns a Buffer ready to write to disk or stream over HTTP.
 */
export async function export2CForm(opts: Export2COptions): Promise<Buffer> {
    const { templatePath, profile: d } = opts

    const zip = new PizZip(fs.readFileSync(templatePath, 'binary'))
    let xml = zip.file('word/document.xml')!.asText()

    // 1 – Fill simple fields
    xml = applyRegexFields(xml, d)

    // 2 – Field 26: Education table
    xml = injectTableRows(xml, T_EDU, R_DOTS, buildEducationRows(d.education), 'education')

    // 3 – Field 27: Work history table
    xml = injectTableRows(xml, T_WH, R_DOTS, buildWorkHistoryRows(d.workHistory), 'workHistory')

    // 4 – Field 30a: Family (self side)
    const famSelf   = d.family.filter(m => m.side === 'self')
    const famSpouse = d.family.filter(m => m.side === 'spouse')
    xml = injectTableRows(xml, T_FAM, R_BOMME, buildFamilyRows(famSelf), 'family-a')

    // 5 – Field 30b: Family (spouse side) — second table with same column signature
    const famAllMatches = [...xml.matchAll(
        /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1008"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/gs,
    )]
    if (famAllMatches.length >= 2) {
        const oldTableB = famAllMatches[1][1]
        const rowB = R_DOTS.exec(oldTableB)
        if (rowB) {
            xml = xml.replace(oldTableB, oldTableB.replace(rowB[1], buildFamilyRows(famSpouse)))
            console.log('[export2C] Table "family-b" filled')
        }
    }

    zip.file('word/document.xml', xml)

    const output = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    }) as Buffer

    console.log(`[export2C] Done — ${(output.length / 1024).toFixed(1)} KB`)
    return output
}
