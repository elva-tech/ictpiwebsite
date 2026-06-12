"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  Eye,
  Download,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PdfItem {
  title: string;
  src: string | null;        // null = not uploaded yet
  download?: string;         // optional filename for download
}

// ── Materials Data ────────────────────────────────────────────────────────────
const ictpiMaterials: PdfItem[] = [
  {
    title: "Applied Financial Accounting and Ethics",
    src: "/pdf/Applied Financial Accounting and Ethics.pdf",
    download: "Applied Financial Accounting and Ethics.pdf",
  },
  {
    title: "Business Regulatory Laws and Compliances",
    src: "/pdf/Business Regulatory Laws and compliances.pdf",
    download: "Business Regulatory Laws and Compliances.pdf",
  },
  {
    title: "Direct Tax Law Compliances",
    src: "/pdf/Direct Tax Law Compliances.pdf",
    download: "Direct Tax Law Compliances.pdf",
  },
  {
    title: "Indirect Tax Law Compliances",
    src: "/pdf/Indirect Tax Law Compliances.pdf",
    download: "Indirect Tax Law Compliances.pdf",
  },
];

const sreedharaMaterials: PdfItem[] = [
  // Add your items here when ready
];

const subramanianMaterials: PdfItem[] = [
  // Add your items here when ready
];

const baskaranMaterials: PdfItem[] = [
  // Add your items here when ready
];

export default function StudyMaterialsPage() {
  const auth = useAuth() as any;
  const { isPremium } = usePortalMode();

  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fullName, setFullName] = useState<string>("Student");

  // Accordion states
  const [expandedICTPI, setExpandedICTPI] = useState(true);
  const [expandedSreedhara, setExpandedSreedhara] = useState(true);
  const [expandedSubramanian, setExpandedSubramanian] = useState(false);
  const [expandedBaskaran, setExpandedBaskaran] = useState(false);

  // ── Fetch user name from Supabase ───────────────────────────────────────────
  useEffect(() => {
    if (!auth?.user?.email) return;

    const currentEmail = auth.user.email.toLowerCase().trim();

    const fetchUserName = async () => {
      setLoadingUser(true);
      try {
        const { data: payload } = await loadMemberProfileByMembershipId(
          supabase,
          getStoredMembershipId()
        );

        const nameFromDb = payload?.member?.name?.trim();
        setFullName(
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "Student"
        );
      } catch (err) {
        console.error("User fetch failed:", err);
        setFullName(currentEmail.split("@")[0] || "Student");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserName();
  }, [auth?.user?.email]);

  if (!auth?.user && !auth?.loading) return null;

  const selectedTitle =
    [...ictpiMaterials, ...sreedharaMaterials, ...subramanianMaterials, ...baskaranMaterials]
      .find((item) => getPortalAssetPath(item.src ?? "", isPremium) === selectedPdf)?.title ?? "Document";

  // ── Reusable Material Card ─────────────────────────────────────────────────
  const MaterialCard = ({ item }: { item: PdfItem }) => {
    const isAvailable = item.src !== null;

    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 transition-all border ${
          isAvailable
            ? "hover:shadow-md border-gray-200"
            : "opacity-75 border-gray-300 bg-gray-50"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-tight pr-8">
          {item.title}
        </h3>

        {isAvailable ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setSelectedPdf(getPortalAssetPath(item.src!, isPremium))}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Eye className="w-5 h-5" />
              View
            </button>
            <a
              href={getPortalAssetPath(item.src!, isPremium)}
              download={item.download}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-center"
            >
              <Download className="w-5 h-5" />
              Download
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Upload className="w-6 h-6 mr-2" />
            <span className="font-medium">To be uploaded soon</span>
          </div>
        )}
      </div>
    );
  };

  // ── Reusable Accordion Section ─────────────────────────────────────────────
  const AccordionSection = ({
    title,
    materials,
    expanded,
    setExpanded,
  }: {
    title: string;
    materials: PdfItem[];
    expanded: boolean;
    setExpanded: (v: boolean) => void;
  }) => (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:brightness-105 transition"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {expanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      {expanded && (
        <div className="p-6 space-y-6 bg-gray-50">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {materials.map((material, idx) => (
              <MaterialCard key={idx} item={material} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AuthenticatedLayout title="Vlogs & Materials" maxWidth="lg">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Faculty Study Materials</h1>

            <AccordionSection
              title="ICTPI Core Materials"
              materials={ictpiMaterials}
              expanded={expandedICTPI}
              setExpanded={setExpandedICTPI}
            />

            <AccordionSection
              title="CTPr Sreedhara Parthasarathy"
              materials={sreedharaMaterials}
              expanded={expandedSreedhara}
              setExpanded={setExpandedSreedhara}
            />

            <AccordionSection
              title="BR.N. Subramanian"
              materials={subramanianMaterials}
              expanded={expandedSubramanian}
              setExpanded={setExpandedSubramanian}
            />

            <AccordionSection
              title="CTPr Kalyanasundaram Baskaran"
              materials={baskaranMaterials}
              expanded={expandedBaskaran}
              setExpanded={setExpandedBaskaran}
            />
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold truncate flex-1">{selectedTitle}</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <a
                href={selectedPdf}
                download
                className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
              <button
                onClick={() => setSelectedPdf(null)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
          </div>
          <iframe src={selectedPdf} className="flex-1 w-full bg-white" title="PDF Viewer" allowFullScreen />
        </div>
      )}
    </AuthenticatedLayout>
  );
}