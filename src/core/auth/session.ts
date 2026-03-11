import { queryOne, query } from "@/configs/db";
import { redis } from "@/configs/redis";
import { issueTokenPair, verifyToken } from "./jwt";
import { AuthUser } from "@/types";
import { comparePassword, hashPassword } from "@/utils/hash";
import { UnauthorizedError } from "../middlewares/errorHandler";
import { permissionService } from "../permissions/permission.service";

const KEY = (uid: string) => `refresh:${uid}`

export async function login(
    username: string,
    password: string,
) {
    const row = await queryOne<any>(
        'SELECT id,username,email,full_name,password_hash,unit_id,is_active FROM users WHERE username=$1 AND deleted_at IS NULL', 
        [username]
    );
    
    if (!row || !row.is_active || !(await comparePassword(password, row.password_hash))) 
        throw new UnauthorizedError('Invalid credentials')

    const user: AuthUser = {
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        unitId: row.unit_id
    };
    const { accessToken, refreshToken } = issueTokenPair(user);
    await redis.setex(KEY(user.id), 7*24*3600, refreshToken)
    await permissionService.loadForUser(user.id)
    return { user, accessToken, refreshToken }
}

export async function refreshToken(token: string) {
  const payload = verifyToken(token)
  if ((payload as any).type !== 'refresh') throw new UnauthorizedError('Invalid refresh token')
  if ((await redis.get(KEY(payload.sub))) !== token) throw new UnauthorizedError('Token revoked')
  const row = await queryOne<any>('SELECT id,username,email,full_name,unit_id FROM users WHERE id=$1 AND is_active=TRUE', [payload.sub])
  if (!row) throw new UnauthorizedError()
  const user: AuthUser = { id: row.id, username: row.username, email: row.email, fullName: row.full_name, unitId: row.unit_id }
  return { accessToken: issueTokenPair(user).accessToken }
}

export async function logout(userId: string): Promise<void> {
  await redis.del(KEY(userId))
}

export async function changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
  const row = await queryOne<any>('SELECT password_hash FROM users WHERE id=$1', [userId])
  if (!row || !(await comparePassword(oldPass, row.password_hash))) throw new UnauthorizedError('Current password incorrect')
  await query('UPDATE users SET password_hash=$1 WHERE id=$2', [await hashPassword(newPass), userId])
  await logout(userId)
  await permissionService.invalidate(userId)
}
