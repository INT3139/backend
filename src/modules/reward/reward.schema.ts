import { z } from 'zod'

export const createCommendationSchema = z.object({
    profile_id: z.string().uuid(),
    decision_number: z.string().optional(),
    decision_date: z.string().optional().transform(v => v ? new Date(v) : undefined),
    award_level: z.enum(['co_so', 'dhqg', 'bo', 'chinh_phu', 'nha_nuoc']),
    award_name: z.string().min(1),
    content: z.string().optional(),
    academic_year: z.string().regex(/^\d{4}-\d{4}$/).optional(),
    is_highest_award: z.boolean().optional(),
    status: z.enum(['pending', 'approved']).optional()
})

export const updateCommendationSchema = createCommendationSchema.partial()

export const createTitleSchema = z.object({
    profile_id: z.string().uuid(),
    title_name: z.string().min(1),
    title_level: z.enum(['unit', 'university', 'ministry']),
    awarded_year: z.string().min(4),
    decision_number: z.string().optional(),
    awarded_by: z.string().optional(),
    is_highest: z.boolean().optional(),
    status: z.enum(['pending', 'approved', 'revoked']).optional()
})

export const updateTitleSchema = createTitleSchema.partial()

export const createDisciplineSchema = z.object({
    profile_id: z.string().uuid(),
    discipline_type: z.string().min(1),
    reason: z.string().min(1),
    decision_number: z.string().min(1),
    unit_name: z.string().min(1),
    issued_date: z.string().transform(v => new Date(v)),
    issued_by: z.string().uuid().optional().nullable(),
    status: z.string().optional()
})

export const updateDisciplineSchema = createDisciplineSchema.partial()
