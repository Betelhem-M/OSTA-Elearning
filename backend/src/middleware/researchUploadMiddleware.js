const multer = require("multer");
const path = require("path");

const allowed = new Set([
  ".pdf",
  ".doc",
  ".docx",
]);

const fileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowed.has(extension)) {
    return cb(new Error("Only PDF, DOC, and DOCX research files are supported."));
  }
  cb(null, true);
};

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
