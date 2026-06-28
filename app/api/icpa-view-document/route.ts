import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isIcpaConfidentialViewPath } from "@/lib/icpaConfidentialPaths";
import { PRENOTES_BUCKET } from "@/lib/notesStorage";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabase() {
  const key = serviceKey || anonKey;
  if (!url || !key) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Stream a confidential ICPA PDF for in-app viewing only. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path")?.trim() ?? "";

    if (!isIcpaConfidentialViewPath(path)) {
      return NextResponse.json({ error: "Invalid document path." }, { status: 403 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(PRENOTES_BUCKET).download(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Document not found." },
        { status: 404 }
      );
    }

    const buffer = await data.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("icpa-view-document:", err);
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
