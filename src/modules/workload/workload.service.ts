import { workloadRepo, WorkloadFilter, EvidenceRow } from "./workload.repo"
import { ID, PaginationQuery, AuthUser } from "@/types"
import { abacService } from "@/core/permissions/abac"
import { permissionService } from "@/core/permissions/permission.service"
import { db } from "@/configs/db"
import { profileStaff } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ForbiddenError, NotFoundError } from "@/core/middlewares/errorHandler"

export class WorkloadService {
    /**
     * Get workload by user ID
     */
    async getWorkloadByUserId(userId: ID) {
        const rows = await db.select({ id: profileStaff.id })
            .from(profileStaff)
            .where(eq(profileStaff.userId, userId))
            .limit(1)
            
        const profile = rows[0]
        if (!profile) return null
        
        const academicYear = '2025-2026' // Demo default
        return await workloadRepo.findByProfileId(profile.id, academicYear)
    }

    /**
     * Create evidence
     */
    async createEvidence(data: any, userId: ID) {
        const rows = await db.select({ id: profileStaff.id, unitId: profileStaff.unitId })
            .from(profileStaff)
            .where(eq(profileStaff.userId, userId))
            .limit(1)
            
        const profile = rows[0]
        if (!profile) throw new NotFoundError('Profile not found')

        // Map snake_case from body to camelCase for Drizzle
        // Provide defaults for required fields if missing
        const values = {
            profileId: profile.id,
            academicYear: data.academic_year || '2025-2026',
            evidenceType: data.evidence_type || 'other_task',
            title: data.title,
            hoursClaimed: (data.hours_claimed || 0).toString(),
            coefApplied: (data.coef_applied || 1).toString(),
            status: 'pending'
        }

        const evidence = await workloadRepo.createEvidence(values)

        await abacService.registerScope({
            resourceType: 'workload_evidence',
            resourceId: evidence.id,
            ownerId: userId,
            unitId: profile.unitId
        })

        return evidence
    }

    /**
     * Get evidences
     */
    async getEvidences(
        filter: WorkloadFilter,
        pagination: PaginationQuery,
        user: AuthUser
    ) {
        const scopes = await permissionService.getScopes(user)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter.unitIds = unitIds
        }

        return await workloadRepo.findEvidences(filter, pagination)
    }

    /**
     * Approve evidence
     */
    async approveEvidence(id: ID, approvedBy: ID) {
        return await workloadRepo.updateEvidenceStatus(id, 'approved', approvedBy)
    }

    /**
     * Reject evidence
     */
    async rejectEvidence(id: ID, rejectedBy: ID, reason: string) {
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
        const scopes = await permissionService.getScopes(user)
        const unitIds = await abacService.getUnitIds(scopes)

        if (unitIds !== 'all') {
            filter.unitIds = unitIds
        }

        return await workloadRepo.findSummaries(filter, pagination)
    }
}

export const workloadService = new WorkloadService()
