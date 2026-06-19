import { membershipIdLookupValues } from "@/lib/candidateExamSchedule";

export interface EnquiryRecord {
  id?: number | string | null;
  membership_id: string | null;
  query: string | null;
  created_at?: string | null;
  resolved?: boolean | number | string | null;
  remarks?: string | null;
}

const DISMISSED_REMARKS_KEY = "ictpi-dismissed-remarks-enquiries";

export const ENQUIRY_REMARKS_MAX = 500;

/** DB `resolved` column — true / 1 means admin marked this enquiry resolved. */
export function isEnquiryResolved(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (value === false || value === 0) return false;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (!v || v === "0" || v === "false" || v === "no") return false;
    return v === "1" || v === "true" || v === "yes";
  }
  return false;
}

export function hasEnquiryRemarks(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasEnquiryQuery(query: unknown): boolean {
  return typeof query === "string" && query.trim().length > 0;
}

/** Normalize a raw Supabase `enquiry` row. */
export function mapEnquiryRow(row: unknown): EnquiryRecord {
  const r = (row ?? {}) as Record<string, unknown>;
  const strOrNull = (v: unknown): string | null => {
    if (v == null) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  };
  return {
    id: r.id as EnquiryRecord["id"] ?? null,
    membership_id: r.membership_id != null ? String(r.membership_id) : null,
    query: typeof r.query === "string" ? r.query : strOrNull(r.query),
    created_at: typeof r.created_at === "string" ? r.created_at : null,
    resolved: r.resolved as EnquiryRecord["resolved"] ?? null,
    remarks: typeof r.remarks === "string" ? r.remarks : strOrNull(r.remarks),
  };
}

/** String values for `enquiry.membership_id` (VARCHAR). */
export function enquiryMembershipIdVariants(raw: unknown): string[] {
  const out = new Set<string>();
  const add = (v: unknown) => {
    const s = String(v ?? "").trim();
    if (!s) return;
    out.add(s.length <= 10 ? s : s.slice(0, 10));
  };
  add(raw);
  for (const n of membershipIdLookupValues(raw)) {
    add(n);
    add(String(n).padStart(5, "0"));
  }
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits) add(digits);
  return [...out];
}

export type RemarksEnquiryNotice = EnquiryRecord & { key: string; remarks: string };

/** Load enquiry rows for a member via server API (avoids client RLS blocks). */
export async function fetchMemberEnquiries(
  membershipIdRaw: string | number | null | undefined
): Promise<EnquiryRecord[]> {
  const variants = enquiryMembershipIdVariants(membershipIdRaw);
  if (!variants.length) return [];

  try {
    const res = await fetch(
      `/api/member-enquiries?membershipId=${encodeURIComponent(variants[0])}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      console.error(
        "fetchMemberEnquiries:",
        body.error ?? res.statusText ?? res.status
      );
      return [];
    }
    const body = (await res.json()) as { enquiries?: EnquiryRecord[] };
    return body.enquiries ?? [];
  } catch (e) {
    console.error("fetchMemberEnquiries:", e);
    return [];
  }
}

export function buildRemarksNotices(rows: EnquiryRecord[]): RemarksEnquiryNotice[] {
  const dismissed = getDismissedRemarksEnquiryKeys();

  for (const row of rows) {
    if (!hasEnquiryQuery(row.query)) continue;
    const remarksText = row.remarks?.trim();
    if (!remarksText) continue;
    const key = enquiryRemarksNoticeKey(row);
    if (dismissed.has(key)) continue;
    return [{ ...row, key, remarks: remarksText }];
  }

  return [];
}

/** Enquiries with admin remarks the member has not dismissed yet. */
export async function fetchPendingRemarksEnquiryNotices(
  membershipIdRaw: string | number | null | undefined
): Promise<RemarksEnquiryNotice[]> {
  const rows = await fetchMemberEnquiries(membershipIdRaw);
  return buildRemarksNotices(rows);
}

export function enquiryRowKey(row: EnquiryRecord, idx = 0): string {
  if (row.id != null) return `id:${row.id}`;
  return `mq:${row.membership_id ?? "_"}|${(row.query ?? "").slice(0, 80)}|${row.created_at ?? ""}|${idx}`;
}

export function enquiryRemarksNoticeKey(row: EnquiryRecord, idx = 0): string {
  if (row.id != null) return `remarks:id:${row.id}`;
  return `remarks:${enquiryRowKey(row, idx)}`;
}

/** Persist that the member has seen this remarks notice (one-time). */
export function markRemarksEnquirySeen(key: string): void {
  dismissRemarksEnquiry(key);
}

function readDismissedSet(storageKey: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey);
    const list = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(list)) return new Set();
    return new Set(list.filter((k) => typeof k === "string") as string[]);
  } catch {
    return new Set();
  }
}

function writeDismissedSet(storageKey: string, seen: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify([...seen]));
}

export function getDismissedRemarksEnquiryKeys(): Set<string> {
  return readDismissedSet(DISMISSED_REMARKS_KEY);
}

export function dismissRemarksEnquiry(key: string): void {
  const seen = getDismissedRemarksEnquiryKeys();
  seen.add(key);
  writeDismissedSet(DISMISSED_REMARKS_KEY, seen);
}
