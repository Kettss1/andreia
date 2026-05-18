import "server-only";
import { put, del } from "@vercel/blob";

// Vercel Blob storage. Uploaded files become public, immutable URLs.
// Callers store the returned URL on the model; deletes accept the same URL.

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export class StorageError extends Error {}

export type SaveImageInput = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

/** Uploads an image and returns its public URL. */
export async function saveImage({
  buffer,
  contentType,
  size,
}: SaveImageInput): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new StorageError(
      "Tipo de arquivo não suportado. Envie PNG, JPG, WEBP ou SVG.",
    );
  }
  if (size > MAX_BYTES) {
    throw new StorageError("Arquivo muito grande. O limite é 5MB.");
  }

  const ext = EXT_BY_MIME[contentType];
  // addRandomSuffix lets Blob append a unique key segment so we never
  // collide; the "logos/" prefix keeps the store browsable per asset type.
  const { url } = await put(`logos/logo.${ext}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return url;
}

/** Removes an uploaded file. No-op if the URL is empty or already gone. */
export async function deleteImage(url: string): Promise<void> {
  if (!url) return;
  try {
    await del(url);
  } catch {
    // Already gone or never existed — fine.
  }
}
