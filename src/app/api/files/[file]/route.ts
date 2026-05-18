import { NextResponse } from "next/server";
import { readImage } from "@/lib/storage";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string }> },
) {
  const { file } = await ctx.params;
  const found = await readImage(file);

  if (!found) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Stored files are immutable (we rewrite on edit, never mutate).
  // Long cache + immutable hint is safe and helps PDF generation later.
  // ArrayBuffer body satisfies Next's response type; the underlying
  // bytes are identical.
  return new NextResponse(found.bytes.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": found.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
