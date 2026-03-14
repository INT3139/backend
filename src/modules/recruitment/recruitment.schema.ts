import { z } from 'zod'

export const createProposalSchema = z.object({
    proposingUnit: z.number().int().positive(),
    positionName: z.string().min(1),
    requiredDegree: z.enum(['bachelor', 'master', 'phd']).optional(),
    requiredExpYears: z.number().int().min(0).optional(),
    quota: z.number().int().min(1).optional(),
    reason: z.string().optional(),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/),
    status: z.enum(['draft', 'submitted', 'processing', 'approved', 'rejected']).optional()
})

export const updateProposalSchema = createProposalSchema.partial()

export const createCandidateSchema = z.object({
    proposalId: z.number().int().positive(),
    fullName: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    degree: z.string().optional().nullable(),
    status: z.enum(['pending', 'interviewing', 'accepted', 'rejected', 'hired']).optional(),
    notes: z.string().optional().nullable()
})

export const updateCandidateSchema = createCandidateSchema.partial().omit({ proposalId: true })
