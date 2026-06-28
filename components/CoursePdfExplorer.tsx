"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp, Download, Loader2 } from "lucide-react";
import type { CourseId } from "@/lib/courseStorageCatalog";
import { useCourseResources, type ConceptPDFs, type PDFCard } from "@/hooks/useCourseResources";
import { ConfidentialPdfModal } from "@/components/ConfidentialPdfModal";

interface CoursePdfExplorerProps {
  courseId?: CourseId;
  isPremium: boolean;
  showModalDownload?: boolean;
  /** `stack` = full-width sections and rows (ICPA materials). */
  layout?: "grid" | "stack";
  externalData?: {
    sections: ConceptPDFs;
    loading: boolean;
    error: string | null;
    reload: () => void;
    loadingLabel?: string;
    emptyLabel?: string;
  };
}

export function CoursePdfExplorer({
  courseId,
  isPremium,
  showModalDownload = false,
  layout = "grid",
  externalData,
}: CoursePdfExplorerProps) {
  const hook = useCourseResources(
    courseId ?? "appliedfinance",
    isPremium,
    !externalData
  );
  const sections = externalData?.sections ?? hook.sections;
  const loading = externalData?.loading ?? hook.loading;
  const error = externalData?.error ?? hook.error;
  const reload = externalData?.reload ?? hook.reload;
  const loadingLabel =
    externalData?.loadingLabel ?? "Loading course materials…";
  const emptyLabel =
    externalData?.emptyLabel ??
    "No study materials uploaded yet for this course.";
  const [selectedConcept, setSelectedConcept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  useEffect(() => {
    if (!showModal) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [showModal]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {loadingLabel}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="mt-3 text-sm text-red-700 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const entries = Object.entries(sections);

  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">{emptyLabel}</p>
    );
  }

  const isStacked = layout === "stack";

  return (
    <>
      <div
        className={
          isStacked
            ? "flex flex-col gap-4 w-full"
            : "grid gap-6 sm:grid-cols-1 md:grid-cols-2"
        }
      >
        {entries.map(([concept, pdfs]) => {
          const showFiles = isStacked || selectedConcept === concept;

          return (
          <div
            key={concept}
            className={`bg-white rounded-lg shadow-md p-6 ${isStacked ? "w-full" : ""}`}
          >
            {isStacked ? (
              !(entries.length === 1) && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  {concept}
                </h3>
              )
            ) : (
            <button
              type="button"
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
            )}

            {showFiles && (
              <div className={isStacked ? "space-y-3" : "mt-4 space-y-3"}>
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.src}
                    className={
                      isStacked
                        ? "flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                        : "flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    }
                  >
                    <span className="text-gray-700 text-sm sm:text-base flex-grow pr-2 line-clamp-3">
                      {pdf.title}
                      {pdf.viewOnly && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                          View only
                        </span>
                      )}
                    </span>
                    <div
                      className={
                        isStacked
                          ? "flex flex-col gap-2 w-full sm:w-auto sm:self-start"
                          : "flex gap-2 mt-2 sm:mt-0"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handlePDFClick(pdf)}
                        className="px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        View
                      </button>
                      {!pdf.viewOnly && (
                        <a
                          href={pdf.src}
                          download={pdf.download}
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors whitespace-nowrap"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {showModal && selectedPDF && selectedPDF.viewOnly ? (
        <ConfidentialPdfModal pdf={selectedPDF} onClose={handleCloseModal} />
      ) : showModal && selectedPDF ? (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-70">
          <div className="relative w-full h-full flex flex-col bg-white">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-4 max-w-[70%]">
                {selectedPDF.title}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
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
            {showModalDownload && !selectedPDF.viewOnly && (
              <div className="p-4 bg-gray-50 border-t flex justify-center shrink-0">
                <a
                  href={selectedPDF.src}
                  download={selectedPDF.download}
                  className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
