import { z } from 'zod'

export const educationSchema = z.object({
    eduType: z.enum(['degree', 'certificate', 'foreign_lang', 'it']),
    fromDate: z.string().transform(v => new Date(v)).optional(),
    toDate: z.string().transform(v => new Date(v)).optional(),
    degreeLevel: z.string().optional(),
    institution: z.string().optional(),
    major: z.string().optional(),
    trainingForm: z.string().optional(),
    field: z.string().optional(),
    isStudying: z.boolean().optional(),
    certName: z.string().optional(),
    langName: z.string().optional(),
    langLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional()
})

export const familySchema = z.object({
    side: z.enum(['self', 'spouse']),
    relationship: z.string().min(1),
    fullName: z.string().min(1),
    birthYear: z.number().int().optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional()
})

export const workHistorySchema = z.object({
    historyType: z.enum(['chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri']),
    fromDate: z.string().transform(v => new Date(v)).optional(),
    toDate: z.string().transform(v => new Date(v)).optional(),
    unitName: z.string().min(1),
    positionName: z.string().optional(),
    activityType: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional()
})

export const extraInfoSchema = z.object({
    arrestHistory: z.string().optional(),
    oldRegimeWork: z.string().optional(),
    foreignOrgRelations: z.string().optional(),
    foreignRelatives: z.string().optional(),
    incomeSalary: z.number().optional(),
    incomeOtherSources: z.number().optional(),
    houseTypeGranted: z.string().optional(),
    houseAreaGranted: z.number().optional(),
    houseTypeOwned: z.string().optional(),
    houseAreaOwned: z.number().optional(),
    landGrantedM2: z.number().optional(),
    landPurchasedM2: z.number().optional(),
    landBusinessM2: z.number().optional()
})

export const healthSchema = z.object({
    healthStatus: z.string().optional(),
    weightKg: z.number().optional(),
    heightCm: z.number().optional(),
    bloodType: z.string().optional(),
    notes: z.string().optional()
})

export const positionSchema = z.object({
    unitId: z.number().int().optional(),
    positionName: z.string().min(1),
    positionType: z.string().optional(),
    startDate: z.string().transform(v => new Date(v)).optional(),
    endDate: z.string().transform(v => new Date(v)).optional(),
    decisionRef: z.string().optional(),
    isPrimary: z.boolean().optional()
})

export const RESEARCH_WORK_TYPES = [
  'research_project',   // Nhiệm vụ KH&CN
  'book',               // Sách chuyên khảo / Giáo trình
  'training_product',   // Sản phẩm đào tạo (hướng dẫn NCS/ThS)
  'research_product',   // Sản phẩm KH&CN dạng I & II
  'patent',             // Phát minh sáng chế
  'journal_paper',      // Bài báo khoa học
  'conference_paper',   // Báo cáo khoa học / Hội nghị
  'book_chapter',       // Chương sách (dự phòng quốc tế)
  'other',              // Khác
] as const;

export type ResearchWorkType = typeof RESEARCH_WORK_TYPES[number];

export type ExtraResearchProject = {
  host_org: string;
  level: string;
}

export type ExtraBook = {
  publisher: string;
  pub_date?: string;
  isbn?: string;
}

export type ExtraTrainingProduct = {
  student_name: string;
  degree_level: string;
  thesis_type?: string;
}

export type ExtraResearchProduct = {
  product_type: string;
  level?: string;
  application?: string;
}

export type ExtraPatent = {
  application_number?: string;
  granted_number?: string;
  country?: string;
}

export type ExtraBookChapter = {
  book_title: string;
  editors?: string;
  pages?: string;
}

export type ExtraByType = {
  research_project:  ExtraResearchProject;
  book:              ExtraBook;
  training_product:  ExtraTrainingProduct;
  research_product:  ExtraResearchProduct;
  patent:            ExtraPatent;
  journal_paper:     Record<string, never>;
  conference_paper:  Record<string, never>;
  book_chapter:      ExtraBookChapter;
  other:             Record<string, unknown>;
};

// --- RESEARCH WORK SCHEMAS ---

export const extraResearchProjectSchema = z.object({
  host_org: z.string().min(1),
  level:    z.string().min(1),
});

export const extraBookSchema = z.object({
  publisher: z.string().min(1),
  pub_date:  z.string().optional(),
  isbn:      z.string().optional(),
});

export const extraTrainingProductSchema = z.object({
  student_name: z.string().min(1),
  degree_level: z.string().min(1),
  thesis_type:  z.string().optional(),
});

export const extraResearchProductSchema = z.object({
  product_type: z.string().min(1),
  level:        z.string().optional(),
  application:  z.string().optional(),
});

export const extraPatentSchema = z.object({
  application_number: z.string().optional(),
  granted_number:     z.string().optional(),
  country:            z.string().optional(),
});

export const extraBookChapterSchema = z.object({
  book_title: z.string().min(1),
  editors:    z.string().optional(),
  pages:      z.string().optional(),
});

const createResearchWorkBaseSchema = z.object({
  title:         z.string().min(1).max(1000),
  publishYear:   z.number().int().min(1900).max(2100).optional(),
  academicYear:  z.string().max(50).optional(),
  projectCode:   z.string().max(50).optional(),
  journalName:   z.string().max(500).optional(),
  indexing:      z.string().max(100).optional(),
  doi:           z.string().max(200).optional(),
});

export const createResearchWorkSchema = z.discriminatedUnion('workType', [
  createResearchWorkBaseSchema.extend({ workType: z.literal('research_project'), extra: extraResearchProjectSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('book'), extra: extraBookSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('training_product'), extra: extraTrainingProductSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('research_product'), extra: extraResearchProductSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('patent'), extra: extraPatentSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('journal_paper'), extra: z.object({}).strict() }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('conference_paper'), extra: z.object({}).strict() }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('book_chapter'), extra: extraBookChapterSchema }),
  createResearchWorkBaseSchema.extend({ workType: z.literal('other'), extra: z.record(z.string(), z.unknown()) }),
]);

export const updateResearchWorkSchema = createResearchWorkSchema.transform(v => v);
