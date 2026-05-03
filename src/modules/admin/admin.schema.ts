import { z } from 'zod'

export const createUserSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    fullName: z.string().min(1),
    password: z.string().min(6).optional(),
    unitId: z.number().int().positive().optional()
})

export const updateUserSchema = createUserSchema.partial().extend({
    isActive: z.boolean().optional()
})

export const createRoleSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional()
})

export const updateRolePermissionsSchema = z.object({
    permissions: z.array(z.string()).min(1, 'At least one permission is required')
})

export const assignRoleSchema = z.object({
    roleId: z.number().int().positive(),
    scopeType: z.enum(['school', 'faculty', 'department', 'self']).optional(),
    scopeUnitId: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().transform(v => v ? new Date(v) : undefined)
})

export const createUnitSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    unitType: z.enum(['school', 'faculty', 'department', 'lab']),
    parentId: z.number().int().positive().optional().nullable()
})
