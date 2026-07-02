"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { PDFCard } from "@/hooks/useCourseResources";
import { notesStorageKeyFromPublicPath } from "@/lib/notesStorage";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

function clampZoom(value: number) {
  return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)) * 100) / 100;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<void> } | null>(
    null
  );

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setPdfDoc(null);

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

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
        setZoom(1);
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setLayoutVersion((v) => v + 1);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdfDoc || loading || error) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    if (containerWidth < 50) return;

    let disposed = false;

    const draw = async () => {
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (disposed) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.max((containerWidth - 32) / baseViewport.width, 0.1);
        const scale = fitScale * zoom;
        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx || disposed) return;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (e: unknown) {
        const name = (e as { name?: string })?.name;
        if (!disposed && name !== "RenderingCancelledException") {
          console.error("PDF render error:", e);
        }
      } finally {
        if (renderTaskRef.current && !disposed) {
          renderTaskRef.current = null;
        }
      }
    };

    void draw();

    return () => {
      disposed = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [pdfDoc, pageNum, zoom, loading, error, layoutVersion]);

  useEffect(() => {
    return () => {
      renderTaskRef.current?.cancel();
    };
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => clampZoom(z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => clampZoom(z - ZOOM_STEP));
  }, []);

  const goPrevPage = useCallback(() => {
    setPageNum((p) => Math.max(1, p - 1));
  }, []);

  const goNextPage = useCallback(() => {
    setPageNum((p) => Math.min(pageCount, p + 1));
  }, [pageCount]);

  useEffect(() => {
    if (!pdfDoc || loading) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextPage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pdfDoc, loading, goPrevPage, goNextPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.scrollLeft = 0;
  }, [pageNum]);

  return (
    <div ref={containerRef} className="relative flex flex-1 flex-col min-h-0 bg-slate-100">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2.5 px-3 border-b bg-white shrink-0 z-20">
        {pageCount > 1 && (
          <>
            <button
              type="button"
              disabled={pageNum <= 1 || loading}
              onClick={goPrevPage}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700 min-w-[88px] text-center">
              Page {pageNum} / {pageCount}
            </span>
            <button
              type="button"
              disabled={pageNum >= pageCount || loading}
              onClick={goNextPage}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="hidden sm:block w-px h-6 bg-gray-200" />
          </>
        )}

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={zoomOut}
            disabled={loading || zoom <= MIN_ZOOM}
            className="p-2 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-gray-600 min-w-[44px] text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={loading || zoom >= MAX_ZOOM}
            className="p-2 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
        <span className="text-[11px] text-gray-500 hidden md:inline">
          Use +/- to zoom · Arrow keys for pages
        </span>
      </div>

      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Opening document…
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6 text-center text-red-700 bg-slate-100">
            {error}
          </div>
        )}

        {pageCount > 1 && !loading && !error && (
          <>
            <button
              type="button"
              disabled={pageNum <= 1}
              onClick={goPrevPage}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 border border-gray-200 shadow-md p-2.5 hover:bg-white disabled:opacity-30 transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              type="button"
              disabled={pageNum >= pageCount}
              onClick={goNextPage}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 border border-gray-200 shadow-md p-2.5 hover:bg-white disabled:opacity-30 transition"
              aria-label="Next page"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="h-full overflow-auto overscroll-contain flex justify-center p-4"
        >
          <canvas ref={canvasRef} className="block shadow-lg bg-white" />
        </div>
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

    const blockPrintSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", blockPrintSave);
    return () => {
      window.removeEventListener("keydown", blockPrintSave);
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
    <div className="fixed inset-0 z-50 flex bg-black/80">
      <div className="relative w-full h-full flex flex-col bg-white min-h-0">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {pdf.title}
            </h3>
            <p className="text-xs text-violet-700 font-medium mt-0.5">
              Confidential — view only. Scroll to move · use +/- to zoom.
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
