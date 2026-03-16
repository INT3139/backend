import { db } from "@/configs/db"
import { ID, EducationHistoryInput, FamilyRelationInput, HealthRecordInput } from "@/types"
import { profileEducationHistories, profileFamilyRelations, profileWorkHistories, profileExtraInfo, profileHealthRecords, profilePositions, profileResearchWorks } from "@/db/schema"
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

    async updateEducation(id: ID, data: Partial<EducationHistoryInput>) {
        const { profileId, ...updateData } = data
        const res = await db.update(profileEducationHistories)
            .set({
                ...updateData as any,
            })
            .where(eq(profileEducationHistories.id, id))
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

    async updateFamily(id: ID, data: Partial<FamilyRelationInput>) {
        const { profileId, ...updateData } = data
        const res = await db.update(profileFamilyRelations)
            .set({
                ...updateData as any,
            })
            .where(eq(profileFamilyRelations.id, id))
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
                profileId: data.profileId,
                historyType: data.historyType,
                fromDate: data.fromDate,
                toDate: data.toDate,
                unitName: data.unitName,
                positionName: data.positionName,
                activityType: data.activityType,
                status: data.status || 'pending'
            })
            .returning()
        return res[0]
    }

    async updateWorkHistory(id: ID, data: any) {
        const { profileId, ...updateData } = data
        const res = await db.update(profileWorkHistories)
            .set({
                ...updateData,
            })
            .where(eq(profileWorkHistories.id, id))
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
            arrestHistory: data.arrestHistory,
            oldRegimeWork: data.oldRegimeWork,
            foreignOrgRelations: data.foreignOrgRelations,
            foreignRelatives: data.foreignRelatives,
            incomeSalary: data.incomeSalary,
            incomeOtherSources: data.incomeOtherSources,
            houseTypeGranted: data.houseTypeGranted,
            houseAreaGranted: data.houseAreaGranted,
            houseTypeOwned: data.houseTypeOwned,
            houseAreaOwned: data.houseAreaOwned,
            landGrantedM2: data.landGrantedM2,
            landPurchasedM2: data.landPurchasedM2,
            landBusinessM2: data.landBusinessM2,
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

    // --- POSITIONS ---
    async getPositions(profileId: ID) {
        return await db.select()
            .from(profilePositions)
            .where(eq(profilePositions.profileId, profileId))
            .orderBy(desc(profilePositions.startDate))
    }

    async createPosition(data: any) {
        const res = await db.insert(profilePositions)
            .values({
                profileId: data.profileId,
                unitId: data.unitId,
                positionName: data.positionName,
                positionType: data.positionType,
                startDate: data.startDate,
                endDate: data.endDate,
                decisionRef: data.decisionRef,
                isPrimary: data.isPrimary ?? false
            })
            .returning()
        return res[0]
    }

    async updatePosition(id: ID, data: any) {
        const { profileId, ...updateData } = data
        const res = await db.update(profilePositions)
            .set(updateData)
            .where(eq(profilePositions.id, id))
            .returning()
        return res[0]
    }

    async deletePosition(id: ID) {
        await db.delete(profilePositions)
            .where(eq(profilePositions.id, id))
    }

    // --- RESEARCH WORKS ---
    async getResearchWorks(profileId: ID) {
        return await db.select()
            .from(profileResearchWorks)
            .where(eq(profileResearchWorks.profileId, profileId))
            .orderBy(desc(profileResearchWorks.publishYear))
    }

    async createResearchWork(data: any) {
        const res = await db.insert(profileResearchWorks)
            .values({
                profileId: data.profileId,
                workType: data.workType,
                title: data.title,
                journalName: data.journalName,
                indexing: data.indexing,
                publishYear: data.publishYear,
                doi: data.doi,
                academicYear: data.academicYear,
                status: data.status || 'pending'
            })
            .returning()
        return res[0]
    }

    async updateResearchWork(id: ID, data: any) {
        const { profileId, ...updateData } = data
        const res = await db.update(profileResearchWorks)
            .set(updateData)
            .where(eq(profileResearchWorks.id, id))
            .returning()
        return res[0]
    }

    async deleteResearchWork(id: ID) {
        await db.delete(profileResearchWorks)
            .where(eq(profileResearchWorks.id, id))
    }
}

export const profileSubRepo = new ProfileSubRepo()
