"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { useBlogResources, type PDFCard } from "@/hooks/useBlogResources";
import { ConfidentialPdfModal } from "@/components/ConfidentialPdfModal";

interface BlogMaterialsExplorerProps {
  isPremium: boolean;
}

export function BlogMaterialsExplorer({ isPremium }: BlogMaterialsExplorerProps) {
  const { sections, loading, error, reload } = useBlogResources(isPremium);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedPdf, setSelectedPdf] = useState<PDFCard | null>(null);

  useEffect(() => {
    const keys = Object.keys(sections);
    if (keys.length === 0) return;
    setExpanded((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        if (next[key] === undefined) next[key] = true;
      }
      return next;
    });
  }, [sections]);

  useEffect(() => {
    if (!selectedPdf) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPdf(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [selectedPdf]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading faculty materials…
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
      <p className="text-center text-gray-500 py-8 rounded-xl border border-dashed border-gray-200 bg-white">
        No faculty blog materials uploaded yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {entries.map(([title, materials]) => {
          const isOpen = expanded[title] ?? true;
          return (
            <div
              key={title}
              className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [title]: !isOpen }))
                }
                className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:brightness-105 transition"
              >
                <div className="flex items-center gap-3 text-left">
                  <BookOpen className="w-6 h-6 shrink-0" />
                  <h2 className="text-xl font-bold">{title}</h2>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-6 h-6 shrink-0" />
                ) : (
                  <ChevronRight className="w-6 h-6 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-6 space-y-6 bg-gray-50">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {materials.map((item) => (
                      <div
                        key={item.src}
                        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-tight">
                          {item.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPdf(item)}
                            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                          >
                            <Eye className="w-5 h-5" />
                            View
                          </button>
                          {!item.viewOnly && (
                            <a
                              href={item.src}
                              download={item.download}
                              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-center"
                            >
                              <Download className="w-5 h-5" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPdf && selectedPdf.viewOnly ? (
        <ConfidentialPdfModal
          pdf={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      ) : selectedPdf ? (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold truncate flex-1">
              {selectedPdf.title}
            </h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <a
                href={selectedPdf.src}
                download={selectedPdf.download}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
              <button
                type="button"
                onClick={() => setSelectedPdf(null)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
          </div>
          <iframe
            src={selectedPdf.src}
            className="flex-1 w-full bg-white"
            title={selectedPdf.title}
            allowFullScreen
          />
        </div>
      ) : null}
    </>
  );
}

/** Static ICTPI core materials accordion (root bucket PDFs). */
export function IctpiCoreMaterialsSection({
  materials,
}: {
  materials: { title: string; src: string; download: string }[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<{
    title: string;
    src: string;
    download: string;
  } | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:brightness-105 transition"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold">ICTPI Core Materials</h2>
          </div>
          {expanded ? (
            <ChevronDown className="w-6 h-6" />
          ) : (
            <ChevronRight className="w-6 h-6" />
          )}
        </button>

        {expanded && (
          <div className="p-6 space-y-6 bg-gray-50">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {materials.map((item) => (
                <div
                  key={item.src}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPdf(item)}
                      className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                      <Eye className="w-5 h-5" />
                      View
                    </button>
                    <a
                      href={item.src}
                      download={item.download}
                      className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-center"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPdf && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold truncate flex-1">
              {selectedPdf.title}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedPdf(null)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
          <iframe
            src={selectedPdf.src}
            className="flex-1 w-full bg-white"
            title={selectedPdf.title}
            allowFullScreen
          />
        </div>
      )}
    </>
  );
}
