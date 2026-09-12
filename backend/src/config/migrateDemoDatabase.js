require("dotenv").config();

const pool = require("./database");

const migrations = [
  ["assignments", "lesson_id", "BIGINT(20) UNSIGNED NULL"],
  ["assignments", "instructions", "TEXT NULL"],
  ["assignments", "allowed_file_types", "VARCHAR(255) NULL"],
  ["assignments", "max_file_size_mb", "INT UNSIGNED NOT NULL DEFAULT 10"],
  ["assignments", "attachment_path", "VARCHAR(1000) NULL"],
  ["assignments", "attachment_name", "VARCHAR(255) NULL"],
  ["assignments", "attachment_size", "BIGINT UNSIGNED NULL"],
  ["competitions", "category", "VARCHAR(120) NULL"],
  ["competitions", "deadline", "DATETIME NULL"],
  ["competitions", "prize", "VARCHAR(255) NULL"],
  ["competitions", "created_by", "BIGINT(20) UNSIGNED NULL"],
  ["competition_participants", "team_name", "VARCHAR(200) NULL"],
  ["competition_participants", "rank_position", "INT UNSIGNED NULL"],
  ["competition_participants", "joined_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ["innovation_ideas", "category", "VARCHAR(120) NULL"],
  ["innovation_ideas", "votes", "INT UNSIGNED NOT NULL DEFAULT 0"],
  ["startups", "category", "VARCHAR(120) NULL"],
  ["researchers", "field", "VARCHAR(150) NULL"],
  ["researchers", "affiliation", "VARCHAR(250) NULL"],
  ["researchers", "updated_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"],
  ["publications", "field", "VARCHAR(150) NULL"],
  ["publications", "publication_year", "YEAR NULL"],
  ["publications", "content", "LONGTEXT NULL"],
  ["publications", "file_name", "VARCHAR(255) NULL"],
  ["publications", "file_mime_type", "VARCHAR(120) NULL"],
  ["publications", "file_size", "BIGINT UNSIGNED NULL"],
  ["publications", "file_data", "LONGBLOB NULL"],
  ["lessons", "resource_url", "VARCHAR(1000) NULL"],
  ["courses", "language", "VARCHAR(50) NOT NULL DEFAULT 'English'"],
  ["courses", "duration", "VARCHAR(50) NOT NULL DEFAULT 'Self-paced'"],
  ["courses", "estimated_hours", "DECIMAL(6,2) NOT NULL DEFAULT 0.00"],
];

async function exists(type, name) {
  const [rows] = await pool.execute(
    type === "table"
      ? `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`
      : `SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    type === "table" ? [name] : name
  );
  return Number(rows[0].count) > 0;
}

async function run() {
  const [dbRows] = await pool.execute("SELECT DATABASE() AS database_name");
  const databaseName = dbRows[0]?.database_name;
  if (!databaseName) throw new Error("No database selected. Check DB_NAME in backend/.env");

  console.log(`Migrating database: ${databaseName}`);

  for (const [table, column, definition] of migrations) {
    if (!(await exists("table", table))) {
      console.warn(`Skipping ${table}.${column}: table does not exist`);
      continue;
    }

    if (await exists("column", [table, column])) {
      console.log(`Already present: ${table}.${column}`);
      continue;
    }

    await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`Added: ${table}.${column}`);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      author VARCHAR(255) NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(1000) NOT NULL,
      mime_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
      file_size BIGINT UNSIGNED NOT NULL DEFAULT 0,
      uploaded_by BIGINT(20) UNSIGNED NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'published',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_books_status (status),
      KEY idx_books_uploaded_by (uploaded_by),
      CONSTRAINT fk_books_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("Database migration completed successfully.");
}

run()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
