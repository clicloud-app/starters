// A waitlist: a sign-up page that saves emails to Postgres, and /admin to see and download them.
// Variables: DATABASE_URL (CLI sets it), ADMIN_KEY (the password for /admin), SITE_TITLE.
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import pg from "pg";

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const title = process.env.SITE_TITLE || "Early access";
const adminKey = process.env.ADMIN_KEY || "";
await db.query("CREATE TABLE IF NOT EXISTS signups (email TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now())");

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title>
<style>body{margin:0;font:17px/1.6 system-ui,sans-serif;background:#f7f7f4;color:#1b1b1f;display:grid;place-items:center;min-height:100vh}main{max-width:460px;padding:32px}h1{font-size:2.2rem;line-height:1.1;margin:0 0 12px}p{color:#5b5b66}form{display:flex;gap:8px;margin-top:20px}input{flex:1;padding:12px;border:1px solid #d8d6cf;border-radius:10px;font:inherit}button{padding:12px 18px;border:0;border-radius:10px;background:#1b1b1f;color:#fff;font:inherit;font-weight:600;cursor:pointer}table{border-collapse:collapse;width:100%;margin-top:16px}td{padding:6px 0;border-bottom:1px solid #e6e3dc;font-size:15px}a{color:#2457ff}</style></head><body><main>${body}</main></body></html>`;
const readBody = (req) => new Promise((ok) => { let b = ""; req.on("data", (c) => (b += c).length > 10_000 && req.destroy()); req.on("end", () => ok(new URLSearchParams(b))); });
const isAdmin = (key) => adminKey && key && key.length === adminKey.length && timingSafeEqual(Buffer.from(key), Buffer.from(adminKey));
const send = (res, status, html, type = "text/html; charset=utf-8") => res.writeHead(status, { "content-type": type }).end(html);

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname === "/health") return send(res, 200, "ok", "text/plain");
    if (url.pathname === "/" && req.method === "GET")
      return send(res, 200, page(`<h1>${esc(title)}</h1><p>Leave your email and we'll tell you when it's ready.</p><form method="post" action="/join"><input type="email" name="email" required placeholder="you@example.com" aria-label="Email"><button>Join</button></form>`));
    if (url.pathname === "/join" && req.method === "POST") {
      const email = ((await readBody(req)).get("email") || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return send(res, 400, page(`<h1>That email doesn't look right</h1><p><a href="/">Try again</a></p>`));
      await db.query("INSERT INTO signups (email) VALUES ($1) ON CONFLICT DO NOTHING", [email]);
      return send(res, 200, page(`<h1>You're on the list</h1><p>We'll email ${esc(email)} when it's ready.</p>`));
    }
    if (url.pathname === "/admin") {
      const key = req.method === "POST" ? (await readBody(req)).get("key") : url.searchParams.get("key");
      if (!isAdmin(key)) return send(res, adminKey ? 200 : 503, page(adminKey ? `<h1>Sign-ups</h1><form method="post"><input type="password" name="key" placeholder="ADMIN_KEY" aria-label="Admin key"><button>Open</button></form>` : `<h1>Set ADMIN_KEY first</h1>`));
      const { rows } = await db.query("SELECT email, created_at FROM signups ORDER BY created_at DESC");
      if (url.searchParams.get("format") === "csv") return send(res, 200, "email,joined\n" + rows.map((r) => `${r.email},${r.created_at.toISOString()}`).join("\n"), "text/csv");
      return send(res, 200, page(`<h1>${rows.length} sign-up${rows.length === 1 ? "" : "s"}</h1><p><a href="/admin?key=${encodeURIComponent(key)}&format=csv">Download CSV</a></p><table>${rows.map((r) => `<tr><td>${esc(r.email)}</td><td>${r.created_at.toISOString().slice(0, 10)}</td></tr>`).join("")}</table>`));
    }
    send(res, 404, page(`<h1>Not found</h1><p><a href="/">Home</a></p>`));
  } catch (e) {
    console.error(e);
    send(res, 500, page(`<h1>Something went wrong</h1>`));
  }
}).listen(Number(process.env.PORT) || 3000, "0.0.0.0");
