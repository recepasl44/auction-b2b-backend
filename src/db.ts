import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'b2b_auction',
  port:3306,
  timezone: process.env.DB_TZ || '+03:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
