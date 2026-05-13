import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { 
    users, 
    profileStaff, 
    organizationalUnits, 
    roles, 
    userRoles, 
    wfDefinitions, 
    wfInstances,
    rewardCommendations,
    rewardTitles
} from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { grantPermission } from '../helpers/permHelpers'
import { PERM } from '@/constants/permission'
import { WF } from '@/constants/workflowCodes'
import { ROLE } from '@/constants/roles'

const app = createApp()

describe('Reward Approved Workflow E2E Tests', () => {
    let lecturerToken: string
    let cvRewardToken: string
    let hrmDirectorToken: string
    let headmasterToken: string
    
    let lecturer: any
    let cvReward: any
    let hrmDirector: any
    let headmaster: any
    
    let testUnit: any
    let testProfile: any
    let workflowDef: any

    beforeAll(async () => {
        await TestDbHelper.clearAllTables()

        // 1. Setup Unit
        const [unit] = await db.insert(organizationalUnits).values({
            name: 'Faculty of IT',
            code: 'FIT',
            unitType: 'faculty'
        }).returning()
        testUnit = unit

        // 2. Setup Roles
        const roleCodes = [ROLE.LECTURER, ROLE.CV_REWARD, ROLE.HRM_DIRECTOR, ROLE.HEADMASTER]
        const roleMap: Record<string, any> = {}
        
        for (const code of roleCodes) {
            const [role] = await db.insert(roles).values({
                code,
                name: `Role ${code}`
            }).onConflictDoUpdate({ target: roles.code, set: { name: `Role ${code}` } }).returning()
            roleMap[code] = role
        }

        // 3. Setup Users and Tokens
        const setupUser = async (username: string, roleCode: string) => {
            const [user] = await db.insert(users).values({
                username,
                email: `${username}@example.com`,
                fullName: `${username} FullName`,
                passwordHash: 'hash',
                isActive: true,
                unitId: testUnit.id
            }).returning()

            await db.insert(userRoles).values({
                userId: user.id,
                roleId: roleMap[roleCode].id,
                grantedBy: user.id,
                scopeType: 'school'
            })

            const { accessToken } = issueTokenPair({
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                unitId: user.unitId
            })

            return { user, token: accessToken }
        }

        const l = await setupUser('lecturer_user', ROLE.LECTURER)
        lecturer = l.user; lecturerToken = l.token

        const cv = await setupUser('cv_reward_user', ROLE.CV_REWARD)
        cvReward = cv.user; cvRewardToken = cv.token

        const hrm = await setupUser('hrm_director_user', ROLE.HRM_DIRECTOR)
        hrmDirector = hrm.user; hrmDirectorToken = hrm.token

        const hm = await setupUser('headmaster_user', ROLE.HEADMASTER)
        headmaster = hm.user; headmasterToken = hm.token

        // 4. Setup Profile for lecturer
        const [profile] = await db.insert(profileStaff).values({
            userId: lecturer.id,
            unitId: testUnit.id,
            staffType: 'lecturer',
            employmentStatus: 'active'
        }).returning()
        testProfile = profile

        // 5. Setup Workflow Definition
        const [def] = await db.insert(wfDefinitions).values({
            code: WF.REWARD_APPROVED,
            name: 'Quy trình phê duyệt khen thưởng',
            module: 'reward',
            steps: [
                { step: 1, name: 'Khởi tạo đề xuất khen thưởng', role_id: roleMap[ROLE.LECTURER].id, action_type: 'forward', required: true },
                { step: 2, name: 'Chuyên viên thi đua thẩm định', role_id: roleMap[ROLE.CV_REWARD].id, action_type: 'forward', required: true },
                { step: 3, name: 'Trưởng phòng HCNS duyệt', role_id: roleMap[ROLE.HRM_DIRECTOR].id, action_type: 'approve', required: true },
                { step: 4, name: 'Ban Giám hiệu ký quyết định', role_id: roleMap[ROLE.HEADMASTER].id, action_type: 'approve', required: true }
            ]
        }).returning()
        workflowDef = def

        // Force clear cache for workflow definitions to ensure new one is loaded
        const { redis } = await import('@/configs/redis');
        await redis.del(`wf_def:${WF.REWARD_APPROVED}`);

        // Grant necessary permissions
        await grantPermission(lecturer.id, PERM.REWARD.WRITE)
        
        await grantPermission(cvReward.id, PERM.WORKFLOW.READ)
        await grantPermission(cvReward.id, PERM.WORKFLOW.ADVANCE)
        
        await grantPermission(hrmDirector.id, PERM.WORKFLOW.READ)
        await grantPermission(hrmDirector.id, PERM.WORKFLOW.ADVANCE)
        
        await grantPermission(headmaster.id, PERM.WORKFLOW.READ)
        await grantPermission(headmaster.id, PERM.WORKFLOW.ADVANCE)
    })

    it('should complete the full reward approval workflow', async () => {
        // --- STEP 1: Lecturer initiates ---
        const initRes = await request(app)
            .post('/api/v1/reward/commendations')
            .set('Authorization', `Bearer ${lecturerToken}`)
            .send({
                profileId: testProfile.id,
                awardLevel: 'co_so',
                awardName: 'E2E Test Reward',
                academicYear: '2025-2026',
                content: 'Excellent performance'
            })

        if (initRes.status !== 201) {
            console.error('Init failed:', initRes.body);
        }
        expect(initRes.status).toBe(201)
        const workflowId = initRes.body.data.workflowId
        expect(workflowId).toBeDefined()

        // Check instance state: should be at step 2 (CV Reward)
        let inst = await db.query.wfInstances.findFirst({ where: (wf, { eq }) => eq(wf.id, workflowId) })
        expect(inst?.currentStep).toBe(2)
        expect(inst?.status).toBe('in_progress')

        // --- STEP 2: CV Reward forwards ---
        const forwardRes = await request(app)
            .post(`/api/v1/workflow/${workflowId}/advance`)
            .set('Authorization', `Bearer ${cvRewardToken}`)
            .send({
                action: 'forward',
                comment: 'Validated evidences'
            })

        expect(forwardRes.status).toBe(200)
        inst = await db.query.wfInstances.findFirst({ where: (wf, { eq }) => eq(wf.id, workflowId) })
        expect(inst?.currentStep).toBe(3)

        // --- STEP 3: HRM Director approves ---
        const hrmApproveRes = await request(app)
            .post(`/api/v1/workflow/${workflowId}/advance`)
            .set('Authorization', `Bearer ${hrmDirectorToken}`)
            .send({
                action: 'approve',
                comment: 'Content is fine'
            })

        expect(hrmApproveRes.status).toBe(200)
        inst = await db.query.wfInstances.findFirst({ where: (wf, { eq }) => eq(wf.id, workflowId) })
        expect(inst?.currentStep).toBe(4)

        // --- STEP 4: Headmaster final approves ---
        const finalApproveRes = await request(app)
            .post(`/api/v1/workflow/${workflowId}/advance`)
            .set('Authorization', `Bearer ${headmasterToken}`)
            .send({
                action: 'approve',
                comment: 'Officially approved'
            })

        expect(finalApproveRes.status).toBe(200)
        inst = await db.query.wfInstances.findFirst({ where: (wf, { eq }) => eq(wf.id, workflowId) })
        expect(inst?.status).toBe('approved')

        // --- VERIFY: Data should be inserted into reward_commendations table ---
        const commendation = await db.query.rewardCommendations.findFirst({
            where: (c, { eq }) => eq(c.profileId, testProfile.id)
        })
        expect(commendation).toBeDefined()
        expect(commendation?.awardName).toBe('E2E Test Reward')
        expect(commendation?.status).toBe('pending') // Status in table is separate from workflow status
    })

    it('should allow rejection by HRM Director', async () => {
        // --- STEP 1: Lecturer initiates again ---
        const initRes = await request(app)
            .post('/api/v1/reward/titles')
            .set('Authorization', `Bearer ${lecturerToken}`)
            .send({
                profileId: testProfile.id,
                titleName: 'E2E Title',
                titleLevel: 'university',
                awardedYear: '2025'
            })

        const workflowId = initRes.body.data.workflowId

        // --- STEP 2: CV Reward forwards ---
        await request(app)
            .post(`/api/v1/workflow/${workflowId}/advance`)
            .set('Authorization', `Bearer ${cvRewardToken}`)
            .send({ action: 'forward' })

        // --- STEP 3: HRM Director rejects ---
        const rejectRes = await request(app)
            .post(`/api/v1/workflow/${workflowId}/advance`)
            .set('Authorization', `Bearer ${hrmDirectorToken}`)
            .send({
                action: 'reject',
                comment: 'Ineligible criteria'
            })

        expect(rejectRes.status).toBe(200)
        const inst = await db.query.wfInstances.findFirst({ where: (wf, { eq }) => eq(wf.id, workflowId) })
        expect(inst?.status).toBe('rejected')

        // --- VERIFY: No record should be inserted into reward_titles ---
        const title = await db.query.rewardTitles.findFirst({
            where: (t, { eq }) => eq(t.titleName, 'E2E Title')
        })
        expect(title).toBeUndefined()
    })
})
