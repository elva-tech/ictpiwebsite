"use client";

import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { useRef, useEffect, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Staggered reveal: add class when in view
function useReveal(ref: React.RefObject<HTMLElement | null>, delay = 0): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => setVisible(true), delay);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, delay]);
  return visible;
}

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref, delay);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface NavItem {
  label: string;
  href: string;
}

interface RecognitionLink {
  label: string;
  href: string;
  icon: string;
}

export default function Home() {
  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Member Login", href: "/login" },
    { label: "Admin Login", href: "https://results-vdct.vercel.app/" },
    { label: "Refer", href: "/refer" },
  ];

  const recognitionLinks: RecognitionLink[] = [
    { label: "National Qualification Register", href: "https://www.nqr.gov.in/qualifications/3521", icon: "🏆" },
    { label: "Register of National Occupational Standards", href: "https://www.mepsc.in/occupational_standar/entrepreneurship/", icon: "📋" },
    { label: "RPL for Seniors", href: "https://www.ictpi.in/rpl", icon: "🔄" },
    { label: "ICTPI UDIN", href: "https://ictpi.verifyudin.in/", icon: "✅" },
    { label: "Register of Members", href: "https://www.ictpi.in/register-of-members", icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased overflow-x-hidden">
      {/* Hero – full data, blackletter heading, animations */}
      <header className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: "-2s" }} />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-amber-400/15 blur-3xl animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: "-4s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(15,23,42,0.4)_100%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center z-10">
          <div className="opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.1s_forwards] mb-8 sm:mb-10">
            <AppLogo variant="hero" alt="ICTPI Logo" priority />
          </div>

          <p className="font-[family-name:var(--font-poppins)] opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.2s_forwards] text-amber-200/95 font-semibold text-lg sm:text-xl md:text-2xl tracking-wide">
            भारत कर व्यावसायिक संस्थान
          </p>

          <h1 className="font-[family-name:var(--font-unifraktur)] opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.3s_forwards] text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-[0.08em] sm:tracking-[0.12em] mt-2">
            Institute of
            <br />
            Chartered Tax Practitioners India
          </h1>

          <p className="font-[family-name:var(--font-poppins)] opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.35s_forwards] mt-6 sm:mt-8 text-amber-200/95 font-medium text-sm sm:text-base md:text-lg tracking-wide">
            [A Professional Membership Body of Enrolled Tax Practitioners of India]
          </p>
          <p className="font-[family-name:var(--font-poppins)] opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.4s_forwards] mt-2 text-slate-300 font-medium text-xs sm:text-sm md:text-base tracking-wide max-w-3xl mx-auto">
            [An Industry-cum-Implementation Partner of Management & Entrepreneurship and Professional Skills Council]
            <br />
            <span className="text-slate-400 text-xs sm:text-sm">
              (MEPSC is a recognized Awarding body of National Council for Vocational Education and Training under the aegis of Ministry of Skill Development and Entrepreneurship, Government of India)
            </span>
          </p>

          <div className="opacity-0 animate-[slide-up-fade_0.8s_ease-out_0.55s_forwards] mt-10 sm:mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-100 transition-all duration-300"
            >
              Member Login
            </Link>
            <Link
              href="/refer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Refer & Grow
            </Link>
          </div>
        </div>
      </header>

      {/* Sticky Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4">
            <Link href="/" className="hidden md:block font-[family-name:var(--font-unifraktur)] text-slate-800 text-xl tracking-wide">
              ICTPI
            </Link>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <Link href="/" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-lg hover:bg-slate-100 transition-all">
                Home
              </Link>
              <Link href="/login" className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
                Member Login
              </Link>
              <a href="https://results-vdct.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-lg hover:bg-slate-100 transition-all">
                Admin Login
              </a>
              <Link href="/refer" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-lg hover:bg-slate-100 transition-all">
                Refer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Recognition */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl md:text-3xl font-bold mb-10 md:mb-12 tracking-tight text-amber-300/95">
            Recognition & Credentials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
            {recognitionLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                <span className="font-medium text-sm text-slate-200 group-hover:text-amber-200 transition-colors line-clamp-2">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-24 lg:space-y-32">
        {/* Institute News */}
        <Reveal delay={0}>
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 tracking-tight">
              Institute News
            </h2>
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/30">
              <div className="p-6 md:p-10 space-y-6 text-slate-700 text-lg leading-relaxed">
                {[
                  "ICTPI RPL Batch convocation will happen shortly",
                  null,
                  "CTPRI Course study materials & exam portal is being updated and new academic materials will be released soon! Currently EBooks are available and are being distributed",
                  "Consultant (Chartered Tax Practitioners) Course is fully NSQF Aligned at Level 5",
                ].map((text, i) => (
                  <p key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm shadow-sm">
                      {i + 1}
                    </span>
                    {i === 1 ? (
                      <a href="https://www.ictpi.in/ctpr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline decoration-amber-400 decoration-2 hover:decoration-amber-500 transition-colors duration-200 font-medium">
                        Chartered Tax Practitioner course registrations are open
                      </a>
                    ) : (
                      text
                    )}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Vision, Motto, Mission + full copy */}
        <Reveal delay={100}>
          <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20">
            <div className="px-6 py-12 md:px-12 md:py-16 lg:py-20 space-y-12 lg:space-y-16 text-center">
              <div className="transition-transform duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl md:text-3xl font-bold underline underline-offset-8 decoration-amber-400 mb-4">OUR VISION</h3>
                <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
                  SERVING STAKEHOLDERS IS DEEMED SERVICE TO GOVERNMENT
                </p>
              </div>
              <div className="transition-transform duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl md:text-3xl font-bold underline underline-offset-8 decoration-amber-400 mb-4">OUR MOTTO</h3>
                <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
                  FROM PALM-LEAF TO PORTAL, FROM LEDGER TO LAPTOP
                </p>
              </div>
              <div className="transition-transform duration-300 hover:scale-[1.02]">
                <h3 className="text-2xl md:text-3xl font-bold underline underline-offset-8 decoration-amber-400 mb-4">OUR MISSION</h3>
                <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
                  TO UPLIFT ANYONE & EVERYONE, ASSURE THEIR SKILLS OF FUNCTIONING
                </p>
              </div>

              <div className="text-base md:text-lg leading-relaxed max-w-5xl mx-auto opacity-95 space-y-6 text-left">
                <p>
                  The diversified class of Enrolled Tax Practitioners, persevered everywhere as the fundamental & foundation stones of every business activity, exist from the ancient streams of Indian Taxation system. They are proposed and recognised as the non-litigant propagators of supportive compliance under the respective statutes. The Institute of Chartered Tax Practitioners India (ICTPI) is formed to unite & transform these unorganised and scattered Tax Practitioners, into a premier troupe of &quot;Chartered Tax Practitioners.&quot; ICTPI aims to confer a uniform qualification & membership to protect their interest as a fraternity and to become value added professionals in nation building. ICTPI has developed a qualification, which will be awarded by the Management & Entrepreneurship and Professionals Skill Council (MEPSC) duly approved by the National Council for Vocational Education and Training (NCVET) under the aegis of Ministry of Skill Development and Entrepreneurship (MSDE), Government of India.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-10 pt-8 border-t border-white/20 text-left">
                <div className="space-y-6">
                  <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Acknowledgement</h4>
                  <p className="text-sm md:text-base opacity-90">
                    Institute of Chartered Tax Practitioners India has outlined specific requirements for membership eligibility. Accordingly to become a member, one must:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-sm md:text-base opacity-90">
                    <li>Complete the NCVET-approved Skill Qualification &quot;Consultant: Chartered Tax Practitioner&quot;</li>
                    <li>Obtain a qualification certificate from MEPSC awarded upon successful completion of the course</li>
                    <li>Secure an enrolment licence to practice as a Tax Practitioner from the respective tax department(s)</li>
                  </ol>
                  <p className="text-sm md:text-base opacity-90">
                    By acknowledging these requirements, ICTPI ensures its members possess the necessary expertise and credentials to provide tax compliance services.
                  </p>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Disclaimer</h4>
                  <ul className="list-disc list-inside space-y-3 text-sm md:text-base opacity-90">
                    <li>ICTPI is not affiliated in any manner to the Institute of Chartered Accountants of India (ICAI) and the activities of ICTPI do not deal with any aspect in relation to the ICAI</li>
                    <li>ICTPI does not issue any licenses to practice as an Income Tax Practitioner, GST Practitioner, or a Customs Broker.</li>
                    <li>The courses offered by ICTPI is not an essential prerequisite for obtaining any licenses from the respective departments/authorities;</li>
                    <li>The scope of the course offered by the ICTPI is to enable vocational training and does not automatically entitle the prospective student to practice or enrol as a tax practitioner except as provided in the respective statutes.</li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Appeal</h4>
                  <p className="text-sm md:text-base leading-relaxed opacity-90">
                    The Institute has set up a 2000 sq.ft. head office named &quot;TPI BHAVAN&quot; at Bengaluru. Apart from operative costs, rent, salaries & office expenses, institute need corpus to fund its capital expenditure such as building, repairs, furniture - fixtures, equipment&apos;s, which requires additional support. To achieve above objectives the institute requires resources in terms of men and money. The Institute requests one and all to contribute generously for its endeavour and support for the cause of fraternity! (Donations to the Institute are eligible for deductions u/s 80 G(5) of IT Act 1961)
                  </p>
                </div>
              </div>

              <p className="text-sm md:text-base opacity-90 pt-4 border-t border-white/20">
                ICTPI is a Non for Profiteering & Non-Government Organisation, recognised & licenced as section 8 Public Company Limited by guarantee, vide CIN: U85100KA2020NPL131334 under The Companies Act, 2013.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Gallery */}
        <Reveal delay={150}>
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-10 tracking-tight">
              Institute&apos;s Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {["im1.png", "im2.png", "im3.png", "im4.png", "im5.png"].map((img, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ring-1 ring-slate-200/60 hover:ring-amber-300/50"
                >
                  <Image
                    src={`/images/${img}`}
                    alt={`Institute event or activity ${i + 1}`}
                    width={400}
                    height={400}
                    className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium">Event / Activity {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>   
      </main>

      {/* Footer – full address and contact */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center space-y-6 text-sm md:text-base">
          <a
            href="https://www.ictpi.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-lg md:text-xl font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 transition"
          >
            Website: https://www.ictpi.in
          </a>

          <p className="text-xl md:text-2xl font-bold text-white">
            INSTITUTE OF CHARTERED TAX PRACTITIONERS INDIA
          </p>
          <p className="opacity-80">(A Professional Membership Body of Enrolled Tax Practitioners of India)</p>
          <p className="text-xs md:text-sm opacity-75 max-w-2xl mx-auto">
            ICTPI is a Non for Profiteering & Non-Government Organisation, recognised & licenced as section 8 Public Company Limited by guarantee, vide CIN: U85100KA2020NPL131334 under The Companies Act, 2013
          </p>
          <div className="pt-4 space-y-2">
            <p className="font-medium">Registered Head Quarters & Address for Correspondence:</p>
            <p>TPI Bhavan, # 313, 26th Cross, 9th Main, Siddanna Layout, Banashankari II Stage, Bengaluru – 560 070</p>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-8">
            <a href="mailto:info@ictpi.in" className="hover:text-amber-300 transition">e-Mail: info@ictpi.in</a>
            <a href="mailto:charteredtaxpractitioners@gmail.com" className="hover:text-amber-300 transition">e-Mail: charteredtaxpractitioners@gmail.com</a>
            <a href="tel:7019063788" className="hover:text-amber-300 transition">Tel: 7019063788</a>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-5 md:gap-8 text-sm">
            <a href="https://www.ictpi.in/_files/ugd/d635cc_0b0d617b3e954e2eace126725fc08616.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Disclaimer</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_74bf07f910a6472aba6d3e849040c479.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Privacy policy</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_c3e1dd367c96477cb51efc6e4a93816f.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Refund policy</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_2672c689be5645599d2e44a39efa7075.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Terms and conditions</a>
          </div>

          <p className="pt-10 opacity-70 text-sm">© {new Date().getFullYear()} by ICTPI</p>
        </div>
      </footer>
    </div>
  );
}
