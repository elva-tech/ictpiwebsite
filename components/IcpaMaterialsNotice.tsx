"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  className?: string;
  href?: string;
};

export function IcpaMaterialsNotice({
  className,
  href = "/premium/vlogs",
}: Props) {
  return (
    <div className={`flex justify-center overflow-visible ${className ?? ""}`}>
      <div className="icpa-notice-waves">
        <Link
          href={href}
          className="icpa-notice-pill inline-flex max-w-full items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span className="truncate">ICPA Study Materials are available</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
