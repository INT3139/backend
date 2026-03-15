import { startNotificationWorker } from './notificationWorker.job'
import { startSalaryGradeDueJob } from './salaryGradeDue.job'
import { appointmentExpiryJob } from './appointmentExpiry.job'
import { contractExpiryJob } from './contractExpiry.job'
import cron from 'node-cron'
import { logger } from '@/configs/logger'

export const startJobs = () => {
    startNotificationWorker()
    startSalaryGradeDueJob()
    // Wrap trong cron schedule — chạy mỗi ngày lúc 1AM
    cron.schedule('0 1 * * *', async () => {
        try {
            await appointmentExpiryJob()
            await contractExpiryJob()
            logger.info('Expiry jobs completed')
        } catch (err) {
            logger.error('Expiry job failed', { err })
        }
    })
}