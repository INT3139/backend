import { z } from 'zod'

export const updateSalarySchema = z.object({
    occupationGroup: z.string().optional(),
    occupationTitle: z.string().optional(),
    occupationCode: z.string().optional(),
    salaryGrade: z.number().int().min(1).optional(),
    salaryCoefficient: z.number().min(0).optional(),
    isOverGrade: z.boolean().optional(),
    effectiveDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
    decisionNumber: z.string().optional(),
    positionAllowance: z.number().min(0).optional(),
    responsibilityAllowance: z.number().min(0).optional(),
    teacherIncentivePct: z.number().min(0).optional(),
    regionalAllowance: z.number().min(0).optional(),
    otherAllowance: z.number().min(0).optional(),
    harmfulAllowance: z.number().min(0).optional(),
    seniorityAllowancePct: z.number().min(0).optional(),
    enjoymentRatePct: z.number().min(0).optional(),
    actualCoefficient: z.number().min(0).optional(),
    nextGradeDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
    nextSeniorityDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
})

export const createSalaryProposalSchema = z.object({
    profileId: z.number().int().positive(),
    currentOccupationCode: z.string().optional(),
    currentGrade: z.number().int().min(1).optional(),
    currentCoefficient: z.number().min(0).optional(),
    currentEffectiveDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
    currentTitle: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    proposedGrade: z.number().int().min(1),
    proposedCoefficient: z.number().min(0),
    proposedNextDate: z.string().transform(v => new Date(v)),
    upgradeType: z.enum(['NBL thường xuyên', 'NBL trước hạn', 'NBL vượt bậc']).optional(),
})

export const salaryWorkflowMetadataSchema = z.object({
    profileId: z.number().int().positive(),
    proposedGrade: z.number().int().min(1),
    proposedCoefficient: z.union([z.number(), z.string()]).transform(v => typeof v === 'string' ? parseFloat(v) : v),
    proposedNextDate: z.union([z.date(), z.string()]).transform(v => new Date(v))
})
