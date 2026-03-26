import { db } from "@/configs/db"
import { ID, EducationHistoryInput, FamilyRelationInput, HealthRecordInput } from "@/types"
import { profileEducationHistories, profileFamilyRelations, profileWorkHistories, profileExtraInfo, profileHealthRecords, profilePositions, profileResearchWorks } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"

export class ProfileSubRepo {
    // --- EDUCATION ---
    async getEducation(profileId: ID, tx?: any) {
        return await (tx || db).select()
            .from(profileEducationHistories)
            .where(eq(profileEducationHistories.profileId, profileId))
            .orderBy(desc(profileEducationHistories.fromDate))
    }

    // ... (rest of the file until Research Works section)

    async createEducation(data: EducationHistoryInput, tx?: any) {
        const res = await (tx || db).insert(profileEducationHistories)
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

    async updateEducation(id: ID, data: Partial<EducationHistoryInput>, tx?: any) {
        const { profileId, ...updateData } = data
        const res = await (tx || db).update(profileEducationHistories)
            .set({
                ...updateData as any,
            })
            .where(eq(profileEducationHistories.id, id))
            .returning()
        return res[0]
    }

    async deleteEducation(id: ID, tx?: any) {
        await (tx || db).delete(profileEducationHistories)
            .where(eq(profileEducationHistories.id, id))
    }

    // --- FAMILY ---
    async getFamily(profileId: ID, tx?: any) {
        return await (tx || db).select()
            .from(profileFamilyRelations)
            .where(eq(profileFamilyRelations.profileId, profileId))
    }

    async createFamily(data: FamilyRelationInput, tx?: any) {
        const res = await (tx || db).insert(profileFamilyRelations)
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

    async updateFamily(id: ID, data: Partial<FamilyRelationInput>, tx?: any) {
        const { profileId, ...updateData } = data
        const res = await (tx || db).update(profileFamilyRelations)
            .set({
                ...updateData as any,
            })
            .where(eq(profileFamilyRelations.id, id))
            .returning()
        return res[0]
    }

    async deleteFamily(id: ID, tx?: any) {
        await (tx || db).delete(profileFamilyRelations)
            .where(eq(profileFamilyRelations.id, id))
    }

    // --- WORK HISTORY ---
    async getWorkHistory(profileId: ID, tx?: any) {
        return await (tx || db).select()
            .from(profileWorkHistories)
            .where(eq(profileWorkHistories.profileId, profileId))
            .orderBy(desc(profileWorkHistories.fromDate))
    }

    async createWorkHistory(data: any, tx?: any) {
        const res = await (tx || db).insert(profileWorkHistories)
            .values({
                profileId: data.profileId,
                historyType: data.historyType,
                fromDate: data.fromDate,
                toDate: data.toDate,
                unitName: data.unitName,
                positionName: data.positionName,
                activityType: data.activityType,
                status: data.status || 'pending',
                approvedBy: data.approvedBy
            })
            .returning()
        return res[0]
    }

    async updateWorkHistory(id: ID, data: any, tx?: any) {
        const { profileId, ...updateData } = data
        const res = await (tx || db).update(profileWorkHistories)
            .set({
                ...updateData,
            })
            .where(eq(profileWorkHistories.id, id))
            .returning()
        return res[0]
    }

    async deleteWorkHistory(id: ID, tx?: any) {
        await (tx || db).delete(profileWorkHistories)
            .where(eq(profileWorkHistories.id, id))
    }

    // --- EXTRA INFO ---
    async getExtraInfo(profileId: ID, tx?: any) {
        const res = await (tx || db).select()
            .from(profileExtraInfo)
            .where(eq(profileExtraInfo.profileId, profileId))
            .limit(1)
        return res[0] ?? null
    }

    async upsertExtraInfo(profileId: ID, data: any, tx?: any) {
        const updateData: any = {
            updatedAt: new Date()
        }

        const fields = [
            'arrestHistory', 'oldRegimeWork', 'foreignOrgRelations', 'foreignRelatives',
            'incomeSalary', 'incomeOtherSources', 'houseTypeGranted', 'houseAreaGranted',
            'houseTypeOwned', 'houseAreaOwned', 'landGrantedM2', 'landPurchasedM2', 'landBusinessM2'
        ]

        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field]
            }
        })

        const res = await (tx || db).insert(profileExtraInfo)
            .values({
                profileId,
                ...updateData
            })
            .onConflictDoUpdate({
                target: profileExtraInfo.profileId,
                set: updateData
            })
            .returning()
        return res[0]
    }

    // --- HEALTH RECORDS ---
    async getHealthRecords(profileId: ID, tx?: any) {
        const res = await (tx || db).select()
            .from(profileHealthRecords)
            .where(eq(profileHealthRecords.profileId, profileId))
            .limit(1)
        return res[0] ?? null
    }

    async upsertHealthRecords(profileId: ID, data: HealthRecordInput, tx?: any) {
        const updateData: any = {
            updatedAt: new Date()
        }

        if (data.healthStatus !== undefined) updateData.healthStatus = data.healthStatus
        if (data.weightKg !== undefined) updateData.weightKg = data.weightKg.toString()
        if (data.heightCm !== undefined) updateData.heightCm = data.heightCm.toString()
        if (data.bloodType !== undefined) updateData.bloodType = data.bloodType
        if (data.notes !== undefined) updateData.notes = data.notes

        const res = await (tx || db).insert(profileHealthRecords)
            .values({
                profileId,
                ...updateData
            } as any)
            .onConflictDoUpdate({
                target: profileHealthRecords.profileId,
                set: updateData as any
            })
            .returning()
        return res[0]
    }

    // --- POSITIONS ---
    async getPositions(profileId: ID, tx?: any) {
        return await (tx || db).select()
            .from(profilePositions)
            .where(eq(profilePositions.profileId, profileId))
            .orderBy(desc(profilePositions.startDate))
    }

    async createPosition(data: any, tx?: any) {
        const res = await (tx || db).insert(profilePositions)
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

    async updatePosition(id: ID, data: any, tx?: any) {
        const { profileId, ...updateData } = data
        const res = await (tx || db).update(profilePositions)
            .set(updateData)
            .where(eq(profilePositions.id, id))
            .returning()
        return res[0]
    }

    async deletePosition(id: ID, tx?: any) {
        await (tx || db).delete(profilePositions)
            .where(eq(profilePositions.id, id))
    }

    // --- RESEARCH WORKS ---
    async getResearchWorks(
        profileId: ID, 
        filter: { workType?: string, page?: number, limit?: number } = {},
        tx?: any
    ) {
        const { workType, page, limit } = filter;
        const dbInst = tx || db;

        // 1. Get summary counts by type (always return this for UI tabs)
        const summary = await dbInst
            .select({
                type: profileResearchWorks.workType,
                count: count()
            })
            .from(profileResearchWorks)
            .where(eq(profileResearchWorks.profileId, profileId))
            .groupBy(profileResearchWorks.workType);

        // 2. Build conditions for the main data query
        const conditions = [eq(profileResearchWorks.profileId, profileId)];
        if (workType) {
            conditions.push(eq(profileResearchWorks.workType, workType as any));
        }

        const whereClause = and(...conditions);

        // 3. Handle Pagination
        if (page && limit) {
            const offset = (page - 1) * limit;
            
            const [data, totalResult] = await Promise.all([
                dbInst.select()
                    .from(profileResearchWorks)
                    .where(whereClause)
                    .limit(limit)
                    .offset(offset)
                    .orderBy(desc(profileResearchWorks.publishYear)),
                dbInst.select({ total: count() })
                    .from(profileResearchWorks)
                    .where(whereClause)
            ]);

            const total = Number(totalResult[0].total);

            return {
                data,
                summary,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }

        // 4. If no pagination provided, return all matching records
        const data = await dbInst.select()
            .from(profileResearchWorks)
            .where(whereClause)
            .orderBy(desc(profileResearchWorks.publishYear));

        return {
            data,
            summary
        };
    }

    async createResearchWork(data: any, tx?: any) {
        const res = await (tx || db).insert(profileResearchWorks)
            .values({
                profileId: data.profileId,
                workType: data.workType,
                title: data.title,
                journalName: data.journalName,
                indexing: data.indexing,
                publishYear: data.publishYear,
                doi: data.doi,
                academicYear: data.academicYear,
                status: data.status || 'pending',
                avatarDefault: data.avatarDefault ?? true,
                note: data.note,
                origin: data.origin,
                verifiedBy: data.verifiedBy,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning()
        return res[0]
    }

    async updateResearchWork(id: ID, data: any, tx?: any) {
        const { profileId, ...updateData } = data
        const res = await (tx || db).update(profileResearchWorks)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(profileResearchWorks.id, id))
            .returning()
        return res[0]
    }

    async deleteResearchWork(id: ID, tx?: any) {
        await (tx || db).delete(profileResearchWorks)
            .where(eq(profileResearchWorks.id, id))
    }
}

export const profileSubRepo = new ProfileSubRepo()
