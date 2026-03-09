import { UUID } from "@/types";
import { rDel, rGet, rIncr, rIsMember, rSet, rSmembers, rGetJson, rSetJson, rDelPattern } from "@/configs/redis";

export class CacheService {
    async getOrSet<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
        const cached = await rGetJson<T>(key)
        if (cached !== null) return cached
        const fresh = await fn()
        await rSetJson(key, fresh, ttl)
        return fresh
    }

    async set<T>(k: string, v: T, ttl: number) { await rSetJson(k, v, ttl) }
    async get<T>(k: string)                    { return rGetJson<T>(k) }
    async del(k: string)                       { await rDel(k) }
    async delMany(keys: string[])              { if (keys.length) await rDel(...keys) }
    async delPattern(pattern: string)          { await rDelPattern(pattern) }
}