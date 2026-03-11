import { startNotificationWorker } from './notificationWorker.job'
import { startSalaryGradeDueJob } from './salaryGradeDue.job'
import { appointmentExpiryJob } from './appointmentExpiry.job'
import { contractExpiryJob } from './contractExpiry.job'

export const startJobs = () => {
    startNotificationWorker()
    startSalaryGradeDueJob()
    appointmentExpiryJob()
    contractExpiryJob()
}
