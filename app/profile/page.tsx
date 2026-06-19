"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  ClipboardPenLine,
  History,
  User,
  MapPin,
  Building,
  BookOpen,
  FileCheck,
  Camera,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { AppLogo } from "@/components/AppLogo";
import { supabase } from "@/lib/Supabase";
import {
  type CandidateProfile,
  emptyCandidateProfile,
  loadMemberProfileByMembershipId,
  mapCandidateRow,
  membershipIdLookupValues,
} from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";

function displayValue(v: string | null | undefined): string {
  return v?.trim() ? v.trim() : "—";
}

function isUrl(value: string | null | undefined): boolean {
  const t = (value ?? "").trim();
  return /^https?:\/\//i.test(t);
}

export default function ProfilePage() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // User data from memberinformation
  const [fullName, setFullName] = useState<string>("User");
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Profile picture & upload states
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    date_of_birth: "",
    father_name: "",
    mother_name: "",
    it_pan: "",
    aadhar: "",
    voter: "",
    NCVET: "",
    gstp: "",
    ITP: "",
    SIDH: "",
    STP: "",
    CB: "",
  });
  const [saving, setSaving] = useState(false);

  const canEditDetails =
    profile &&
    !profile.date_of_birth &&
    !profile.father_name &&
    !profile.mother_name &&
    !profile.it_pan &&
    !profile.aadhar &&
    !profile.voter &&
    !profile.NCVET &&
    !profile.gstp &&
    !profile.ITP &&
    !profile.SIDH &&
    !profile.STP &&
    !profile.CB;

  useEffect(() => {
    if (!auth?.user?.email) {
      router.push("/");
      return;
    }

    const currentEmail = auth.user.email.toLowerCase().trim();
    setUserEmail(currentEmail);

    const loadUserAndProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        setProfileNotice(null);

        const { data: payload, error: loadError } =
          await loadMemberProfileByMembershipId(supabase, getStoredMembershipId());

        if (loadError || !payload?.member?.membership_id) {
          console.error("Profile load failed:", loadError ?? "no member row");
          setError(
            loadError ??
              "No membership record found. Please sign in again with your Member ID."
          );
          return;
        }

        const memberData = payload.member;
        const idCandidates = membershipIdLookupValues(memberData.membership_id);
        const mid = idCandidates[0] ?? null;
        if (mid === null) {
          setError("Your membership ID could not be read. Please contact support.");
          return;
        }

        setMembershipId(mid);

        const nameFromDb = memberData.name?.trim();
        const display =
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "User";

        setFullName(display);

        const candidateProfile = payload.candidate;

        if (candidateProfile) {
          setProfile({
            ...candidateProfile,
            name: candidateProfile.name || display,
            membership_id: mid,
          });
        } else {
          setProfile(emptyCandidateProfile(mid, display));
          setProfileNotice(
            "Your exam schedule record was not found or could not be loaded. You can add your details below, or contact ICTPI support if information is missing."
          );
        }

        // Profile picture — try numeric and zero-padded filenames
        const fileName = `${mid}.jpg`;
        const { data: urlData } = supabase.storage
          .from("profileimages")
          .getPublicUrl(fileName);

        if (urlData.publicUrl) {
          setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Load error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndProfile();
  }, [auth?.user?.email, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!membershipId) {
      alert("Membership ID not available.");
      return;
    }

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (jpg, png, webp)");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image size should be less than 4MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${membershipId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profileimages")
        .upload(fileName, file, { cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profileimages")
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        alert("Profile picture updated successfully!");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (auth?.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:flex-col md:w-60 md:h-screen md:bg-[#0062cc] md:text-white md:overflow-y-auto">
        <nav className="flex-1 mt-6 space-y-1 px-3">
          <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> Exam Information
          </Link>
          <Link href="/sessions" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <History className="w-5 h-5 mr-3" /> Previous Sessions
          </Link>
          <Link href="/vlogs" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
          </Link>
          <Link href="/modelpaper" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
          </Link>
          <Link href="/tests" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
          </Link>
          <Link href="/certificates" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <FileCheck className="w-5 h-5 mr-3" /> Certificates
          </Link>
          <Link href="/enquiry" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <MessageSquare className="w-5 h-5 mr-3" /> Enquiry / Issue
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center py-1"><LayoutDashboard className="w-5 h-5 mb-1" /> Dash</Link>
        <Link href="/results" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Exam Informations</Link>
        <Link href="/sessions" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center py-1"><History className="w-5 h-5 mb-1" /> Prev</Link>
        <Link href="/modelpaper" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
        <Link href="/tests" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
        <Link href="/certificates" className="flex flex-col items-center py-1"><FileCheck className="w-5 h-5 mb-1" /> Certs</Link>
        <Link href="/enquiry" className="flex flex-col items-center py-1"><MessageSquare className="w-5 h-5 mb-1" /> Enquiry</Link>
        <button onClick={handleSignOut} className="flex flex-col items-center py-1"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <AppLogo variant="header" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Profile</h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
            {canEditDetails && (
              <button
                onClick={() => {
                  setProfileForm({
                    date_of_birth: profile?.date_of_birth || "",
                    father_name: profile?.father_name || "",
                    mother_name: profile?.mother_name || "",
                    it_pan: profile?.it_pan || "",
                    aadhar: profile?.aadhar || "",
                    voter: profile?.voter || "",
                    NCVET: profile?.NCVET || "",
                    gstp: profile?.gstp || "",
                    ITP: profile?.ITP || "",
                    SIDH: profile?.SIDH || "",
                    STP: profile?.STP || "",
                    CB: profile?.CB || "",
                  });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium shadow-sm whitespace-nowrap"
              >
                <ClipboardPenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-sm whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Picture & Basic Info */}
            <div className="text-center">
              <div className="relative inline-block group mx-auto">
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center shadow-md mx-auto"
                >
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile picture"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <User className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
                  )}
                </div>

                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="flex flex-col items-center text-white text-xs">
                    <Camera className="w-8 h-8 mb-1" />
                    <span>Change</span>
                  </div>
                </label>

                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">
                {fullName}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                Membership ID: {membershipId ? String(membershipId).padStart(5, "0") : "—"}
              </p>
              {userEmail && (
                <p className="text-sm text-gray-500 mt-0.5">{userEmail}</p>
              )}

              {uploading && (
                <p className="mt-2 text-sm text-blue-600 animate-pulse">Uploading photo...</p>
              )}
            </div>

            {profileNotice && !error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {profileNotice}
              </div>
            )}

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 text-lg">
                {error}
              </div>
            ) : profile ? (
              <>
                {/* Personal Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Full Name</p><p className="font-medium text-lg">{displayValue(profile.name)}</p></div>
                    <div><p className="text-sm text-gray-600">Display Name</p><p className="font-medium text-lg">{displayValue(fullName)}</p></div>
                    <div><p className="text-sm text-gray-600">Date of Birth</p><p className="font-medium text-lg">{displayValue(profile.date_of_birth)}</p></div>
                    <div><p className="text-sm text-gray-600">Father&apos;s Name</p><p className="font-medium text-lg">{displayValue(profile.father_name)}</p></div>
                    <div><p className="text-sm text-gray-600">Mother&apos;s Name</p><p className="font-medium text-lg">{displayValue(profile.mother_name)}</p></div>
                    <div><p className="text-sm text-gray-600">IT PAN</p><p className="font-medium text-lg font-mono">{displayValue(profile.it_pan)}</p></div>
                    <div><p className="text-sm text-gray-600">Aadhaar Number</p><p className="font-medium text-lg font-mono">{displayValue(profile.aadhar)}</p></div>
                    <div><p className="text-sm text-gray-600">Voter ID</p><p className="font-medium text-lg font-mono">{displayValue(profile.voter)}</p></div>
                  </div>
                </section>

                {/* Address Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Address & Location
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2"><p className="text-sm text-gray-600">Full Address</p><p className="font-medium text-lg">{displayValue(profile.address)}</p></div>
                    <div><p className="text-sm text-gray-600">District</p><p className="font-medium text-lg">{displayValue(profile.district)}</p></div>
                    <div><p className="text-sm text-gray-600">State</p><p className="font-medium text-lg">{displayValue(profile.state)}</p></div>
                    <div><p className="text-sm text-gray-600">Place</p><p className="font-medium text-lg">{displayValue(profile.place)}</p></div>
                    <div><p className="text-sm text-gray-600">Pincode</p><p className="font-medium text-lg">{displayValue(profile.pincode)}</p></div>
                  </div>
                </section>

                {/* Batch & Qualification */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    Batch & Qualification Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Membership ID</p><p className="font-medium text-lg font-mono">{String(profile.membership_id).padStart(5, "0")}</p></div>
                    <div><p className="text-sm text-gray-600">Candidate ID</p><p className="font-medium text-lg font-mono">{displayValue(profile.can_id)}</p></div>
                    <div><p className="text-sm text-gray-600">Batch ID</p><p className="font-medium text-lg font-mono">{displayValue(profile.batch_id)}</p></div>
                    <div><p className="text-sm text-gray-600">Batch Name</p><p className="font-medium text-lg">{displayValue(profile.batch_name)}</p></div>
                    <div><p className="text-sm text-gray-600">Qualification Status</p><p className="font-medium text-lg font-semibold text-green-700">{displayValue(profile.qualification_status)}</p></div>
                    <div><p className="text-sm text-gray-600">Next Step</p><p className="font-medium text-lg">{displayValue(profile.next_step)}</p></div>
                    <div><p className="text-sm text-gray-600">Joined</p><p className="font-medium text-lg">{displayValue(profile.joined)}</p></div>
                    <div><p className="text-sm text-gray-600">Completed</p><p className="font-medium text-lg">{displayValue(profile.completed)}</p></div>
                  </div>
                </section>

                {/* Exam Status & Certificates */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-blue-600" />
                    Exam Status & Certificates
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: "mepsc_assesment" as const, label: "MEPSC Assessment" },
                      { key: "mock_exam" as const, label: "Mock Exam" },
                      { key: "final_ctpr_exam" as const, label: "Final CTPR Exam" },
                    ].map((item) => {
                      const status = profile[item.key];
                      const isPass = status && /pass|complete|completed/i.test(status);
                      const isFail = status && /fail/i.test(status);

                      return (
                        <div
                          key={item.key}
                          className="border rounded-xl p-6 hover:shadow-md transition-all bg-gray-50/60"
                        >
                          <h3 className="font-semibold mb-4 text-lg">{item.label}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status:</span>
                            {status ? (
                              <div className="flex items-center gap-2">
                                {isPass ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : isFail ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Calendar className="w-5 h-5 text-amber-600" />
                                )}
                                <span
                                  className={`font-medium ${
                                    isPass
                                      ? "text-green-700"
                                      : isFail
                                        ? "text-red-700"
                                        : "text-gray-800"
                                  }`}
                                >
                                  {status}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="border rounded-xl p-6 hover:shadow-md transition-all bg-gray-50/60 md:col-span-2">
                      <h3 className="font-semibold mb-4 text-lg">Self Test / Practice</h3>
                      {isUrl(profile.self_test_practice) ? (
                        <a
                          href={profile.self_test_practice!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          Open practice tests
                        </a>
                      ) : (
                        <p className="font-medium text-lg">
                          {displayValue(profile.self_test_practice)}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Certificates & enrollment (candidate_exam_schedule) */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Certificates & Enrollment
                  </h2>

                  {!canEditDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center text-green-800 text-sm">
                      Profile and certificate details have been submitted and cannot be changed.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Exam Date</p><p className="font-medium text-lg">{displayValue(profile.exam_date)}</p></div>
                    <div><p className="text-sm text-gray-600">NCVET Certificate No.</p><p className="font-medium text-lg">{displayValue(profile.NCVET)}</p></div>
                    <div><p className="text-sm text-gray-600">GSTP Enrollment No.</p><p className="font-medium text-lg">{displayValue(profile.gstp)}</p></div>
                    <div><p className="text-sm text-gray-600">ITP Enrollment No.</p><p className="font-medium text-lg">{displayValue(profile.ITP)}</p></div>
                    <div><p className="text-sm text-gray-600">SIDH Candidate ID</p><p className="font-medium text-lg">{displayValue(profile.SIDH)}</p></div>
                    <div><p className="text-sm text-gray-600">STP Enrollment No.</p><p className="font-medium text-lg">{displayValue(profile.STP)}</p></div>
                    <div><p className="text-sm text-gray-600">CB Licence No.</p><p className="font-medium text-lg">{displayValue(profile.CB)}</p></div>
                  </div>
                </section>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center text-yellow-800 text-lg">
                No candidate record found for your account.
              </div>
            )}
          </div>
        </main>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Update Profile Details</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircle className="w-7 h-7 text-gray-600" />
                </button>
              </div>

              <p className="text-xl text-red-600 mb-6 leading-relaxed">
                <strong>Important:</strong> These fields can be filled <strong><i>only once</i></strong>.<br />
                Please enter accurate information — especially IDs and certificate numbers.
              </p>

              <div className="space-y-6">
                {/* Personal Identity */}
                <div className="border-b pb-5">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Date of Birth <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Father's Name</label>
                      <input
                        type="text"
                        value={profileForm.father_name}
                        onChange={(e) => setProfileForm({ ...profileForm, father_name: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Mother's Name</label>
                      <input
                        type="text"
                        value={profileForm.mother_name}
                        onChange={(e) => setProfileForm({ ...profileForm, mother_name: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Government IDs */}
                <div className="border-b pb-5">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Government IDs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">IT PAN</label>
                      <input
                        type="text"
                        value={profileForm.it_pan}
                        onChange={(e) => setProfileForm({ ...profileForm, it_pan: e.target.value.trim().toUpperCase() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Aadhaar Number</label>
                      <input
                        type="text"
                        value={profileForm.aadhar}
                        onChange={(e) => setProfileForm({ ...profileForm, aadhar: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="XXXX XXXX XXXX"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Voter ID</label>
                      <input
                        type="text"
                        value={profileForm.voter}
                        onChange={(e) => setProfileForm({ ...profileForm, voter: e.target.value.trim().toUpperCase() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        placeholder="ABC1234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificates & Licenses */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Certificates & Licenses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "NCVET Certificate No.", key: "NCVET" as const },
                      { label: "GSTP Enrollment No.", key: "gstp" as const },
                      { label: "ITP Enrollment No.", key: "ITP" as const },
                      { label: "SIDH Candidate ID", key: "SIDH" as const },
                      { label: "STP Enrollment No.", key: "STP" as const },
                      { label: "CB Licence No.", key: "CB" as const },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
                        <input
                          type="text"
                          value={profileForm[key as keyof typeof profileForm] || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value.trim() })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter number"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (saving) return;
                    setSaving(true);

                    try {
                      if (!membershipId) throw new Error("No membership ID");

                      const updates = {
                        date_of_birth: profileForm.date_of_birth || null,
                        father_name: profileForm.father_name.trim() || null,
                        mother_name: profileForm.mother_name.trim() || null,
                        it_pan: profileForm.it_pan.trim().toUpperCase() || null,
                        aadhar: profileForm.aadhar.trim() || null,
                        voter: profileForm.voter.trim().toUpperCase() || null,
                        NCVET: profileForm.NCVET.trim() || null,
                        gstp: profileForm.gstp.trim() || null,
                        ITP: profileForm.ITP.trim() || null,
                        SIDH: profileForm.SIDH.trim() || null,
                        STP: profileForm.STP.trim() || null,
                        CB: profileForm.CB.trim() || null,
                      };

                      const saveName = (profile?.name || fullName || "Member").slice(
                        0,
                        180
                      );

                      const { data: updatedRows, error: updateErr } = await supabase
                        .from("candidate_exam_schedule")
                        .update(updates)
                        .eq("membership_id", membershipId)
                        .select("membership_id");

                      if (updateErr) throw updateErr;

                      if (!updatedRows?.length) {
                        const { error: insertErr } = await supabase
                          .from("candidate_exam_schedule")
                          .insert({
                            membership_id: membershipId,
                            name: saveName,
                            ...updates,
                          });
                        if (insertErr) throw insertErr;
                        setProfileNotice(null);
                      }

                      setProfile((prev) =>
                        prev
                          ? mapCandidateRow({
                              ...prev,
                              ...updates,
                              name: saveName,
                            })
                          : null
                      );
                      alert("Details saved successfully!");
                      setIsEditModalOpen(false);
                    } catch (err: any) {
                      console.error("Save failed:", err);
                      alert("Failed to save: " + (err.message || "Unknown error"));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-60 font-medium"
                >
                  {saving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
