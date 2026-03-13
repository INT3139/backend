import { buildAppointmentExpiryPayload } from '../utils/notification'
import { query } from '@/configs/db'
import { notificationService } from '@/services/notification.service'

export async function appointmentExpiryJob(): Promise<void> {
  const rows = await query<any>(`SELECT ar.id,ar.profile_id,ar.position_name,ar.end_date,cu.full_name FROM appointment_records ar JOIN profile_staff ps ON ps.id=ar.profile_id JOIN users cu ON cu.id=ps.user_id WHERE ar.status='active' AND ar.end_date=CURRENT_DATE+INTERVAL '90 days'`)
  const hrm = await query<{ user_id: string }>(`SELECT DISTINCT ur.user_id FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE r.code IN ('cv_hrm','hrm_director')`)
  for (const row of rows) {
    const payload = buildAppointmentExpiryPayload({ fullName: row.full_name, positionName: row.position_name, endDate: row.end_date, profileId: row.profile_id })
    await notificationService.enqueueBulk(hrm.map(h => ({ templateCode: 'term_expiry_90d', recipientId: h.user_id, resourceType: 'appointment', resourceId: row.id, payload })))
  }
}
