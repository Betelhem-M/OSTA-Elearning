const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================
// UPLOAD DIRECTORY
// =========================

const uploadDir = path.join(
  __dirname,
  "../uploads/assignments"
);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =========================
// STORAGE
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

// =========================
// ALLOWED FILE TYPES
// =========================

const allowedExtensions = [
  ".py",
  ".zip",
  ".pdf",
];

// =========================
// FILE FILTER
// =========================

function fileFilter(req, file, cb) {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new Error(
        "Invalid file type. Allowed files are .py, .zip, and .pdf"
      )
    );
  }

  cb(null, true);
}

// =========================
// MULTER
// =========================

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },

  fileFilter,
});

module.exports = upload;