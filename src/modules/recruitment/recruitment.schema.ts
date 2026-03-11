import { z } from 'zod'

export const createProposalSchema = z.object({
    proposing_unit: z.string().uuid(),
    position_name: z.string().min(1),
    required_degree: z.enum(['bachelor', 'master', 'phd']).optional(),
    required_exp_years: z.number().int().min(0).optional(),
    quota: z.number().int().min(1).optional(),
    reason: z.string().optional(),
    academic_year: z.string().regex(/^\d{4}-\d{4}$/),
    status: z.enum(['draft', 'submitted', 'processing', 'approved', 'rejected']).optional()
})

export const updateProposalSchema = createProposalSchema.partial()

export const createCandidateSchema = z.object({
    proposal_id: z.string().uuid(),
    full_name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    degree: z.string().optional().nullable(),
    status: z.enum(['pending', 'interviewing', 'accepted', 'rejected', 'hired']).optional(),
    notes: z.string().optional().nullable()
})

export const updateCandidateSchema = createCandidateSchema.partial().omit({ proposal_id: true })
