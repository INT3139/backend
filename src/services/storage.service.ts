import { db } from '@/configs/db'
import { sysAttachments } from '@/db/schema/system'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { uploadFile, getPresignedUrl, deleteFile } from '@/configs/s3'
import { validateFileSize, validateMimeType } from '@/utils/file'
import { NotFoundError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { abacService } from '@/core/permissions/abac'
import { permissionService } from '@/core/permissions/permission.service'
import { ID } from '@/types'

const ALLOWED = ['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export class StorageService {
  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; resourceType: string; resourceId: ID; uploadedBy: ID; category?: string }): Promise<unknown> {
    validateFileSize(input.buffer.length, 20)
    validateMimeType(input.mimeType, ALLOWED)
    const { storageKey, bucket } = await uploadFile(input.buffer, input.originalName, input.mimeType, input.resourceType)
    const rows = await db.insert(sysAttachments).values({
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      uploadedBy: input.uploadedBy,
      fileName: input.originalName,
      fileSizeBytes: BigInt(input.buffer.length),
      mimeType: input.mimeType,
      storageKey,
      storageBucket: bucket,
      category: (input.category as any) ?? 'other'
    }).returning()
    return rows[0]
  }

  async getAttachment(id: ID) {
    const rows = await db.select().from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))
    return rows[0]
  }

  async listAttachments(type: string, resourceId: ID) {
    return db.select().from(sysAttachments)
      .where(and(eq(sysAttachments.resourceType, type), eq(sysAttachments.resourceId, resourceId), isNull(sysAttachments.deletedAt)))
      .orderBy(desc(sysAttachments.uploadedAt))
  }

  async getDownloadUrl(id: ID, requesterId: ID): Promise<string> {
    const rows = await db.select({
      storageKey: sysAttachments.storageKey,
      resourceType: sysAttachments.resourceType,
      resourceId: sysAttachments.resourceId
    }).from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))
    const att = rows[0]
    if (!att) throw new NotFoundError('Attachment')
    const scopes = await permissionService.getScopesForUser(requesterId)
    if (!(await abacService.canAccess(scopes, att.resourceType, att.resourceId))) throw new ForbiddenError()
    return getPresignedUrl(att.storageKey)
  }

  async verifyAttachment(id: ID, verifierId: ID) {
    await db.update(sysAttachments)
      .set({ isVerified: true, verifiedBy: verifierId, verifiedAt: new Date() })
      .where(eq(sysAttachments.id, id))
  }

  async deleteAttachment(id: ID, _actorId: ID): Promise<void> {
    const rows = await db.select({ storageKey: sysAttachments.storageKey }).from(sysAttachments).where(eq(sysAttachments.id, id))
    const att = rows[0]
    if (!att) throw new NotFoundError('Attachment')
    await deleteFile(att.storageKey)
    await db.update(sysAttachments).set({ deletedAt: new Date() }).where(eq(sysAttachments.id, id))
  }
}

export const storageService = new StorageService()
