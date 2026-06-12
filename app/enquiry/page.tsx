"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";
import { Loader2, Send } from "lucide-react";

const QUERY_MAX = 100;

/** membership_id must fit VARCHAR(10) per DB schema */
function membershipIdForDb(raw: string | number): string {
  const s = String(raw).trim();
  if (s.length <= 10) return s;
  return s.slice(0, 10);
}

export default function EnquiryPage() {
  const auth = useAuth() as any;
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingMember, setLoadingMember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!auth?.user?.email) return;
    const email = auth.user.email.toLowerCase().trim();

    const load = async () => {
      setLoadingMember(true);
      setMessage(null);
      try {
        const { data: payload, error: loadErr } =
          await loadMemberProfileByMembershipId(supabase, getStoredMembershipId());

        if (loadErr && !payload?.member) throw new Error(loadErr);
        const rawId = payload?.member?.membership_id;
        if (rawId == null || String(rawId).trim() === "") {
          setMembershipId(null);
          setMessage({
            type: "err",
            text: "No membership record found for your account.",
          });
          return;
        }
        setMembershipId(membershipIdForDb(rawId));
      } catch (e) {
        console.error(e);
        setMessage({
          type: "err",
          text: "Could not load your membership. Try again later.",
        });
      } finally {
        setLoadingMember(false);
      }
    };

    load();
  }, [auth?.user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setMessage({ type: "err", text: "Please enter your enquiry or issue." });
      return;
    }
    if (!membershipId) {
      setMessage({ type: "err", text: "Membership ID unavailable." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const { error } = await supabase.from("enquiry").insert({
        membership_id: membershipId,
        query: trimmed.slice(0, QUERY_MAX),
      });
      if (error) throw error;
      setQuery("");
      setMessage({
        type: "ok",
        text: "Your enquiry has been submitted. We will get back to you.",
      });
    } catch (err: unknown) {
      console.error(err);
      setMessage({
        type: "err",
        text:
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Could not submit. Check your connection or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth?.user && !auth?.loading) return null;

  return (
    <AuthenticatedLayout title="Enquiry / Issue" maxWidth="md" backHref="/dashboard">
      <div className="space-y-6">
        <p className="text-gray-600 text-sm md:text-base">
          Describe your enquiry or report an issue (max {QUERY_MAX} characters). Your
          membership ID is sent automatically with the request.
        </p>

        {loadingMember ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        ) : membershipId ? (
          <p className="text-sm text-gray-500">
            Membership ID:{" "}
            <span className="font-mono font-semibold text-gray-800">{membershipId}</span>
          </p>
        ) : null}

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="enquiry-query" className="block text-sm font-medium text-gray-800 mb-1.5">
              Enquiry or issue
            </label>
            <textarea
              id="enquiry-query"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, QUERY_MAX))}
              rows={5}
              maxLength={QUERY_MAX}
              disabled={!membershipId || submitting}
              placeholder="e.g. Unable to access a course, certificate question, account issue…"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {query.length} / {QUERY_MAX}
            </p>
          </div>

          <button
            type="submit"
            disabled={!membershipId || submitting || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit
              </>
            )}
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
