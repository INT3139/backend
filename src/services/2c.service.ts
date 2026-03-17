/**
 * export.service.ts
 * Generate filled 2C Sơ yếu lý lịch DOCX from HRM API profile JSON.
 * 
 * Install: npm install jszip
 */

import * as fs from 'fs';
import JSZip from 'jszip';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Address {
    ward?: string;
    street?: string;
    district?: string;
    province?: string;
    country?: string;
}

export interface EducationItem {
    fromDate: string;        // "1998-09-01"
    toDate: string;
    degreeLevel: string;     // "Cử nhân" | "Thạc sĩ" | "Tiến sĩ"
    institution: string;
    major: string;
    trainingForm: string;    // "Chính quy"
}

export interface WorkHistoryItem {
    fromDate: string;
    toDate: string | null;
    positionName: string | null;
    unitName: string;
}

export interface FamilyMember {
    side: 'self' | 'spouse';
    relationship: string;    // "Bố đẻ" | "Mẹ đẻ" | "Vợ" | ...
    fullName: string;
    birthYear: number;
    description: string;
}

export interface SalaryInfo {
    occupationTitle: string;
    occupationCode: string;
    salaryGrade: number;
    salaryCoefficient: string;
    effectiveDate: string;
}

export interface HealthRecord {
    healthStatus: string;
    weightKg: string;
    heightCm: string | null;
    bloodType: string;
}

export interface CommendationItem {
    awardName: string;
    decisionDate: string;
    decisionNumber?: string;
    awardLevel: string;
    isHighestAward: boolean;
}

export interface TitleItem {
    titleName: string;
    awardedYear: string;
    decisionNumber?: string;
    titleLevel: string;
    isHighest: boolean;
}

