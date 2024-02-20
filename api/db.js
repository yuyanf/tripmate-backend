const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_DATABASE_CONNECT,
});

module.exports = pool;
