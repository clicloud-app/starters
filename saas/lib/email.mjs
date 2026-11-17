/**
 * Email through CLI. CLI_EMAIL_URL and CLI_EMAIL_KEY were filled in by the template. EMAIL_FROM must be
 * an address on a domain added under the project's Email in CLI; until it's set, emails are skipped.
 */
export async function sendEmail({ to, subject, text }) {
  const { CLI_EMAIL_URL: url, CLI_EMAIL_KEY: key, EMAIL_FROM: from } = process.env;
  if (!url || !key || !from) {
    console.log(`email skipped (set EMAIL_FROM to send): "${subject}" to ${to}`);
    return false;
  }
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ from, to, subject, text }) });
  if (!res.ok) console.error("email failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}
