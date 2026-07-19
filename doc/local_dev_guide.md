# Local Development Guide

How to run alienworld-web v4 on your own machine for development. For production deployment
to the CVM, see [deployment_guide.md](deployment_guide.md).

## 1. Prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/) **22 or newer** (check with `node -v`)
- Optional: Docker Desktop — only needed if you want to test the production container locally

## 2. First-time setup

```bash
git clone https://github.com/Sachielsc/alienworld-web.git
cd alienworld-web
npm install          # installs root + client + server (npm workspaces)
cp .env.example .env
```

Then edit `.env` with dev values, e.g.:

```ini
SESSION_SECRET=dev-only-secret
ADMIN_USERNAME=charles
ADMIN_PASSWORD=pick-a-dev-password
```

`.env` is git-ignored — it never leaves your machine. The admin account is created (or its
password updated) from these values every time the server starts.

## 3. Run the dev environment

```bash
npm run dev
```

This starts two processes side by side (via `concurrently`):

| Process | Port | What it does |
|---|---|---|
| `server` (Express) | **3010** | API (`/api/...`), SQLite DB, protected content |
| `client` (Vite) | **5173** | Serves the Vue app with hot reload |

**Open http://localhost:5173** — that's your dev URL. The Vite dev server proxies every
`/api/*` request to the Express server (see `client/vite.config.js`), so cookies/logins work
exactly like production. Both processes auto-reload on file changes (`node --watch` for the
server, Vite HMR for the client).

Stop everything with `Ctrl+C`.

## 4. Where things live

```
client/src/views/       Vue pages with logic (Home, WorkReport hub, CoverLetter, Login...)
client/src/components/  Shared pieces (AboutPanel, ContentPage, ProtectedGate)
client/src/content/     Migrated static pages as raw HTML fragments (notes, reports, articles)
client/src/assets/css/theme.css   The site's look - ported from the old stylesheet
client/public/          Images, fonts, Font Awesome (served as-is at /images, /fonts, /vendor)
server/index.js         Express app: sessions, static serving, route mounting
server/routes/          auth.js (register/login/logout/me), protected.js (admin-only content)
server/protected-content/  Cover letter & work log HTML - NOT publicly reachable
server/data/            SQLite database + sessions (git-ignored, auto-created)
```

Quick recipes:
- **Edit a static page** (note, report, article): change the file in `client/src/content/` — the browser hot-reloads.
- **Add a new note/report**: drop an HTML fragment in `client/src/content/workreport/` and add its route key in `client/src/router/index.js` (and its label in `WorkReportView.vue`).
- **Change API behavior**: edit under `server/` — the server restarts automatically.

## 5. Testing auth locally

- **Admin**: Sign In (secret-icon menu → Sign In) with the `.env` credentials → Cover Letter
  and Work Log should render.
- **Member**: use the Register form to create any account → those two pages must show the
  "no clearance" message instead.
- **Logged out**: same pages must show the sign-in prompt, and
  `curl http://localhost:3010/api/protected/worklog` must return `{"error":"Login required."}`.

**Reset the local database** (wipe all accounts/sessions): stop the dev server and delete
`server/data/`, then start again — the admin is re-seeded from `.env`.

## 6. Production build check (no Docker)

Before committing bigger changes, verify the real build:

```bash
npm run build      # builds the client into client/dist
npm start          # Express serves client/dist + API on :3010
```

Open http://localhost:3010 and click around. This is exactly what runs inside the container.

## 7. Full container check (optional, needs Docker)

```bash
docker compose build app
docker run --rm -p 127.0.0.1:3010:3010 --env-file .env -e NODE_ENV=production alienworld-web:latest
```

Open http://localhost:3010. Notes:
- Login will NOT work here: production mode sets `Secure` cookies, which browsers refuse over
  plain http. That's expected — TLS is nginx's job in production. Everything else is testable.
- The nginx/certbot services from `docker-compose.yml` are for the CVM; you don't run them locally.

## 8. Troubleshooting

- **Port 3010 or 5173 already in use**: something old is still running — on Windows find it with
  `netstat -ano | findstr :3010` and stop that PID, or set `PORT=<other>` in `.env`
  (the Vite proxy target in `client/vite.config.js` must match).
- **`better-sqlite3` install/ABI errors** after a Node upgrade: `npm rebuild better-sqlite3 -w server`.
- **Weird dependency state**: delete all `node_modules` folders and run `npm install` again from the root.
- **Changed `.env` but nothing happened**: the env file is read at server start — restart `npm run dev`.
