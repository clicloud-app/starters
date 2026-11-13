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
| `ai-chat` | AI chatbot | A chat page that calls an OpenAI-compatible model (CLI's AI models or your key) |

Every app listens on `$PORT` and answers `GET /health`, which is how CLI knows it's up.
