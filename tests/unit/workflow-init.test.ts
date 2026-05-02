import { workflowEngine } from '@/core/workflow/engine'
import { db } from '@/configs/db'
import { wfDefinitions, wfInstances, users } from '@/db/schema'
import { TestDbHelper } from '../helpers/testHelpers'
import { eq } from 'drizzle-orm'

describe('WorkflowEngine.initiate', () => {
  let testUser: any

  beforeEach(async () => {
    await TestDbHelper.clearAllTables()
    const [user] = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      passwordHash: 'hash',
    }).returning()
    testUser = user

    await db.insert(wfDefinitions).values({
      code: 'test_wf',
      name: 'Test Workflow',
      module: 'test',
      steps: [
        { step: 1, name: 'Step 1', role_id: null, action_type: 'forward' },
        { step: 2, name: 'Step 2', role_id: null, action_type: 'approve' }
      ]
    })
  })

  it('should set a default 4-week dueAt if not provided', async () => {
    const payload = {
      definitionCode: 'test_wf',
      resourceType: 'test_resource',
      resourceId: 1,
      initiatedBy: testUser.id,
    }

    const inst = await workflowEngine.initiate(payload)

    // Retrieve from DB to be sure
    const [dbInst] = await db.select().from(wfInstances).where(eq(wfInstances.id, inst.id))

    expect(dbInst.dueAt).toBeDefined()
    expect(dbInst.dueAt).not.toBeNull()

    const now = new Date()
    const fourWeeksLater = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)
    
    // Check if it's approximately 4 weeks (within 5 seconds margin)
    const diff = Math.abs(dbInst.dueAt!.getTime() - fourWeeksLater.getTime())
    expect(diff).toBeLessThan(5000)
  })

  it('should respect the provided dueAt if present', async () => {
    const customDueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    const payload = {
      definitionCode: 'test_wf',
      resourceType: 'test_resource',
      resourceId: 2,
      initiatedBy: testUser.id,
      dueAt: customDueAt
    }

    const inst = await workflowEngine.initiate(payload)
    const [dbInst] = await db.select().from(wfInstances).where(eq(wfInstances.id, inst.id))

    expect(dbInst.dueAt!.getTime()).toBe(customDueAt.getTime())
  })
})
