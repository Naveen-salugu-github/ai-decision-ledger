import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "ledger",
  user: process.env.PGUSER || "ledger",
  password: process.env.PGPASSWORD || "ledger"
});

export async function initDb() {
  // Enable gen_random_uuid if using postgres < 13 without extension you can adjust accordingly.
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS traces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trace_id UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
      prompt TEXT,
      response TEXT,
      tool_call TEXT,
      latency_ms INTEGER,
      risk_flag BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

