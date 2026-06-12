import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeMembershipId } from "@/lib/membershipId";

/** Columns matching `public.candidate_exam_schedule` (quoted identifiers as in Postgres). */
export const CANDIDATE_EXAM_SCHEDULE_SELECT = `
  membership_id,
  name,
  place,
  state,
  can_id,
  batch_id,
  batch_name,
  mepsc_assesment,
  next_step,
  qualification_status,
  self_test_practice,
  mock_exam,
  final_ctpr_exam,
  exam_date,
  date_of_birth,
  it_pan,
  aadhar,
  voter,
  father_name,
  mother_name,
  address,
  district,
  pincode,
  joined,
  completed,
  "NCVET",
  gstp,
  "ITP",
  "SIDH",
  "STP",
  "CB"
`;

export interface CandidateProfile {
  membership_id: number;
  name: string | null;
  place: string | null;
  state: string | null;
  can_id: string | null;
  batch_id: string | null;
  batch_name: string | null;
  mepsc_assesment: string | null;
  next_step: string | null;
  qualification_status: string | null;
  self_test_practice: string | null;
  mock_exam: string | null;
  final_ctpr_exam: string | null;
  exam_date: string | null;
  date_of_birth: string | null;
  it_pan: string | null;
  aadhar: string | null;
  voter: string | null;
  father_name: string | null;
  mother_name: string | null;
  address: string | null;
  district: string | null;
  pincode: string | null;
  joined: string | null;
  completed: string | null;
  NCVET: string | null;
  gstp: string | null;
  ITP: string | null;
  SIDH: string | null;
  STP: string | null;
  CB: string | null;
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t.length ? t : null;
}

function isSchemaOrColumnError(message: string): boolean {
  return /column|schema cache|does not exist/i.test(message);
}

/** Turn PostgREST / Supabase errors into a readable string (avoids logging `{}`). */
export function formatSupabaseError(err: unknown): string {
  if (!err) return "Unknown database error";
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    const parts = [
      o.message,
      o.details,
      o.hint,
      o.code ? `code ${o.code}` : null,
    ].filter((p) => typeof p === "string" && p.trim().length > 0);
    if (parts.length) return parts.join(" — ");
  }
  try {
    const s = JSON.stringify(err);
    if (s && s !== "{}") return s;
  } catch {
    /* ignore */
  }
  return "Database request failed. Please try again or contact support.";
}

/** Build numeric membership_id values to try against `candidate_exam_schedule.membership_id`. */
export function membershipIdLookupValues(raw: unknown): number[] {
  const out = new Set<number>();
  const norm = normalizeMembershipId(String(raw ?? ""));
  if (norm) {
    const n = Number(norm);
    if (Number.isFinite(n) && n > 0) out.add(n);
  }
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits) {
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) out.add(n);
  }
  const direct = Number(raw);
  if (Number.isFinite(direct) && direct > 0) out.add(Math.floor(direct));
  return [...out];
}

export function mapCandidateRow(row: Record<string, unknown>): CandidateProfile {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = strOrNull(row[k]);
      if (v) return v;
    }
    return null;
  };

  const mid = Number(row.membership_id);
  return {
    membership_id: Number.isFinite(mid) ? mid : 0,
    name: strOrNull(row.name),
    place: strOrNull(row.place),
    state: strOrNull(row.state),
    can_id: strOrNull(row.can_id),
    batch_id: strOrNull(row.batch_id),
    batch_name: strOrNull(row.batch_name),
    mepsc_assesment: strOrNull(row.mepsc_assesment),
    next_step: strOrNull(row.next_step),
    qualification_status: strOrNull(row.qualification_status),
    self_test_practice: strOrNull(row.self_test_practice),
    mock_exam: strOrNull(row.mock_exam),
    final_ctpr_exam: strOrNull(row.final_ctpr_exam),
    exam_date: strOrNull(row.exam_date),
    date_of_birth: strOrNull(row.date_of_birth),
    it_pan: strOrNull(row.it_pan),
    aadhar: strOrNull(row.aadhar),
    voter: strOrNull(row.voter),
    father_name: strOrNull(row.father_name),
    mother_name: strOrNull(row.mother_name),
    address: strOrNull(row.address),
    district: strOrNull(row.district),
    pincode: strOrNull(row.pincode),
    joined: strOrNull(row.joined),
    completed: strOrNull(row.completed),
    NCVET: pick("NCVET", "ncvet"),
    gstp: strOrNull(row.gstp),
    ITP: pick("ITP", "itp"),
    SIDH: pick("SIDH", "sidh"),
    STP: pick("STP", "stp"),
    CB: pick("CB", "cb"),
  };
}

