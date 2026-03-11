import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from './env'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT, region: 'us-east-1',
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
  forcePathStyle: true,
})

export interface UploadResult { storageKey: string; bucket: string; url: string }

export async function uploadFile(buffer: Buffer, originalName: string, mimeType: string, folder: string): Promise<UploadResult> {
  const storageKey = `${folder}/${uuidv4()}${path.extname(originalName)}`
  await s3Client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey, Body: buffer, ContentType: mimeType }))
  return { storageKey, bucket: env.S3_BUCKET, url: `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${storageKey}` }
}

export async function getPresignedUrl(storageKey: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey }), { expiresIn })
}

export async function deleteFile(storageKey: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey }))
}

export async function fileExists(storageKey: string): Promise<boolean> {
  try { await s3Client.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey })); return true }
  catch { return false }
}
