import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '@/configs/env'
import { AuthUser, ID } from '@/types'
import { UnauthorizedError } from '../middlewares/errorHandler'

export interface TokenPayload {
  sub: ID
  username?: string
  type: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const signAccessToken = (user: AuthUser) =>
  jwt.sign(
    { sub: user.id, username: user.username, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  )

const signRefreshToken = (userId: ID) => jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '7d' })

export const issueTokenPair = (user: AuthUser): TokenPair => ({ accessToken: signAccessToken(user), refreshToken: signRefreshToken(user.id) })

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
