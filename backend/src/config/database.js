const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (process.env.DATABASE_URL) {
  // Railway production database
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,

    waitForConnections: true,
    connectionLimit: isProduction ? 20 : 10,
    queueLimit: 0,

    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    charset: 'utf8mb4',
    timezone: '+00:00',
    dateStrings: false,
  });

  console.log('Using Railway DATABASE_URL.');
} else {
  // Local Docker MySQL / local development database
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'osta_elearning_platform',

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

  console.log('Using local MySQL database.');
}

async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log('✅ MySQL database connected successfully.');
  } catch (error) {
    console.error('❌ MySQL database connection failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

testDatabaseConnection();

module.exports = pool;
