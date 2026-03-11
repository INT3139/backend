import { query, queryOne } from "@/configs/db"
import { UUID, PaginationQuery, PaginatedResult } from "@/types"

export interface ProfileFilter {
    unitId?: UUID
    staffType?: string
    employmentStatus?: string
    keyword?: string
    profileStatus?: string
}

export interface ProfileRow {
    id: UUID
    user_id: UUID
    unit_id: UUID
    email_vnu: string
    email_personal: string
    phone_work: string
    phone_home: string
    date_of_birth: Date
    gender: string
    id_number: string
    id_issued_date: Date
    id_issued_by: string
    nationality: string
    ethnicity: string
    religion: string
    marital_status: string
    policy_object: string
    nick_name: string
    passport_number: string
    passport_issued_at: Date
    passport_issued_by: string
    insurance_number: string
    insurance_joined_at: Date
    addr_hometown: Record<string, unknown>
    addr_birthplace: Record<string, unknown>
    addr_permanent: Record<string, unknown>
    addr_current: Record<string, unknown>
    academic_degree: string
    academic_title: string
    edu_level_general: string
    state_management: string
    political_theory: string
    foreign_lang_level: string
    it_level: string
    staff_type: string
    employment_status: string
    join_date: Date
    retire_date: Date
    profile_status: string
    last_updated_by: UUID
    created_at: Date
    updated_at: Date
    username: string
    full_name: string
    unit_name: string
}

export class ProfileRepository {
    /**
     * Get danh sách profiles với filter và pagination
     */
    async findMany(
        filter: ProfileFilter,
        pagination: PaginationQuery
    ): Promise<PaginatedResult<ProfileRow>> {
        const conditions: string[] = ['p.deleted_at IS NULL']
        const params: unknown[] = []
        let paramIndex = 1

        if (filter.unitId) {
            conditions.push(`p.unit_id = $${paramIndex++}`)
            params.push(filter.unitId)
        }
        if (filter.staffType) {
            conditions.push(`p.staff_type = $${paramIndex++}`)
            params.push(filter.staffType)
        }
        if (filter.employmentStatus) {
            conditions.push(`p.employment_status = $${paramIndex++}`)
            params.push(filter.employmentStatus)
        }
        if (filter.profileStatus) {
            conditions.push(`p.profile_status = $${paramIndex++}`)
            params.push(filter.profileStatus)
        }
        if (filter.keyword) {
            const kw = `%${filter.keyword}%`
            conditions.push(`(p.full_name ILIKE $${paramIndex} OR p.email_vnu ILIKE $${paramIndex} OR p.id_number ILIKE $${paramIndex})`)
            params.push(kw)
            paramIndex++
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        // Count total
        const countResult = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM profile_staff p ${whereClause}`, // Changed view to table for count
            params
        )
        const total = parseInt(countResult?.total || '0', 10)

        // Get data
        const offset = (pagination.page - 1) * pagination.limit
        const orderBy = pagination.sort ? `ORDER BY p.${pagination.sort} ${pagination.order || 'ASC'}` : 'ORDER BY p.created_at DESC'

        const dataParams = [...params, pagination.limit, offset]
        const rows = await query<ProfileRow>(
            `SELECT p.* FROM profile_staff p ${whereClause} ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            dataParams
        )

        return {
            data: rows,
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
        }
    }

    /**
     * Get profile by ID
     */
    async findById(id: UUID): Promise<ProfileRow | null> {
        return await queryOne<ProfileRow>(
            `SELECT * FROM profile_staff WHERE id = $1 AND deleted_at IS NULL`,
            [id]
        )
    }

    /**
     * Get profile by user_id
     */
    async findByUserId(userId: UUID): Promise<ProfileRow | null> {
        return await queryOne<ProfileRow>(
            `SELECT * FROM profile_staff WHERE user_id = $1 AND deleted_at IS NULL`,
            [userId]
        )
    }

    /**
     * Create profile mới
     */
    async create(data: any): Promise<ProfileRow> {
        const result = await queryOne<ProfileRow>(
            `INSERT INTO profile_staff (
                user_id, unit_id, email_vnu, email_personal, phone_work, phone_home,
                date_of_birth, gender, id_number, id_issued_date, id_issued_by,
                nationality, ethnicity, religion, marital_status, policy_object, nick_name,
                passport_number, passport_issued_at, passport_issued_by,
                insurance_number, insurance_joined_at,
                addr_hometown, addr_birthplace, addr_permanent, addr_current,
                academic_degree, academic_title, edu_level_general,
                state_management, political_theory, foreign_lang_level, it_level,
                staff_type, employment_status, join_date, retire_date, profile_status,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22,
                $23, $24, $25, $26,
                $27, $28, $29, $30, $31, $32, $33,
                $34, $35, $36, $37, $38, $39
            ) RETURNING *`,
            [
                data.user_id, data.unit_id, data.email_vnu, data.email_personal, data.phone_work, data.phone_home,
                data.date_of_birth, data.gender, data.id_number, data.id_issued_date, data.id_issued_by,
                data.nationality, data.ethnicity, data.religion, data.marital_status, data.policy_object, data.nick_name,
                data.passport_number, data.passport_issued_at, data.passport_issued_by,
                data.insurance_number, data.insurance_joined_at,
                JSON.stringify(data.addr_hometown), JSON.stringify(data.addr_birthplace),
                JSON.stringify(data.addr_permanent), JSON.stringify(data.addr_current),
                data.academic_degree, data.academic_title, data.edu_level_general,
                data.state_management, data.political_theory, data.foreign_lang_level, data.it_level,
                data.staff_type, data.employment_status, data.join_date, data.retire_date, data.profile_status,
                data.created_by
            ]
        )
        return result!
    }

    /**
     * Update profile
     */
    async update(id: UUID, data: any): Promise<ProfileRow> {
        const fields: string[] = []
        const params: unknown[] = []
        let paramIndex = 1

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                if (key.startsWith('addr_') && typeof value === 'object') {
                    fields.push(`${key} = $${paramIndex++}`)
                    params.push(JSON.stringify(value))
                } else {
                    fields.push(`${key} = $${paramIndex++}`)
                    params.push(value)
                }
            }
        }

        if (fields.length === 0) {
            return (await this.findById(id))!
        }

        params.push(id)
        const result = await queryOne<ProfileRow>(
            `UPDATE profile_staff SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex} RETURNING *`,
            params
        )
        return result!
    }

    /**
     * Soft delete profile
     */
    async delete(id: UUID): Promise<void> {
        await query(
            `UPDATE profile_staff SET deleted_at = NOW() WHERE id = $1`,
            [id]
        )
    }

    /**
     * Get số lượng profiles theo unit
     */
    async countByUnit(unitId: UUID): Promise<number> {
        const result = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM profile_staff WHERE unit_id = $1 AND deleted_at IS NULL`,
            [unitId]
        )
        return parseInt(result?.total || '0', 10)
    }

    /**
     * Tìm kiếm profiles theo keyword (full-text search)
     */
    async search(keyword: string, limit = 10): Promise<ProfileRow[]> {
        return await query<ProfileRow>(
            `SELECT * FROM profile_staff
            WHERE deleted_at IS NULL
            AND (full_name ILIKE $1 OR email_vnu ILIKE $1 OR id_number ILIKE $1)
            LIMIT $2`,
            [`%${keyword}%`, limit]
        )
    }
}

export const profileRepo = new ProfileRepository()