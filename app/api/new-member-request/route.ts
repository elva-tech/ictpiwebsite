import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const membership_number = String(body.membership_number ?? "").trim() || null;
    const primary_applicable_license =
      String(body.primary_applicable_license ?? "").trim() || null;

    const licensed_custom_broker_cha = Boolean(body.licensed_custom_broker_cha);
    const cha_registration_number =
      String(body.cha_registration_number ?? "").trim() || null;
    const registered_investment_advisor = Boolean(
      body.registered_investment_advisor
    );
    const investment_advisor_registration_number =
      String(body.investment_advisor_registration_number ?? "").trim() || null;
    const insolvency_practitioner = Boolean(body.insolvency_practitioner);
    const insolvency_registration_number =
      String(body.insolvency_registration_number ?? "").trim() || null;
    const registered_sales_tax_vat_practitioner = Boolean(
      body.registered_sales_tax_vat_practitioner
    );
    const sales_tax_registration_number =
      String(body.sales_tax_registration_number ?? "").trim() || null;

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
    if (!terms_accepted) {
      return NextResponse.json(
        { error: "You must accept the terms and privacy policy." },
        { status: 400 }
      );
    }

    // No encryption — the admin handles the password downstream. The raw value
    // entered by the user is forwarded to the DB column as-is.
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("new_member_request")
      .insert({
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
        membership_number: membership_number
          ? membership_number.slice(0, 100)
          : null,
        primary_applicable_license: primary_applicable_license
          ? primary_applicable_license.slice(0, 150)
          : null,
        licensed_custom_broker_cha,
        cha_registration_number: cha_registration_number
          ? cha_registration_number.slice(0, 100)
          : null,
        registered_investment_advisor,
        investment_advisor_registration_number:
          investment_advisor_registration_number
            ? investment_advisor_registration_number.slice(0, 100)
            : null,
        insolvency_practitioner,
        insolvency_registration_number: insolvency_registration_number
          ? insolvency_registration_number.slice(0, 100)
          : null,
        registered_sales_tax_vat_practitioner,
        sales_tax_registration_number: sales_tax_registration_number
          ? sales_tax_registration_number.slice(0, 100)
          : null,
        terms_accepted,
      })
      .select("id")
      .single();

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
