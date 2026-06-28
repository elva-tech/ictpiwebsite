"use client";

import { useCallback, useEffect, useState } from "react";
import { getPortalAssetPath } from "@/lib/portalTheme";
import type { PDFCard, ConceptPDFs } from "@/hooks/useCourseResources";

export function usePremResources() {
  const [sections, setSections] = useState<ConceptPDFs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prem-resources");
      const json = (await res.json().catch(() => ({}))) as {
        sections?: Record<
          string,
          { title: string; appPath: string; download: string; viewOnly?: boolean; storagePath?: string }[]
        >;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? `Failed to load prem notes (${res.status})`);
      }

      const resolved: ConceptPDFs = {};
      for (const [group, files] of Object.entries(json.sections ?? {})) {
        resolved[group] = files.map((f) => ({
          title: f.title,
          download: f.download,
          src: getPortalAssetPath(f.appPath, true),
          viewOnly: f.viewOnly ?? true,
          storagePath: f.storagePath,
        }));
      }
      setSections(resolved);
    } catch (e) {
      console.error(e);
      setSections({});
      setError(e instanceof Error ? e.message : "Could not load ICPA study materials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { sections, loading, error, reload: load };
}

export type { PDFCard };
