"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  KeyRound,
  LogOut,
  UserPlus,
  MessageSquare,
  Newspaper,
  Award,
  CalendarClock,
  Share2,
  Crown,
} from "lucide-react";
import {
  isAdminAuthenticated,
  logoutAdmin,
  touchAdminActivity,
  isAdminIdlePastTimeout,
  ADMIN_SESSION_CHECK_INTERVAL_MS,
} from "@/lib/adminAuth";

const NAVY = "#1e2659";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: Home },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/new-requests", label: "New Member Requests", Icon: UserPlus },
  { href: "/admin/enquiries", label: "Enquiries", Icon: MessageSquare },
  { href: "/admin/news", label: "News", Icon: Newspaper },
  {
    href: "/admin/certificate-approvals",
    label: "Certificate Approvals",
    Icon: Award,
  },
  { href: "/admin/sessions", label: "Sessions", Icon: CalendarClock },
  { href: "/admin/referrals", label: "Referrals", Icon: Share2 },
  { href: "/admin/premium-list", label: "Premium List", Icon: Crown },
  { href: "/admin/change-password", label: "Reset Member Password", Icon: KeyRound },
] as const;

export function AdminShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin");
      return;
    }
    setReady(true);
  }, [router]);

  /** Every 10 minutes: if no admin activity in the last 10 minutes, sign out. */
  useEffect(() => {
    if (!ready) return;

    touchAdminActivity();

    const runIdleCheck = () => {
      if (!isAdminAuthenticated()) return;
      if (isAdminIdlePastTimeout()) {
        logoutAdmin();
        router.replace("/admin");
      }
    };

    const intervalId = window.setInterval(
      runIdleCheck,
      ADMIN_SESSION_CHECK_INTERVAL_MS
    );

    let lastTouch = 0;
    const throttleMs = 45_000;
    const bumpActivity = () => {
      const now = Date.now();
      if (now - lastTouch < throttleMs) return;
      lastTouch = now;
      touchAdminActivity();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "mousemove",
    ];
    events.forEach((type) =>
      window.addEventListener(type, bumpActivity, { passive: true })
    );
    const onVisibility = () => {
      if (document.visibilityState === "visible") bumpActivity();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      events.forEach((type) =>
        window.removeEventListener(type, bumpActivity)
      );
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, router]);

  const onLogout = () => {
    logoutAdmin();
    router.replace("/admin");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5fb]">
        <p className="text-slate-500 text-sm">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f5fb]">
      <aside
        className="w-16 md:w-20 flex flex-col items-center py-6 text-white"
        style={{ background: NAVY }}
      >
        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold tracking-wide">
          A
        </div>

        <nav className="mt-10 flex flex-col items-center gap-2 flex-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`h-11 w-11 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          title="Logout"
          className="mt-auto h-11 w-11 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header
          className="h-14 px-6 flex items-center justify-between text-white"
          style={{ background: NAVY }}
        >
          <h1 className="text-base md:text-lg font-semibold">{title}</h1>
          <button
            onClick={onLogout}
            title="Sign out"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
