const { readFileSync } = require('fs');
const { join } = require('path');

// __dirname is already available in CommonJS, so just use it directly

const getDbConfig = () => {
  const sslConfig = {
    ca: readFileSync(join(__dirname, 'rds-ca-2019-root.pem')).toString(),
    rejectUnauthorized: false
  };

  return {
    user: process.env.VITE_DB_USER,
    host: process.env.VITE_DB_HOST,
    database: process.env.VITE_DB_NAME,
    password: process.env.VITE_DB_PASSWORD,
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    ssl: sslConfig,
    // Increase timeouts and add retry settings
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
    maxRetries: 3,
    retryDelay: 1000,
    statement_timeout: 10000
  };
};

module.exports = { getDbConfig };
