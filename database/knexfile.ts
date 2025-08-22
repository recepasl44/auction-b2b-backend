import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'b2b_auction',
      port: 3306,
      timezone: process.env.DB_TZ || '+03:00'
    },
    migrations: {
      directory: './database/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'ts'
    }
  },

  // Production vb. ekleyebilirsiniz
};

module.exports = config;
