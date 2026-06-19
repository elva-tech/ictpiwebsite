import { NextResponse } from "next/server";
import { buildBlogResourceSections } from "@/lib/courseStorageCatalog";

/** GET /api/blog-resources — faculty files under notes/blogs/ */
export async function GET() {
  try {
    const sections = await buildBlogResourceSections();
    return NextResponse.json({ sections });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("blog-resources GET:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
