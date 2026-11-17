import { redirect } from "next/navigation";
import { checkCode, sendCode, startSession } from "../../lib/auth.mjs";
import { db } from "../../lib/db.mjs";
import { sendEmail } from "../../lib/email.mjs";

export const dynamic = "force-dynamic";

async function emailCode(form) {
  "use server";
  const email = String(form.get("email") ?? "").trim();
  try {
    await sendCode(email);
  } catch (e) {
    redirect(`/sign-in?error=${encodeURIComponent(e.message)}`);
  }
  redirect(`/sign-in?email=${encodeURIComponent(email)}`);
}

async function verify(form) {
  "use server";
  const email = String(form.get("email") ?? "").trim();
  let session;
  try {
    session = await checkCode(email, String(form.get("code") ?? ""));
  } catch (e) {
    redirect(`/sign-in?email=${encodeURIComponent(email)}&error=${encodeURIComponent(e.message)}`);
  }
  await startSession(session.token);
  // First sign-in: remember them and say hello.
  const added = await (await db()).query("INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [session.user.id, session.user.email]);
  if (added.rowCount === 1) {
    const name = process.env.APP_NAME || "My app";
    await sendEmail({ to: session.user.email, subject: `Welcome to ${name}`, text: `Hi, and welcome to ${name}. You can sign in any time with your email address.` }).catch(() => false);
  }
  redirect("/");
}

export default async function SignIn({ searchParams }) {
  const { email, error } = await searchParams;
  return (
    <main>
      <h1>Sign in</h1>
      {error ? <p role="alert" style={{ color: "#b00020" }}>{error}</p> : null}
      {email ? (
        <form action={verify} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <p>We emailed a 6-digit code to {email}.</p>
          <input type="hidden" name="email" value={email} />
          <label>
            Code
            <input name="code" inputMode="numeric" autoComplete="one-time-code" required style={{ display: "block", width: "100%", padding: 8 }} />
          </label>
          <button type="submit">Sign in</button>
          <a href="/sign-in">Use a different email</a>
        </form>
      ) : (
        <form action={emailCode} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required style={{ display: "block", width: "100%", padding: 8 }} />
          </label>
          <button type="submit">Email me a code</button>
        </form>
      )}
    </main>
  );
}
