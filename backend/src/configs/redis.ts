import Redis from "ioredis"
import { env } from "./env"

export const redis = new Redis(env.REDIS_URL);
redis.on("error", (err: Error) => {
    console.error("Redis error:", err);
});

export async function get(key: string): Promise<string | null> {
    try {
        return await redis.get(key);
    } catch (err) {
        console.error(`Error getting key ${key} from Redis:`, err);
        return null;
    }
}

export async function set(
    key: string, 
    value: string, 
    ttlSeconds?: number
): Promise<void> {
    try {
        if (ttlSeconds) {
            await redis.set(key, value, "EX", ttlSeconds);
        } else {
            await redis.set(key, value);
        }
    } catch (err) {
        console.error(`Error setting key ${key} in Redis:`, err);
    }
}

export async function del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await redis.del(...keys);
}

export async function delPattern(pattern: string): Promise<void> {
    let cursor = "0";
    do {
        const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = newCursor;
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } while (cursor !== "0");
}

export async function exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
}

export async function isMember(key: string, member: string) : Promise<boolean> {
    return (await redis.sismember(key, member)) === 1;
}

export async function incr(key: string): Promise<number> {
    return await redis.incr(key);
}

export async function getJson<T>(key: string): Promise<T | null> {
    const value = await get(key);
    if (value) {
        try {
            return JSON.parse(value) as T;
        } catch (err) {
            console.error(`Error parsing JSON from Redis key ${key}:`, err);
            return null;
        }
    }
    return null;
}

export async function setJson<T>(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {        
        const stringValue = JSON.stringify(value); 
        await set(key, stringValue, ttlSeconds);
    }
    catch (err) {
        console.error(`Error setting JSON in Redis key ${key}:`, err);
    }
}

export async function sadd(key: string, members: string[], ttlSeconds?: number): Promise<void> {
    if (members.length === 0) return;
    await redis.sadd(key, ...members);
    if (ttlSeconds) {
        await redis.expire(key, ttlSeconds);
    }
}

export async function flushAll(): Promise<void> {
    try {
        await redis.flushall();
    } catch (err) {
        console.error("Error flushing Redis:", err);
    }
}

export async function disconnect(): Promise<void> {
    try {
        await redis.quit();
    } catch (err) {
        console.error("Error disconnecting from Redis:", err);
    }
}

export async function ping(): Promise<string> {
    try {
        return await redis.ping();
    } catch (err) {
        console.error("Error pinging Redis:", err);
        return "Error";
    }
}