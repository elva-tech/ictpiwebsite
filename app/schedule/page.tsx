"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/lib/Supabase";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

interface Candidate {
  membership_id: number;
  name: string;
  place: string | null;
  state: string | null;
  can_id: string;
  batch_id: string | null;
  batch_name: string | null;
  exam_date: string | null;
  mepsc_assesment?: string;
  self_test_practice?: string;
  mock_exam?: string;
  final_ctpr_exam?: string;
  retest_link?: string | null;
  fellowship_link?: string | null;
  new_member_link?: string | null;
}

export default function MyExamSchedulePage() {
  const auth = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user?.email) {
      setError("Please log in to view your exam schedule.");
      setLoading(false);
      return;
    }

    async function fetchCandidateSchedule() {
      setLoading(true);
      setError(null);

      const userEmail = auth.user!.email!.toLowerCase().trim();
      console.log("🔍 Starting fetch for email:", userEmail);

      try {
        // ==================== STEP 1: Get membership_id from memberinformation ====================
        const { data: memberData, error: memberError } = await supabase
          .from("memberinformation")
          .select("membership_id")
          .eq("email", userEmail)          // ← Change column name if it's not "email"
          .maybeSingle();

        if (memberError) {
          console.error("❌ Error fetching from memberinformation:", memberError);
          setError("Failed to retrieve your membership record. Please contact support.");
          return;
        }

        if (!memberData?.membership_id) {
          console.warn("⚠️ No membership_id found for email:", userEmail);
          setError("No membership record found for your account.");
          return;
        }

        const membershipId = memberData.membership_id;
        console.log("✅ Membership ID found:", membershipId);

        // ==================== STEP 2: Fetch exam schedule using membership_id ====================
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("candidate_exam_schedule")
          .select(`
            membership_id,
            name,
            place,
            state,
            can_id,
            batch_id,
            batch_name,
            exam_date,
            mepsc_assesment,
            self_test_practice,
            mock_exam,
            final_ctpr_exam,
            retest_link,
            fellowship_link,
          `)
          .eq("membership_id", membershipId)
          .maybeSingle();

        if (scheduleError) {
          console.error("❌ Error fetching exam schedule:", scheduleError);
          setError("Failed to load your exam schedule. Please try again later.");
          return;
        }

        if (scheduleData) {
          console.log("🎉 Full candidate data loaded successfully:", scheduleData);
          setCandidate(scheduleData);
        } else {
          setError("Exam schedule not found for your membership ID.");
        }
      } catch (err: any) {
        console.error("🚨 Unexpected error:", err);
        setError("An unexpected error occurred. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateSchedule();
  }, [auth?.user?.email]);

  const isNewMemberPending = !!candidate?.new_member_link;

  return (
    <AuthenticatedLayout title="Exam Schedule" maxWidth="lg">
      <div className="max-w-5xl mx-auto space-y-8">
        {loading && (
          <div className="flex justify-center py-16">
            <p className="text-xl text-gray-600">Loading your exam schedule...</p>
          </div>
        )}

        {!loading && (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-white bg-blue-600 py-6 rounded-t-2xl shadow-lg text-center mb-10">
              EXAM SCHEDULE
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-red-700 text-center mb-12">
                <p className="text-2xl font-bold">Error</p>
                <p className="mt-4 text-lg">{error}</p>
              </div>
            )}

            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Examination</h2>
                  <p className="mt-1 text-blue-100 text-lg">
                    Consultant Chartered Tax Practitioner (CTPR)
                  </p>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Full Name
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">
                      {candidate.name}
                    </h1>
                  </div>

                  {/* IDs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-600">Membership ID</p>
                      <p className="text-2xl font-bold text-blue-800 mt-2">
                        {String(candidate.membership_id).padStart(5, "0")}
                      </p>
                    </div>

                    {!isNewMemberPending && (
                      <>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600">Candidate ID</p>
                          <p className="text-2xl font-bold text-blue-800 mt-2">
                            {candidate.can_id}
                          </p>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600">Batch</p>
                          <p className="text-2xl font-bold text-blue-800 mt-2">
                            {candidate.batch_name || candidate.batch_id || "—"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Exam Details */}
                  {!isNewMemberPending && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">MEPSC Exam Date</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {candidate.exam_date
                            ? new Date(candidate.exam_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "Not Scheduled"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <MapPin className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Place</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
                          {candidate.place || "—"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <BadgeCheck className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">State</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
                          {candidate.state || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Special Alerts with Action Buttons */}
                  {candidate.new_member_link && (
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-orange-800">Membership Registration Pending</p>
                      <p className="mt-2 text-gray-700">Please complete your membership registration to proceed.</p>
                      <a
                        href={candidate.new_member_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
                      >
                        Complete Registration Now
                      </a>
                    </div>
                  )}

                  {candidate.retest_link && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-red-800">MEPSC Retest Required</p>
                      <p className="mt-2 text-gray-700">You need to retake the MEPSC Assessment.</p>
                      <a
                        href={candidate.retest_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
                      >
                        Take Retest Now
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
                  Data updated as of January 06, 2026
                </div>
              </div>
            )}

            {!candidate && !error && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600">No exam schedule available yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}