export interface ProfileData {
    user: { fullName: string; username: string; email: string };
    // personal
    gender: string;
    dateOfBirth: string;
    nickName: string | null;
    ethnicity: string;
    religion: string;
    idNumber: string;
    idIssuedDate?: string;
    idIssuedBy?: string;
    maritalStatus?: string;
    // addresses
    addrHometown?: Address | null;
    addrBirthplace?: Address | null;
    addrPermanent?: Address | null;
    addrCurrent?: Address | null;
    phoneWork?: string;
    phoneHome?: string | null;
    // education background
    eduLevelGeneral?: string;
    politicalTheory?: string;
    foreignLangLevel?: string;
    itLevel?: string;
    academicDegree?: string;
    // employment
    joinDate?: string;
    staffType?: string;
    // photo (future field from API)
    photoUrl?: string;
    photoBase64?: string;
    // relations
    education: EducationItem[];
    workHistory: WorkHistoryItem[];
    family: FamilyMember[];
    salary?: SalaryInfo | null;
    healthRecords?: HealthRecord | null;
    rewards?: {
        commendations: CommendationItem[];
        titles: TitleItem[];
        discipline: unknown[];
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const esc = (v: unknown): string =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** "2002-07-01" → "01/07/2002" */
const fmtDate = (iso?: string | null): string => {
    if (!iso) return '';
    const [y, m, d] = iso.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
};

/** "2002-07-01" → "07/2002" */
const fmtMonth = (iso?: string | null): string => {
    if (!iso) return '';
    const [y, m] = iso.substring(0, 10).split('-');
    return `${m}/${y}`;
};

const fmtAddr = (a?: Address | null): string =>
    [a?.street, a?.ward, a?.district, a?.province].filter(Boolean).join(', ');

const capitalize = (s?: string | null): string =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ─────────────────────────────────────────────────────────────────────────────
// OOXML snippet builders
// ─────────────────────────────────────────────────────────────────────────────

const xmlP = (text: string, align: 'left' | 'center', sz = 22): string => {
    const jc = align === 'center' ? '<w:jc w:val="center"/>' : '';
    const sp = align === 'left' ? ' xml:space="preserve"' : '';
    return (
        `<w:p w:rsidR="0023262B" w:rsidRDefault="0023262B">` +
        `<w:pPr>${jc}<w:rPr><w:sz w:val="${sz}"/></w:rPr></w:pPr>` +
        `<w:r><w:rPr><w:sz w:val="${sz}"/></w:rPr>` +
        `<w:t${sp}>${esc(text)}</w:t></w:r></w:p>`
    );
};

const xmlCell = (w: number, ...paras: string[]): string =>
    `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr>${paras.join('')}</w:tc>`;

const xmlRow = (...cells: string[]): string =>
    `<w:tr w:rsidR="0023262B" w:rsidRPr="00F42440">` +
    `<w:tblPrEx><w:tblCellMar>` +
    `<w:top w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/>` +
    `</w:tblCellMar></w:tblPrEx>${cells.join('')}</w:tr>`;

// ─────────────────────────────────────────────────────────────────────────────
// Regex-based field replacement  (robust against exact dot counts)
// ─────────────────────────────────────────────────────────────────────────────

type RegexReplacement = {
    label: string;
    pattern: RegExp;
    /**
     * Either a fixed string or a function receiving the full match + capture groups.
     * Use capture groups (g1, g2…) to keep surrounding XML intact.
     */
    replacement: string | ((...args: string[]) => string);
};

function applyRegexFields(xml: string, d: ProfileData): string {
    const birth = d.addrBirthplace ?? {};
    const home = d.addrHometown ?? {};
    const curr = d.addrCurrent ?? d.addrPermanent ?? {};
    const sal = d.salary;
    const hr = d.healthRecords;
    const phone = d.phoneHome || d.phoneWork || '';
    const [dobY = '', dobM = '', dobD = ''] = (d.dateOfBirth ?? '').substring(0, 10).split('-');

    const currentJob = [...d.workHistory]
        .filter(w => !w.toDate)
        .sort((a, b) => b.fromDate.localeCompare(a.fromDate))[0];
    const jobTitle = currentJob?.positionName
        ? `${currentJob.positionName} - ${currentJob.unitName}`
        : currentJob?.unitName ?? '';

    const topEdu = [...d.education].sort((a, b) => b.toDate.localeCompare(a.toDate))[0];
    const degreeLabel = topEdu
        ? `${topEdu.degreeLevel} ${topEdu.major}, ${topEdu.toDate?.substring(0, 4) ?? ''}`
        : '';

    const titlesSorted = [...(d.rewards?.titles ?? [])].sort((a, b) =>
        b.awardedYear.localeCompare(a.awardedYear));
    const commendsSorted = [...(d.rewards?.commendations ?? [])].sort((a, b) =>
        b.decisionDate.localeCompare(a.decisionDate));
    const awardsText = [
        ...titlesSorted.map(t => `${t.titleName} (${t.awardedYear})`),
        ...commendsSorted.map(c => `${c.awardName} (${(c.decisionDate ?? '').substring(0, 4)})`),
    ].join('; ') || 'Không có';
    const disciplineText = (d.rewards?.discipline?.length ?? 0) > 0
        ? 'Có (xem hồ sơ kỷ luật)' : 'Không có';

    const rules: RegexReplacement[] = [
        // ── 1. Họ tên + giới tính
        // Original: ……………………………………..</w:t>\n      <w:tab/><w:t>Nam, nữ: .....................
        {
            label: 'field-01 họ tên',
            pattern: /(khai sinh: )…+\.*<\/w:t>\n( +<w:tab\/><w:t>Nam, nữ: )\.+/,
            replacement: (_, p1, p2) =>
                `${p1}${esc(d.user.fullName)}</w:t>\n${p2}${d.gender}`,
        },
        // ── 2. Tên gọi khác
        {
            label: 'field-02 tên khác',
            pattern: /(Các tên gọi khác: <\/w:t>\n +<w:tab\/><w:t>)\.+/,
            replacement: (_, p1) => `${p1}${esc(d.nickName ?? 'Không có')}`,
        },
        // ── 4+5. Sinh ngày + nơi sinh
        {
            label: 'field-04-05 sinh ngày + nơi sinh',
            pattern: /(Sinh ngày: )\.+ (tháng )\.+ (năm )\.+ (<\/w:t>\n +<w:tab\/><w:t>5\) Nơi sinh: )\.+/,
            replacement: (_, p1, p2, p3, p4) =>
                `${p1}${dobD} ${p2}${dobM} ${p3}${dobY} ${p4}` +
                esc([birth.ward, birth.district, birth.province].filter(Boolean).join(', ')),
        },
        // ── 6. Quê quán xã — dots after first colon in field 6
        // Structure: ": ........................." then "(huyện, quận):" then " ........................ "
        //            then tab then "(tỉnh, TP): " then "..............................."
        {
            label: 'field-06 quê quán xã',
            pattern: /(6\) Quê quán <\/w:t>[\s\S]*?: )\.+([\s\S]*?huyện, quận\):[\s\S]*?preserve"> )\.+( <\/w:t>\n +<w:tab\/>[\s\S]*?tỉnh, TP\): <\/w:t>[\s\S]*?<w:t>)\.+/,
            replacement: (_, p1, p2, p3) =>
                `${p1}${esc(home.ward ?? '')}${p2}${esc(home.district ?? '')}${p3}${esc(home.province ?? '')}`,
        },
        // ── 7. Nơi ở hiện nay + điện thoại
        {
            label: 'field-07 nơi ở',
            pattern: /(đường phố, TP\): <\/w:t>[\s\S]*?preserve">)\.+( <\/w:t>\n +<w:tab\/><w:t>đ\/thoại: )\.+/,
            replacement: (_, p1, p2) => `${p1}${esc(fmtAddr(curr))}${p2}${esc(phone)}`,
        },
        // ── 8+9. Dân tộc + tôn giáo
        {
            label: 'field-08-09 dân tộc + tôn giáo',
            pattern: /(Ê đê\.\.\.\): <\/w:t>[\s\S]*?preserve">)\.+( <\/w:t>\n +<w:tab\/><w:t>9\) Tôn giáo: )\.+/,
            replacement: (_, p1, p2) => `${p1}${esc(d.ethnicity)}${p2}${esc(d.religion)}`,
        },
        // ── 10. Thành phần gia đình xuất thân
        {
            label: 'field-10 thành phần',
            pattern: /(Thành phần gia đình xuất thân: <\/w:t>\n +<w:tab\/><w:t>)\.+/,
            replacement: (_, p1) => `${p1}${esc(d.staffType ?? '')}`,
        },
        // ── 12. Ngày tuyển dụng + cơ quan
        {
            label: 'field-12 tuyển dụng',
            pattern: /(Ngày được tuyển dụng: )\.+ \/ \.+ \/ \.+( <\/w:t>\n +<w:tab\/><w:t>Vào cơ quan nào, ở dâu: )\.+/,
            replacement: (_, p1, p2) =>
                `${p1}${esc(fmtDate(d.joinDate))}${p2}${esc(currentJob?.unitName ?? '')}`,
        },
        // ── 13. Vào cơ quan hiện tại + tham gia CM
        {
            label: 'field-13 vào cơ quan',
            pattern: /(Ngày vào cơ quan hiện đang công tác: )\.+ \/ \.+ \/ \.+(, <\/w:t>\n +<w:tab\/><w:t>Ngày tham gia cách mạng: )\.+ \/ \.+ \/ \.+/,
            replacement: (_, p1, p2) =>
                `${p1}${esc(fmtDate(d.joinDate))}${p2}`,
        },
        // ── 17a. Giáo dục phổ thông + học hàm học vị
        {
            label: 'field-17a gdpt + học hàm',
            pattern: /(Giáo dục phổ thông: )\.+( <\/w:t>\n +<w:tab\/>[\s\S]*?Học hàm, học vị cao nhất: )\.+/,
            replacement: (_, p1, p2) =>
                `${p1}${esc(d.eduLevelGeneral ?? '')}${p2}${esc(degreeLabel)}`,
        },
        // ── 17b. Lý luận chính trị + ngoại ngữ
        {
            label: 'field-17b lý luận + ngoại ngữ',
            pattern: /(- Lý luận chính trị: )\.+( <\/w:t>\n +<w:tab\/><w:t>- Ngoại ngữ: )\.+/,
            replacement: (_, p1, p2) =>
                `${p1}${esc(capitalize(d.politicalTheory))}${p2}${esc(d.foreignLangLevel ?? '')}`,
        },
        // ── 18. Công tác chính
        {
            label: 'field-18 công tác chính',
            pattern: /(18\) Công tác chính đang làm: <\/w:t>\n +<w:tab\/><w:t>)\.+/,
            replacement: (_, p1) => `${p1}${esc(jobTitle)}`,
        },
        // ── 19. Ngạch + mã số + bậc lương + hệ số + từ tháng
        {
            label: 'field-19 ngạch lương',
            pattern: /(19\) Ngạch công chức: )\.+([\s\S]*?mã số: )\.+([\s\S]*?Bậc lương: )\.+(, hệ số: )\.+( từ tháng )\.+ \/\.+/,
            replacement: (_, p1, p2, p3, p4, p5) =>
                `${p1}${esc(sal?.occupationTitle ?? '')}` +
                `${p2}${esc(sal?.occupationCode ?? '')}` +
                `${p3}${esc(String(sal?.salaryGrade ?? ''))}` +
                `${p4}${esc(sal?.salaryCoefficient ?? '')}` +
                `${p5}${esc(fmtMonth(sal?.effectiveDate))}`,
        },
        // ── 22. Khen thưởng
        {
            label: 'field-22 khen thưởng',
            pattern: /(22\) Khen thưởng: <\/w:t>\n +<w:tab\/><w:t>)\.+/,
            replacement: (_, p1) =>
                `${p1.replace('<w:t>', '<w:t xml:space="preserve">')}${esc(awardsText.substring(0, 250))}`,
        },
        // ── 23. Kỷ luật
        {
            label: 'field-23 kỷ luật',
            pattern: /(hình thức, \.\.\.\)<\/w:t>[\s\S]*?preserve">: <\/w:t>\n +<w:tab\/><w:t>)\.+/,
            replacement: (_, p1) => `${p1}${esc(disciplineText)}`,
        },
        // ── 24. Sức khỏe + cân nặng + nhóm máu
        {
            label: 'field-24 sức khỏe',
            pattern: /(24\) Tình trạng sức khỏe: )\.+( <\/w:t>\n +<w:tab\/><w:t>Cao: 1m )\.+(,  Cân nặng: )\.+( \(kg\), Nhóm máu: )\.+/,
            replacement: (_, p1, p2, p3, p4) => {
                const status = (hr?.healthStatus ?? '').replace('Loại A: ', 'Loại A - ');
                const weight = parseFloat(hr?.weightKg ?? '0') || '';
                return `${p1}${esc(status)}${p2}${esc(hr?.heightCm ?? '...')}${p3}${esc(String(weight))}${p4}${esc(hr?.bloodType ?? '')}`;
            },
        },
        // ── 25. Số CMND
        {
            label: 'field-25 CMND',
            pattern: /(25\) Số chứng minh nhân dân: )\.+( <\/w:t>)/,
            replacement: (_, p1, p2) => `${p1}${esc(d.idNumber)}${p2}`,
        },
    ];

    let result = xml;
    let filled = 0;
    for (const rule of rules) {
        if (rule.pattern.test(result)) {
            result = result.replace(rule.pattern, rule.replacement as any);
            filled++;
        } else {
            console.warn(`[export2C] No match: ${rule.label}`);
        }
    }
    console.log(`[export2C] Simple fields: ${filled}/${rules.length}`);
    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Table row builders
