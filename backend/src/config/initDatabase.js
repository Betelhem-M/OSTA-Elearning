const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

function getConnectionConfig() {
  // Railway
  // DATABASE_URL is automatically provided by Railway MySQL.
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
 * Clean a MariaDB/MySQL dump before sending it to mysql2.
 *
 * The schema.sql file is a database dump, not a plain application schema.
 * Dump-only comments, session SET statements, USE statements, and DROP TABLE
 * statements are removed so initialization is safe to run on Railway.
 *
 * DROP TABLE statements are intentionally removed so an application restart
 * can never delete existing Railway data.
 */
function cleanSchema(schema) {
  let cleaned = schema;

  // Remove the MariaDB sandbox-mode comment.
  cleaned = cleaned.replace(
    /\/\*M!999999\\- enable the sandbox mode \*\//g,
    ""
  );

  // Remove MySQL/MariaDB executable comments, including version-specific SETs.
  cleaned = cleaned.replace(
    /\/\*!\d{5,6}[\s\S]*?\*\//g,
    ""
  );
  cleaned = cleaned.replace(
    /\/\*M!\d{5,6}[\s\S]*?\*\//g,
    ""
  );

  // Remove normal SQL comments beginning with --.
  cleaned = cleaned.replace(/^\s*--.*$/gm, "");

  // Remove MySQL # comments.
  cleaned = cleaned.replace(/^\s*#.*$/gm, "");

  // Never execute DROP TABLE statements from the original dump.
  cleaned = cleaned.replace(
    /DROP\s+TABLE\s+IF\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  // Remove USE `database`; statements.
  cleaned = cleaned.replace(
    /^\s*USE\s+`[^`]+`\s*;\s*$/gim,
    ""
  );

  // Remove CREATE DATABASE statements if present.
  cleaned = cleaned.replace(
    /CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+`[^`]+`\s*;\s*/gi,
    ""
  );

  return cleaned.trim();
}

async function initializeDatabase() {
  let connection;

  try {
    const config = getConnectionConfig();

    // ------------------------------------------------------------
    // CONNECT TO RAILWAY MYSQL
    // ------------------------------------------------------------
    if (config.uri) {
      connection = await mysql.createConnection({
        uri: config.uri,
        multipleStatements: true,
        charset: "utf8mb4",
      });

      console.log("Connected to MySQL using DATABASE_URL.");
    } else {
      // ----------------------------------------------------------
      // CONNECT TO LOCAL MYSQL
      // ----------------------------------------------------------
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
    // CLEAN THE MARIADB DUMP
    // ------------------------------------------------------------
    const schema = cleanSchema(originalSchema);

    if (!schema.trim()) {
      throw new Error(
        "No executable SQL statements remained after cleaning schema.sql."
      );
    }

    console.log("Executing cleaned database schema...");

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
