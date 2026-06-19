"use client";

import { useCallback, useEffect, useState } from "react";
import { getPortalAssetPath } from "@/lib/portalTheme";
import type { CourseId } from "@/lib/courseStorageCatalog";

export interface PDFCard {
  title: string;
  src: string;
  download: string;
}

export type ConceptPDFs = Record<string, PDFCard[]>;

export function useCourseResources(courseId: CourseId, isPremium: boolean) {
  const [sections, setSections] = useState<ConceptPDFs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/course-resources?course=${encodeURIComponent(courseId)}`
      );
      const json = (await res.json().catch(() => ({}))) as {
        sections?: Record<
          string,
          { title: string; appPath: string; download: string }[]
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
  }, [courseId, isPremium]);

  useEffect(() => {
    load();
  }, [load]);

  return { sections, loading, error, reload: load };
}
