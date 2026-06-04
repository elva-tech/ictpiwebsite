import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const TEMPLATE_FILENAME = "practicing-certificate.pdf";

/** Resolve template from `app/cert/` (canonical), then `public/cert/` as fallback. */
async function readPracticingTemplate(): Promise<Buffer> {
  const candidates = [
    path.join(process.cwd(), "app", "cert", TEMPLATE_FILENAME),
    path.join(process.cwd(), "public", "cert", TEMPLATE_FILENAME),
  ];

  let lastErr: unknown;
  for (const filePath of candidates) {
    try {
      return await readFile(filePath);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr ?? new Error("Practicing certificate template not found.");
}

/**
 * GET /api/certificate-template/practicing
 * Serves the blank PDF from app/cert for first-time certificate generation.
 */
export async function GET() {
  try {
    const buffer = await readPracticingTemplate();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${TEMPLATE_FILENAME}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("certificate-template/practicing:", err);
    return NextResponse.json(
      {
        error:
          "Certificate template is missing. Place practicing-certificate.pdf in app/cert/.",
      },
      { status: 404 }
    );
  }
}
