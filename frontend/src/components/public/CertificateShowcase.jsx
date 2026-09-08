import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CertificateTemplate from "@components/certificate/CertificateTemplate";

export default function CertificateShowcase() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-10">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Certificate of completion</p>
        <h2 className="mt-2 text-2xl font-black text-ink">The certificate students receive after completing a course</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">This example uses the same certificate template that students see when they earn a certificate. The name, course, completion date, score, and certificate number are filled from the student's real record.</p>
      </div>

      <CertificateTemplate demo />

      <div className="mt-6 flex justify-center">
        <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover">
          Start learning and earn your certificate
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
