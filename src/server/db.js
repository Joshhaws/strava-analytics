import pg from 'pg';
import { DB_CONFIG } from './config.js';

const pool = new pg.Pool(DB_CONFIG);

export default pool;
