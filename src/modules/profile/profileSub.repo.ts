import { db } from "@/configs/db"
import { ID, EducationHistoryInput, FamilyRelationInput, HealthRecordInput } from "@/types"
import { profileEducationHistories, profileFamilyRelations, profileWorkHistories, profileExtraInfo, profileHealthRecords } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export class ProfileSubRepo {
    // --- EDUCATION ---
    async getEducation(profileId: ID) {
        return await db.select()
            .from(profileEducationHistories)
            .where(eq(profileEducationHistories.profileId, profileId))
            .orderBy(desc(profileEducationHistories.fromDate))
    }

    async createEducation(data: EducationHistoryInput) {
        const res = await db.insert(profileEducationHistories)
            .values({
                profileId: data.profileId,
                eduType: data.eduType as any,
                fromDate: data.fromDate as any,
                toDate: data.toDate as any,
                degreeLevel: data.degreeLevel,
                institution: data.institution,
                major: data.major,
                trainingForm: data.trainingForm,
                field: data.field,
                isStudying: data.isStudying ?? false,
                certName: data.certName,
                langName: data.langName,
                langLevel: data.langLevel as any
            })
            .returning()
        return res[0]
    }

    async deleteEducation(id: ID) {
        await db.delete(profileEducationHistories)
            .where(eq(profileEducationHistories.id, id))
    }

    // --- FAMILY ---
    async getFamily(profileId: ID) {
        return await db.select()
            .from(profileFamilyRelations)
            .where(eq(profileFamilyRelations.profileId, profileId))
    }

    async createFamily(data: FamilyRelationInput) {
        const res = await db.insert(profileFamilyRelations)
            .values({
                profileId: data.profileId,
                side: data.side,
                relationship: data.relationship,
                fullName: data.fullName,
                birthYear: data.birthYear,
                description: data.description,
                status: (data.status as any) || 'pending'
            })
            .returning()
        return res[0]
    }

    async deleteFamily(id: ID) {
        await db.delete(profileFamilyRelations)
            .where(eq(profileFamilyRelations.id, id))
    }

    // --- WORK HISTORY ---
    async getWorkHistory(profileId: ID) {
        return await db.select()
            .from(profileWorkHistories)
            .where(eq(profileWorkHistories.profileId, profileId))
            .orderBy(desc(profileWorkHistories.fromDate))
    }

    async createWorkHistory(data: any) {
        const res = await db.insert(profileWorkHistories)
            .values({
                profileId: data.profileId, // camelCase từ controller
                historyType: data.history_type,
                fromDate: data.from_date,
                toDate: data.to_date,
                unitName: data.unit_name,
                positionName: data.position_name,
                activityType: data.activity_type,
                status: data.status || 'pending'
            })
            .returning()
        return res[0]
    }

    async deleteWorkHistory(id: ID) {
        await db.delete(profileWorkHistories)
            .where(eq(profileWorkHistories.id, id))
    }

    // --- EXTRA INFO ---
    async getExtraInfo(profileId: ID) {
        const res = await db.select()
            .from(profileExtraInfo)
            .where(eq(profileExtraInfo.profileId, profileId))
            .limit(1)
        return res[0] ?? null
    }

    async upsertExtraInfo(profileId: ID, data: any) {
        const values = {
            profileId: profileId,
            arrestHistory: data.arrest_history,
            oldRegimeWork: data.old_regime_work,
            foreignOrgRelations: data.foreign_org_relations,
            foreignRelatives: data.foreign_relatives,
            incomeSalary: data.income_salary,
            incomeOtherSources: data.income_other_sources,
            houseTypeGranted: data.house_type_granted,
            houseAreaGranted: data.house_area_granted,
            houseTypeOwned: data.house_type_owned,
            houseAreaOwned: data.house_area_owned,
            landGrantedM2: data.land_granted_m2,
            landPurchasedM2: data.land_purchased_m2,
            landBusinessM2: data.land_business_m2,
            updatedAt: new Date()
        }

        const res = await db.insert(profileExtraInfo)
            .values(values)
            .onConflictDoUpdate({
                target: profileExtraInfo.profileId,
                set: values
            })
            .returning()
        return res[0]
    }

    // --- HEALTH RECORDS ---
    async getHealthRecords(profileId: ID) {
        const res = await db.select()
            .from(profileHealthRecords)
            .where(eq(profileHealthRecords.profileId, profileId))
            .limit(1)
        return res[0] ?? null
    }

    async upsertHealthRecords(profileId: ID, data: HealthRecordInput) {
        const values = {
            profileId: profileId,
            healthStatus: data.healthStatus,
            weightKg: data.weightKg?.toString(),
            heightCm: data.heightCm?.toString(),
            bloodType: data.bloodType,
            notes: data.notes,
            updatedAt: new Date()
        }

        const res = await db.insert(profileHealthRecords)
            .values(values as any)
            .onConflictDoUpdate({
                target: profileHealthRecords.profileId,
                set: values as any
            })
            .returning()
        return res[0]
    }
}

export const profileSubRepo = new ProfileSubRepo()
