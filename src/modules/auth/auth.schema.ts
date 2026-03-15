import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
})

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string()
        .min(8, 'Password tối thiểu 8 ký tự')
        .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
        .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
        .regex(/[0-9]/, 'Phải có ít nhất 1 số')
        .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt')
})

export const refreshSchema = z.object({
    token: z.string().min(1, 'Refresh token is required')
})