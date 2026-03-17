import { Router } from "express"
import * as controller from "./attachment.controller"
import { authenticate } from "@/core/middlewares/auth"
import { requirePermission } from "@/core/middlewares/requirePermission"
import { PERM } from "@/constants/permission"
import multer from "multer"

/**
 * @openapi
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: integer
 *         mimeType:
 *           type: string
 *         s3Key:
 *           type: string
 *         resourceType:
 *           type: string
 *         resourceId:
 *           type: integer
 *         uploadedBy:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AttachmentUploadResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fileName:
 *           type: string
 *         url:
 *           type: string
 */

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
 *     description: Upload a file to S3 and record its metadata in the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               resourceType:
 *                 type: string
 *               resourceId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/AttachmentUploadResponse'
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
 *     description: Generate a temporary signed URL to download a specific attachment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Download URL generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         downloadUrl:
 *                           type: string
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
 *     description: Remove an attachment from the database and S3.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *     description: Retrieve a list of attachments filtered by resource type and ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved list of attachments
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attachment'
 */
router.get(
    "/",
    requirePermission(PERM.SYSTEM.ATTACHMENT_DOWNLOAD),
    controller.listAttachments
)

export const attachmentRoutes: Router = router
