import { db } from "@/configs/db";
import { users, roles, userRoles } from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { redis } from "@/configs/redis";
import { issueTokenPair, verifyToken } from "./jwt";
import { AuthUser, ID } from "@/types";
import { comparePassword, hashPassword } from "@/utils/hash";
import { UnauthorizedError, ForbiddenError } from "../middlewares/errorHandler";
import { permissionService } from "../permissions/permission.service";
import { PORT_ROLE_MAP } from "@/constants/roles";

const KEY = (uid: ID | string) => `refresh:${uid}`

export async function login(
  username: string,
  password: string,
  port: string
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
    unitId: row.unitId,
    port
  };

  // Fetch all user role codes
  const userRoleRows = await db.select({ roleCode: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));
  
  const allRoleCodes = userRoleRows.map(r => r.roleCode);
  const allowedRolesForPort = PORT_ROLE_MAP[port] || [];
  const activeRoles = allRoleCodes.filter(r => allowedRolesForPort.includes(r));

  if (activeRoles.length === 0) {
    throw new ForbiddenError(`Bạn không có quyền truy cập cổng '${port}' với các vai trò hiện có (${allRoleCodes.join(', ')})`);
  }

  user.activeRoles = activeRoles;
  user.role = activeRoles[0];

  const { accessToken, refreshToken } = issueTokenPair(user);
  await redis.setex(KEY(user.id), 7 * 24 * 3600, refreshToken)
  await permissionService.loadForUser(user)
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
  const port = payload.port || 'main'; // Default to main if not present (legacy)
  
  const user: AuthUser = { 
    id: row.id, 
    username: row.username, 
    email: row.email, 
    fullName: row.fullName, 
    unitId: row.unitId,
    port
  }
  
  // Fetch all user role codes
  const userRoleRows = await db.select({ roleCode: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));
  
  const allRoleCodes = userRoleRows.map(r => r.roleCode);
  const allowedRolesForPort = PORT_ROLE_MAP[port] || [];
  const activeRoles = allRoleCodes.filter(r => allowedRolesForPort.includes(r));

  user.activeRoles = activeRoles;
  user.role = activeRoles[0];

  const newTokens = issueTokenPair(user)
  await redis.setex(KEY(user.id), 7 * 24 * 3600, newTokens.refreshToken)
  return {
    user,
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
