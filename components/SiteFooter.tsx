"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SocialIconLinks } from "@/components/SocialIconLinks";

/** Google Maps embed (query-based; no API key) */
const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=TPI+Bhavan,+313,+9th+Main,+26th+Cross,+Banashankari+2nd+Stage,+Bengaluru,+560070,+Karnataka,+India&hl=en&z=16&output=embed";

export function SiteFooter() {
  const [note, setNote] = useState("");
  const year = new Date().getFullYear();

  function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNote("For membership updates, please write to info@ictpi.in or call 7019063788.");
  }

  return (
    <footer className="bg-black text-white font-sans text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 items-start">
        {/* Left — organisation */}
        <div className="text-center lg:text-left space-y-4 order-2 lg:order-1">
          <div>
            <p className="font-heading-algerian font-bold text-white text-base sm:text-lg md:text-xl tracking-wide uppercase leading-snug">
              Institute of Chartered Tax Practitioners India
            </p>
            <p className="mt-2 text-xs sm:text-sm text-white/85">
              ( Professional Body of Enrolled Tax Practitioners of the Nation )
            </p>
          </div>

          <div className="text-xs sm:text-sm text-white/90 space-y-1">
            <p className="font-semibold text-white">Registered Address:</p>
            <p>TPI Bhavan, 313, 9th Main, 26th Cross, Banashankari</p>
            <p>Stage II, Bengaluru - 560070 - Karnataka - IN</p>
          </div>

          <p className="text-xs sm:text-sm">
            <span className="text-white/90">Email: </span>
            <a href="mailto:info@ictpi.in" className="underline hover:text-white">
              info@ictpi.in
            </a>
            <span className="text-white/90"> Tel: </span>
            <a href="tel:+917019063788" className="underline hover:text-white">
              7019063788
            </a>
          </p>

          <SocialIconLinks className="justify-center lg:justify-start pt-1" />

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs underline pt-2">
            <Link href="/legal#disclaimer" className="hover:text-white/80">
              Disclaimer
            </Link>
            <Link href="/legal#privacy" className="hover:text-white/80">
              Privacy Policy
            </Link>
            <Link href="/legal#refund" className="hover:text-white/80">
              Refund Policy
            </Link>
            <Link href="/legal#terms" className="hover:text-white/80">
              Terms &amp; Conditions
            </Link>
          </div>

          <p className="text-right text-xs text-white/60 pt-2 lg:pt-4">
            © 2021{year !== 2021 ? `–${year}` : ""} by ICTPI
          </p>
        </div>

        {/* Centre — map */}
        <div className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none">
          <div className="relative w-full aspect-square max-h-[280px] sm:max-h-[320px] mx-auto overflow-hidden ring-1 ring-white/20 bg-neutral-900">
            <iframe
              title="TPI Bhavan — Head Office of ICTPI"
              src={MAP_EMBED_SRC}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-center text-xs text-white/70 mt-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=TPI+Bhavan+313+9th+Main+26th+Cross+Banashankari+Stage+II+Bengaluru+560070"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Open in Google Maps
            </a>
          </p>
        </div>

        {/* Right — subscribe & counter */}
        <div className="order-3 text-center lg:text-left space-y-6">
          

          <div className="pt-2">
            <p className="text-xs text-white/60 mb-2">Visitors</p>
            <div
              className="inline-flex font-mono text-xl sm:text-2xl tracking-[0.25em] px-4 py-2 border border-white/30 bg-neutral-950 text-white"
              aria-label="Visitor count display"
            >
              188408
            </div>
            <p className="text-[10px] text-white/60 mt-2 tracking-widest uppercase">WEB-STAT</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
