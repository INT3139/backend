import { Router } from "express"
import * as controller from "./admin.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./admin.schema"

const router = Router()

router.use(authenticate)

router.post(
    "/users",
    requirePermission(PERM.SYSTEM.USER_MANAGE),
    validateBody(schema.createUserSchema),
    controller.createUser
)
router.delete("/users/:id", requirePermission(PERM.SYSTEM.USER_MANAGE), controller.deleteUser)
router.post(
    "/users/:id/roles",
    requirePermission(PERM.SYSTEM.ROLE_GRANT),
    validateBody(schema.assignRoleSchema),
    controller.assignRole
)
router.get("/roles", requirePermission(PERM.SYSTEM.ROLE_MANAGE), controller.getRoles)
router.post(
    "/roles",
    requirePermission(PERM.SYSTEM.ROLE_MANAGE),
    validateBody(schema.createRoleSchema),
    controller.createRole
)

router.get("/units", requirePermission(PERM.SYSTEM.CONFIG_READ), controller.getUnits)
router.post(
    "/units",
    requirePermission(PERM.SYSTEM.CONFIG_WRITE),
    validateBody(schema.createUnitSchema),
    controller.createUnit
)

router.get("/audit-logs", requirePermission(PERM.SYSTEM.AUDIT_READ), controller.getAuditLogs)

export const adminRoutes: Router = router
