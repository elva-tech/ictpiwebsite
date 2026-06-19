"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import indirecttax from "../../../../assets/directtax.webp";
import "../../../globals.css";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";
import { indirectTaxConceptPdfs } from "@/lib/indirectTaxMaterials";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
}

interface ConceptPDFs {
  [key: string]: PDFCard[];
}

export default function IndirectTaxPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const { isPremium } = usePortalMode();

  const [mounted, setMounted] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !showModal) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [mounted, showModal]);

  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  if (!mounted || !auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }
  if (!auth.user) return null;

  const conceptPDFs: ConceptPDFs = indirectTaxConceptPdfs;
  const resolvedConceptPDFs: ConceptPDFs = Object.fromEntries(
    Object.entries(conceptPDFs).map(([concept, pdfs]) => [
      concept,
      pdfs.map((pdf) => ({
        ...pdf,
        src: getPortalAssetPath(pdf.src, isPremium),
      })),
    ])
  );

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  const toggleConcept = (concept: string) => {
    setSelectedConcept((prev) => (prev === concept ? "" : concept));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/premium")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0">
              <Image
                src={indirecttax}
                alt="Indirect Taxation Laws and Compliance"
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
                Indirect Taxation Laws and Compliance
              </h1>
              
            </div>
            
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {Object.entries(resolvedConceptPDFs).map(([concept, pdfs]) => (
            <div key={concept} className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={() => toggleConcept(concept)}
                className="w-full flex items-center justify-between text-left hover:text-blue-600 transition-colors focus:outline-none"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pr-4">
                  {concept}
                </h3>
                {selectedConcept === concept ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>

              {selectedConcept === concept && (
                <div className="mt-4 space-y-3">
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
          ))}
        </div>
      </div>

      {showModal && selectedPDF && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-70">
          <div className="relative w-full h-full flex flex-col bg-white">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
            
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
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
          </div>
        </div>
      )}
    </div>
  );
}