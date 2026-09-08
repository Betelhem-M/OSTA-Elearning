import { Award, CheckCircle2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificateTemplate({
  recipientName = "Abebe Kebede",
  courseTitle = "Fundamentals of Web Development",
  certificateNumber = "OSTA-2026-000184",
  completionDate = "2026-09-09",
  issuedAt = "2026-09-09",
  score = null,
  skills = "HTML, CSS, JavaScript, responsive web design, and practical frontend development",
  demo = false,
}) {
  return (
    <section className="certificate-template relative overflow-hidden rounded-2xl border-8 border-double border-primary bg-white p-8 text-center shadow-xl sm:p-12 print:rounded-none print:shadow-none">
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-primary/20 print:inset-2" />

      <div className="relative">
        <Award size={62} className="mx-auto text-primary" />

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          OSTA Learning & Innovation Platform
        </p>

        <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
          Certificate of Completion
        </h1>

        {demo && (
          <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Example certificate · Demonstration only
          </span>
        )}

        <p className="mt-8 text-sm text-slate-500">
          This certificate is proudly presented to
        </p>

        <h2 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
          {recipientName}
        </h2>

        <div className="mx-auto mt-7 max-w-2xl">
          <p className="text-sm leading-7 text-slate-600">
            for successfully completing the course
          </p>
          <h3 className="mt-2 text-2xl font-bold text-ink">
            {courseTitle}
          </h3>
        </div>

        <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-bold text-primary">
          <CheckCircle2 size={17} />
          Successfully Completed
        </div>

        {score !== null && score !== undefined && (
          <p className="mt-5 text-sm font-bold text-slate-600">
            Final Assessment Score: <span className="text-primary">{score}%</span>
          </p>
        )}

        {skills && (
          <div className="mx-auto mt-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Skills Covered
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{skills}</p>
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-2xl gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Completion Date</p>
            <p className="mt-1 text-sm font-bold text-ink">{formatDate(completionDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Certificate Number</p>
            <p className="mt-1 text-sm font-bold text-ink">{certificateNumber}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <div className="mx-auto h-px w-48 bg-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-500">OSTA Platform Administrator</p>
          </div>
          <div>
            <div className="mx-auto h-px w-48 bg-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-500">Academic Oversight Reference</p>
          </div>
        </div>

        {issuedAt && (
          <p className="mt-5 text-[11px] text-slate-400">
            Issued {formatDate(issuedAt)}
          </p>
        )}
      </div>
    </section>
  );
}
