export const renderTemplate = (tpl: string, data: Record<string, unknown>) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => String(data[k] ?? ''))

export const buildAppointmentExpiryPayload = (a: { fullName: string; positionName: string; endDate: Date|string; profileId: string }) => ({
  full_name: a.fullName, position_name: a.positionName, end_date: String(a.endDate),
  days_left: Math.ceil((new Date(a.endDate).getTime() - Date.now()) / 86_400_000), profile_id: a.profileId,
})

export const buildContractExpiryPayload = (c: { fullName: string; contractNumber: string; endDate: Date|string; profileId: string }) => ({
  full_name: c.fullName, contract_number: c.contractNumber, end_date: String(c.endDate),
  days_left: Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86_400_000), profile_id: c.profileId,
})

export const buildWorkflowPayload = (name: string, action: string, actor: string, reason?: string) => ({
  resource_name: name, action, actor_name: actor, reason: reason ?? '',
})
