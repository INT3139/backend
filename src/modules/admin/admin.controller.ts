import { Request, Response } from "express"
import { adminService } from "./admin.service"
import { success, created } from "@/utils/response"
import { AuthUser } from "@/types"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"

interface AuthRequest extends Request {
    user?: AuthUser
    userId?: string
}

/**
 * GET /api/v1/admin/users
 */
export const getUsers = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 20, sort, order } = req.query
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: order as 'asc' | 'desc'
    }

    const result = await adminService.getUsers(pagination)
    await logAction(req.userId!, 'read', 'user_list', undefined, { pagination })

    return success(res, result)
})

/**
 * POST /api/v1/admin/users
 */
export const createUser = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const user = await adminService.createUser(req.body)
    await logAction(req.userId!, 'create', 'user', user.id as string, req.body)

    return created(res, user)
})

/**
 * PUT /api/v1/admin/users/:id
 */
export const updateUser = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const updated = await adminService.updateUser(id as string, req.body)
    await logAction(req.userId!, 'update', 'user', id as string, req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    await adminService.deleteUser(id as string)
    await logAction(req.userId!, 'delete', 'user', id as string)

    return success(res, { message: 'User deleted' })
})

/**
 * GET /api/v1/admin/roles
 */
export const getRoles = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const roles = await adminService.getRoles()
    await logAction(req.userId!, 'read', 'role_list')

    return success(res, roles)
})

/**
 * POST /api/v1/admin/roles
 */
export const createRole = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const role = await adminService.createRole(req.body)
    await logAction(req.userId!, 'create', 'role', role.id as string, req.body)

    return created(res, role)
})

/**
 * POST /api/v1/admin/users/:id/roles
 */
export const assignRole = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { id } = req.params
    const { roleId, scopeType, scopeUnitId, expiresAt } = req.body
    await adminService.assignRole(id as string, roleId, req.userId!, scopeType, scopeUnitId, expiresAt)
    await logAction(req.userId!, 'create', 'user_role', undefined, { userId: id, ...req.body })

    return success(res, { message: 'Role assigned successfully' })
})

/**
 * GET /api/v1/admin/units
 */
export const getUnits = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const units = await adminService.getUnits()
    await logAction(req.userId!, 'read', 'unit_list')

    return success(res, units)
})

/**
 * POST /api/v1/admin/units
 */
export const createUnit = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const unit = await adminService.createUnit(req.body)
    await logAction(req.userId!, 'create', 'unit', unit.id as string, req.body)

    return created(res, unit)
})

/**
 * GET /api/v1/admin/audit-logs
 */
export const getAuditLogs = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { page = 1, limit = 50, sort, order } = req.query
    const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort: sort as string,
        order: order as 'asc' | 'desc'
    }

    const result = await adminService.getAuditLogs(pagination)
    return success(res, result)
})
