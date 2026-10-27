require('dotenv').config(); // must run before app/config files read process.env
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected.');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.code || err.message);
    console.error('Check that MySQL is running and DB_USER / DB_PASSWORD / DB_NAME in .env are correct.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Library API running on http://localhost:${PORT}/api`));
}

start();
