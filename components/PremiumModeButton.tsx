"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { setStoredPortalMode, usePortalMode } from "@/lib/portalTheme";
import { supabase } from "@/lib/Supabase";

interface PremiumModeButtonProps {
  currentEmail?: string | null;
  compact?: boolean;
}

export function PremiumModeButton({
  currentEmail,
  compact = false,
}: PremiumModeButtonProps) {
  const { isPremium } = usePortalMode();
  const router = useRouter();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const normalizedCurrentEmail = currentEmail?.toLowerCase().trim() || "";

    if (!normalizedCurrentEmail) {
      setHasPremiumAccess(false);
      return;
    }

    let isMounted = true;
    setIsChecking(true);

    const checkPremiumAccess = async () => {
      try {
        const { data, error } = await supabase
          .from("premiumlist")
          .select("email")
          .ilike("email", normalizedCurrentEmail)
          .maybeSingle();

        if (!isMounted) return;
        if (error) {
          console.error("Premium list lookup failed:", error);
          setHasPremiumAccess(false);
          return;
        }
        setHasPremiumAccess(Boolean(data?.email));
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    checkPremiumAccess();

    return () => {
      isMounted = false;
    };
  }, [currentEmail]);

  const handleClick = () => {
    if (isPremium) {
      setStoredPortalMode("standard");
      router.push("/dashboard");
      return;
    }

    if (isChecking) {
      window.alert(
        "Checking premium access. Please try again in a moment."
      );
      return;
    }

    if (!hasPremiumAccess) {
      window.alert(
        "This email does not have access in the premium list."
      );
      return;
    }

    setStoredPortalMode("premium");
    router.push("/premium");
  };

  const className = compact
    ? `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        isPremium
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "bg-purple-600 text-white hover:bg-purple-700"
      }`
    : `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm ${
        isPremium
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "bg-purple-600 text-white hover:bg-purple-700"
      }`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={
        isPremium
          ? "Switch back to ICPI mode"
          : "Switch to ICPA LMS mode"
      }
    >
      <Sparkles className="w-4 h-4" />
      {isPremium ? "ICPI Mode" : "ICPA LMS"}
    </button>
  );
}
