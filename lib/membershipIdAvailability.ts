import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeMembershipId,
  suggestAvailableMembershipIds,
} from "@/lib/membershipId";

export type MembershipIdCheckResult = {
  normalizedId: string | null;
  available: boolean;
  suggestions: string[];
};

/** Load all membership ids currently reserved in the system. */
export async function loadTakenMembershipIds(
  supabase: SupabaseClient
): Promise<Set<number>> {
  const taken = new Set<number>();

  const add = (v: unknown) => {
    const n = Number(String(v ?? "").replace(/\D/g, ""));
    if (Number.isFinite(n) && n > 0) taken.add(n);
  };

  const [mi, ces, pending] = await Promise.all([
    supabase.from("memberinformation").select("membership_id"),
    supabase.from("candidate_exam_schedule").select("membership_id"),
    supabase.from("new_member_request").select("membership_number"),
  ]);

  (mi.data ?? []).forEach((r: { membership_id?: unknown }) => add(r.membership_id));
  (ces.data ?? []).forEach((r: { membership_id?: unknown }) => add(r.membership_id));
  (pending.data ?? []).forEach((r: { membership_number?: unknown }) =>
    add(r.membership_number)
  );

  return taken;
}

export async function checkMembershipIdAvailability(
  supabase: SupabaseClient,
  rawId: string,
  suggestionCount = 5
): Promise<MembershipIdCheckResult> {
  const normalizedId = normalizeMembershipId(rawId);
  if (!normalizedId) {
    const taken = await loadTakenMembershipIds(supabase);
    const max = taken.size ? Math.max(...taken) : 100000;
    return {
      normalizedId: null,
      available: false,
      suggestions: suggestAvailableMembershipIds(taken, max + 1, suggestionCount),
    };
  }

  const taken = await loadTakenMembershipIds(supabase);
  const num = Number(normalizedId);
  const available = !taken.has(num);

  const startHint = available ? num + 1 : num + 1;
  const suggestions = available
    ? []
    : suggestAvailableMembershipIds(taken, startHint, suggestionCount);

  return { normalizedId, available, suggestions };
}
