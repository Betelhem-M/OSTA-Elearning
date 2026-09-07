const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

/*
 * Production:
 *   Railway provides DATABASE_URL through:
 *   ${{MySQL.MYSQL_PRIVATE_URL}}
 *
 * Local development:
 *   Uses DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME
 *   from backend/.env
 */

let pool;

if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'OSTA_E_learning',

    waitForConnections: true,
    connectionLimit: isProduction ? 20 : 10,
    queueLimit: 0,

    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: '+00:00',
    dateStrings: false,

    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    await connection.ping();
    connection.release();

    console.log('✅ MySQL database connected successfully.');
  } catch (error) {
    console.error('❌ MySQL database connection failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
  }
}

async function applySchemaMigrations() {
  const migrationQueries = [
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INT UNSIGNED NOT NULL DEFAULT 100 AFTER location_or_link",
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS banner_image VARCHAR(500) DEFAULT NULL AFTER capacity",
    "ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER completed",
    "ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS last_position_seconds INT UNSIGNED NOT NULL DEFAULT 0 AFTER progress_percent",
    "ALTER TABLE discussion_topics ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General' AFTER title",
    "ALTER TABLE discussion_topics ADD COLUMN IF NOT EXISTS body TEXT DEFAULT NULL AFTER category",
    "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(200) DEFAULT NULL AFTER course_id",
    "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(200) DEFAULT NULL AFTER certificate_number",
    "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT NULL AFTER recipient_name",
    "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS score DECIMAL(5,2) DEFAULT NULL AFTER completion_date",
    "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS skills TEXT DEFAULT NULL AFTER score",
    "ALTER TABLE course_sections ADD COLUMN IF NOT EXISTS section_order INT UNSIGNED NOT NULL DEFAULT 1 AFTER title",
    "ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS lesson_id BIGINT UNSIGNED DEFAULT NULL AFTER course_id"
  ];

  for (const query of migrationQueries) {
    try {
      await pool.execute(query);
    } catch (error) {
      console.warn(
        'Schema migration skipped:',
        error.message,
        'Query:',
        query
      );
    }
  }
}

testDatabaseConnection();
applySchemaMigrations();

module.exports = pool;