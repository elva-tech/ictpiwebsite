"use client";

import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2, Send } from "lucide-react";

const NAVY = "#1e2659";

export default function AdminResetMemberPasswordPage() {
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);

  const lookupEmail = async (rawId: string): Promise<string | null> => {
    const idStr = rawId.trim();
    if (!idStr) return null;

    // Try numeric and uppercased string lookups so that whatever the user
    // types (e.g. "101799" or "ICTPI/101799"), we still find a match.
    const candidates: (string | number)[] = [];
    if (/^\d+$/.test(idStr)) candidates.push(Number(idStr));
    candidates.push(idStr.toUpperCase());

    for (const c of candidates) {
      const { data } = await supabase
        .from("memberinformation")
        .select("email")
        .eq("membership_id", c)
        .maybeSingle();
      if (data?.email) {
        const e = String(data.email).trim().toLowerCase();
        if (e.includes("@")) return e;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setResolvedEmail(null);

    const trimmed = memberId.trim();
    if (!trimmed) {
      setMessage({ type: "err", text: "Please enter a Member ID." });
      return;
    }

    setSubmitting(true);
    try {
      const email = await lookupEmail(trimmed);
      if (!email) {
        setMessage({
          type: "err",
          text: "No member found for this Member ID.",
        });
        return;
      }

      setResolvedEmail(email);

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });

      setMessage({
        type: "ok",
        text: `Password reset link sent to ${email}. Ask the member to check their inbox / spam folder.`,
      });
      setMemberId("");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      let text = "Failed to send password reset email.";
      if (code === "auth/too-many-requests") {
        text = "Too many requests right now. Please wait a few minutes and retry.";
      } else if (code === "auth/invalid-email") {
        text = "The stored email is invalid for this member.";
      } else if (err instanceof Error && err.message) {
        text = err.message;
      }
      console.error("Admin reset error:", err);
      setMessage({ type: "err", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Admin Control Panel">
      <div className="min-h-[60vh] flex items-start md:items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold" style={{ color: NAVY }}>
              Reset Member Password
            </h2>
            <div className="h-9 w-9 rounded-lg bg-[#1e2659] flex items-center justify-center text-white">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter the Member ID. A password reset link will be emailed to the
            address on file (via Firebase).
          </p>

          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-2 text-sm ${
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
              <label
                className="block text-xs font-bold mb-1.5"
                style={{ color: NAVY }}
              >
                Member ID
              </label>
              <input
                type="text"
                placeholder="e.g. 101799"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40 uppercase tracking-wide"
                autoFocus
              />
            </div>

            {resolvedEmail && (
              <p className="text-xs text-slate-500">
                Last looked-up email:{" "}
                <span className="font-mono text-slate-700">
                  {resolvedEmail}
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !memberId.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: NAVY }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Reset Email
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-[11px] text-slate-500">
            The link is generated by Firebase Authentication and is valid for a
            limited time. The member will land on{" "}
            <span className="font-mono">/reset-password</span> after clicking
            the email.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
