const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

function getConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "osta_e_learning",
  };
}

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    ...getConnectionConfig(),
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await connection.query(schema);
    console.log("Database schema initialized.");
  } finally {
    await connection.end();
  }
}

initializeDatabase().catch((error) => {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
});
