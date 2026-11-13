// A tiny static server: files in public/, plus GET /health so CLI knows it's up.
// SITE_TITLE (a variable) replaces {{SITE_TITLE}} in the HTML, so you can rename the site without code.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(import.meta.dirname, "public");
const title = process.env.SITE_TITLE || "My product";
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp" };
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  if (path === "/health") return res.end("ok");
  const file = normalize(join(root, path === "/" ? "index.html" : path));
  if (!file.startsWith(root)) return res.writeHead(400).end();
  try {
    let body = await readFile(file);
    const type = types[extname(file)] ?? "application/octet-stream";
    if (type.startsWith("text/html")) body = body.toString().replaceAll("{{SITE_TITLE}}", escape(title));
    res.writeHead(200, { "content-type": type, "cache-control": "public, max-age=300" }).end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html" }).end(await readFile(join(root, "index.html")));
  }
}).listen(Number(process.env.PORT) || 3000, "0.0.0.0");
