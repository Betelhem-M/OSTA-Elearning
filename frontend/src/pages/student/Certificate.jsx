import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Printer, Copy, Check } from "lucide-react";
import { certificate, otherCertificates } from "@mocks/certificateData";
import CertificatePreview from "@components/certificate/CertificatePreview";
import CertificateCard from "@components/certificate/CertificateCard";
import {
  buildShareUrl,
  openShareWindow,
  copyToClipboard,
} from "@utils/sharing";

export default function Certificate() {
  useParams(); // certificateId — this build has one real certificate
  const [copyStatus, setCopyStatus] = useState("idle");

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    const success = await copyToClipboard(window.location.href);
    setCopyStatus(success ? "copied" : "error");
    setTimeout(() => setCopyStatus("idle"), 1800);
  }

  function handleLinkedInShare() {
    // LinkedIn's certification-add deep link, pre-filled from the certificate data.
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: certificate.courseName,
      organizationName: "Oromia Science and Technology Authority (OSTA)",
      certUrl: window.location.href,
    });
    openShareWindow(
      `https://www.linkedin.com/profile/add?${params.toString()}`,
    );
  }

  function handleTwitterShare() {
    openShareWindow(
      buildShareUrl(
        "twitter",
        window.location.href,
        `I just earned my ${certificate.courseName} certificate from OSTA! 🎓`,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 lg:px-8">
      <Link
        to={`/courses/${certificate.courseId}`}
        className="mb-4 inline-block text-xs font-bold text-primary hover:underline"
      >
        ← Back to course
      </Link>

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
        >
          <Download size={15} /> Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <Printer size={15} /> Print
        </button>
        <button
          onClick={handleLinkedInShare}
          className="flex items-center gap-2 rounded-lg bg-[#0a66c2] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Share on LinkedIn
        </button>
        <button
          onClick={handleTwitterShare}
          className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Share on X
        </button>
        <button
          onClick={handleCopyLink}
          className="relative flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary-light"
        >
          {copyStatus === "copied" ? <Check size={15} /> : <Copy size={15} />}
          {copyStatus === "copied" ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="mt-6">
        <CertificatePreview certificate={certificate} />
      </div>

      <section className="mt-8 print:hidden">
        <h2 className="text-sm font-bold text-ink">Skills Demonstrated</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {certificate.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 print:hidden">
        <h2 className="text-sm font-bold text-ink">Other Certificates</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {otherCertificates.map((item) => (
            <CertificateCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
