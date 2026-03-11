import { Router } from "express"
import * as controller from "./profile.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import { validateBody } from "@/utils/validate"
import * as schema from "./profile.schema"

const router = Router()

router.use(authenticate)

router.get("/me", controller.getMyProfile)

router.get("/search", controller.searchProfiles)

router.get("/", requirePermission(PERM.PROFILE.READ), controller.getProfiles)

router.get("/:id", requirePermission(PERM.PROFILE.READ), controller.getProfileById)

router.post(
    "/",
    requirePermission(PERM.PROFILE.WRITE),
    validateBody(schema.createProfileSchema),
    controller.createProfile
)

router.put(
    "/:id",
    requirePermission(PERM.PROFILE.WRITE),
    validateBody(schema.updateProfileSchema),
    controller.updateProfile
)

router.post("/:id/approve", requirePermission(PERM.PROFILE.APPROVE), controller.approveProfile)

router.post("/:id/reject", requirePermission(PERM.PROFILE.REJECT), controller.rejectProfile)

import * as subSchema from "./profileSub.schema"

router.patch(
    "/:id/status",
    requirePermission(PERM.PROFILE.STATUS),
    validateBody(schema.changeStatusSchema),
    controller.changeStatus
)

// --- SUB-MODULES ---
router.get("/:id/education", requirePermission(PERM.PROFILE.READ), controller.getEducation)

router.post("/:id/education", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.educationSchema), controller.createEducation)

router.delete("/:id/education/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteEducation)

router.get("/:id/family", requirePermission(PERM.PROFILE.READ), controller.getFamily)

router.post("/:id/family", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.familySchema), controller.createFamily)

router.delete("/:id/family/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteFamily)

router.get("/:id/work-history", requirePermission(PERM.PROFILE.READ), controller.getWorkHistory)

router.post("/:id/work-history", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.workHistorySchema), controller.createWorkHistory)

router.delete("/:id/work-history/:subId", requirePermission(PERM.PROFILE.WRITE), controller.deleteWorkHistory)

router.get("/:id/extra", requirePermission(PERM.PROFILE.READ), controller.getExtraInfo)

router.put("/:id/extra", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.extraInfoSchema), controller.updateExtraInfo)

router.put("/:id/health", requirePermission(PERM.PROFILE.WRITE), validateBody(subSchema.healthSchema), controller.updateHealthRecords)

export const profileRoutes: Router = router
