import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

const DB_TZ = process.env.DB_TZ || '+03:00';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'b2b_auction',
  port: 3306,
  dateStrings: true,
  timezone: DB_TZ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('connection', (connection) => {
  connection.query(`SET time_zone = '${DB_TZ}'`);
});

export default pool;
