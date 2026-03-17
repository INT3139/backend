import { recruitmentRepo, RecruitmentProposalFilter, RecruitmentProposalRow } from "./recruitment.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { emailService } from "@/services/email.service"

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
            filter.unitIds = unitIds
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
     * Create đề xuất mới
     */
    async createProposal(data: CreateProposalDto, createdBy: ID): Promise<RecruitmentProposalRow> {
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

        return proposal
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
     * Approve đề xuất
     */
    async approveProposal(id: ID, approvedBy: ID): Promise<RecruitmentProposalRow> {
        const updated = await recruitmentRepo.update(id, {
            status: 'approved'
        })

        if (!updated) {
            throw new NotFoundError('Proposal not found')
        }

        return updated
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
