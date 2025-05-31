require('dotenv').config();
require('ts-node').register({
});
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'b2b_auction'
    },
    migrations: {
      directory: './database/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './database/seeders',
      extension: 'ts'
    }
  }
};
module.exports = require('./knexfile.js');
