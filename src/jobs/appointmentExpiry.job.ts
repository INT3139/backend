import { buildAppointmentExpiryPayload } from '../utils/notification'
import { db } from '@/configs/db'
import { appointmentRecords, profileStaff, users, userRoles, roles } from '@/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { notificationService } from '@/services/notification.service'

export async function appointmentExpiryJob(): Promise<void> {
  const rows = await db.select({
    id: appointmentRecords.id,
    profileId: appointmentRecords.profileId,
    positionName: appointmentRecords.positionName,
    endDate: appointmentRecords.endDate,
    fullName: users.fullName
  })
  .from(appointmentRecords)
  .innerJoin(profileStaff, eq(profileStaff.id, appointmentRecords.profileId))
  .innerJoin(users, eq(users.id, profileStaff.userId))
  .where(and(
    eq(appointmentRecords.status, 'active'),
    sql`${appointmentRecords.endDate} = CURRENT_DATE + INTERVAL '90 days'`
  ))

  const hrm = await db.select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(inArray(roles.code, ['cv_hrm', 'hrm_director']))

  const hrmUserIds = Array.from(new Set(hrm.map(h => h.userId)))

  for (const row of rows) {
    const payload = buildAppointmentExpiryPayload({ 
        fullName: row.fullName, 
        positionName: row.positionName ?? '', 
        endDate: row.endDate ? new Date(row.endDate) : new Date(), 
        profileId: row.profileId 
    })
    await notificationService.enqueueBulk(hrmUserIds.map(uid => ({ 
        templateCode: 'term_expiry_90d', 
        recipientId: uid, 
        resourceType: 'appointment', 
        resourceId: row.id, 
        payload 
    })))
  }
}
