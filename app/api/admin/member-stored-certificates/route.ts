import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/lib/candidateExamSchedule";
import { listCommonCertificatesForMembers } from "@/lib/commonCertificateStorage";
import { listMemberIcpaCertificates } from "@/lib/icpaCertificateStorage";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!url || !(serviceKey || anonKey)) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/admin/member-stored-certificates?membershipIds=100202,100203
 * Returns common (`certificates`) and ICPA (`icpa_certificates`) PDFs per member.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("membershipIds")?.trim() ?? "";
    const ids = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) {
      return NextResponse.json(
        { error: "Provide membershipIds as a comma-separated list." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const common = await listCommonCertificatesForMembers(supabase, ids);

    const icpa: Record<string, Awaited<ReturnType<typeof listMemberIcpaCertificates>>> =
      {};
    await Promise.all(
      ids.map(async (id) => {
        icpa[id] = await listMemberIcpaCertificates(supabase, id);
      })
    );

    return NextResponse.json({ common, icpa });
  } catch (error: unknown) {
    console.error("admin/member-stored-certificates:", error);
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    );
  }
}
