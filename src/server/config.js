const { config } = require('dotenv');
const { join } = require('path');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.VITE_JWT_SECRET;
const DB_CONFIG = {
  user: process.env.VITE_DB_USER,
  host: process.env.VITE_DB_HOST,
  database: process.env.VITE_DB_NAME,
  password: process.env.VITE_DB_PASSWORD,
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: process.env.VITE_DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
};

module.exports = { JWT_SECRET, DB_CONFIG };
