import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, profileStaff, organizationalUnits, workloadAnnualSummaries } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'

const app = createApp()

describe('Workload Integration Tests', () => {
    let authToken: string
    let testUser: any
    let testUnit: any
    let testProfile: any

    beforeEach(async () => {
        await TestDbHelper.clearAllTables()

        // Setup test environment
        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Test Unit',
            code: 'TUNIT',
            unitType: 'faculty'
        }).returning()
        testUnit = unit

        const [user] = await db.insert(users).values({
            username: 'workloaduser',
            email: 'workload@example.com',
            fullName: 'Workload User',
            passwordHash: 'hash',
            isActive: true,
            unitId: testUnit.id
        }).returning()
        testUser = user

        const [profile] = await db.insert(profileStaff).values({
            userId: testUser.id,
            unitId: testUnit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()
        testProfile = profile

        const { accessToken } = issueTokenPair({
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            unitId: testUser.unitId
        })
        authToken = accessToken
    })

    describe('GET /api/v1/workload/me', () => {
        it('should return workload info if user has permission', async () => {
            await grantPermission(testUser.id, PERM.WORKLOAD.SELF_READ)
            
            await db.insert(workloadAnnualSummaries).values({
                profileId: testProfile.id,
                academicYear: '2025-2026',
                totalTeaching: '100' as any,
                quotaTeaching: '200' as any
            })

            const res = await request(app)
                .get('/api/v1/workload/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.summary.totalTeaching).toBe("100")
        })
    })

    describe('POST /api/v1/workload/evidences', () => {
        it('should create workload evidence if user has permission', async () => {
            await grantPermission(testUser.id, PERM.WORKLOAD.WRITE)

            const evidenceData = {
                academic_year: '2025-2026',
                evidence_type: 'teaching',
                title: 'New Class',
                hours_claimed: 30,
                coef_applied: 1
            }

            const res = await request(app)
                .post('/api/v1/workload/evidences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(evidenceData)

            expect(res.status).toBe(201)
            expect(res.body.data.title).toBe(evidenceData.title)
        })
    })
})
