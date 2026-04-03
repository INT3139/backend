import { z } from 'zod'

export const createCommendationSchema = z.object({
    profileId: z.number().int().positive(),
    decisionNumber: z.string().optional(),
    decisionDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
    awardLevel: z.enum(['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']),
    awardName: z.string().min(1),
    content: z.string().optional(),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/).optional(),
    isHighestAward: z.boolean().optional(),
    status: z.enum(['pending', 'approved']).optional()
})

export const updateCommendationSchema = createCommendationSchema.partial()

export const createTitleSchema = z.object({
    profileId: z.number().int().positive(),
    titleName: z.string().min(1),
    titleLevel: z.enum(['unit', 'university', 'ministry']),
    awardedYear: z.string().min(4),
    decisionNumber: z.string().optional(),
    awardedBy: z.string().optional(),
    isHighest: z.boolean().optional(),
    status: z.enum(['pending', 'approved', 'revoked']).optional()
})

export const updateTitleSchema = createTitleSchema.partial()

export const createDisciplineSchema = z.object({
    profileId: z.number().int().positive(),
    disciplineType: z.string().min(1),
    reason: z.string().min(1),
    decisionNumber: z.string().min(1),
    unitName: z.string().min(1),
    issuedDate: z.string().transform(v => new Date(v)),
    issuedBy: z.number().int().positive().optional().nullable(),
    status: z.string().optional()
})

export const updateDisciplineSchema = createDisciplineSchema.partial()
