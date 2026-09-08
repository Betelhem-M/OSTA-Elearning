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

    const schemaPath = path.join(__dirname, "schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, "utf8");

    if (!schema.trim()) {
      throw new Error("schema.sql is empty.");
    }

    await connection.query(schema);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();