import { rewardRepo, RewardFilter, CommendationRow, TitleRow, DisciplineRow } from "./reward.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { profileRepo } from "../profile/profile.repo"

export class RewardService {
    /**
     * Get rewards by user ID
     */
    async getRewardsByUserId(userId: ID) {
        return await rewardRepo.findByUserId(userId)
    }

    /**
     * Get commendations
     */
    async getCommendations(
        filter: RewardFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter = { ...filter, unitIds }
        }

        return await rewardRepo.findCommendations(filter, pagination)
    }

    /**
     * Create commendation
     */
    async createCommendation(data: Partial<CommendationRow>, user: AuthUser) {
        if (!data.profileId) throw new Error('profileId is required')
        
        const profile = await profileRepo.findById(data.profileId)
        if (!profile) throw new NotFoundError('Profile not found')

        // Check if user has scope over this profile
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)
        if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId))) {
            throw new ForbiddenError('You do not have permission to add reward for this profile')
        }

        const reward = await rewardRepo.createCommendation(data)

        // Register scope for ABAC
        await abacService.registerScope({
            resourceType: 'reward_commendation',
            resourceId: reward.id,
            ownerId: profile.userId,
            unitId: profile.unitId
        })

        return reward
    }

    /**
     * Update commendation
     */
    async updateCommendation(id: ID, data: Partial<CommendationRow>, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_commendation', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        const updated = await rewardRepo.updateCommendation(id, data)
        if (!updated) {
            throw new NotFoundError('Commendation not found')
        }
        return updated
    }

    /**
     * Delete commendation
     */
    async deleteCommendation(id: ID, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_commendation', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        return await rewardRepo.deleteCommendation(id)
    }

    /**
     * Get titles
     */
    async getTitles(
        filter: RewardFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter = { ...filter, unitIds }
        }

        return await rewardRepo.findTitles(filter, pagination)
    }

    /**
     * Create title
     */
    async createTitle(data: Partial<TitleRow>, user: AuthUser) {
        if (!data.profileId) throw new Error('profileId is required')
        
        const profile = await profileRepo.findById(data.profileId)
        if (!profile) throw new NotFoundError('Profile not found')

        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)
        if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId))) {
            throw new ForbiddenError('You do not have permission to add title for this profile')
        }

        const title = await rewardRepo.createTitle(data)

        await abacService.registerScope({
            resourceType: 'reward_title',
            resourceId: title.id,
            ownerId: profile.userId,
            unitId: profile.unitId
        })

        return title
    }

    /**
     * Update title
     */
    async updateTitle(id: ID, data: Partial<TitleRow>, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_title', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        const updated = await rewardRepo.updateTitle(id, data)
        if (!updated) {
            throw new NotFoundError('Title not found')
        }
        return updated
    }

    /**
     * Delete title
     */
    async deleteTitle(id: ID, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_title', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        return await rewardRepo.deleteTitle(id)
    }

    /**
     * Get disciplinary records
     */
    async getDisciplinaryRecords(
        filter: RewardFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter = { ...filter, unitIds }
        }

        return await rewardRepo.findDisciplinaryRecords(filter, pagination)
    }

    /**
     * Create disciplinary record
     */
    async createDiscipline(data: Partial<DisciplineRow>, user: AuthUser) {
        if (!data.profileId) throw new Error('profileId is required')
        
        const profile = await profileRepo.findById(data.profileId)
        if (!profile) throw new NotFoundError('Profile not found')

        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)
        if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId))) {
            throw new ForbiddenError('You do not have permission to add disciplinary record for this profile')
        }

        const discipline = await rewardRepo.createDiscipline(data)

        await abacService.registerScope({
            resourceType: 'reward_discipline',
            resourceId: discipline.id,
            ownerId: profile.userId,
            unitId: profile.unitId
        })

        return discipline
    }

    /**
     * Update disciplinary record
     */
    async updateDiscipline(id: ID, data: Partial<DisciplineRow>, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_discipline', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        const updated = await rewardRepo.updateDiscipline(id, data)
        if (!updated) {
            throw new NotFoundError('Disciplinary record not found')
        }
        return updated
    }

    /**
     * Delete disciplinary record
     */
    async deleteDiscipline(id: ID, user: AuthUser) {
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(user.id, scopes, 'reward_discipline', id)
        
        if (!canAccess) {
            throw new ForbiddenError('Access denied to this reward record')
        }

        return await rewardRepo.deleteDiscipline(id)
    }
}

export const rewardService = new RewardService()

