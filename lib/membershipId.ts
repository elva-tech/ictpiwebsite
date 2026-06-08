/** Trim member ID as entered (no forced casing). */
export function sanitizeMemberIdInput(raw: string): string {
  return String(raw ?? "").trim();
}

/** Normalize user input to a positive integer membership id string (no leading zeros). */
export function normalizeMembershipId(raw: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 1 || n > 999999999) return null;
  return String(n);
}

/** Format for display (no leading zeros). */
export function formatMembershipIdDisplay(id: string | number): string {
  const norm = normalizeMembershipId(String(id));
  if (norm) return norm;
  const n = Number(id);
  if (Number.isFinite(n)) return String(n);
  return String(id);
}

/** Last 4 digit characters of membership ID, without leading zeros (e.g. 101799 → "1799", 467 → "467"). */
export function membershipIdLastFourDigits(membershipId: number | string): string {
  const id = normalizeMembershipId(String(membershipId)) ?? String(membershipId).replace(/\D/g, "");
  const digits = id.replace(/\D/g, "") || "0";
  const last4 = digits.slice(-4);
  return last4.replace(/^0+/, "") || "0";
}

export interface PracticingCertificateNoParts {
  /** Last 4 digits of membership ID */
  prefix: string;
  year: string;
  /** Full membership ID (no leading zeros) */
  membershipId: string;
}

/** Certificate No. parts: <last4>/<year>/<membershipId> */
export function getPracticingCertificateNoParts(
  membershipId: number | string
): PracticingCertificateNoParts {
  const id = normalizeMembershipId(String(membershipId)) ?? String(membershipId);
  return {
    prefix: membershipIdLastFourDigits(id),
    year: String(new Date().getFullYear()),
    membershipId: formatMembershipIdDisplay(id),
  };
}

/** Practicing certificate number: <last4>/<year>/<membershipId> */
export function formatPracticingCertificateNo(membershipId: number | string): string {
  const { prefix, year, membershipId: id } =
    getPracticingCertificateNoParts(membershipId);
  return `${prefix}/${year}/${id}`;
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
