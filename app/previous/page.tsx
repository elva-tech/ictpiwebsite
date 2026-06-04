"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlayCircle, History } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { loadMemberProfileByEmail } from "@/lib/candidateExamSchedule";
import { getStoredMembershipId } from "@/lib/memberSession";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PREVIOUS_SESSIONS = [
  {
    sessionid: 1,
    sessiontitle: "Applied Financial Accounting and Ethics 1",
    sessiondate: "2024-03-04",
    sessiontime: "14:30",
    sessionlink: "https://youtu.be/qtckGPd2gak?si=8CBdK9fa9nZE7PiY",
  },
  {
    sessionid: 2,
    sessiontitle: "Applied Financial Accounting and Ethics 2",
    sessiondate: "2024-03-05",
    sessiontime: "10:00",
    sessionlink: "https://www.youtube.com/watch?v=F0QVxLpWuIY&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=2",
  },
  {
    sessionid: 3,
    sessiontitle: "Business Regulatory Laws Compliance 1",
    sessiondate: "2024-05-06",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=9u_dB4IGNeE&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=3",
  },
  {
    sessionid: 4,
    sessiontitle: "Business Regulatory Laws Compliance 2",
    sessiondate: "2024-06-07",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=ltO2C0R96h8&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=4",
  },
  {
    sessionid: 5,
    sessiontitle: "Indirect Laws and Compliance 1",
    sessiondate: "2024-03-11",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=R5jE6OdOcsE&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=5",
  },
  {
    sessionid: 6,
    sessiontitle: "Indirect Laws and Compliance 2",
    sessiondate: "2024-03-12",
    sessiontime: "10:00",
    sessionlink: "https://www.youtube.com/watch?v=Pyo3O0K8eoU&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=6",
  },
  {
    sessionid: 7,
    sessiontitle: "Indirect Tax Laws Compliance 3",
    sessiondate: "2024-03-13",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=j2Jejo4XN2M&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=7",
  },
  {
    sessionid: 8,
    sessiontitle: "Direct Tax Laws Compliance 1",
    sessiondate: "2024-03-14",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=QW5bYyI0CgY&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=8",
  },
  {
    sessionid: 9,
    sessiontitle: "Direct Tax Laws Compliance 2",
    sessiondate: "2024-03-15",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=__aPdZ5pNpg&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=9",
  },
  {
    sessionid: 10,
    sessiontitle: "Overall Review of Session",
    sessiondate: "2024-03-16",
    sessiontime: "16:00",
    sessionlink: "https://www.youtube.com/watch?v=vpiy4frgCaA&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=10",
  },
  {
    sessionid: 11,
    sessiontitle: "Special sessions on training on CTPr Training - Day 1",
    sessiondate: "2024-04-16",
    sessiontime: "11:30",
    sessionlink: "https://www.youtube.com/watch?v=WFMsVn6ql0g&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=11",
  },
  {
    sessionid: 12,
    sessiontitle: "Special sessions on training on CTPr Training - Day 2",
    sessiondate: "2024-04-17",
    sessiontime: "15:00",
    sessionlink: "https://www.youtube.com/watch?v=3LZET_zaqbA&list=PLn-p4-DtWfNdOu4Fb4XnaLsZP4pExVJee&index=12",
  },
];

export default function PreviousSessions() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("User");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!auth?.user) return;

    const userEmail = auth.user.email?.toLowerCase()?.trim() || "";

    const fetchUserName = async () => {
      setLoadingUser(true);
      try {
        const { data: payload } = await loadMemberProfileByEmail(
          userEmail,
          supabase,
          getStoredMembershipId()
        );

        const nameFromDb = payload?.member?.name?.trim();
        if (nameFromDb) {
          setFullName(nameFromDb);
        } else {
          setFullName(userEmail.split("@")[0] || "User");
        }
      } catch (err) {
        console.error("User fetch failed:", err);
        setFullName(userEmail.split("@")[0] || "User");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserName();
  }, [auth?.user]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user) {
      router.push("/");
    }
  }, [auth, router]);

  if (!auth || auth.loading || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <AuthenticatedLayout title="Previous Sessions" maxWidth="full">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 mt-4">
              Previous Sessions
            </h1>

            {PREVIOUS_SESSIONS.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No previous sessions found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {PREVIOUS_SESSIONS.map((session) => {
                  const youtubeId = extractYouTubeId(session.sessionlink);
                  const isYoutube = !!youtubeId;

                  return (
                    <div
                      key={session.sessionid}
                      onClick={() =>
                        isYoutube &&
                        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank")
                      }
                      className="group bg-white rounded-xl border border-gray-200 hover:border-[#0062cc] transition-all cursor-pointer shadow-md hover:shadow-xl overflow-hidden transform hover:-translate-y-1 duration-200"
                    >
                      <div
                        className="relative h-48 w-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, #0062cc 0%, #004080 70%, #002b5c 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40"></div>

                        {isYoutube ? (
                          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <History className="w-14 h-14 text-white/80" />
                        )}
                      </div>

                      <div className="p-5">
                        <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 mb-3 leading-tight">
                          {session.sessiontitle}
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="font-medium">
                            {session.sessiondate.replace(/-/g, " / ")}
                          </p>
                          <p className="text-gray-500">{session.sessiontime} IST</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
    </AuthenticatedLayout>
  );
}