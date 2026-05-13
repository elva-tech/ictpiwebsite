"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import { Loader2, Search, Trash2 } from "lucide-react";

/**
 * Admin → Enquiries
 *
 * Lists every row in the `enquiry` table (membership_id, query) and enriches
 * each row with the member's name + email from `memberinformation` for the
 * current page.
 */

interface EnquiryRow {
  // The DB may or may not expose a stable id column; we include it if present
  // so we can delete an individual row, otherwise we delete by composite key.
  id?: number | string | null;
  membership_id: string | null;
  query: string | null;
  created_at?: string | null;
}

interface MemberLite {
  membership_id: number | string;
  name: string | null;
  email: string | null;
}

const NAVY = "#1e2659";
const PAGE_SIZES = [10, 25, 50, 100];

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function AdminEnquiriesPage() {
  const [rows, setRows] = useState<EnquiryRow[]>([]);
  const [memberMap, setMemberMap] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  /** Stable key for rows that don't have an `id` column. */
  const rowKey = (r: EnquiryRow, idx: number) =>
    r.id != null
      ? `id:${r.id}`
      : `mq:${r.membership_id ?? "_"}|${(r.query ?? "").slice(0, 60)}|${idx}`;

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Try to include `id` and `created_at` if they exist. If the columns are
      // absent in the schema we silently fall back to the documented two.
      let q = supabase
        .from("enquiry")
        .select("*", { count: "exact" })
        .range(from, to);

      const term = search.trim();
      if (term) {
        const like = `%${term}%`;
        q = q.or(
          [
            `membership_id.ilike.${like}`,
            `query.ilike.${like}`,
          ].join(",")
        );
      }

      const { data, count, error } = await q;
      if (error) throw error;

      const list = ((data as unknown as EnquiryRow[]) ?? []).map((r) => ({
        id: (r as { id?: number | string | null }).id ?? null,
        membership_id: r.membership_id ?? null,
        query: r.query ?? null,
        created_at:
          (r as { created_at?: string | null }).created_at ?? null,
      }));

      setRows(list);
      setTotal(count ?? 0);

      // Resolve member name/email for the visible page.
      const ids = Array.from(
        new Set(
          list
            .map((r) => (r.membership_id ?? "").trim())
            .filter((s) => s.length > 0)
        )
      );

      if (ids.length > 0) {
        // Try matching as numbers and strings — memberinformation may use
        // either type for membership_id.
        const asNumbers = ids
          .map((s) => Number(s))
          .filter((n) => Number.isFinite(n));

        const queries = [
          supabase
            .from("memberinformation")
            .select("membership_id, name, email")
            .in("membership_id", ids),
        ];
        if (asNumbers.length > 0) {
          queries.push(
            supabase
              .from("memberinformation")
              .select("membership_id, name, email")
              .in("membership_id", asNumbers)
          );
        }
        const results = await Promise.all(queries);
        const map: Record<string, { name: string; email: string }> = {};
        results.forEach((res) => {
          (res.data as MemberLite[] | null | undefined)?.forEach((m) => {
            const key = String(m.membership_id);
            map[key] = {
              name: m.name ?? "",
              email: m.email ?? "",
            };
          });
        });
        setMemberMap(map);
      } else {
        setMemberMap({});
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  const deleteRow = async (r: EnquiryRow, key: string) => {
    setDeletingKey(key);
    setToast(null);
    try {
      let del = supabase.from("enquiry").delete();
      if (r.id != null) {
        del = del.eq("id", r.id);
      } else {
        // Fallback: composite match. This will delete *all* rows with the
        // same membership_id + query if there are duplicates.
        del = del
          .eq("membership_id", r.membership_id ?? "")
          .eq("query", r.query ?? "");
      }
      const { error } = await del;
      if (error) throw error;
      setRows((prev) => prev.filter((_, i) => rowKey(_, i) !== key));
      setTotal((t) => Math.max(0, t - 1));
      setToast({ type: "ok", text: "Enquiry deleted." });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Could not delete enquiry.";
      setToast({ type: "err", text: msg });
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-bold text-[#1e2659] mb-2">Enquiries</h2>
        <p className="text-sm text-slate-500 mb-5">
          All queries submitted by members. Source:{" "}
          <span className="font-mono">enquiry</span>.
        </p>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search membership ID or query text…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-80"
            />
          </div>
        </div>

        {toast && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm ${
              toast.type === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {toast.text}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 text-left font-semibold">SR. NO</th>
                <th className="px-3 py-3 text-left font-semibold">
                  Membership ID
                </th>
                <th className="px-3 py-3 text-left font-semibold">Name</th>
                <th className="px-3 py-3 text-left font-semibold">Email</th>
                <th className="px-3 py-3 text-left font-semibold">Query</th>
                <th className="px-3 py-3 text-left font-semibold">Received</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading enquiries…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const key = rowKey(r, i);
                  const memberKey = (r.membership_id ?? "").trim();
                  const meta = memberMap[memberKey];
                  return (
                    <tr
                      key={key}
                      className="border-t border-slate-100 hover:bg-slate-50 align-top"
                    >
                      <td className="px-3 py-3">{startIdx + i + 1}.</td>
                      <td className="px-3 py-3 font-mono">
                        {r.membership_id || "—"}
                      </td>
                      <td className="px-3 py-3">{meta?.name || "—"}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {meta?.email || "—"}
                      </td>
                      <td
                        className="px-3 py-3 text-slate-800 max-w-md"
                        title={r.query ?? ""}
                      >
                        {r.query || "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {r.created_at ? fmtDateTime(r.created_at) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          disabled={deletingKey === key}
                          onClick={() => deleteRow(r, key)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                          title="Delete this enquiry"
                        >
                          {deletingKey === key ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing {total === 0 ? 0 : startIdx + 1} to{" "}
              {Math.min(startIdx + pageSize, total)} of {total} rows
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-3 rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>rows per page</span>
          </div>
          <Pager
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </AdminShell>
  );
}

// Keep an unused style ref so lint won't yell on imports — used inline above.
void NAVY;

/* ---------- Pager ---------- */

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];
  const push = (n: number | "…") => pages.push(n);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) push("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) push(i);
    if (page < totalPages - 2) push("…");
    push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 rounded-md border border-slate-200 disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 w-7 rounded-md text-xs font-semibold ${
              p === page
                ? "bg-[#1e2659] text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 rounded-md border border-slate-200 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}
