"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";

/**
 * Admin → Referrals
 *
 * Full CRUD on the `referals` table (note the spelling matches the DB).
 *
 * Schema:
 *   name           varchar(100)  null
 *   phone          varchar(10)   null
 *   email          varchar(100)  null
 *   qualification  varchar(1000) null
 *
 * The table has no primary key, so updates / deletes are scoped by the
 * row's full original snapshot to avoid touching other rows that happen
 * to share a value. The pattern is:
 *   .match(originalRow)
 * which translates to a WHERE clause matching every column.
 */

interface ReferralRow {
  name: string | null;
  phone: string | null;
  email: string | null;
  qualification: string | null;
}

const NAVY = "#1e2659";
const PAGE_SIZES = [10, 25, 50, 100];

const EMPTY_ROW: ReferralRow = {
  name: "",
  phone: "",
  email: "",
  qualification: "",
};

function rowKey(r: ReferralRow, idx: number): string {
  return `${idx}|${r.name ?? ""}|${r.phone ?? ""}|${r.email ?? ""}|${(
    r.qualification ?? ""
  ).slice(0, 80)}`;
}

function matchPayload(r: ReferralRow): Record<string, string | null> {
  // Supabase `match` requires non-null values, so swap nulls for empty
  // strings only if the stored value is actually null. We use `.is(col, null)`
  // chained for null columns in the queryBuilder below instead.
  return {
    name: r.name,
    phone: r.phone,
    email: r.email,
    qualification: r.qualification,
  };
}

