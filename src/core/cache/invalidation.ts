import { cacheService } from "./cache.service";
import { permissionService } from "../permissions/permission.service";
import { UUID } from "@/types";

export const onProfileUpdated      = async (id: UUID, unitId?: UUID)           => { await cacheService.invalidateProfile(id); if (unitId) await cacheService.invalidateStaffList(unitId) }
export const onStaffCreated        = async (unitId: UUID)                      => cacheService.invalidateStaffList(unitId)
export const onStaffStatusChanged  = async (id: UUID, old?: UUID, next?: UUID) => { await cacheService.invalidateProfile(id); if (old) await cacheService.invalidateStaffList(old); if (next && next !== old) await cacheService.invalidateStaffList(next) }
export const onRolePermissionsChanged = async (roleId: UUID)                   => { await cacheService.invalidateRolePermissions(roleId); await permissionService.invalidateByRole(roleId) }
export const onUserRoleChanged     = async (userId: UUID)                      => { await permissionService.invalidate(userId); await cacheService.invalidateRoleList() }
export const onEvidenceReviewed    = async (id: UUID, yr: string)              => cacheService.invalidateSummary(id, yr)
export const onQuotaParamsUpdated  = async (yr: string)                        => cacheService.invalidateQuotaParams(yr)
export const onSalaryUpdated       = async (id: UUID)                          => { await cacheService.invalidateSalaryInfo(id); await cacheService.invalidateProfile(id) }
export const onAppointmentChanged  = async ()                                  => cacheService.invalidateAppointmentAlert()
export const onOrgUnitChanged      = async (id: UUID)                          => { await cacheService.invalidateOrgTree(); await cacheService.invalidateStaffList(id) }
export const onWorkflowAdvanced    = async (id: UUID)                          => cacheService.invalidateWorkflowInstance(id)
export const onNotificationsRead   = async (userId: UUID)                      => cacheService.resetUnread(userId)