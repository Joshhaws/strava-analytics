import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { getDbConfig } from './db-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

const pool = new Pool(getDbConfig());

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    const sql = readFileSync(join(__dirname, '../../supabase/migrations/20250110223113_lucky_delta.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();