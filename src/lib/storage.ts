import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink, readFile, stat } from "node:fs/promises";
import path from "node:path";

// Local-filesystem storage. Files live in ./uploads/ at the project root.
// Each file is named <uuid>.<ext>. We never trust the original filename.
//
// To migrate to S3/R2/MinIO later, replace the body of these three
// functions — the rest of the app only knows the returned filename and
// fetches the file by URL through /api/files/<filename>.

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

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

/** Saves an image to ./uploads/ and returns the stored filename. */
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

  await mkdir(UPLOADS_DIR, { recursive: true });

  const ext = EXT_BY_MIME[contentType];
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return filename;
}

/** Removes a stored file. No-op if it doesn't exist. */
export async function deleteImage(filename: string): Promise<void> {
  if (!isSafeFilename(filename)) return;
  try {
    await unlink(path.join(UPLOADS_DIR, filename));
  } catch {
    // Already gone or never existed — fine.
  }
}

/** Reads a stored file as bytes + content type, for the serve route. */
export async function readImage(
  filename: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!isSafeFilename(filename)) return null;

  const filepath = path.join(UPLOADS_DIR, filename);

  try {
    await stat(filepath);
  } catch {
    return null;
  }

  const bytes = await readFile(filepath);
  const ext = path.extname(filename).slice(1).toLowerCase();
  const contentType = mimeFromExt(ext);

  return { bytes, contentType };
}

function isSafeFilename(name: string): boolean {
  // Strictly <uuid>.<ext> — no traversal, no slashes, no nulls.
  return /^[0-9a-f-]{36}\.(png|jpg|jpeg|webp|svg)$/i.test(name);
}

function mimeFromExt(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
