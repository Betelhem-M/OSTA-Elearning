import { useState, useRef, useMemo } from "react";
import {
  Upload,
  X,
  FileIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SubmissionForm({
  assignment,
  onSubmit,
  submitting = false,
}) {
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * NORMALIZE ALLOWED FILE TYPES
   * ---------------------------------------------------------
   *
   * Supports values such as:
   *
   * .pdf,.zip,.py
   * pdf,zip,py
   * .pdf, .zip, .py
   * application/pdf
   * application/zip
   * text/x-python
   *
   */

  const allowedTypes = useMemo(() => {
    const raw =
      assignment?.allowedFileTypes ||
      ".py,.zip,.pdf";

    return raw
      .split(",")
      .map((type) => type.trim().toLowerCase())
      .filter(Boolean)
      .map((type) => {
        // MIME → extension
        const mimeMap = {
          "application/pdf": ".pdf",
          "application/zip": ".zip",
          "application/x-zip-compressed": ".zip",
          "application/x-python": ".py",
          "text/x-python": ".py",
          "text/plain": ".txt",
          "application/msword": ".doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            ".docx",
          "application/vnd.ms-excel": ".xls",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            ".xlsx",
          "application/vnd.ms-powerpoint": ".ppt",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            ".pptx",
        };

        if (mimeMap[type]) {
          return mimeMap[type];
        }

        // If it's already an extension
        if (type.startsWith(".")) {
          return type;
        }

        // Wildcard MIME types
        if (type.includes("/")) {
          return type;
        }

        // Plain extension such as "pdf"
        return `.${type}`;
      });
  }, [assignment?.allowedFileTypes]);

  const maxFileSizeMB =
    Number(assignment?.maxFileSizeMB) > 0
      ? Number(assignment.maxFileSizeMB)
      : 10;

  const maxSizeBytes =
    maxFileSizeMB * 1024 * 1024;

  /*
   * ---------------------------------------------------------
   * DISPLAY FORMAT
   * ---------------------------------------------------------
   */

  const acceptedTypesText =
    allowedTypes.length > 0
      ? allowedTypes
          .map((type) =>
            type.startsWith(".")
              ? type
              : type
          )
          .join(", ")
      : ".pdf, .zip, .py";

  /*
   * ---------------------------------------------------------
   * FILE TYPE VALIDATION
   * ---------------------------------------------------------
   */

  function isAllowedFile(file) {
    const fileName =
      file.name.toLowerCase();

    const extension =
      "." +
      fileName
        .split(".")
        .pop();

    /*
     * Extension match
     */
    if (
      allowedTypes.includes(extension)
    ) {
      return true;
    }

    /*
     * MIME match
     */
    if (
      file.type &&
      allowedTypes.includes(
        file.type.toLowerCase()
      )
    ) {
      return true;
    }

    /*
     * MIME wildcard support
     *
     * Example:
     * image/*
     * text/*
     */
    return allowedTypes.some(
      (allowed) => {
        if (!allowed.endsWith("/*")) {
          return false;
        }

        const prefix =
          allowed.slice(0, -1);

        return file.type
          ?.toLowerCase()
          .startsWith(prefix);
      }
    );
  }

  /*
   * ---------------------------------------------------------
   * ADD FILES
   * ---------------------------------------------------------
   */

  function addFiles(fileList) {
    if (submitting) {
      return;
    }

    const newFiles =
      Array.from(fileList || []);

    if (newFiles.length === 0) {
      return;
    }

    setError("");

    const validFiles = [];
    const rejectedFiles = [];

    for (const file of newFiles) {
      /*
       * TYPE
       */
      if (!isAllowedFile(file)) {
        rejectedFiles.push(
          `${file.name} is not an allowed file type.`
        );

        continue;
      }

      /*
       * SIZE
       */
      if (file.size > maxSizeBytes) {
        rejectedFiles.push(
          `${file.name} exceeds the ${maxFileSizeMB}MB limit.`
        );

        continue;
      }

      /*
       * DUPLICATE CHECK
       */
      const alreadyAdded =
        files.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified ===
              file.lastModified
        );

      const alreadyInBatch =
        validFiles.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified ===
              file.lastModified
        );

      if (
        alreadyAdded ||
        alreadyInBatch
      ) {
        continue;
      }

      validFiles.push(file);
    }

    /*
     * ADD VALID FILES
     */
    if (validFiles.length > 0) {
      setFiles((prev) => [
        ...prev,
        ...validFiles,
      ]);
    }

    /*
     * SHOW REJECTION MESSAGE
     */
    if (rejectedFiles.length > 0) {
      setError(
        rejectedFiles.join(" ")
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * DRAG & DROP
   * ---------------------------------------------------------
   */

  function handleDragOver(event) {
    event.preventDefault();

    if (!submitting) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();

    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();

    setIsDragging(false);

    if (submitting) {
      return;
    }

    addFiles(
      event.dataTransfer.files
    );
  }

  /*
   * ---------------------------------------------------------
   * REMOVE FILE
   * ---------------------------------------------------------
   */

  function removeFile(index) {
    if (submitting) {
      return;
    }

    setFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setError("");
  }

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */

  function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (files.length === 0) {
      setError(
        "Attach at least one file before submitting."
      );

      return;
    }

    setError("");

    onSubmit({
      files,
      comment: comment.trim(),
    });
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-ink">
            Submit Your Work
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Upload your completed assignment
            files below.
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 size={13} />
            {files.length}{" "}
            {files.length === 1
              ? "file"
              : "files"}{" "}
            ready
          </div>
        )}
      </div>

      {/* UPLOAD AREA */}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!submitting) {
            inputRef.current?.click();
          }
        }}
        className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary-light"
            : "border-slate-200 bg-slate-50/40 hover:border-primary/50 hover:bg-primary-light/30"
        } ${
          submitting
            ? "cursor-not-allowed opacity-60"
            : ""
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Upload
            size={24}
            className={
              isDragging
                ? "text-primary"
                : "text-slate-400"
            }
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">
            {isDragging
              ? "Drop your files here"
              : "Drag files here or click to browse"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            You can select multiple files
          </p>
        </div>

        <div className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm">
          Accepted: {acceptedTypesText}
          {" · "}
          Max {maxFileSizeMB}MB per file
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypesText}
          className="hidden"
          disabled={submitting}
          onChange={(event) => {
            addFiles(event.target.files);

            /*
             * Allows selecting the same file again
             * after removing/rejecting it.
             */
            event.target.value = "";
          }}
        />
      </div>

      {/* FILE LIST */}

      {files.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Selected Files
            </p>

            <p className="text-[11px] text-slate-400">
              {files.length} selected
            </p>
          </div>

          <ul className="space-y-2">
            {files.map(
              (file, index) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <FileIcon
                      size={17}
                      className="text-slate-400"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {(
                        file.size / 1024
                      ).toFixed(0)}{" "}
                      KB
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label={`Remove ${file.name}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed"
                  >
                    <X size={15} />
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-xs font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* COMMENT */}

      <label
        htmlFor="comment"
        className="mb-2 mt-5 block text-sm font-bold text-ink"
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
        onChange={(event) =>
          setComment(event.target.value)
        }
        placeholder="Anything your instructor should know about this submission?"
        className="min-h-[90px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={
          submitting ||
          files.length === 0
        }
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Uploading & Submitting..."
          : files.length > 0
            ? `Submit Assignment (${files.length} ${
                files.length === 1
                  ? "file"
                  : "files"
              })`
            : "Submit Assignment"}
      </button>
    </form>
  );
}