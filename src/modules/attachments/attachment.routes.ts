import { Router } from "express"
import * as controller from "./attachment.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import multer from "multer"

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(authenticate)

/**
 * @openapi
 * /attachments:
 *   post:
 *     tags:
 *       - Attachment
 *     summary: Upload file
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    requirePermission(PERM.SYSTEM.ATTACHMENT_UPLOAD),
    upload.single("file"),
    controller.uploadAttachment
)

/**
 * @openapi
 * /attachments/{id}/download:
 *   get:
 *     tags:
 *       - Attachment
 *     summary: Get download URL
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id/download",
    requirePermission(PERM.SYSTEM.ATTACHMENT_DOWNLOAD),
    controller.downloadAttachment
)

/**
 * @openapi
 * /attachments/{id}:
 *   delete:
 *     tags:
 *       - Attachment
 *     summary: Delete file
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    requirePermission(PERM.SYSTEM.ATTACHMENT_DELETE),
    controller.deleteAttachment
)

/**
 * @openapi
 * /attachments:
 *   get:
 *     tags:
 *       - Attachment
 *     summary: List files for resource
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    requirePermission(PERM.SYSTEM.ATTACHMENT_DOWNLOAD),
    controller.listAttachments
)

export const attachmentRoutes: Router = router
