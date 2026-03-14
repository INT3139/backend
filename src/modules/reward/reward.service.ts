import { rewardRepo, RewardFilter, CommendationRow, TitleRow, DisciplineRow } from "./reward.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"

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
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = (scopes as number) || undefined
        }

        return await rewardRepo.findCommendations(filter, pagination)
    }

    /**
     * Create commendation
     */
    async createCommendation(data: Partial<CommendationRow>) {
        return await rewardRepo.createCommendation(data)
    }

    /**
     * Update commendation
     */
    async updateCommendation(id: ID, data: Partial<CommendationRow>) {
        const updated = await rewardRepo.updateCommendation(id, data)
        if (!updated) {
            throw new NotFoundError('Commendation not found')
        }
        return updated
    }

    /**
     * Delete commendation
     */
    async deleteCommendation(id: ID) {
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
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = (scopes as number) || undefined
        }

        return await rewardRepo.findTitles(filter, pagination)
    }

    /**
     * Create title
     */
    async createTitle(data: Partial<TitleRow>) {
        return await rewardRepo.createTitle(data)
    }

    /**
     * Update title
     */
    async updateTitle(id: ID, data: Partial<TitleRow>) {
        const updated = await rewardRepo.updateTitle(id, data)
        if (!updated) {
            throw new NotFoundError('Title not found')
        }
        return updated
    }

    /**
     * Delete title
     */
    async deleteTitle(id: ID) {
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
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = (scopes as number) || undefined
        }

        return await rewardRepo.findDisciplinaryRecords(filter, pagination)
    }

    /**
     * Create disciplinary record
     */
    async createDiscipline(data: Partial<DisciplineRow>) {
        return await rewardRepo.createDiscipline(data)
    }

    /**
     * Update disciplinary record
     */
    async updateDiscipline(id: ID, data: Partial<DisciplineRow>) {
        const updated = await rewardRepo.updateDiscipline(id, data)
        if (!updated) {
            throw new NotFoundError('Disciplinary record not found')
        }
        return updated
    }

    /**
     * Delete disciplinary record
     */
    async deleteDiscipline(id: ID) {
        return await rewardRepo.deleteDiscipline(id)
    }
}

export const rewardService = new RewardService()

