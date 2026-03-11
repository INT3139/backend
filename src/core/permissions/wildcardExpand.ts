import { query } from "@/configs/db";
import { rSmembers, rSadd, rExists } from "@/configs/redis";
import { CacheKey, CacheTTL } from "../cache/cacheKey";


export async function getCatalog(): Promise<string[]> {
  const key = CacheKey.permCatalog();
  if (await rExists(key)) return rSmembers(key)

  const rows = await query<{ code: string }>('SELECT code FROM permissions WHERE is_active=TRUE')
  const codes = rows.map(r => r.code)
  
  await rSadd(key, codes, CacheTTL.PERM_CATALOG)
  return codes
}

export function expandPattern(pattern: string, catalog: string[]): string[] {
  if (!pattern.includes('*')) return catalog.includes(pattern) ? [pattern] : []
  const re = new RegExp('^' + pattern.replace(/\./g, '\.').replace('*', '.*') + '$')
  return catalog.filter(c => re.test(c))
}

export async function expandAll(patterns: string[]): Promise<string[]> {
  const catalog = await getCatalog()
  return [...new Set(patterns.flatMap(p => expandPattern(p, catalog)))]
}

export const matchesPattern = (code: string, pattern: string) =>
  !pattern.includes('*') ? code === pattern
  : new RegExp('^' + pattern.replace(/\./g, '\.').replace('*', '.*') + '$').test(code)
