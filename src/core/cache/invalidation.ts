import { cacheService } from "./cache.service";
import { permissionService } from "../permissions/permission.service";
import { ID } from "@/types";

export const onProfileUpdated      = async (id: ID, unitId?: ID)           => { await cacheService.invalidateProfile(id); if (unitId) await cacheService.invalidateStaffList(unitId) }
export const onStaffCreated        = async (unitId: ID)                      => cacheService.invalidateStaffList(unitId)
export const onStaffStatusChanged  = async (id: ID, old?: ID, next?: ID) => { await cacheService.invalidateProfile(id); if (old) await cacheService.invalidateStaffList(old); if (next && next !== old) await cacheService.invalidateStaffList(next) }
export const onRolePermissionsChanged = async (roleId: ID)                   => { await cacheService.invalidateRolePermissions(roleId); await permissionService.invalidateByRole(roleId) }
export const onUserRoleChanged     = async (userId: ID)                      => { await permissionService.invalidate(userId); await cacheService.invalidateRoleList() }
export const onEvidenceReviewed    = async (id: ID, yr: string)              => cacheService.invalidateSummary(id, yr)
export const onQuotaParamsUpdated  = async (yr: string)                        => cacheService.invalidateQuotaParams(yr)
export const onSalaryUpdated       = async (id: ID)                          => { await cacheService.invalidateSalaryInfo(id); await cacheService.invalidateProfile(id) }
export const onAppointmentChanged  = async ()                                  => cacheService.invalidateAppointmentAlert()
export const onOrgUnitChanged      = async (id: ID)                          => { await cacheService.invalidateOrgTree(); await cacheService.invalidateStaffList(id) }
export const onWorkflowAdvanced    = async (id: ID)                          => cacheService.invalidateWorkflowInstance(id)
export const onNotificationsRead   = async (userId: ID)                      => cacheService.resetUnread(userId)