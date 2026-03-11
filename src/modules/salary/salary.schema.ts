import { z } from 'zod'

export const updateSalarySchema = z.object({
    occupation_group: z.string().optional(),
    occupation_title: z.string().optional(),
    occupation_code: z.string().optional(),
    salary_grade: z.number().int().min(1).optional(),
    salary_coefficient: z.number().min(0).optional(),
    is_over_grade: z.boolean().optional(),
    effective_date: z.string().optional().transform(v => v ? new Date(v) : undefined),
    decision_number: z.string().optional(),
    position_allowance: z.number().min(0).optional(),
    responsibility_allowance: z.number().min(0).optional(),
    teacher_incentive_pct: z.number().min(0).optional(),
    regional_allowance: z.number().min(0).optional(),
    other_allowance: z.number().min(0).optional(),
    harmful_allowance: z.number().min(0).optional(),
    seniority_allowance_pct: z.number().min(0).optional(),
    enjoyment_rate_pct: z.number().min(0).optional(),
    actual_coefficient: z.number().min(0).optional(),
    next_grade_date: z.string().optional().transform(v => v ? new Date(v) : undefined),
    next_seniority_date: z.string().optional().transform(v => v ? new Date(v) : undefined),
})

export const createSalaryProposalSchema = z.object({
    profile_id: z.string().uuid(),
    current_occupation_code: z.string().optional(),
    current_grade: z.number().int().min(1).optional(),
    current_coefficient: z.number().min(0).optional(),
    current_effective_date: z.string().optional().transform(v => v ? new Date(v) : undefined),
    current_title: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    proposed_grade: z.number().int().min(1),
    proposed_coefficient: z.number().min(0),
    proposed_next_date: z.string().transform(v => new Date(v)),
    upgrade_type: z.enum(['NBL thường xuyên', 'NBL trước hạn', 'NBL vượt bậc']).optional(),
})
