"use client";

import { useEffect } from "react";
import { getStoredPortalMode, PORTAL_THEME_EVENT } from "@/lib/portalTheme";

export function PortalThemeSync() {
  useEffect(() => {
    const applyMode = () => {
      document.body.dataset.portalMode = getStoredPortalMode();
    };

    applyMode();
    window.addEventListener("storage", applyMode);
    window.addEventListener(PORTAL_THEME_EVENT, applyMode as EventListener);

    return () => {
      window.removeEventListener("storage", applyMode);
      window.removeEventListener(PORTAL_THEME_EVENT, applyMode as EventListener);
    };
  }, []);

  return null;
}
