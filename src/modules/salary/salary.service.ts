import { salaryRepo, SalaryFilter, SalaryInfoRow, SalaryUpgradeProposalRow } from "./salary.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"
import { db } from "@/configs/db"
import { users, profileStaff } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { emailService } from "@/services/email.service"

export interface UpdateSalaryDto {
    occupation_group?: string
    occupation_title?: string
    occupation_code?: string
    salary_grade?: number
    salary_coefficient?: number
    is_over_grade?: boolean
    effective_date?: string | Date
    decision_number?: string
    position_allowance?: number
    responsibility_allowance?: number
    teacher_incentive_pct?: number
    regional_allowance?: number
    other_allowance?: number
    harmful_allowance?: number
    seniority_allowance_pct?: number
    enjoyment_rate_pct?: number
    actual_coefficient?: number
    next_grade_date?: string | Date
    next_seniority_date?: string | Date
}

export interface CreateSalaryProposalDto {
    profile_id: ID
    current_occupation_code?: string
    current_grade?: number
    current_coefficient?: number
    current_effective_date?: string | Date
    current_title?: string
    proposed_grade: number
    proposed_coefficient: number
    proposed_next_date: string | Date
    upgrade_type?: string
}

export class SalaryService {
    /**
     * Get salary info by user ID
     */
    async getSalaryByUserId(userId: ID): Promise<SalaryInfoRow | null> {
        return await salaryRepo.findByUserId(userId)
    }

    /**
     * Get salary info by profile ID
     */
    async getSalaryByProfileId(profileId: ID): Promise<SalaryInfoRow | null> {
        return await salaryRepo.findByProfileId(profileId)
    }

    /**
     * Update salary info
     */
    async updateSalary(
        profileId: ID,
        data: UpdateSalaryDto,
        user: AuthUser
    ): Promise<SalaryInfoRow> {
        const scopes = await permissionService.getScopes(user.id)
        const canUpdate = await abacService.canAccess(
            user.id,
            scopes,
            'salary',
            profileId
        )

        if (!canUpdate) {
            throw new ForbiddenError('You do not have permission to update salary info')
        }

        // Map snake_case to camelCase
        const values = {
            occupationGroup: data.occupation_group,
            occupationTitle: data.occupation_title,
            occupationCode: data.occupation_code,
            salaryGrade: data.salary_grade,
            salaryCoefficient: data.salary_coefficient?.toString(),
            isOverGrade: data.is_over_grade,
            effectiveDate: data.effective_date ? new Date(data.effective_date) : undefined,
            decisionNumber: data.decision_number,
            positionAllowance: data.position_allowance?.toString(),
            responsibilityAllowance: data.responsibility_allowance?.toString(),
            teacherIncentivePct: data.teacher_incentive_pct?.toString(),
            regionalAllowance: data.regional_allowance?.toString(),
            otherAllowance: data.other_allowance?.toString(),
            harmfulAllowance: data.harmful_allowance?.toString(),
            seniorityAllowancePct: data.seniority_allowance_pct?.toString(),
            enjoymentRatePct: data.enjoyment_rate_pct?.toString(),
            actualCoefficient: data.actual_coefficient?.toString(),
            nextGradeDate: data.next_grade_date ? new Date(data.next_grade_date) : undefined,
            nextSeniorityDate: data.next_seniority_date ? new Date(data.next_seniority_date) : undefined
        }

        const updated = await salaryRepo.update(profileId, values)

        // Log to salary_logs
        await salaryRepo.createLog({
            profileId: profileId,
            occupationCode: updated.occupationCode,
            salaryGrade: updated.salaryGrade,
            salaryCoefficient: updated.salaryCoefficient,
            isOverGrade: updated.isOverGrade,
            positionAllowance: updated.positionAllowance,
            effectiveDate: updated.effectiveDate,
            nextGradeDate: updated.nextGradeDate,
            decisionNumber: updated.decisionNumber,
            occupationGroup: updated.occupationGroup
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
        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter.unitIds = unitIds
        }

        return await salaryRepo.findProposals(filter, pagination)
    }

    /**
     * Tạo đề xuất nâng lương
     */
    async createProposal(data: CreateSalaryProposalDto, userId: ID): Promise<SalaryUpgradeProposalRow> {
        const values = {
            profileId: data.profile_id,
            currentOccupationCode: data.current_occupation_code,
            currentGrade: data.current_grade,
            currentCoefficient: data.current_coefficient?.toString(),
            currentEffectiveDate: data.current_effective_date ? new Date(data.current_effective_date) : undefined,
            currentTitle: data.current_title,
            proposedGrade: data.proposed_grade,
            proposedCoefficient: data.proposed_coefficient?.toString(),
            proposedNextDate: new Date(data.proposed_next_date),
            upgradeType: data.upgrade_type as any,
            status: 'pending'
        }
        return await salaryRepo.createProposal(values)
    }

    /**
     * Duyệt nâng lương
     */
    async approveProposal(id: ID, approvedBy: ID): Promise<SalaryUpgradeProposalRow> {
        const proposal = await salaryRepo.findProposalById(id)
        if (!proposal) {
            throw new NotFoundError('Proposal not found')
        }

        // Update salary info table when proposal is approved
        const updatedSalary = await salaryRepo.update(proposal.profileId, {
            salaryGrade: proposal.proposedGrade,
            salaryCoefficient: proposal.proposedCoefficient,
            nextGradeDate: proposal.proposedNextDate,
            effectiveDate: new Date()
        })

        // Log to salary_logs
        await salaryRepo.createLog({
            profileId: proposal.profileId,
            occupationCode: updatedSalary.occupationCode,
            salaryGrade: updatedSalary.salaryGrade,
            salaryCoefficient: updatedSalary.salaryCoefficient,
            isOverGrade: updatedSalary.isOverGrade,
            positionAllowance: updatedSalary.positionAllowance,
            effectiveDate: updatedSalary.effectiveDate,
            nextGradeDate: updatedSalary.nextGradeDate,
            decisionNumber: updatedSalary.decisionNumber,
            occupationGroup: updatedSalary.occupationGroup
        })

        const updated = await salaryRepo.updateProposalStatus(id, 'approved')

        // Send email notification
        const userRows = await db.select({ email: users.email, fullName: users.fullName })
            .from(users)
            .innerJoin(profileStaff, eq(profileStaff.userId, users.id))
            .where(eq(profileStaff.id, proposal.profileId))
            .limit(1)
            
        const user = userRows[0]
        if (user) {
            const grade = typeof proposal.proposedGrade === 'string' ? parseInt(proposal.proposedGrade, 10) : (proposal.proposedGrade ?? 0);
            emailService.sendSalaryApprovalEmail(user.email, user.fullName, grade).catch(err => {
                console.error('Failed to send salary approval email', err)
            })
        }

        return updated
    }
}

export const salaryService = new SalaryService()
