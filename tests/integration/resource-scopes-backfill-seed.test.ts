import fs from 'node:fs'
import path from 'node:path'
import { sql, and, eq } from 'drizzle-orm'
import { db } from '@/configs/db'
import {
    organizationalUnits,
    profileStaff,
    recruitmentContracts,
    recruitmentProposals,
    resourceScopes,
    rewardCommendations,
    rewardDisciplinaryRecords,
    rewardTitles,
    salaryInfo,
    salaryUpgradeProposals,
    users,
    workloadEvidences
} from '@/db/schema'
import { TestDbHelper } from '../helpers/testHelpers'

describe('Seed 13 resource scope backfill', () => {
    beforeEach(async () => {
        await TestDbHelper.clearAllTables()
    })

    it('creates scopes for all key seeded resources and is idempotent', async () => {
        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Backfill Faculty',
            code: 'BF_FAC',
            unitType: 'faculty'
        }).returning()

        const [owner] = await db.insert(users).values({
            username: 'backfill_owner',
            email: 'backfill_owner@example.com',
            fullName: 'Backfill Owner',
            passwordHash: 'hash',
            unitId: unit.id,
            isActive: true
        }).returning()

        const [creator] = await db.insert(users).values({
            username: 'backfill_creator',
            email: 'backfill_creator@example.com',
            fullName: 'Backfill Creator',
            passwordHash: 'hash',
            unitId: unit.id,
            isActive: true
        }).returning()

        const [profile] = await db.insert(profileStaff).values({
            userId: owner.id,
            unitId: unit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()

        await db.insert(salaryInfo).values({
            profileId: profile.id,
            salaryGrade: 2,
            salaryCoefficient: '2.34' as any
        })

        const [salaryUpgrade] = await db.insert(salaryUpgradeProposals).values({
            profileId: profile.id,
            proposedGrade: 3,
            proposedCoefficient: '2.67' as any,
            proposedNextDate: '2026-01-01' as any,
            status: 'pending'
        }).returning()

        const [proposal] = await db.insert(recruitmentProposals).values({
            proposingUnit: unit.id,
            positionName: 'Lecturer',
            requiredDegree: 'master',
            quota: 1,
            academicYear: '2025-2026',
            createdBy: creator.id,
            status: 'pending'
        }).returning()

        const [contract] = await db.insert(recruitmentContracts).values({
            profileId: profile.id,
            contractType: 'fixed_term',
            startDate: '2025-01-01' as any,
            endDate: '2026-01-01' as any,
            recruitingUnitId: unit.id,
            createdBy: creator.id,
            status: 'draft'
        }).returning()

        const [commendation] = await db.insert(rewardCommendations).values({
            profileId: profile.id,
            awardLevel: 'dhqg',
            awardName: 'Best Lecturer',
            status: 'approved'
        }).returning()

        const [title] = await db.insert(rewardTitles).values({
            profileId: profile.id,
            titleName: 'Teacher of the Year',
            titleLevel: 'university',
            awardedYear: '2025',
            status: 'approved'
        }).returning()

        const [discipline] = await db.insert(rewardDisciplinaryRecords).values({
            profileId: profile.id,
            disciplineType: 'khien_trach',
            reason: 'Missing deadline',
            issuedDate: '2025-01-01' as any,
            status: 'approved'
        }).returning()

        const [evidence] = await db.insert(workloadEvidences).values({
            profileId: profile.id,
            academicYear: '2025-2026',
            evidenceType: 'other_task',
            title: 'Committee work',
            status: 'approved'
        }).returning()

        const seedPath = path.resolve(process.cwd(), 'src/db/seeds/13_resource_scopes_backfill.sql')
        const seedSql = fs.readFileSync(seedPath, 'utf8')

        await db.execute(sql.raw(seedSql))
        await db.execute(sql.raw(seedSql))

        const scopes = await db.select().from(resourceScopes)
        const keySet = new Set(scopes.map((s) => `${s.resourceType}:${s.resourceId}`))

        expect(keySet.has(`profile:${profile.id}`)).toBe(true)
        expect(keySet.has(`salary:${profile.id}`)).toBe(true)
        expect(keySet.has(`salary_upgrade:${salaryUpgrade.id}`)).toBe(true)
        expect(keySet.has(`recruitment_proposal:${proposal.id}`)).toBe(true)
        expect(keySet.has(`contract:${contract.id}`)).toBe(true)
        expect(keySet.has(`reward_commendation:${commendation.id}`)).toBe(true)
        expect(keySet.has(`reward_title:${title.id}`)).toBe(true)
        expect(keySet.has(`reward_discipline:${discipline.id}`)).toBe(true)
        expect(keySet.has(`workload_evidence:${evidence.id}`)).toBe(true)

        const [salaryScope] = await db
            .select()
            .from(resourceScopes)
            .where(
                and(
                    eq(resourceScopes.resourceType, 'salary'),
                    eq(resourceScopes.resourceId, profile.id)
                )
            )
            .limit(1)

        expect(salaryScope).toBeDefined()
        expect(salaryScope.ownerId).toBe(owner.id)
        expect(salaryScope.unitId).toBe(unit.id)
    })
})
