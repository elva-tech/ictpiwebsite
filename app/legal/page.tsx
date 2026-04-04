import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        <p className="text-sm">
          <Link href="/" className="text-violet-700 hover:underline">
            ← Back to home
          </Link>
        </p>

        <section id="disclaimer" className="scroll-mt-24">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Disclaimer</h1>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
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
        </section>

        <section id="privacy" className="scroll-mt-24">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-sm leading-relaxed">
            ICTPI respects your privacy. Personal data collected through the portal or enquiry forms is used only for
            membership, academic, and statutory purposes. For details or requests, contact{" "}
            <a href="mailto:info@ictpi.in" className="text-violet-700 underline">
              info@ictpi.in
            </a>
            .
          </p>
        </section>

        <section id="refund" className="scroll-mt-24">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Refund Policy</h1>
          <p className="text-sm leading-relaxed">
            Refunds, if applicable, are governed by the enrolment terms communicated at the time of registration. Please
            write to{" "}
            <a href="mailto:info@ictpi.in" className="text-violet-700 underline">
              info@ictpi.in
            </a>{" "}
            with your reference number for any refund-related query.
          </p>
        </section>

        <section id="terms" className="scroll-mt-24">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm leading-relaxed">
            Use of this website and the student portal is subject to institute rules, examination regulations, and
            applicable law. ICTPI may update these terms; continued use constitutes acceptance of the current version.
          </p>
        </section>
      </div>
    </div>
  );
}
