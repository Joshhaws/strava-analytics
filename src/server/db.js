const pg = require('pg');
const { DB_CONFIG } = require('./config.js');

const pool = new pg.Pool(DB_CONFIG);

module.exports = pool;
