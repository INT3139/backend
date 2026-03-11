import { z } from 'zod'

export const educationSchema = z.object({
    edu_type: z.enum(['degree', 'certificate', 'foreign_lang', 'it']),
    from_date: z.string().transform(v => new Date(v)).optional(),
    to_date: z.string().transform(v => new Date(v)).optional(),
    degree_level: z.string().optional(),
    institution: z.string().optional(),
    major: z.string().optional(),
    training_form: z.string().optional(),
    field: z.string().optional(),
    is_studying: z.boolean().optional(),
    cert_name: z.string().optional(),
    lang_name: z.string().optional(),
    lang_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional()
})

export const familySchema = z.object({
    side: z.enum(['self', 'spouse']),
    relationship: z.string().min(1),
    full_name: z.string().min(1),
    birth_year: z.number().int().optional(),
    description: z.string().optional(),
    status: z.string().optional()
})

export const workHistorySchema = z.object({
    history_type: z.enum(['chinh_quyen', 'dang', 'cong_doan', 'doan', 'quan_ngu_chinh_tri']),
    from_date: z.string().transform(v => new Date(v)).optional(),
    to_date: z.string().transform(v => new Date(v)).optional(),
    unit_name: z.string().min(1),
    position_name: z.string().optional(),
    activity_type: z.string().optional(),
    status: z.string().optional()
})

export const extraInfoSchema = z.object({
    arrest_history: z.string().optional(),
    old_regime_work: z.string().optional(),
    foreign_org_relations: z.string().optional(),
    foreign_relatives: z.string().optional(),
    income_salary: z.number().optional(),
    income_other_sources: z.number().optional(),
    house_type_granted: z.string().optional(),
    house_area_granted: z.number().optional(),
    house_type_owned: z.string().optional(),
    house_area_owned: z.number().optional(),
    land_granted_m2: z.number().optional(),
    land_purchased_m2: z.number().optional(),
    land_business_m2: z.number().optional()
})

export const healthSchema = z.object({
    health_status: z.string().optional(),
    weight_kg: z.number().optional(),
    height_cm: z.number().optional(),
    blood_type: z.string().optional(),
    notes: z.string().optional()
})
