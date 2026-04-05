import { z } from 'zod'

export const createCommendationSchema = z.object({
    profileId: z.number().int().positive(),
    decisionNumber: z.string().nullable().optional(),
    decisionDate: z.string().nullable().optional().transform(v => (v === null ? null : v ? new Date(v) : undefined)),
    awardLevel: z.enum(['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']),
    awardName: z.string().min(1),
    content: z.string().nullable().optional(),
    academicYear: z.string().regex(/^(\d{4}|\d{4}-\d{4})$/).nullable().optional(),
    isHighestAward: z.boolean().nullable().optional(),
    status: z.enum(['pending', 'approved']).nullable().optional()
})

export const updateCommendationSchema = createCommendationSchema.partial()

export const createTitleSchema = z.object({
    profileId: z.number().int().positive(),
    titleName: z.string().min(1),
    titleLevel: z.enum(['unit', 'university', 'ministry']),
    awardedYear: z.string().min(4),
    decisionNumber: z.string().nullable().optional(),
    awardedBy: z.string().nullable().optional(),
    isHighest: z.boolean().nullable().optional(),
    status: z.enum(['pending', 'approved', 'revoked']).nullable().optional()
})

export const updateTitleSchema = createTitleSchema.partial()

export const createDisciplineSchema = z.object({
    profileId: z.number().int().positive(),
    disciplineType: z.string().min(1),
    reason: z.string().min(1),
    decisionNumber: z.string().min(1).nullable().optional(),
    unitName: z.string().min(1).nullable().optional(),
    issuedDate: z.string().transform(v => new Date(v)),
    issuedBy: z.number().int().positive().nullable().optional(),
    status: z.string().nullable().optional()
})

export const updateDisciplineSchema = createDisciplineSchema.partial()
