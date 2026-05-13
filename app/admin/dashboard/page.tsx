"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import {
  User,
  FileText,
  BadgeCheck,
  UserX2,
  Award,
  GraduationCap,
  Stamp,
  ShieldCheck,
} from "lucide-react";

interface Stats {
  todayUser: number | null;
  todayUdin: number | null;
  todayVerifiedUdin: number | null;
  todayRevokedUdin: number | null;
  totalUser: number | null;
  totalUdin: number | null;
  totalVerifiedUdin: number | null;
  totalRevokedUdin: number | null;
  // Certificate generation counts (rows in certification_approval with the
  // corresponding *_generated column equal to '1').
  certSkillIndia: number | null;
  certNcvet: number | null;
  certMembership: number | null;
  certPracticing: number | null;
  certTotalGenerated: number | null;
}

const emptyStats: Stats = {
  todayUser: null,
  todayUdin: null,
  todayVerifiedUdin: null,
  todayRevokedUdin: null,
  totalUser: null,
  totalUdin: null,
  totalVerifiedUdin: null,
  totalRevokedUdin: null,
  certSkillIndia: null,
  certNcvet: null,
  certMembership: null,
  certPracticing: null,
  certTotalGenerated: null,
};

function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: number | null;
  Icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "orange" | "green" | "red" | "purple" | "indigo" | "amber" | "teal";
}) {
  const colorMap = {
    blue: "bg-blue-600",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
    red: "bg-rose-500",
    purple: "bg-purple-600",
    indigo: "bg-indigo-600",
    amber: "bg-amber-500",
    teal: "bg-teal-600",
  } as const;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </p>
        <p className="text-3xl font-bold text-slate-800 mt-1">
          {value === null ? "—" : value.toLocaleString()}
        </p>
      </div>
      <div
        className={`h-12 w-12 rounded-full text-white flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayIso = todayStart.toISOString();

        // ---- Users (memberinformation + new_member_request) ----
        const [memberTotal, requestToday, requestTotal] = await Promise.all([
          supabase
            .from("memberinformation")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("new_member_request")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayIso),
          supabase
            .from("new_member_request")
            .select("*", { count: "exact", head: true }),
        ]);

        // ---- UDIN-related counts. If a `udin` table does not exist these
        // ---- queries simply return null counts (errors are swallowed).
        const safe = async (
          q: Promise<{
            count: number | null;
            error: { message: string } | null;
          }>
        ) => {
          try {
            const r = await q;
            if (r.error) return null;
            return r.count ?? 0;
          } catch {
            return null;
          }
        };

        // ---- Certificate generation counts ----
        // certification_approval has 4 *_generated varchar(1) columns. A value
        // of "1" means that certificate has already been generated for that
        // member. Each query asks Postgres to return only the count.
        const certGenCol = (col: string) =>
          safe(
            supabase
              .from("certification_approval")
              .select("*", { count: "exact", head: true })
              .eq(col, "1") as unknown as Promise<{
              count: number | null;
              error: { message: string } | null;
            }>
          );

        const [
          udinTotal,
          udinToday,
          udinVerifiedTotal,
          udinVerifiedToday,
          udinRevokedTotal,
          udinRevokedToday,
          certSkillIndia,
          certNcvet,
          certMembership,
          certPracticing,
        ] =
          await Promise.all([
            safe(
              supabase.from("udin").select("*", { count: "exact", head: true }) as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            safe(
              supabase
                .from("udin")
                .select("*", { count: "exact", head: true })
                .gte("created_at", todayIso) as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            safe(
              supabase
                .from("udin")
                .select("*", { count: "exact", head: true })
                .eq("status", "verified") as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            safe(
              supabase
                .from("udin")
                .select("*", { count: "exact", head: true })
                .eq("status", "verified")
                .gte("created_at", todayIso) as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            safe(
              supabase
                .from("udin")
                .select("*", { count: "exact", head: true })
                .eq("status", "revoked") as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            safe(
              supabase
                .from("udin")
                .select("*", { count: "exact", head: true })
                .eq("status", "revoked")
                .gte("created_at", todayIso) as unknown as Promise<{
                count: number | null;
                error: { message: string } | null;
              }>
            ),
            certGenCol("skill_india_generated"),
            certGenCol("ncvet_generated"),
            certGenCol("membership_cert_generated"),
            certGenCol("practicing_generated"),
          ]);

        const certTotal =
          certSkillIndia !== null ||
          certNcvet !== null ||
          certMembership !== null ||
          certPracticing !== null
            ? (certSkillIndia ?? 0) +
              (certNcvet ?? 0) +
              (certMembership ?? 0) +
              (certPracticing ?? 0)
            : null;

        setStats({
          todayUser: requestToday.count ?? 0,
          todayUdin: udinToday,
          todayVerifiedUdin: udinVerifiedToday,
          todayRevokedUdin: udinRevokedToday,
          totalUser: memberTotal.count ?? requestTotal.count ?? 0,
          totalUdin: udinTotal,
          totalVerifiedUdin: udinVerifiedTotal,
          totalRevokedUdin: udinRevokedTotal,
          certSkillIndia,
          certNcvet,
          certMembership,
          certPracticing,
          certTotalGenerated: certTotal,
        });
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminShell title="Admin Control Panel">
      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Today's User"
          value={loading ? null : stats.todayUser}
          Icon={User}
          color="blue"
        />
        <StatCard
          title="Today's UDIN"
          value={loading ? null : stats.todayUdin}
          Icon={FileText}
          color="orange"
        />
        <StatCard
          title="Today's Verified UDIN"
          value={loading ? null : stats.todayVerifiedUdin}
          Icon={BadgeCheck}
          color="green"
        />
        <StatCard
          title="Today's Revoked UDIN"
          value={loading ? null : stats.todayRevokedUdin}
          Icon={UserX2}
          color="red"
        />

        <StatCard
          title="Total User"
          value={loading ? null : stats.totalUser}
          Icon={User}
          color="blue"
        />
        <StatCard
          title="Total UDIN"
          value={loading ? null : stats.totalUdin}
          Icon={FileText}
          color="orange"
        />
        <StatCard
          title="Total Verified UDIN"
          value={loading ? null : stats.totalVerifiedUdin}
          Icon={BadgeCheck}
          color="green"
        />
        <StatCard
          title="Total Revoked UDIN"
          value={loading ? null : stats.totalRevokedUdin}
          Icon={UserX2}
          color="red"
        />
      </div>

      <h2 className="text-base md:text-lg font-bold text-[#1e2659] mt-10 mb-3">
        Certificates Generated
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          title="Total Generated"
          value={loading ? null : stats.certTotalGenerated}
          Icon={Award}
          color="indigo"
        />
        <StatCard
          title="Skill India"
          value={loading ? null : stats.certSkillIndia}
          Icon={GraduationCap}
          color="amber"
        />
        <StatCard
          title="NCVET"
          value={loading ? null : stats.certNcvet}
          Icon={Stamp}
          color="teal"
        />
        <StatCard
          title="CTPr Membership"
          value={loading ? null : stats.certMembership}
          Icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Practicing Member"
          value={loading ? null : stats.certPracticing}
          Icon={BadgeCheck}
          color="green"
        />
      </div>
    </AdminShell>
  );
}
