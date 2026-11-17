import { cookies } from "next/headers";

/**
 * Sign-in is CLI's: people get a code by email, and CLI hands back a token for them.
 * CLI_AUTH_ISSUER was filled in by the template (the project's sign-in address).
 */
const issuer = () => {
  const url = process.env.CLI_AUTH_ISSUER;
  if (!url) throw new Error("CLI_AUTH_ISSUER isn't set. Turn on Sign-in for this project in CLI and copy its address here.");
  return url.replace(/\/$/, "");
};

async function call(path, body, token) {
  const res = await fetch(`${issuer()}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message ?? `Sign-in failed (${res.status})`);
  return json;
}

export const sendCode = (email) => call("/email/start", { email });
export const checkCode = (email, code) => call("/email/verify", { email, code });

const COOKIE = "session";

export async function startSession(token) {
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in person, or null. CLI checks the token, so a forged or expired one is refused. */
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { user } = await call("/me", null, token);
    return user && !user.disabled ? user : null;
  } catch {
    return null;
  }
}
