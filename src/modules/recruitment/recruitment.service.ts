import { recruitmentRepo, RecruitmentProposalFilter, RecruitmentProposalRow } from "./recruitment.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { emailService } from "@/services/email.service"
import { workflowEngine } from "@/core/workflow/engine"
import { WF } from "@/constants/workflowCodes"
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"

export interface CreateProposalDto {
    proposingUnit: ID
    positionName: string
    requiredDegree: string
    requiredExpYears: number
    quota: number
    reason?: string
    academicYear: string
    status?: string
}

export interface UpdateProposalDto extends Partial<CreateProposalDto> { }

export interface CreateCandidateDto {
    proposalId: ID
    fullName: string
    email?: string
    phone?: string
    degree?: string
    status?: string
    notes?: string
}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> { }

export class RecruitmentService {
    /**
     * Get danh sách đề xuất tuyển dụng với filter
     */
    async getProposals(
        filter: RecruitmentProposalFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter = { ...filter, unitIds }
        }

        return await recruitmentRepo.findMany(filter, pagination)
    }

    /**
     * Get đề xuất by ID
     */
    async getProposalById(id: ID): Promise<RecruitmentProposalRow | null> {
        return await recruitmentRepo.findById(id)
    }

    /**
     * Create đề xuất mới và khởi tạo workflow
     */
    async createProposal(data: CreateProposalDto, createdBy: ID): Promise<{ message: string; workflowId: ID }> {
        const proposal = await recruitmentRepo.create({
            ...data,
            createdBy: createdBy
        })

        // Register resource scope cho ABAC
        await abacService.registerScope({
            resourceType: 'recruitment_proposal',
            resourceId: proposal.id,
            ownerId: proposal.createdBy,
            unitId: proposal.proposingUnit
        })

        // Initiate workflow
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.RECRUITMENT_APPROVAL,
            resourceType: 'recruitment_proposal',
            resourceId: proposal.id,
            initiatedBy: createdBy,
            metadata: { data }
        })

        return { message: 'Đề xuất tuyển dụng đã được tạo và đang chờ phê duyệt.', workflowId: workflow.id }
    }

    /**
     * Update đề xuất
     */
    async updateProposal(
        id: ID,
        data: UpdateProposalDto,
        user: AuthUser
    ): Promise<RecruitmentProposalRow> {
        const existing = await recruitmentRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Proposal not found')
        }

        // Check if status allows update (only pending)
        if (existing.status !== 'pending') {
            throw new ForbiddenError('Cannot update proposal in current status')
        }

        const scopes = await permissionService.getScopes(user.id)
        const canUpdate = await abacService.canAccess(
            user.id,
            scopes,
            'recruitment_proposal',
            id
        )

        // Cho phép người tạo update
        const isOwner = existing.createdBy === user.id

        if (!canUpdate && !isOwner) {
            throw new ForbiddenError('You do not have permission to update this proposal')
        }

        return await recruitmentRepo.update(id, data)
    }

    /**
     * Xử lý một bước trong workflow tuyển dụng
     */
    async completeWorkflowTask(
        instanceId: ID,
        actorId: ID,
        action: 'approve' | 'reject' | 'request_revision' | 'forward',
        comment?: string
    ): Promise<any> {
        const inst = await workflowEngine.advance(instanceId, actorId, action, comment)
        return { message: 'Bước quy trình đã được thực hiện thành công.', status: inst.status }
    }

    /**
     * Áp dụng thay đổi sau khi workflow tuyển dụng được phê duyệt
     */
    async applyChangesFromWorkflow(workflowId: ID, _approvedBy: ID, tx?: any): Promise<any> {
        const inst = await workflowEngine.getStatus(workflowId)
        if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const updated = await recruitmentRepo.update(inst.resourceId, { status: 'approved' }, tx)
        return { message: 'Đề xuất tuyển dụng đã được phê duyệt.', proposal: updated }
    }

    /**
     * Xử lý khi workflow bị từ chối
     */
    async handleRejection(workflowId: ID, _rejectedBy: ID, tx?: any): Promise<void> {
        const inst = await workflowEngine.getStatus(workflowId)
        await recruitmentRepo.update(inst.resourceId, { status: 'rejected' }, tx)
    }

    // --- CANDIDATE METHODS ---

    /**
     * Get danh sách ứng viên của một đề xuất
     */
    async getCandidates(proposalId: ID, pagination: PaginationQuery, user: AuthUser) {
        const proposal = await recruitmentRepo.findById(proposalId)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        const scopes = await permissionService.getScopes(user.id)
        const canRead = await abacService.canAccess(
            user.id,
            scopes,
            'recruitment_proposal',
            proposalId
        )

        if (!canRead && proposal.createdBy !== user.id) {
            throw new ForbiddenError('You do not have permission to view candidates for this proposal')
        }

        return await recruitmentRepo.findCandidates(proposalId, pagination)
    }

    /**
     * Get chi tiết ứng viên
     */
    async getCandidateById(id: ID, user: AuthUser) {
        const candidate = await recruitmentRepo.findCandidateById(id)
        if (!candidate) {
            throw new NotFoundError('Candidate not found')
        }

        return candidate
    }

    /**
     * Create ứng viên cho đề xuất
     */
    async createCandidate(data: CreateCandidateDto, user: AuthUser) {
        const proposal = await recruitmentRepo.findById(data.proposalId)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        const scopes = await permissionService.getScopes(user.id)
        const canWrite = await abacService.canAccess(
            user.id,
            scopes,
            'recruitment_proposal',
            data.proposalId
        )

        if (!canWrite && proposal.createdBy !== user.id) {
            throw new ForbiddenError('You do not have permission to add candidates to this proposal')
        }

        return await recruitmentRepo.createCandidate(data)
    }

    /**
     * Update thông tin ứng viên
     */
    async updateCandidate(id: ID, data: UpdateCandidateDto, user: AuthUser) {
        const candidate = await recruitmentRepo.findCandidateById(id)
        if (!candidate) {
            throw new NotFoundError('Candidate not found')
        }

        // Check ABAC access to the parent proposal
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(
            user.id,
            scopes,
            'recruitment_proposal',
            candidate.proposalId
        )
        const proposal = await recruitmentRepo.findById(candidate.proposalId)
        const isOwner = proposal?.createdBy === user.id

        if (!canAccess && !isOwner) {
            throw new ForbiddenError('You do not have permission to update this candidate')
        }

        const updated = await recruitmentRepo.updateCandidate(id, data)

        // Nếu status thay đổi, gửi email notify
        if (data.status && data.status !== candidate.status && updated.email) {
            emailService.sendCandidateStatusEmail(updated.email as string, updated.fullName, updated.status as string).catch(err => {
                console.error('Failed to send candidate status email', err)
            })
        }

        return updated
    }

    /**
     * Xóa ứng viên
     */
    async deleteCandidate(id: ID, user: AuthUser) {
        const candidate = await recruitmentRepo.findCandidateById(id)
        if (!candidate) {
            throw new NotFoundError('Candidate not found')
        }

        // Check ABAC access to the parent proposal
        const scopes = await permissionService.getScopes(user.id)
        const canAccess = await abacService.canAccess(
            user.id,
            scopes,
            'recruitment_proposal',
            candidate.proposalId
        )
        const proposal = await recruitmentRepo.findById(candidate.proposalId)
        const isOwner = proposal?.createdBy === user.id

        if (!canAccess && !isOwner) {
            throw new ForbiddenError('You do not have permission to delete this candidate')
        }

        return await recruitmentRepo.deleteCandidate(id)
    }

    /**
     * Get recruitment info and contracts for a profile
     */
    async getRecruitmentData(profileId: ID) {
        const [info, contracts] = await Promise.all([
            recruitmentRepo.findInfoByProfileId(profileId),
            recruitmentRepo.findContractsByProfileId(profileId)
        ])
        return { info, contracts }
    }
}

export const recruitmentService = new RecruitmentService()

// Register workflow handlers for the dispatcher
registerWorkflowHandler(
    'recruitment_proposal',
    (inst, actorId, tx) => recruitmentService.applyChangesFromWorkflow(inst.id, actorId, tx),
    (inst, actorId, tx) => recruitmentService.handleRejection(inst.id, actorId, tx)
)
