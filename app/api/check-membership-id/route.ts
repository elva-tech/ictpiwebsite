import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? "";
    const supabase = getSupabaseAdmin();
    const result = await checkMembershipIdAvailability(supabase, id);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
