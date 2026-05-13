"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  Download,
} from "lucide-react";
import Image from "next/image";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getPortalAssetPath, usePortalMode } from "@/lib/portalTheme";
import { supabase } from "@/lib/Supabase";

/**
 * Logical certificate keys used in the UI. Each maps to:
 *  - the `certification_approval` column that gates eligibility ("1" = allowed)
 *  - the `*_generated` column that records whether the PDF was already issued.
 *
 * Column names match the user's schema exactly:
 *   skill_india        + skill_india_generated
 *   ncvet              + ncvet_generated
 *   ctpr_membership    + membership_cert_generated   (different suffix)
 *   practicing         + practicing_generated
 */
type CertKey = "skill_india" | "ncvet" | "ctpr_membership" | "practicing";

interface CertConfig {
  key: CertKey;
  approvalCol: CertKey;
  generatedCol:
    | "skill_india_generated"
    | "ncvet_generated"
    | "membership_cert_generated"
    | "practicing_generated";
  label: string;
  image: string;
  note: string;
  /** Whether we have a working PDF generator for this certificate today. */
  hasGenerator: boolean;
}

const CERTS: CertConfig[] = [
  {
    key: "skill_india",
    approvalCol: "skill_india",
    generatedCol: "skill_india_generated",
    label: "Skill India Marksheet",
    image: "/images/skill-india.svg",
    note: "Awaiting official issuance from Skill India.",
    hasGenerator: false,
  },
  {
    key: "ncvet",
    approvalCol: "ncvet",
    generatedCol: "ncvet_generated",
    label: "NCVET Qualification Certificate",
    image: "/images/nvcet.svg",
    note: "Awaiting official issuance from NCVET.",
    hasGenerator: false,
  },
  {
    key: "ctpr_membership",
    approvalCol: "ctpr_membership",
    generatedCol: "membership_cert_generated",
    label: "CTPr (ICTPI) Membership Certificate",
    image: "/images/ICTPL_image.jpg",
    note: "ICTPI membership certificate.",
    hasGenerator: false,
  },
  {
    key: "practicing",
    approvalCol: "practicing",
    generatedCol: "practicing_generated",
    label: "Practicing Member Certificate",
    image: "/images/ICTPL_image.jpg",
    note: "Issued to approved practicing members.",
    hasGenerator: true,
  },
];

interface ApprovalRow {
  membership_id: string | null;
  skill_india: string | null;
  ncvet: string | null;
  ctpr_membership: string | null;
  practicing: string | null;
  skill_india_generated: string | null;
  ncvet_generated: string | null;
  membership_cert_generated: string | null;
  practicing_generated: string | null;
}

const isApproved = (v: string | null | undefined) =>
  typeof v === "string" && v.trim() === "1";

/** Values drawn next to the template’s Certificate No. / NCVET / GSTP / … labels */
interface CandidateCertFields {
  NCVET: string | null;
  gstp: string | null;
  ITP: string | null;
  SIDH: string | null;
  STP: string | null;
  CB: string | null;
}

function parseCandidateCertRow(row: Record<string, unknown> | null): CandidateCertFields {
  if (!row) {
    return {
      NCVET: null,
      gstp: null,
      ITP: null,
      SIDH: null,
      STP: null,
      CB: null,
    };
  }
  const s = (k: string) => {
    const v = row[k];
    if (v === null || v === undefined) return null;
    const t = String(v).trim();
    return t.length ? t : null;
  };
  return {
    NCVET: s("NCVET") ?? s("ncvet"),
    gstp: s("gstp"),
    ITP: s("ITP") ?? s("itp"),
    SIDH: s("SIDH") ?? s("sidh"),
    STP: s("STP") ?? s("stp"),
    CB: s("CB") ?? s("cb"),
  };
}

