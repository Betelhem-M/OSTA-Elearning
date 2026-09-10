const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  process.cwd(),
  "secure-uploads",
  "instructor-cvs"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `instructor-cv-${req.user.id}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;
    cb(null, uniqueName);
  },
});

const allowedExtensions = [".pdf", ".doc", ".docx"];

function fileFilter(_req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("CV must be a PDF, DOC, or DOCX file."));
  }

  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});
