import { pool, query, queryOne } from "@/configs/db"
import { UUID } from "@/types"
import { sql } from "@/utils/sql"

export class ProfileSubRepo {
    // --- EDUCATION ---
    async getEducation(profileId: UUID) {
        const res = await query(`SELECT * FROM profile_education_histories WHERE profile_id = $1 ORDER BY from_date DESC`, [profileId])
        return res
    }

    async createEducation(data: any) {
        return await queryOne(
            `INSERT INTO profile_education_histories (profile_id, edu_type, from_date, to_date, degree_level, institution, major, training_form, field, is_studying, cert_name, lang_name, lang_level)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [data.profile_id, data.edu_type, data.from_date, data.to_date, data.degree_level, data.institution, data.major, data.training_form, data.field, data.is_studying, data.cert_name, data.lang_name, data.lang_level]
        )
    }

    async deleteEducation(id: UUID) {
        await query(`DELETE FROM profile_education_histories WHERE id = $1`, [id])
    }

    // --- FAMILY ---
    async getFamily(profileId: UUID) {
        const res = await query(`SELECT * FROM profile_family_relations WHERE profile_id = $1`, [profileId])
        return res
    }

    async createFamily(data: any) {
        return await queryOne(
            `INSERT INTO profile_family_relations (profile_id, side, relationship, full_name, birth_year, description, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [data.profile_id, data.side, data.relationship, data.full_name, data.birth_year, data.description, data.status || 'pending']
        )
    }

    async deleteFamily(id: UUID) {
        await query(`DELETE FROM profile_family_relations WHERE id = $1`, [id])
    }

    // --- WORK HISTORY ---
    async getWorkHistory(profileId: UUID) {
        const res = await query(`SELECT * FROM profile_work_histories WHERE profile_id = $1 ORDER BY from_date DESC`, [profileId])
        return res
    }

    async createWorkHistory(data: any) {
        return await queryOne(
            `INSERT INTO profile_work_histories (profile_id, history_type, from_date, to_date, unit_name, position_name, activity_type, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [data.profile_id, data.history_type, data.from_date, data.to_date, data.unit_name, data.position_name, data.activity_type, data.status || 'pending']
        )
    }

    async deleteWorkHistory(id: UUID) {
        await query(`DELETE FROM profile_work_histories WHERE id = $1`, [id])
    }

    // --- EXTRA INFO ---
    async getExtraInfo(profileId: UUID) {
        return await queryOne(`SELECT * FROM profile_extra_info WHERE profile_id = $1`, [profileId])
    }

    async upsertExtraInfo(profileId: UUID, data: any) {
        const existing = await this.getExtraInfo(profileId)
        if (existing) {
            const fields: string[] = []
            const params: any[] = []
            let i = 1
            for (const [k, v] of Object.entries(data)) {
                if (k === 'profile_id') continue
                fields.push(`${k} = $${i++}`)
                params.push(v)
            }
            params.push(profileId)
            return await queryOne(`UPDATE profile_extra_info SET ${fields.join(', ')} WHERE profile_id = $${i} RETURNING *`, params)
        } else {
            return await queryOne(
                `INSERT INTO profile_extra_info (profile_id, arrest_history, old_regime_work, foreign_org_relations, foreign_relatives, income_salary, income_other_sources, house_type_granted, house_area_granted, house_type_owned, house_area_owned, land_granted_m2, land_purchased_m2, land_business_m2)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
                [profileId, data.arrest_history, data.old_regime_work, data.foreign_org_relations, data.foreign_relatives, data.income_salary, data.income_other_sources, data.house_type_granted, data.house_area_granted, data.house_type_owned, data.house_area_owned, data.land_granted_m2, data.land_purchased_m2, data.land_business_m2]
            )
        }
    }

    // --- HEALTH RECORDS ---
    async getHealthRecords(profileId: UUID) {
        return await queryOne(`SELECT * FROM profile_health_records WHERE profile_id = $1`, [profileId])
    }

    async upsertHealthRecords(profileId: UUID, data: any) {
        const existing = await this.getHealthRecords(profileId)
        if (existing) {
            return await queryOne(
                `UPDATE profile_health_records SET health_status = $1, weight_kg = $2, height_cm = $3, blood_type = $4, notes = $5 WHERE profile_id = $6 RETURNING *`,
                [data.health_status, data.weight_kg, data.height_cm, data.blood_type, data.notes, profileId]
            )
        } else {
            return await queryOne(
                `INSERT INTO profile_health_records (profile_id, health_status, weight_kg, height_cm, blood_type, notes)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [profileId, data.health_status, data.weight_kg, data.height_cm, data.blood_type, data.notes]
            )
        }
    }
}

export const profileSubRepo = new ProfileSubRepo()
