import { Request, Response } from "express";
import { login, logout, refreshToken, changePassword  } from "@/core/auth/session";
import { success } from "@/utils/response";
import { permissionService } from "@/core/permissions/permission.service";
import { AuthUser, ID } from "@/types";
import { asyncHandler } from "@/core/middlewares/errorHandler";

interface AuthRequest extends Request {
    user?: AuthUser;
    userId?: ID;
}

export const loginCtrl = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { username, password, port } = req.body;
    const result = await login(username, password, port);
    return success(res, result);
})

export const logoutCtrl = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    await logout(req.userId!);
    return success(res, { message: "Logged out successfully" });
})

export const refreshTokenCtrl = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { token } = req.body;
    const result = await refreshToken(token);
    return success(res, result);
})

export const changePasswordCtrl = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const { oldPassword, newPassword } = req.body;
    await changePassword(req.userId!, oldPassword, newPassword);
    return success(res, { message: "Password changed successfully" });
})

export const getPermissionsCtrl = asyncHandler(async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    const user = req.user!;
    const permissions = await permissionService.getRawPermissions(user);
    const scopes = await permissionService.getScopes(user);
    
    return success(res, { permissions, scopes });
})