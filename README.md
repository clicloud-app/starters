# CLI starters

Small, working apps that CLI's starter templates deploy in one click. Publish this folder as the
public repository `clicloud-app/starters`; each template points at one subfolder.

| Folder | Template | What it is |
| --- | --- | --- |
| `nextjs-postgres` | Next.js + Postgres | A Next.js app (App Router) with a notes page stored in Postgres |
| `fastapi` | FastAPI + Postgres | A Python API with a `/items` endpoint stored in Postgres |
| `discord-bot` | Discord bot | A discord.js bot that answers `/ping`, with a small health endpoint |
| `cron-worker` | Cron worker | A Python job CLI runs on a schedule, with a small health endpoint |
| `landing-page` | Landing page | A one-page site (plain HTML and CSS) served by a tiny Node server |
| `waitlist` | Waitlist + Postgres | A sign-up page saving emails to Postgres, with `/admin` and CSV download |
| `saas` | SaaS starter | Next.js and Postgres with CLI sign-in (emailed codes), private notes per person, and a welcome email |
| `ai-chat` | AI chatbot | A chat page that calls an OpenAI-compatible model (CLI's AI models or your key) |

Every app listens on `$PORT` and answers `GET /health`, which is how CLI knows it's up.

## Versions and security

- Node starters pin exact versions with a `package-lock.json` and Node 22 (`.nvmrc`, `engines`).
  Python starters pin every dependency with hashes in `requirements.txt` (made from
  `requirements.in` with `pip-compile --generate-hashes`) and Python 3.13 (`.python-version`).
- `npm audit` and `pip-audit` report no known vulnerabilities as of 13 November 2026. Re-run them,
  and update, before each release of this repository; Dependabot opens the PRs.
- Health checks say whether the database is reachable, never why: the details go to the app's logs.

## Before real traffic

These are demos. The notes page (`nextjs-postgres`) and the `/items` endpoint (`fastapi`) accept
writes from anyone who finds the URL. Add sign-in (CLI's app auth, or your own) before you put
anything real behind them. The waitlist's `/admin` is protected by the `ADMIN_KEY` variable:
set a long one.
