"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X, Eye, ArrowLeft } from "lucide-react"; // Added ArrowLeft import
import Image from "next/image";
import complaince from "../../../assets/complaiance.webp";
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

interface ConceptPDFs {
  [key: string]: PDFCard[];
}

export default function BusinessRegulatoryPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  useEffect(() => {
    setMounted(true); // ensures client-side only
  }, []);

  useEffect(() => {
    if (!mounted) return; // only run on client
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, showModal]);

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
  }, [auth, router]);

  if (!auth || auth.loading || !mounted)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  if (!auth.user) return null;

  // Define concepts and their related PDFs
  const conceptPDFs: ConceptPDFs = {
    "Advising on Setting Up a Business": [
      {
        title: "Business Collaborations",
        src: "/pdf/bussiness/advising/Business Collaborations.pdf",
        download: "Business Collaborations.pdf",
      },
      {
        title: "Charter Documents of companies",
        src: "/pdf/bussiness/advising/Charter Documents of companies.pdf",
        download: "Charter Documents of companies.pdf",
      },
      {
        title: "Choice of Business Organizations",
        src: "/pdf/bussiness/advising/Choice of Business Organisation.pdf",
        download: "Choice of Business Organisation.pdf",
      },
      {
        title: "Conversion of Business Entities",
        src: "/pdf/bussiness/advising/Conversion of Business Entities.pdf",
        download: "Conversion of Business Entities.pdf",
      },
      {
        title: "Different forms of business organisations and it's registration",
        src: "/pdf/bussiness/advising/Different forms of business organisations and it's registration.pdf",
        download: "Different forms of business organisations and it's registration.pdf",
      },
      {
        title: "Financial Services Organisation and its registrations",
        src: "/pdf/bussiness/advising/Financial Services Organisation and its registrations.pdf",
        download: "Financial Services Organisation and its registrations.pdf",
      },
      {
        title: "Formation of LLP",
        src: "/pdf/bussiness/advising/Fomation of LLP.pdf",
        download: "Fomation of LLP.pdf",
      },
      {
        title: "Formation and registration of NGO's",
        src: "/pdf/bussiness/advising/Formation and registration of NGOs.pdf",
        download: "Formation and registration of NGOs.pdf",
      },
      {
        title: "Legal status of the registered company",
        src: "/pdf/bussiness/advising/Legal status of the registered company.pdf",
        download: "Legal status of the registered company.pdf",
      },
      {
        title: "Setting up of Business outside India and Issues (2)",
        src: "/pdf/bussiness/advising/Setting up of Business outside India and Issues (2).pdf",
        download: "Setting up of Business outside India and Issues (2).pdf",
      },
      {
        title: "Startups and it's registrations",
        src: "/pdf/bussiness/advising/Startups and it's registrations.pdf",
        download: "Startups and it's registrations.pdf",
      },
      {
        title: "Types of Companies",
        src: "/pdf/bussiness/advising/Types of Companies.pdf",
        download: "Types of Companies.pdf",
      },
    ],
    "Business Maintenance": [
      {
        title: "Compliance's relating to environmental laws",
        src: "/pdf/bussiness/bussinessmaintaince/Compliance's relating to environmental laws.pdf",
        download: "Compliance's relating to environmental laws.pdf",
      },
      {
        title: "Compliance's under labour Laws",
        src: "/pdf/bussiness/bussinessmaintaince/Compliance's under labour Laws.pdf",
        download: "Compliance's under labour Laws.pdf",
      },
      {
        title: "Identifying laws applicable to Various Industries and their compliances",
        src: "/pdf/bussiness/bussinessmaintaince/Identifying laws applicable to Various Industries and their compliances.pdf",
        download: "Identifying laws applicable to Various Industries and their compliances.pdf",
      },
      {
        title: "Maintenance of Registers and Records",
        src: "/pdf/bussiness/bussinessmaintaince/Maintenance of Registers and Records.pdf",
        download: "Maintenance of Registers and Records.pdf",
      },
    ],
    "Appendix of Lessons": [
      {
        title: "ARBITRATION AND CONCILIATION ACT, 1996",
        src: "/pdf/bussiness/appendix/ARBITRATION AND CONCILIATION ACT, 1996.pdf",
        download: "ARBITRATION AND CONCILIATION ACT, 1996.pdf",
      },
      {
        title: "COMPANIES ACT, 2013",
        src: "/pdf/bussiness/appendix/COMPANIES ACT, 2013.pdf",
        download: "COMPANIES ACT, 2013.pdf",
      },
      {
        title: "EMPLOYEE STATE INSURANCE ACT, 1948",
        src: "/pdf/bussiness/appendix/EMPLOYEE STATE INSURANCE ACT, 1948.pdf",
        download: "EMPLOYEE STATE INSURANCE ACT, 1948.pdf",
      },
      {
        title: "EPF AND MISC. PROVISIONS ACT, 1952",
        src: "/pdf/bussiness/appendix/EPF AND MISC. PROVISIONS ACT, 1952.pdf",
        download: "EPF AND MISC. PROVISIONS ACT, 1952.pdf",
      },
      {
        title: "INDIAN CONTRACT ACT, 1872",
        src: "/pdf/bussiness/appendix/INDIAN CONTRACT ACT, 1872.pdf",
        download: "INDIAN CONTRACT ACT, 1872.pdf",
      },
      {
        title: "INDIAN STAMP ACT, 1899",
        src: "/pdf/bussiness/appendix/INDIAN STAMP ACT, 1899.pdf",
        download: "INDIAN STAMP ACT, 1899.pdf",
      },
      {
        title: "INDIAN TRUST ACT, 1882",
        src: "/pdf/bussiness/appendix/INDIAN TRUST ACT, 1882.pdf",
        download: "INDIAN TRUST ACT, 1882.pdf",
      },
      {
        title: "LIMITED LIABILITY PARTNERSHIP ACT, 2008",
        src: "/pdf/bussiness/appendix/LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf",
        download: "LIMITED LIABILITY PARTNERSHIP ACT, 2008.pdf",
      },
      {
        title: "MINIMUM WAGES ACT, 1948",
        src: "/pdf/bussiness/appendix/MINIMUM WAGES ACT, 1948.pdf",
        download: "MINIMUM WAGES ACT, 1948.pdf",
      },
      {
        title: "MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002",
        src: "/pdf/bussiness/appendix/MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002.pdf",
        download: "MULTI-STATE CO-OPERATIVE SOCIETIES ACT, 2002.pdf",
      },
      {
        title: "NEGOTIABLE INSTRUMENT ACT, 1881",
        src: "/pdf/bussiness/appendix/NEGOTIABLE INSTRUMENT ACT, 1881.pdf",
        download: "NEGOTIABLE INSTRUMENT ACT, 1881.pdf",
      },
      {
        title: "PARTNERSHIP ACT, 1932",
        src: "/pdf/bussiness/appendix/PARTNERSHIP ACT, 1932.pdf",
        download: "PARTNERSHIP ACT, 1932.pdf",
      },
      {
        title: "PAYMENT OF BONUS ACT, 1965",
        src: "/pdf/bussiness/appendix/PAYMENT OF BONUS ACT, 1965.pdf",
        download: "PAYMENT OF BONUS ACT, 1965.pdf",
      },
      {
        title: "PAYMENT OF GRATUITY ACT, 1972",
        src: "/pdf/bussiness/appendix/PAYMENT OF GRATUITY ACT, 1972.pdf",
        download: "PAYMENT OF GRATUITY ACT, 1972.pdf",
      },
      {
        title: "PAYMENT OF WAGES ACT, 1936",
        src: "/pdf/bussiness/appendix/PAYMENT OF WAGES ACT, 1936.pdf",
        download: "PAYMENT OF WAGES ACT, 1936.pdf",
      },
      {
        title: "PROFESSION TAX",
        src: "/pdf/bussiness/appendix/PROFESSION TAX.pdf",
        download: "PROFESSION TAX.pdf",
      },
      {
        title: "PUBLIC SECTOR ENTITIES",
        src: "/pdf/bussiness/appendix/PUBLIC SECTOR ENTITIES.pdf",
        download: "PUBLIC SECTOR ENTITIES.pdf",
      },
      {
        title: "SPECIFIC RELIEF ACT, 1963",
        src: "/pdf/bussiness/appendix/SPECIFIC RELIEF ACT, 1963.pdf",
        download: "SPECIFIC RELIEF ACT, 1963.pdf",
      },
      {
        title: "TYPES OF BUSINESS ENTITIES",
        src: "/pdf/bussiness/appendix/TYPES OF BUSINESS ENTITIES.pdf",
        download: "TYPES OF BUSINESS ENTITIES.pdf",
      },
    ],
    "Procedure to Close a Business": [
      {
        title: "Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview",
        src: "/pdf/bussiness/procedure/Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf",
        download: "Corporate Insolvency Resolution Process,Liquidation &.winding up_ An Overview.pdf",
      },
      {
        title: "Dormant Company",
        src: "/pdf/bussiness/procedure/Dormant Company.pdf",
        download: "Dormant Company.pdf",
      },
      {
        title: "Strike off and Restoration of Name of Co and LLP",
        src: "/pdf/bussiness/procedure/Strike off and Restoration of Name of Co and LLP.pdf",
        download: "Strike off and Restoration of Name of Co and LLP.pdf",
      },
    ],
  };

  const concepts = Object.keys(conceptPDFs);

  const handleConceptChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConcept(event.target.value);
  };

  const handleViewPDF = (pdf: PDFCard) => {
    setSelectedPDF(pdf);
    setShowModal(true);
  };

  const handleDownloadPDF = (pdf: PDFCard) => {
    const link = document.createElement("a");
    link.href = pdf.src;
    link.download = pdf.download;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPDF(null);
  };

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-black">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl text-center">
        {/* Go Back Button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="relative w-full h-56 mb-6">
          <Image
            src={complaince}
            alt="Business Regulatory Laws Compliance"
            fill
            className="object-cover rounded-xl"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-[#0062cc] mb-6">
          Business Regulatory Laws Compliance
        </h1>

        <div className="mb-6">
          <select
            value={selectedConcept}
            onChange={handleConceptChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062cc] focus:border-transparent text-sm"
          >
            <option value="" disabled>
              Select a concept to view related PDFs
            </option>
            {concepts.map((concept) => (
              <option key={concept} value={concept}>
                {concept}
              </option>
            ))}
          </select>
        </div>

        {selectedConcept && conceptPDFs[selectedConcept] && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              PDFs for {selectedConcept}:
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {conceptPDFs[selectedConcept].map((pdf, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                >
                  <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 grow">
                    {pdf.title}
                  </h3>
                  <div className="flex gap-2 justify-center mt-auto">
                    <button
                      onClick={() => handleViewPDF(pdf)}
                      className="flex items-center gap-1 bg-[#0062cc] text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(pdf)}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {showModal && selectedPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col text-black">
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-80">
            <h3 className="text-white text-lg font-semibold line-clamp-1">
              {selectedPDF.title}
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 w-full relative overflow-hidden">
            <iframe
              src={selectedPDF.src}
              className="w-full h-full"
              title={selectedPDF.title}
            />
          </div>

          <div className="flex justify-center p-4 bg-black bg-opacity-80 gap-2">
            <button
              onClick={() => handleDownloadPDF(selectedPDF)}
              className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={handleCloseModal}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}