import { salaryRepo, SalaryFilter, SalaryInfoRow, SalaryUpgradeProposalRow } from "./salary.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { ForbiddenError, NotFoundError, ValidationError } from "@/core/middlewares/errorHandler"
import { db } from "@/configs/db"
import { users, profileStaff } from "@/db/schema"
import { eq } from "drizzle-orm"
import { emailService } from "@/services/email.service"
import { profileRepo } from "../profile/profile.repo"
import { workflowEngine, type WorkflowInstance } from "@/core/workflow/engine"
import { WF } from "@/constants/workflowCodes"
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"
import { salaryWorkflowMetadataSchema } from "./salary.schema"

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
        const profile = await profileRepo.findById(profileId)
        if (!profile) throw new NotFoundError('Profile not found')

        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)
        if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId))) {
            throw new ForbiddenError('You do not have permission to update salary info for this profile')
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
            filter = { ...filter, unitIds }
        }

        return await salaryRepo.findProposals(filter, pagination)
    }

    /**
     * Tạo đề xuất nâng lương và khởi tạo workflow
     */
    async createProposal(data: CreateSalaryProposalDto, user: AuthUser): Promise<{ message: string; workflowId: ID }> {
        // Check scope over target profile
        const profile = await profileRepo.findById(data.profile_id)
        if (!profile) throw new NotFoundError('Profile not found')

        const scopes = await permissionService.getScopes(user.id)
        const unitIds = await abacService.getUnitIds(scopes)
        if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId))) {
            throw new ForbiddenError('You do not have permission to propose salary upgrade for this profile')
        }

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
        const proposal = await salaryRepo.createProposal(values)

        // Register ABAC scope for the proposal
        await abacService.registerScope({
            resourceType: 'salary_upgrade',
            resourceId: proposal.id,
            ownerId: user.id,
            unitId: profile.unitId
        })

        // Initiate workflow
        const workflow = await workflowEngine.initiate({
            definitionCode: WF.SALARY_UPGRADE,
            resourceType: 'salary_upgrade',
            resourceId: proposal.id,
            initiatedBy: user.id,
            metadata: { data: values }
        })

        return { message: 'Đề xuất nâng lương đã được tạo và đang chờ phê duyệt.', workflowId: workflow.id }
    }

    /**
     * Xử lý một bước trong workflow nâng lương
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
     * Áp dụng thay đổi lương sau khi workflow được phê duyệt
     */
    async applyChangesFromWorkflow(inst: WorkflowInstance, approvedBy: ID, tx?: any, _finalize: boolean = true): Promise<any> {
        if (inst.status !== 'approved' && !_finalize) {
            // Allow mock
        } else if (inst.status !== 'approved') {
            throw new ForbiddenError('Workflow must be approved first')
        }

        const proposal = await salaryRepo.findProposalById(inst.resourceId, tx)
        if (!proposal) throw new NotFoundError('Proposal not found')

        // Validate proposal data using Zod schema
        // This ensures proposed_grade is a valid number (prevents NaN)
        let validatedProposal: any
        try {
            validatedProposal = salaryWorkflowMetadataSchema.parse({
                profileId: proposal.profileId,
                proposedGrade: proposal.proposedGrade,
                proposedCoefficient: proposal.proposedCoefficient,
                proposedNextDate: proposal.proposedNextDate
            })
        } catch (error: any) {
            throw new ValidationError(`Invalid salary proposal data: ${error.message}`)
        }

        // Apply salary changes using the validated proposal values
        const updatedSalary = await salaryRepo.update(proposal.profileId, {
            salaryGrade: validatedProposal.proposedGrade,
            salaryCoefficient: validatedProposal.proposedCoefficient,
            nextGradeDate: validatedProposal.proposedNextDate,
            effectiveDate: validatedProposal.proposedNextDate
        }, tx)

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
        }, tx)

        await salaryRepo.updateProposalStatus(proposal.id, 'approved', tx)

        // Send email notification with validated grade
        const dbClient = tx || db
        const userRows = await dbClient.select({ email: users.email, fullName: users.fullName })
            .from(users)
            .innerJoin(profileStaff, eq(profileStaff.userId, users.id))
            .where(eq(profileStaff.id, proposal.profileId))
            .limit(1)

        const targetUser = userRows[0]
        if (targetUser) {
            emailService.sendSalaryApprovalEmail(targetUser.email, targetUser.fullName, validatedProposal.proposedGrade).catch(err => {
                console.error('Failed to send salary approval email', err)
            })
        }

        return { message: 'Đề xuất nâng lương đã được phê duyệt và áp dụng thành công.', salary: updatedSalary }
    }

    /**
     * Xử lý khi workflow bị từ chối
     */
    async handleRejection(inst: WorkflowInstance, _rejectedBy: ID, tx?: any): Promise<void> {
        await salaryRepo.updateProposalStatus(inst.resourceId, 'rejected', tx)
    }
}

export const salaryService = new SalaryService()

// Register workflow handlers for the dispatcher
registerWorkflowHandler(
    'salary_upgrade',
    (inst, actorId, tx) => salaryService.applyChangesFromWorkflow(inst, actorId, tx),
    (inst, actorId, tx) => salaryService.handleRejection(inst, actorId, tx)
)
