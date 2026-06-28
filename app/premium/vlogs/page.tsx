"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { BlogMaterialsExplorer } from "@/components/BlogMaterialsExplorer";
import { PremNotesExplorer } from "@/components/PremNotesExplorer";

export default function PremiumStudyMaterialsPage() {
  const auth = useAuth() as { user?: unknown; loading?: boolean };

  if (!auth?.user && !auth?.loading) return null;

  return (
    <AuthenticatedLayout title="Vlogs & Materials" maxWidth="lg">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Faculty Study Materials
        </h1>

        <PremNotesExplorer />

        <BlogMaterialsExplorer isPremium />
      </div>
    </AuthenticatedLayout>
  );
}
