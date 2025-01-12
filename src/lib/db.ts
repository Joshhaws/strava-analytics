import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getDbConfig } from '../db/db-config.js';

dotenv.config();

const pool = new Pool(getDbConfig());

export default pool;