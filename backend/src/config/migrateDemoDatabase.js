require("dotenv").config();

const pool = require("./database");

/**
 * The original local schema predates several backend features.  This migration
 * is intentionally additive: it never drops user/course/content data. It adds
 * the columns required by the current assignment, competition, research and
 * innovation APIs so the demo database matches the application code.
 */
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

  ["publications", "field", "VARCHAR(150) NULL"],
  ["publications", "publication_year", "YEAR NULL"],
];

async function columnExists(table, column) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?`,
    [table, column]
  );
  return Number(rows[0].count) > 0;
}

async function tableExists(table) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?`,
    [table]
  );
  return Number(rows[0].count) > 0;
}

async function run() {
  const [dbRows] = await pool.execute("SELECT DATABASE() AS database_name");
  const databaseName = dbRows[0]?.database_name;

  if (!databaseName) {
    throw new Error("No database is selected. Check DB_NAME in backend/.env");
  }

  console.log(`Migrating local database: ${databaseName}`);

  for (const [table, column, definition] of migrations) {
    if (!(await tableExists(table))) {
      console.warn(`Skipping ${table}.${column}: table does not exist`);
      continue;
    }

    if (await columnExists(table, column)) {
      console.log(`Already present: ${table}.${column}`);
      continue;
    }

    await pool.execute(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );
    console.log(`Added: ${table}.${column}`);
  }

  console.log("Demo database migration completed successfully.");
}

run()
  .catch((error) => {
    console.error("Demo database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
