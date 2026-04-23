import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "./errorHandler";
import { permissionService } from "../permissions/permission.service";
import { abacService } from "../permissions/abac";
import { AuthUser, ID } from "@/types";

/**
 * Guard kết hợp RBAC + ABAC:
 *   1. Check user có permission code không (RBAC)
 *   2. Check user có quyền truy cập resource cụ thể không (ABAC scope)
 *
 * Dùng cho các route dạng: GET /profiles/:id, PUT /salary/:id, ...
 *
 * Ví dụ:
 *   router.get('/:id', requireResource('hrm.profile.read', 'profile_staff', r => +r.params.id))
 */
export const requireResource =
  (perm: string, type: string, getId: (r: Request) => ID) =>
    async (req: Request, _: Response, next: NextFunction) => {
      try {
        if (!req.user) throw new UnauthorizedError();
        const user = req.user as AuthUser;
        const userId = user.id;

        // Bước 1: RBAC — có permission không
        if (!(await permissionService.hasPermission(user, perm)))
          throw new ForbiddenError(`Missing: ${perm}`);

        // Bước 2: ABAC — scope có cover resource này không
        const scopes = await permissionService.getScopesForUser(user);
        if (!(await abacService.canAccess(userId, scopes, type, getId(req))))
          throw new ForbiddenError("Access denied");

        next();
      } catch (e) {
        next(e);
      }
    };

/**
 * Guard cho phép:
 *   - Chính chủ (self) → pass thẳng, không cần permission
 *   - Người khác → phải có permission + phải có ABAC scope
 *
 * Fix: phiên bản cũ không check ABAC sau khi verify permission,
 * dẫn đến scope bypass — user có permission nhưng không thuộc đơn vị
 * vẫn được phép truy cập.
 *
 * Ví dụ:
 *   router.get('/:id', requireSelfOrPermission(
 *     'hrm.profile.read',
 *     'profile_staff',
 *     r => +r.params.id,
 *     async r => profileService.getOwnerId(+r.params.id)
 *   ))
 */
export const requireSelfOrPermission =
  (
    perm: string,
    resourceType: string,
    getId: (r: Request) => ID,
    getOwner: (r: Request) => Promise<ID>
  ) =>
    async (req: Request, _: Response, next: NextFunction) => {
      try {
        if (!req.user) throw new UnauthorizedError();
        const user = req.user as AuthUser;
        const userId = user.id;

        // Self-access: chính chủ → pass, không cần check gì thêm
        const ownerId = await getOwner(req);
        if (userId === ownerId) return next();

        // Người khác: RBAC check
        if (!(await permissionService.hasPermission(user, perm)))
          throw new ForbiddenError(`Missing: ${perm}`);

        // Người khác: ABAC scope check
        // Fix: phiên bản cũ bỏ qua bước này → scope bypass
        const scopes = await permissionService.getScopesForUser(user);
        if (!(await abacService.canAccess(userId, scopes, resourceType, getId(req))))
          throw new ForbiddenError("Access denied");

        next();
      } catch (e) {
        next(e);
      }
    };