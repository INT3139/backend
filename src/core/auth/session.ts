import { db } from "@/configs/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { redis } from "@/configs/redis";
import { issueTokenPair, verifyToken } from "./jwt";
import { AuthUser, ID } from "@/types";
import { comparePassword, hashPassword } from "@/utils/hash";
import { UnauthorizedError } from "../middlewares/errorHandler";
import { permissionService } from "../permissions/permission.service";

const KEY = (uid: ID | string) => `refresh:${uid}`

export async function login(
  username: string,
  password: string,
) {
  const [row] = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    passwordHash: users.passwordHash,
    unitId: users.unitId,
    isActive: users.isActive
  })
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1);

  if (!row || !row.isActive || !(await comparePassword(password, row.passwordHash)))
    throw new UnauthorizedError('Invalid credentials')

  const user: AuthUser = {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.fullName,
    unitId: row.unitId
  };
  const { accessToken, refreshToken } = issueTokenPair(user);
  await redis.setex(KEY(user.id), 7 * 24 * 3600, refreshToken)
  await permissionService.loadForUser(user.id)
  return { user, accessToken, refreshToken }
}

export async function refreshToken(token: string) {
  const payload = verifyToken(token)
  if (payload.type !== 'refresh') throw new UnauthorizedError('Invalid refresh token')
  if ((await redis.get(KEY(payload.sub))) !== token) throw new UnauthorizedError('Token revoked')

  const [row] = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    unitId: users.unitId
  })
    .from(users)
    .where(and(eq(users.id, payload.sub), eq(users.isActive, true)))
    .limit(1);

  if (!row) throw new UnauthorizedError()
  const user: AuthUser = { id: row.id, username: row.username, email: row.email, fullName: row.fullName, unitId: row.unitId }
  const newTokens = issueTokenPair(user)
  await redis.setex(KEY(user.id), 7 * 24 * 3600, newTokens.refreshToken)
  return {
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken
  }

}

export async function logout(userId: ID): Promise<void> {
  await redis.del(KEY(userId))
}

export async function changePassword(userId: ID, oldPass: string, newPass: string): Promise<void> {
  const [row] = await db.select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row || !(await comparePassword(oldPass, row.passwordHash))) throw new UnauthorizedError('Current password incorrect')

  await db.update(users)
    .set({ passwordHash: await hashPassword(newPass) })
    .where(eq(users.id, userId));

  await logout(userId)
  await permissionService.invalidate(userId)
}