export default function AdminReferralsPage() {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null);

  const [editing, setEditing] = useState<
    | { mode: "create" }
    | { mode: "edit"; original: ReferralRow; key: string }
    | null
  >(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from("referals")
        .select("name, phone, email, qualification", { count: "exact" })
        .range(from, to);

      const term = search.trim();
      if (term) {
        const like = `%${term}%`;
        q = q.or(
          [
            `name.ilike.${like}`,
            `email.ilike.${like}`,
            `phone.ilike.${like}`,
            `qualification.ilike.${like}`,
          ].join(",")
        );
      }

      const { data, count, error } = await q;
      if (error) throw error;

      setRows((data as unknown as ReferralRow[]) ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Failed to load referrals. Check the table name (`referals`) and RLS policies."
      );
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

  const matchRow = (r: ReferralRow, q: ReturnType<typeof supabase.from>) => {
    let scoped = q as unknown as ReturnType<typeof supabase.from>;
    (Object.keys(matchPayload(r)) as (keyof ReferralRow)[]).forEach((col) => {
      const v = r[col];
      if (v === null || v === undefined) {
        // @ts-expect-error narrowing for the chained builder
        scoped = scoped.is(col, null);
      } else {
        // @ts-expect-error narrowing for the chained builder
        scoped = scoped.eq(col, v);
      }
    });
    return scoped;
  };

  const deleteRow = async (r: ReferralRow, key: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete referral ${r.name || r.email || r.phone || "this entry"}?`
      )
    ) {
      return;
    }
    setBusyKey(key);
    setToast(null);
    try {
      // Use the supabase builder directly so we can chain `.is(col, null)` for
      // null columns; `.match()` doesn't accept nulls.
      const baseQ = supabase.from("referals").delete().limit(1);
      const scoped = matchRow(r, baseQ as unknown as ReturnType<typeof supabase.from>);
      // @ts-expect-error scoped is the chained builder
      const { error } = await scoped;
      if (error) throw error;

      setRows((prev) => prev.filter((_, i) => rowKey(_, i) !== key));
      setTotal((t) => Math.max(0, t - 1));
      setToast({ type: "ok", text: "Referral deleted." });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to delete referral.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyKey(null);
    }
  };

  const handleSaved = (saved: ReferralRow, mode: "create" | "edit") => {
    if (mode === "create") {
      setRows((prev) => [saved, ...prev]);
      setTotal((t) => t + 1);
      setToast({ type: "ok", text: "Referral added." });
    } else {
      setRows((prev) =>
        prev.map((r, i) =>
          editing && "key" in editing && editing.key === rowKey(r, i)
            ? saved
            : r
        )
      );
      setToast({ type: "ok", text: "Referral updated." });
    }
    setEditing(null);
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#1e2659]">Referrals</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage member referrals in{" "}
              <span className="font-mono">referals</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, qualification…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-80"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditing({ mode: "create" })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: NAVY }}
            >
              <Plus className="h-4 w-4" /> New Referral
            </button>
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
                <th className="px-3 py-3 text-left font-semibold">Name</th>
                <th className="px-3 py-3 text-left font-semibold">Phone</th>
                <th className="px-3 py-3 text-left font-semibold">Email</th>
                <th className="px-3 py-3 text-left font-semibold">
                  Qualification
                </th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading referrals…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No referrals yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const key = rowKey(r, i);
                  return (
                    <tr
                      key={key}
                      className="border-t border-slate-100 hover:bg-slate-50 align-top"
                    >
                      <td className="px-3 py-3">{startIdx + i + 1}.</td>
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {r.name || "—"}
                      </td>
                      <td className="px-3 py-3 font-mono whitespace-nowrap">
                        {r.phone || "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {r.email || "—"}
                      </td>
                      <td
                        className="px-3 py-3 max-w-md text-slate-700"
                        title={r.qualification ?? ""}
                      >
                        <span className="line-clamp-2 whitespace-pre-wrap">
                          {r.qualification || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({
                                mode: "edit",
                                original: { ...r },
                                key,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1e2659] text-white text-xs font-semibold hover:opacity-95"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={busyKey === key}
                            onClick={() => deleteRow(r, key)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                          >
                            {busyKey === key ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
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

      {editing && (
        <ReferralEditor
          mode={editing.mode}
          initial={editing.mode === "edit" ? editing.original : EMPTY_ROW}
          matchRow={matchRow}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </AdminShell>
  );
}

/* ---------- Editor Modal ---------- */

function ReferralEditor({
  mode,
  initial,
  matchRow,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: ReferralRow;
  matchRow: (
    r: ReferralRow,
    q: ReturnType<typeof supabase.from>
  ) => ReturnType<typeof supabase.from>;
  onClose: () => void;
  onSaved: (saved: ReferralRow, mode: "create" | "edit") => void;
}) {
  const [form, setForm] = useState<ReferralRow>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ReferralRow>(k: K, v: ReferralRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = (form.name ?? "").trim();
    const phone = (form.phone ?? "").trim();
    const email = (form.email ?? "").trim();
    const qualification = (form.qualification ?? "").trim();

    if (!name && !phone && !email) {
      return setError(
        "Provide at least a name, phone, or email for the referral."
      );
    }
    if (name.length > 100)
      return setError("Name cannot exceed 100 characters.");
    if (phone) {
      if (!/^\d+$/.test(phone))
        return setError("Phone must contain digits only.");
      if (phone.length > 10)
        return setError("Phone cannot exceed 10 digits.");
    }
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return setError("Enter a valid email address.");
      if (email.length > 100)
        return setError("Email cannot exceed 100 characters.");
    }
    if (qualification.length > 1000)
      return setError("Qualification cannot exceed 1000 characters.");

    const payload: ReferralRow = {
      name: name ? name.slice(0, 100) : null,
      phone: phone ? phone.slice(0, 10) : null,
      email: email ? email.slice(0, 100).toLowerCase() : null,
      qualification: qualification ? qualification.slice(0, 1000) : null,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const { data, error: insErr } = await supabase
          .from("referals")
          .insert(payload)
          .select("name, phone, email, qualification")
          .single();
        if (insErr) throw insErr;
        onSaved((data as unknown as ReferralRow) ?? payload, "create");
      } else {
        // The table has no PK — scope the UPDATE to the exact original
        // snapshot to avoid clobbering other rows.
        const baseQ = supabase.from("referals").update(payload);
        const scoped = matchRow(initial, baseQ as unknown as ReturnType<typeof supabase.from>);
        // @ts-expect-error chained builder
        const { error: updErr } = await scoped.limit(1);
        if (updErr) throw updErr;
        onSaved(payload, "edit");
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to save.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div
          className="px-5 py-4 flex items-center justify-between rounded-t-2xl text-white"
          style={{ background: NAVY }}
        >
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <h3 className="text-lg font-bold">
              {mode === "create" ? "New referral" : "Edit referral"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-md hover:bg-white/10 flex items-center justify-center"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 md:p-7 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value || null)}
                maxLength={100}
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone ?? ""}
                onChange={(e) =>
                  set("phone", e.target.value.replace(/\D/g, "") || null)
                }
                maxLength={10}
                className={inputClass + " font-mono"}
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value || null)}
              maxLength={100}
              className={inputClass + " lowercase"}
            />
          </Field>

          <Field label="Qualification">
            <textarea
              value={form.qualification ?? ""}
              onChange={(e) =>
                set("qualification", e.target.value || null)
              }
              maxLength={1000}
              rows={4}
              className={inputClass + " resize-y min-h-[100px]"}
              placeholder="Highest qualification, certifications, current role…"
            />
            <p className="text-[11px] text-slate-500 mt-1 text-right">
              {(form.qualification ?? "").length} / 1000
            </p>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: NAVY }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>
        {label}
      </label>
      {children}
    </div>
  );
}

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
