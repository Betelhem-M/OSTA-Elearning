const multer = require("multer");
const path = require("path");
const fs = require("fs");

// SECURITY NOTE:
// This directory is deliberately OUTSIDE the "uploads" folder that
// app.js serves via express.static("/uploads"). Assignment attachments
// can contain material the instructor doesn't want publicly guessable
// by URL, so they are only ever served through the authenticated
// GET /api/assignments/:id/attachment endpoint (assignmentController.
// downloadAssignmentAttachment), which checks enrollment/ownership
// before streaming the file.
const uploadDirectory = path.join(
  process.cwd(),
  "secure-uploads",
  "assignments"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const uniqueName =
      `assignment-${req.user.id}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// ALLOWED FILE TYPES
// =====================================================
// Instructor attachments: documents, slides, sheets,
// archives, and images — matches the spec's requested
// file categories for assignment materials.

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".7z",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

function fileFilter(req, file, cb) {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      `File type ${extension || "unknown"} is not allowed.`
    )
  );
}

const uploadAssignmentAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB, generous for slide decks/zips
    files: 1, // one attachment per assignment
  },
});

module.exports = uploadAssignmentAttachment;