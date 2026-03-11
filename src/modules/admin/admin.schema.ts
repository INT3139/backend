import { z } from 'zod'

export const createUserSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    fullName: z.string().min(1),
    password: z.string().min(6).optional(),
    unitId: z.string().uuid().optional()
})

export const updateUserSchema = createUserSchema.partial().extend({
    isActive: z.boolean().optional()
})

export const createRoleSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional()
})

export const assignRoleSchema = z.object({
    roleId: z.string().uuid(),
    scopeType: z.enum(['school', 'faculty', 'department', 'self']).optional(),
    scopeUnitId: z.string().uuid().optional().nullable(),
    expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined)
})

export const createUnitSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    unit_type: z.enum(['school', 'faculty', 'department', 'lab']),
    parent_id: z.string().uuid().optional().nullable()
})
