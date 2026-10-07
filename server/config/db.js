const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_ordering',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
});

// Quick connection test
pool.getConnection()
  .then((conn) => {
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'food_ordering'}`);
    conn.release();
  })
  .catch((err) => {
    console.error('[Database] Connection failed:', err.message);
  });

module.exports = pool;
