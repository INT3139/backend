import jwt from 'jsonwebtoken'
import { env } from '@/configs/env';
import { AuthUser } from '../../types'

export interface JwtPayload { 
    sub: string; username: 
    string; 
    iat: number; 
    exp: number 
}
export interface TokenPair  { 
    accessToken: string; 
    refreshToken: string 
}

export const signAccessToken  = (user: AuthUser) => jwt.sign({ sub: user.id, username: user.username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as any)
export const signRefreshToken = (userId: string)  => jwt.sign({ sub: userId, type: 'refresh' },         env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any)
export const verifyToken      = (token: string)   => jwt.verify(token, env.JWT_SECRET) as JwtPayload
export const issueTokenPair   = (user: AuthUser): TokenPair => ({ accessToken: signAccessToken(user), refreshToken: signRefreshToken(user.id) })