export function emptyCandidateProfile(
  membershipId: number,
  name: string | null
): CandidateProfile {
  return {
    membership_id: membershipId,
    name,
    place: null,
    state: null,
    can_id: null,
    batch_id: null,
    batch_name: null,
    mepsc_assesment: null,
    next_step: null,
    qualification_status: null,
    self_test_practice: null,
    mock_exam: null,
    final_ctpr_exam: null,
    exam_date: null,
    date_of_birth: null,
    it_pan: null,
    aadhar: null,
    voter: null,
    father_name: null,
    mother_name: null,
    address: null,
    district: null,
    pincode: null,
    joined: null,
    completed: null,
    NCVET: null,
    gstp: null,
    ITP: null,
    SIDH: null,
    STP: null,
    CB: null,
  };
}

async function queryCandidateRow(
  supabase: SupabaseClient,
  membershipId: number,
  select: string
): Promise<{ row: Record<string, unknown> | null; error: string | null }> {
  const { data, error } = await supabase
    .from("candidate_exam_schedule")
    .select(select)
    .eq("membership_id", membershipId)
    .limit(1);

  if (error) {
    return { row: null, error: error.message ?? "Query failed" };
  }
  const first = data?.[0];
  const row =
    first && typeof first === "object"
      ? (first as Record<string, unknown>)
      : null;
  return { row, error: null };
}

/**
 * Load one `candidate_exam_schedule` row for a membership id.
 * Tries normalized ids, falls back to `select *` if quoted columns fail in PostgREST.
 */
export async function fetchCandidateExamSchedule(
  supabase: SupabaseClient,
  membershipIdRaw: unknown
): Promise<{ profile: CandidateProfile | null; error: string | null }> {
  const ids = membershipIdLookupValues(membershipIdRaw);
  if (ids.length === 0) {
    return { profile: null, error: "Invalid membership ID" };
  }

  let lastError: string | null = null;

  for (const mid of ids) {
    let { row, error } = await queryCandidateRow(
      supabase,
      mid,
      CANDIDATE_EXAM_SCHEDULE_SELECT
    );

    if (error && isSchemaOrColumnError(error)) {
      const fallback = await queryCandidateRow(supabase, mid, "*");
      row = fallback.row;
      error = fallback.error;
    }

    if (error) {
      lastError = error;
      continue;
    }
    if (row) {
      return { profile: mapCandidateRow(row), error: null };
    }
  }

  return { profile: null, error: lastError };
}

export interface MemberInformationRow {
  membership_id: string | number;
  name: string | null;
  email: string | null;
}

const MEMBER_SELECT = "membership_id, name, email";

/** All string forms of membership_id stored in `memberinformation` (varchar). */
export function membershipIdStringVariants(raw: unknown): string[] {
  const out = new Set<string>();
  const t = String(raw ?? "").trim();
  if (!t) return [];

  const digits = t.replace(/\D/g, "");
  const isNumericOnly = digits.length > 0 && digits === t.replace(/\s/g, "");

  if (isNumericOnly) {
    out.add(t);
    out.add(digits);
    const n = Number(digits);
    if (Number.isFinite(n) && n > 0) {
      out.add(String(n));
      out.add(String(n).padStart(5, "0"));
    }
  } else {
    out.add(t);
    out.add(t.toUpperCase());
    out.add(t.toLowerCase());
    if (digits) {
      out.add(digits);
      const n = Number(digits);
      if (Number.isFinite(n) && n > 0) {
        out.add(String(n));
        out.add(String(n).padStart(5, "0"));
      }
    }
  }

  for (const id of membershipIdLookupValues(raw)) {
    out.add(String(id));
    out.add(String(id).padStart(5, "0"));
  }
  return [...out].filter(Boolean);
}

function pickMemberRow(
  data: unknown[] | null | undefined
): MemberInformationRow | null {
  const row = data?.[0] as MemberInformationRow | undefined;
  if (row?.membership_id == null || String(row.membership_id).trim() === "") {
    return null;
  }
  return row;
}

/** Lookup by membership_id (varchar) — matches how login resolves Member ID. */
export async function fetchMemberByMembershipId(
  supabase: SupabaseClient,
  membershipIdRaw: unknown
): Promise<{ member: MemberInformationRow | null; error: string | null }> {
  const variants = membershipIdStringVariants(membershipIdRaw);
  if (variants.length === 0) {
    return { member: null, error: "Invalid membership ID" };
  }

  let lastError: string | null = null;
  for (const vid of variants) {
    const { data, error } = await supabase
      .from("memberinformation")
      .select(MEMBER_SELECT)
      .eq("membership_id", vid)
      .limit(1);

    if (error) {
      lastError = formatSupabaseError(error);
      continue;
    }
    const row = pickMemberRow(data);
    if (row) return { member: row, error: null };
  }

  return { member: null, error: lastError };
}

