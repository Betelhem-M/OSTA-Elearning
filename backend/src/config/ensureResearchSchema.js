const pool = require("./database");

async function loadSchema() {
  const [rows] = await pool.execute(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
  `);

  const tables = new Set();
  const columns = new Set();

  for (const row of rows) {
    tables.add(row.table_name);
    columns.add(`${row.table_name}.${row.column_name}`);
  }

  return { tables, columns };
}

function tableExists(tables, tableName) {
  return tables.has(tableName);
}

async function ensureColumn(columns, tableName, columnName, definition) {
  const columnKey = `${tableName}.${columnName}`;
  if (columns.has(columnKey)) return;

  await pool.execute(
    `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`
  );

  columns.add(columnKey);
  console.log(`Research schema: added ${tableName}.${columnName}`);
}

async function ensureResearchSchema() {
  // Read the schema once so the startup check does not issue a separate
  // information_schema query for every table and column.
  const { tables, columns } = await loadSchema();

  // The production database may have been initialized from an older/incomplete
  // schema. The research portal is public, so its core tables must exist before
  // the API starts serving requests.
  if (!(tableExists(tables, "researchers"))) {
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
    tables.add("researchers");
    console.log("Research schema: created researchers table");
  }

  await ensureColumn(columns, "researchers", "organization", "VARCHAR(200) NULL");
  await ensureColumn(columns, "researchers", "designation", "VARCHAR(200) NULL");
  await ensureColumn(columns, "researchers", "bio", "TEXT NULL");
  await ensureColumn(columns, "researchers", "field", "VARCHAR(150) NULL");
  await ensureColumn(columns, "researchers", "affiliation", "VARCHAR(250) NULL");
  await ensureColumn(
    columns,
    "researchers",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  if (!(tableExists(tables, "publications"))) {
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
    tables.add("publications");
    console.log("Research schema: created publications table");
  }

  await ensureColumn(columns, "publications", "abstract", "TEXT NULL");
  await ensureColumn(columns, "publications", "content", "LONGTEXT NULL");
  await ensureColumn(columns, "publications", "field", "VARCHAR(150) NULL");
  await ensureColumn(columns, "publications", "publication_year", "YEAR NULL");
  await ensureColumn(columns, "publications", "publication_url", "VARCHAR(500) NULL");
  await ensureColumn(columns, "publications", "file_name", "VARCHAR(255) NULL");
  await ensureColumn(columns, "publications", "file_mime_type", "VARCHAR(120) NULL");
  await ensureColumn(columns, "publications", "file_size", "BIGINT UNSIGNED NULL");
  await ensureColumn(columns, "publications", "file_data", "LONGBLOB NULL");
  await ensureColumn(
    columns,
    "publications",
    "status",
    "VARCHAR(30) NOT NULL DEFAULT 'published'"
  );
  await ensureColumn(
    columns,
    "publications",
    "updated_at",
    "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  console.log("Research schema check completed successfully.");
}

module.exports = ensureResearchSchema;
