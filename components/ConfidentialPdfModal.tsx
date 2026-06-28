"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import type { PDFCard } from "@/hooks/useCourseResources";
import { notesStorageKeyFromPublicPath } from "@/lib/notesStorage";

function resolveStoragePath(pdf: PDFCard): string | null {
  if (pdf.storagePath?.trim()) return pdf.storagePath.trim();

  const url = pdf.src;
  const prenotesMarker = "/prenotes/";
  const idx = url.indexOf(prenotesMarker);
  if (idx >= 0) {
    return decodeURIComponent(
      url
        .slice(idx + prenotesMarker.length)
        .split("?")[0]
        .split("#")[0]
    );
  }

  try {
    const pathPart = url.startsWith("http")
      ? new URL(url).pathname
      : url.split("?")[0].split("#")[0];
    if (pathPart.includes("/pdf/") || pathPart.startsWith("/pdf/")) {
      return notesStorageKeyFromPublicPath(pathPart) || null;
    }
  } catch {
    return null;
  }

  return null;
}

function ConfidentialPdfCanvas({ storagePath }: { storagePath: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const res = await fetch(
          `/api/icpa-view-document?path=${encodeURIComponent(storagePath)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("Could not open this document.");
        }

        const data = await res.arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setPageCount(doc.numPages);
        setPageNum(1);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load document.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    const page = await pdfDoc.getPage(pageNum);
    const containerWidth = containerRef.current.clientWidth - 32;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2, Math.max(0.75, containerWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, pageNum]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  useEffect(() => {
    const onResize = () => {
      void renderPage();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [renderPage]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Opening document…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-1 flex-col min-h-0 bg-slate-100">
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 border-b bg-white shrink-0">
          <button
            type="button"
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-700">
            Page {pageNum} of {pageCount}
          </span>
          <button
            type="button"
            disabled={pageNum >= pageCount}
            onClick={() => setPageNum((p) => Math.min(pageCount, p + 1))}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
      <div
        className="flex-1 overflow-auto flex justify-center p-4 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="shadow-lg bg-white max-w-full h-auto" />
      </div>
    </div>
  );
}

export function ConfidentialPdfModal({
  pdf,
  onClose,
}: {
  pdf: PDFCard;
  onClose: () => void;
}) {
  const storagePath = resolveStoragePath(pdf);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "icpa-block-print";
    style.textContent = "@media print { html, body { display: none !important; } }";
    document.head.appendChild(style);

    const blockShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "P", "S"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", blockShortcuts);
    return () => {
      window.removeEventListener("keydown", blockShortcuts);
      style.remove();
    };
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/80"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative w-full h-full flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {pdf.title}
            </h3>
            <p className="text-xs text-violet-700 font-medium mt-0.5">
              Confidential — view only. Download and print are disabled.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {storagePath ? (
          <ConfidentialPdfCanvas storagePath={storagePath} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-red-700">
            Could not resolve document for secure viewing.
          </div>
        )}
      </div>
    </div>
  );
}
