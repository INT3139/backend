import { recruitmentRepo, RecruitmentProposalFilter, RecruitmentProposalRow } from "./recruitment.repo"
import { UUID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { emailService } from "@/services/email.service"

export interface CreateProposalDto {
    proposing_unit: UUID
    position_name: string
    required_degree: string
    required_exp_years: number
    quota: number
    reason?: string
    academic_year: string
    status?: string
}

export interface UpdateProposalDto extends Partial<CreateProposalDto> { }

export interface CreateCandidateDto {
    proposal_id: UUID
    full_name: string
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
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        // Nếu không phải school-level, chỉ cho xem unit của mình
        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = scopes || undefined
        }

        return await recruitmentRepo.findMany(filter, pagination)
    }

    /**
     * Get đề xuất by ID
     */
    async getProposalById(id: UUID): Promise<RecruitmentProposalRow | null> {
        return await recruitmentRepo.findById(id)
    }

    /**
     * Create đề xuất mới
     */
    async createProposal(data: CreateProposalDto, createdBy: UUID): Promise<RecruitmentProposalRow> {
        const proposal = await recruitmentRepo.create({
            ...data,
            created_by: createdBy
        })

        // Register resource scope cho ABAC
        await abacService.registerScope({
            resourceType: 'recruitment_proposal',
            resourceId: proposal.id,
            ownerId: proposal.created_by,
            unitId: proposal.proposing_unit
        })

        return proposal
    }

    /**
     * Update đề xuất
     */
    async updateProposal(
        id: UUID,
        data: UpdateProposalDto,
        user: AuthUser
    ): Promise<RecruitmentProposalRow> {
        const existing = await recruitmentRepo.findById(id)
        if (!existing) {
            throw new NotFoundError('Proposal not found')
        }

        // Check if status allows update (only draft/submitted)
        if (existing.status !== 'draft' && existing.status !== 'submitted') {
            throw new ForbiddenError('Cannot update proposal in current status')
        }

        // ABAC: Check permission update
        const canUpdate = await abacService.canAccess(
            [
                { scopeType: 'school', unitId: null },
                { scopeType: 'faculty', unitId: user.unitId },
                { scopeType: 'self', unitId: null }
            ],
            'recruitment_proposal',
            id
        )

        // Cho phép người tạo update
        const isOwner = existing.created_by === user.id

        if (!canUpdate && !isOwner) {
            throw new ForbiddenError('You do not have permission to update this proposal')
        }

        return await recruitmentRepo.update(id, data)
    }

    /**
     * Approve đề xuất
     */
    async approveProposal(id: UUID, approvedBy: UUID): Promise<RecruitmentProposalRow> {
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
    async getCandidates(proposalId: UUID, pagination: PaginationQuery, user: AuthUser) {
        const proposal = await recruitmentRepo.findById(proposalId)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        // ABAC: Check permission xem đề xuất (từ đó xem được ứng viên)
        const canRead = await abacService.canAccess(
            [
                { scopeType: 'school', unitId: null },
                { scopeType: 'faculty', unitId: user.unitId },
                { scopeType: 'department', unitId: user.unitId }
            ],
            'recruitment_proposal',
            proposalId
        )

        if (!canRead && proposal.created_by !== user.id) {
            throw new ForbiddenError('You do not have permission to view candidates for this proposal')
        }

        return await recruitmentRepo.findCandidates(proposalId, pagination)
    }

    /**
     * Get chi tiết ứng viên
     */
    async getCandidateById(id: UUID, user: AuthUser) {
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
        const proposal = await recruitmentRepo.findById(data.proposal_id)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        // ABAC: Check permission update đề xuất (để thêm ứng viên)
        const canWrite = await abacService.canAccess(
            [
                { scopeType: 'school', unitId: null },
                { scopeType: 'faculty', unitId: user.unitId },
                { scopeType: 'self', unitId: null }
            ],
            'recruitment_proposal',
            data.proposal_id
        )

        if (!canWrite && proposal.created_by !== user.id) {
            throw new ForbiddenError('You do not have permission to add candidates to this proposal')
        }

        return await recruitmentRepo.createCandidate(data)
    }

    /**
     * Update thông tin ứng viên
     */
    async updateCandidate(id: UUID, data: UpdateCandidateDto, user: AuthUser) {
        const candidate = await recruitmentRepo.findCandidateById(id)
        if (!candidate) {
            throw new NotFoundError('Candidate not found')
        }

        const updated = await recruitmentRepo.updateCandidate(id, data)

        // Nếu status thay đổi, gửi email notify
        if (data.status && data.status !== candidate.status && updated.email) {
            emailService.sendCandidateStatusEmail(updated.email, updated.full_name, updated.status).catch(err => {
                console.error('Failed to send candidate status email', err)
            })
        }

        return updated
    }

    /**
     * Xóa ứng viên
     */
    async deleteCandidate(id: UUID, user: AuthUser) {
        const candidate = await recruitmentRepo.findCandidateById(id)
        if (!candidate) {
            throw new NotFoundError('Candidate not found')
        }

        return await recruitmentRepo.deleteCandidate(id)
    }
}

export const recruitmentService = new RecruitmentService()
