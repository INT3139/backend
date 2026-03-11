import cron from 'node-cron'
import { query } from '@/configs/db'
import { notificationService } from '@/services/notification.service'
import { logger } from '@/configs/logger'
import { UUID } from '@/types'

export const startSalaryGradeDueJob = () => {
    // Run every day at 00:00
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info('Running salary grade due job...')
            
            // Find users whose next_grade_date is exactly 30 days from now
            const rows = await query<{ profile_id: UUID, user_id: UUID, full_name: string, next_grade_date: Date }>(
                `SELECT s.profile_id, p.user_id, p.full_name, s.next_grade_date 
                 FROM salary_info s
                 JOIN profile_staff p ON s.profile_id = p.id
                 WHERE s.next_grade_date = CURRENT_DATE + INTERVAL '30 days'`
            )
            
            for (const row of rows) {
                if (!row.user_id) continue;
                
                await notificationService.enqueue({
                    templateCode: 'salary_grade_due',
                    recipientId: row.user_id,
                    resourceType: 'salary',
                    resourceId: row.profile_id,
                    payload: {
                        fullName: row.full_name,
                        nextGradeDate: row.next_grade_date
                    }
                })
                logger.info(`Enqueued salary_grade_due notification for user ${row.user_id}`)
            }
            logger.info(`Processed ${rows.length} salary grade due records.`)
        } catch (error) {
            logger.error('Error in salary grade due job', { error })
        }
    })
    logger.info('Salary grade due job scheduled')
}
