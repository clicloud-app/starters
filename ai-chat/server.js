// An AI chatbot: one page, and POST /chat, which asks an OpenAI-compatible model.
// Variables: OPENAI_BASE_URL and OPENAI_API_KEY (CLI sets them: its AI models, or your OpenAI key),
// AI_MODEL, and SYSTEM_PROMPT (what the bot should do).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const key = process.env.OPENAI_API_KEY || "";
const model = process.env.AI_MODEL || "gpt-4o-mini";
const system = process.env.SYSTEM_PROMPT || "You are a friendly, concise assistant.";
const html = await readFile(join(import.meta.dirname, "index.html"));

const readJson = (req) => new Promise((ok, no) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 64_000) req.destroy(); }); req.on("end", () => { try { ok(JSON.parse(b)); } catch (e) { no(e); } }); });

createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  if (path === "/health") return res.end("ok");
  if (path === "/" && req.method === "GET") return res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(html);
  if (path === "/chat" && req.method === "POST") {
    try {
      const { messages } = await readJson(req);
      const history = (Array.isArray(messages) ? messages : []).slice(-20).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
      const r = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: "system", content: system }, ...history] }),
      });
      const j = await r.json();
      if (!r.ok) return res.writeHead(502, { "content-type": "application/json" }).end(JSON.stringify({ error: j?.error?.message ?? "The model didn't answer" }));
      return res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ reply: j.choices?.[0]?.message?.content ?? "" }));
    } catch (e) {
      console.error(e);
      return res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ error: "Something went wrong" }));
    }
  }
  res.writeHead(404).end("Not found");
}).listen(Number(process.env.PORT) || 3000, "0.0.0.0");