// ─────────────────────────────────────────────────────────────────────────────

/** Mục 26 — Đào tạo (5 cột: 2628 | 2880 | 1620 | 1620 | 2572) */
function buildEducationRows(education: EducationItem[]): string {
    return [...education]
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
        .map(e =>
            xmlRow(
                xmlCell(2628, xmlP(e.institution, 'left')),
                xmlCell(2880, xmlP(e.major, 'left')),
                xmlCell(1620, xmlP(`${fmtMonth(e.fromDate)} - ${fmtMonth(e.toDate)}`, 'center')),
                xmlCell(1620, xmlP(e.trainingForm, 'center')),
                xmlCell(2572, xmlP(e.degreeLevel, 'left')),
            ),
        )
        .join('\n');
}

/** Mục 27 — Quá trình công tác (2 cột: 1908 | 9414) */
function buildWorkHistoryRows(workHistory: WorkHistoryItem[]): string {
    return [...workHistory]
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
        .map(w => {
            const period = `${fmtMonth(w.fromDate)} - ${w.toDate ? fmtMonth(w.toDate) : 'nay'}`;
            const position = w.positionName
                ? `${w.positionName} - ${w.unitName}`
                : `Giảng viên - ${w.unitName}`;
            return xmlRow(
                xmlCell(1908, xmlP(period, 'center')),
                xmlCell(9414, xmlP(position, 'left')),
            );
        })
        .join('\n');
}

