import { db } from "../../lib/db.mjs";

export const dynamic = "force-dynamic";

// CLI checks this to know the app is up and can reach its database.
export async function GET() {
  try {
    await (await db()).query("SELECT 1");
    return Response.json({ ok: true });
  } catch (e) {
    // The details go to the logs, not to whoever asked: they can name hosts and users.
    console.error("health check: database unreachable", e);
    return Response.json({ ok: false, error: "database unreachable" }, { status: 503 });
  }
}
