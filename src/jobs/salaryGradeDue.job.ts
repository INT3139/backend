import cron from 'node-cron'
import { db } from '@/configs/db'
import { salaryInfo, profileStaff, users } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { notificationService } from '@/services/notification.service'
import { logger } from '@/configs/logger'

export const startSalaryGradeDueJob = () => {
    // Run every day at 00:00
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info('Running salary grade due job...')
            
            // Find users whose nextGradeDate is exactly 30 days from now
            const rows = await db.select({
                profileId: salaryInfo.profileId,
                userId: profileStaff.userId,
                fullName: users.fullName,
                nextGradeDate: salaryInfo.nextGradeDate
            })
            .from(salaryInfo)
            .innerJoin(profileStaff, eq(profileStaff.id, salaryInfo.profileId))
            .innerJoin(users, eq(users.id, profileStaff.userId))
            .where(sql`${salaryInfo.nextGradeDate} = CURRENT_DATE + INTERVAL '30 days'`)
            
            for (const row of rows) {
                if (!row.userId) continue;
                
                await notificationService.enqueue({
                    templateCode: 'salary_grade_due',
                    recipientId: row.userId,
                    resourceType: 'salary',
                    resourceId: row.profileId,
                    payload: {
                        fullName: row.fullName ?? '',
                        nextGradeDate: row.nextGradeDate
                    }
                })
                logger.info(`Enqueued salary_grade_due notification for user ${row.userId}`)
            }
            logger.info(`Processed ${rows.length} salary grade due records.`)
        } catch (error) {
            logger.error('Error in salary grade due job', { error })
        }
    })
    logger.info('Salary grade due job scheduled')
}
