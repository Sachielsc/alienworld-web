# Future Work

Captured 2026-08-11. Items are things we consciously deferred, with the reasoning — not a
backlog of everything imaginable. Current security posture is in `docs/security_model.md`.

---

## 1. Member access tier (the "registration hole" — not a hole)

**Status: deferred by design. Do NOT close registration.**

It was proposed to disable public registration, since the admin is "pretty much just me".
**Rejected.** The plan is the opposite: open registration to everyone, with tiered access.

| Tier | Access |
|---|---|
| Anonymous | Public content |
| **Member** (self-registered) | Public + certain member-only content |
| **Admin** (env-seeded, just Charles) | Everything, incl. cover letter & work log |

### Why nothing needs undoing

The data model was built for this in v4 and already supports it:

- `users.role` with `CHECK (role IN ('admin','member'))` (`server/db.js`)
- `/register` hardcodes `'member'` (`server/db.js` `createUser`) — no one can register into admin
- admin is seeded from env only, never through an endpoint

### What still needs building

1. A `requireMember` sibling to `requireAdmin` (`server/routes/protected.js`) — session exists,
   any role.
2. Split content into **public / member-only / admin-only**. Today `protected.js` has a single
   `DOCS` map behind `requireAdmin`; it needs a tier per document.
3. Client-side: the nav/menu should reflect tier, and `ProtectedGate.vue` needs a member variant.

### Accepted trade-off

`POST /register` returns `409 Username already taken`, which confirms whether a username exists
— including the admin's. This is **inherent to open registration** (users must be told a name is
taken) and is accepted, not a defect. Login itself does not leak: it returns a single generic
`Invalid username or password`.

---

## 2. Re-enable CSP + sanitize user-submitted HTML

**Trigger: the moment the Community Hub accepts user-generated content.**

`server/index.js` runs `helmet({ contentSecurityPolicy: false })`. That is acceptable *today*
because every `v-html` call renders content from this repo or from admin-only files:

- `client/src/components/ContentPage.vue`
- `client/src/views/CoverLetterView.vue`
- `client/src/views/WorkLogView.vue`

The moment member-submitted HTML reaches any of those, it becomes a **stored-XSS path to the
admin session cookie**. The cookie is `httpOnly`, so script cannot read it directly, but XSS
can still act as the admin inside the page.

Pair both changes when that feature lands:

1. **Server-side sanitization** of anything user-submitted (allow-list, not blocklist).
2. **Re-enable CSP** in helmet, and adjust until the site works without `unsafe-inline`.

Doing only one of the two is not enough.

---

## 3. Back up the SQLite database

`server/data/alienworld.db` lives in the `app-data` Docker volume on a single CVM. It holds all
user accounts and sessions. There is currently **no backup** — losing the instance loses every
registered account.

This matters more once registration is public and real members exist. A scheduled dump to COS
is the natural fit (COS is already used for the other seekschool sites — see
`docs/infrastructure_notes.md`).

Note the CVM is a **monthly subscription**; a lapsed renewal is a real data-loss path.

---

## 4. Fix the Playwright / Chromium version mismatch

The Playwright MCP server's bundled `playwright-core` expects Chromium build **1237**; build
**1223** is what is installed locally. Browser automation fails with *"Executable doesn't
exist"* until:

```bash
npx playwright install chromium
```

This blocks the browser-verification step of `/frontend-beautify`.

---

## 5. Routing/CDN approach — DECIDED

**Resolved 2026-08-11: direct `A` record, no CDN.** Rationale in
`docs/infrastructure_notes.md`. Reversible later for the cost of DNS + certificate + an nginx
tweak, with no code changes.

Prerequisites are now all settled (2026-08-11):

- DNS `A` record created and propagated → `119.28.71.31`
- security group already allowed 80/443 from anywhere — it was never a blocker; the ports
  simply had nothing bound to them
- **no host nginx exists** (`ss -tlnp` shows nothing on 80/443), so the stack runs its own
  nginx + certbot containers

Still outstanding: set a Tencent billing alert (the instance is billed by traffic).

Port map confirmed on the CVM 2026-08-11 (`docker ps -a`): **3000** seekschool-backend-prod,
**3001** seekschool-backend-preprod (stopped), **3002** seekspot-backend-sandbox, **3003**
seekspot-backend-demo. Those publish on `0.0.0.0`, so the security group being scoped to 80/443
is the only thing keeping them off the internet — keep it narrow. alienworld uses **3010**,
published on `127.0.0.1` only, leaving 3011+ for future hobby projects.

---

## 6. Extract a shared `hobbies-gateway` (nginx + certbot)

**Trigger: when a second project joins `hobbies.seekschool.nz`.** Do not do it before then —
for a single app it is pure overhead.

### The problem it fixes

nginx and certbot currently live inside **alienworld-web's** `docker-compose.yml`. That makes
alienworld the front door for the entire subdomain, so once project #2 exists:

- project #2's traffic routes through **alienworld's** nginx container
- `docker compose down` in alienworld-web takes project #2 offline with it
- the certificate for `hobbies.seekschool.nz` is managed inside one app's project, though it
  covers all of them
- every new project means editing `nginx/conf.d/alienworld.conf` in **this** repo

### The shape

A small separate compose project — nginx + certbot only, owning 80/443, the certificate volumes,
and one `location` block per app — plus a shared external Docker network:

```bash
docker network create hobbies-net
```

Each app then:

- **stops** publishing 80/443 and stops shipping an nginx service
- joins `hobbies-net` as an external network
- is reached by the gateway as `<service>:<port>` over that network, exactly as
  `proxy_pass http://app:3010` works today

Nothing in the application code changes — `BASE_PATH`, the Vite `base`, and the sub-path
handling are all unaffected. It is purely a question of which compose project owns the
front door.

### Migration note

The certificate lives in the `certbot-certs` volume of *this* project. Moving it means either
re-issuing with certbot in the new gateway project (simplest — Let's Encrypt is free and
scriptable) or copying the volume across.

---

## 7. Stop nginx crash-looping when the app is down

**Found during the 2026-08-13 deployment.** An unset `SESSION_SECRET` made the app exit on
boot — correct fail-fast behaviour. But nginx then crash-looped *alongside* it:

```
nginx: [emerg] host not found in upstream "app" in /etc/nginx/conf.d/alienworld.conf:32
```

nginx resolves upstream hostnames **once, at startup**. With no running `app` container, `app`
does not exist in Docker's DNS, so nginx refuses to start and Docker restarts it forever with
growing backoff. Net effect: **one bad `.env` took down the web server too**, and recovery
needed a manual `docker-compose restart nginx` even after the app was healthy.

Two independent fixes, ideally both:

1. **Healthcheck + ordered start.** Give `app` a healthcheck hitting
   `/alienworld/api/health`, and make nginx `depends_on: { app: { condition: service_healthy } }`.
   `depends_on` alone only waits for the container to *start*, not to be usable.
2. **Defer DNS resolution** so nginx starts regardless of the app's state:
   ```nginx
   resolver 127.0.0.11 valid=10s;          # Docker's embedded DNS
   set $upstream http://app:3010;
   proxy_pass $upstream$request_uri;
   ```
   ⚠️ Using a variable in `proxy_pass` changes URI handling — nginx no longer forwards the
   original URI automatically, hence the explicit `$request_uri`. Verify the sub-path still
   works end to end after this change; getting it wrong silently breaks `/alienworld/`.

Fix 1 is the safer starting point. Fix 2 is what makes nginx genuinely independent — worth
having before a second project shares this gateway (§6), where an app crash must not take down
everyone else's site.
