import { NextResponse } from "next/server";
import { buildBlogResourceSections } from "@/lib/courseStorageCatalog";

/** GET /api/blog-resources?premium=1 — faculty files under blogs/ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isPremium =
      searchParams.get("premium") === "1" ||
      searchParams.get("premium") === "true";

    const sections = await buildBlogResourceSections({ isPremium });
    return NextResponse.json({ isPremium, sections });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("blog-resources GET:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
