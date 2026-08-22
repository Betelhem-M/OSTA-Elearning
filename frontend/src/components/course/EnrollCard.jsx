import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Copy, Check, PlayCircle } from "lucide-react";
import {
  buildShareUrl,
  openShareWindow,
  copyToClipboard,
} from "@utils/sharing";
import { useAuth } from "@context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function EnrollCard({ course }) {
  const { user, token, isAuthenticated } = useAuth();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");

  useEffect(() => {
    async function checkEnrollment() {
      if (!isAuthenticated || !token || !course?.id) {
        setIsEnrolled(false);
        setIsCheckingEnrollment(false);
        return;
      }

      try {
        setIsCheckingEnrollment(true);
        setEnrollmentError("");

        const response = await fetch(`${API_URL}/enrollments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to check enrollment"
          );
        }

        const enrolled = data.some(
          (enrollment) =>
            Number(enrollment.course_id) === Number(course.id)
        );

        setIsEnrolled(enrolled);
      } catch (error) {
        console.error("Check enrollment error:", error);
        setEnrollmentError("");
      } finally {
        setIsCheckingEnrollment(false);
      }
    }

    checkEnrollment();
  }, [course?.id, token, isAuthenticated]);

  async function handleEnroll() {
    if (!isAuthenticated || !token) {
      setEnrollmentError("Please log in before enrolling in a course.");
      return;
    }

    try {
      setIsEnrolling(true);
      setEnrollmentError("");

      const response = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to enroll in course"
        );
      }

      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment error:", error);
      setEnrollmentError(
        error.message || "Failed to enroll in course"
      );
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleCopyLink() {
    const success = await copyToClipboard(window.location.href);

    setCopyStatus(success ? "copied" : "error");

    setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);
  }

  function handleShare(network) {
    openShareWindow(
      buildShareUrl(
        network,
        window.location.href,
        course.title
      )
    );
  }

  const displayPrice =
    Number(course.price) === 0
      ? "FREE"
      : course.price;

  return (
    <aside className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="text-center">
        <p className="text-3xl font-extrabold text-primary">
          {displayPrice}
        </p>

        <p className="text-xs text-slate-400">
          Full lifetime access
        </p>
      </div>

      {isCheckingEnrollment ? (
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary/60 text-sm font-bold text-white"
        >
          Checking enrollment...
        </button>
      ) : isEnrolled ? (
        <Link
          to={`/learn/${course.id}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          <PlayCircle size={18} />
          Continue Learning
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEnrolling ? "Enrolling..." : "Enroll Now"}
        </button>
      )}

      {enrollmentError && (
        <p className="text-center text-xs font-semibold text-red-600">
          {enrollmentError}
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsWishlisted((v) => !v)}
        aria-pressed={isWishlisted}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
          isWishlisted
            ? "border-primary bg-primary text-white"
            : "border-primary text-primary hover:bg-primary-light"
        }`}
      >
        <Heart
          size={16}
          fill={isWishlisted ? "currentColor" : "none"}
        />

        {isWishlisted
          ? "Saved to Wishlist"
          : "Add to Wishlist"}
      </button>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-400">
          Share this course
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleShare("linkedin")}
            aria-label="Share on LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[11px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            in
          </button>

          <button
            type="button"
            onClick={() => handleShare("twitter")}
            aria-label="Share on Twitter"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[11px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            X
          </button>

          <button
            type="button"
            onClick={() => handleShare("facebook")}
            aria-label="Share on Facebook"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[13px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            f
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy course link"
            className="relative ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:border-primary hover:text-primary"
          >
            {copyStatus === "copied" ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}

            {copyStatus === "copied"
              ? "Copied!"
              : "Copy link"}
          </button>
        </div>
      </div>
    </aside>
  );
}