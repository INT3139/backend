import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface RewardFilter {
    unitId?: string
    academicYear?: string
    awardedYear?: string
}

export interface CommendationRow {
    id: UUID
    profile_id: UUID
    decision_number: string
    decision_date: Date
    award_level: string
    award_name: string
    content: string
    academic_year: string
    is_highest_award: boolean
    status: string
    created_at: Date
}

export interface TitleRow {
    id: UUID
    profile_id: UUID
    title_name: string
    title_level: string
    awarded_year: string
    decision_number: string
    awarded_by: string
    is_highest: boolean
    status: string
    created_at: Date
}

export interface DisciplineRow {
    id: UUID
    profile_id: UUID
    discipline_type: string
    reason: string
    decision_number: string
    unit_name: string
    issued_date: Date
    issued_by: UUID | null
    status: string
    created_at: Date
}

export class RewardRepo {
    /**
     * Get commendations
     */
    async findCommendations(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<CommendationRow>> {
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
            `SELECT COUNT(*) as total FROM reward_commendations ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<CommendationRow>(
            `SELECT * FROM reward_commendations 
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
     * Get rewards by profile ID
     */
    async findByProfileId(profileId: UUID) {
        const [commendations, titles, discipline] = await Promise.all([
            query<CommendationRow>(`SELECT * FROM reward_commendations WHERE profile_id = $1 ORDER BY decision_date DESC`, [profileId]),
            query<TitleRow>(`SELECT * FROM reward_titles WHERE profile_id = $1 ORDER BY awarded_year DESC`, [profileId]),
            query<DisciplineRow>(`SELECT * FROM reward_disciplinary_records WHERE profile_id = $1 ORDER BY issued_date DESC`, [profileId])
        ])

        return {
            commendations,
            titles,
            discipline
        }
    }

    /**
     * Get rewards by user ID
     */
    async findByUserId(userId: UUID) {
        const profile = await queryOne<{ id: UUID }>(
            `SELECT id FROM profile_staff WHERE user_id = $1`,
            [userId]
        )
        if (!profile) return null
        return await this.findByProfileId(profile.id)
    }

    /**
     * Create commendation
     */
    async createCommendation(data: Partial<CommendationRow>): Promise<CommendationRow> {
        const res = await queryOne<CommendationRow>(
            `INSERT INTO reward_commendations (
                profile_id, decision_number, decision_date, award_level, 
                award_name, content, academic_year, is_highest_award, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING *`,
            [
                data.profile_id, data.decision_number, data.decision_date,
                data.award_level, data.award_name, data.content,
                data.academic_year, data.is_highest_award || false, data.status || 'pending'
            ]
        )
        return res!
    }

    /**
     * Update commendation
     */
    async updateCommendation(id: UUID, data: Partial<CommendationRow>): Promise<CommendationRow | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) return null

        params.push(id)
        const res = await queryOne<CommendationRow>(
            `UPDATE reward_commendations SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res
    }

    /**
     * Delete commendation
     */
    async deleteCommendation(id: UUID): Promise<boolean> {
        await query(`DELETE FROM reward_commendations WHERE id = $1`, [id])
        return true
    }

    /**
     * Get titles
     */
    async findTitles(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<TitleRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`profile_id IN (SELECT id FROM profile_staff WHERE unit_id = $${paramIdx++})`)
            params.push(filter.unitId)
        }
        if (filter.awardedYear) {
            conditions.push(`awarded_year = $${paramIdx++}`)
            params.push(filter.awardedYear)
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM reward_titles ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<TitleRow>(
            `SELECT * FROM reward_titles 
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
     * Create title
     */
    async createTitle(data: Partial<TitleRow>): Promise<TitleRow> {
        const res = await queryOne<TitleRow>(
            `INSERT INTO reward_titles (
                profile_id, title_name, title_level, awarded_year, 
                decision_number, awarded_by, is_highest, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING *`,
            [
                data.profile_id, data.title_name, data.title_level, data.awarded_year,
                data.decision_number, data.awarded_by, data.is_highest || false, data.status || 'pending'
            ]
        )
        return res!
    }

    /**
     * Update title
     */
    async updateTitle(id: UUID, data: Partial<TitleRow>): Promise<TitleRow | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) return null

        params.push(id)
        const res = await queryOne<TitleRow>(
            `UPDATE reward_titles SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res
    }

    /**
     * Delete title
     */
    async deleteTitle(id: UUID): Promise<boolean> {
        await query(`DELETE FROM reward_titles WHERE id = $1`, [id])
        return true
    }

    /**
     * Get disciplinary records
     */
    async findDisciplinaryRecords(
        filter: RewardFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<DisciplineRow>> {
        const { page, limit, sort, order } = pagination
        const offset = (page - 1) * limit

        const conditions: string[] = ['1=1']
        const params: any[] = []
        let paramIdx = 1

        if (filter.unitId) {
            conditions.push(`profile_id IN (SELECT id FROM profile_staff WHERE unit_id = $${paramIdx++})`)
            params.push(filter.unitId)
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`

        const countRes = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM reward_disciplinary_records ${whereClause}`,
            params
        )
        const total = parseInt(countRes?.total || '0', 10)

        const rows = await query<DisciplineRow>(
            `SELECT * FROM reward_disciplinary_records 
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
     * Create disciplinary record
     */
    async createDiscipline(data: Partial<DisciplineRow>): Promise<DisciplineRow> {
        const res = await queryOne<DisciplineRow>(
            `INSERT INTO reward_disciplinary_records (
                profile_id, discipline_type, reason, decision_number, 
                unit_name, issued_date, issued_by, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            ) RETURNING *`,
            [
                data.profile_id, data.discipline_type, data.reason, data.decision_number,
                data.unit_name, data.issued_date, data.issued_by, data.status || 'pending'
            ]
        )
        return res!
    }

    /**
     * Update disciplinary record
     */
    async updateDiscipline(id: UUID, data: Partial<DisciplineRow>): Promise<DisciplineRow | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIdx = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIdx++}`)
                params.push(value)
            }
        }

        if (fields.length === 0) return null

        params.push(id)
        const res = await queryOne<DisciplineRow>(
            `UPDATE reward_disciplinary_records SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            params
        )
        return res
    }

    /**
     * Delete disciplinary record
     */
    async deleteDiscipline(id: UUID): Promise<boolean> {
        await query(`DELETE FROM reward_disciplinary_records WHERE id = $1`, [id])
        return true
    }
}

export const rewardRepo = new RewardRepo()