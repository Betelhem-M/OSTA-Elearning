import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Upload,
  AlertCircle,
} from "lucide-react";

import AssignmentCard from "@components/assignment/AssignmentCard";
import SubmissionForm from "@components/assignment/SubmissionForm";
import FeedbackPanel from "@components/assignment/FeedbackPanel";

import { apiRequest } from "@services/api";

const API_URL =
  "http://localhost:5000/api";

// =====================================================
// HELPERS
// =====================================================

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =====================================================
// PAGE
// =====================================================

export default function Assignment() {
  const { assignmentId } =
    useParams();

  const [assignment, setAssignment] =
    useState(null);

  const [submission, setSubmission] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // TOKEN
  // =====================================================

  function getToken() {
    return localStorage.getItem(
      "osta_token"
    );
  }

  // =====================================================
  // LOAD ASSIGNMENT
  // =====================================================

  async function loadAssignment() {
    const data =
      await apiRequest(
        `/assignments/${assignmentId}`
      );

    setAssignment(data);
  }

  // =====================================================
  // LOAD MY SUBMISSION
  // =====================================================

  async function loadSubmission() {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Please log in to view your assignment."
      );
    }

    const data =
      await apiRequest(
        `/assignments/${assignmentId}/my-submission`,
        {
          token,
        }
      );

    setSubmission(
      data || null
    );
  }

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadAssignment(),
        loadSubmission(),
      ]);
    } catch (err) {
      console.error(
        "Assignment load error:",
        err
      );

      setAssignment(null);

      setError(
        err.message ||
          "We couldn't load this assignment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!assignmentId) {
      setError(
        "This assignment link is incomplete."
      );

      setLoading(false);
      return;
    }

    loadData();
  }, [assignmentId]);

  // =====================================================
  // SUBMIT ASSIGNMENT
  // =====================================================

  async function handleSubmit({
    files,
    comment,
  }) {
    try {
      setSubmitting(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (
        !files ||
        files.length === 0
      ) {
        throw new Error(
          "Attach at least one file before submitting."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "comment",
        comment || ""
      );

      files.forEach((file) => {
        formData.append(
          "files",
          file
        );
      });

      const response =
        await fetch(
          `${API_URL}/assignments/${assignmentId}/submit`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "osta_token"
        );

        localStorage.removeItem(
          "osta_user"
        );

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit assignment."
        );
      }

      setSubmission(
        data.submission ||
          null
      );

      // Refresh the saved submission
      // so all returned information is current.
      try {
        await loadSubmission();
      } catch (refreshError) {
        console.error(
          "Refresh submission error:",
          refreshError
        );
      }
    } catch (err) {
      console.error(
        "Submit assignment error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit assignment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-10 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#0F172A] px-6 py-8 sm:px-8">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-white/10" />

            <div className="mt-5 h-3 w-32 animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-8 max-w-md animate-pulse rounded bg-white/10" />

            <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-white/10" />
          </div>

          <div className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ASSIGNMENT NOT AVAILABLE
  // =====================================================

  if (!assignment) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-10 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* HERO */}

          <div className="relative overflow-hidden bg-[#0F172A] px-6 py-8 text-white sm:px-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

            <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <FileText size={24} />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                OSTA Assignments
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Assignment unavailable
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                We couldn't load this assignment right now.
                It may have been removed, is no longer available,
                or the link you followed may be outdated.
              </p>
            </div>
          </div>

          {/* CONTENT */}

          <div className="p-6 sm:p-8">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <AlertCircle
                    size={18}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    What may have happened?
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The assignment may have been removed,
                    unpublished, changed by your instructor,
                    or the link may no longer point to a valid
                    assignment.
                  </p>
                </div>
              </div>
            </div>

            {/* DETAILS */}

            {error && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Details
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {error}
                </p>
              </div>
            )}

            {/* GUIDANCE */}

            <div className="mt-6">
              <h2 className="text-sm font-bold text-ink">
                What you can do
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                    1
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Try loading it again
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The assignment may have just been updated.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                    2
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Check My Learning
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Open your enrolled courses and select the
                      assignment directly from the course.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                    3
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Contact your instructor
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      If the assignment should be available,
                      your instructor can confirm its status.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                Try Again
              </button>

              <Link
                to="/my-learning"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Back to My Learning
              </Link>

              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Explore Courses
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Your work and submissions are not affected by
              this message. If you believe this is an error,
              please contact your course instructor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATUS
  // =====================================================

  const status =
    submission?.status ===
    "graded"
      ? "graded"
      : submission
        ? "submitted"
        : "not_submitted";

  // =====================================================
  // ASSIGNMENT DATA FOR COMPONENTS
  // =====================================================

  const currentAssignment = {
    id: assignment.id,

    courseId:
      assignment.course_id,

    courseTitle:
      assignment.course_title ||
      "Course",

    title:
      assignment.title,

    dueDate:
      assignment.due_date
        ? formatDate(
            assignment.due_date
          )
        : "No due date",

    dueTime:
      assignment.due_date
        ? new Date(
            assignment.due_date
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "",

    points:
      assignment.points ||
      100,

    status,

    instructions:
      assignment.instructions
        ? Array.isArray(
            assignment.instructions
          )
          ? assignment.instructions
          : assignment.instructions
              .split("\n")
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean)
        : [],

    allowedFileTypes:
      assignment.allowed_file_types ||
      ".py, .zip, .pdf",

    maxFileSizeMB:
      assignment.max_file_size_mb ||
      10,

    rubric:
      Array.isArray(
        assignment.rubrics
      )
        ? assignment.rubrics
        : [],
  };

  // =====================================================
  // FEEDBACK
  // =====================================================

  const feedback =
    submission &&
    submission.status ===
      "graded"
      ? {
          score:
            submission.score,

          maxScore:
            assignment.points ||
            100,

          gradedDate:
            submission.graded_at
              ? formatDateTime(
                  submission.graded_at
                )
              : "",

          instructorComment:
            submission.instructor_comment ||
            "No instructor feedback was provided.",

          rubricScores: [],
        }
      : null;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">
      {/* =================================================
          BACK
      ================================================= */}

      <Link
        to={`/courses/${assignment.course_id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Back to course
      </Link>

      {/* =================================================
          HEADER
      ================================================= */}

      <AssignmentCard
        assignment={
          currentAssignment
        }
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-bold text-amber-800">
                We couldn't complete that action
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      {assignment.description && (
        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-ink">
            About this assignment
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
            {
              assignment.description
            }
          </p>
        </section>
      )}

      {/* =================================================
          INSTRUCTIONS
      ================================================= */}

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-ink">
          Instructions
        </h2>

        {currentAssignment.instructions
          .length > 0 ? (
          <ul className="mt-3 space-y-2">
            {currentAssignment.instructions.map(
              (line, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm leading-6 text-slate-600"
                >
                  <span className="text-primary">
                    •
                  </span>

                  <span>{line}</span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            No additional instructions were provided.
          </p>
        )}

        {/* RUBRIC */}

        {currentAssignment.rubric
          .length > 0 && (
          <>
            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">
              Grading Rubric
            </h3>

            <div className="mt-2 space-y-2">
              {currentAssignment.rubric.map(
                (row) => (
                  <div
                    key={
                      row.id ||
                      row.criterion
                    }
                    className="flex justify-between gap-4 text-xs text-slate-600"
                  >
                    <span>
                      {row.criterion}
                    </span>

                    <span className="font-semibold">
                      {row.points} pts
                    </span>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* =================================================
          EXISTING SUBMISSION
      ================================================= */}

      {submission && (
        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={21}
                className="text-primary"
              />

              <div>
                <h2 className="text-sm font-bold text-ink">
                  Your Submission
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Submitted{" "}
                  {formatDateTime(
                    submission.submitted_at
                  )}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                status ===
                "graded"
                  ? "bg-green-50 text-green-600"
                  : "bg-primary-light text-primary"
              }`}
            >
              {status ===
              "graded"
                ? "Graded"
                : "Submitted"}
            </span>
          </div>

          {/* COMMENT */}

          {submission.comment && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Your Comment
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {
                  submission.comment
                }
              </p>
            </div>
          )}

          {/* FILES */}

          {Array.isArray(
            submission.files
          ) &&
            submission.files.length >
              0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Submitted Files
                </p>

                <div className="mt-2 space-y-2">
                  {submission.files.map(
                    (file) => (
                      <div
                        key={
                          file.id ||
                          file.original_name ||
                          file.stored_name
                        }
                        className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
                      >
                        <FileText
                          size={16}
                          className="shrink-0 text-primary"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {
                              file.original_name
                            }
                          </p>

                          {file.file_size && (
                            <p className="text-[11px] text-slate-400">
                              {(
                                Number(
                                  file.file_size
                                ) /
                                1024
                              ).toFixed(
                                1
                              )}{" "}
                              KB
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </section>
      )}

      {/* =================================================
          SUBMISSION AREA
      ================================================= */}

      <div className="mt-6">
        {/* NOT SUBMITTED */}

        {status ===
          "not_submitted" && (
          <SubmissionForm
            assignment={
              currentAssignment
            }
            onSubmit={
              handleSubmit
            }
            submitting={
              submitting
            }
          />
        )}

        {/* SUBMITTED */}

        {status ===
          "submitted" && (
          <div className="rounded-2xl border border-primary/30 bg-primary-light p-6 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto text-primary"
            />

            <p className="mt-3 text-sm font-bold text-ink">
              Assignment submitted successfully
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your work has been sent to the instructor.
              You will receive a notification when it is graded.
            </p>
          </div>
        )}

        {/* GRADED */}

        {status ===
          "graded" &&
          feedback && (
            <FeedbackPanel
              feedback={
                feedback
              }
            />
          )}
      </div>

      {/* =================================================
          DEADLINE / SCORE INFORMATION
      ================================================= */}

      {status !==
        "graded" && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock3
              size={15}
              className="text-primary"
            />

            {assignment.due_date
              ? `Due ${formatDateTime(
                  assignment.due_date
                )}`
              : "No due date set"}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Maximum score:{" "}
            {assignment.points ||
              100}{" "}
            points
          </p>
        </div>
      )}

      {/* =================================================
          SUBMITTED STATUS INFORMATION
      ================================================= */}

      {status ===
        "submitted" && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Upload
              size={15}
              className="text-primary"
            />

            Submission received
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Your instructor can now review and grade your work.
            Your notification center will be updated when feedback
            is available.
          </p>
        </div>
      )}
    </div>
  );
}