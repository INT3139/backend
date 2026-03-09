const snake = (s: string) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)

export function buildWhereClause(filters: Record<string, unknown>, start = 1) {
  const conds: string[] = []; const params: unknown[] = []; let i = start
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue
    conds.push(`${snake(k)} = $${i++}`); params.push(v)
  }
  return { clause: conds.length ? 'WHERE ' + conds.join(' AND ') : '', params, nextIdx: i }
}

export function buildUpdateSet(data: Record<string, unknown>, start = 1) {
  const parts: string[] = []; const params: unknown[] = []; let i = start
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue
    parts.push(`${snake(k)} = $${i++}`); params.push(v)
  }
  return { clause: 'SET ' + parts.join(', '), params, nextIdx: i }
}

export const appendPagination = (sql: string, limit: number, offset: number) => `${sql} LIMIT ${limit} OFFSET ${offset}`

export function buildOrderClause(sort?: string, order: 'asc'|'desc' = 'desc', allowed: string[] = []): string {
  if (!sort || !allowed.includes(sort)) return 'ORDER BY created_at DESC'
  return `ORDER BY ${snake(sort)} ${order.toUpperCase()}`
}
