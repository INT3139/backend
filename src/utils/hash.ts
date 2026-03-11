import bcrypt from 'bcrypt'
import crypto from 'crypto'

export const hashPassword    = (p: string)             => bcrypt.hash(p, 12)
export const comparePassword = (p: string, h: string)  => bcrypt.compare(p, h)
export const hashMd5         = (s: string)             => crypto.createHash('md5').update(s).digest('hex')
export function generateTempPassword(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789!@#$'
  return Array.from(crypto.randomBytes(len)).map(b => chars[b % chars.length]).join('')
}