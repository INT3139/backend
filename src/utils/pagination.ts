import { PaginationQuery, PaginatedResult } from '../types'

export function parsePagination(q: Record<string, unknown>): PaginationQuery {
  return {
    page:  Math.max(1, Number(q.page) || 1),
    limit: Math.min(100, Math.max(1, Number(q.limit) || 20)),
    sort:  typeof q.sort === 'string' ? q.sort : undefined,
    order: q.order === 'asc' ? 'asc' : 'desc',
  }
}

export const buildOffsetLimit = (page: number, limit: number) => ({ offset: (page - 1) * limit, limit })

export function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}
