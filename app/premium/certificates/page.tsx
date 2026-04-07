"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, AlertCircle } from "lucide-react";
import Image from "next/image";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";

export default function Certificates() {
  const auth = useAuth() as any;
  const { isPremium } = usePortalMode();

  // Redirect or show loading if not authenticated
  if (!auth?.user && !auth?.loading) {
    return null;
  }

  // Temporary static certificates
  const tempCertificates = [
    {
      label: "Skill India Marksheet",
      status: "Preparing",
      accent: "from-orange-50 to-amber-100",
      note: "Will be available after result processing",
      image: "/images/skill-india.svg", // Public folder path
    },
    {
      label: "NCVET Qualification Certificate",
      status: "Preparing",
      accent: "from-blue-50 to-indigo-100",
      note: "Awaiting official issuance",
      image: "/images/nvcet.svg",
    },
    {
      label: "CTPr (ICTPI) Membership Certificate",
      status: "Active Member",
      accent: "from-blue-50 to-blue-200",
      note: "Available soon – contact support if urgent",
      image: "/images/ICTPL_image.jpg",
    },
  ];

  // Resolve image paths based on portal mode (premium/normal)
  const resolvedCertificates = tempCertificates.map((cert) => ({
    ...cert,
    image: getPortalAssetPath(cert.image, isPremium),
  }));

  return (
    <AuthenticatedLayout title="Certificates" maxWidth="full">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certificates & Marksheets</h1>
              <p className="text-gray-600 mt-1">Your official training and qualification documents</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Certificates are not yet uploaded</h3>
              <p className="text-amber-700 mt-1 text-sm">
                Your official documents will appear here once processed and uploaded. 
                Thank you for your patience.
              </p>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedCertificates.map((cert, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300`}
              >
                {/* Certificate Preview */}
                <div className={`h-48 bg-gradient-to-br ${cert.accent} relative flex items-center justify-center p-8`}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    {cert.image.endsWith(".svg") ? (
                      // For SVG files - use <Image> with fill for proper scaling
                      <Image
                        src={cert.image}
                        alt={cert.label}
                        fill
                        className="object-contain p-4"
                        priority={index === 0}
                      />
                    ) : (
                      // For JPG/PNG
                      <Image
                        src={cert.image}
                        alt={cert.label}
                        fill
                        className="object-contain p-6"
                        priority={index === 0}
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {cert.label}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {cert.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-6">{cert.note}</p>

                  {/* Action Button */}
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 disabled:cursor-not-allowed text-gray-500 rounded-2xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Not Available Yet
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-500 mt-12">
            Documents are issued by respective authorities and uploaded after verification.
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}