import { salaryRepo, SalaryFilter, SalaryInfoRow, SalaryUpgradeProposalRow } from "./salary.repo"
import { UUID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { emailService } from "@/emails/email.service"
import { queryOne } from "@/configs/db"

export interface UpdateSalaryDto extends Partial<SalaryInfoRow> {}

export interface CreateSalaryProposalDto extends Partial<SalaryUpgradeProposalRow> {}

export class SalaryService {
    /**
     * Get salary info by user ID
     */
    async getSalaryByUserId(userId: UUID): Promise<SalaryInfoRow | null> {
        return await salaryRepo.findByUserId(userId)
    }

    /**
     * Get salary info by profile ID
     */
    async getSalaryByProfileId(profileId: UUID): Promise<SalaryInfoRow | null> {
        return await salaryRepo.findByProfileId(profileId)
    }

    /**
     * Update salary info
     */
    async updateSalary(
        profileId: UUID,
        data: UpdateSalaryDto,
        user: AuthUser
    ): Promise<SalaryInfoRow> {
        // ABAC: Check permission update salary
        const canUpdate = await abacService.canAccess(
            [{ scopeType: 'school', unitId: null }],
            'salary',
            profileId
        )

        if (!canUpdate) {
            throw new ForbiddenError('You do not have permission to update salary info')
        }

        const updated = await salaryRepo.update(profileId, data)

        // Log to salary_logs
        await salaryRepo.createLog({
            profile_id: profileId,
            occupation_code: updated.occupation_code,
            salary_grade: updated.salary_grade,
            salary_coefficient: updated.salary_coefficient,
            is_over_grade: updated.is_over_grade,
            position_allowance: updated.position_allowance,
            effective_date: updated.effective_date,
            next_grade_date: updated.next_grade_date,
            decision_number: updated.decision_number,
            occupation_group: updated.occupation_group
        })

        return updated
    }

    /**
     * Get danh sách đề xuất nâng lương
     */
    async getProposals(
        filter: SalaryFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        // ABAC: Check nếu user chỉ được xem unit của mình
        const scopes = await abacService.getUnitFilter([
            { scopeType: 'faculty', unitId: user.unitId },
            { scopeType: 'department', unitId: user.unitId }
        ])

        if (scopes !== 'all' && !filter.unitId) {
            filter.unitId = scopes || undefined
        }

        return await salaryRepo.findProposals(filter, pagination)
    }

    /**
     * Tạo đề xuất nâng lương
     */
    async createProposal(data: CreateSalaryProposalDto, userId: UUID): Promise<SalaryUpgradeProposalRow> {
        return await salaryRepo.createProposal(data)
    }

    /**
     * Duyệt nâng lương
     */
    async approveProposal(id: UUID, approvedBy: UUID): Promise<SalaryUpgradeProposalRow> {
        const proposal = await salaryRepo.findProposalById(id)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        // Update salary info table when proposal is approved
        const updatedSalary = await salaryRepo.update(proposal.profile_id, {
            salary_grade: proposal.proposed_grade,
            salary_coefficient: proposal.proposed_coefficient,
            next_grade_date: proposal.proposed_next_date,
            effective_date: new Date()
        })

        // Log to salary_logs
        await salaryRepo.createLog({
            profile_id: proposal.profile_id,
            occupation_code: updatedSalary.occupation_code,
            salary_grade: updatedSalary.salary_grade,
            salary_coefficient: updatedSalary.salary_coefficient,
            is_over_grade: updatedSalary.is_over_grade,
            position_allowance: updatedSalary.position_allowance,
            effective_date: updatedSalary.effective_date,
            next_grade_date: updatedSalary.next_grade_date,
            decision_number: updatedSalary.decision_number,
            occupation_group: updatedSalary.occupation_group
        })

        const updated = await salaryRepo.updateProposalStatus(id, 'approved')

        // Send email notification
        const user = await queryOne<{ email: string, full_name: string }>(
            `SELECT email, full_name FROM users u 
             JOIN profile_staff p ON p.user_id = u.id 
             WHERE p.id = $1`,
            [proposal.profile_id]
        )
        if (user) {
            emailService.sendSalaryApprovalEmail(user.email, user.full_name, proposal.proposed_grade).catch(err => {
                console.error('Failed to send salary approval email', err)
            })
        }

        return updated
    }
}

export const salaryService = new SalaryService()
