import { z } from 'zod'

export const createEvidenceSchema = z.object({
    academic_year: z.string().regex(/^\d{4}-\d{4}$/),
    evidence_type: z.enum(['teaching', 'research_paper', 'research_project', 'other_task']),
    title: z.string().min(1),
    hours_claimed: z.number().min(0).optional(),
    coef_applied: z.number().min(0).optional()
})

export const rejectEvidenceSchema = z.object({
    reject_reason: z.string().min(1)
})
