"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/lib/Supabase";
import {
  User,
  Users,
  Inbox,
  MessageSquareWarning,
  Award,
  GraduationCap,
  Stamp,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

interface Stats {
  todayUsers: number | null;
  totalUsers: number | null;
  totalRequests: number | null;
  totalIssues: number | null;
  certSkillIndia: number | null;
  certNcvet: number | null;
  certMembership: number | null;
  certPracticing: number | null;
  certTotalGenerated: number | null;
}

const emptyStats: Stats = {
  todayUsers: null,
  totalUsers: null,
  totalRequests: null,
  totalIssues: null,
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

type CountResult = { count: number | null; error: { message: string } | null };

async function countQuery(q: unknown): Promise<number | null> {
  try {
    const r = (await q) as CountResult;
    if (r.error) {
      console.warn("Dashboard count:", r.error.message);
      return null;
    }
    return r.count ?? 0;
  } catch {
    return null;
  }
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
        const todayDate = todayIso.slice(0, 10);

        const [
          totalUsers,
          todayUsersJoined,
          todayUsersCreated,
          totalRequests,
          totalIssues,
          certSkillIndia,
          certNcvet,
          certMembership,
          certPracticing,
        ] = await Promise.all([
          countQuery(
            supabase.from("memberinformation").select("*", { count: "exact", head: true })
          ),
          countQuery(
            supabase
              .from("candidate_exam_schedule")
              .select("*", { count: "exact", head: true })
              .eq("joined", todayDate)
          ),
          countQuery(
            supabase
              .from("memberinformation")
              .select("*", { count: "exact", head: true })
              .gte("created_at", todayIso)
          ),
          countQuery(
            supabase.from("new_member_request").select("*", { count: "exact", head: true })
          ),
          countQuery(supabase.from("enquiry").select("*", { count: "exact", head: true })),
          countQuery(
            supabase
              .from("certification_approval")
              .select("*", { count: "exact", head: true })
              .eq("skill_india_generated", "1")
          ),
          countQuery(
            supabase
              .from("certification_approval")
              .select("*", { count: "exact", head: true })
              .eq("ncvet_generated", "1")
          ),
          countQuery(
            supabase
              .from("certification_approval")
              .select("*", { count: "exact", head: true })
              .eq("membership_cert_generated", "1")
          ),
          countQuery(
            supabase
              .from("certification_approval")
              .select("*", { count: "exact", head: true })
              .eq("practicing_generated", "1")
          ),
        ]);

        const todayUsers =
          todayUsersJoined !== null
            ? todayUsersJoined
            : todayUsersCreated !== null
              ? todayUsersCreated
              : null;

        const resolvedTotalUsers =
          totalUsers !== null
            ? totalUsers
            : await countQuery(
                supabase
                  .from("candidate_exam_schedule")
                  .select("*", { count: "exact", head: true })
              );

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
          todayUsers,
          totalUsers: resolvedTotalUsers,
          totalRequests,
          totalIssues,
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

      <h2 className="text-base md:text-lg font-bold text-[#1e2659] mb-3">
        Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Today's Users"
          value={loading ? null : stats.todayUsers}
          Icon={User}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={loading ? null : stats.totalUsers}
          Icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Requests"
          value={loading ? null : stats.totalRequests}
          Icon={Inbox}
          color="orange"
        />
        <StatCard
          title="Total Issues"
          value={loading ? null : stats.totalIssues}
          Icon={MessageSquareWarning}
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
