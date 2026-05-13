import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

const NEWS = [
  {
    date: "April 18, 2026",
    title: "ICTPI Migrates to Unified Domain",
    desc: "All ICTPI services including institute portal, LMS, and verification are now unified in one place.",
  },
  {
    date: "April 10, 2026",
    title: "Q2 2026 CTP Examination Window Opens",
    desc: "Members can now schedule CTP exams at available centers and follow timelines from the exam information page.",
  },
  {
    date: "March 28, 2026",
    title: "Budget 2026 Key Updates for Practitioners",
    desc: "Summary of policy and compliance changes relevant for tax practitioners and working professionals.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-[#0a1f44] text-slate-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-amber-300" /> +91 80 4093 1234</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-amber-300" /> info@ictpi.ac</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-amber-300" /> TPI Bhavan, Bengaluru</span>
          </div>
          <Link href="/login" className="text-amber-200 hover:text-amber-100">Member Login</Link>
        </div>
      </div>

      <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-4 py-2 text-center text-xs">
        <span className="inline-flex items-center gap-2 text-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
          <strong>Important:</strong> All ICTPI services are now unified on this website.
        </span>
      </div>

      <header className="relative overflow-hidden bg-gradient-to-br from-[#061534] via-[#0a1f44] to-[#102a5c] text-white">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_15%_20%,#fbbf24,transparent_35%),radial-gradient(circle_at_80%_20%,#60a5fa,transparent_30%)]" />
        <nav className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Image src="/images/ICTPL_image.jpg" alt="ICTPI Logo" width={64} height={64} className="object-contain" />
              <div>
                <p className="text-xl font-semibold">ICTPI</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-amber-300">Institute of Chartered Tax Practitioners India</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <Link href="#about" className="text-sm text-white/90 hover:text-white">About</Link>
              <Link href="#programs" className="text-sm text-white/90 hover:text-white">Programs</Link>
              <Link href="#news" className="text-sm text-white/90 hover:text-white">News</Link>
              <Link href="/login" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">Login</Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
              <GraduationCap className="h-4 w-4" /> India's First Chartered Tax Practitioner Body
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Shaping the Future of <span className="text-amber-300">Tax Practitioners</span> in India
            </h1>
            <p className="mt-4 max-w-xl text-sm text-blue-100 md:text-base">
              A unified platform for professional education, certification, LMS access, exam information, and member services.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/results" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white">
                Exam Information
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-semibold">Unified Services Hub</h3>
              <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-[10px] tracking-[0.14em] text-amber-300">ICTPI.AC</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/50">LMS Portal</Link>
              <Link href="/results" className="rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/50">Exam Information</Link>
              <Link href="/courses/business" className="rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/50">Programs</Link>
              <Link href="/certificates" className="rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-300/50">Certificates</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recognised &amp; Affiliated With</p>
          <div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold text-slate-700 md:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Government of India</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">MEPSC</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">NSDC</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Skill India</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">NCVET</div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">About the Institute</p>
            <h2 className="text-3xl font-semibold text-[#0a1f44]">India's First Body of Chartered Tax Practitioners</h2>
            <p className="mt-4 text-slate-700">ICTPI unites, trains, and elevates India's tax practitioner community with structured learning and recognized qualifications.</p>
            <p className="mt-3 text-slate-700">Through CTP pathways, LMS tools, and verification systems, ICTPI builds trusted professionals for the compliance ecosystem.</p>
            <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0a1f44] px-5 py-2.5 text-sm font-semibold text-white">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-[#0a1f44]">Our Mission</h3><p className="mt-2 text-sm text-slate-600">To empower tax practitioners through structured education and ethical practice.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-[#0a1f44]">Our Vision</h3><p className="mt-2 text-sm text-slate-600">To build a nationally recognized community of competent practitioners.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-[#0a1f44]">Core Values</h3><p className="mt-2 text-sm text-slate-600">Integrity, continuous learning, professionalism, and public service.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-[#0a1f44]">Recognition</h3><p className="mt-2 text-sm text-slate-600">Aligned to recognized qualification and assessment standards.</p></div>
          </div>
        </div>
      </section>

      <section id="programs" className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">What We Offer</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#0a1f44]">Three Pillars, One Platform</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><GraduationCap className="h-6 w-6 text-[#0a1f44]" /><h3 className="mt-3 text-lg font-semibold">Professional Education</h3><p className="mt-2 text-sm text-slate-600">Structured and practical pathways for tax professionals.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><BookOpen className="h-6 w-6 text-[#0a1f44]" /><h3 className="mt-3 text-lg font-semibold">Member LMS Portal</h3><p className="mt-2 text-sm text-slate-600">Access learning material, schedules, and assessments.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><FileText className="h-6 w-6 text-[#0a1f44]" /><h3 className="mt-3 text-lg font-semibold">UDIN Verification</h3><p className="mt-2 text-sm text-slate-600">Transparent record verification for institutions and stakeholders.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a1f44] py-14 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 text-center sm:px-6 md:grid-cols-4 lg:px-8">
          <div><p className="text-3xl font-semibold text-amber-300">12000+</p><p className="text-sm text-blue-100">Active Members</p></div>
          <div><p className="text-3xl font-semibold text-amber-300">450+</p><p className="text-sm text-blue-100">Exam Centres</p></div>
          <div><p className="text-3xl font-semibold text-amber-300">98%</p><p className="text-sm text-blue-100">Pass Rate</p></div>
          <div><p className="text-3xl font-semibold text-amber-300">28</p><p className="text-sm text-blue-100">States Covered</p></div>
        </div>
      </section>

      <section id="news" className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">News &amp; Announcements</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#0a1f44]">Stay Informed</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {NEWS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs text-slate-500">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#0a1f44]">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-3xl bg-gradient-to-r from-[#061534] to-[#102a5c] px-6 py-10 text-white sm:px-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Ready to elevate your tax practice?</h2>
            <p className="mt-3 text-blue-100">Join professionals who trust ICTPI for recognized pathways and member growth.</p>
          </div>
          <div className="flex items-center justify-start gap-3 lg:justify-end">
            <Link href="/login" className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900">Apply Now</Link>
            <Link href="/refer" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold">Talk to Advisor</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#050d22] px-4 py-12 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-lg font-semibold text-white">ICTPI</h4>
            <p className="mt-3 text-sm">Institute of Chartered Tax Practitioners India — unified portal for learning and member services.</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">Institute</h5>
            <ul className="mt-3 space-y-2 text-sm"><li>About</li><li>News</li><li>Contact</li></ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">Programs</h5>
            <ul className="mt-3 space-y-2 text-sm"><li>CTP</li><li>CTPR</li><li>Admissions</li></ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">Member Services</h5>
            <ul className="mt-3 space-y-2 text-sm"><li>LMS Login</li><li>Exam Information</li><li>Certificates</li></ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4 text-xs text-slate-400">© 2026 Institute of Chartered Tax Practitioners India. All rights reserved.</p>
      </footer>
    </div>
  );
}
