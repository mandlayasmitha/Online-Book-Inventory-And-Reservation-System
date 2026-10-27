require('dotenv').config();
const mysql = require('mysql2/promise');

// dateStrings: DATE / DATETIME columns come back as plain strings (no timezone surprises)
module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});
