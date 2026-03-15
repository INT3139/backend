import { Request, Response } from "express"
import { adminService } from "./admin.service"
import { permissionService } from "@/core/permissions/permission.service"
import { success, created } from "@/utils/response"
import { logAction } from "@/core/middlewares/auditContext"
import { asyncHandler } from "@/core/middlewares/errorHandler"
import { workflowEngine } from "@/core/workflow/engine"

/**
 * GET /api/v1/admin/users
 */
export const getUsers = asyncHandler(async (
    req: Request,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const user = await adminService.createUser(req.body)
    await logAction(req.userId!, 'create', 'user', user.id.toString(), req.body)

    return created(res, user)
})

/**
 * PUT /api/v1/admin/users/:id
 */
export const updateUser = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const updated = await adminService.updateUser(id, req.body)

    // Invalidate permission cache if status or unit changed
    if (req.body.isActive !== undefined || req.body.unitId !== undefined) {
        await permissionService.invalidate(id)
    }

    await logAction(req.userId!, 'update', 'user', id.toString(), req.body)

    return success(res, updated)
})

/**
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    await adminService.deleteUser(id)
    await logAction(req.userId!, 'delete', 'user', id.toString())

    return success(res, { message: 'User deleted' })
})

/**
 * GET /api/v1/admin/roles
 */
export const getRoles = asyncHandler(async (
    req: Request,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const role = await adminService.createRole(req.body)
    await logAction(req.userId!, 'create', 'role', role.id.toString(), req.body)

    return created(res, role)
})

/**
 * POST /api/v1/admin/users/:id/roles
 */
export const assignRole = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const userId = parseInt(req.params.id as string, 10)
    const { roleId, scopeType, scopeUnitId, expiresAt } = req.body
    await adminService.assignRole(userId, roleId, req.userId!, scopeType, scopeUnitId, expiresAt)
    await logAction(req.userId!, 'create', 'user_role', undefined, { userId, ...req.body })

    return success(res, { message: 'Role assigned successfully' })
})

/**
 * DELETE /api/v1/admin/users/:id/roles/:roleId
 */
export const revokeRole = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const userId = parseInt(req.params.id as string, 10)
    const roleId = parseInt(req.params.roleId as string, 10)
    await adminService.revokeRole(userId, roleId)
    await logAction(req.userId!, 'delete', 'user_role', undefined, { userId, roleId })

    return success(res, { message: 'Role revoked successfully' })
})

/**
 * GET /api/v1/admin/units
 */
export const getUnits = asyncHandler(async (
    req: Request,
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
    req: Request,
    res: Response
): Promise<Response> => {
    const unit = await adminService.createUnit(req.body)
    await logAction(req.userId!, 'create', 'unit', unit.id.toString(), req.body)

    return created(res, unit)
})

/**
 * GET /api/v1/admin/audit-logs
 */
export const getAuditLogs = asyncHandler(async (
    req: Request,
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

/**
 * PUT /api/v1/admin/workflows/:id/metadata
 * Admin sửa dữ liệu đang chờ duyệt
 */
export const updateWorkflowMetadata = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { id } = req.params;
    const { metadata } = req.body;

    await workflowEngine.updateMetadata(parseInt(id as string, 10), metadata);

    return success(res, { message: 'Workflow metadata updated successfully' });
})
