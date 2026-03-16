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
    status: z.string().optional()
})

export const workHistorySchema = z.object({
    historyType: z.enum(['chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri']),
    fromDate: z.string().transform(v => new Date(v)).optional(),
    toDate: z.string().transform(v => new Date(v)).optional(),
    unitName: z.string().min(1),
    positionName: z.string().optional(),
    activityType: z.string().optional(),
    status: z.string().optional()
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

export const researchWorkSchema = z.object({
    workType: z.string().min(1),
    title: z.string().min(1),
    journalName: z.string().optional(),
    indexing: z.string().optional(),
    publishYear: z.number().int().optional(),
    doi: z.string().optional(),
    academicYear: z.string().optional(),
    status: z.string().optional()
})
