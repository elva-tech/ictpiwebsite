"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import { Crown, Loader2, Plus, Search, Trash2 } from "lucide-react";

/**
 * Admin → Premium List
 *
 * Manages the `premiumlist` table — a flat list of email addresses that
 * unlock premium access in the rest of the app.
 *
 * Schema: premiumlist (email varchar(100) null)
 *
 * The table has no primary key, so deletes target the exact email string.
 */

const NAVY = "#1e2659";
const EMAIL_MAX = 100;

export default function AdminPremiumListPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null);

  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("premiumlist")
        .select("email")
        .order("email", { ascending: true });
      if (error) throw error;
      const list = (data ?? [])
        .map((r: { email: string | null }) => (r.email ?? "").trim().toLowerCase())
        .filter((s) => s.length > 0);
      setEmails(list);
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Failed to load premium list. Verify the table and RLS policies."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    const email = draft.trim().toLowerCase();
    if (!email) {
      setToast({ type: "err", text: "Enter an email to add." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToast({ type: "err", text: "Enter a valid email address." });
      return;
    }
    if (email.length > EMAIL_MAX) {
      setToast({
        type: "err",
        text: `Email cannot exceed ${EMAIL_MAX} characters.`,
      });
      return;
    }
    if (emails.includes(email)) {
      setToast({
        type: "err",
        text: "This email is already on the premium list.",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from("premiumlist")
        .insert({ email: email.slice(0, EMAIL_MAX) });
      if (error) throw error;
      setEmails((prev) =>
        Array.from(new Set([...prev, email])).sort((a, b) => a.localeCompare(b))
      );
      setDraft("");
      setToast({ type: "ok", text: `${email} added to premium list.` });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to add email.";
      setToast({ type: "err", text: msg });
    } finally {
      setAdding(false);
    }
  };

  const removeEmail = async (email: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Remove ${email} from the premium list?`)
    ) {
      return;
    }
    setBusyEmail(email);
    setToast(null);
    try {
      const { error } = await supabase
        .from("premiumlist")
        .delete()
        .eq("email", email);
      if (error) throw error;
      setEmails((prev) => prev.filter((e) => e !== email));
      setToast({ type: "ok", text: `${email} removed.` });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to remove email.";
      setToast({ type: "err", text: msg });
    } finally {
      setBusyEmail(null);
    }
  };

  const visible = search.trim()
    ? emails.filter((e) =>
        e.toLowerCase().includes(search.trim().toLowerCase())
      )
    : emails;

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-[#1e2659] flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              Premium List
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Emails on this list unlock premium access. Source:{" "}
              <span className="font-mono">premiumlist</span>.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            <span className="font-mono text-slate-700">{emails.length}</span>{" "}
            email{emails.length === 1 ? "" : "s"}
          </div>
        </div>

        {toast && (
          <div
            className={`mt-4 mb-2 rounded-lg px-4 py-2 text-sm ${
              toast.type === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {toast.text}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={addEmail}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, EMAIL_MAX))}
            maxLength={EMAIL_MAX}
            placeholder="member@example.com"
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm lowercase focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40"
          />
          <button
            type="submit"
            disabled={adding || !draft.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: NAVY }}
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add email
              </>
            )}
          </button>
        </form>

        <div className="mt-8 mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
            All premium emails
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">
            {search.trim()
              ? "No emails match your filter."
              : "No premium emails yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {visible.map((email) => (
              <li
                key={email}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50"
              >
                <span className="font-mono text-sm text-slate-800 break-all">
                  {email}
                </span>
                <button
                  type="button"
                  disabled={busyEmail === email}
                  onClick={() => removeEmail(email)}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {busyEmail === email ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