/** Case-insensitive email lookup; optional membership id hint if email column mismatches. */
export async function fetchMemberByEmail(
  supabase: SupabaseClient,
  email: string,
  membershipIdHint?: string | number | null
): Promise<{ member: MemberInformationRow | null; error: string | null }> {
  const trimmed = email.trim();
  const lower = trimmed.toLowerCase();
  if (!lower && membershipIdHint == null) {
    return { member: null, error: "Missing email" };
  }

  let lastError: string | null = null;

  if (lower) {
    const queries = [
      supabase
        .from("memberinformation")
        .select(MEMBER_SELECT)
        .eq("email", lower)
        .limit(1),
      supabase
        .from("memberinformation")
        .select(MEMBER_SELECT)
        .eq("email", trimmed)
        .limit(1),
      supabase
        .from("memberinformation")
        .select(MEMBER_SELECT)
        .ilike("email", lower)
        .limit(1),
    ];

    for (const query of queries) {
      const { data, error } = await query;
      if (error) {
        lastError = formatSupabaseError(error);
        continue;
      }
      const row = pickMemberRow(data);
      if (row) return { member: row, error: null };
    }
  }

  if (membershipIdHint != null) {
    const byId = await fetchMemberByMembershipId(supabase, membershipIdHint);
    if (byId.member) return byId;
    if (byId.error) lastError = byId.error;
  }

  return { member: null, error: lastError };
}

export interface MemberProfilePayload {
  member: MemberInformationRow | null;
  candidate: CandidateProfile | null;
}

async function loadMemberProfileFromApi(
  membershipId: string | number
): Promise<MemberProfilePayload | null> {
  const qs = new URLSearchParams();
  qs.set("membershipId", String(membershipId).trim());

  try {
    const res = await fetch(`/api/member-profile?${qs.toString()}`);
    const json = (await res.json().catch(() => ({}))) as {
      member?: MemberInformationRow | null;
      candidate?: CandidateProfile | null;
      error?: string;
    };

    if (res.ok && json.member?.membership_id != null) {
      return {
        member: json.member,
        candidate: json.candidate ?? null,
      };
    }
    if (!res.ok) {
      const apiMsg =
        typeof json.error === "string" && json.error.trim()
          ? json.error.trim()
          : `Profile service returned ${res.status}`;
      console.warn("member-profile API:", apiMsg);
    }
  } catch (apiErr) {
    console.warn("member-profile API unavailable:", apiErr);
  }
  return null;
}

async function loadMemberProfileClientByMembershipId(
  supabaseClient: SupabaseClient,
  membershipId: string | number
): Promise<{ data: MemberProfilePayload | null; error: string | null }> {
  const { member, error: memberErr } = await fetchMemberByMembershipId(
    supabaseClient,
    membershipId
  );

  if (!member?.membership_id) {
    return {
      data: null,
      error:
        memberErr ??
        "No membership record found for this Member ID in memberinformation.",
    };
  }

  const { profile, error: candidateErr } = await fetchCandidateExamSchedule(
    supabaseClient,
    member.membership_id
  );

  if (candidateErr && !profile) {
    console.warn("candidate_exam_schedule client fetch:", candidateErr);
  }

  return {
    data: { member, candidate: profile },
    error: null,
  };
}

/**
 * Load member from `memberinformation` and profile from `candidate_exam_schedule`
 * using membership_id only.
 */
export async function loadMemberProfileByMembershipId(
  supabaseClient: SupabaseClient,
  membershipId: string | number | null | undefined
): Promise<{ data: MemberProfilePayload | null; error: string | null }> {
  const id =
    membershipId != null && String(membershipId).trim() !== ""
      ? String(membershipId).trim()
      : null;

  if (!id) {
    return {
      data: null,
      error: "Missing Member ID. Please sign in again with your Member ID.",
    };
  }

  const byIdApi = await loadMemberProfileFromApi(id);
  if (byIdApi?.member) {
    return { data: byIdApi, error: null };
  }

  return loadMemberProfileClientByMembershipId(supabaseClient, id);
}

/** @deprecated Prefer loadMemberProfileByMembershipId with session-stored Member ID. */
export async function loadMemberProfileByEmail(
  email: string,
  supabaseClient: SupabaseClient,
  membershipIdHint?: string | number | null
): Promise<{ data: MemberProfilePayload | null; error: string | null }> {
  const hint =
    membershipIdHint != null && String(membershipIdHint).trim() !== ""
      ? membershipIdHint
      : null;

  if (hint != null) {
    return loadMemberProfileByMembershipId(supabaseClient, hint);
  }

  const norm = email.toLowerCase().trim();
  if (!norm) {
    return { data: null, error: "Missing email or Member ID" };
  }

  const { member, error: memberErr } = await fetchMemberByEmail(
    supabaseClient,
    norm,
    null
  );
  if (!member?.membership_id) {
    return {
      data: null,
      error: memberErr ?? "No membership record found for this email.",
    };
  }

  return loadMemberProfileByMembershipId(supabaseClient, member.membership_id);
}
