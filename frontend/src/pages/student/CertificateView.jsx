import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Printer,
} from "lucide-react";
import {
  useParams,
  Link,
} from "react-router-dom";

import { apiRequest } from "@services/api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificateView() {
  const { certificateId } =
    useParams();

  const [
    certificate,
    setCertificate,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCertificate() {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiRequest(
            `/certificates/${certificateId}`
          );

        if (!cancelled) {
          setCertificate(data);
        }
      } catch (err) {
        console.error(
          "Certificate view error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "We couldn't load this certificate."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-[1000px] rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Award
            size={42}
            className="mx-auto animate-pulse text-primary/40"
          />

          <p className="mt-4 text-sm text-slate-500">
            Preparing your certificate...
          </p>
        </div>
      </main>
    );
  }

  if (error || !certificate) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-[650px] rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Award size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-ink">
            Certificate unavailable
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            We couldn't find this certificate. It may not
            have been issued yet, the certificate number may
            be incorrect, or this certificate may no longer
            be available.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/certificates"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to My Certificates
            </Link>

            <Link
              to="/my-learning"
              className="inline-flex rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white">
      <div className="mx-auto max-w-[1000px]">
        {/* TOP ACTIONS */}

        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            to="/certificates"
            className="text-sm font-bold text-primary hover:underline"
          >
            ← Back to Certificates
          </Link>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            <Printer size={14} />
            Print Certificate
          </button>
        </div>

        {/* CERTIFICATE */}

        <section className="rounded-2xl border-8 border-double border-primary bg-white p-8 text-center shadow-xl sm:p-12 print:rounded-none print:border-8 print:shadow-none">
          <Award
            size={62}
            className="mx-auto text-primary"
          />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            OSTA E-Learning Platform
          </p>

          <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Certificate of Completion
          </h1>

          <p className="mt-8 text-sm text-slate-500">
            This certificate is proudly presented to
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
            {certificate.recipient_name}
          </h2>

          <div className="mx-auto mt-7 max-w-2xl">
            <p className="text-sm leading-7 text-slate-600">
              for successfully completing the course
            </p>

            <h3 className="mt-2 text-2xl font-bold text-ink">
              {certificate.course_title}
            </h3>
          </div>

          <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-bold text-primary">
            <CheckCircle2 size={17} />
            Successfully Completed
          </div>

          {certificate.score !== null && (
            <p className="mt-5 text-sm font-bold text-slate-600">
              Final Assessment Score:{" "}
              <span className="text-primary">
                {certificate.score}%
              </span>
            </p>
          )}

          {certificate.skills && (
            <div className="mx-auto mt-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills Covered
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {certificate.skills}
              </p>
            </div>
          )}

          <div className="mx-auto mt-10 grid max-w-2xl gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                Completion Date
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                {formatDate(
                  certificate.completion_date
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Certificate Number
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                {certificate.certificate_number}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="mx-auto h-px w-48 bg-slate-300" />

            <p className="mt-2 text-xs font-bold text-slate-500">
              OSTA E-Learning Platform
            </p>

            {certificate.issued_at && (
              <p className="mt-1 text-[11px] text-slate-400">
                Issued {formatDate(certificate.issued_at)}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}