import { Request, Response, NextFunction } from "express";
import { rGetJson, rSetJson, rDelPattern } from "../../configs/redis";

export function cacheResponse(
    ttl: number,
    options?: {
        useUserId?: boolean,
    }
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `http:${req.method}:${req.path}:${JSON.stringify(req.query)}${options?.useUserId ? `:${req.userId ?? 'anon'}` : ''}`
        const cached = await rGetJson<unknown>(key)
        if (cached !== null) { res.json(cached); return }
        const orig = res.json.bind(res)
        res.json = (body) => { rSetJson(key, body, ttl).catch(() => { }); return orig(body) }
        next()
    }
}

export async function invalidateCache(pattern: string): Promise<void> {
    await rDelPattern(`http:*:${pattern}*`)
}