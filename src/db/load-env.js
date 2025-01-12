import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(dirname(dirname(__dirname)), '.env');

export function loadEnv() {
  const result = config({ path: envPath });
  
  if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
  }
  
  const requiredVars = [
    'VITE_DB_USER',
    'VITE_DB_HOST',
    'VITE_DB_NAME',
    'VITE_DB_PASSWORD',
    'VITE_DB_PORT'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}