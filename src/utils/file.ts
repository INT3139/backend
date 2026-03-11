import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ValidationError } from '@/core/middlewares/errorHandler'

export const buildStorageKey    = (folder: string, name: string) => `${folder}/${uuidv4()}${path.extname(name).toLowerCase()}`
export const getMimeCategory    = (mime: string) => mime === 'application/pdf' ? 'pdf' : mime.startsWith('image/') ? 'image' : mime.includes('spreadsheet') || mime.includes('excel') ? 'excel' : 'other'
export const validateFileSize   = (bytes: number, maxMb: number) => { if (bytes > maxMb * 1024 * 1024) throw new ValidationError(`File exceeds ${maxMb}MB`) }
export const validateMimeType   = (mime: string, allowed: string[]) => { if (!allowed.includes(mime)) throw new ValidationError(`${mime} not allowed`) }
