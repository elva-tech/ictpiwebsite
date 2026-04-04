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

/** Grey band + white pill title, then white body — matches Institute News / brochure PDF rhythm */
function BrochureBlock({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="bg-[#9e9e9e] py-4 md:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-white px-10 py-3 shadow-md">
            <span className="font-bold text-slate-900 text-base md:text-lg tracking-tight text-center">{title}</span>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-slate-200 py-8 md:py-11">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 font-serif text-[15px] md:text-[1.05rem] leading-[1.75] text-slate-800">
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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
      <header className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden shadow-md">
        <div
          className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white,transparent_45%),radial-gradient(circle_at_80%_80%,#a78bfa,transparent_40%)]"
          aria-hidden
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-1 items-center gap-5 md:gap-8 min-w-0">
            <div className="shrink-0">
              <Image
                src="/images/ICTPL_image.jpg"
                alt="ICTPI Logo"
                width={100}
                height={100}
                className="object-contain rounded-full drop-shadow-md"
                priority
              />
            </div>

            <div className="min-w-0 flex-1">
             
              <h1 className="font-heading-algerian mt-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
                INSTITUTE OF CHARTERED TAX PRACTITIONERS INDIA
              </h1>
              <p className="mt-3 text-emerald-300/95 font-semibold text-sm md:text-base">
                [A Professional Membership Body of Enrolled Tax Practitioners of India]
              </p>
              <p className="mt-2 text-sm md:text-[0.95rem] text-slate-200 leading-snug max-w-3xl">
                [An Industry-cum-Implementation Partner of Management &amp; Entrepreneurship and Professional Skills Council]
                <br />
                <span className="text-slate-300/95">
                  (MEPSC is a recognized Awarding body of National Council for Vocational Education and Training under the aegis of Ministry of Skill Development and Entrepreneurship, Government of India)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 lg:flex-col lg:items-end shrink-0">
            <SocialIconLinks className="justify-end" />
          </div>
        </div>

        <nav className="relative z-10 border-t border-white/10 bg-slate-950/35 backdrop-blur-sm py-3 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base uppercase tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              Home
            </Link>
            <Link
              href="#mission"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base uppercase tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              About
            </Link>
            <Link
              href="#institute-news"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base uppercase tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              News
            </Link>
            <Link
              href="/login"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              Student
            </Link>
            <Link
              href="#recognition"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base uppercase tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              Recognition
            </Link>
            <Link
              href="/refer"
              className="px-6 sm:px-8 py-2.5 rounded-full bg-[#e1bee7] text-slate-900 font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-[#ce93d8] transition-colors border border-purple-200/60"
            >
              Refer
            </Link>
          </div>
        </nav>
      </header>

      

      

      <section className="bg-white py-6 md:py-10 overflow-hidden border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h2 className="text-xl font-bold text-slate-900 text-center">Gallery</h2>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-4 md:gap-6 w-max animate-home-marquee-horizontal">
            {marqueeImages.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="shrink-0 w-[min(85vw,520px)] md:w-[300px] rounded-xl overflow-hidden shadow-md ring-1 ring-slate-200/80"
              >
                <Image
                  src={`/images/${img}`}
                  alt={`Institute gallery ${i + 1}`}
                  width={800}
                  height={450}
                  className="w-full h-[200px] sm:h-[260px] md:h-[300px] object-cover"
                  sizes="(max-width: 768px) 85vw, 600px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="institute-news" className="scroll-mt-24">
        <div className="bg-[#9e9e9e] py-4 md:py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-white px-10 py-3 shadow-md">
              <span className="font-bold text-slate-900 text-base md:text-lg tracking-tight">Institute News</span>
            </div>
          </div>
        </div>
        <div className="bg-white py-6 md:py-8 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 overflow-hidden h-[180px] md:h-[220px] relative">
            <div className="animate-home-marquee-vertical space-y-8 text-center font-bold text-slate-900 text-base md:text-lg leading-relaxed font-serif">
              {marqueeNews.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Mission / intro / Acknowledgement–Disclaimer–Appeal — layout per institute brochure */}
      <section
        id="mission"
        className="scroll-mt-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-200/90 font-sans text-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Row 1: three equal headline columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 mb-10 md:mb-12">
            <p className="text-center text-[11px] sm:text-xs md:text-[0.7rem] lg:text-sm font-bold uppercase leading-snug tracking-wide text-slate-900 px-1">
              Our Vision: Serving stakeholders is deemed service to government
            </p>
            <p className="text-center text-[11px] sm:text-xs md:text-[0.7rem] lg:text-sm font-bold uppercase leading-snug tracking-wide text-slate-900 px-1 md:border-x md:border-slate-300/80 md:px-3">
              Our Vision: Serving stakeholders is deemed service to government
            </p>
            <p className="text-center text-[11px] sm:text-xs md:text-[0.7rem] lg:text-sm font-bold uppercase leading-snug tracking-wide text-slate-900 px-1">
              Our Mission: To uplift anyone &amp; everyone, assure their skills of functioning
            </p>
          </div>

          {/* Row 2: single centered body (wide margins) */}
          <p className="mx-auto max-w-4xl text-center text-sm md:text-[15px] leading-relaxed text-slate-800 mb-12 md:mb-16 px-2">
            Enrolled Tax Practitioners are the foundation of business activity in the Indian taxation system. The{" "}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-10">
            <div>
              <h3 className="text-center font-bold text-slate-900 text-base md:text-lg mb-4">Acknowledgement</h3>
              <div className="text-sm md:text-[15px] leading-relaxed text-left space-y-4">
                <p>Membership is premised on the following:</p>
                <ol className="list-decimal list-outside pl-5 space-y-3">
                  <li>
                    Completion of the NCVET-approved Skill Qualification &quot;Consultant: Chartered Tax Practitioner.&quot;
                  </li>
                  <li>Obtaining the qualification certificate from MEPSC.</li>
                  <li>
                    Securing the enrolment licence to practise as a Tax Practitioner from the respective tax departments.
                  </li>
                </ol>
                <p>
                  ICTPI ensures that members possess the professional expertise necessary to serve stakeholders with
                  competence and integrity.
                </p>
              </div>
            </div>

            <div className="md:border-x md:border-slate-300/70 md:px-6 lg:px-8">
              <h3 className="text-center font-bold text-slate-900 text-base md:text-lg mb-4">Disclaimer</h3>
              <ul className="text-sm md:text-[15px] leading-relaxed text-left list-disc list-outside pl-5 space-y-3">
                <li>ICTPI is not affiliated with the Institute of Chartered Accountants of India (ICAI).</li>
                <li>
                  ICTPI does not issue licences to practise as an Income-tax Practitioner, GST Practitioner, or Customs
                  Broker.
                </li>
                <li>
                  Courses offered are not an essential prerequisite for obtaining licences from the authorities; they are
                  for vocational training and do not by themselves entitle a student to practise.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-center font-bold text-slate-900 text-base md:text-lg mb-4">Appeal</h3>
              <p className="text-sm md:text-[15px] leading-relaxed text-left">
                ICTPI has established a 2000 sq. ft. head office,{" "}
                <span className="font-semibold text-slate-900">TPI BHAVAN</span>, at Bengaluru. The Institute seeks
                financial support and donations towards capital expenditure — including building repairs, furniture, and
                allied needs. Donations are eligible for deduction under{" "}
                <span className="font-semibold text-slate-900">section 80G(5)</span> of the{" "}
                <span className="font-semibold text-slate-900">Income-tax Act, 1961</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BrochureBlock id="recognition" title="Recognition &amp; credentials">
        <p className="mb-8 text-center max-w-2xl mx-auto">
          National registers, MEPSC alignment, and member resources — verify qualification listings and occupational standards using the links below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 not-italic">
          <a
            href="https://www.nqr.gov.in/qualifications/3521"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#e1bee7] px-6 py-2.5 font-semibold text-slate-900 hover:bg-[#ce93d8] transition-colors inline-flex items-center gap-2 font-sans text-sm md:text-base"
          >
            National Qualification Register
            <ExternalLink className="w-4 h-4 opacity-80" aria-hidden />
          </a>
          <a
            href="https://www.mepsc.in/occupational_standar/entrepreneurship/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#e1bee7] px-6 py-2.5 font-semibold text-slate-900 hover:bg-[#ce93d8] transition-colors inline-flex items-center gap-2 font-sans text-sm md:text-base"
          >
            MEPSC occupational standards
            <ExternalLink className="w-4 h-4 opacity-80" aria-hidden />
          </a>
          <Link
            href="/login"
            className="rounded-full bg-[#e1bee7] px-6 py-2.5 font-semibold text-slate-900 hover:bg-[#ce93d8] transition-colors font-sans text-sm md:text-base"
          >
            Member login
          </Link>
        </div>
      </BrochureBlock>

      <SiteFooter />
    </div>
  );
}
