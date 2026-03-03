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

import memberMapData from "@/public/member.json";

interface MemberMap {
  [membershipId: string]: string;
}

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
  next_step?: string;
  qualification_status?: string;
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

  const [memberMap] = useState<MemberMap>(memberMapData);

  // Fetch logged-in user's own exam schedule
  useEffect(() => {
    if (!auth?.user?.email || Object.keys(memberMap).length === 0) return;

    async function fetchMySchedule() {
      setLoading(true);
      setError(null);

      const userEmail = auth.user?.email?.toLowerCase().trim();

      // Find membership ID from email
      const membershipIdStr = Object.keys(memberMap).find(
        (id) => memberMap[id].toLowerCase().trim() === userEmail
      );

      if (!membershipIdStr) {
        setError("No membership record found for your account.");
        setLoading(false);
        return;
      }

      const membershipId = Number(membershipIdStr);

      try {
        const { data, error: supabaseError } = await supabase
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
            
            fellowship_link,
            new_member_link
          `)
          .eq("membership_id", membershipId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          setError("Failed to load your exam schedule. Please try again later.");
        } else if (data) {
          setCandidate(data);
        } else {
          setError("No exam schedule found for your membership ID.");
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchMySchedule();
  }, [auth?.user?.email, memberMap]);

  const isNewMemberPending = candidate?.new_member_link ? true : false;

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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-red-700 text-center mb-12">
                <p className="text-2xl font-bold">Error</p>
                <p className="mt-4 text-lg">{error}</p>
              </div>
            )}

            {/* Candidate Schedule Display */}
            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Examination </h2>
                  <p className="mt-1 text-blue-100 text-lg">Consultant Chartered Tax Practitioner (CTPR)</p>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Full Name</p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">{candidate.name}</h1>
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
                          <p className="text-2xl font-bold text-blue-800 mt-2">{candidate.can_id}</p>
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

                  {/* Special Cases */}
                  {candidate.new_member_link && (
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-orange-800">Membership Registration Pending</p>
                      <p className="mt-2 text-gray-700">Please complete your membership registration to proceed with exams.</p>
                    </div>
                  )}

                  {candidate.retest_link && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-red-800">MEPSC Retest Required</p>
                      <p className="mt-2 text-gray-700">You need to retake the MEPSC Assessment.</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
                  Data updated as of January 06, 2026
                </div>
              </div>
            )}

            {/* No Data */}
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