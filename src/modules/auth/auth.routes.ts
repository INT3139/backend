import { Router } from "express"
import * as controller from "./auth.controller"
import { validateBody } from "@/utils/validate"
import * as schema from "./auth.schema"
import { authenticate } from "@/core/middlewares/auth"

const router = Router()

router.post("/login", validateBody(schema.loginSchema), controller.loginCtrl)

router.post("/refresh", controller.refreshTokenCtrl)

router.post("/logout", authenticate, controller.logoutCtrl)

router.post("/change-password", authenticate, validateBody(schema.changePasswordSchema), controller.changePasswordCtrl)

export const authRoutes: Router = router;