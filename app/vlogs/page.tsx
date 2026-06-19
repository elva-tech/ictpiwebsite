"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import {
  BlogMaterialsExplorer,
  IctpiCoreMaterialsSection,
} from "@/components/BlogMaterialsExplorer";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";

const ICTPI_CORE_MATERIALS = [
  {
    title: "Applied Financial Accounting and Ethics",
    src: "/pdf/Applied Financial Accounting and Ethics.pdf",
    download: "Applied Financial Accounting and Ethics.pdf",
  },
  {
    title: "Business Regulatory Laws and Compliances",
    src: "/pdf/Business Regulatory Laws and compliances.pdf",
    download: "Business Regulatory Laws and Compliances.pdf",
  },
  {
    title: "Direct Tax Law Compliances",
    src: "/pdf/Direct Tax Law Compliances.pdf",
    download: "Direct Tax Law Compliances.pdf",
  },
  {
    title: "Indirect Tax Law Compliances",
    src: "/pdf/Indirect Tax Law Compliances.pdf",
    download: "Indirect Tax Law Compliances.pdf",
  },
];

export default function StudyMaterialsPage() {
  const auth = useAuth() as { user?: unknown; loading?: boolean };
  const { isPremium } = usePortalMode();

  if (!auth?.user && !auth?.loading) return null;

  const coreMaterials = ICTPI_CORE_MATERIALS.map((item) => ({
    ...item,
    src: getPortalAssetPath(item.src, isPremium),
  }));

  return (
    <AuthenticatedLayout title="Vlogs & Materials" maxWidth="lg">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Faculty Study Materials
        </h1>

        <IctpiCoreMaterialsSection materials={coreMaterials} />

        <BlogMaterialsExplorer isPremium={isPremium} />
      </div>
    </AuthenticatedLayout>
  );
}
