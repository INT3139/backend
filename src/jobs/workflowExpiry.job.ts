import { db } from '@/configs/db'
import { wfInstances } from '@/db/schema/workflow'
import { and, eq, lt, sql } from 'drizzle-orm'
import { workflowEngine } from '@/core/workflow/engine'
import { logger } from '@/configs/logger'

export async function workflowExpiryJob(): Promise<void> {
  const SYSTEM_ACTOR_ID = 171; // sys_admin from datatemp/users.json
  const REASON = 'Tự động hủy do quá hạn xử lý (4 tuần)';

  try {
    const overdueInstances = await db
      .select({ id: wfInstances.id })
      .from(wfInstances)
      .where(
        and(
          eq(wfInstances.status, 'in_progress'),
          lt(wfInstances.dueAt, sql`NOW()`)
        )
      );

    logger.info(`Found ${overdueInstances.length} overdue workflows to cancel`);

    for (const inst of overdueInstances) {
      try {
        await workflowEngine.cancel(inst.id, SYSTEM_ACTOR_ID, REASON);
        logger.info(`Cancelled overdue workflow instance ${inst.id}`);
      } catch (error) {
        logger.error(`Failed to cancel workflow instance ${inst.id}`, { error });
      }
    }
  } catch (error) {
    logger.error('Error in workflowExpiryJob', { error });
  }
}
