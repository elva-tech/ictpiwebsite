"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppLogo } from "@/components/AppLogo";
import { INDIAN_STATES, districtsForState } from "@/lib/indiaRegionOptions";
import { formatMembershipIdDisplay } from "@/lib/membershipId";
import { Loader2 } from "lucide-react";

const NAVY = "#0a1f44";

const MEMBER_CATEGORIES = [
  { value: "", label: "-- Select Member Category --" },
  { value: "RPL (Recognition of Prior Learning )", label: "RPL (Recognition of Prior Learning )" },
  { value: "PSC (Professional Skills Certification)", label: "PSC (Professional Skills Certification)" },
];

const ENROLLMENT_FIELDS = [
  {
    key: "itp_enrollment_number" as const,
    label: "INCOME TAX PRACTITIONER (ITP) Enrollment No.",
    required: true,
  },
  {
    key: "gstp_enrollment_number" as const,
    label: "Goods and Services Tax Practitioner (GSTP) Enrollment No.",
    required: true,
  },
  {
    key: "itp_gstp_combined_enrollment" as const,
    label:
      "INCOME TAX PRACTITIONER (ITP) Enrollment No. / Goods and Services Tax Practitioner (GSTP) Enrollment",
    required: false,
  },
  {
    key: "stp_vat_enrollment_number" as const,
    label: "STP/VAT",
    required: false,
  },
  {
    key: "cb_license_number" as const,
    label: "CB License No.",
    required: false,
  },
] as const;

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/40 focus:border-[#0a1f44]";
const labelClass = "block text-sm font-bold mb-1.5";

type FormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_number: string;
  email: string;
  date_of_birth: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  member_category: string;
  membership_number: string;
  itp_enrollment_number: string;
  gstp_enrollment_number: string;
  itp_gstp_combined_enrollment: string;
  stp_vat_enrollment_number: string;
  cb_license_number: string;
  terms_accepted: boolean;
};

const initialForm: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  mobile_number: "",
  email: "",
  date_of_birth: "",
  password: "",
  confirmPassword: "",
  country: "India",
  state: "",
  district: "",
  city: "",
  pincode: "",
  address_line1: "",
  address_line2: "",
  address_line3: "",
  member_category: "",
  membership_number: "",
  itp_enrollment_number: "",
  gstp_enrollment_number: "",
  itp_gstp_combined_enrollment: "",
  stp_vat_enrollment_number: "",
  cb_license_number: "",
  terms_accepted: false,
};

const STEPS = [
  { n: 1, title: "Personal Details" },
  { n: 2, title: "Address Details" },
  { n: 3, title: "Membership Details" },
  { n: 4, title: "Enrollment Details" },
] as const;

