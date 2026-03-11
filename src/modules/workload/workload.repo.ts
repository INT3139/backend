import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface WorkloadFilter {
    unitId?: string
    academicYear?: string
    status?: string
}

export interface EvidenceRow {
    id: UUID
    profile_id: UUID
    academic_year: string
    evidence_type: string
    title: string
    hours_claimed: number
    coef_applied: number
    hours_converted: number
    status: string
    reviewed_by: UUID | null
    created_at: Date
}

export interface QuotaRow {
    id: UUID
    profile_id: UUID
    academic_year: string
    teaching_hours: number
    research_hours: number
    other_hours: number
    reduction_pct: number
    reduction_reason: string
}

export interface SummaryRow {
    id: UUID
    profile_id: UUID
    academic_year: string
    total_teaching: number
    total_research: number
    total_other: number
    quota_teaching: number
    quota_research: number
    is_teaching_violation: boolean
    is_research_violation: boolean
}

export class WorkloadRepo {
    /**
     * Get workload by profile ID
     */
    async findByProfileId(profileId: UUID, academicYear: string) {
        const [quota, summary, evidences] = await Promise.all([
            queryOne<QuotaRow>(`SELECT * FROM workload_individual_quotas WHERE profile_id = $1 AND academic_year = $2`, [profileId, academicYear]),
            queryOne<SummaryRow>(`SELECT * FROM workload_annual_summaries WHERE profile_id = $1 AND academic_year = $2`, [profileId, academicYear]),
            query<EvidenceRow>(`SELECT * FROM workload_evidences WHERE profile_id = $1 AND academic_year = $2`, [profileId, academicYear])
        ])

        return {
            quota,
            summary,
            evidences
        }
    }

    /**
     * Create evidence
     */
    async createEvidence(data: Partial<EvidenceRow>): Promise<EvidenceRow> {
        const res = await queryOne<EvidenceRow>(
            `INSERT INTO workload_evidences (
                profile_id, academic_year, evidence_type, title, 
                hours_claimed, coef_applied, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING *`,
            [
                data.profile_id, data.academic_year, data.evidence_type,
                data.title, data.hours_claimed, data.coef_applied || 1.0,
                data.status || 'pending'
            ]
        )
        return res!
    }

    /**
     * Find many evidences with filter and pagination
     */
    async findEvidences(
        filter: WorkloadFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<EvidenceRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`profile_id IN (SELECT id FROM profile_staff WHERE unit_id = $${paramIdx++})`)
            params.push(filter.unitId)
        }
        if (filter.academicYear) {
            conditions.push(`academic_year = $${paramIdx++}`)
            params.push(filter.academicYear)
        }
        if (filter.status) {
            conditions.push(`status = $${paramIdx++}`)
            params.push(filter.status)
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM workload_evidences ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<EvidenceRow>(
            `SELECT * FROM workload_evidences 
            ${whereClause} 
            ORDER BY ${sort || 'created_at'} ${order || 'desc'}
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        )

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Find many summaries with filter and pagination
     */
    async findSummaries(
        filter: WorkloadFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<SummaryRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`profile_id IN (SELECT id FROM profile_staff WHERE unit_id = $${paramIdx++})`)
            params.push(filter.unitId)
        }
        if (filter.academicYear) {
            conditions.push(`academic_year = $${paramIdx++}`)
            params.push(filter.academicYear)
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM workload_annual_summaries ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<SummaryRow>(
            `SELECT * FROM workload_annual_summaries 
            ${whereClause} 
            ORDER BY ${sort || 'academic_year'} ${order || 'desc'}
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        )

        return {
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    /**
     * Update evidence status
     */
    async updateEvidenceStatus(id: UUID, status: string, reviewedBy: UUID, rejectReason?: string): Promise<EvidenceRow> {
        const res = await queryOne<EvidenceRow>(
            `UPDATE workload_evidences 
            SET status = $1, reviewed_by = $2, reviewed_at = NOW(), reject_reason = $3
            WHERE id = $4
            RETURNING *`,
            [status, reviewedBy, rejectReason || null, id]
        )
        return res!
    }
}

export const workloadRepo = new WorkloadRepo()