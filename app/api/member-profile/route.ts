import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fetchCandidateExamSchedule,
  fetchMemberByEmail,
  fetchMemberByMembershipId,
  formatSupabaseError,
  type CandidateProfile,
  type MemberInformationRow,
} from "@/lib/candidateExamSchedule";

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

  if (!serviceKey) {
    console.warn(
      "member-profile: SUPABASE_SERVICE_ROLE_KEY is not set. Using anon key (RLS may restrict access)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function resolveMembershipId(
  candidate: CandidateProfile | null,
  membershipIdRaw: string | number
): number | null {
  if (candidate?.membership_id != null) {
    return candidate.membership_id;
  }
  const parsed = Number(String(membershipIdRaw).replace(/\D/g, ""));
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return null;
}

/**
 * GET /api/member-profile?membershipId=467
 * Optional: &email=... (fallback only if membership id lookup fails)
 *
 * memberinformation → membership_id, email, name
 * candidate_exam_schedule → profile by membership_id
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const email = (searchParams.get("email") ?? "").trim().toLowerCase();
    const membershipIdParam = searchParams.get("membershipId")?.trim();

    if (!email && !membershipIdParam) {
      return NextResponse.json(
        { error: "Provide either 'email' or 'membershipId' query parameter." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let member: MemberInformationRow | null = null;
    let lookupError: string | null = null;

    // memberinformation: resolve by membership_id first (login + profile flow).
    if (membershipIdParam) {
      const result = await fetchMemberByMembershipId(supabase, membershipIdParam);
      member = result.member;
      lookupError = result.error;
    }

    if (!member && email) {
      const result = await fetchMemberByEmail(supabase, email, membershipIdParam);
      member = result.member;
      if (result.error) lookupError = result.error;
    }

    if (!member) {
      return NextResponse.json(
        {
          error:
            lookupError ??
            "No membership record found for this email or Member ID.",
        },
        { status: 404 }
      );
    }

    const membershipIdRaw = member.membership_id;
    const { profile: candidate, error: candidateErr } =
      await fetchCandidateExamSchedule(supabase, membershipIdRaw);

    if (candidateErr && !candidate) {
      console.warn("Failed to fetch candidate profile:", candidateErr);
    }

    const membership_id = resolveMembershipId(candidate, membershipIdRaw);

    return NextResponse.json({
      member,
      candidate,
      membership_id,
    });
  } catch (error: unknown) {
    console.error("member-profile API error:", error);
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    );
  }
}
