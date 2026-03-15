import { adminRepo, UserRow, RoleRow, UnitRow, AuditLogRow } from "./admin.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { generateTempPassword, hashPassword } from "@/utils/hash"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { emailService } from "@/services/email.service"
import { logger } from "@/configs/logger"

export interface CreateUserDto {
    username: string
    email: string
    fullName: string
    password?: string
    unitId?: ID
}

export class AdminService {
    /**
     * Get users
     */
    async getUsers(pagination: PaginationQuery) {
        return await adminRepo.findUsers(pagination)
    }

    /**
     * Create user mới
     */
    async createUser(data: CreateUserDto) {
        const password = data.password || generateTempPassword(16) // 16 characters
        const hashedPassword = await hashPassword(password)

        const user = await adminRepo.createUser({
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            unitId: data.unitId,
            passwordHash: hashedPassword,
            isActive: true
        })

        // Gửi email chào mừng (không block flow chính)
        emailService.sendWelcomeEmail(user.email, user.fullName).catch(err => {
            logger.error('Failed to send welcome email', { error: err, userId: user.id })
        })

        return user
    }

    /**
     * Update user
     */
    async updateUser(id: ID, data: Partial<UserRow>) {
        const updated = await adminRepo.updateUser(id, data)
        if (!updated) {
            throw new NotFoundError('User not found')
        }
        return updated
    }

    /**
     * Delete user
     */
    async deleteUser(id: ID) {
        return await adminRepo.deleteUser(id)
    }

    /**
     * Get roles
     */
    async getRoles(): Promise<RoleRow[]> {
        return await adminRepo.findAllRoles()
    }

    /**
     * Create role
     */
    async createRole(data: Partial<RoleRow>) {
        return await adminRepo.createRole(data)
    }

    /**
     * Assign role
     */
    async assignRole(userId: ID, roleId: ID, grantedBy: ID, scopeType?: string, scopeUnitId?: ID, expiresAt?: Date) {
        const res = await adminRepo.assignRole(userId, roleId, grantedBy, scopeType, scopeUnitId, expiresAt)
        await permissionService.invalidate(userId)
        return res
    }

    /**
     * Revoke role
     */
    async revokeRole(userId: ID, roleId: ID) {
        const res = await adminRepo.revokeRole(userId, roleId)
        await permissionService.invalidate(userId)
        return res
    }

    /**
     * Get units
     */
    async getUnits(): Promise<UnitRow[]> {
        return await adminRepo.findAllUnits()
    }

    /**
     * Create unit
     */
    async createUnit(data: Partial<UnitRow>) {
        return await adminRepo.createUnit(data)
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(pagination: PaginationQuery) {
        return await adminRepo.findAuditLogs(pagination)
    }
}

export const adminService = new AdminService()

