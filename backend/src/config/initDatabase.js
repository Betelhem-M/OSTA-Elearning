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

  // Local development
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "osta_elearning",
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  };
}

/**
 * Clean a MariaDB/MySQL dump before executing it through mysql2.
 *
 * The application should NOT delete existing production data.
 * If the database already contains tables, initialization is skipped.
 */
function cleanSchema(schema) {
  let cleaned = schema;

  // Remove MariaDB sandbox-mode comments.
  cleaned = cleaned.replace(
    /\/\*M!999999\\- enable the sandbox mode \*\//g,
    ""
  );

  // Remove MariaDB-specific executable comments.
  cleaned = cleaned.replace(
    /\/\*M!\d{5,6}\s+[\s\S]*?\*\/\s*;?/gi,
    ""
  );

  // Convert MySQL versioned executable comments into SQL.
  cleaned = cleaned.replace(
    /\/\*!\d{5,6}\s*([\s\S]*?)\*\/\s*;?/gi,
    "$1;"
  );

  // Remove normal SQL comments.
  cleaned = cleaned.replace(/^\s*--.*$/gm, "");

  // Remove MySQL # comments.
  cleaned = cleaned.replace(/^\s*#.*$/gm, "");

  // Never execute DROP TABLE statements automatically.
  cleaned = cleaned.replace(
    /DROP\s+TABLE\s+IF\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  // Remove USE statements.
  cleaned = cleaned.replace(
    /^\s*USE\s+`[^`]+`\s*;\s*$/gim,
    ""
  );

  // Remove CREATE DATABASE statements.
  cleaned = cleaned.replace(
    /CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  // Remove table locking statements.
  cleaned = cleaned.replace(
    /^\s*LOCK\s+TABLES\s+.*;\s*$/gim,
    ""
  );

  cleaned = cleaned.replace(
    /^\s*UNLOCK\s+TABLES\s*;\s*$/gim,
    ""
  );

  return cleaned.trim();
}

async function initializeDatabase() {
  let connection;

  try {
    const config = getConnectionConfig();

    // ------------------------------------------------------------
    // CONNECT TO DATABASE
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // CHECK WHETHER DATABASE ALREADY HAS TABLES
    // ------------------------------------------------------------

    const [tables] = await connection.query("SHOW TABLES");

    if (tables.length > 0) {
      console.log(
        `Database already contains ${tables.length} table(s).`
      );

      console.log(
        "Skipping automatic schema initialization to protect existing data."
      );

      return;
    }

    // ------------------------------------------------------------
    // FIND SCHEMA FILE
    // ------------------------------------------------------------

    const schemaPath = path.join(__dirname, "schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const originalSchema = fs.readFileSync(schemaPath, "utf8");

    if (!originalSchema.trim()) {
      throw new Error("schema.sql is empty.");
    }

    console.log("Reading database schema...");

    // ------------------------------------------------------------
    // CLEAN SCHEMA
    // ------------------------------------------------------------

    const schema = cleanSchema(originalSchema);

    if (!schema.trim()) {
      throw new Error(
        "No executable SQL statements remained after cleaning schema.sql."
      );
    }

    console.log("Executing database schema...");

    // ------------------------------------------------------------
    // EXECUTE SCHEMA
    // ------------------------------------------------------------

    await connection.query(schema);

    console.log("Database schema initialized successfully.");
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