export default function Certificates() {
  const auth = useAuth() as any;
  const { isPremium } = usePortalMode();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalRow | null>(null);
  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateCertFields, setCandidateCertFields] =
    useState<CandidateCertFields | null>(null);
  const [membershipIdNum, setMembershipIdNum] = useState<number | null>(null);
  const [busyKey, setBusyKey] = useState<CertKey | null>(null);
  const [toast, setToast] = useState<{
    kind: "success" | "info" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    if (!auth?.user?.email) return;
    const email = auth.user.email.toLowerCase().trim();

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1) Resolve membership_id from email
        const { data: member, error: memberErr } = await supabase
          .from("memberinformation")
          .select("membership_id, name")
          .eq("email", email)
          .maybeSingle();

        if (memberErr) throw memberErr;
        if (!member?.membership_id) {
          setErrorMsg("No membership record was found for your account.");
          return;
        }

        const midNum = Number(member.membership_id);
        setMembershipIdNum(midNum);

        // 2) Fetch candidate display name + certificate line items (quoted cols)
        const { data: candidate } = await supabase
          .from("candidate_exam_schedule")
          .select(
            `name, "NCVET", gstp, "ITP", "SIDH", "STP", "CB"`
          )
          .eq("membership_id", midNum)
          .maybeSingle();

        const resolvedName =
          candidate?.name?.trim() || member.name?.trim() || "";
        setCandidateName(resolvedName);
        setCandidateCertFields(
          parseCandidateCertRow(candidate as Record<string, unknown> | null)
        );

        // 3) Fetch the approval row.
        // certification_approval.membership_id is varchar(10), so query both
        // as string and zero-padded forms to be safe.
        const midStr = String(midNum);
        const midPadded = midStr.padStart(5, "0");

        const { data: approvalRows, error: approvalErr } = await supabase
          .from("certification_approval")
          .select(
            "membership_id, skill_india, ncvet, ctpr_membership, practicing, skill_india_generated, ncvet_generated, membership_cert_generated, practicing_generated"
          )
          .in("membership_id", [midStr, midPadded]);

        if (approvalErr) throw approvalErr;

        setApproval((approvalRows?.[0] as ApprovalRow) ?? null);
      } catch (err: any) {
        console.error("Failed to load certificate state:", err);
        setErrorMsg(
          "Failed to load certification status. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth?.user?.email]);

  const resolvedCerts = useMemo(
    () =>
      CERTS.map((c) => ({
        ...c,
        image: getPortalAssetPath(c.image, isPremium),
      })),
    [isPremium]
  );

  /**
   * Generates the Practicing Member Certificate PDF.
   * Loads the template from /cert/practicing-certificate.pdf, draws the
   * candidate's name onto the first page, marks the DB flag, and triggers a
   * browser download.
   */
  const generatePracticingCertificate = async () => {
    if (!candidateName) {
      setToast({
        kind: "error",
        text: "Your name is missing in the candidate record. Please update your profile first.",
      });
      return;
    }
    if (!membershipIdNum) {
      setToast({
        kind: "error",
        text: "Membership ID unavailable. Please re-login.",
      });
      return;
    }
    if (!approval) {
      setToast({
        kind: "error",
        text: "No approval record found for your account.",
      });
      return;
    }

    setBusyKey("practicing");
    try {
      // Lazy-load pdf-lib to keep the page bundle small.
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const res = await fetch("/cert/practicing-certificate.pdf");
      if (!res.ok)
        throw new Error("Certificate template could not be loaded.");
      const templateBytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.load(templateBytes);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const [firstPage] = pdfDoc.getPages();
      const { width, height } = firstPage.getSize();

      const ink = rgb(0.04, 0.12, 0.27);

      const drawIf = (
        text: string | null | undefined,
        x: number,
        y: number,
        size: number,
        font: typeof helvetica,
        maxWidth?: number
      ) => {
        const t = (text ?? "").trim();
        if (!t) return;
        let s = t;
        if (maxWidth && font.widthOfTextAtSize(s, size) > maxWidth) {
          while (s.length > 1 && font.widthOfTextAtSize(`${s}…`, size) > maxWidth) {
            s = s.slice(0, -1);
          }
          s = `${s}…`;
        }
        firstPage.drawText(s, { x, y, size, font, color: ink });
      };

      const cert = candidateCertFields ?? parseCandidateCertRow(null);
      // Certificate No. format: "<membership_id>/<year>" (e.g. 467/2025).
      // Membership ID is kept compact (no zero-padding) and the issue year is
      // the current calendar year on download.
      const certificateNo = `${membershipIdNum}/${new Date().getFullYear()}`;

      // Empty / unknown enrollment fields are rendered as "--" to match the
      // certificate's visual convention.
      const fallback = (v: string | null | undefined) => {
        const t = (v ?? "").trim();
        return t.length ? t : "--";
      };

      // ----- Field placement (PDF origin = bottom-left) -----
      // The PMC template prints labels in the LOWER half of the page; the name
      // sits on its own blank line above "A Fellow of the Institute / Having
      // Membership Number ...". Tune the constants below if pixels are off.

      // Candidate name — sits on the blank line under "This is to Certify
      // that," with a touch more headroom from the captions below.
      const NAME_FONT_SIZE = 18;
      const NAME_Y = height * 0.6;
      const nameWidth = helveticaBold.widthOfTextAtSize(
        candidateName,
        NAME_FONT_SIZE
      );
      firstPage.drawText(candidateName, {
        x: (width - nameWidth) / 2,
        y: NAME_Y,
        size: NAME_FONT_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // ----- Bottom block: Certificate No. + 6 enrollment fields -----
      // The printed labels sit roughly in the lower fifth of the page.
      // X positions are the right side of each label (where the colon ends).

      // "Certificate No.: <id>/<year>" — value drawn left-aligned right after
      // the colon, so it reads inline with the printed label.
      const CERT_NO_SIZE = 12;
      firstPage.drawText(certificateNo, {
        x: width * 0.5,
        y: height * 0.182,
        size: CERT_NO_SIZE,
        font: helveticaBold,
        color: ink,
      });

      // Two-column enrollment grid — bold, sitting on the same baseline as
      // each printed label. Empty values render as "--".
      const DETAIL_SIZE = 9;
      const rowGap = height * 0.020;
      const detailBaselineNudge = -3.2;
      const row1Y = height * 0.168 + detailBaselineNudge;
      const leftValX = width * 0.295;
      const rightValX = width * 0.74;
      const leftMaxW = width * 0.22;
      const rightMaxW = width * 0.22;

      drawIf(fallback(cert.NCVET), leftValX, row1Y, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.SIDH), rightValX, row1Y, DETAIL_SIZE, helveticaBold, rightMaxW);

      drawIf(fallback(cert.gstp), leftValX, row1Y - rowGap, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.STP), rightValX, row1Y - rowGap, DETAIL_SIZE, helveticaBold, rightMaxW);

      drawIf(fallback(cert.ITP), leftValX, row1Y - 2 * rowGap, DETAIL_SIZE, helveticaBold, leftMaxW);
      drawIf(fallback(cert.CB), rightValX, row1Y - 2 * rowGap, DETAIL_SIZE, helveticaBold, rightMaxW);

      const pdfBytes = await pdfDoc.save();

      // 1) Mark the DB row BEFORE handing the file to the user so we don't
      // give them the certificate twice if something fails later.
      const targetMembershipId = approval.membership_id ?? String(membershipIdNum);

      const { error: updateErr } = await supabase
        .from("certification_approval")
        .update({ practicing_generated: "1" })
        .eq("membership_id", targetMembershipId);

      if (updateErr) {
        // If the write fails, do NOT issue the certificate.
        throw updateErr;
      }

      // 2) Trigger browser download.
      // pdf-lib returns a Uint8Array. Wrap the underlying buffer in a fresh
      // ArrayBuffer copy so it satisfies the BlobPart type cleanly.
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Practicing-Certificate-${String(membershipIdNum).padStart(
        5,
        "0"
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      // 3) Reflect new state locally.
      setApproval((prev) =>
        prev ? { ...prev, practicing_generated: "1" } : prev
      );

      setToast({
        kind: "success",
        text: "Certificate downloaded successfully.",
      });
    } catch (err: any) {
      console.error("Practicing certificate generation failed:", err);
      setToast({
        kind: "error",
        text:
          "Failed to generate certificate: " +
          (err?.message || "Unknown error"),
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (!auth?.user && !auth?.loading) return null;

  const renderCard = (cert: (typeof resolvedCerts)[number]) => {
    const approvedVal = approval?.[cert.approvalCol] ?? null;
    const generatedVal = approval?.[cert.generatedCol] ?? null;
    const approved = isApproved(approvedVal);
    const alreadyGenerated = isApproved(generatedVal);

    let buttonContent: React.ReactNode;
    let buttonClass =
      "mt-auto font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors";
    let buttonAction: (() => void) | undefined = undefined;
    let disabled = false;
    let statusLabel = "";
    let statusColor = "";

    if (!approval) {
      statusLabel = "No approval record";
      statusColor = "text-gray-500";
      buttonContent = (
        <>
          <Lock className="w-5 h-5" /> Not Available
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else if (!approved) {
      statusLabel = "Not Eligible";
      statusColor = "text-gray-500";
      buttonContent = (
        <>
          <Lock className="w-5 h-5" /> Not Eligible
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else if (alreadyGenerated) {
      statusLabel = "Already Generated";
      statusColor = "text-emerald-700";
      buttonContent = (
        <>
          <CheckCircle2 className="w-5 h-5" /> Already Generated
        </>
      );
      buttonClass += " bg-emerald-100 text-emerald-800 cursor-not-allowed";
      disabled = true;
    } else if (!cert.hasGenerator) {
      statusLabel = "Approved – Coming Soon";
      statusColor = "text-amber-700";
      buttonContent = (
        <>
          <FileText className="w-5 h-5" /> Coming Soon
        </>
      );
      buttonClass += " bg-gray-400 text-white cursor-not-allowed";
      disabled = true;
    } else {
      statusLabel = "Approved – Ready to Generate";
      statusColor = "text-blue-700";
      const isBusy = busyKey === cert.key;
      buttonContent = isBusy ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> Generating…
        </>
      ) : (
        <>
          <Download className="w-5 h-5" /> Generate Certificate
        </>
      );
      buttonClass += isBusy
        ? " bg-blue-500 text-white cursor-wait"
        : " bg-blue-600 hover:bg-blue-700 text-white";
      buttonAction =
        cert.key === "practicing" ? generatePracticingCertificate : undefined;
      disabled = isBusy;
    }

    const handleClick = () => {
      if (disabled) {
        if (alreadyGenerated) {
          setToast({
            kind: "info",
            text: `${cert.label} has already been generated for your account.`,
          });
        }
        return;
      }
      buttonAction?.();
    };

    return (
      <div
        key={cert.key}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
      >
        <div className="h-48 bg-gradient-to-br from-white to-white flex items-center justify-center p-8">
          <Image
            src={cert.image}
            alt={`${cert.label} preview`}
            width={140}
            height={140}
            className="object-contain drop-shadow-md opacity-90"
          />
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
            {cert.label}
          </h3>

          <p className="text-center text-sm mb-4">
            Status: <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
          </p>

          <p className="text-center text-sm text-gray-500 mb-6 flex-1">
            {cert.note}
          </p>

          <button
            type="button"
            onClick={handleClick}
            disabled={disabled && !alreadyGenerated}
            className={buttonClass}
          >
            {buttonContent}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout title="Certificates" maxWidth="full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Certificates &amp; Marksheets
        </h1>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-600 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your certification status…
          </div>
        ) : errorMsg ? (
          <div className="flex items-start gap-3 text-red-800 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-start gap-3 text-blue-900 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  Only certificates approved by ICTPI can be generated.
                </p>
                <p className="text-sm mt-1">
                  Each certificate can be generated only once. Please contact
                  support if you need a reissue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {resolvedCerts.map((cert) => renderCard(cert))}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
          <div
            className={`rounded-xl shadow-lg px-5 py-4 text-sm font-medium border ${
              toast.kind === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : toast.kind === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
