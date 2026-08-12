# Security Model — what protects the sensitive data

Reviewed 2026-08-11 against the code as it stands. The sensitive content is the **cover letter**
and **work log**: personal documents that must be visible only to the admin account (Charles).

Deferred security work is in `docs/todo/future_work.md`.

## What is protecting it today

| Layer | Implementation |
|---|---|
| Password storage | **bcrypt, cost 12** (`server/db.js`) — never plaintext |
| Admin creation | **Env-only** (`seedAdmin`, `server/db.js`). `/register` hardcodes `'member'`, and a DB `CHECK (role IN ('admin','member'))` constrains roles — so no one can register their way to admin |
| Access control | `requireAdmin` (`server/routes/protected.js`) — **401** without a session, **403** without `role === 'admin'` |
| Content location | `server/protected-content/` — **outside any static dir**, so it cannot be fetched directly. This was the v4 fix for the old "password gate protecting public files" bug |
| Session fixation | `req.session.regenerate()` on login (`server/routes/auth.js`) — a detail plenty of production apps miss |
| User enumeration | Login returns one generic `Invalid username or password` |
| SQL injection | All queries parameterized via `better-sqlite3` prepared statements |
| Password leakage | `findUserById` selects only `id, username, role, created_at` (`server/db.js`) — the hash never reaches the client |
| Brute force | Rate limit **20 per 15 min** on `/login` and `/register` |
| Cookie | `httpOnly`, `sameSite: lax`, `secure` in production, **server-side** session store (SQLite) |
| Cookie scope | `path` set from `BASE_PATH`, so a sibling app on the same host never receives this session |
| Headers | `helmet` (CSP disabled — see below) |

The key architectural point: **protected content is served by the API, never as a static file.**
The old site put "protected" HTML in a public directory behind a client-side password check,
which protected nothing. That class of bug is gone.

## What is deliberately NOT protected

These are conscious trade-offs, recorded so they are not mistaken for oversights.

| Gap | Why it is accepted |
|---|---|
| **CSP disabled** (`helmet({ contentSecurityPolicy: false })`) | Every `v-html` input is currently repo content or admin-only files — no user input is rendered as HTML. **This stops being true when the Community Hub lands** — see `docs/todo/future_work.md` §2 |
| **Open registration** | Intentional. Members are the foundation of the planned tiered access — see `docs/todo/future_work.md` §1 |
| **Username enumeration on `/register`** | Inherent to open registration; users must be told a name is taken. Login does not leak |
| **No account lockout** | Rate limiting is per-IP only. For a single admin with a strong password, impractical to brute force |
| **No CSRF tokens** | `sameSite: lax` blocks cookies on cross-site POST, which covers the realistic cases |

## Operational security

- `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` live in `.env` on the server, never in
  git. `chmod 600 .env`.
- The admin account is **re-seeded on every container start**, so changing `ADMIN_PASSWORD` in
  `.env` and restarting rotates the password.
- ⚠️ The old site password is **public in git history**. Never reuse it.
- `trust proxy` is set to `1` in production. If a CDN is ever added in front of nginx, that
  becomes **two** proxy hops and the value must be revisited — otherwise the rate limiter keys
  on the wrong IP and either lumps all visitors together or becomes spoofable.

## If a CDN is put in front (EdgeOne)

**Not currently in use** — direct `A` record was chosen 2026-08-11, partly *because* of what
follows (`docs/infrastructure_notes.md`). If EdgeOne is ever added, these two are security
requirements, not performance tuning:

1. **Never cache `/alienworld/api/*`**, especially `/api/protected/*`. A cached admin response
   served to anonymous visitors would leak the cover letter and work log outright.
2. **`X-Forwarded-Proto` must reflect the browser's scheme.** With TLS terminating at the CDN,
   nginx passing `$scheme` reports `http`, and `secure: true` cookies are then never set —
   login silently appears to work but no session persists.

## Verified 2026-08-11

Checked against a running server, not by reading alone:

- login with valid credentials → `Set-Cookie … Path=/alienworld; HttpOnly; SameSite=Lax`
- admin session → `GET /api/protected/worklog` returns **200**
- no session → **401**; the session cookie is required, and role is checked server-side
- the password hash never appears in any API response
