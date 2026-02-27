import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME!;

function getStorage() {
  return new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL!,
      private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });
}

function getBucket() {
  return getStorage().bucket(GCS_BUCKET_NAME);
}

/**
 * Build the public URL for a file in the bucket.
 */
export function getPublicUrl(storagePath: string): string {
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${storagePath}`;
}

/**
 * Build a storage path from property ID, order, and extension.
 */
export function buildStoragePath(
  propertyId: number,
  order: number,
  ext: string
): string {
  const uuid = randomUUID().slice(0, 8);
  return `${propertyId}/${order}-${uuid}.${ext}`;
}

/**
 * Get file extension from content type.
 */
function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return map[contentType] || 'jpg';
}

/**
 * Upload a photo buffer to GCS.
 * Returns { storagePath, publicUrl }.
 */
export async function uploadPhoto(
  propertyId: number,
  order: number,
  buffer: Buffer,
  contentType: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = extFromContentType(contentType);
  const storagePath = buildStoragePath(propertyId, order, ext);
  const bucket = getBucket();
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });

  return { storagePath, publicUrl: getPublicUrl(storagePath) };
}

/**
 * Download an image from a URL and upload it to GCS.
 * Used for migrating Tokko photos.
 */
export async function uploadPhotoFromUrl(
  propertyId: number,
  order: number,
  sourceUrl: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${sourceUrl}: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadPhoto(propertyId, order, buffer, contentType);
}

/**
 * Delete all photos for a property (all files under {propertyId}/ prefix).
 */
export async function deletePropertyPhotos(propertyId: number): Promise<void> {
  const bucket = getBucket();
  await bucket.deleteFiles({
    prefix: `${propertyId}/`,
  });
}

/**
 * Delete a single photo by its storage path.
 */
export async function deletePhoto(storagePath: string): Promise<void> {
  const bucket = getBucket();
  const file = bucket.file(storagePath);
  await file.delete({ ignoreNotFound: true });
}

/**
 * Generate a signed URL for direct client upload.
 * The client can PUT the file directly to GCS using this URL.
 * Expires in 15 minutes.
 */
export async function generateSignedUploadUrl(
  storagePath: string,
  contentType: string
): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(storagePath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
    extensionHeaders: {
      'x-goog-content-length-range': '0,15728640', // max 15MB
    },
  });

  return url;
}

/**
 * Allowed image MIME types.
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Max file size in bytes (15MB).
 */
export const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * Minimum image dimensions.
 */
export const MIN_WIDTH = 1200;
export const MIN_HEIGHT = 800;
