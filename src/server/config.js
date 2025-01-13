import { config } from 'dotenv';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.VITE_JWT_SECRET;
export const DB_CONFIG = {
  user: process.env.VITE_DB_USER,
  host: process.env.VITE_DB_HOST,
  database: process.env.VITE_DB_NAME,
  password: process.env.VITE_DB_PASSWORD,
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  ssl: process.env.VITE_DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
};
