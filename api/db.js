const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgres://default:Fosm0vel9IdM@ep-rapid-surf-a2p067z5-pooler.eu-central-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require",
});

module.exports = pool;
