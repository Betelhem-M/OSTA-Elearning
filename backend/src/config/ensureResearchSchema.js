const pool = require("./database");

async function tableExists(tableName) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = ?`,
    [tableName]
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [tableName, columnName]
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function ensureColumn(tableName, columnName, definition) {
  if (await columnExists(tableName, columnName)) return;

  await pool.execute(
    `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`
  );

  console.log(`Research schema: added ${tableName}.${columnName}`);
}

async function ensureResearchSchema() {
  // The production database may have been initialized from an older/incomplete
  // schema. The research portal is public, so its core tables must exist before
  // the API starts serving requests.
  if (!(await tableExists("researchers"))) {
    await pool.execute(`
      CREATE TABLE researchers (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED NOT NULL,
        organization VARCHAR(200) DEFAULT NULL,
        designation VARCHAR(200) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        field VARCHAR(150) DEFAULT NULL,
        affiliation VARCHAR(250) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_researchers_user (user_id),
        CONSTRAINT fk_researchers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Research schema: created researchers table");
  }

  await ensureColumn("researchers", "organization", "VARCHAR(200) NULL");
  await ensureColumn("researchers", "designation", "VARCHAR(200) NULL");
  await ensureColumn("researchers", "bio", "TEXT NULL");
  await ensureColumn("researchers", "field", "VARCHAR(150) NULL");
  await ensureColumn("researchers", "affiliation", "VARCHAR(250) NULL");
  await ensureColumn(
    "researchers",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  if (!(await tableExists("publications"))) {
    await pool.execute(`
      CREATE TABLE publications (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        researcher_id BIGINT(20) UNSIGNED NOT NULL,
        title VARCHAR(250) NOT NULL,
        abstract TEXT DEFAULT NULL,
        content LONGTEXT DEFAULT NULL,
        field VARCHAR(150) DEFAULT NULL,
        publication_year YEAR DEFAULT NULL,
        publication_url VARCHAR(500) DEFAULT NULL,
        file_name VARCHAR(255) DEFAULT NULL,
        file_mime_type VARCHAR(120) DEFAULT NULL,
        file_size BIGINT UNSIGNED DEFAULT NULL,
        file_data LONGBLOB DEFAULT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'published',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_publications_researcher (researcher_id),
        KEY idx_publications_status (status),
        CONSTRAINT fk_publications_researcher FOREIGN KEY (researcher_id) REFERENCES researchers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Research schema: created publications table");
  }

  await ensureColumn("publications", "abstract", "TEXT NULL");
  await ensureColumn("publications", "content", "LONGTEXT NULL");
  await ensureColumn("publications", "field", "VARCHAR(150) NULL");
  await ensureColumn("publications", "publication_year", "YEAR NULL");
  await ensureColumn("publications", "publication_url", "VARCHAR(500) NULL");
  await ensureColumn("publications", "file_name", "VARCHAR(255) NULL");
  await ensureColumn("publications", "file_mime_type", "VARCHAR(120) NULL");
  await ensureColumn("publications", "file_size", "BIGINT UNSIGNED NULL");
  await ensureColumn("publications", "file_data", "LONGBLOB NULL");
  await ensureColumn(
    "publications",
    "status",
    "VARCHAR(30) NOT NULL DEFAULT 'published'"
  );
  await ensureColumn(
    "publications",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  console.log("Research schema check completed successfully.");
}

module.exports = ensureResearchSchema;
