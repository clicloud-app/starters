import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, endSession } from "../lib/auth.mjs";
import { db } from "../lib/db.mjs";

export const dynamic = "force-dynamic";

async function addNote(form) {
  "use server";
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const body = String(form.get("body") ?? "").trim().slice(0, 500);
  if (body) await (await db()).query("INSERT INTO notes (user_id, body) VALUES ($1, $2)", [user.id, body]);
  revalidatePath("/");
}

async function deleteNote(form) {
  "use server";
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  await (await db()).query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [Number(form.get("id")), user.id]);
  revalidatePath("/");
}

async function signOut() {
  "use server";
  await endSession();
  redirect("/");
}

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return (
      <main>
        <h1>Your notes, anywhere</h1>
        <p>Sign in with your email to keep private notes. No password: we email you a code.</p>
        <p>
          <a href="/sign-in" style={{ display: "inline-block", padding: "10px 16px", background: "#111", color: "#fff", borderRadius: 8, textDecoration: "none" }}>Sign in</a>
        </p>
      </main>
    );
  }
  const { rows } = await (await db()).query("SELECT id, body FROM notes WHERE user_id = $1 ORDER BY id DESC LIMIT 100", [user.id]);
  return (
    <main>
      <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Signed in as {user.email}</span>
        <form action={signOut}>
          <button type="submit">Sign out</button>
        </form>
      </p>
      <form action={addNote} style={{ display: "flex", gap: 8 }}>
        <input name="body" aria-label="New note" placeholder="Write a note" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      {rows.length === 0 ? <p>No notes yet. Write your first one above.</p> : null}
      <ul style={{ paddingLeft: 18 }}>
        {rows.map((n) => (
          <li key={n.id} style={{ margin: "8px 0" }}>
            {n.body}{" "}
            <form action={deleteNote} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={n.id} />
              <button type="submit" aria-label={`Delete "${n.body}"`}>Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
