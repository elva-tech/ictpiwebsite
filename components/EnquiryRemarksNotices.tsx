"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";
import {
  fetchPendingRemarksEnquiryNotices,
  markRemarksEnquirySeen,
  type RemarksEnquiryNotice,
} from "@/lib/enquiry";

type Props = {
  /** When set, skips loading membership from the session. */
  membershipId?: string | number | null;
  className?: string;
};

export function EnquiryRemarksNotices({
  membershipId: membershipIdProp,
  className,
}: Props) {
  const auth = useAuth() as { user?: { email?: string }; loading?: boolean };
  const [effectiveMid, setEffectiveMid] = useState<string | number | null>(
    membershipIdProp ?? null
  );
  const [notice, setNotice] = useState<RemarksEnquiryNotice | null>(null);
  const noticeRef = useRef<RemarksEnquiryNotice | null>(null);
  noticeRef.current = notice;

  useEffect(() => {
    if (membershipIdProp != null) {
      setEffectiveMid(membershipIdProp);
      return;
    }
    if (!auth?.user) return;

    let cancelled = false;
    (async () => {
      try {
        const { data: payload } = await loadMemberProfileByMembershipId(
          supabase,
          getStoredMembershipId()
        );
        const raw = payload?.member?.membership_id;
        if (!cancelled && raw != null && String(raw).trim() !== "") {
          setEffectiveMid(raw);
        }
      } catch (e) {
        console.error("EnquiryRemarksNotices membership load:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth?.user, membershipIdProp]);

  const loadNotice = useCallback(async () => {
    if (effectiveMid == null || String(effectiveMid).trim() === "") {
      setNotice(null);
      return;
    }
    const list = await fetchPendingRemarksEnquiryNotices(effectiveMid);
    setNotice(list[0] ?? null);
  }, [effectiveMid]);

  useEffect(() => {
    loadNotice();
  }, [loadNotice]);

  useEffect(() => {
    return () => {
      const current = noticeRef.current;
      if (current) markRemarksEnquirySeen(current.key);
    };
  }, []);

  const acknowledge = () => {
    if (!notice) return;
    markRemarksEnquirySeen(notice.key);
    setNotice(null);
  };

  if (!notice) return null;

  return (
    <div className={className ?? ""}>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-blue-900 shadow-sm"
        role="status"
      >
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <MessageSquare className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="min-w-0 text-xs sm:text-sm leading-snug">
            <p className="font-medium text-blue-900">Reply to your enquiry</p>
            <p className="mt-0.5 text-blue-800">
              <span className="text-blue-700">Query:</span> {notice.query?.trim()}
            </p>
            <p className="mt-0.5 text-blue-900">
              <span className="text-blue-700">Remarks:</span> {notice.remarks}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={acknowledge}
          className="shrink-0 self-end sm:self-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
