import request from 'supertest'
import JSZip from 'jszip'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, profileStaff, organizationalUnits, rewardCommendations, salaryInfo, recruitmentInfo, recruitmentContracts, profileResearchWorks } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'

const app = createApp()
const binaryParser = (_res: any, callback: (err: Error | null, body: Buffer) => void) => {
    const chunks: Buffer[] = []
    _res.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
    _res.on('end', () => callback(null, Buffer.concat(chunks)))
}

const readDocumentXml = async (buffer: Buffer): Promise<string> => {
    const zip = await JSZip.loadAsync(buffer)
    return zip.file('word/document.xml')?.async('string') || ''
}

describe('Profile Integration Tests', () => {
    let authToken: string
    let testUser: any
    let testUnit: any

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
            username: 'profileuser',
            email: 'profile@example.com',
            fullName: 'Profile User',
            passwordHash: 'hash',
            isActive: true,
            unitId: testUnit.id
        }).returning()
        testUser = user

        const { accessToken } = issueTokenPair({
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            unitId: testUser.unitId
        })
        authToken = accessToken

        await grantPermission(testUser.id, PERM.PROFILE.READ)
    })

    describe('GET /api/v1/profiles/me', () => {
        it('should return null if profile does not exist for current user', async () => {
            const res = await request(app)
                .get('/api/v1/profiles/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toBeNull()
        })

        it('should return profile if exists', async () => {
            await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active'
            })

            const res = await request(app)
                .get('/api/v1/profiles/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).not.toBeNull()
            expect(res.body.data.userId).toBe(testUser.id)
        })

        it('should return reward, salary and recruitment data if user has permission', async () => {
            const [profile] = await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active'
            }).returning()

            // Insert mock data
            await db.insert(rewardCommendations).values({
                profileId: profile.id,
                awardName: 'Test Award',
                awardLevel: 'co_so' as any,
                decisionDate: '2025-01-01'
            })

            await db.insert(salaryInfo).values({
                profileId: profile.id,
                salaryGrade: 1,
                salaryCoefficient: '2.34' as any
            })

            await db.insert(recruitmentInfo).values({
                profileId: profile.id,
                recruitmentDate: '2024-01-01'
            })

            await db.insert(recruitmentContracts).values({
                profileId: profile.id,
                contractType: 'fixed_term' as any,
                startDate: '2024-01-01',
                status: 'active' as any
            })

            // Grant permissions
            await grantPermission(testUser.id, PERM.REWARD.SELF_READ)
            await grantPermission(testUser.id, PERM.SALARY.SELF_READ)
            await grantPermission(testUser.id, PERM.RECRUITMENT.SELF_READ)

            const res = await request(app)
                .get('/api/v1/profiles/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.rewards.commendations).toHaveLength(1)
            expect(res.body.data.rewards.commendations[0].awardName).toBe('Test Award')
            expect(res.body.data.salary.salaryGrade).toBe(1)
            expect(res.body.data.recruitment.info.recruitmentDate).toBe('2024-01-01')
            expect(res.body.data.recruitment.contracts).toHaveLength(1)
        })

        it('should NOT return reward, salary and recruitment data if user lacks permission', async () => {
            const [profile] = await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active'
            }).returning()

            // Insert mock data
            await db.insert(rewardCommendations).values({
                profileId: profile.id,
                awardName: 'Test Award',
                awardLevel: 'co_so' as any,
                decisionDate: '2025-01-01'
            })

            const res = await request(app)
                .get('/api/v1/profiles/me')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data.rewards).toBeNull()
            expect(res.body.data.salary).toBeNull()
            expect(res.body.data.recruitment).toBeNull()
        })

        it('should export 2C profile as docx', async () => {
            await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active',
                gender: 'Nam' as any
            })

            const res = await request(app)
                .get('/api/v1/profiles/me/export')
                .set('Authorization', `Bearer ${authToken}`)
                .buffer(true)
                .parse(binaryParser)

            expect(res.status).toBe(200)
            expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            expect(res.headers['content-disposition']).toContain('LyLich_2C_')
            expect(Buffer.isBuffer(res.body)).toBe(true)
            expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK')
            const documentXml = await readDocumentXml(res.body as Buffer)
            expect(documentXml).toContain('AUTO DATA WRAP')
            expect(documentXml).toContain('Profile User')
        })

        it('should export scientific profile as docx', async () => {
            const [profile] = await db.insert(profileStaff).values({
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'test@vnu.edu.vn',
                staffType: 'lecturer',
                employmentStatus: 'active',
                gender: 'Nam' as any
            }).returning()

            await db.insert(profileResearchWorks).values({
                profileId: profile.id,
                workType: 'journal_paper' as any,
                title: 'Scientific export paper',
                publishYear: 2025,
                journalName: 'UET Journal',
                indexing: 'Scopus',
                extra: {}
            })

            const res = await request(app)
                .get('/api/v1/profiles/me/export-scientific')
                .set('Authorization', `Bearer ${authToken}`)
                .buffer(true)
                .parse(binaryParser)

            expect(res.status).toBe(200)
            expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            expect(res.headers['content-disposition']).toContain('LyLichKhoaHoc_')
            expect(Buffer.isBuffer(res.body)).toBe(true)
            expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK')
            const documentXml = await readDocumentXml(res.body as Buffer)
            expect(documentXml).toContain('AUTO DATA WRAP')
            expect(documentXml).toContain('Scientific export paper')
        })
    })

    describe('POST /api/v1/profiles', () => {
        it('should create a new profile if user has permission', async () => {
            await grantPermission(testUser.id, PERM.PROFILE.WRITE)

            const profileData = {
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'new@vnu.edu.vn',
                gender: 'Nam',
                staffType: 'lecturer'
            }

            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)

            expect(res.status).toBe(201)
            expect(res.body.data.emailVnu).toBe(profileData.emailVnu)
        })

        it('should return 403 if user lacks permission', async () => {
            const profileData = {
                userId: testUser.id,
                unitId: testUnit.id,
                emailVnu: 'no-perm@vnu.edu.vn'
            }

            const res = await request(app)
                .post('/api/v1/profiles')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)

            expect(res.status).toBe(403)
        })
    })
})
