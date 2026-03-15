import { ID } from "@/types";
import { rDel, rGet, rIncr, rIsMember, rSadd, rSmembers, rExists, rGetJson, rSetJson, rDelPattern } from "@/configs/redis";
import { CacheKey, CacheTTL } from "./cacheKey";
import { permissionService } from "../permissions/permission.service";

export class CacheService {
  async getOrSet<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const cached = await rGetJson<T>(key)
    if (cached !== null) return cached
    const fresh = await fn()
    await rSetJson(key, fresh, ttl)
    return fresh
  }

  async set<T>(k: string, v: T, ttl: number) { await rSetJson(k, v, ttl) }
  async get<T>(k: string) { return rGetJson<T>(k) }
  async del(k: string) { await rDel(k) }
  async delMany(keys: string[]) { if (keys.length) await rDel(...keys) }
  async delPattern(pattern: string) { await rDelPattern(pattern) }

  async setPermCodes(u: ID, codes: string[]) { await rSadd(CacheKey.permCodes(u), codes, CacheTTL.PERM_CODES) }
  async checkPermCode(u: ID, code: string) { return rIsMember(CacheKey.permCodes(u), code) }
  async getPermCodes(u: ID) { return (await rExists(CacheKey.permCodes(u))) ? rSmembers(CacheKey.permCodes(u)) : null }
  async invalidateUserPerms(u: ID) { await rDel(CacheKey.permCodes(u), CacheKey.permScopes(u)) }
  async invalidateByRole(roleId: ID) {
    await permissionService.invalidateUsersWithRole(roleId)
    await this.invalidateRolePermissions(roleId)
  }
  async invalidateProfile(id: ID) { await rDel(CacheKey.profileFull(id), CacheKey.salaryInfo(id)) }
  async invalidateStaffList(id: ID) { await rDel(CacheKey.staffListByUnit(id)) }
  async invalidateQuota(id: ID, yr: string) { await rDel(CacheKey.individualQuota(id, yr)) }
  async invalidateSummary(id: ID, yr: string) { await rDel(CacheKey.annualSummary(id, yr)) }
  async invalidateQuotaParams(yr: string) { await rDel(CacheKey.quotaParams(yr)); await rDelPattern(`workload:quota:*:${yr}`) }
  async invalidateSalaryInfo(id: ID) { await rDel(CacheKey.salaryInfo(id)) }
  async invalidateOrgTree() { await rDel(CacheKey.orgTree()); await rDelPattern('org:unit:*') }
  async invalidateAppointmentAlert() { await rDel(CacheKey.appointmentAlertSummary()) }
  async invalidateWorkflowInstance(id: ID) { await rDel(CacheKey.workflowInstance(id)) }
  async invalidateRoleList() { await rDel(CacheKey.roleList()) }
  async invalidateRolePermissions(id: ID) { await rDel(CacheKey.rolePermissions(id)) }

  async incrementUnread(u: ID) { await rIncr(CacheKey.unreadCount(u)) }
  async resetUnread(u: ID) { await rDel(CacheKey.unreadCount(u)) }
  async getUnreadCount(u: ID) { const v = await rGet(CacheKey.unreadCount(u)); return v ? parseInt(v) : 0 }
}

export const cacheService = new CacheService()
