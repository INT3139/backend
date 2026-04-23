import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createApiResponse, ApiMessageResponse } from './common';

const c = initContract();

// --- Schemas ---

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  port: z.enum(['admin', 'cv', 'main'], { message: 'Port không được để trống' }),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string(),
    role: z.string().optional(),
  }),
});

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string(),
    role: z.string().optional(),
  }),
});

export const RefreshTokenRequestSchema = z.object({
  token: z.string().min(1, 'Refresh token không được để trống'),
});

export const ChangePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
  newPassword: z.string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Cần ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt'),
});

export const PermissionInfoSchema = z.object({
  permissions: z.array(z.string()),
  scopes: z.array(z.record(z.string(), z.any())),
});

// --- Contract ---

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/login',
    body: LoginRequestSchema,
    responses: { 
      200: createApiResponse(LoginResponseSchema),
      401: z.object({ success: z.literal(false), message: z.string() }),
    },
    summary: 'Login user',
    metadata: { description: 'Authenticate user with username and password' },
  },
  refresh: {
    method: 'POST',
    path: '/refresh',
    body: RefreshTokenRequestSchema,
    responses: { 
      200: createApiResponse(RefreshTokenResponseSchema),
      401: z.object({ success: z.literal(false), message: z.string() }),
    },
    summary: 'Refresh token',
  },
  logout: {
    method: 'POST',
    path: '/logout',
    body: z.any().optional(),
    responses: { 
      200: ApiMessageResponse,
    },
    summary: 'Logout user',
  },
  changePassword: {
    method: 'POST',
    path: '/change-password',
    body: ChangePasswordRequestSchema,
    responses: { 
      200: ApiMessageResponse,
      400: z.object({ success: z.literal(false), message: z.string() }),
    },
    summary: 'Change password',
  },
  getPermissions: {
    method: 'GET',
    path: '/permissions',
    responses: { 
      200: createApiResponse(PermissionInfoSchema),
    },
    summary: 'Get user permissions and scopes',
  },
}, {
  pathPrefix: '/auth'
});
