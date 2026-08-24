import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import AssignmentCard from "@components/assignment/AssignmentCard";
import SubmissionForm from "@components/assignment/SubmissionForm";
import FeedbackPanel from "@components/assignment/FeedbackPanel";

const API_URL = "http://localhost:5000/api";

export default function Assignment() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =========================
  // TOKEN
  // =========================

  function getToken() {
    return localStorage.getItem("osta_token");
  }

  // =========================
  // USER ID FROM JWT
  // =========================

  function getUserIdFromToken() {
    const token = getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.id;
    } catch (error) {
      console.error(
        "Could not read user ID from token:",
        error
      );

      return null;
    }
  }

  // =========================
  // LOAD ASSIGNMENT
  // =========================

  async function loadAssignment() {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/assignments/${assignmentId}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load assignment"
        );
      }

      setAssignment(data);
    } catch (err) {
      console.error(
        "Load assignment error:",
        err
      );

      setError(
        err.message || "Failed to load assignment"
      );
    }
  }

  // =========================
  // LOAD MY SUBMISSION
  // =========================

  async function loadSubmission() {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/assignments/${assignmentId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load submission"
        );
      }

      const userId = getUserIdFromToken();

      const mySubmission = Array.isArray(data)
        ? data.find(
            (item) =>
              Number(item.user_id) ===
              Number(userId)
          )
        : null;

      setSubmission(
        mySubmission || null
      );
    } catch (err) {
      console.error(
        "Load submission error:",
        err
      );
    }
  }

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (!assignmentId) {
      setError("Assignment ID is missing.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        await loadAssignment();
        await loadSubmission();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId]);

  // =========================
  // SUBMIT ASSIGNMENT
  // =========================

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
          "You are not logged in."
        );
      }

      if (!files || files.length === 0) {
        throw new Error(
          "Please attach at least one file."
        );
      }

      // =====================================
      // STEP 1:
      // CREATE THE SUBMISSION
      // =====================================

      const submitResponse = await fetch(
        `${API_URL}/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment,
          }),
        }
      );

      const submitData =
        await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(
          submitData.message ||
            "Failed to submit assignment"
        );
      }

      const createdSubmission =
        submitData.submission;

      // =====================================
      // STEP 2:
      // UPLOAD EACH FILE
      // =====================================

      for (const file of files) {
        const formData = new FormData();

        formData.append(
          "file",
          file
        );

        const uploadResponse =
          await fetch(
            `${API_URL}/assignments/submissions/${createdSubmission.id}/files`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

        const uploadData =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message ||
              `Failed to upload ${file.name}`
          );
        }
      }

      // =====================================
      // STEP 3:
      // RELOAD SUBMISSION
      // =====================================

      const submissionsResponse =
        await fetch(
          `${API_URL}/assignments/${assignmentId}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const submissionsData =
        await submissionsResponse.json();

      if (
        submissionsResponse.ok &&
        Array.isArray(submissionsData)
      ) {
        const userId =
          getUserIdFromToken();

        const mySubmission =
          submissionsData.find(
            (item) =>
              Number(item.user_id) ===
              Number(userId)
          );

        setSubmission(
          mySubmission ||
            createdSubmission
        );
      } else {
        setSubmission(
          createdSubmission
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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm text-slate-500">
            Loading assignment...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !assignment) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <p className="text-sm font-semibold text-red-500">
            {error ||
              "Assignment not found."}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // STATUS
  // =========================

  const status = submission
    ? submission.status === "graded"
      ? "graded"
      : "submitted"
    : "not_submitted";

  // =========================
  // FORMAT ASSIGNMENT
  // =========================

  const currentAssignment = {
    id: assignment.id,

    courseId:
      assignment.course_id,

    courseTitle:
      assignment.course_title ||
      "Course",

    title: assignment.title,

    dueDate: assignment.due_date
      ? new Date(
          assignment.due_date
        ).toLocaleDateString()
      : "No due date",

    dueTime: assignment.due_date
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
      assignment.points,

    status,

    instructions:
      assignment.instructions
        ? Array.isArray(
            assignment.instructions
          )
          ? assignment.instructions
          : assignment.instructions
              .split("\n")
              .filter(Boolean)
        : [],

    allowedFileTypes:
      assignment.allowed_file_types ||
      ".pdf, .zip",

    maxFileSizeMB:
      assignment.max_file_size_mb ||
      10,

    rubric:
      assignment.rubrics || [],
  };

  // =========================
  // FEEDBACK
  // =========================

  const feedback =
    submission &&
    submission.status === "graded"
      ? {
          score:
            Number(
              submission.score
            ) || 0,

          maxScore:
            assignment.points,

          gradedDate:
            submission.graded_at
              ? new Date(
                  submission.graded_at
                ).toLocaleDateString()
              : "",

          instructorComment:
            submission.instructor_comment ||
            "No instructor feedback provided.",

          rubricScores: [],
        }
      : null;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">

      {/* BACK TO COURSE */}

      <Link
        to={`/courses/${assignment.course_id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Back to course
      </Link>

      {/* ASSIGNMENT HEADER */}

      <AssignmentCard
        assignment={
          currentAssignment
        }
      />

      {/* INSTRUCTIONS */}

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        <h2 className="text-sm font-bold text-ink">
          Instructions
        </h2>

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

                {line}
              </li>
            )
          )}
        </ul>

        {/* RUBRIC */}

        <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
          Grading Rubric
        </h3>

        <div className="mt-2 space-y-1.5">
          {currentAssignment.rubric.map(
            (row) => (
              <div
                key={
                  row.id ||
                  row.criterion
                }
                className="flex justify-between text-xs text-slate-600"
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
      </div>

      {/* ERROR DURING SUBMISSION */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* SUBMISSION */}

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
              Assignment submitted
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your assignment was
              submitted successfully.
              You&apos;ll be notified
              when it&apos;s graded.
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
    </div>
  );
}