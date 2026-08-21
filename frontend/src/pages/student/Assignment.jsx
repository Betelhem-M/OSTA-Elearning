import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  assignment as assignmentData,
  gradedFeedback,
} from "@mocks/assignmentData";
import AssignmentCard from "@components/assignment/AssignmentCard";
import SubmissionForm from "@components/assignment/SubmissionForm";
import FeedbackPanel from "@components/assignment/FeedbackPanel";

export default function Assignment() {
  useParams(); // assignmentId — this build has one real assignment

  const [status, setStatus] = useState(assignmentData.status);
  const [submission, setSubmission] = useState(null);

  function handleSubmit({ files, comment }) {
    setSubmission({ files, comment, submittedAt: new Date().toLocaleString() });
    setStatus("submitted");
  }

  const currentAssignment = { ...assignmentData, status };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 lg:px-8">
      <Link
        to={`/courses/${assignmentData.courseId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ArrowLeft size={14} /> Back to course
      </Link>

      <AssignmentCard assignment={currentAssignment} />

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <h2 className="text-sm font-bold text-ink">Instructions</h2>
        <ul className="mt-3 space-y-2">
          {assignmentData.instructions.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6 text-slate-600">
              <span className="text-primary">•</span> {line}
            </li>
          ))}
        </ul>

        <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">
          Grading Rubric
        </h3>
        <div className="mt-2 space-y-1.5">
          {assignmentData.rubric.map((row) => (
            <div
              key={row.criterion}
              className="flex justify-between text-xs text-slate-600"
            >
              <span>{row.criterion}</span>
              <span className="font-semibold">{row.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {status === "not_submitted" && (
          <SubmissionForm assignment={assignmentData} onSubmit={handleSubmit} />
        )}

        {status === "submitted" && (
          <div className="rounded-2xl border border-primary/30 bg-primary-light p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-primary" />
            <p className="mt-3 text-sm font-bold text-ink">
              Assignment submitted
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {submission?.files.length} file
              {submission?.files.length === 1 ? "" : "s"} submitted on{" "}
              {submission?.submittedAt}. You'll be notified when it's graded.
            </p>
            {/* Demo-only control since there's no real grading backend in this build */}
            <button
              onClick={() => setStatus("graded")}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              (Demo) Simulate instructor grading it
            </button>
          </div>
        )}

        {status === "graded" && <FeedbackPanel feedback={gradedFeedback} />}
      </div>
    </div>
  );
}
