import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Circle,
  Eye,
  GraduationCap,
  LockKeyhole,
  Printer,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

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

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCertificates() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/certificates/my");

        if (!cancelled) {
          setCertificates(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error("Certificates error:", err);

        if (!cancelled) {
          setError(
            err.message ||
              "We couldn't load your certificates."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCertificates();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-12 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <Award
              size={42}
              className="mx-auto animate-pulse text-primary/40"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading your achievements...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        {/* HEADER */}

        <section className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-7 text-white shadow-lg sm:p-9">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />

          <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap size={23} />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                OSTA Achievements
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              Your Certificates
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Celebrate the skills you have developed through
              your learning journey. Your official OSTA
              certificates will appear here after you
              successfully complete the required assessments.
            </p>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* NO CERTIFICATES */}

        {certificates.length === 0 ? (
          <div className="mt-7">
            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative max-w-3xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Award size={28} />
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles size={14} />
                  Your next achievement
                </div>

                <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                  Your certificate is waiting for you.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Every completed course is an opportunity to
                  demonstrate what you have learned. Finish the
                  required lessons and successfully pass the
                  assessment to earn an official OSTA certificate
                  recognizing your achievement.
                </p>
              </div>

              <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={19}
                      className="text-primary"
                    />

                    <p className="text-sm font-bold text-ink">
                      Complete lessons
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Finish all required lessons in your course.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={19}
                      className="text-primary"
                    />

                    <p className="text-sm font-bold text-ink">
                      Pass assessment
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Demonstrate your understanding by passing
                    the required quiz or assessment.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Award
                      size={19}
                      className="text-primary"
                    />

                    <p className="text-sm font-bold text-ink">
                      Earn certificate
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your certificate becomes available once
                    the requirements are verified.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-ink">
                    Certificate not unlocked yet
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Once you complete the required course
                    content and pass its assessment, OSTA will
                    verify your achievement and make your
                    certificate available here.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Circle
                    size={17}
                    className="text-slate-300"
                  />

                  <span className="text-xs font-semibold text-slate-600">
                    Keep learning — your achievement is ahead.
                  </span>
                </div>
              </div>

              <Link
                to="/my-learning"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                Continue Learning
              </Link>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
              <h3 className="text-sm font-bold text-ink">
                How your certificate works
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                OSTA certificates are tied to your actual
                learning progress. A certificate is not created
                simply because you enrolled in a course. Your
                lesson completion and assessment results are
                verified before the certificate is issued.
              </p>
            </section>
          </div>
        ) : (
          /* EARNED CERTIFICATES */
          <div className="mt-7">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-ink">
                Earned Certificates
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {certificates.length} certificate
                {certificates.length === 1 ? "" : "s"} earned
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative overflow-hidden bg-primary p-6 text-white">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                    <div className="relative">
                      <Award size={34} />

                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/70">
                        OSTA Certificate
                      </p>

                      <h2 className="mt-1 text-xl font-extrabold">
                        Course Completion
                      </h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-ink">
                      {certificate.course_title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Awarded to{" "}
                      <strong>
                        {certificate.recipient_name}
                      </strong>
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-500">
                      <div className="flex justify-between gap-4">
                        <span>Certificate number</span>

                        <strong className="text-right text-slate-700">
                          {certificate.certificate_number}
                        </strong>
                      </div>

                      <div className="flex justify-between">
                        <span>Completion date</span>

                        <strong className="text-slate-700">
                          {formatDate(
                            certificate.completion_date
                          )}
                        </strong>
                      </div>

                      {certificate.score !== null && (
                        <div className="flex justify-between">
                          <span>Assessment score</span>

                          <strong className="text-primary">
                            {certificate.score}%
                          </strong>
                        </div>
                      )}
                    </div>

                    {certificate.skills && (
                      <div className="mt-5">
                        <p className="text-xs font-bold text-ink">
                          Skills Covered
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {certificate.skills}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <Link
                        to={`/certificates/${certificate.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
                      >
                        <Eye size={14} />
                        View Certificate
                      </Link>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
                      >
                        <Printer size={14} />
                        Print
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}