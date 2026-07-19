# Charles' Alien World Project

Charles' personal website, v4. A Vue 3 SPA served by an Express API, deployed with Docker on a
Tencent Cloud CVM (Hong Kong). Rebuilt in 2026 from the original AngularJS 1.x / Heroku version
(v3 — still available in git history).

## Description
This project is developed solely by **Charles**, an intermediate automation software tester.

## Stack
- **client/** — Vue 3 + Vite + Vue Router (URLs preserved from the old ui-router states)
- **server/** — Express, SQLite (better-sqlite3) user accounts, session auth, bcrypt
- **nginx/** + **docker-compose.yml** — production reverse proxy with Let's Encrypt TLS

## Local development

Prerequisites: [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/) ≥ 22.

```bash
git clone https://github.com/Sachielsc/alienworld-web.git
cd alienworld-web
npm install
cp .env.example .env   # fill in dev values (see comments in the file)
npm run dev            # Express on :3010 + Vite dev server on :5173
```

Open http://localhost:5173. The admin account is seeded from `ADMIN_USERNAME`/`ADMIN_PASSWORD`
in `.env`.

Production build check: `npm run build && npm start` then open http://localhost:3010.

## Deployment

See [doc/deployment_guide.md](doc/deployment_guide.md) for the full CVM procedure
(Docker Compose, nginx, certbot).

## Auth model
- Anyone can register a **member** account (foundation for future Community Hub features).
- The **admin** account (env-seeded) is the only role that can view the protected pages
  (Cover Letter, Work Log); their content is served by the API, not as static files.

## Modules
- Workshop (state panel, skill tree, work reports, study notes, CV)
- Community Hub (articles; forum planned)
- Alien Movies / Alien Games
- Contact Me, Other Projects, Cover Letter generator, Work Log
