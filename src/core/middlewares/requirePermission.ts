import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "./errorHandler";
import { permissionService } from "../permissions/permission.service";
import { AuthUser } from "@/types";

/**
 * Guard: yêu cầu user có đúng 1 permission code.
 */
export const requirePermission =
  (code: string) =>
    async (req: Request, _: Response, next: NextFunction) => {
      try {
        if (!req.user) throw new UnauthorizedError();
        if (!(await permissionService.hasPermission(req.user as AuthUser, code)))
          throw new ForbiddenError(`Missing: ${code}`);
        next();
      } catch (e) {
        next(e);
      }
    };

/**
 * Guard: yêu cầu user có ÍT NHẤT MỘT trong các permission codes.
 * Dùng Promise.all để check song song thay vì tuần tự.
 */
export const requireAnyPermission =
  (...codes: string[]) =>
    async (req: Request, _: Response, next: NextFunction) => {
      try {
        if (!req.user) throw new UnauthorizedError();
        const results = await Promise.all(
          codes.map((c) =>
            permissionService.hasPermission(req.user as AuthUser, c)
          )
        );
        if (!results.some(Boolean))
          throw new ForbiddenError(`Missing one of: ${codes.join(", ")}`);
        next();
      } catch (e) {
        next(e);
      }
    };

/**
 * Guard: yêu cầu user có TẤT CẢ các permission codes.
 */
export const requireAllPermissions =
  (...codes: string[]) =>
    async (req: Request, _: Response, next: NextFunction) => {
      try {
        if (!req.user) throw new UnauthorizedError();
        const results = await Promise.all(
          codes.map((c) =>
            permissionService.hasPermission(req.user as AuthUser, c)
          )
        );
        if (!results.every(Boolean))
          throw new ForbiddenError(`Missing all of: ${codes.join(", ")}`);
        next();
      } catch (e) {
        next(e);
      }
    };