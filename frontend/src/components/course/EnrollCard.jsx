import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Copy, Check, PlayCircle } from "lucide-react";
import {
  buildShareUrl,
  openShareWindow,
  copyToClipboard,
} from "@utils/sharing";

export default function EnrollCard({ course }) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // 'idle' | 'copied' | 'error'

  async function handleCopyLink() {
    const success = await copyToClipboard(window.location.href);
    setCopyStatus(success ? "copied" : "error");
    setTimeout(() => setCopyStatus("idle"), 1800);
  }

  function handleShare(network) {
    openShareWindow(buildShareUrl(network, window.location.href, course.title));
  }

  return (
    <aside className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="text-center">
        <p className="text-3xl font-extrabold text-primary">{course.price}</p>
        <p className="text-xs text-slate-400">Full lifetime access</p>
      </div>

      {isEnrolled ? (
        <Link
          to={`/learn/${course.id}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          <PlayCircle size={18} /> Continue Learning
        </Link>
      ) : (
        <button
          onClick={() => setIsEnrolled(true)}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          Enroll Now
        </button>
      )}

      <button
        onClick={() => setIsWishlisted((v) => !v)}
        aria-pressed={isWishlisted}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
          isWishlisted
            ? "border-primary bg-primary text-white"
            : "border-primary text-primary hover:bg-primary-light"
        }`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-400">
          Share this course
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShare("linkedin")}
            aria-label="Share on LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[11px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            in
          </button>
          <button
            onClick={() => handleShare("twitter")}
            aria-label="Share on Twitter"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[11px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            X
          </button>
          <button
            onClick={() => handleShare("facebook")}
            aria-label="Share on Facebook"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[13px] font-extrabold text-slate-600 hover:border-primary hover:text-primary"
          >
            f
          </button>
          <button
            onClick={handleCopyLink}
            aria-label="Copy course link"
            className="relative ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:border-primary hover:text-primary"
          >
            {copyStatus === "copied" ? <Check size={14} /> : <Copy size={14} />}
            {copyStatus === "copied" ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </aside>
  );
}
