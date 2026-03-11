import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface RecruitmentProposalFilter {
    unitId?: string
    status?: string
    keyword?: string
}

export interface RecruitmentProposalRow {
    id: UUID
    proposing_unit: UUID
    position_name: string
    required_degree: string
    required_exp_years: number
    quota: number
    reason: string
    academic_year: string
    status: string
    workflow_id: UUID | null
    created_by: UUID | null
    created_at: Date
}

export interface CandidateRow {
    id: UUID
    proposal_id: UUID | null
    full_name: string
    email: string | null
    phone: string | null
    degree: string | null
    status: string
    notes: string | null
    created_at: Date
}

export class RecruitmentRepo {
    /**
     * Find many proposals with filter and pagination
     */
    async findMany(
        filter: RecruitmentProposalFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<RecruitmentProposalRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`proposing_unit = $${paramIdx++}`)
            params.push(filter.unitId)
        }
        if (filter.status) {
            conditions.push(`status = $${paramIdx++}`)
            params.push(filter.status)
        }
        if (filter.keyword) {
            const keywordParam = `%${filter.keyword}%`
            conditions.push(`(position_name ILIKE $${paramIdx} OR reason ILIKE $${paramIdx})`)
            params.push(keywordParam)
            paramIdx++
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM recruitment_proposals ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<RecruitmentProposalRow>(
            `SELECT * FROM recruitment_proposals 
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
     * Find proposal by ID
     */
    async findById(id: UUID): Promise<RecruitmentProposalRow | null> {
        return await queryOne<RecruitmentProposalRow>(
            `SELECT * FROM recruitment_proposals WHERE id = $1`,
            [id]
        )
    }

    /**
     * Create new proposal
     */
    async create(data: Partial<RecruitmentProposalRow>): Promise<RecruitmentProposalRow> {
        const res = await queryOne<RecruitmentProposalRow>(
            `INSERT INTO recruitment_proposals (
                proposing_unit, position_name, required_degree, 
                required_exp_years, quota, reason, academic_year, 
                status, created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING *`,
            [
                data.proposing_unit, data.position_name, data.required_degree,
                data.required_exp_years, data.quota, data.reason, data.academic_year,
                data.status || 'draft', data.created_by
            ]
        )
        return res!
    }

    /**
     * Update proposal
     */
    async update(id: UUID, data: Partial<RecruitmentProposalRow>): Promise<RecruitmentProposalRow> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) {
            return (await this.findById(id))!
        }

        params.push(id)
        const res = await queryOne<RecruitmentProposalRow>(
            `UPDATE recruitment_proposals SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res!
    }

    // --- CANDIDATE METHODS ---

    /**
     * Find many candidates with filter and pagination
     */
    async findCandidates(
        proposalId: UUID,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<CandidateRow>> {
        const { page, limit } = pagination
        const offset = (page - 1) * limit

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM recruitment_candidates WHERE proposal_id = $1`,
            [proposalId]
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<CandidateRow>(
            `SELECT * FROM recruitment_candidates 
            WHERE proposal_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`,
            [proposalId, limit, offset]
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
     * Find candidate by ID
     */
    async findCandidateById(id: UUID): Promise<CandidateRow | null> {
        return await queryOne<CandidateRow>(
            `SELECT * FROM recruitment_candidates WHERE id = $1`,
            [id]
        )
    }

    /**
     * Create new candidate
     */
    async createCandidate(data: Partial<CandidateRow>): Promise<CandidateRow> {
        const res = await queryOne<CandidateRow>(
            `INSERT INTO recruitment_candidates (
                proposal_id, full_name, email, phone, "degree", status, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING *`,
            [
                data.proposal_id, data.full_name, data.email, data.phone, 
                data.degree, data.status || 'pending', data.notes
            ]
        )
        return res!
    }

    /**
     * Update candidate
     */
    async updateCandidate(id: UUID, data: Partial<CandidateRow>): Promise<CandidateRow> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) {
            return (await this.findCandidateById(id))!
        }

        params.push(id)
        const res = await queryOne<CandidateRow>(
            `UPDATE recruitment_candidates SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res!
    }

    /**
     * Delete candidate
     */
    async deleteCandidate(id: UUID): Promise<boolean> {
        const res = await query(
            `DELETE FROM recruitment_candidates WHERE id = $1`,
            [id]
        )
        return true
    }
}

export const recruitmentRepo = new RecruitmentRepo()