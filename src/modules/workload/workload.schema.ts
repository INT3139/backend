import { z } from 'zod'

export const createEvidenceSchema = z.object({
    academicYear: z.string().regex(/^(\d{4}|\d{4}-\d{4})$/),
    evidenceType: z.enum(['teaching', 'research_paper', 'research_project', 'other_task']),
    title: z.string().min(1),
    hoursClaimed: z.number().min(0).optional(),
    coefApplied: z.number().min(0).optional()
})

export const rejectEvidenceSchema = z.object({
    rejectReason: z.string().min(1)
})
