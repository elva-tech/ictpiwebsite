"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import { Loader2, Plus, Trash2 } from "lucide-react";

const NAVY = "#1e2659";
const MAX_NEWS = 2000;

/**
 * Admin → Institute news (`institute_news` table).
 * Schema: `news varchar(2000) null` only — rows are deleted by exact `news`
 * text match (duplicate identical entries would all be removed together).
 */

export default function AdminNewsPage() {
  const [rows, setRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("institute_news")
        .select("news")
        .order("news", { ascending: true });
      if (error) throw error;
      const list = (data ?? [])
        .map((r: { news: string | null }) => (r.news ?? "").trim())
        .filter((s) => s.length > 0);
      setRows(list);
    } catch (e) {
      console.error(e);
      setErrorMsg("Could not load news. Check the institute_news table and RLS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) {
      setToast({ type: "err", text: "Enter some news text before saving." });
      return;
    }
    const payload = text.slice(0, MAX_NEWS);
    setSaving(true);
    setToast(null);
    try {
      const { error } = await supabase
        .from("institute_news")
        .insert({ news: payload });
      if (error) throw error;
      setDraft("");
      setToast({ type: "ok", text: "News added." });
      await load();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : "Failed to add news.";
      setToast({ type: "err", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const deleteNews = async (newsText: string) => {
    setDeleting(newsText);
    setToast(null);
    try {
      const { error } = await supabase
        .from("institute_news")
        .delete()
        .eq("news", newsText);
      if (error) throw error;
      setToast({ type: "ok", text: "News removed." });
      await load();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : "Failed to delete news.";
      setToast({ type: "err", text: msg });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-bold text-[#1e2659] mb-2">Institute news</h2>
        <p className="text-sm text-slate-500 mb-6">
          Manage entries in{" "}
          <span className="font-mono">institute_news</span> (column{" "}
          <span className="font-mono">news</span>, up to {MAX_NEWS} characters).
        </p>

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

        <form onSubmit={addNews} className="mb-10 space-y-3">
          <label
            className="block text-xs font-bold uppercase tracking-wide text-slate-600"
            htmlFor="admin-news-draft"
          >
            Add news
          </label>
          <textarea
            id="admin-news-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_NEWS))}
            rows={5}
            maxLength={MAX_NEWS}
            placeholder="Announcement or update for members…"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40 resize-y min-h-[120px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {draft.length} / {MAX_NEWS}
            </span>
            <button
              type="submit"
              disabled={saving || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: NAVY }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Publish
                </>
              )}
            </button>
          </div>
        </form>

        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-3">
          All published items
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">No news entries yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((news, idx) => (
              <li
                key={`${idx}-${news.slice(0, 48)}`}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
              >
                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words flex-1">
                  {news}
                </p>
                <button
                  type="button"
                  disabled={deleting === news}
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      !window.confirm("Delete this news item?")
                    ) {
                      return;
                    }
                    void deleteNews(news);
                  }}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleting === news ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