/** Mục 30 — Quan hệ gia đình (4 cột: 1008 | 2340 | 900 | 7072) */
function buildFamilyRows(members: FamilyMember[]): string {
    const ORDER = [
        'Ông nội', 'Bà nội', 'Ông ngoại', 'Bà ngoại',
        'Bố đẻ', 'Mẹ đẻ',
        'Vợ', 'Chồng',
        'Con trai', 'Con gái',
        'Anh trai', 'Chị gái', 'Em trai', 'Em gái',
    ];
    return [...members]
        .sort((a, b) => {
            const ia = ORDER.indexOf(a.relationship);
            const ib = ORDER.indexOf(b.relationship);
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        })
        .map(m =>
            xmlRow(
                xmlCell(1008, xmlP(m.relationship, 'center')),
                xmlCell(2340, xmlP(m.fullName, 'left')),
                xmlCell(900, xmlP(String(m.birthYear), 'center')),
                xmlCell(7072, xmlP(m.description, 'left')),
            ),
        )
        .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic table injector
// ─────────────────────────────────────────────────────────────────────────────

function injectTableRows(
    xml: string,
    tablePattern: RegExp,
    rowPattern: RegExp,
    newRows: string,
    label: string,
): string {
    const tblMatch = tablePattern.exec(xml);
    if (!tblMatch) {
        console.warn(`[export2C] Table "${label}" not found`);
        return xml;
    }
    const oldTable = tblMatch[1];
    const rowMatch = rowPattern.exec(oldTable);
    if (!rowMatch) {
        console.warn(`[export2C] Placeholder row in "${label}" not found`);
        return xml;
    }
    const newTable = oldTable.replace(rowMatch[1], newRows);
    console.log(`[export2C] Table "${label}" filled`);
    return xml.replace(oldTable, newTable);
}

// Table patterns (column-width signature)
const T_EDU = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="2628"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s;
const T_WH = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1908"\/>[\s]*<w:gridCol w:w="9414"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s;
const T_FAM = /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1008"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/s;
// Row patterns
const R_DOTS = /(<w:tr\b[^>]*>(?:(?!<w:tr\b).)*?\.{10,}(?:(?!<\/w:tr>).)*?<\/w:tr>)/s;
const R_BOMME = /(<w:tr\b[^>]*>(?:(?!<w:tr\b).)*?Bố, mẹ(?:(?!<\/w:tr>).)*?<\/w:tr>)/s;

// ─────────────────────────────────────────────────────────────────────────────
// Photo injection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace the "Ảnh 4 x 6" textbox with an embedded image.
 * Called only when photo data is provided.
 */
async function injectPhoto(
    xml: string,
    zip: JSZip,
    imageBuffer: Buffer,
    mimeType: 'image/jpeg' | 'image/png' = 'image/jpeg',
): Promise<string> {
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const rId = 'rId100';
    const name = `image_photo.${ext}`;

    // Add image bytes
    zip.file(`word/media/${name}`, imageBuffer);

    // Register relationship
    const relsPath = 'word/_rels/document.xml.rels';
    let relsXml = await zip.file(relsPath)!.async('string');
    relsXml = relsXml.replace(
        '</Relationships>',
        `  <Relationship Id="${rId}" ` +
        `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ` +
        `Target="media/${name}"/>\n</Relationships>`,
    );
    zip.file(relsPath, relsXml);

    // Register content type
    const ctPath = '[Content_Types].xml';
    let ctXml = await zip.file(ctPath)!.async('string');
    if (!ctXml.includes(`Extension="${ext}"`)) {
        ctXml = ctXml.replace(
            '</Types>',
            `  <Default Extension="${ext}" ContentType="${mimeType}"/>\n</Types>`,
        );
        zip.file(ctPath, ctXml);
    }

    // 79.2 pt × 108.05 pt  (1 pt = 12700 EMU)
    const cx = Math.round(79.2 * 12700);
    const cy = Math.round(108.05 * 12700);

    const drawingXml =
        `<w:drawing>` +
        `<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">` +
        `<wp:extent cx="${cx}" cy="${cy}"/>` +
        `<wp:effectExtent l="0" t="0" r="0" b="0"/>` +
        `<wp:docPr id="1" name="photo"/>` +
        `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
        `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:nvPicPr><pic:cNvPr id="0" name="photo"/><pic:cNvPicPr/></pic:nvPicPr>` +
        `<pic:blipFill>` +
        `<a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>` +
        `<a:stretch><a:fillRect/></a:stretch>` +
        `</pic:blipFill>` +
        `<pic:spPr>` +
        `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
        `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
        `</pic:spPr>` +
        `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;

    // Replace the <w:pict>…</w:pict> placeholder block
    return xml.replace(/<w:pict>[\s\S]*?<\/w:pict>/, drawingXml);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface Export2COptions {
    /** Absolute path to the blank 2C.docx template */
    templatePath: string;
    /** Profile data from HRM API (response.data) */
    profile: ProfileData;
    /**
     * Optional photo for the "Ảnh 4 x 6" slot.
     * Pass a Buffer (raw bytes) or a base64 string.
     * When `photoBase64` is present on the profile, it is used automatically
     * unless overridden here.
     */
    photo?: {
        data: Buffer | string;
        mimeType?: 'image/jpeg' | 'image/png';
    };
}

/**
 * Generate a filled 2C lý lịch .docx.
 * Returns a Buffer ready to write to disk or stream over HTTP.
 *
 * @example — Express / NestJS
 * ```ts
 * const buf = await export2CForm({
 *   templatePath: path.join(__dirname, '../templates/2C.docx'),
 *   profile: apiResponse.data,
 *   // Photo is optional — wire up when the field arrives from API:
 *   photo: profile.photoBase64
 *     ? { data: profile.photoBase64 }
 *     : undefined,
 * });
 * res.setHeader(
 *   'Content-Type',
 *   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 * );
 * res.setHeader('Content-Disposition', `attachment; filename="LyLich_${profile.user.username}.docx"`);
 * res.send(buf);
 * ```
 */
export async function export2CForm(opts: Export2COptions): Promise<Buffer> {
    const { templatePath, profile: d, photo } = opts;

    // 1 — Load template docx as zip
    const zip = await JSZip.loadAsync(fs.readFileSync(templatePath));
    let xml = await zip.file('word/document.xml')!.async('string');

    // 2 — Fill text fields (regex, robust to dot-count variation)
    xml = applyRegexFields(xml, d);

    // 3 — Mục 26: Đào tạo
    xml = injectTableRows(xml, T_EDU, R_DOTS, buildEducationRows(d.education), 'education');

    // 4 — Mục 27: Quá trình công tác
    xml = injectTableRows(xml, T_WH, R_DOTS, buildWorkHistoryRows(d.workHistory), 'workHistory');

    // 5 — Mục 30a: Gia đình bản thân
    const famSelf = d.family.filter(m => m.side === 'self');
    const famSpouse = d.family.filter(m => m.side === 'spouse');
    xml = injectTableRows(xml, T_FAM, R_BOMME, buildFamilyRows(famSelf), 'family-a');

    // 6 — Mục 30b: Gia đình bên vợ/chồng (second occurrence of same table pattern)
    const famAllMatches = [
        ...xml.matchAll(
            /(<w:tbl>(?:(?!<w:tbl>).)*?<w:gridCol w:w="1008"\/>(?:(?!<\/w:tbl>).)*?<\/w:tbl>)/gs,
        ),
    ];
    if (famAllMatches.length >= 2) {
        const oldTableB = famAllMatches[1][1];
        const rowB = R_DOTS.exec(oldTableB);
        if (rowB) {
            xml = xml.replace(oldTableB, oldTableB.replace(rowB[1], buildFamilyRows(famSpouse)));
            console.log('[export2C] Table "family-b" filled');
        }
    }

    // 7 — Photo: use opts.photo first, fall back to profile.photoBase64
    const photoSource = photo ?? (d.photoBase64 ? { data: d.photoBase64 } : undefined);
    if (photoSource) {
        const buf = typeof photoSource.data === 'string'
            ? Buffer.from(photoSource.data, 'base64')
            : photoSource.data;
        xml = await injectPhoto(xml, zip, buf, photoSource.mimeType ?? 'image/jpeg');
        console.log('[export2C] Photo injected');
    }

    // 8 — Save & generate output buffer
    zip.file('word/document.xml', xml);
    const output = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });

    console.log(`[export2C] Done — ${(output.length / 1024).toFixed(1)} KB`);
    return output;
}