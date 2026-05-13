"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated, loginAdmin } from "@/lib/adminAuth";

const NAVY = "#1e2659";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  // Always land on a blank login form. Drop any previously remembered
  // username and reset state in case the browser restored values.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ictpi.admin.rememberedUsername");
    }
    setUsername("");
    setPassword("");
    setError(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const ok = loginAdmin(username, password);
    setSubmitting(false);
    if (!ok) {
      setError("Invalid username or password.");
      return;
    }
    router.replace("/admin/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold" style={{ color: NAVY }}>
            Sign in
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your username and password to sign in
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
            autoComplete="off"
          >
            {/* Honeypot inputs to discourage browser autofill restoring values. */}
            <input
              type="text"
              name="prevent_autofill"
              autoComplete="username"
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
              readOnly
            />
            <input
              type="password"
              name="prevent_autofill_password"
              autoComplete="new-password"
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
              readOnly
            />

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>
                Username
              </label>
              <input
                type="text"
                name="admin-username"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: NAVY }}>
                Password
              </label>
              <input
                type="password"
                name="admin-password"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-[#1e2659]/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ background: NAVY }}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <footer className="mt-16 text-xs text-slate-400">
            <p>Copyright © 2026, All Right Reserved <span className="font-semibold text-slate-600">ICTPI.</span></p>
            <p>Designed &amp; Developed by <span className="font-semibold text-slate-600">ELVA TECH</span></p>
          </footer>
        </div>
      </div>

      <div
        className="hidden md:flex items-center justify-center text-white text-center px-10"
        style={{
          background:
            "linear-gradient(135deg, #6f7eb4 0%, #4d5f9b 50%, #34467a 100%)",
        }}
      >
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">&quot;Attention is the new currency&quot;</h2>
          <p className="text-sm text-white/80">
            The more effortless the writing looks, the more effort the writer
            actually put into the process.
          </p>
        </div>
      </div>
    </div>
  );
}
