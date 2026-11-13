import { revalidatePath } from "next/cache";
import { db } from "../lib-db.mjs";

export const dynamic = "force-dynamic";

async function addNote(form) {
  "use server";
  const body = String(form.get("body") ?? "").trim().slice(0, 500);
  if (body) await (await db()).query("INSERT INTO notes (body) VALUES ($1)", [body]);
  revalidatePath("/");
}

export default async function Home() {
  const { rows } = await (await db()).query("SELECT id, body, created_at FROM notes ORDER BY id DESC LIMIT 50");
  return (
    <main>
      <h1>Notes</h1>
      <p>A Next.js app on CLI, storing notes in Postgres.</p>
      <form action={addNote} style={{ display: "flex", gap: 8 }}>
        <input name="body" placeholder="Write a note" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {rows.map((n) => (
          <li key={n.id}>{n.body}</li>
        ))}
      </ul>
    </main>
  );
}
