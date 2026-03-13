import { buildContractExpiryPayload } from '../utils/notification'
import { query } from '@/configs/db'
import { notificationService } from '@/services/notification.service'

export async function contractExpiryJob(): Promise<void> {
  const rows = await query<any>(`SELECT rc.id,rc.profile_id,rc.contract_number,rc.end_date,cu.full_name FROM recruitment_contracts rc JOIN profile_staff ps ON ps.id=rc.profile_id JOIN users cu ON cu.id=ps.user_id WHERE rc.status='active' AND rc.end_date=CURRENT_DATE+INTERVAL '30 days'`)
  const hrm = await query<{ user_id: string }>(`SELECT DISTINCT ur.user_id FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE r.code IN ('cv_hrm','hrm_director')`)
  for (const row of rows) {
    const payload = buildContractExpiryPayload({ fullName: row.full_name, contractNumber: row.contract_number, endDate: row.end_date, profileId: row.profile_id })
    await notificationService.enqueueBulk(hrm.map(h => ({ templateCode: 'contract_expiry_30d', recipientId: h.user_id, resourceType: 'contract', resourceId: row.id, payload })))
  }
}
