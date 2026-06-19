"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import directtaxImg from "../../../../assets/directtax.webp";
import "../../../globals.css";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";
import { getDirectTaxVlogPdfs } from "@/lib/directTaxMaterials";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
  mentor: string;
}

export default function DirectTaxPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const { isPremium } = usePortalMode();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<string>("all");

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

  const allPDFs: PDFCard[] = getDirectTaxVlogPdfs();
  const resolvedPDFs = allPDFs.map((pdf) => ({
    ...pdf,
    src: getPortalAssetPath(pdf.src, isPremium),
  }));

  // Extract unique mentors
  const mentors = Array.from(new Set(resolvedPDFs.map(pdf => pdf.mentor))).sort();

  // Filter by selected mentor
  const filteredPDFs = selectedMentor === "all" 
    ? resolvedPDFs
    : resolvedPDFs.filter(pdf => pdf.mentor === selectedMentor);

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/premium/vlogs")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm sm:text-base font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64">
              <Image
                src={directtaxImg}
                alt="Direct Tax Laws Compliance"
                width={300}
                height={200}
                className="w-full h-48 object-cover md:h-full"
                priority
              />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Direct Tax Laws & Compliance
              </h1>
              <p className="mt-3 text-gray-600">
                Select a mentor to access their exclusive study material
              </p>
            </div>
          </div>
        </div>

        {/* Mentor Dropdown */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-md text-black">
          <label htmlFor="mentor" className="block text-lg font-semibold text-gray-800 mb-3">
            Choose Your Mentor
          </label>
          <select
            id="mentor"
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full max-w-2xl px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          >
            <option value="all">All Mentors ({resolvedPDFs.length} notes)</option>
            {mentors.map(mentor => {
              const count = resolvedPDFs.filter(p => p.mentor === mentor).length;
              return (
                <option key={mentor} value={mentor}>
                  {mentor} ({count} notes)
                </option>
              );
            })}
          </select>
        </div>

        {/* PDF Cards Grid */}
        {filteredPDFs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl">No notes available for this mentor yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPDFs.map((pdf, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {pdf.title}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {pdf.mentor}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handlePDFClick(pdf)}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View PDF
                    </button>
                    <a
                      href={pdf.src}
                      download={pdf.download}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen PDF Modal */}
      {showModal && selectedPDF && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-75" onClick={handleCloseModal}>
          <div 
            className="relative w-full max-w-6xl h-full max-h-screen m-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-4 max-w-[70%]">
                {selectedPDF.title} - {selectedPDF.mentor}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={selectedPDF.src}
                className="w-full h-full border-0"
                title={selectedPDF.title}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}