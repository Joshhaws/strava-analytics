import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

async function testConnection() {
  const pool = new Pool({
    user: process.env.VITE_DB_USER,
    host: process.env.VITE_DB_HOST,
    database: process.env.VITE_DB_NAME,
    password: process.env.VITE_DB_PASSWORD,
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Successfully connected to PostgreSQL!');
    console.log('Current timestamp from database:', result.rows[0].now);
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
}

testConnection();