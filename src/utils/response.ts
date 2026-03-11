import { Response } from 'express'
import { PaginatedResult } from '../types'
import { HTTP } from '../constants/httpStatus'

export const success   = (res: Response, data: unknown, code = HTTP.OK)   => res.status(code).json({ success: true, data })
export const created   = (res: Response, data: unknown)                    => res.status(HTTP.CREATED).json({ success: true, data })
export const noContent = (res: Response)                                   => res.status(HTTP.NO_CONTENT).send()
export function paginated<T>(res: Response, r: PaginatedResult<T>): void {
  res.status(HTTP.OK).json({ success: true, data: r.data, meta: { page: r.page, limit: r.limit, total: r.total, totalPages: r.totalPages } })
}
