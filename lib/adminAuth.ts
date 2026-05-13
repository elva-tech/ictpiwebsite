"use client";

/**
 * Lightweight client-side admin session.
 *
 * Credentials are read from public env vars (NEXT_PUBLIC_ADMIN_NAME /
 * NEXT_PUBLIC_ADMIN_PASSWORD). If the admin changes the password from the UI,
 * the override is stored in localStorage and takes precedence over env.
 *
 * The "session" itself lives in sessionStorage so it auto-clears when the
 * browser is closed.
 */

const SESSION_KEY = "ictpi.admin.session";
const LAST_ACTIVITY_KEY = "ictpi.admin.lastActivity";
const PASSWORD_OVERRIDE_KEY = "ictpi.admin.passwordOverride";

/** Max idle time before auto-logout (ms). */
export const ADMIN_IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** How often to evaluate idle timeout (ms). */
export const ADMIN_SESSION_CHECK_INTERVAL_MS = 10 * 60 * 1000;

export function getAdminName(): string {
  return process.env.NEXT_PUBLIC_ADMIN_NAME ?? "";
}

export function getAdminPassword(): string {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem(PASSWORD_OVERRIDE_KEY);
    if (override && override.length > 0) return override;
  }
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
}

export function setAdminPasswordOverride(newPassword: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSWORD_OVERRIDE_KEY, newPassword);
}

export function clearAdminPasswordOverride() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PASSWORD_OVERRIDE_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

/** Records admin UI activity so idle auto-logout resets. No-op if not signed in. */
export function touchAdminActivity() {
  if (typeof window === "undefined" || !isAdminAuthenticated()) return;
  window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function loginAdmin(username: string, password: string): boolean {
  const ok =
    username.trim() === getAdminName() &&
    password === getAdminPassword() &&
    getAdminName().length > 0;
  if (ok && typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    touchAdminActivity();
  }
  return ok;
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Returns true if the admin session exists but has been idle for at least
 * {@link ADMIN_IDLE_TIMEOUT_MS} (used by the periodic session check).
 */
export function isAdminIdlePastTimeout(): boolean {
  if (typeof window === "undefined" || !isAdminAuthenticated()) return false;
  const raw = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
  const last = raw ? Number.parseInt(raw, 10) : 0;
  if (!Number.isFinite(last) || last <= 0) return true;
  return Date.now() - last >= ADMIN_IDLE_TIMEOUT_MS;
}
