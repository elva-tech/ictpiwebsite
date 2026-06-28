import { NextResponse } from "next/server";
import { buildPremResourceSections } from "@/lib/courseStorageCatalog";

/** GET /api/prem-resources — view-only files under `prenotes/prem/`. */
export async function GET() {
  try {
    const sections = await buildPremResourceSections();
    return NextResponse.json({ sections });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("prem-resources GET:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
