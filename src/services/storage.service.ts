import { db } from '@/configs/db'
import { sysAttachments } from '@/db/schema/system'
import { eq, and, isNull, desc, InferSelectModel } from 'drizzle-orm'
import { uploadFile, getPresignedUrl, deleteFile } from '@/configs/s3'
import { validateFileSize, validateMimeType } from '@/utils/file'
import { NotFoundError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { abacService } from '@/core/permissions/abac'
import { permissionService } from '@/core/permissions/permission.service'
import { ID, AuthUser } from '@/types'

const ALLOWED = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export type Attachment = InferSelectModel<typeof sysAttachments>

export class StorageService {
  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; resourceType: string; resourceId: ID; uploadedBy: ID; category?: string; customPath?: string }): Promise<Attachment> {
    validateFileSize(input.buffer.length, 20)
    validateMimeType(input.mimeType, ALLOWED)

    // Nếu có customPath, ta dùng nó, nếu không dùng mặc định của config
    const { storageKey, bucket } = await uploadFile({
      buffer: input.buffer,
      originalName: input.originalName,
      mimeType: input.mimeType,
      folder: input.customPath || input.resourceType
    })

    const [row] = await db.insert(sysAttachments).values({
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
    return row
  }

  async getAttachment(id: ID): Promise<Attachment | undefined> {
    const [row] = await db.select().from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))
    return row
  }

  async listAttachments(type: string, resourceId: ID): Promise<Attachment[]> {
    return db.select().from(sysAttachments)
      .where(and(eq(sysAttachments.resourceType, type), eq(sysAttachments.resourceId, resourceId), isNull(sysAttachments.deletedAt)))
      .orderBy(desc(sysAttachments.uploadedAt))
  }

  async getDownloadUrl(id: ID, requester: ID | AuthUser): Promise<string> {
    const [att] = await db.select({
      storageKey: sysAttachments.storageKey,
      resourceType: sysAttachments.resourceType,
      resourceId: sysAttachments.resourceId
    }).from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))

    if (!att) throw new NotFoundError('Attachment')

    const requesterId = typeof requester === 'number' ? requester : requester.id
    const scopes = await permissionService.getScopes(requester)
    const canAccess = await abacService.canAccess(requesterId, scopes, att.resourceType, att.resourceId)
    if (!canAccess) throw new ForbiddenError()

    return getPresignedUrl(att.storageKey)
  }

  async verifyAttachment(id: ID, verifierId: ID): Promise<void> {
    const hasPerm = await permissionService.hasPermission(verifierId, 'hrm.attachment.verify')
    if (!hasPerm) throw new ForbiddenError('Missing permission: hrm.attachment.verify')

    const [att] = await db.select().from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))
    if (!att) throw new NotFoundError('Attachment')

    await db.update(sysAttachments)
      .set({ isVerified: true, verifiedBy: verifierId, verifiedAt: new Date() })
      .where(eq(sysAttachments.id, id))
  }

  async deleteAttachment(id: ID, actor: ID | AuthUser): Promise<void> {
    const [att] = await db.select().from(sysAttachments).where(and(eq(sysAttachments.id, id), isNull(sysAttachments.deletedAt)))
    if (!att) throw new NotFoundError('Attachment')

    const actorId = typeof actor === 'number' ? actor : actor.id
    // Check permissions: Owner or has hrm.attachment.delete + ABAC access
    const isOwner = att.uploadedBy === actorId
    if (!isOwner) {
      const hasPerm = await permissionService.hasPermission(actor, 'hrm.attachment.delete')
      const scopes = await permissionService.getScopes(actor)
      const hasScope = await abacService.canAccess(actorId, scopes, att.resourceType, att.resourceId)
      if (!hasPerm || !hasScope) throw new ForbiddenError()
    }

    await deleteFile(att.storageKey)
    await db.update(sysAttachments).set({ deletedAt: new Date() }).where(eq(sysAttachments.id, id))
  }
}

export const storageService = new StorageService()
