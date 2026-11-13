import { db } from "../../lib-db.mjs";

export const dynamic = "force-dynamic";

// CLI checks this to know the app is up and can reach its database.
export async function GET() {
  try {
    await (await db()).query("SELECT 1");
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message ?? e) }, { status: 503 });
  }
}
