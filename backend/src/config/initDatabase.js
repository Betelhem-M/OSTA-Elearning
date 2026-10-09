const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

function getConnectionConfig() {
  // Railway
  if (process.env.DATABASE_URL) {
    return {
      uri: process.env.DATABASE_URL,
    };
  }

  // Local Docker MySQL / local development
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "osta_elearning_platform",
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  };
}

/**
 * Clean a MariaDB/MySQL dump before executing it through mysql2.
 *
 * Initialization is additive: DROP TABLE statements are removed and CREATE
 * TABLE statements become CREATE TABLE IF NOT EXISTS, preserving existing rows.
 */
function cleanSchema(schema) {
  let cleaned = schema;

  cleaned = cleaned.replace(
    /\/\*M!999999\\- enable the sandbox mode \*\//g,
    ""
  );

  cleaned = cleaned.replace(
    /\/\*M!\d{5,6}\s+[\s\S]*?\*\/\s*;?/gi,
    ""
  );

  cleaned = cleaned.replace(
    /\/\*!\d{5,6}\s*([\s\S]*?)\*\/\s*;?/gi,
    "$1;"
  );

  cleaned = cleaned.replace(/^\s*--.*$/gm, "");
  cleaned = cleaned.replace(/^\s*#.*$/gm, "");

  cleaned = cleaned.replace(
    /DROP\s+TABLE\s+IF\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  cleaned = cleaned.replace(
    /^\s*USE\s+`[^`]+`\s*;\s*$/gim,
    ""
  );

  cleaned = cleaned.replace(
    /CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  cleaned = cleaned.replace(
    /^\s*LOCK\s+TABLES\s+.*;\s*$/gim,
    ""
  );

  cleaned = cleaned.replace(
    /^\s*UNLOCK\s+TABLES\s*;\s*$/gim,
    ""
  );

  // Make table creation safe to rerun. cleanSchema has already removed DROP TABLE statements.
  cleaned = cleaned.replace(
    /\bCREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS\b)/gi,
    "CREATE TABLE IF NOT EXISTS "
  );

  return cleaned.trim();
}

async function initializeDatabase() {
  let connection;

  try {
    const config = getConnectionConfig();

    if (config.uri) {
      connection = await mysql.createConnection({
        uri: config.uri,
        multipleStatements: true,
        charset: "utf8mb4",
      });

      console.log("Connected to MySQL using DATABASE_URL.");
    } else {
      connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        multipleStatements: true,
        charset: "utf8mb4",
        ssl: config.ssl,
      });

      console.log(
        `Connected to local MySQL database: ${config.database}`
      );
    }

    const [existingTables] = await connection.query("SHOW TABLES");
    console.log(
      `Found ${existingTables.length} existing table(s); applying additive schema initialization.`
    );

    // The core schema defines the main platform tables. Feature and instructor
    // schemas add tables not present in the core dump. All are safe to rerun.
    const schemaFiles = [
      "schema.sql",
      "featureSchema.sql",
      "instructorApplicationSchema.sql",
    ];
    const expectedTables = new Set();

    for (const fileName of schemaFiles) {
      const schemaPath = path.join(__dirname, fileName);
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Required schema file not found: ${schemaPath}`);
      }

      const originalSchema = fs.readFileSync(schemaPath, "utf8");
      if (!originalSchema.trim()) {
        throw new Error(`Schema file is empty: ${fileName}`);
      }

      const schema = cleanSchema(originalSchema);
      if (!schema) {
        throw new Error(`No executable SQL statements remained in ${fileName}.`);
      }

      for (const match of schema.matchAll(
        /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?\x60?([a-zA-Z0-9_]+)\x60?/gi
      )) {
        expectedTables.add(match[1].toLowerCase());
      }

      console.log(`Applying schema file: ${fileName}`);
      await connection.query(schema);
    }

    const [tableRows] = await connection.query(`
      SELECT TABLE_NAME AS table_name
      FROM information_schema.tables
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
    `);

    const actualTables = new Set(
      tableRows
        .map((row) => String(row.table_name ?? row.TABLE_NAME ?? "").toLowerCase())
        .filter(Boolean)
    );
    const missingTables = [...expectedTables].filter(
      (tableName) => !actualTables.has(tableName)
    );

    if (missingTables.length > 0) {
      throw new Error(
        `Schema initialization incomplete. Missing table(s): ${missingTables.join(", ")}`
      );
    }

    console.log(
      `Database schema initialized successfully. Verified ${expectedTables.size} required schema tables; ${actualTables.size} table(s) exist in the database.`
    );
  } catch (error) {
    console.error(
      "Database initialization failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error(
          "Failed to close database connection:",
          error.message
        );
      }
    }
  }
}

initializeDatabase();