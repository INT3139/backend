import { Request, Response } from "express"
import { storageService } from "@/services/storage.service"
import { success, created } from "@/utils/response"
import { asyncHandler } from "@/core/middlewares/errorHandler"
import { logAction } from "@/core/middlewares/auditContext"
import { ID } from "@/types"

/**
 * POST /api/v1/attachments
 */
export const uploadAttachment = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    if (!req.file) throw new Error('No file uploaded')

    const { resourceType, resourceId, category } = req.body
    
    const attachment = await storageService.upload({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        resourceType,
        resourceId: parseInt(resourceId, 10) as ID,
        uploadedBy: req.userId!,
        category
    })

    await logAction(req.userId!, 'upload', 'attachment', attachment.id.toString(), { resourceType, resourceId }, req)

    return created(res, attachment)
})

/**
 * GET /api/v1/attachments/:id/download
 */
export const downloadAttachment = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    const url = await storageService.getDownloadUrl(id, req.user!)
    
    return success(res, { url })
})

/**
 * DELETE /api/v1/attachments/:id
 */
export const deleteAttachment = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const id = parseInt(req.params.id as string, 10)
    await storageService.deleteAttachment(id, req.user!)
    await logAction(req.userId!, 'delete', 'attachment', id.toString(), undefined, req)

    return success(res, { message: 'Attachment deleted' })
})

/**
 * GET /api/v1/attachments
 */
export const listAttachments = asyncHandler(async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { resourceType, resourceId } = req.query
    const result = await storageService.listAttachments(
        resourceType as string,
        parseInt(resourceId as string, 10) as ID
    )
    return success(res, result)
})
