import { db } from "../../../lib-db.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await (await db()).query("SELECT id, body, created_at FROM notes ORDER BY id DESC LIMIT 50");
  return Response.json(rows);
}
