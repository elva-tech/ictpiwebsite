"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp, Download } from "lucide-react";
import Image from "next/image";
import directtaxImg from "../../../assets/directtax.webp";
import "../../globals.css";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";
import { directTaxPdfData } from "@/lib/directTaxMaterials";
interface AuthUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
}

type Section = PDFCard[];
type Category = Record<string, Record<string, Section>>;

const pdfData: Category = directTaxPdfData;

export default function DirectTaxPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const { isPremium } = usePortalMode();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  const [openTop, setOpenTop] = useState<{ Domestic?: boolean; International?: boolean }>({
    Domestic: false,
    International: false,
  });

  const [openSub, setOpenSub] = useState<Record<string, boolean>>({});
  const resolvedPdfData: Category = Object.fromEntries(
    Object.entries(pdfData).map(([topKey, subObj]) => [
      topKey,
      Object.fromEntries(
        Object.entries(subObj).map(([sectionKey, pdfs]) => [
          sectionKey,
          pdfs.map((pdf) => ({
            ...pdf,
            src: getPortalAssetPath(pdf.src, isPremium),
          })),
        ])
      ),
    ])
  ) as Category;

  useEffect(() => setMounted(true), []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  useEffect(() => {
    if (!mounted || !showModal) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [mounted, showModal]);

  if (!mounted || !auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  const toggleTop = (key: "Domestic" | "International") => {
    setOpenTop((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSub = (top: string, sub: string) => {
    const id = `${top}|${sub}`;
    setOpenSub((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0">
              <Image
                src={directtaxImg}
                alt="Direct Tax Laws Compliance"
                width={300}
                height={200}
                className="w-full h-48 object-cover md:h-full md:w-full"
                priority
              />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </div>
              <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Direct Tax Laws Compliance
              </h1>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">
                Comprehensive study materials covering domestic and international taxation concepts.
              </p>
            </div>
          </div>
        </div>

        {/* Nested Dropdowns */}
        <div className="space-y-6">
          {Object.entries(resolvedPdfData).map(([topKey, subObj]) => (
            <div key={topKey} className="bg-white rounded-lg shadow-md">
              {/* Top Level */}
              <button
                onClick={() => toggleTop(topKey as "Domestic" | "International")}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <h2 className="text-xl font-semibold text-gray-800">{topKey} Taxation</h2>
                {openTop[topKey as keyof typeof openTop] ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Sub-chapters */}
              {openTop[topKey as keyof typeof openTop] && (
                <div className="border-t border-gray-200">
                  {Object.entries(subObj).map(([subKey, pdfs]) => {
                    const subId = `${topKey}|${subKey}`;
                    return (
                      <div key={subKey} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => toggleSub(topKey, subKey)}
                          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <h3 className="text-lg font-medium text-gray-700">{subKey}</h3>
                          {openSub[subId] ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>

                        {/* PDFs */}
                        {openSub[subId] && (
                          <div className="px-5 pb-4 space-y-2">
                            {pdfs.map((pdf, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-gray-700 text-sm sm:text-base flex-grow pr-2 line-clamp-2">
                                  {pdf.title}
                                </span>
                                <div className="flex gap-2 mt-2 sm:mt-0">
                                  <button
                                    onClick={() => handlePDFClick(pdf)}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                  >
                                    View
                                  </button>
                                  <a
                                    href={pdf.src}
                                    download={pdf.download}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPDF && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-70">
          <div className="relative w-full h-full flex flex-col bg-white">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-4 max-w-[70%]">
                {selectedPDF.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPDF.src}
                className="w-full h-full border-0"
                title={selectedPDF.title}
                allowFullScreen
                style={{ display: "block" }}
              />
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-center shrink-0">
              <a
                href={selectedPDF.src}
                download={selectedPDF.download}
                className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}