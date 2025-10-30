"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ArrowLeft, ChevronDown, ChevronUp, Download } from "lucide-react";
import Image from "next/image";
import directax from "../../../assets/directtax.webp";
import "../../globals.css";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  loading: boolean;
}

interface PDFCard {
  title: string;
  src: string;
  download: string;
}

export default function DTLCPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");

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

  const pdfSections: { [key: string]: PDFCard[] } = {
    "Core Modules": [
      { title: "DTLC - Chapter 1: Income Tax Basics", src: "/pdf/dtlc/core/Income Tax Basics.pdf", download: "DTLC_Income_Tax_Basics.pdf" },
      { title: "DTLC - Chapter 2: Deductions & Exemptions", src: "/pdf/dtlc/core/Deductions and Exemptions.pdf", download: "DTLC_Deductions_Exemptions.pdf" },
      { title: "DTLC - Chapter 3: TDS Compliance", src: "/pdf/dtlc/core/TDS Compliance.pdf", download: "DTLC_TDS_Compliance.pdf" },
      { title: "DTLC - Chapter 4: Salary Income", src: "/pdf/dtlc/core/Salary Income.pdf", download: "DTLC_Salary_Income.pdf" },
      { title: "DTLC - Chapter 5: House Property", src: "/pdf/dtlc/core/House Property.pdf", download: "DTLC_House_Property.pdf" },
      { title: "DTLC - Chapter 6: Business & Profession", src: "/pdf/dtlc/core/Business and Profession.pdf", download: "DTLC_Business_Profession.pdf" },
      { title: "DTLC - Chapter 7: Capital Gains", src: "/pdf/dtlc/core/Capital Gains.pdf", download: "DTLC_Capital_Gains.pdf" },
      { title: "DTLC - Chapter 8: Other Sources", src: "/pdf/dtlc/core/Other Sources.pdf", download: "DTLC_Other_Sources.pdf" },
    ],
    "Advanced Topics": [
      { title: "DTLC - Advance Tax & Interest", src: "/pdf/dtlc/advanced/Advance Tax and Interest.pdf", download: "DTLC_Advance_Tax_Interest.pdf" },
      { title: "DTLC - Return Filing Procedures", src: "/pdf/dtlc/advanced/Return Filing Procedures.pdf", download: "DTLC_Return_Filing.pdf" },
      { title: "DTLC - Assessment & Reassessment", src: "/pdf/dtlc/advanced/Assessment and Reassessment.pdf", download: "DTLC_Assessment_Reassessment.pdf" },
      { title: "DTLC - Appeals & Revision", src: "/pdf/dtlc/advanced/Appeals and Revision.pdf", download: "DTLC_Appeals_Revision.pdf" },
      { title: "DTLC - Penalties & Prosecution", src: "/pdf/dtlc/advanced/Penalties and Prosecution.pdf", download: "DTLC_Penalties_Prosecution.pdf" },
      { title: "DTLC - Tax Planning & Management", src: "/pdf/dtlc/advanced/Tax Planning and Management.pdf", download: "DTLC_Tax_Planning.pdf" },
    ],
    "Practical Compliance": [
      { title: "DTLC - Form 16, 16A, 24Q, 26Q", src: "/pdf/dtlc/practical/Form 16_16A_24Q_26Q.pdf", download: "DTLC_TDS_Forms.pdf" },
      { title: "DTLC - ITR Forms Guide", src: "/pdf/dtlc/practical/ITR Forms Guide.pdf", download: "DTLC_ITR_Forms.pdf" },
      { title: "DTLC - E-Filing Step-by-Step", src: "/pdf/dtlc/practical/E-Filing Guide.pdf", download: "DTLC_EFiling_Guide.pdf" },
      { title: "DTLC - Common Errors & Rectification", src: "/pdf/dtlc/practical/Common Errors and Rectification.pdf", download: "DTLC_Common_Errors.pdf" },
    ],
    "Case Studies & MCQs": [
      { title: "DTLC - Practical Case Studies", src: "/pdf/dtlc/cases/Case Studies.pdf", download: "DTLC_Case_Studies.pdf" },
      { title: "DTLC - 500+ MCQs with Answers", src: "/pdf/dtlc/cases/MCQs.pdf", download: "DTLC_MCQs.pdf" },
    ],
  };

  const handlePDFClick = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPDF(null);
    setShowModal(false);
  };

  const toggleSection = (section: string) => {
    setSelectedSection((prev) => (prev === section ? "" : section));
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 flex-shrink-0">
              <Image
                src={directax}
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
                Direct Tax Laws Compliance (DTLC)
              </h1>
              
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {Object.entries(pdfSections).map(([section, pdfs]) => (
            <div key={section} className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between text-left hover:text-blue-600 transition-colors focus:outline-none"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pr-4">
                  {section}
                </h3>
                {selectedSection === section ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>

              {selectedSection === section && (
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
            <div className="p-4 bg-gray-50 border-t flex justify-center">
              <a
                href={selectedPDF.src}
                download={selectedPDF.download}
                className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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