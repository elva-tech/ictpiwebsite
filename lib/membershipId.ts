/** Normalize user input to a positive integer membership id string (no leading zeros). */
export function normalizeMembershipId(raw: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 1 || n > 999999999) return null;
  return String(n);
}

/** Format for display (5-digit pad, common in ICTPI UI). */
export function formatMembershipIdDisplay(id: string | number): string {
  const n = Number(id);
  if (!Number.isFinite(n)) return String(id);
  return String(n).padStart(5, "0");
}

/** Practicing certificate number: 101/<year>/<membershipId> */
export function formatPracticingCertificateNo(membershipId: number | string): string {
  const year = new Date().getFullYear();
  const id = normalizeMembershipId(String(membershipId)) ?? String(membershipId);
  return `101/${year}/${id}`;
}

/** Issue date printed on the practicing certificate (DD/MM/YYYY). */
export function formatCertificateIssueDate(d = new Date()): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Pick up to `count` membership ids starting at `start`, skipping any in `taken`.
 */
export function suggestAvailableMembershipIds(
  taken: Set<number>,
  start: number,
  count = 5
): string[] {
  const out: string[] = [];
  let cursor = Math.max(1, Math.floor(start));
  while (out.length < count && cursor < 999999999) {
    if (!taken.has(cursor)) out.push(String(cursor));
    cursor += 1;
  }
  return out;
}
