const pg = require('pg');
const { readFileSync } = require('fs');
const { dirname, join } = require('path');
const dotenv = require('dotenv');
const { getDbConfig } = require('./db-config.js');

const blah = dirname(require.main.filename);
dotenv.config();

async function setupDatabase() {
  const pool = new pg.Pool(getDbConfig());
  let client;
  let retries = 3;

  while (retries > 0) {
    try {
      console.log(`Attempting to connect to database (${retries} retries left)...`);
      client = await pool.connect();
      console.log('Successfully connected to database!');

      console.log('Setting up database tables...');
      const sql = readFileSync(join(blah, '../../supabase/migrations/20250110223113_lucky_delta.sql'), 'utf8');

      const statements = sql.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        console.log('Executing:', statement.trim().slice(0, 50) + '...');
        await client.query(statement);
      }

      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);

      console.log('Created tables:', tables.rows.map(row => row.table_name));
      console.log('Database setup completed successfully!');
      break;

    } catch (error) {
      console.error('Database setup error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        detail: error.detail
      });

      retries--;
      if (retries > 0) {
        console.log('Retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error('Failed to set up database after multiple attempts.');
        process.exit(1);
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  await pool.end();
}

setupDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
