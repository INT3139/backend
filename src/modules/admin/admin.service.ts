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
    async getRoles(): Promise<(RoleRow & { userCount: number; permissionCount: number })[]> {
        return await adminRepo.findAllRoles()
    }

    /**
     * Create role
     */
    async createRole(data: Partial<RoleRow>) {
        return await adminRepo.createRole(data)
    }

    /**
     * Get permissions for a role
     */
    async getRolePermissions(roleId: ID): Promise<string[]> {
        return await adminRepo.getRolePermissions(roleId)
    }

    /**
     * Update permissions for a role
     */
    async updateRolePermissions(roleId: ID, permissionCodes: string[]) {
        const res = await adminRepo.updateRolePermissions(roleId, permissionCodes)
        
        // Invalidate cache for all users having this role
        const userIds = await adminRepo.getUsersWithRole(roleId)
        for (const userId of userIds) {
            await permissionService.invalidate(userId)
        }
        
        return res
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

    /**
     * Export audit logs as Excel
     */
    async exportAuditLogs(from?: string, to?: string): Promise<Buffer> {
        return await adminRepo.exportAuditLogs(from, to)
    }

    /**
     * Reset user password — generates temp password and sends email
     */
    async resetPassword(userId: ID, resetBy: ID) {
        const { generateTempPassword, hashPassword } = await import('@/utils/hash')
        const tempPassword = generateTempPassword(16)
        const hash = await hashPassword(tempPassword)
        const user = await adminRepo.updateUser(userId, { passwordHash: hash } as any)
        if (!user) throw new (await import('@/core/middlewares/errorHandler')).NotFoundError('User not found')
        emailService.sendTempPasswordEmail(user.email, user.fullName, tempPassword).catch(err => {
            logger.error('Failed to send password reset email', { error: err, userId })
        })
        return { message: 'Password reset. Temporary password sent to user email.' }
    }

    /**
     * Get all permissions
     */
    async getPermissions() {
        return await adminRepo.findAllPermissions()
    }

    /**
     * Create permission
     */
    async createPermission(data: { code: string; description: string }) {
        return await adminRepo.createPermission(data)
    }

    /**
     * List all scheduled jobs and their last/next run
     */
    async getSchedulerJobs() {
        const { schedulerService } = await import('@/jobs/scheduler')
        return schedulerService.getJobs()
    }

    /**
     * Manually trigger a named job
     */
    async triggerJob(name: string, triggeredBy: ID) {
        const { schedulerService } = await import('@/jobs/scheduler')
        await schedulerService.trigger(name)
        logger.info(`Job '${name}' manually triggered by user ${triggeredBy}`)
    }
}

export const adminService = new AdminService()

