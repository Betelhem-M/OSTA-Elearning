const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "submissions"
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
      `submission-${req.user.id}-${req.params.id}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// ALLOWED FILE TYPES
// =====================================================
// Broad set covering code, documents, archives, and
// images, since assignments vary per course/instructor.

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
  ".rar",
  ".7z",
  ".py",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".java",
  ".c",
  ".cpp",
  ".html",
  ".css",
  ".json",
  ".ipynb",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 10, // max 10 files per submission
  },
});

module.exports = upload;