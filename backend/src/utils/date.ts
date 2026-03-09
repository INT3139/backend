import dayjs from 'dayjs';

export const formatDate    = (d: Date | string, fmt = 'DD/MM/YYYY') => dayjs(d).format(fmt)
export const addDays       = (d: Date | string, n: number) => dayjs(d).add(n, 'day').toDate()
export const diffDays      = (from: Date | string, to: Date | string) => dayjs(to).diff(dayjs(from), 'day')
export const isExpiringSoon = (end: Date | string, days: number) => { const d = diffDays(new Date(), end); return d >= 0 && d <= days }

export function toAcademicYear(date: Date | string = new Date()): string {
  const d = dayjs(date); const m = d.month() + 1; const y = d.year()
  return m >= 9 ? `${y}-${y+1}` : `${y-1}-${y}`
}

export function parseAcademicYear(year: string): { start: Date; end: Date } {
  const [y1, y2] = year.split('-').map(Number)
  return { start: new Date(`${y1}-09-01`), end: new Date(`${y2}-08-31`) }
}

export const getCurrentAcademicYear = () => toAcademicYear(new Date())
