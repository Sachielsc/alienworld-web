# Charles' Alien World Project
Charles' personal website, v4. Was developed solely by **Charles** in 2017. Reforged with AI in 2026.

## Stack
A Vue 3 SPA served by an Express API, deployed with Docker on a
Tencent Cloud CVM (Hong Kong). Rebuilt in 2026 from the original AngularJS 1.x / Heroku version (v3).
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

Open http://localhost:5173/alienworld/. The admin account is seeded from
`ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`.

Production build check: run `npm run build`, then `npm start`, then open
http://localhost:3010/alienworld/ (`/` redirects there).
(In Windows PowerShell 5.1 run them as two commands — `&&` isn't supported there.)

## Deployment

Deployed at **https://hobbies.seekschool.nz/alienworld/** — a sub-path, so other hobby
projects can share the subdomain. The prefix is set in `client/vite.config.js` (`base`,
build time) and `docker-compose.yml` (`BASE_PATH`, runtime); the two must agree.

See [docs/deployment_guide.md](docs/deployment_guide.md) for the full CVM procedure.

### How it works

When someone opens `https://hobbies.seekschool.nz/alienworld/`, the request travels like this:

```
   Browser
      │   https://   (encrypted over the public internet)
      ▼
 ┌─────────────────────┐
 │  nginx container    │  ports 80 + 443 — the public front door
 │  holds the TLS cert │  decrypts, then forwards
 └─────────────────────┘
      │   http://app:3010   (plain, inside Docker's private network)
      ▼
 ┌─────────────────────┐
 │  app container      │  Express: the /api endpoints + the built Vue files
 │  port 3010          │  bound to 127.0.0.1 — unreachable from the internet
 └─────────────────────┘
      │
      ▼
   SQLite file in a Docker volume   (user accounts + sessions)
```

Two containers, started together by `docker compose up -d`.

**The app container** runs Express. It serves the built Vue site and the `/api/…` routes, and
owns the SQLite database. It publishes port 3010 on `127.0.0.1` only, so nothing outside the
machine can reach it directly — every request must come through nginx.

**The nginx container** is a *reverse proxy*: a server that accepts requests on behalf of
another and passes them along. It does three jobs the app deliberately doesn't:

1. **HTTPS** — it holds the certificate and decrypts traffic. Express only ever sees plain
   HTTP on a private Docker network, so it never handles encryption at all.
2. **Deciding which site you meant** — the machine has one IP address but can host several
   sites. nginx reads the `Host:` header your browser sends and routes accordingly. Anything
   it doesn't recognise gets the connection closed.
3. **Redirects** — `http://` → `https://`, and `/alienworld` → `/alienworld/`.

### The certificate, in plain terms

A **TLS certificate** is a file proving this server really is `hobbies.seekschool.nz`. It's
what makes the browser show a padlock instead of "Not secure". Ours is issued free by
**Let's Encrypt** and is valid for **90 days**.

To issue one, Let's Encrypt has to confirm you actually control the domain. It does this with
an *ACME challenge*: it asks the server to publish a specific file at
`http://hobbies.seekschool.nz/.well-known/acme-challenge/…` and then fetches it. Only someone
controlling the domain could do that. The `certbot` container performs this exchange and writes
the certificate into a shared Docker volume that nginx reads.

There's a catch worth knowing, because it shapes the setup: **nginx refuses to start if its
config points at a certificate that doesn't exist yet — but the certificate can't be obtained
until nginx is running to answer the challenge.** That's why `nginx/bootstrap/` exists: a
cut-down, HTTP-only config used for the very first boot, selected with
`NGINX_CONF_DIR=./nginx/bootstrap`. Once the certificate exists, the normal config takes over.

**Renewal** is a weekly cron job. `certbot renew` does nothing until the certificate is within
30 days of expiry, then quietly replaces it and restarts nginx to load it. Nothing to remember.

### Why not let Express serve HTTPS itself?

It could, but it would mean re-implementing certificate loading, the HTTP→HTTPS redirect,
renewal reloads, and hostname routing — and the app container runs as a non-root user, which
isn't allowed to bind ports 80 and 443. nginx does all of it for about 10 MB of memory.

## Auth model
- Anyone can register a **member** account (foundation for future Community Hub features).
- The **admin** account (env-seeded) is the only role that can view the protected pages
  (Cover Letter, Work Log); their content is served by the API, not as static files.

Full breakdown — including what is deliberately *not* protected — in
[docs/security_model.md](docs/security_model.md).

## Docs
| | |
|---|---|
| [docs/deployment_guide.md](docs/deployment_guide.md) | CVM deployment procedure |
| [docs/infrastructure_notes.md](docs/infrastructure_notes.md) | seekschool.nz DNS/hosting map, CVM details |
| [docs/security_model.md](docs/security_model.md) | What protects the admin-only content |
| [docs/todo/future_work.md](docs/todo/future_work.md) | Deferred work and why |
| [docs/local_dev_guide.md](docs/local_dev_guide.md) | Local development |
| [docs/prompts_and_plans/](docs/prompts_and_plans/) | Design decisions and their rationale |

## AI orchestration (dev tooling)
Frontend work can be run through `/frontend-beautify`, where Claude Code implements the change and
two external models (a UI/UX designer and a code reviewer) critique the result. See
`docs/ai_orchestration_usage.md`.

### Two copies of this skill exist - pick deliberately
The skill has been extracted into the reusable marketplace plugin
[charles-claude-skills](https://github.com/CharlesXavier1126/charles-claude-skills), so this repo
sees **both** it and its own local copy. They do not collide: plugin skills are namespaced by
their plugin, so the two carry different invocation names.

| Invocation | Which one |
|---|---|
| `/frontend-beautify` | the local, directory-scoped copy in `.claude/skills/` |
| `/charles-claude-skills:frontend-beautify` | the marketplace one |

Typing the bare name in this repo always gets the local copy. The only way to reach the
marketplace version by accident is to describe the task in prose instead of typing the command,
and let Claude pick.

The two have diverged and will keep diverging. The local copy hardcodes this project (the router,
the `ContentPage` indirection, `tools/ai-council/`); the marketplace copy discovers each repo at
run time from `README.md` and `package.json`, bundles its own transport, and reads API keys from
the process environment before falling back to `.env`. Fixes made in one do not reach the other.

## Modules
- Workshop (state panel, skill tree, work reports, study notes, CV)
- Community Hub (articles; forum planned)
- Alien Movies / Alien Games
- Contact Me, Other Projects, Cover Letter generator, Work Log
