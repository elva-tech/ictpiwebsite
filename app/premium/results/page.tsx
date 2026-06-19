"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/Supabase";
import { loadMemberProfileByMembershipId } from "@/lib/candidateExamSchedule";
import type { CandidateProfile } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId, getStoredMemberEmail } from "@/lib/memberSession";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { ExamResultsView } from "@/components/ExamResultsView";
import { fetchResultsByEmail } from "@/lib/examResults";

const ResultPage = () => {
  const auth = useAuth();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [fullName, setFullName] = useState<string>("User");
  const [resultStatus, setResultStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user?.email) return;

    const currentEmail = (
      getStoredMemberEmail() || auth.user.email
    )
      .toLowerCase()
      .trim();

    const fetchUserAndResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: payload, error: memberError } =
          await loadMemberProfileByMembershipId(
            supabase,
            getStoredMembershipId()
          );

        const member = payload?.member;
        if (memberError && !member) {
          console.error("Member load failed:", memberError);
          setError(memberError || "Failed to load user record.");
          return;
        }

        if (!member?.membership_id) {
          setError("No membership record found for your account.");
          return;
        }

        const nameFromDb = member.name?.trim();
        setFullName(
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "User"
        );

        const profile = payload?.candidate;
        if (!profile) {
          setError(
            "No exam schedule found for your Membership ID. Please contact support if this is unexpected."
          );
          return;
        }

        setCandidate(profile);

        const { row: resultsRow, error: resultsError } =
          await fetchResultsByEmail(supabase, currentEmail);

        if (resultsError) {
          console.warn("results table fetch:", resultsError);
        } else if (resultsRow?.status) {
          setResultStatus(resultsRow.status);
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndResults();
  }, [auth?.user?.email]);

  if (auth?.loading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading your results...</p>
      </div>
    );
  }

  if (!auth?.user) return null;

  return (
    <AuthenticatedLayout title="Results" maxWidth="lg">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-red-700 text-center mb-12">
            <p className="text-2xl font-bold">Error</p>
            <p className="mt-4 text-lg">{error}</p>
          </div>
        )}

        {candidate && (
          <ExamResultsView
            candidate={candidate}
            fullName={fullName}
            practiceTestsHref="/premium/tests"
            resultStatus={resultStatus}
            title="RESULTS"
          />
        )}

        {!candidate && !error && !loading && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">No results available yet.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default ResultPage;
