import { startNotificationWorker } from './notificationWorker.job'
import { startSalaryGradeDueJob } from './salaryGradeDue.job'
import { appointmentExpiryJob } from './appointmentExpiry.job'
import { contractExpiryJob } from './contractExpiry.job'
import cron from 'node-cron'
import { logger } from '@/configs/logger'

interface JobInfo {
    name: string
    schedule: string
    lastRunAt?: Date
    handler: () => Promise<void>
}

class SchedulerService {
    private registry = new Map<string, JobInfo>()

    register(name: string, schedule: string, handler: () => Promise<void>) {
        this.registry.set(name, { name, schedule, handler })
        cron.schedule(schedule, async () => {
            const job = this.registry.get(name)!
            job.lastRunAt = new Date()
            try {
                await handler()
                logger.info(`Job '${name}' completed`)
            } catch (err) {
                logger.error(`Job '${name}' failed`, { err })
            }
        })
    }

    getJobs() {
        return Array.from(this.registry.values()).map(({ name, schedule, lastRunAt }) => ({
            name, schedule, lastRunAt
        }))
    }

    async trigger(name: string) {
        const job = this.registry.get(name)
        if (!job) throw new Error(`Job '${name}' not found`)
        job.lastRunAt = new Date()
        await job.handler()
    }
}

export const schedulerService = new SchedulerService()

export const startJobs = () => {

    schedulerService.register('notification-worker', '* * * * *', async () => {
        await startNotificationWorker()
    })

    schedulerService.register('salary-grade-due', '* * * * *', async () => {
        await startSalaryGradeDueJob()
    })

    schedulerService.register('expiry-jobs', '0 1 * * *', async () => {
        await appointmentExpiryJob()
        await contractExpiryJob()
        logger.info('Expiry jobs completed')
    })
}
