"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, AlertCircle } from "lucide-react";
import Image from "next/image";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";

export default function Certificates() {
  const auth = useAuth() as any;
  const { isPremium } = usePortalMode();

  if (!auth?.user && !auth?.loading) return null;

  // Temporary static certificates – using public/ paths
  const tempCertificates = [
    {
      label: "Skill India Marksheet",
      status: "Preparing",
      accent: "from-orange-50 to-amber-100",
      note: "Will be available after result processing",
      image: "/images/skill-india.jpg",
    },
    {
      label: "NCVET Qualification Certificate",
      status: "Preparing",
      accent: "from-blue-50 to-indigo-100",
      note: "Awaiting official issuance",
      image: "/images/nvcet.jpg",
    },
    {
      label: "CTPr (ICTPI) Membership Certificate",
      status: "Active Member",
      accent: "from-blue-50 to-blue-200",
      note: "Available soon – contact support if urgent",
      image: "/images/ICTPL_image.jpg",
    },
  ];
  const resolvedCertificates = tempCertificates.map((cert) => ({
    ...cert,
    image: getPortalAssetPath(cert.image, isPremium),
  }));

  return (
    <AuthenticatedLayout title="Certificates" maxWidth="full">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Certificates & Marksheets
              </h1>

              <div className="mb-8 flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Certificates are not yet uploaded</p>
                  <p className="text-sm mt-1">
                    Your official documents will appear here once processed and uploaded. Thank you for your patience.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {resolvedCertificates.map((cert, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
                  >
                    <div className={`h-48 bg-gradient-to-br ${cert.accent} flex items-center justify-center p-8`}>
                      <Image
                        src={cert.image}
                        alt={`${cert.label} preview`}
                        width={140}
                        height={140}
                        className="object-contain drop-shadow-md opacity-90"
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                        {cert.label}
                      </h3>

                      <p className="text-center text-sm mb-4">
                        Status: <span className="font-semibold text-amber-700">{cert.status}</span>
                      </p>

                      <p className="text-center text-sm text-gray-500 mb-6 flex-1">
                        {cert.note}
                      </p>

                      <button
                        disabled
                        className="mt-auto bg-gray-400 text-white font-medium py-3.5 rounded-xl text-center cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FileText className="w-5 h-5" />
                        Not Available Yet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
    </AuthenticatedLayout>
  );
}