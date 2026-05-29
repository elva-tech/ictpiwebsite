import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeMembershipId } from "@/lib/membershipId";
import { checkMembershipIdAvailability } from "@/lib/membershipIdAvailability";

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

function isMissingColumnError(message: string) {
  return /could not find the .* column .* in the schema cache/i.test(message);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const first_name = String(body.first_name ?? "").trim();
    const last_name = String(body.last_name ?? "").trim();
    const middle_name = String(body.middle_name ?? "").trim() || null;
    const mobile_number = String(body.mobile_number ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const date_of_birth = body.date_of_birth
      ? String(body.date_of_birth).slice(0, 10)
      : null;

    const country = String(body.country ?? "India").trim() || "India";
    const state = String(body.state ?? "").trim() || null;
    const district = String(body.district ?? "").trim() || null;
    const city = String(body.city ?? "").trim() || null;
    const pincode = String(body.pincode ?? "").trim() || null;
    const address_line1 = String(body.address_line1 ?? "").trim() || null;
    const address_line2 = String(body.address_line2 ?? "").trim() || null;
    const address_line3 = String(body.address_line3 ?? "").trim() || null;

    const member_category = String(body.member_category ?? "").trim() || null;
    const membershipRaw = String(body.membership_number ?? "").trim();
    const membership_number = normalizeMembershipId(membershipRaw);

    const itp_enrollment_number =
      String(body.itp_enrollment_number ?? "").trim() || null;
    const gstp_enrollment_number =
      String(body.gstp_enrollment_number ?? "").trim() || null;
    const itp_gstp_combined_enrollment =
      String(body.itp_gstp_combined_enrollment ?? "").trim() || null;
    const stp_vat_enrollment_number =
      String(body.stp_vat_enrollment_number ?? "").trim() || null;
    const cb_license_number = String(body.cb_license_number ?? "").trim() || null;

    const terms_accepted = Boolean(body.terms_accepted);

    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 }
      );
    }
    if (!mobile_number || mobile_number.length > 15) {
      return NextResponse.json(
        { error: "Valid mobile number is required (max 15 characters)." },
        { status: 400 }
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!member_category) {
      return NextResponse.json(
        { error: "Member category is required." },
        { status: 400 }
      );
    }
    if (!membership_number) {
      return NextResponse.json(
        { error: "A valid Membership ID is required." },
        { status: 400 }
      );
    }
    if (!terms_accepted) {
      return NextResponse.json(
        { error: "You must accept the terms and privacy policy." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const availability = await checkMembershipIdAvailability(supabase, membership_number);
    if (!availability.available) {
      return NextResponse.json(
        {
          error: "This Membership ID is already registered.",
          suggestions: availability.suggestions,
        },
        { status: 409 }
      );
    }

    const basePayload = {
      first_name: first_name.slice(0, 100),
      middle_name: middle_name ? middle_name.slice(0, 100) : null,
      last_name: last_name.slice(0, 100),
      mobile_number: mobile_number.slice(0, 15),
      email: email.slice(0, 150),
      date_of_birth,
      password_hash: password,
      country: country.slice(0, 100),
      state: state ? state.slice(0, 100) : null,
      district: district ? district.slice(0, 100) : null,
      city: city ? city.slice(0, 100) : null,
      pincode: pincode ? pincode.slice(0, 10) : null,
      address_line1,
      address_line2,
      address_line3,
      member_category: member_category ? member_category.slice(0, 100) : null,
      membership_number: membership_number.slice(0, 100),
      terms_accepted,
    };

    const enrollmentPayload = {
      itp_enrollment_number: itp_enrollment_number.slice(0, 100),
      gstp_enrollment_number: gstp_enrollment_number.slice(0, 100),
      itp_gstp_combined_enrollment: itp_gstp_combined_enrollment
        ? itp_gstp_combined_enrollment.slice(0, 100)
        : null,
      stp_vat_enrollment_number: stp_vat_enrollment_number
        ? stp_vat_enrollment_number.slice(0, 100)
        : null,
      cb_license_number: cb_license_number ? cb_license_number.slice(0, 100) : null,
    };

    let { data, error } = await supabase
      .from("new_member_request")
      .insert({ ...basePayload, ...enrollmentPayload })
      .select("id")
      .single();

    // Compatibility fallback while DB/PostgREST cache is missing new columns.
    if (error && isMissingColumnError(error.message ?? "")) {
      const retry = await supabase
        .from("new_member_request")
        .insert(basePayload)
        .select("id")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      const msg = error.message ?? "Insert failed";
      if (/duplicate|unique/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              "This email, mobile number, or membership number is already registered.",
          },
          { status: 409 }
        );
      }
      console.error("new_member_request insert:", error);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
