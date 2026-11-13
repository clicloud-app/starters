import pg from "pg";

// DATABASE_URL comes from the Postgres service the template created.
const pool = globalThis.__pool ?? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
globalThis.__pool = pool;

let ready;
export function db() {
  ready ??= pool.query("CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  return ready.then(() => pool);
}
