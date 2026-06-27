"use client";

import { useEffect, useState } from "react";
import { getNotesStorageUrl, isNotesBucketPath } from "@/lib/notesStorage";

export type PortalMode = "standard" | "premium";

export const PORTAL_THEME_STORAGE_KEY = "ictpi-portal-mode";
export const PORTAL_THEME_EVENT = "ictpi-portal-mode-change";

export function getStoredPortalMode(): PortalMode {
  if (typeof window === "undefined") return "standard";
  const mode = window.localStorage.getItem(PORTAL_THEME_STORAGE_KEY);
  return mode === "premium" ? "premium" : "standard";
}

export function setStoredPortalMode(mode: PortalMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PORTAL_THEME_STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(PORTAL_THEME_EVENT, { detail: mode }));
}

/** Local static assets (public folder) — same URL for standard and premium. */
function isStaticPublicAssetPath(path: string): boolean {
  const p = path.startsWith("/") ? path : `/${path}`;
  const bare = p.startsWith("/premium/") ? p.slice("/premium".length) : p;
  return (
    bare.startsWith("/images/") ||
    bare.startsWith("/cert/") ||
    /\.(svg|jpe?g|png|webp|gif|ico)$/i.test(bare.split("?")[0] ?? "")
  );
}

export function getPortalAssetPath(path: string, isPremium: boolean) {
  if (isNotesBucketPath(path)) {
    return getNotesStorageUrl(path, { isPremium });
  }

  // Premium portal uses the same image/static paths as standard members.
  if (isStaticPublicAssetPath(path)) {
    return path.startsWith("/premium/") ? path.slice("/premium".length) : path;
  }

  if (!isPremium || !path.startsWith("/") || path.startsWith("/premium/")) {
    return path;
  }

  const premiumPath = `/premium${path}`;
  if (isNotesBucketPath(premiumPath)) {
    return getNotesStorageUrl(premiumPath, { isPremium });
  }

  return premiumPath;
}

export function usePortalMode() {
  const [mode, setMode] = useState<PortalMode>("standard");

  useEffect(() => {
    const syncMode = () => setMode(getStoredPortalMode());

    syncMode();
    window.addEventListener("storage", syncMode);
    window.addEventListener(PORTAL_THEME_EVENT, syncMode as EventListener);

    return () => {
      window.removeEventListener("storage", syncMode);
      window.removeEventListener(PORTAL_THEME_EVENT, syncMode as EventListener);
    };
  }, []);

  return {
    mode,
    isPremium: mode === "premium",
  };
}
