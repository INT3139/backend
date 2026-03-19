import request from 'supertest'
import { createApp } from '@/app'
import { db } from '@/configs/db'
import { users, roles, userRoles, wfDefinitions, wfInstances } from '@/db/schema'
import { issueTokenPair } from '@/core/auth/jwt'
import { TestDbHelper } from '../helpers/testHelpers'
import { PERM } from '@/constants/permission'
import { grantPermission } from '../helpers/permHelpers'

const app = createApp()

describe('Workflow Integration Tests', () => {
    let authToken: string
    let testUser: any
    let testRole: any

    beforeEach(async () => {
        await TestDbHelper.clearAllTables()

        // 1. Setup User
        const [user] = await db.insert(users).values({
            username: 'wfuser',
            email: 'wf@example.com',
            fullName: 'WF User',
            passwordHash: 'hash',
            isActive: true
        }).returning()
        testUser = user

        // 2. Setup Role
        const [role] = await db.insert(roles).values({
            code: 'approver_role',
            name: 'Approver Role'
        }).returning()
        testRole = role

        // 3. Assign Role to User
        await db.insert(userRoles).values({
            userId: testUser.id,
            roleId: testRole.id,
            grantedBy: testUser.id,
            scopeType: 'school'
        })

        // 4. Grant Permission to see tasks
        await grantPermission(testUser.id, PERM.WORKFLOW.READ)

        const { accessToken } = issueTokenPair({
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            unitId: testUser.unitId || null
        })
        authToken = accessToken
    })

    describe('GET /api/v1/workflow/tasks', () => {
        it('should return tasks assigned to the user role', async () => {
            // 5. Create Workflow Definition
            const [def] = await db.insert(wfDefinitions).values({
                code: 'test_wf',
                name: 'Test Workflow',
                module: 'test',
                steps: [
                    { step: 1, name: 'Step 1', role_id: null, action_type: 'forward' },
                    { step: 2, name: 'Step 2', role_id: testRole.id, action_type: 'approve' }
                ]
            }).returning()

            // 6. Create Workflow Instance at Step 2
            await db.insert(wfInstances).values({
                definitionId: def.id,
                resourceType: 'test_resource',
                resourceId: 123,
                initiatedBy: testUser.id,
                status: 'in_progress',
                currentStep: 2
            })

            const res = await request(app)
                .get('/api/v1/workflow/tasks')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toHaveLength(1)
            expect(res.body.data[0].instance.currentStep).toBe(2)
        })

        it('should return empty if no tasks for user role', async () => {
            // 5. Create Workflow Definition with different role
            const [def] = await db.insert(wfDefinitions).values({
                code: 'test_wf_2',
                name: 'Test Workflow 2',
                module: 'test',
                steps: [
                    { step: 1, name: 'Step 1', role_id: null, action_type: 'forward' },
                    { step: 2, name: 'Step 2', role_id: 999999, action_type: 'approve' }
                ]
            }).returning()

            // 6. Create Workflow Instance at Step 2
            await db.insert(wfInstances).values({
                definitionId: def.id,
                resourceType: 'test_resource',
                resourceId: 124,
                initiatedBy: testUser.id,
                status: 'in_progress',
                currentStep: 2
            })

            const res = await request(app)
                .get('/api/v1/workflow/tasks')
                .set('Authorization', `Bearer ${authToken}`)

            expect(res.status).toBe(200)
            expect(res.body.data).toHaveLength(0)
        })
    })
})
