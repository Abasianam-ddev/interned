import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");

export const UPLOAD_KINDS = {
  document: {
    maxBytes: 5 * 1024 * 1024,
    types: {
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    } as Record<string, string>,
  },
  image: {
    maxBytes: 4 * 1024 * 1024,
    types: {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    } as Record<string, string>,
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

export class UploadError extends Error {}

/** Persist an uploaded File and return its public URL. Returns null when no file was provided. */
export async function saveUpload(file: FormDataEntryValue | null, kind: UploadKind): Promise<{ url: string; name: string } | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const rules = UPLOAD_KINDS[kind];
  const ext = rules.types[file.type];
  if (!ext) {
    throw new UploadError(
      kind === "document" ? "Please upload a PDF or Word document." : "Please upload a PNG, JPG, WEBP, GIF or SVG image.",
    );
  }
  if (file.size > rules.maxBytes) {
    throw new UploadError(`File is too large. Maximum size is ${Math.round(rules.maxBytes / 1024 / 1024)}MB.`);
  }
  const dir = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, kind);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/api/files/${kind}/${filename}`, name: file.name.slice(0, 120) };
}