export default function NewMemberRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [checkingMembershipId, setCheckingMembershipId] = useState(false);
  const [membershipIdSuggestions, setMembershipIdSuggestions] = useState<string[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  const districtOptions = useMemo(
    () => (form.state ? districtsForState(form.state) : []),
    [form.state]
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateStep1 = (): string | null => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (!form.mobile_number.trim()) return "Mobile number is required.";
    if (form.mobile_number.replace(/\D/g, "").length < 10)
      return "Enter a valid mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!form.state) return "Please select a state.";
    if (!form.district) return "Please select a district.";
    if (!form.city.trim()) return "City is required.";
    if (!form.pincode.trim()) return "Pincode is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must be 6 digits.";
    if (!form.address_line1.trim()) return "Address Line 1 is required.";
    return null;
  };

  const validateStep3 = (): string | null => {
    if (!form.member_category) return "Please select a member category.";
    if (!form.membership_number.trim()) return "Membership ID is required.";
    if (!/^\d+$/.test(form.membership_number.trim().replace(/\s/g, ""))) {
      return "Membership ID must contain digits only.";
    }
    return null;
  };

  const validateStep4 = (): string | null => {
    const itp = form.itp_enrollment_number.trim();
    const gstp = form.gstp_enrollment_number.trim();
    if (!itp) {
      return "INCOME TAX PRACTITIONER (ITP) Enrollment No. is required.";
    }
    if (!gstp) {
      return "Goods and Services Tax Practitioner (GSTP) Enrollment No. is required.";
    }
    if (!form.terms_accepted) return "You must agree to the terms and privacy policy.";
    return null;
  };

  const checkMembershipId = async (): Promise<boolean> => {
    const v = validateStep3();
    if (v) {
      setError(v);
      return false;
    }
    setCheckingMembershipId(true);
    setMembershipIdSuggestions([]);
    setError(null);
    try {
      const res = await fetch(
        `/api/check-membership-id?id=${encodeURIComponent(form.membership_number.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not verify Membership ID. Please try again.");
        return false;
      }
      if (!data.available) {
        const suggestions = (data.suggestions as string[] | undefined) ?? [];
        setMembershipIdSuggestions(suggestions);
        const hint =
          suggestions.length > 0
            ? ` Try one of these available IDs: ${suggestions.map((id) => formatMembershipIdDisplay(id)).join(", ")}.`
            : "";
        setError(
          `Membership ID ${formatMembershipIdDisplay(form.membership_number)} is already registered.${hint}`
        );
        return false;
      }
      if (data.normalizedId) {
        set("membership_number", data.normalizedId);
      }
      return true;
    } catch {
      setError("Network error while checking Membership ID. Please try again.");
      return false;
    } finally {
      setCheckingMembershipId(false);
    }
  };

  const goNext = async () => {
    setError(null);
    const v =
      step === 1
        ? validateStep1()
        : step === 2
          ? validateStep2()
          : step === 3
            ? validateStep3()
            : null;
    if (v) {
      setError(v);
      return;
    }
    if (step === 3) {
      const ok = await checkMembershipId();
      if (!ok) return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleRegister = async () => {
    setError(null);
    const v = validateStep4();
    if (v) {
      setError(v);
      return;
    }
    const v1 = validateStep1();
    const v2 = validateStep2();
    const v3 = validateStep3();
    if (v1 || v2 || v3) {
      setError(v1 || v2 || v3);
      return;
    }

    const idOk = await checkMembershipId();
    if (!idOk) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/new-member-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim() || null,
          last_name: form.last_name.trim(),
          mobile_number: form.mobile_number.trim(),
          email: form.email.trim().toLowerCase(),
          date_of_birth: form.date_of_birth || null,
          password: form.password,
          country: form.country.trim() || "India",
          state: form.state || null,
          district: form.district || null,
          city: form.city.trim() || null,
          pincode: form.pincode.trim() || null,
          address_line1: form.address_line1.trim() || null,
          address_line2: form.address_line2.trim() || null,
          address_line3: form.address_line3.trim() || null,
          member_category: form.member_category || null,
          membership_number: form.membership_number.trim() || null,
          itp_enrollment_number: form.itp_enrollment_number.trim() || null,
          gstp_enrollment_number: form.gstp_enrollment_number.trim() || null,
          itp_gstp_combined_enrollment:
            form.itp_gstp_combined_enrollment.trim() || null,
          stp_vat_enrollment_number: form.stp_vat_enrollment_number.trim() || null,
          cb_license_number: form.cb_license_number.trim() || null,
          terms_accepted: form.terms_accepted,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const suggestions = (data.suggestions as string[] | undefined) ?? [];
        if (suggestions.length > 0) setMembershipIdSuggestions(suggestions);
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
              Member Registration
            </h1>
          </div>
          <Link href="/login" className="text-sm font-semibold text-blue-700 hover:underline">
            Already a member? Sign in
          </Link>
        </div>

        {/* Stepper */}
        <div className="mb-10 grid grid-cols-2 gap-4 border-b border-slate-200 pb-6 md:grid-cols-4">
          {STEPS.map((s) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="text-center">
                <div
                  className={`mb-2 h-1 rounded-full ${
                    active || done ? "bg-[#0a1f44]" : "bg-slate-200"
                  }`}
                />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Step {s.n} of 4
                </p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    active ? "text-[#0a1f44]" : done ? "text-[#0a1f44]/80" : "text-slate-400"
                  }`}
                >
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                First Name
              </label>
              <input
                className={inputClass}
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Middle Name
              </label>
              <input
                className={inputClass}
                placeholder="Middle Name"
                value={form.middle_name}
                onChange={(e) => set("middle_name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                last name
              </label>
              <input
                className={inputClass}
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Mobile Number
              </label>
              <input
                className={inputClass}
                placeholder="Mobile Number"
                inputMode="tel"
                value={form.mobile_number}
                onChange={(e) => set("mobile_number", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Email
              </label>
              <input
                className={inputClass}
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Date Of Birth
              </label>
              <input
                className={inputClass}
                type="date"
                value={form.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={{ color: NAVY }}>
                Password
              </label>
              <input
                className={inputClass}
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Confirm Password
              </label>
              <input
                className={inputClass}
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Country
              </label>
              <select
                className={inputClass}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              >
                <option value="India">India</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                State
              </label>
              <select
                className={inputClass}
                value={form.state}
                onChange={(e) => {
                  set("state", e.target.value);
                  set("district", "");
                }}
              >
                <option value="">-- Select State --</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                District
              </label>
              <select
                className={inputClass}
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                disabled={!form.state}
              >
                <option value="">-- Select District --</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                City
              </label>
              <input
                className={inputClass}
                placeholder="City"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                PinCode
              </label>
              <input
                className={inputClass}
                placeholder="PinCode"
                inputMode="numeric"
                maxLength={10}
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div />
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Address Line 1
              </label>
              <input
                className={inputClass}
                placeholder="Address Line"
                value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Address Line 2
              </label>
              <input
                className={inputClass}
                placeholder="Address Line 2"
                value={form.address_line2}
                onChange={(e) => set("address_line2", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Address Line 3
              </label>
              <input
                className={inputClass}
                placeholder="Address Line 3"
                value={form.address_line3}
                onChange={(e) => set("address_line3", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Member Category
              </label>
              <select
                className={inputClass}
                value={form.member_category}
                onChange={(e) => set("member_category", e.target.value)}
              >
                {MEMBER_CATEGORIES.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: NAVY }}>
                Membership ID
              </label>
              <input
                className={inputClass}
                placeholder="e.g. 100105"
                inputMode="numeric"
                value={form.membership_number}
                onChange={(e) => {
                  setMembershipIdSuggestions([]);
                  set("membership_number", e.target.value.replace(/\D/g, ""));
                }}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Your requested ICTPI Membership ID. It must not already be registered.
              </p>
              {membershipIdSuggestions.length > 0 && (
                <p className="mt-2 text-xs font-medium text-amber-800">
                  Available IDs:{" "}
                  {membershipIdSuggestions
                    .map((id) => formatMembershipIdDisplay(id))
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4 — enrollment numbers (as on practicing certificate) */}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Enter your practitioner enrollment numbers.{" "}
              <span className="font-semibold text-slate-800">
                ITP and GSTP enrollment numbers are required.
              </span>
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {ENROLLMENT_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={field.key === "itp_gstp_combined_enrollment" ? "md:col-span-2" : ""}
                >
                  <label className={labelClass} style={{ color: NAVY }}>
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Enrollment / license number"
                    value={form[field.key]}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#0a1f44] focus:ring-[#0a1f44]"
                checked={form.terms_accepted}
                onChange={(e) => set("terms_accepted", e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-800">
                I Agree the terms &amp; privacy policy
              </span>
            </label>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="rounded-lg bg-[#0a1f44] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#061534] disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={checkingMembershipId || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0a1f44] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#061534] disabled:opacity-50"
              >
                {checkingMembershipId && <Loader2 className="h-4 w-4 animate-spin" />}
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0a1f44] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#061534] disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Register
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center border-t border-slate-100 pt-6">
          <AppLogo variant="card" alt="ICTPI" />
        </div>
      </div>
    </div>
  );
}
