"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import {
  CalendarClock,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

/**
 * Admin → Sessions
 * Full CRUD on the `sessions` table.
 *
 * Schema:
 *   sessionid           integer PK
 *   sessiontitle        varchar(255) NOT NULL
 *   sessiondate         date NOT NULL
 *   sessiontime         time NOT NULL
 *   sessionlink         varchar(500) NOT NULL
 *   name_of_the_trainer varchar(200) NULL
 *   day                 varchar(30) NULL
 */

interface SessionRow {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string; // YYYY-MM-DD
  sessiontime: string; // HH:MM[:SS]
  sessionlink: string;
  name_of_the_trainer: string | null;
  day: string | null;
}

const NAVY = "#1e2659";
const PAGE_SIZES = [10, 25, 50, 100];

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function fmtTime(t: string | null) {
  if (!t) return "—";
  // strip seconds if present (HH:MM:SS → HH:MM)
  const parts = t.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return t;
}

function inferDay(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return DAY_LABELS[d.getDay()];
}

export default function AdminSessionsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
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

  const [editing, setEditing] = useState<SessionRow | "new" | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from("sessions")
        .select("*", { count: "exact" })
        .order("sessiondate", { ascending: false })
        .order("sessiontime", { ascending: false })
        .range(from, to);

      const term = search.trim();
      if (term) {
        const like = `%${term}%`;
        q = q.or(
          [
            `sessiontitle.ilike.${like}`,
            `name_of_the_trainer.ilike.${like}`,
            `day.ilike.${like}`,
          ].join(",")
        );
      }

      const { data, count, error } = await q;
      if (error) throw error;
      setRows((data as unknown as SessionRow[]) ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load sessions.");
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

  /** Computes next sessionid as MAX(sessionid) + 1 (fallback 1). */
  const nextSessionId = async (): Promise<number> => {
    const { data, error } = await supabase
      .from("sessions")
      .select("sessionid")
      .order("sessionid", { ascending: false })
      .limit(1);
    if (error) throw error;
    const top = data?.[0]?.sessionid;
    const n = top ? Number(top) : 0;
    return Number.isFinite(n) && n > 0 ? n + 1 : 1;
  };

  const deleteSession = async (row: SessionRow) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete session "${row.sessiontitle}"?`)
    ) {
      return;
    }
    setBusyId(row.sessionid);
    setToast(null);
    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("sessionid", row.sessionid);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.sessionid !== row.sessionid));
      setTotal((t) => Math.max(0, t - 1));
      setToast({ type: "ok", text: `Session #${row.sessionid} deleted.` });
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to delete session.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (saved: SessionRow, isNew: boolean) => {
    setRows((prev) => {
      if (isNew) return [saved, ...prev];
      return prev.map((r) => (r.sessionid === saved.sessionid ? saved : r));
    });
    if (isNew) setTotal((t) => t + 1);
    setEditing(null);
    setToast({
      type: "ok",
      text: isNew
        ? `Session #${saved.sessionid} created.`
        : `Session #${saved.sessionid} updated.`,
    });
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#1e2659]">Sessions</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage scheduled sessions in{" "}
              <span className="font-mono">sessions</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, trainer, day…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-72"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: NAVY }}
            >
              <Plus className="h-4 w-4" /> New Session
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
                <th className="px-3 py-3 text-left font-semibold">ID</th>
                <th className="px-3 py-3 text-left font-semibold">Title</th>
                <th className="px-3 py-3 text-left font-semibold">Date</th>
                <th className="px-3 py-3 text-left font-semibold">Time</th>
                <th className="px-3 py-3 text-left font-semibold">Day</th>
                <th className="px-3 py-3 text-left font-semibold">Trainer</th>
                <th className="px-3 py-3 text-left font-semibold">Link</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading sessions…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No sessions scheduled.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={r.sessionid}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-3">{startIdx + i + 1}.</td>
                    <td className="px-3 py-3 font-mono">{r.sessionid}</td>
                    <td className="px-3 py-3 font-medium text-slate-800 max-w-xs">
                      {r.sessiontitle}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {fmtDate(r.sessiondate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {fmtTime(r.sessiontime)}
                    </td>
                    <td className="px-3 py-3">{r.day || "—"}</td>
                    <td className="px-3 py-3">{r.name_of_the_trainer || "—"}</td>
                    <td className="px-3 py-3 max-w-[16rem] truncate">
                      {r.sessionlink ? (
                        <a
                          href={r.sessionlink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline break-all"
                          title={r.sessionlink}
                        >
                          {r.sessionlink}
                        </a>
                      ) : (
                        "—"
                      )}
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
                          disabled={busyId === r.sessionid}
                          onClick={() => deleteSession(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
                        >
                          {busyId === r.sessionid ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
        <SessionEditor
          mode={editing === "new" ? "create" : "edit"}
          initial={editing === "new" ? null : editing}
          nextIdLoader={nextSessionId}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </AdminShell>
  );
}

/* ---------- Editor Modal ---------- */

function SessionEditor({
  mode,
  initial,
  nextIdLoader,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: SessionRow | null;
  nextIdLoader: () => Promise<number>;
  onClose: () => void;
  onSaved: (row: SessionRow, isNew: boolean) => void;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<SessionRow>(() =>
    initial ?? {
      sessionid: 0,
      sessiontitle: "",
      sessiondate: todayIso,
      sessiontime: "10:00",
      sessionlink: "",
      name_of_the_trainer: null,
      day: inferDay(todayIso),
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SessionRow>(k: K, v: SessionRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onChangeDate = (val: string) => {
    set("sessiondate", val as SessionRow["sessiondate"]);
    set("day", inferDay(val));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = form.sessiontitle.trim();
    const link = form.sessionlink.trim();
    const trainer = (form.name_of_the_trainer ?? "").trim();
    const day = (form.day ?? "").trim();

    if (!title) return setError("Title is required.");
    if (!form.sessiondate) return setError("Date is required.");
    if (!form.sessiontime) return setError("Time is required.");
    if (!link) return setError("Session link is required.");

    if (title.length > 255)
      return setError("Title cannot exceed 255 characters.");
    if (link.length > 500)
      return setError("Session link cannot exceed 500 characters.");
    if (trainer.length > 200)
      return setError("Trainer name cannot exceed 200 characters.");
    if (day.length > 30)
      return setError("Day cannot exceed 30 characters.");

    setSaving(true);
    try {
      // Postgres `time` accepts HH:MM and HH:MM:SS. The HTML <input type="time">
      // always returns HH:MM, which is valid.
      const payload = {
        sessiontitle: title.slice(0, 255),
        sessiondate: form.sessiondate.slice(0, 10),
        sessiontime: form.sessiontime,
        sessionlink: link.slice(0, 500),
        name_of_the_trainer: trainer ? trainer.slice(0, 200) : null,
        day: day ? day.slice(0, 30) : null,
      };

      if (mode === "create") {
        const newId = await nextIdLoader();
        const { data, error: insErr } = await supabase
          .from("sessions")
          .insert({ sessionid: newId, ...payload })
          .select("*")
          .single();
        if (insErr) throw insErr;
        onSaved(data as unknown as SessionRow, true);
      } else {
        const id = initial?.sessionid as number;
        const { data, error: updErr } = await supabase
          .from("sessions")
          .update(payload)
          .eq("sessionid", id)
          .select("*")
          .single();
        if (updErr) throw updErr;
        onSaved(data as unknown as SessionRow, false);
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
            <CalendarClock className="h-5 w-5" />
            <h3 className="text-lg font-bold">
              {mode === "create" ? "New session" : `Edit session #${form.sessionid}`}
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

          <Field label="Title" required>
            <input
              type="text"
              value={form.sessiontitle}
              onChange={(e) => set("sessiontitle", e.target.value)}
              maxLength={255}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date" required>
              <input
                type="date"
                value={form.sessiondate || ""}
                onChange={(e) => onChangeDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Time" required>
              <input
                type="time"
                value={(form.sessiontime || "").slice(0, 5)}
                onChange={(e) => set("sessiontime", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Day">
              <select
                value={form.day ?? ""}
                onChange={(e) => set("day", e.target.value || null)}
                className={inputClass}
              >
                <option value="">— Auto —</option>
                {DAY_LABELS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Trainer">
            <input
              type="text"
              value={form.name_of_the_trainer ?? ""}
              onChange={(e) =>
                set("name_of_the_trainer", e.target.value || null)
              }
              maxLength={200}
              className={inputClass}
            />
          </Field>

          <Field label="Session link (URL)" required>
            <input
              type="url"
              value={form.sessionlink}
              onChange={(e) => set("sessionlink", e.target.value)}
              maxLength={500}
              placeholder="https://meet.example.com/abc-defg-hij"
              className={inputClass + " font-mono"}
            />
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
              {mode === "create" ? "Create session" : "Save changes"}
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
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
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
