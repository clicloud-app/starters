import pg from "pg";

// DATABASE_URL comes from the Postgres service the template created.
const pool = globalThis.__pool ?? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
globalThis.__pool = pool;

let ready;
export function db() {
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
    CREATE INDEX IF NOT EXISTS notes_user ON notes (user_id, id);
  `);
  return ready.then(() => pool);
}
