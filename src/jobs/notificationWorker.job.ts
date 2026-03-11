import cron from 'node-cron'
import { notificationService } from '@/services/notification.service'
import { logger } from '@/configs/logger'

export const startNotificationWorker = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const { sent, failed } = await notificationService.flushPending()
            if (sent > 0 || failed > 0) {
                logger.info(`Notification worker processed: ${sent} sent, ${failed} failed`)
            }
        } catch (error) {
            logger.error('Error in notification worker', { error })
        }
    })
    logger.info('Notification worker started')
}
