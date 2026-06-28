"use client";

import { CoursePdfExplorer } from "@/components/CoursePdfExplorer";
import { usePremResources } from "@/hooks/usePremResources";

/** View-only ICPA materials from the `prenotes` bucket. */
export function PremNotesExplorer() {
  const prem = usePremResources();

  if (!prem.loading && !prem.error && Object.keys(prem.sections).length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">ICPA Study Materials</h2>
        <p className="text-sm text-gray-600 mt-1">
          ICPA books and study summaries — view online only, no download.
        </p>
      </div>
      <CoursePdfExplorer
        isPremium
        layout="stack"
        externalData={{
          ...prem,
          loadingLabel: "Loading ICPA study materials…",
          emptyLabel: "No ICPA study materials uploaded yet.",
        }}
      />
    </section>
  );
}
