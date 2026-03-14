import { query } from "@/configs/db";
import { rSmembers, rSadd, rExists } from "@/configs/redis";
import { CacheKey, CacheTTL } from "../cache/cacheKey";

export async function getCatalog(): Promise<string[]> {
  const key = CacheKey.permCatalog();
  if (await rExists(key)) return rSmembers(key);

  const rows = await query<{ code: string }>(
    "SELECT code FROM permissions WHERE is_active = TRUE"
  );
  const codes = rows.map((r) => r.code);

  await rSadd(key, codes, CacheTTL.PERM_CATALOG);
  return codes;
}

/**
 * Expand một wildcard pattern thành danh sách exact permission codes.
 *
 * Fix: '\.' trong JS string literal = '.' (backslash bị drop ở runtime).
 * Phải dùng '\\.' để RegExp nhận được ký tự escape đúng.
 *
 * Ví dụ:
 *   'hrm.*'          → tất cả code bắt đầu bằng 'hrm.'
 *   'hrm.profile.*'  → tất cả code bắt đầu bằng 'hrm.profile.'
 *   'system.audit.*' → 'system.audit.read', 'system.audit.export'
 */
export function expandPattern(pattern: string, catalog: string[]): string[] {
  if (!pattern.includes("*")) {
    return catalog.includes(pattern) ? [pattern] : [];
  }

  // Escape toàn bộ regex special chars trước, sau đó replace \* → .*
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape tất cả special chars (kể cả '.')
    .replace("\\*", ".*");                  // unescape '*' thành wildcard

  const re = new RegExp(`^${escaped}$`);
  return catalog.filter((c) => re.test(c));
}

export async function expandAll(patterns: string[]): Promise<string[]> {
  const catalog = await getCatalog();
  return [...new Set(patterns.flatMap((p) => expandPattern(p, catalog)))];
}

/**
 * Check nhanh (không cần catalog) — dùng trong các guard inline.
 * Ví dụ: matchesPattern('hrm.profile.read', 'hrm.profile.*') → true
 */
export const matchesPattern = (code: string, pattern: string): boolean => {
  if (!pattern.includes("*")) return code === pattern;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace("\\*", ".*");
  return new RegExp(`^${escaped}$`).test(code);
};