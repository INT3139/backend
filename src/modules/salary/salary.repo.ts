import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface SalaryFilter {
    unitId?: string
    status?: string
}

export interface SalaryInfoRow {
    id: UUID
    profile_id: UUID
    occupation_group: string
    occupation_title: string
    occupation_code: string
    salary_grade: number
    salary_coefficient: number
    is_over_grade: boolean
    effective_date: Date
    decision_number: string
    position_allowance: number
    responsibility_allowance: number
    teacher_incentive_pct: number
    regional_allowance: number
    other_allowance: number
    harmful_allowance: number
    seniority_allowance_pct: number
    enjoyment_rate_pct: number
    actual_coefficient: number
    next_grade_date: Date
    next_seniority_date: Date
    updated_at: Date
}

export interface SalaryUpgradeProposalRow {
    id: UUID
    profile_id: UUID
    current_occupation_code: string
    current_grade: number
    current_coefficient: number
    current_effective_date: Date
    current_title: string
    status: string
    proposed_grade: number
    proposed_coefficient: number
    proposed_next_date: Date
    upgrade_type: string
    workflow_id: UUID | null
    created_at: Date
}

export interface SalaryLogRow {
    id: UUID
    profile_id: UUID
    occupation_code: string | null
    salary_grade: number | null
    salary_coefficient: number | null
    salary_level: number | null
    is_over_grade: boolean
    position_allowance: number | null
    effective_date: Date | null
    next_grade_date: Date | null
    decision_number: string | null
    occupation_group: string | null
    created_at: Date
}

export class SalaryRepo {
    /**
     * Get salary info by profile id
     */
    async findByProfileId(profileId: UUID): Promise<SalaryInfoRow | null> {
        return await queryOne<SalaryInfoRow>(
            `SELECT * FROM salary_info WHERE profile_id = $1`,
            [profileId]
        )
    }

    /**
     * Get salary info by user id (via profile)
     */
    async findByUserId(userId: UUID): Promise<SalaryInfoRow | null> {
        return await queryOne<SalaryInfoRow>(
            `SELECT s.* 
            FROM salary_info s
            JOIN profile_staff p ON s.profile_id = p.id
            WHERE p.user_id = $1`,
            [userId]
        )
    }

    /**
     * Update salary info
     */
    async update(profileId: UUID, data: Partial<SalaryInfoRow>): Promise<SalaryInfoRow> {
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
            return (await this.findByProfileId(profileId))!
        }

        params.push(profileId)
        const res = await queryOne<SalaryInfoRow>(
            `UPDATE salary_info SET ${fields.join(', ')} WHERE profile_id = $${paramIdx} RETURNING *`,
            params
        )
        return res!
    }

    /**
     * Create salary log
     */
    async createLog(data: Partial<SalaryLogRow>): Promise<SalaryLogRow> {
        const res = await queryOne<SalaryLogRow>(
            `INSERT INTO salary_logs (
                profile_id, occupation_code, salary_grade, 
                salary_coefficient, salary_level, is_over_grade, 
                position_allowance, effective_date, next_grade_date, 
                decision_number, occupation_group
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            ) RETURNING *`,
            [
                data.profile_id, data.occupation_code, data.salary_grade,
                data.salary_coefficient, data.salary_level, data.is_over_grade || false,
                data.position_allowance, data.effective_date, data.next_grade_date,
                data.decision_number, data.occupation_group
            ]
        )
        return res!
    }

    /**
     * Find many upgrade proposals with filter and pagination
     */
    async findProposals(
        filter: SalaryFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<SalaryUpgradeProposalRow>> {
        const { page, limit } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`profile_id IN (SELECT id FROM profile_staff WHERE unit_id = $${paramIdx++})`)
            params.push(filter.unitId)
        }
        if (filter.status) {
            conditions.push(`status = $${paramIdx++}`)
            params.push(filter.status)
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM salary_upgrade_proposals ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<SalaryUpgradeProposalRow>(
            `SELECT * FROM salary_upgrade_proposals 
            ${whereClause} 
            ORDER BY created_at DESC
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
     * Create new upgrade proposal
     */
    async createProposal(data: Partial<SalaryUpgradeProposalRow>): Promise<SalaryUpgradeProposalRow> {
        const res = await queryOne<SalaryUpgradeProposalRow>(
            `INSERT INTO salary_upgrade_proposals (
                profile_id, current_occupation_code, current_grade, 
                current_coefficient, current_effective_date, current_title, 
                status, proposed_grade, proposed_coefficient, proposed_next_date,
                upgrade_type
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            ) RETURNING *`,
            [
                data.profile_id, data.current_occupation_code, data.current_grade,
                data.current_coefficient, data.current_effective_date, data.current_title,
                data.status || 'pending', data.proposed_grade, data.proposed_coefficient, 
                data.proposed_next_date, data.upgrade_type
            ]
        )
        return res!
    }

    /**
     * Get proposal by ID
     */
    async findProposalById(id: UUID): Promise<SalaryUpgradeProposalRow | null> {
        return await queryOne<SalaryUpgradeProposalRow>(
            `SELECT * FROM salary_upgrade_proposals WHERE id = $1`,
            [id]
        )
    }

    /**
     * Update proposal status
     */
    async updateProposalStatus(id: UUID, status: string): Promise<SalaryUpgradeProposalRow> {
        const res = await queryOne<SalaryUpgradeProposalRow>(
            `UPDATE salary_upgrade_proposals SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        )
        return res!
    }
}

export const salaryRepo = new SalaryRepo()