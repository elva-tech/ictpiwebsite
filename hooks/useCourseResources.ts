"use client";

import { useCallback, useEffect, useState } from "react";
import { getPortalAssetPath } from "@/lib/portalTheme";
import type { CourseId } from "@/lib/courseStorageCatalog";

export interface PDFCard {
  title: string;
  src: string;
  download: string;
  viewOnly?: boolean;
  storagePath?: string;
}

export type ConceptPDFs = Record<string, PDFCard[]>;

export function useCourseResources(
  courseId: CourseId,
  isPremium: boolean,
  enabled = true
) {
  const [sections, setSections] = useState<ConceptPDFs>({});
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const premiumQuery = isPremium ? "&premium=1" : "";
      const res = await fetch(
        `/api/course-resources?course=${encodeURIComponent(courseId)}${premiumQuery}`
      );
      const json = (await res.json().catch(() => ({}))) as {
        sections?: Record<
          string,
          {
            title: string;
            appPath: string;
            download: string;
            viewOnly?: boolean;
            storagePath?: string;
          }[]
        >;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? `Failed to load resources (${res.status})`);
      }

      const resolved: ConceptPDFs = {};
      for (const [group, files] of Object.entries(json.sections ?? {})) {
        resolved[group] = files.map((f) => ({
          title: f.title,
          download: f.download,
          src: getPortalAssetPath(f.appPath, isPremium),
          viewOnly: f.viewOnly,
          storagePath: f.storagePath,
        }));
      }
      setSections(resolved);
    } catch (e) {
      console.error(e);
      setSections({});
      setError(e instanceof Error ? e.message : "Could not load course files.");
    } finally {
      setLoading(false);
    }
  }, [courseId, isPremium, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [load, enabled]);

  return { sections, loading, error, reload: load };
}
