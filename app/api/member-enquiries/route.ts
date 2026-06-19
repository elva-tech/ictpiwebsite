import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/lib/candidateExamSchedule";
import {
  enquiryMembershipIdVariants,
  mapEnquiryRow,
  type EnquiryRecord,
} from "@/lib/enquiry";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  const key = serviceKey || anonKey;
  if (!key) {
    throw new Error(
      "Missing Supabase keys: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sortEnquiries(rows: EnquiryRecord[]): EnquiryRecord[] {
  return [...rows].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) {
      return tb - ta;
    }
    const idA = a.id != null ? Number(a.id) : NaN;
    const idB = b.id != null ? Number(b.id) : NaN;
    if (Number.isFinite(idA) && Number.isFinite(idB)) return idB - idA;
    return 0;
  });
}

/**
 * GET /api/member-enquiries?membershipId=100202
 * Returns enquiry rows for the member (bypasses client RLS when service key is set).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const membershipIdParam = searchParams.get("membershipId")?.trim();

    if (!membershipIdParam) {
      return NextResponse.json(
        { error: "Provide a 'membershipId' query parameter." },
        { status: 400 }
      );
    }

    const variants = enquiryMembershipIdVariants(membershipIdParam);
    if (!variants.length) {
      return NextResponse.json({ enquiries: [] });
    }

    const supabase = getSupabaseAdmin();

    let { data, error } = await supabase
      .from("enquiry")
      .select("id, membership_id, query, remarks, resolved, created_at")
      .in("membership_id", variants);

    if (error) {
      const fallback = await supabase
        .from("enquiry")
        .select("membership_id, query")
        .in("membership_id", variants);

      if (fallback.error) {
        return NextResponse.json(
          { error: formatSupabaseError(fallback.error) },
          { status: 500 }
        );
      }

      data = fallback.data;
    }

    const enquiries = sortEnquiries(
      ((data as Record<string, unknown>[]) ?? []).map((row) => mapEnquiryRow(row))
    );

    return NextResponse.json({ enquiries });
  } catch (error: unknown) {
    console.error("member-enquiries API error:", error);
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    );
  }
}
