import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, profileStaff, organizationalUnits, rewardCommendations } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'

const app = createApp()

describe('Reward Integration Tests', () => {
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
            username: 'rewarduser',
            email: 'reward@example.com',
            fullName: 'Reward User',
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

    describe('POST /api/v1/reward/commendations', () => {
        it('should fail if using snake_case fields', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            const res = await request(app)
                .post('/api/v1/reward/commendations')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profile_id: testProfile.id,
                    award_level: 'co_so',
                    award_name: 'Test Reward'
                })

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error.message).toBe('Invalid body')
            expect(res.body.error.fields).toHaveProperty('profileId')
            expect(res.body.error.fields).toHaveProperty('awardLevel')
            expect(res.body.error.fields).toHaveProperty('awardName')
        })

        it('should succeed if using camelCase fields', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            const res = await request(app)
                .post('/api/v1/reward/commendations')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileId: testProfile.id,
                    awardLevel: 'co_so',
                    awardName: 'Test Reward',
                    academicYear: '2025-2026'
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data.proposedData.profileId).toBe(testProfile.id)
            expect(res.body.data).toHaveProperty('workflowId')
        })

        it('should succeed even with null values for optional fields', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            const res = await request(app)
                .post('/api/v1/reward/commendations')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileId: testProfile.id,
                    awardLevel: 'co_so',
                    awardName: 'Test Reward',
                    decisionNumber: null,
                    decisionDate: null,
                    academicYear: null,
                    content: null
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
        })

        it('should succeed with YYYY format for academicYear', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            const res = await request(app)
                .post('/api/v1/reward/commendations')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileId: testProfile.id,
                    awardLevel: 'co_so',
                    awardName: 'Test Reward YYYY',
                    academicYear: '2025'
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
        })
    })

    describe('PUT /api/v1/reward/commendations/:id', () => {
        it('should succeed with null values for optional fields during update', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            // Direct insert into DB to bypass workflow for testing update if needed, 
            // or just use the created one if update is direct.
            // Based on routes, PUT /commendations/:id is direct controller.updateCommendation
            
            const [commendation] = await db.insert(rewardCommendations).values({
                profileId: testProfile.id,
                awardLevel: 'co_so',
                awardName: 'Initial Reward',
                decisionNumber: '123'
            }).returning()

            const res = await request(app)
                .put(`/api/v1/reward/commendations/${commendation.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    decisionNumber: null,
                    content: null
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.decisionNumber).toBeNull()
        })
    })

    describe('POST /api/v1/reward/titles', () => {
        it('should succeed with camelCase fields', async () => {
            await grantPermission(testUser.id, PERM.REWARD.WRITE)

            const res = await request(app)
                .post('/api/v1/reward/titles')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileId: testProfile.id,
                    titleName: 'Chien si thi dua',
                    titleLevel: 'university',
                    awardedYear: '2025'
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data.proposedData.profileId).toBe(testProfile.id)
        })
    })

    describe('POST /api/v1/reward/discipline', () => {
        it('should succeed with camelCase fields', async () => {
            await grantPermission(testUser.id, PERM.REWARD.DISCIPLINE)

            const res = await request(app)
                .post('/api/v1/reward/discipline')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileId: testProfile.id,
                    disciplineType: 'khien_trach',
                    reason: 'Test reason',
                    decisionNumber: '123/QD-VNU',
                    unitName: 'UET',
                    issuedDate: '2025-01-01'
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data.profileId).toBe(testProfile.id)
        })
    })
})
