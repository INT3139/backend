import { workflowExpiryJob } from '@/jobs/workflowExpiry.job'
import { db } from '@/configs/db'
import { wfDefinitions, wfInstances, users, wfStepLogs } from '@/db/schema'
import { TestDbHelper } from '../helpers/testHelpers'
import { eq, sql } from 'drizzle-orm'

describe('workflowExpiryJob', () => {
  let testUser: any

  beforeEach(async () => {
    await TestDbHelper.clearAllTables()
    const [user] = await db.insert(users).values({
      id: 171, // Matches SYSTEM_ACTOR_ID
      username: 'sys_admin',
      email: 'sysadmin@vnu.edu.vn',
      fullName: 'System Admin',
      passwordHash: 'hash',
    }).returning()
    testUser = user

    await db.insert(wfDefinitions).values({
      id: 1,
      code: 'test_wf',
      name: 'Test Workflow',
      module: 'test',
      steps: [
        { step: 1, name: 'Step 1', role_id: null, action_type: 'forward' },
        { step: 2, name: 'Step 2', role_id: null, action_type: 'approve' }
      ]
    })
  })

  it('should cancel overdue in_progress workflows', async () => {
    // Create an overdue instance
    const [overdueInst] = await db.insert(wfInstances).values({
      definitionId: 1,
      resourceType: 'test',
      resourceId: 101,
      initiatedBy: testUser.id,
      status: 'in_progress',
      currentStep: 2,
      dueAt: sql`NOW() - INTERVAL '1 day'`,
    }).returning()

    // Create a non-overdue instance
    const [activeInst] = await db.insert(wfInstances).values({
      definitionId: 1,
      resourceType: 'test',
      resourceId: 102,
      initiatedBy: testUser.id,
      status: 'in_progress',
      currentStep: 2,
      dueAt: sql`NOW() + INTERVAL '1 day'`,
    }).returning()

    // Create an overdue but already completed instance
    const [completedInst] = await db.insert(wfInstances).values({
      definitionId: 1,
      resourceType: 'test',
      resourceId: 103,
      initiatedBy: testUser.id,
      status: 'approved',
      currentStep: 2,
      dueAt: sql`NOW() - INTERVAL '1 day'`,
    }).returning()

    await workflowExpiryJob()

    // Verify overdue instance is cancelled
    const [updatedOverdue] = await db.select().from(wfInstances).where(eq(wfInstances.id, overdueInst.id))
    expect(updatedOverdue.status).toBe('cancelled')
    expect(updatedOverdue.completedAt).not.toBeNull()

    // Verify log entry
    const logs = await db.select().from(wfStepLogs).where(eq(wfStepLogs.instanceId, overdueInst.id))
    expect(logs).toHaveLength(1)
    expect(logs[0].stepName).toBe('Cancelled')
    expect(logs[0].comment).toContain('Tự động hủy do quá hạn')

    // Verify active instance remains unchanged
    const [updatedActive] = await db.select().from(wfInstances).where(eq(wfInstances.id, activeInst.id))
    expect(updatedActive.status).toBe('in_progress')

    // Verify completed instance remains unchanged
    const [updatedCompleted] = await db.select().from(wfInstances).where(eq(wfInstances.id, completedInst.id))
    expect(updatedCompleted.status).toBe('approved')
  })
})
