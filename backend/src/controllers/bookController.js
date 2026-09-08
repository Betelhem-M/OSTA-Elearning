const fs = require("fs");
const pool = require("../config/database");

function canManageBooks(user) {
  return ["instructor", "admin"].includes(String(user?.role || "").toLowerCase());
}

async function list(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        b.id,
        b.title,
        b.description,
        b.author,
        b.file_name,
        b.mime_type,
        b.file_size,
        b.created_at,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS uploader_name
      FROM books b
      LEFT JOIN users u ON u.id = b.uploaded_by
      WHERE b.status = 'published'
      ORDER BY b.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to list books:", error);
    res.status(500).json({ success: false, message: "Failed to load books" });
  }
}

async function upload(req, res) {
  try {
    if (!canManageBooks(req.user)) {
      return res.status(403).json({ success: false, message: "Only instructors and administrators can upload books" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a PDF book" });
    }

    const title = String(req.body.title || req.file.originalname.replace(/\.pdf$/i, "")).trim();
    if (!title) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Book title is required" });
    }

    const description = String(req.body.description || "").trim() || null;
    const author = String(req.body.author || "").trim() || null;

    const [result] = await pool.execute(
      `INSERT INTO books
        (title, description, author, file_name, file_path, mime_type, file_size, uploaded_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        title,
        description,
        author,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Book uploaded successfully",
      data: { id: result.insertId, title },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Failed to upload book:", error);
    res.status(500).json({ success: false, message: "Failed to upload book" });
  }
}

async function read(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT file_path, file_name, mime_type FROM books WHERE id = ? AND status = 'published' LIMIT 1",
      [req.params.id]
    );

    const book = rows[0];
    if (!book || !fs.existsSync(book.file_path)) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.setHeader("Content-Type", book.mime_type || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(book.file_name)}`);
    fs.createReadStream(book.file_path).pipe(res);
  } catch (error) {
    console.error("Failed to read book:", error);
    res.status(500).json({ success: false, message: "Failed to open book" });
  }
}

async function download(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT file_path, file_name, mime_type FROM books WHERE id = ? AND status = 'published' LIMIT 1",
      [req.params.id]
    );

    const book = rows[0];
    if (!book || !fs.existsSync(book.file_path)) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.download(book.file_path, book.file_name);
  } catch (error) {
    console.error("Failed to download book:", error);
    res.status(500).json({ success: false, message: "Failed to download book" });
  }
}

module.exports = { list, upload, read, download };
