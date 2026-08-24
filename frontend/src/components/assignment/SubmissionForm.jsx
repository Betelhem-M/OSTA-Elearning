import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileIcon,
} from "lucide-react";

export default function SubmissionForm({
  assignment,
  onSubmit,
  submitting = false,
}) {
  const [files, setFiles] =
    useState([]);

  const [comment, setComment] =
    useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  const inputRef =
    useRef(null);

  function addFiles(fileList) {
    const newFiles =
      Array.from(fileList);

    // =========================
    // VALIDATE FILES
    // =========================

    const allowedTypes = [
      ".py",
      ".zip",
      ".pdf",
    ];

    const maxSize =
      assignment.maxFileSizeMB *
      1024 *
      1024;

    const validFiles = [];

    for (const file of newFiles) {
      const extension =
        "." +
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        !allowedTypes.includes(
          extension
        )
      ) {
        setError(
          `${file.name} is not an allowed file type.`
        );

        continue;
      }

      if (file.size > maxSize) {
        setError(
          `${file.name} exceeds the ${assignment.maxFileSizeMB}MB limit.`
        );

        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [
        ...prev,
        ...validFiles,
      ]);

      setError("");
    }
  }

  function handleDrop(event) {
    event.preventDefault();

    setIsDragging(false);

    addFiles(
      event.dataTransfer.files
    );
  }

  function removeFile(index) {
    setFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (files.length === 0) {
      setError(
        "Attach at least one file before submitting."
      );

      return;
    }

    onSubmit({
      files,
      comment,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
    >
      <h2 className="text-sm font-bold text-ink">
        Submit Your Work
      </h2>

      {/* UPLOAD AREA */}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() =>
          setIsDragging(false)
        }
        onDrop={handleDrop}
        onClick={() =>
          !submitting &&
          inputRef.current?.click()
        }
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-primary bg-primary-light"
            : "border-slate-200 hover:border-primary/50"
        }`}
      >
        <Upload
          size={28}
          className="text-slate-400"
        />

        <p className="text-sm font-semibold text-slate-600">
          Drag files here or click to
          browse
        </p>

        <p className="text-xs text-slate-400">
          Accepted:{" "}
          {assignment.allowedFileTypes}{" "}
          · Max{" "}
          {assignment.maxFileSizeMB}
          MB per file
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".py,.zip,.pdf"
          className="hidden"
          disabled={submitting}
          onChange={(e) =>
            addFiles(
              e.target.files
            )
          }
        />
      </div>

      {/* FILE LIST */}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map(
            (file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <FileIcon
                  size={16}
                  className="shrink-0 text-slate-400"
                />

                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                  {file.name}
                </span>

                <span className="shrink-0 text-[11px] text-slate-400">
                  {(
                    file.size / 1024
                  ).toFixed(0)}{" "}
                  KB
                </span>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    removeFile(
                      index
                    )
                  }
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 text-slate-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </li>
            )
          )}
        </ul>
      )}

      {/* ERROR */}

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      {/* COMMENT */}

      <label
        htmlFor="comment"
        className="mt-5 mb-2 block text-sm font-bold text-ink"
      >
        Comment for your instructor{" "}
        <span className="font-normal text-slate-400">
          (optional)
        </span>
      </label>

      <textarea
        id="comment"
        value={comment}
        disabled={submitting}
        onChange={(e) =>
          setComment(
            e.target.value
          )
        }
        placeholder="Anything your instructor should know about this submission?"
        className="min-h-[80px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none placeholder:text-slate-400 focus:border-primary"
      />

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Uploading & Submitting..."
          : "Submit Assignment"}
      </button>
    </form>
  );
}