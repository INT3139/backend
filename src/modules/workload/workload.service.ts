import { workloadRepo, WorkloadFilter, EvidenceRow, QuotaRow, SummaryRow } from "./workload.repo"
import { UUID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { queryOne } from "@/configs/db"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"

export class WorkloadService {
    /**
     * Get workload by user ID
     */
    async getWorkloadByUserId(userId: UUID) {
        const profile = await queryOne<{ id: UUID }>(
            `SELECT id FROM profile_staff WHERE user_id = $1`,
            [userId]
        )
        if (!profile) return null
        
        const academicYear = '2025-2026' // Demo default
        return await workloadRepo.findByProfileId(profile.id, academicYear)
    }

    /**
     * Create evidence
     */
    async createEvidence(data: Partial<EvidenceRow>, userId: UUID) {
        const profile = await queryOne<{ id: UUID }>(
            `SELECT id FROM profile_staff WHERE user_id = $1`,
            [userId]
        )
        if (!profile) throw new NotFoundError('Profile not found')

        return await workloadRepo.createEvidence({
            ...data,
            profile_id: profile.id,
            status: 'pending'
        })
    }

    /**
     * Get evidences
     */
    async getEvidences(
        filter: WorkloadFilter,
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

        return await workloadRepo.findEvidences(filter, pagination)
    }

    /**
     * Approve evidence
     */
    async approveEvidence(id: UUID, approvedBy: UUID) {
        return await workloadRepo.updateEvidenceStatus(id, 'approved', approvedBy)
    }

    /**
     * Reject evidence
     */
    async rejectEvidence(id: UUID, rejectedBy: UUID, reason: string) {
        return await workloadRepo.updateEvidenceStatus(id, 'rejected', rejectedBy, reason)
    }

    /**
     * Get summaries
     */
    async getSummaries(
        filter: WorkloadFilter,
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

        return await workloadRepo.findSummaries(filter, pagination)
    }
}

export const workloadService = new WorkloadService()