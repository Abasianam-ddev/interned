import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const target = path.resolve(UPLOAD_DIR, ...parts);
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(target);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const ext = path.extname(target).slice(1).toLowerCase();
    const body = await readFile(target);
    return new Response(body, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(ext === "svg" ? { "Content-Security-Policy": "script-src 'none'" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
