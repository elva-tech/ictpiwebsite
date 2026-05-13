"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

/**
 * Admin User List page — backed by `candidate_exam_schedule`.
 *
 * Each row maps to one candidate (1 membership_id). The Edit modal lets the
 * admin modify every editable column in the table.
 */

interface CandidateRow {
  membership_id: number;
  name: string | null;
  place: string | null;
  state: string | null;
  district: string | null;
  pincode: string | null;
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
  joined: string | null;
  completed: string | null;
  NCVET: string | null;
  gstp: string | null;
  ITP: string | null;
  SIDH: string | null;
  STP: string | null;
  CB: string | null;
}

const SELECT_COLS =
  `membership_id, name, place, state, district, pincode, can_id, batch_id,
   batch_name, mepsc_assesment, next_step, qualification_status,
   self_test_practice, mock_exam, final_ctpr_exam, exam_date, date_of_birth,
   it_pan, aadhar, voter, father_name, mother_name, address, joined, completed,
   "NCVET", gstp, "ITP", "SIDH", "STP", "CB"`;

const PAGE_SIZES = [10, 25, 50, 100];

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  // Accept "YYYY-MM-DD" or ISO timestamps
  const justDate = /^\d{4}-\d{2}-\d{2}/.exec(iso);
  if (justDate) return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

