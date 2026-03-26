import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from './env'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

export const s3Client = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY
  },
})

export interface UploadResult {
  storageKey: string;
  bucket: string;
  url: string
}

export interface UploadOptions {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
  customName?: string;
  keepOriginalName?: boolean;
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const {
    buffer, originalName,
    mimeType, folder,
    customName, keepOriginalName
  } = options;

  const ext = path.extname(originalName);
  let fileName = '';

  if (keepOriginalName) {
    fileName = originalName;
  } else if (customName) {
    fileName = `${customName}${ext}`;
  } else {
    fileName = `${uuidv4()}${ext}`;
  }

  const storageKey = folder ? `${folder}/${fileName}` : fileName;

  await s3Client.send(new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: storageKey,
    Body: buffer,
    ContentType: mimeType
  }));

  return {
    storageKey,
    bucket: env.S3_BUCKET,
    url: `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${storageKey}`
  } as UploadResult;
}

export async function getPresignedUrl(storageKey: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: env.S3_BUCKET, Key: storageKey
  }), { expiresIn })
}

export async function deleteFile(storageKey: string): Promise<void> {
  // Check if file exists
  if (!await fileExists(storageKey)) {
    throw new Error('File not found')
  }

  await s3Client.send(new DeleteObjectCommand({
    Bucket: env.S3_BUCKET, Key: storageKey
  }))
}

export async function fileExists(storageKey: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: env.S3_BUCKET, Key: storageKey
    }));
    return true
  } catch { return false }
}