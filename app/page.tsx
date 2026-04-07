import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SocialIconLinks } from "@/components/SocialIconLinks";
const GALLERY_IMAGES = ["im1.png", "im2.png", "im3.png", "im4.png", "im5.png"];

const NEWS_LINES = [
  "Goa RRC & Convocation 6th 7th & 8th May 2026",
  "CTPr Course study materials & exam portal is being updated and new academic materials will be released soon! Currently EBooks are available and are being distributed",
  "Consultant (Chartered Tax Practitioners) Course is fully NSQF Aligned at Level 5",
];

/** Same title + body structure as brochure PDF; outer shell is styled for depth / motion only */
function BrochureBlock({
  id,
  title,
  children,
  revealClass = "animate-landing-reveal landing-delay-5",
}: {
  id?: string;
  title: string;
  children: ReactNode;
  revealClass?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${revealClass}`}>
      <div className="landing-brochure-band relative overflow-hidden py-4 md:py-5">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-400/15 via-transparent to-indigo-400/20"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center rounded-full bg-white/95 px-10 py-3 text-center shadow-xl shadow-blue-950/25 ring-2 ring-sky-100/90 backdrop-blur-md">
            <span className="text-center text-base font-bold tracking-tight text-slate-900 md:text-lg">{title}</span>
          </div>
        </div>
      </div>
      <div className="relative border-b border-blue-200/30 bg-gradient-to-b from-white via-sky-50/70 to-indigo-100/50 py-8 md:py-11">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 font-serif text-[15px] leading-[1.75] text-slate-800 sm:px-6 lg:px-8 md:text-[1.05rem]">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const marqueeImages = [...GALLERY_IMAGES, ...GALLERY_IMAGES];
  const marqueeNews = [...NEWS_LINES, ...NEWS_LINES];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900 antialiased">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-slate-200 via-blue-100/90 to-indigo-200/80"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="animate-landing-orb absolute top-[-18%] right-[-12%] h-[min(88vh,680px)] w-[min(88vw,680px)] rounded-full bg-gradient-to-br from-blue-500/35 via-indigo-500/25 to-violet-600/20 blur-3xl" />
        <div className="animate-landing-orb-slow absolute bottom-[-20%] left-[-18%] h-[min(75vh,560px)] w-[min(82vw,560px)] rounded-full bg-gradient-to-tr from-blue-900/30 via-blue-600/20 to-indigo-400/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-300/25 to-violet-500/20 blur-3xl" />
      </div>

      <header className="animate-landing-reveal relative overflow-hidden text-white shadow-[0_10px_48px_-14px_rgba(15,23,42,0.55)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-blue-950 to-indigo-950" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-indigo-900/40"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_15%_25%,#60a5fa,transparent_45%),radial-gradient(circle_at_90%_60%,#a78bfa,transparent_40%),radial-gradient(circle_at_45%_100%,#2563eb,transparent_38%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-[landing-shine_14s_ease_infinite_alternate] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] bg-[length:200%_100%] opacity-30 mix-blend-overlay"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-5 md:gap-8">
            <div className="shrink-0">
              <Image
                src="/images/ICTPL_image.jpg"
                alt="ICTPI Logo"
                width={200}
                height={200}
                className="animate-landing-logo-float object-contain drop-shadow-2xl"
                priority
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-heading-algerian mt-1 text-xl font-bold leading-tight tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-1xl md:text-2xl lg:text-2xl">
                INSTITUTE OF CHARTERED TAX PRACTITIONERS INDIA
              </h1>
              <p className="mt-3 text-sm font-semibold text-emerald-300/95 md:text-base">
                [A Professional Membership Body of Enrolled Tax Practitioners of India]
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-snug text-slate-200 md:text-[0.95rem]">
                [An Industry-cum-Implementation Partner of Management &amp; Entrepreneurship and Professional Skills Council]
                <br />
                <span className="text-slate-300/95">
                  (MEPSC is a recognized Awarding body of National Council for Vocational Education and Training under the aegis of Ministry of Skill Development and Entrepreneurship, Government of India)
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 lg:flex-col lg:items-end">
            <SocialIconLinks className="justify-end" />
          </div>
        </div>

        <nav className="relative z-10 border-t border-blue-400/20 bg-gradient-to-r from-slate-950/70 via-blue-950/50 to-indigo-950/70 py-3 shadow-[inset_0_1px_0_rgba(147,197,253,0.12)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              Home
            </Link>
            <Link
              href="#mission"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              About
            </Link>
            <Link
              href="#institute-news"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              News
            </Link>
            <Link
              href="/login"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              Member login
            </Link>
            <Link
              href="#recognition"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              Recognition
            </Link>
            <Link
              href="/refer"
              className="landing-nav-pill rounded-full border border-blue-300/60 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 px-6 py-2.5 text-sm font-bold tracking-wide text-slate-900 shadow-md sm:px-8 sm:text-base"
            >
              Refer
            </Link>
          </div>
        </nav>
      </header>

      <section className="animate-landing-reveal landing-delay-1 relative overflow-hidden border-y border-blue-200/35 bg-gradient-to-b from-white via-sky-50/80 to-indigo-100/60 py-8 md:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4] bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-transparent to-indigo-600/[0.06]" aria-hidden />
        <div className="relative z-10 mx-auto mb-6 max-w-7xl px-4">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent via-blue-400 to-indigo-500 sm:w-16" aria-hidden />
            <h2 className="text-center text-xl font-bold text-slate-900">Gallery</h2>
            <span className="h-px w-10 bg-gradient-to-l from-transparent via-blue-400 to-indigo-500 sm:w-16" aria-hidden />
          </div>
        </div>
        <div className="relative z-10 w-full overflow-hidden">
          <div className="flex w-max gap-4 animate-home-marquee-horizontal md:gap-6">
            {marqueeImages.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="landing-gallery-card w-[min(85vw,520px)] shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-blue-200/50 md:w-[300px]"
              >
                <Image
                  src={`/images/${img}`}
                  alt={`Institute gallery ${i + 1}`}
                  width={800}
                  height={450}
                  className="h-[200px] w-full object-cover sm:h-[260px] md:h-[300px]"
                  sizes="(max-width: 768px) 85vw, 600px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="institute-news" className="animate-landing-reveal landing-delay-2 scroll-mt-24">
        <div className="landing-brochure-band relative overflow-hidden py-4 md:py-5">
          <div className="pointer-events-none absolute inset-0 bg-white/[0.08]" aria-hidden />
          <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center rounded-full bg-white/95 px-10 py-3 shadow-xl shadow-blue-950/20 ring-2 ring-sky-100/90 backdrop-blur-md">
              <span className="text-base font-bold tracking-tight text-slate-900 md:text-lg">Institute News</span>
            </div>
          </div>
        </div>
        <div className="relative border-b border-blue-200/30 bg-gradient-to-b from-white via-blue-50/40 to-indigo-50/50 py-6 md:py-8">
          <div className="relative mx-auto h-[72px] max-w-4xl overflow-hidden px-4 md:h-[82px]">
            <div className="landing-marquee-fade-v animate-home-marquee-vertical space-y-8 text-center font-serif text-base font-bold leading-relaxed text-slate-900 md:text-lg">
              {marqueeNews.map((line, i) => (
                <p
                  key={i}
                  className="landing-news-line"
                  style={{ animationDelay: `-${(i % NEWS_LINES.length) * (22 / NEWS_LINES.length)}s` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Mission / intro / Acknowledgement–Disclaimer–Appeal — layout per institute brochure */}
      <section
        id="mission"
        className="animate-landing-reveal landing-delay-3 scroll-mt-24 border-b border-blue-200/25 bg-gradient-to-b from-slate-50/95 via-blue-50/50 to-indigo-100/70 font-sans text-slate-800"
      >
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-gradient-to-bl from-blue-400/25 to-indigo-800/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-900/15 via-indigo-800/20 to-violet-900/15 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
            {/* Row 1: three equal headline columns */}
            <div className="mb-10 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-3 md:gap-8 lg:gap-10">
              <div className="rounded-2xl border border-blue-100/80 bg-white/80 p-5 shadow-lg shadow-blue-500/10 backdrop-blur-md md:p-6">
                <h3 className="mb-3 text-center text-base font-bold text-slate-900 md:text-lg">Our Vision</h3>
                <p className="text-center text-sm leading-relaxed text-slate-800 md:text-[15px]">
                  Serving stakeholders is deemed service to government
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-100/80 bg-white/80 p-5 shadow-lg shadow-indigo-500/10 backdrop-blur-md md:border-x md:border-y md:border-blue-200/50 md:px-6 md:py-6 lg:px-8">
                <h3 className="mb-3 text-center text-base font-bold text-slate-900 md:text-lg">Our Vision</h3>
                <p className="text-center text-sm leading-relaxed text-slate-800 md:text-[15px]">
                  Serving stakeholders is deemed service to government
                </p>
              </div>
              <div className="rounded-2xl border border-violet-100/80 bg-white/80 p-5 shadow-lg shadow-violet-500/10 backdrop-blur-md md:p-6">
                <h3 className="mb-3 text-center text-base font-bold text-slate-900 md:text-lg">Our Mission</h3>
                <p className="text-center text-sm leading-relaxed text-slate-800 md:text-[15px]">
                  To uplift anyone &amp; everyone, assure their skills of functioning
                </p>
              </div>
            </div>

            {/* Row 2: single centered body (wide margins) */}
            <p className="mx-auto mb-12 max-w-4xl px-2 text-center text-sm leading-relaxed text-slate-800 md:mb-16 md:text-[15px]">
            The diversified class of Enrolled Tax Practitioners, persevered everywhere as the fundamental & foundation stones of every business activity,
exist from the ancient streams of Indian Taxation system. They are proposed and recognised as the non-litigant propagators of supportive
compliance under the respective statutes. The Institute of Chartered Tax Practitioners India (ICTPI) is formed to unite & transform these
unorganised and scattered Tax Practitioners, into a premier troupe of “Chartered Tax Practitioners.” ICTPI aims to confer a uniform qualification
& membership to protect their interest as a fraternity and to become value added professionals in nation building. ICTPI has developed a
qualification, which will be awarded by the Management & Entrepreneurship and Professionals Skill Council (MEPSC) duly approved by the
National Council for Vocational Education and Training (NCVET) under the aegis of Ministry of Skill Development and Entrepreneurship (MSDE),
Government of India.
              <span className="font-semibold text-slate-900">Institute of Chartered Tax Practitioners India (ICTPI)</span> has
              been formed to unite these practitioners into a professional group. Qualifications are awarded by the{" "}
              <span className="font-semibold text-slate-900">
                Management &amp; Entrepreneurship and Professional Skills Council (MEPSC)
              </span>
              , approved by the{" "}
              <span className="font-semibold text-slate-900">
                National Council for Vocational Education and Training (NCVET)
              </span>{" "}
              under the{" "}
              <span className="font-semibold text-slate-900">Ministry of Skill Development and Entrepreneurship (MSDE)</span>
              , Government of India.
            </p>

            {/* Row 3: three columns — centred titles, left-aligned copy */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-10">
              <div className="rounded-2xl border border-blue-100/80 bg-white/80 p-5 shadow-lg shadow-blue-500/10 backdrop-blur-md md:p-6">
                <h3 className="mb-4 text-center text-base font-bold text-slate-900 md:text-lg">Acknowledgement</h3>
                <div className="space-y-4 text-left text-sm leading-relaxed md:text-[15px]">
                Institute of Chartered Tax Practitioners India has outlined specific
requirements for membership eligibility. Accordingly to become a
member, one must:


3. Secure an enrolment licence to practice as a Tax Practitioner from the
respective tax department(s)
 

                  <ol className="list-outside list-decimal space-y-3 pl-5">
                    <li>
                    Complete the NCVET-approved Skill Qualification "Consultant:
                    Chartered Tax Practitioner"                   
                    </li>
                    <li>Obtain a qualification certificate from MEPSC awarded upon
                    successful completion of the course
                    </li>
                    <li>
                    Secure an enrolment licence to practice as a Tax Practitioner from the
                    respective tax department(s)                    </li>
                   
                  </ol>
                  <p>
                  By acknowledging these requirements, ICTPI ensures its members
possess the necessary expertise and credentials to provide tax
compliance services
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100/80 bg-white/80 p-5 shadow-lg shadow-indigo-500/10 backdrop-blur-md md:border-x md:border-y md:border-blue-200/50 md:px-6 md:py-6 lg:px-8">
                <h3 className="mb-4 text-center text-base font-bold text-slate-900 md:text-lg">Disclaimer</h3>
                <ul className="list-outside list-disc space-y-3 pl-5 text-left text-sm leading-relaxed md:text-[15px]">
                  <li>ICTPI is not affiliated with the Institute of Chartered Accountants of India (ICAI).</li>
                  <li>
                    ICTPI does not issue licences to practise as an Income-tax Practitioner, GST Practitioner, or Customs
                    Broker.
                  </li>
                  <li>
                  The courses offered by ICTPI is not an essential prerequisite for
obtaining any licenses from the respective departments/authorities; 
The scope of the course offered by the ICTPI is to enable vocational
training and does not automatically entitle the prospective student
to practice or enrol as a tax practitioner except as provided in the
respective statutes. 
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-violet-100/80 bg-white/80 p-5 shadow-lg shadow-violet-500/10 backdrop-blur-md md:p-6">
                <h3 className="mb-4 text-center text-base font-bold text-slate-900 md:text-lg">Appeal</h3>
                <p className="text-left text-sm leading-relaxed md:text-[15px]">
                The Institute has set up a 2000 sq.ft. head office named "TPI BHAVAN" at
Bengaluru. Apart from operative costs, rent ,salaries & office expenses,
institute need corpus to fund its capital expenditure such as building,
repairs, furniture - fixtures, equipment's, which requires additional
support. To achieve above objectives the institute requires resources in
terms of men and money. The Institute requests one and all to contribute
generously for its endeavour and support for the cause of fraternity!
(Donations to the Institute are eligible for 
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BrochureBlock id="recognition" title="Recognition &amp; credentials">
        <p className="mx-auto mb-8 max-w-2xl text-center">
          National registers, MEPSC alignment, and member resources — verify qualification listings and occupational standards using the links below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 not-italic">
          <a
            href="https://www.nqr.gov.in/qualifications/3521"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-recognition-btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 px-6 py-2.5 font-sans text-sm font-semibold text-slate-900 shadow-md ring-1 ring-blue-300/40 md:text-base"
          >
            National Qualification Register
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
          </a>
          <a
            href="https://www.mepsc.in/occupational_standar/entrepreneurship/"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-recognition-btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 px-6 py-2.5 font-sans text-sm font-semibold text-slate-900 shadow-md ring-1 ring-blue-300/40 md:text-base"
          >
            MEPSC occupational standards
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
          </a>
          <Link
            href="/login"
            className="landing-recognition-btn rounded-full bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 px-6 py-2.5 font-sans text-sm font-semibold text-slate-900 shadow-md ring-1 ring-blue-300/40 md:text-base"
          >
            Student login
          </Link>
        </div>
      </BrochureBlock>

      <div className="animate-landing-reveal landing-delay-6">
        <SiteFooter />
      </div>
    </div>
  );
}
