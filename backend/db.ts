import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

export async function initDb() {
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
      tokens_prompt INTEGER,
      tokens_completion INTEGER,
      temperature REAL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS tokens_prompt INTEGER;
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS tokens_completion INTEGER;
    ALTER TABLE steps ADD COLUMN IF NOT EXISTS temperature REAL;
  `);
}