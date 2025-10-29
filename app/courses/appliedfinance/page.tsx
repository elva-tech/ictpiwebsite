"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X, Eye, ArrowLeft } from "lucide-react";
import Image from "next/image";
import appliedfinance from "../../../assets/fourthimage.webp";
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

export default function AppliedFinancePage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFCard | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
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

  const conceptPDFs: ConceptPDFs = {
    "Chapter-01": [
      {
        title: "Chapter 1.1 - Accounting Assumptions and Concepts",
        src: "/pdf/appliedfinance/chapter1/Accounting Assumptions and Concepts.pdf",
        download: "Accounting Assumptions and Concepts.pdf",
      },
      {
        title: "Chapter 1.2 - Preliminaries",
        src: "/pdf/appliedfinance/chapter1/Preliminaries.pdf",
        download: "Preliminaries.pdf",
      },
      {
        title: "Chapter 1.3 - Other Related Matters",
        src: "/pdf/appliedfinance/chapter1/Other Related Matters.pdf",
        download: "Other Related Matters.pdf",
      },
    ],
    "Chapter-02": [
      {
        title: "Chapter 2.1 - 2A Journal",
        src: "/pdf/appliedfinance/chapter2/2A Journal.pdf",
        download: "2A Journal.pdf",
      },
      {
        title: "Chapter 2.2 - 2B Ledger",
        src: "/pdf/appliedfinance/chapter2/2B Ledger.pdf",
        download: "2B Ledger.pdf",
      },
      {
        title: "Chapter 2.3 - 2C Trial Balance",
        src: "/pdf/appliedfinance/chapter2/2C Trial Balance.pdf",
        download: "2C Trial Balance.pdf",
      },
      {
        title: "Chapter 2.4 - 2D Subsidiary Books",
        src: "/pdf/appliedfinance/chapter2/2D Subsidiary Books.pdf",
        download: "2D Subsidiary Books.pdf",
      },
      {
        title: "Chapter 2.5 - 2E Cash Books",
        src: "/pdf/appliedfinance/chapter2/2E Cash Books.pdf",
        download: "2E Cash Books.pdf",
      },
      {
        title: "Chapter 2.6 - 2F Capital vs Revenue",
        src: "/pdf/appliedfinance/chapter2/2F Capital vs Revenue.pdf",
        download: "2F Capital vs Revenue.pdf",
      },
      {
        title: "Chapter 2.7 - 2G Contingent Asset and Liabilities",
        src: "/pdf/appliedfinance/chapter2/2G Contingent Asset and Liabilities.pdf",
        download: "2G Contingent Asset and Liabilities.pdf",
      },
    ],
    "Chapter-03": [
      {
        title: "Chapter 3 - Rectification of Errors",
        src: "/pdf/appliedfinance/chapter3/Rectification of Errors.pdf",
        download: "Rectification of Errors.pdf",
      },
    ],
    "Chapter-04": [
      {
        title: "Chapter 4 - Bank Reconciliation Statement",
        src: "/pdf/appliedfinance/chapter4/Bank Reconciliation Statement.pdf",
        download: "Bank Reconciliation Statement.pdf",
      },
    ],
    "Chapter-05": [
      {
        title: "Chapter 5.1 - Inventories Basics",
        src: "/pdf/appliedfinance/chapter5/Inventories- Basics.pdf",
        download: "Inventories- Basics.pdf",
      },
      {
        title: "Chapter 5.2 - Inventory Systems",
        src: "/pdf/appliedfinance/chapter5/Inventory Systems.pdf",
        download: "Inventory Systems.pdf",
      },
      {
        title: "Chapter 5.3 - Techniques & Formula for Inventory Variation",
        src: "/pdf/appliedfinance/chapter5/Techniques_ Formula for Inventory Variation.pdf",
        download: "Techniques_ Formula for Inventory Variation.pdf",
      },
    ],
    "Chapter-06": [
      {
        title: "Chapter 6.1 - Basic Terms of Depreciation",
        src: "/pdf/appliedfinance/chapter6/Basic Terms.pdf",
        download: "Basic Terms.pdf",
      },
      {
        title: "Chapter 6.2 - Methods of Depreciation",
        src: "/pdf/appliedfinance/chapter6/Methods of Depreciation.pdf",
        download: "Methods of Depreciation.pdf",
      },
      {
        title: "Chapter 6.3 - Related Matters",
        src: "/pdf/appliedfinance/chapter6/Related Matters.pdf",
        download: "Related Matters.pdf",
      },
    ],
    "Chapter-07": [
      {
        title: "Chapter 7.1 - Account Current",
        src: "/pdf/appliedfinance/chapter7/Account Current.pdf",
        download: "Account Current.pdf",
      },
      {
        title: "Chapter 7.2 - Average Due Date",
        src: "/pdf/appliedfinance/chapter7/Average Due Date.pdf",
        download: "Average Due Date.pdf",
      },
      {
        title: "Chapter 7.3 - Bills of Exchange",
        src: "/pdf/appliedfinance/chapter7/Bills of Exchange.pdf",
        download: "Bills of Exchange.pdf",
      },
      {
        title: "Chapter 7.4 - Consignment",
        src: "/pdf/appliedfinance/chapter7/Consignment.pdf",
        download: "Consignment.pdf",
      },
      {
        title: "Chapter 7.5 - Sales on Approval or Return Basis",
        src: "/pdf/appliedfinance/chapter7/Sales on Approval or Return Basis.pdf",
        download: "Sales on Approval or Return Basis.pdf",
      },
    ],
    "Chapter-08": [
      {
        title: "Chapter 8.1 - Adjustments",
        src: "/pdf/appliedfinance/chapter8/Adjustments.pdf",
        download: "Adjustments.pdf",
      },
      {
        title: "Chapter 8.2 - Balance Sheet",
        src: "/pdf/appliedfinance/chapter8/Balance Sheet.pdf",
        download: "Balance Sheet.pdf",
      },
      {
        title: "Chapter 8.3 - Financial Statement",
        src: "/pdf/appliedfinance/chapter8/Financial Statement.pdf",
        download: "Financial Statement.pdf",
      },
      {
        title: "Chapter 8.4 - Manufacturing Account",
        src: "/pdf/appliedfinance/chapter8/Manufacturing Account.pdf",
        download: "Manufacturing Account.pdf",
      },
      {
        title: "Chapter 8.5 - Profit and Loss Account",
        src: "/pdf/appliedfinance/chapter8/Profit and Loss Account.pdf",
        download: "Profit and Loss Account.pdf",
      },
      {
        title: "Chapter 8.5 - Trading Account",
        src: "/pdf/appliedfinance/chapter8/Trading Account.pdf",
        download: "Trading Account.pdf",
      },
    ],
    "Chapter-09": [
      {
        title: "Chapter 9.1 - Admission of New Partner",
        src: "/pdf/appliedfinance/chapter9/Admission of New Partner.pdf",
        download: "Admission of New Partner.pdf",
      },
      {
        title: "Chapter 9.2 - Goodwill",
        src: "/pdf/appliedfinance/chapter9/Goodwill.pdf",
        download: "Goodwill.pdf",
      },
      {
        title: "Chapter 9.3 - Partnership Basics",
        src: "/pdf/appliedfinance/chapter9/Partnership Basics.pdf",
        download: "Partnership Basics.pdf",
      },
      {
        title: "Chapter 9.3 - Retirement and Death",
        src: "/pdf/appliedfinance/chapter9/Retirement and Death.pdf",
        download: "Retirement and Death.pdf",
      },
    ],
    "Chapter-10": [
      {
        title: "Chapter 10 - Accounting For Not -For-Profit and Educational Organisations",
        src: "/pdf/appliedfinance/chapter10/Accounting For Not -For-Profit and Educational Organisations.pdf",
        download: "Accounting For Not -For-Profit and Educational Organisations.pdf",
      },
    ],
    "Chapter-11": [
      {
        title: "Chapter 11.1 - Company Basics",
        src: "/pdf/appliedfinance/chapter11/Company Basics.pdf",
        download: "Company Basics.pdf",
      },
      {
        title: "Chapter 11.2 - Financial Statement",
        src: "/pdf/appliedfinance/chapter11/Financial Statement.pdf",
        download: "Financial Statement.pdf",
      },
      {
        title: "Chapter 11.3 - Preferences Shares",
        src: "/pdf/appliedfinance/chapter11/Preferences Shares.pdf",
        download: "Preferences Shares.pdf",
      },
      {
        title: "Chapter 11.4 - Debentures",
        src: "/pdf/appliedfinance/chapter11/Debentures.pdf",
        download: "Debentures.pdf",
      },
      {
        title: "Chapter 11.5 - Shares- Issue, Forfeiture and Re- Issues",
        src: "/pdf/appliedfinance/chapter11/Shares- Issue, Forfeiture and Re- Issues.pdf",
        download: "Shares- Issue, Forfeiture and Re- Issues.pdf",
      },
    ],
    "Chapter-12": [
      {
        title: "Chapter 12.1 - Basic Accounting Standard",
        src: "/pdf/appliedfinance/chapter12/Basic Accounting Standard.pdf",
        download: "Basic Accounting Standard.pdf",
      },
      {
        title: "Chapter 12.2 - Framework for Financial Statements",
        src: "/pdf/appliedfinance/chapter12/Framework for Preparation and Presentation of Financial Statements.pdf",
        download: "Framework for Preparation and Presentation of Financial Statements.pdf",
      },
      {
        title: "Chapter 12.3 - Introduction to Accounting Standards",
        src: "/pdf/appliedfinance/chapter12/Introduction to Accounting Standards.pdf",
        download: "Introduction to Accounting Standards.pdf",
      },
      {
        title: "Chapter 12.4 - Overview of Accounting Standards",
        src: "/pdf/appliedfinance/chapter12/Overview of Accounting Standards.pdf",
        download: "Overview of Accounting Standards.pdf",
      },
      {
        title: "Chapter 12.5 - Application of Accounting Standards",
        src: "/pdf/appliedfinance/chapter12/Application of Accounting Standards.pdf",
        download: "Application of Accounting Standards.pdf",
      },
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                className="h-48 w-full object-cover md:w-48"
                src={appliedfinance}
                alt="Applied Finance"
                width={200}
                height={200}
              />
            </div>
            <div className="p-8">
              <div className="text-sm font-semibold text-gray-600">Course</div>
              <div className="block mt-1 text-2xl leading-tight font-bold text-gray-900">
                Applied Finance
              </div>
              <p className="mt-2 text-gray-600">
                Master the fundamentals of accounting, financial statements, and advanced financial concepts
                with our comprehensive Applied Finance course materials.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(conceptPDFs).map(([concept, pdfs]) => (
              <div key={concept} className="bg-white rounded-lg shadow-md p-6">
                <h3
                  className="text-xl font-semibold text-gray-800 mb-4 cursor-pointer hover:text-blue-600"
                  onClick={() =>
                    setSelectedConcept(selectedConcept === concept ? "" : concept)
                  }
                >
                  {concept}
                </h3>
                {selectedConcept === concept && (
                  <div className="space-y-3">
                    {pdfs.map((pdf, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <span className="text-gray-700 flex-grow mr-4">
                          {pdf.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePDFClick(pdf)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View PDF"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a
                            href={pdf.src}
                            download={pdf.download}
                            className="text-green-600 hover:text-green-800"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
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
      </div>

      {/* PDF Viewer Modal */}
      {showModal && selectedPDF && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-4xl rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPDF.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={selectedPDF.src}
                className="w-full h-[calc(100vh-200px)]"
                title={selectedPDF.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}