import { UUID } from "@/types";
import { rDel, rGet, rIncr, rIsMember, rSadd, rSmembers, rExists, rGetJson, rSetJson, rDelPattern } from "@/configs/redis";
import { CacheKey, CacheTTL } from "./cacheKey";

export class CacheService {
  async getOrSet<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const cached = await rGetJson<T>(key)
    if (cached !== null) return cached
    const fresh = await fn()
    await rSetJson(key, fresh, ttl)
    return fresh
  }

  async set<T>(k: string, v: T, ttl: number)        { await rSetJson(k, v, ttl) }
  async get<T>(k: string)                           { return rGetJson<T>(k) }
  async del(k: string)                              { await rDel(k) }
  async delMany(keys: string[])                     { if (keys.length) await rDel(...keys) }
  async delPattern(pattern: string)                 { await rDelPattern(pattern) }

  async setPermCodes(u: UUID, codes: string[])      { await rSadd(CacheKey.permCodes(u), codes, CacheTTL.PERM_CODES) }
  async checkPermCode(u: UUID, code: string)        { return rIsMember(CacheKey.permCodes(u), code) }
  async getPermCodes(u: UUID)                       { return (await rExists(CacheKey.permCodes(u))) ? rSmembers(CacheKey.permCodes(u)) : null }
  async invalidateUserPerms(u: UUID)                { await rDel(CacheKey.permCodes(u), CacheKey.permScopes(u)) }
  async invalidateByRole(_: UUID)                   { await rDelPattern('perm:codes:*'); await rDelPattern('perm:scopes:*') }

  async invalidateProfile(id: UUID)                 { await rDel(CacheKey.profileFull(id), CacheKey.salaryInfo(id)) }
  async invalidateStaffList(id: UUID)               { await rDel(CacheKey.staffListByUnit(id)) }
  async invalidateQuota(id: UUID, yr: string)       { await rDel(CacheKey.individualQuota(id, yr)) }
  async invalidateSummary(id: UUID, yr: string)     { await rDel(CacheKey.annualSummary(id, yr)) }
  async invalidateQuotaParams(yr: string)           { await rDel(CacheKey.quotaParams(yr)); await rDelPattern(`workload:quota:*:${yr}`) }
  async invalidateSalaryInfo(id: UUID)              { await rDel(CacheKey.salaryInfo(id)) }
  async invalidateOrgTree()                         { await rDel(CacheKey.orgTree()); await rDelPattern('org:unit:*') }
  async invalidateAppointmentAlert()                { await rDel(CacheKey.appointmentAlertSummary()) }
  async invalidateWorkflowInstance(id: UUID)        { await rDel(CacheKey.workflowInstance(id)) }
  async invalidateRoleList()                        { await rDel(CacheKey.roleList()) }
  async invalidateRolePermissions(id: UUID)         { await rDel(CacheKey.rolePermissions(id)) }

  async incrementUnread(u: UUID)                    { await rIncr(CacheKey.unreadCount(u)) }
  async resetUnread(u: UUID)                        { await rDel(CacheKey.unreadCount(u)) }
  async getUnreadCount(u: UUID)                     { const v = await rGet(CacheKey.unreadCount(u)); return v ? parseInt(v) : 0 }
}

export const cacheService = new CacheService()