function splitName(full: string | null) {
  const v = (full ?? "").trim();
  if (!v) return { first: "", middle: "", last: "" };
  const parts = v.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  };
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<CandidateRow[]>([]);
  const [emailMap, setEmailMap] = useState<Record<number, string>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<CandidateRow | null>(null);
  const [eliminating, setEliminating] = useState<CandidateRow | null>(null);
  const [eliminateBusy, setEliminateBusy] = useState(false);
  const [eliminateError, setEliminateError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from("candidate_exam_schedule")
        .select(SELECT_COLS, { count: "exact" })
        .order("membership_id", { ascending: true })
        .range(from, to);

      const term = search.trim();
      if (term) {
        const like = `%${term}%`;
        const orParts = [
          `name.ilike.${like}`,
          `can_id.ilike.${like}`,
          `batch_id.ilike.${like}`,
          `batch_name.ilike.${like}`,
          `place.ilike.${like}`,
          `state.ilike.${like}`,
        ];
        const asNumber = Number(term);
        if (!Number.isNaN(asNumber) && term.match(/^\d+$/)) {
          orParts.push(`membership_id.eq.${asNumber}`);
        }
        q = q.or(orParts.join(","));
      }

      const { data, count, error } = await q;
      if (error) throw error;

      const list = (data as unknown as CandidateRow[]) ?? [];
      setRows(list);
      setTotal(count ?? 0);

      // Best-effort email lookup from memberinformation for the current page.
      const ids = list.map((r) => r.membership_id).filter(Boolean);
      if (ids.length > 0) {
        const { data: members } = await supabase
          .from("memberinformation")
          .select("membership_id, email")
          .in("membership_id", ids);
        const map: Record<number, string> = {};
        (members ?? []).forEach((m: { membership_id: number | string; email: string | null }) => {
          if (m?.email) map[Number(m.membership_id)] = String(m.email);
        });
        setEmailMap(map);
      } else {
        setEmailMap({});
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  const eliminateUser = async (r: CandidateRow) => {
    setEliminateBusy(true);
    setEliminateError(null);
    try {
      // Capture the email up front — we'll need it to delete the Firebase
      // Auth account after the DB row is gone.
      const email = emailMap[r.membership_id] ?? null;

      // Best-effort cleanup of related rows. Errors for missing tables are
      // ignored so the core deletion still succeeds.
      await supabase
        .from("certification_approval")
        .delete()
        .eq("membership_id", r.membership_id);
      await supabase
        .from("enquiry")
        .delete()
        .eq("membership_id", String(r.membership_id));
      await supabase
        .from("memberinformation")
        .delete()
        .eq("membership_id", r.membership_id);

      const { error: cesErr } = await supabase
        .from("candidate_exam_schedule")
        .delete()
        .eq("membership_id", r.membership_id);
      if (cesErr) throw cesErr;

      // Delete the Firebase Auth account (server-side via firebase-admin).
      let fbStatus: "deleted" | "not_found" | "skipped" | "failed" = "skipped";
      let fbErrorMsg: string | null = null;
      if (email) {
        try {
          const res = await fetch("/api/admin/delete-firebase-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            fbStatus = "failed";
            fbErrorMsg =
              typeof json.error === "string"
                ? json.error
                : `HTTP ${res.status}`;
          } else if (json.deleted) {
            fbStatus = "deleted";
          } else {
            fbStatus = "not_found";
          }
        } catch (err) {
          fbStatus = "failed";
          fbErrorMsg = err instanceof Error ? err.message : "Network error";
        }
      }

      setRows((prev) => prev.filter((x) => x.membership_id !== r.membership_id));
      setEmailMap((prev) => {
        const next = { ...prev };
        delete next[r.membership_id];
        return next;
      });
      setTotal((t) => Math.max(0, t - 1));

      const memberLabel = String(r.membership_id).padStart(5, "0");
      let suffix = "";
      switch (fbStatus) {
        case "deleted":
          suffix = " Firebase account removed.";
          break;
        case "not_found":
          suffix = " No Firebase account was linked.";
          break;
        case "skipped":
          suffix = " No email on file — Firebase account left as-is.";
          break;
        case "failed":
          suffix = ` Firebase deletion failed: ${fbErrorMsg ?? "unknown error"}.`;
          break;
      }
      setToast({
        type: fbStatus === "failed" ? "err" : "ok",
        text: `Member ${memberLabel} removed from database.${suffix}`,
      });
      setEliminating(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Could not delete member.";
      setEliminateError(msg);
    } finally {
      setEliminateBusy(false);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-bold text-[#1e2659] mb-6">User List</h2>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
          <p className="text-sm text-slate-500">
            Source: <span className="font-mono">candidate_exam_schedule</span>
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID, batch, state…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-72"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 text-left font-semibold">SR. NO</th>
                <th className="px-3 py-3 text-left font-semibold">First Name</th>
                <th className="px-3 py-3 text-left font-semibold">Middle Name</th>
                <th className="px-3 py-3 text-left font-semibold">Last Name</th>
                <th className="px-3 py-3 text-left font-semibold">Email</th>
                <th className="px-3 py-3 text-left font-semibold">Membership ID</th>
                <th className="px-3 py-3 text-left font-semibold">Candidate ID</th>
                <th className="px-3 py-3 text-left font-semibold">Batch</th>
                <th className="px-3 py-3 text-left font-semibold">Place / State</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const n = splitName(r.name);
                  return (
                    <tr
                      key={r.membership_id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-3">{startIdx + i + 1}.</td>
                      <td className="px-3 py-3 font-medium uppercase">{n.first || "—"}</td>
                      <td className="px-3 py-3 uppercase">{n.middle}</td>
                      <td className="px-3 py-3 uppercase">{n.last}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {emailMap[r.membership_id] || "—"}
                      </td>
                      <td className="px-3 py-3 font-mono">
                        {String(r.membership_id).padStart(5, "0")}
                      </td>
                      <td className="px-3 py-3 font-mono">{r.can_id || "—"}</td>
                      <td className="px-3 py-3">{r.batch_name || r.batch_id || "—"}</td>
                      <td className="px-3 py-3">
                        {[r.place, r.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-block rounded-md bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1">
                          {(r.qualification_status || "—").slice(0, 24)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1e2659] text-white text-xs font-semibold hover:opacity-95"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEliminateError(null);
                              setEliminating(r);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                            title="Eliminate user (delete database records)"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Eliminate
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
        <EditCandidateModal
          row={editing}
          email={emailMap[editing.membership_id] ?? null}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRows((prev) =>
              prev.map((r) => (r.membership_id === updated.membership_id ? updated : r))
            );
            setEditing(null);
          }}
        />
      )}

      {eliminating && (
        <EliminateConfirmModal
          row={eliminating}
          email={emailMap[eliminating.membership_id] ?? null}
          busy={eliminateBusy}
          error={eliminateError}
          onCancel={() => {
            if (eliminateBusy) return;
            setEliminating(null);
            setEliminateError(null);
          }}
          onConfirm={() => eliminateUser(eliminating)}
        />
      )}
    </AdminShell>
  );
}

/* ---------- Eliminate Confirm Modal ---------- */

function EliminateConfirmModal({
  row,
  email,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  row: CandidateRow;
  email: string | null;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-rose-700">Eliminate user?</h3>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
          <p>
            This will permanently delete the database records for{" "}
            <span className="font-semibold">{row.name || "—"}</span> (Membership
            ID{" "}
            <span className="font-mono">
              {String(row.membership_id).padStart(5, "0")}
            </span>
            {email ? (
              <>
                , <span className="font-mono">{email}</span>
              </>
            ) : null}
            ).
          </p>
          <ul className="list-disc list-inside text-xs text-slate-500">
            <li>candidate_exam_schedule row</li>
            <li>memberinformation row (if any)</li>
            <li>certification_approval row (if any)</li>
            <li>related enquiry rows (if any)</li>
            <li>Firebase Auth account for {email || "this member"} (if any)</li>
          </ul>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Yes, Eliminate
          </button>
        </div>
      </div>
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

/* ---------- Edit Modal ---------- */

const NAVY = "#1e2659";

const labelClass = "block text-xs font-bold mb-1.5";
const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40";

function EditCandidateModal({
  row,
  email,
  onClose,
  onSaved,
}: {
  row: CandidateRow;
  email: string | null;
  onClose: () => void;
  onSaved: (r: CandidateRow) => void;
}) {
  const [form, setForm] = useState<CandidateRow>({ ...row });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CandidateRow>(k: K, v: CandidateRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      // Build the update payload — keep all editable columns. Quoted columns
      // (NCVET, ITP, SIDH, STP, CB) use exact-case keys; Supabase preserves
      // them. membership_id is the key — not updated.
      const payload: Record<string, unknown> = {
        name: form.name?.toString().trim() || null,
        place: form.place || null,
        state: form.state || null,
        district: form.district || null,
        pincode: form.pincode || null,
        can_id: form.can_id || null,
        batch_id: form.batch_id || null,
        batch_name: form.batch_name || null,
        mepsc_assesment: form.mepsc_assesment || null,
        next_step: form.next_step || null,
        qualification_status: form.qualification_status || null,
        self_test_practice: form.self_test_practice || null,
        mock_exam: form.mock_exam || null,
        final_ctpr_exam: form.final_ctpr_exam || null,
        exam_date: form.exam_date || null,
        date_of_birth: form.date_of_birth || null,
        it_pan: form.it_pan ? form.it_pan.toUpperCase() : null,
        aadhar: form.aadhar || null,
        voter: form.voter ? form.voter.toUpperCase() : null,
        father_name: form.father_name || null,
        mother_name: form.mother_name || null,
        address: form.address || null,
        joined: form.joined || null,
        completed: form.completed || null,
        NCVET: form.NCVET || null,
        gstp: form.gstp || null,
        ITP: form.ITP || null,
        SIDH: form.SIDH || null,
        STP: form.STP || null,
        CB: form.CB || null,
      };

      const { error: updateErr } = await supabase
        .from("candidate_exam_schedule")
        .update(payload)
        .eq("membership_id", row.membership_id);

      if (updateErr) throw updateErr;

      onSaved({ ...form });
    } catch (e: unknown) {
      console.error(e);
      const m = e instanceof Error ? e.message : "Failed to update.";
      setError(m);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
        <div
          className="px-5 py-4 flex items-center justify-between rounded-t-2xl text-white"
          style={{ background: NAVY }}
        >
          <div>
            <h3 className="text-lg font-bold">
              Edit Candidate – {String(row.membership_id).padStart(5, "0")}
            </h3>
            <p className="text-xs text-white/80">
              {email ? `Email: ${email}` : "Email not linked"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md hover:bg-white/10 flex items-center justify-center"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 md:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <Section title="Personal Identity">
            <Field label="Name">
              <input
                className={inputClass}
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                maxLength={180}
              />
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                className={inputClass}
                value={form.date_of_birth ?? ""}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </Field>
            <Field label="Father's Name">
              <input
                className={inputClass}
                value={form.father_name ?? ""}
                onChange={(e) => set("father_name", e.target.value)}
                maxLength={60}
              />
            </Field>
            <Field label="Mother's Name">
              <input
                className={inputClass}
                value={form.mother_name ?? ""}
                onChange={(e) => set("mother_name", e.target.value)}
                maxLength={60}
              />
            </Field>
          </Section>

          <Section title="Government IDs">
            <Field label="IT PAN">
              <input
                className={inputClass + " font-mono uppercase"}
                value={form.it_pan ?? ""}
                onChange={(e) => set("it_pan", e.target.value.toUpperCase())}
                maxLength={10}
              />
            </Field>
            <Field label="Aadhaar">
              <input
                className={inputClass + " font-mono"}
                inputMode="numeric"
                value={form.aadhar ?? ""}
                onChange={(e) =>
                  set("aadhar", e.target.value.replace(/\D/g, ""))
                }
                maxLength={12}
              />
            </Field>
            <Field label="Voter ID">
              <input
                className={inputClass + " font-mono uppercase"}
                value={form.voter ?? ""}
                onChange={(e) => set("voter", e.target.value.toUpperCase())}
                maxLength={10}
              />
            </Field>
          </Section>

          <Section title="Address & Location">
            <Field label="Address" full>
              <input
                className={inputClass}
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label="Place / City">
              <input
                className={inputClass}
                value={form.place ?? ""}
                onChange={(e) => set("place", e.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label="District">
              <input
                className={inputClass}
                value={form.district ?? ""}
                onChange={(e) => set("district", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="State">
              <input
                className={inputClass}
                value={form.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Pincode">
              <input
                className={inputClass + " font-mono"}
                inputMode="numeric"
                value={form.pincode ?? ""}
                onChange={(e) =>
                  set("pincode", e.target.value.replace(/\D/g, ""))
                }
                maxLength={7}
              />
            </Field>
          </Section>

          <Section title="Batch & Qualification">
            <Field label="Candidate ID">
              <input
                className={inputClass + " font-mono"}
                value={form.can_id ?? ""}
                onChange={(e) => set("can_id", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="Batch ID">
              <input
                className={inputClass + " font-mono"}
                value={form.batch_id ?? ""}
                onChange={(e) => set("batch_id", e.target.value)}
                maxLength={20}
              />
            </Field>
            <Field label="Batch Name">
              <input
                className={inputClass}
                value={form.batch_name ?? ""}
                onChange={(e) => set("batch_name", e.target.value)}
                maxLength={60}
              />
            </Field>
            <Field label="Qualification Status">
              <input
                className={inputClass}
                value={form.qualification_status ?? ""}
                onChange={(e) => set("qualification_status", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Joined">
              <input
                type="date"
                className={inputClass}
                value={form.joined ?? ""}
                onChange={(e) => set("joined", e.target.value)}
              />
            </Field>
            <Field label="Completed">
              <input
                type="date"
                className={inputClass}
                value={form.completed ?? ""}
                onChange={(e) => set("completed", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Exam Workflow">
            <Field label="MEPSC Assessment">
              <input
                className={inputClass}
                value={form.mepsc_assesment ?? ""}
                onChange={(e) => set("mepsc_assesment", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Next Step">
              <input
                className={inputClass}
                value={form.next_step ?? ""}
                onChange={(e) => set("next_step", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Self Test / Practice">
              <input
                className={inputClass}
                value={form.self_test_practice ?? ""}
                onChange={(e) => set("self_test_practice", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Mock Exam">
              <input
                className={inputClass}
                value={form.mock_exam ?? ""}
                onChange={(e) => set("mock_exam", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Final CTPR Exam">
              <input
                className={inputClass}
                value={form.final_ctpr_exam ?? ""}
                onChange={(e) => set("final_ctpr_exam", e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field label="Exam Date">
              <input
                type="date"
                className={inputClass}
                value={form.exam_date ?? ""}
                onChange={(e) => set("exam_date", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Certificates & Licenses">
            <Field label="NCVET Certificate No.">
              <input
                className={inputClass}
                value={form.NCVET ?? ""}
                onChange={(e) => set("NCVET", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="GSTP Enrollment No.">
              <input
                className={inputClass}
                value={form.gstp ?? ""}
                onChange={(e) => set("gstp", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="ITP Enrollment No.">
              <input
                className={inputClass}
                value={form.ITP ?? ""}
                onChange={(e) => set("ITP", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="SIDH Candidate ID">
              <input
                className={inputClass}
                value={form.SIDH ?? ""}
                onChange={(e) => set("SIDH", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="STP Enrollment No.">
              <input
                className={inputClass}
                value={form.STP ?? ""}
                onChange={(e) => set("STP", e.target.value)}
                maxLength={30}
              />
            </Field>
            <Field label="CB Licence No.">
              <input
                className={inputClass}
                value={form.CB ?? ""}
                onChange={(e) => set("CB", e.target.value)}
                maxLength={30}
              />
            </Field>
          </Section>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: NAVY }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-[#1e2659] mb-3 uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <label className={labelClass} style={{ color: NAVY }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// fmtDate isn't strictly needed here but kept for future formatted columns.
void fmtDate;
