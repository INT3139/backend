import { rewardRepo, RewardFilter, CommendationRow, TitleRow, DisciplineRow } from "./reward.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { profileRepo } from "../profile/profile.repo"
import { workflowEngine, type WorkflowInstance } from "@/core/workflow/engine"
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"
import { WF } from "@/constants/workflowCodes"
import { db } from "@/configs/db"

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
     * Create commendation - Initiates reward_ballot workflow
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

        // Initiate workflow instead of direct insert
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.REWARD_BALLOT,
            resourceType: 'reward_commendation',
            resourceId: 0,  // Will be assigned after approval
            initiatedBy: user.id,
            metadata: {
                commendation: data,
                profileId: data.profileId
            }
        })

        return {
            message: 'Đề xuất khen thưởng đã được gửi và đang chờ phê duyệt.',
            workflowId: workflow.id,
            proposedData: data
        }
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
     * Create title - Initiates reward_ballot workflow
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

        // Initiate workflow instead of direct insert
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.REWARD_BALLOT,
            resourceType: 'reward_title',
            resourceId: 0,  // Will be assigned after approval
            initiatedBy: user.id,
            metadata: {
                title: data,
                profileId: data.profileId
            }
        })

        return {
            message: 'Đề xuất danh hiệu đã được gửi và đang chờ phê duyệt.',
            workflowId: workflow.id,
            proposedData: data
        }
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

    /**
     * Apply changes from workflow after approval
     */
    async applyChangesFromWorkflow(inst: WorkflowInstance, approvedBy: ID, tx?: any): Promise<any> {
        if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const metadata = inst.metadata as any
        const profileId = metadata.profileId

        if (!profileId) {
            throw new NotFoundError('Profile ID not found in workflow metadata')
        }

        const profile = await profileRepo.findById(profileId)
        if (!profile) {
            throw new NotFoundError('Profile not found')
        }

        const results: any = {}

        // Handle commendation if present in metadata
        if (metadata.commendation) {
            const commendationData = {
                ...metadata.commendation,
                approvedBy,
                approvedAt: new Date()
            }
            const reward = await rewardRepo.createCommendation(commendationData, tx)
            await abacService.registerScope({
                resourceType: 'reward_commendation',
                resourceId: reward.id,
                ownerId: profile.userId,
                unitId: profile.unitId
            })
            results.commendation = reward
        }

        // Handle title if present in metadata
        if (metadata.title) {
            const titleData = {
                ...metadata.title,
                approvedBy,
                approvedAt: new Date()
            }
            const title = await rewardRepo.createTitle(titleData, tx)
            await abacService.registerScope({
                resourceType: 'reward_title',
                resourceId: title.id,
                ownerId: profile.userId,
                unitId: profile.unitId
            })
            results.title = title
        }

        return results
    }

    /**
     * Handle rejection from workflow
     */
    async handleRejectionFromWorkflow(inst: WorkflowInstance, rejectedBy: ID, tx?: any): Promise<void> {
        // Rejection means the proposed commendation/title was not approved
        // No action needed as it was never inserted into the database
        // Just log the rejection (already done by workflow engine)
    }
}

export const rewardService = new RewardService()

// Register workflow handlers for the dispatcher
registerWorkflowHandler(
    'reward_commendation',
    (inst, actorId, tx) => rewardService.applyChangesFromWorkflow(inst, actorId, tx),
    (inst, actorId, tx) => rewardService.handleRejectionFromWorkflow(inst, actorId, tx)
)

registerWorkflowHandler(
    'reward_title',
    (inst, actorId, tx) => rewardService.applyChangesFromWorkflow(inst, actorId, tx),
    (inst, actorId, tx) => rewardService.handleRejectionFromWorkflow(inst, actorId, tx)
)

