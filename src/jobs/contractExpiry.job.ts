import { buildContractExpiryPayload } from '../utils/notification'
import { db } from '@/configs/db'
import { recruitmentContracts, profileStaff, users, userRoles, roles } from '@/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { notificationService } from '@/services/notification.service'

export async function contractExpiryJob(): Promise<void> {
  const rows = await db.select({
    id: recruitmentContracts.id,
    profileId: recruitmentContracts.profileId,
    contractNumber: recruitmentContracts.contractNumber,
    endDate: recruitmentContracts.endDate,
    fullName: users.fullName
  })
  .from(recruitmentContracts)
  .innerJoin(profileStaff, eq(profileStaff.id, recruitmentContracts.profileId))
  .innerJoin(users, eq(users.id, profileStaff.userId))
  .where(and(
    eq(recruitmentContracts.status, 'active'),
    sql`${recruitmentContracts.endDate} = CURRENT_DATE + INTERVAL '30 days'`
  ))

  const hrm = await db.select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(inArray(roles.code, ['cv_hrm', 'hrm_director']))

  const hrmUserIds = Array.from(new Set(hrm.map(h => h.userId)))

  for (const row of rows) {
    const payload = buildContractExpiryPayload({ 
        fullName: row.fullName, 
        contractNumber: row.contractNumber ?? '', 
        endDate: row.endDate ? new Date(row.endDate) : new Date(), 
        profileId: row.profileId 
    })
    await notificationService.enqueueBulk(hrmUserIds.map(uid => ({ 
        templateCode: 'contract_expiry_30d', 
        recipientId: uid, 
        resourceType: 'contract', 
        resourceId: row.id, 
        payload 
    })))
  }
}
