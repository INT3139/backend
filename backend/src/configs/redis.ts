import Redis from "ioredis"
import { env } from "./env"

export const redis = new Redis(env.REDIS_URL);
redis.on("error", (err: Error) => {
    console.error("Redis error:", err);
});
export const rGet    = (k: string)                      => redis.get(k)
export const rDel    = (...keys: string[])              => keys.length ? redis.del(...keys) : Promise.resolve(0)
export const rIncr   = (k: string)                      => redis.incr(k)
export const rExists = async (k: string)                => (await redis.exists(k)) === 1
export const rIsMember = async (k: string, m: string)   => (await redis.sismember(k, m)) === 1
export const rSmembers = (k: string)                    => redis.smembers(k)

export async function rSet(k: string, v: string, ttl?: number): Promise<void> {
  if (ttl) await redis.setex(k, ttl, v)
  else     await redis.set(k, v)
}

export async function rDelPattern(pattern: string): Promise<void> {
  let cursor = '0'
  do {
    const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = next
    if (keys.length) await redis.del(...keys)
  } while (cursor !== '0')
}

export async function rSadd(k: string, members: string[], ttl?: number): Promise<void> {
  if (!members.length) return
  await redis.sadd(k, ...members)
  if (ttl) await redis.expire(k, ttl)
}

export async function rSetJson(k: string, v: unknown, ttl?: number): Promise<void> {
  await rSet(k, JSON.stringify(v), ttl)
}

export async function rGetJson<T>(k: string): Promise<T | null> {
  const raw = await rGet(k)
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}
