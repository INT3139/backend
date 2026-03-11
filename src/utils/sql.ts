const snake = (s: string) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  let text = strings[0]
  for (let i = 1; i < strings.length; i++) {
    text += `$${i}${strings[i]}`
  }
  return { text, values }
}

sql.raw = (s: string) => ({ text: s, values: [], __raw: true })
sql.identifier = (s: string) => ({ text: `"${s.replace(/"/g, '""')}"`, values: [], __identifier: true })
sql.join = (items: any[], sep = ', ') => {
  const texts: string[] = []
  const values: any[] = []
  let placeholderIdx = 1
  
  for (const item of items) {
    if (item && item.text) {
      // Re-map placeholders
      let itemText = item.text
      const itemValues = item.values
      
      const newText = itemText.replace(/\$(\d+)/g, (_: string, n: string) => {
        const val = itemValues[parseInt(n, 10) - 1]
        values.push(val)
        return `$${placeholderIdx++}`
      })
      
      texts.push(newText)
    } else {
      texts.push(`$${placeholderIdx++}`)
      values.push(item)
    }
  }
  
  return { text: texts.join(sep), values }
}

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
