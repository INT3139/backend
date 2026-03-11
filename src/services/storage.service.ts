import { query, queryOne } from '@/configs/db'
import { uploadFile, getPresignedUrl, deleteFile } from '@/configs/s3'
import { validateFileSize, validateMimeType } from '@/utils/file'
import { NotFoundError, ForbiddenError } from '@/core/middlewares/errorHandler'
import { abacService } from '@/core/permissions/abac'
import { permissionService } from '@/core/permissions/permission.service'
import { UUID } from '@/types'

const ALLOWED = ['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export class StorageService {
  async upload(input: { buffer: Buffer; originalName: string; mimeType: string; resourceType: string; resourceId: UUID; uploadedBy: UUID; category?: string }): Promise<unknown> {
    validateFileSize(input.buffer.length, 20)
    validateMimeType(input.mimeType, ALLOWED)
    const { storageKey, bucket } = await uploadFile(input.buffer, input.originalName, input.mimeType, input.resourceType)
    const rows = await query(`INSERT INTO sys_attachments (resource_type,resource_id,uploaded_by,file_name,file_size_bytes,mime_type,storage_key,storage_bucket,category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [input.resourceType, input.resourceId, input.uploadedBy, input.originalName, input.buffer.length, input.mimeType, storageKey, bucket, input.category??'other'])
    return rows[0]
  }

  async getAttachment(id: UUID)                                { return queryOne('SELECT * FROM sys_attachments WHERE id=$1 AND deleted_at IS NULL', [id]) }
  async listAttachments(type: string, resourceId: UUID)        { return query('SELECT * FROM sys_attachments WHERE resource_type=$1 AND resource_id=$2 AND deleted_at IS NULL ORDER BY uploaded_at DESC', [type, resourceId]) }

  async getDownloadUrl(id: UUID, requesterId: UUID): Promise<string> {
    const att = await queryOne<any>('SELECT storage_key,resource_type,resource_id FROM sys_attachments WHERE id=$1 AND deleted_at IS NULL', [id])
    if (!att) throw new NotFoundError('Attachment')
    const scopes = await permissionService.getScopesForUser(requesterId)
    if (!(await abacService.canAccess(scopes, att.resource_type, att.resource_id))) throw new ForbiddenError()
    return getPresignedUrl(att.storage_key)
  }

  async verifyAttachment(id: UUID, verifierId: UUID)           { await query('UPDATE sys_attachments SET is_verified=TRUE,verified_by=$1,verified_at=now() WHERE id=$2', [verifierId, id]) }

  async deleteAttachment(id: UUID, _actorId: UUID): Promise<void> {
    const att = await queryOne<{ storage_key: string }>('SELECT storage_key FROM sys_attachments WHERE id=$1', [id])
    if (!att) throw new NotFoundError('Attachment')
    await deleteFile(att.storage_key)
    await query('UPDATE sys_attachments SET deleted_at=now() WHERE id=$1', [id])
  }
}

export const storageService = new StorageService()
