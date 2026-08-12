# Deployment Guide — Tencent Cloud CVM (Hong Kong)

How to deploy alienworld-web to the existing CVM (`seekschool-app-hk`) at

**https://hobbies.seekschool.nz/alienworld/**

**Routing: direct `A` record, no CDN** (decided 2026-08-11). EdgeOne was considered and
rejected — the mainland acceleration that justifies it for `preprod`/`sandbox` is irrelevant for
an NZ/international audience, and putting a cache in front of an authenticated app is the one
new way to leak the admin-only content. It is also cheap to reverse later: DNS + certificate +
an nginx tweak, **no code changes**. Full trade-off in `docs/infrastructure_notes.md`.

**There is no host nginx on this CVM** — verified 2026-08-11, nothing listens on 80 or 443. So
this stack runs its own nginx and certbot containers, and `docker compose up -d` starts all
three services. (An earlier draft of this guide assumed a host nginx; that came from believing
`preprod` was proxied by this CVM. It is not — it is EdgeOne → COS.)

> ✅ **Deployed and live since 2026-08-13.** DNS, security group, certificate, containers and
> the renewal cron are all in place; production verification passed. This guide is now the
> procedure for a **rebuild or a fresh host**, not a pending task. Certificate expires
> **2026-11-10**, renewed weekly by cron.

```
browser ──► nginx container :443 ──────► app container :3010
            hobbies.seekschool.nz        Express + built Vue client
              /alienworld/               reached as `app:3010` over the compose network
```

Port 3010 is published on `127.0.0.1` only, so the app is never directly reachable from the
internet — all traffic goes through nginx.

Port 3010 was chosen because 3000–3003 are already taken by the seekschool/seekspot containers.

## About the sub-path

The site is served under `/alienworld/`, not at the subdomain root, so more hobby projects can
join `hobbies.seekschool.nz` later. The prefix is **not** stripped by nginx — Express mounts the
whole site under it, so the app behaves identically in `npm run dev`, in `npm start`, and in
production. The prefix is set in two places and they must agree:

| Where | Setting |
|---|---|
| `client/vite.config.js` | `base = '/alienworld/'` — baked into built asset URLs at **build** time |
| `docker-compose.yml` | `BASE_PATH: /alienworld` — read by `server/index.js` at **runtime** |

Changing the path means changing both **and rebuilding the image** — the client base is
compiled in, not read from the environment.

## 0. One-time prerequisites

> **Compose command on this CVM.** The box has Docker 28.2.2 with **Compose v2.40.3 as the
> standalone `docker-compose` binary**, not as a `docker compose` CLI plugin — `docker compose`
> returns *unknown command*. It is still V2, so everything in `docker-compose.yml` works
> (`profiles:`, the omitted `version:` key, `${VAR:-default}`).
>
> **Read every `docker compose` below as `docker-compose`**, or register the plugin alias once:
> ```bash
> mkdir -p ~/.docker/cli-plugins
> ln -s "$(which docker-compose)" ~/.docker/cli-plugins/docker-compose
> ```
> Do **not** install Compose V1 — it is end-of-life and cannot parse this file.

1. **DNS**: create an `A` record, host `hobbies` (the label only — the panel appends the zone),
   value **`119.28.71.31`** — the CVM's public IP, see `docs/infrastructure_notes.md`.
   Wait until `nslookup hobbies.seekschool.nz` resolves.
   (CVM is in Hong Kong → no ICP filing needed.)
2. **Tencent security group — already correct, no change needed.** `sg-89tmzt27` allows
   inbound `TCP:80` and `TCP:443` from `0.0.0.0/0` and `::/0`, and has since the instance was
   created.

   Note what this means: 80/443 answering *Connection refused* was **never a firewall issue**.
   A blocked packet is dropped and the client hangs until timeout; a refusal is a TCP RST,
   which only the host sends — i.e. the packet arrived and no process was listening. Keep the
   rules scoped to 80/443 so the containers on 3000–3003 stay unreachable.
3. **Set a billing alert** in the Tencent console. The instance is billed **by traffic**, so a
   flood or a runaway bot shows up as money. This is the cheap answer to the risk a CDN would
   otherwise cover.

*(Already established 2026-08-11: `sudo ss -tlnp | grep -E ':80 |:443 '` returns nothing —
no host nginx exists, which is why this guide runs nginx as a container. Re-run it if the box
changes.)*

## 1. Get the code onto the CVM

```bash
git clone https://github.com/Sachielsc/alienworld-web.git
cd alienworld-web
```

## 2. Configure secrets

```bash
cp .env.example .env
nano .env
```

Fill in:
- `SESSION_SECRET`: output of `openssl rand -hex 32`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: your admin login.

`chmod 600 .env` is a good habit.

## 3. First boot — HTTP only

Chicken-and-egg: nginx will not start while `ssl_certificate` points at a file that does not
exist, and certbot cannot create that file until nginx serves the ACME challenge on port 80.

`nginx/bootstrap/` holds an HTTP-only config for exactly this. Select it with an env var —
**no files are edited or moved**:

```bash
NGINX_CONF_DIR=./nginx/bootstrap docker compose up -d --build
docker compose ps                 # app + nginx should both be Up
```

Check it end to end over plain HTTP before involving TLS:

```bash
curl -s http://hobbies.seekschool.nz/alienworld/api/health   # {"status":"ok"}
```

If that fails, fix it now — certbot will not succeed while the site is unreachable.

## 4. TLS certificate

The nginx and certbot containers share the `certbot-webroot` and `certbot-certs` volumes, so
the webroot challenge works between them:

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d hobbies.seekschool.nz --email sachielsc@gmail.com --agree-tos --no-eff-email
```

## 5. Restore the real config

Drop the env var and compose remounts the real TLS config, recreating the nginx container:

```bash
docker compose up -d
docker compose exec nginx nginx -t      # syntax + certificate both check out now
```

If `nginx -t` reports `host not found in upstream "app"`, the app container is down — nginx
resolves upstream names at startup. Check `docker compose ps` before suspecting the config.

## 5b. Certificate renewal

There is no host certbot timer here, so add a cron entry:

```bash
crontab -e
# add:
0 4 1 * * cd ~/alienworld-web && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```

## 6. Verify

```bash
curl -I  https://hobbies.seekschool.nz/alienworld/            # 200
curl -sI https://hobbies.seekschool.nz/alienworld | head -1   # 301 → /alienworld/
curl -s  https://hobbies.seekschool.nz/alienworld/api/health  # {"status":"ok"}
```

In a browser at `https://hobbies.seekschool.nz/alienworld/`:
- images and fonts load with no 404s in devtools — **this is what a sub-path most often breaks**
- deep links survive a **hard refresh**, e.g. `/alienworld/about/workreport/report1`
- **Sign In** (secret-icon menu → Sign In) with the admin account; confirm Cover Letter and Work
  Log render, then sign out and confirm they show the authorization prompt instead
- the session cookie shows `Path=/alienworld` under devtools → Application → Cookies

## Updating the site later

```bash
cd ~/alienworld-web
git pull
docker compose up -d --build
```

User accounts and sessions survive updates (SQLite lives in the `app-data` volume).

## Rollback

```bash
git log --oneline          # find the last good commit
git checkout <commit>
docker compose up -d --build
```

## Adding a second hobby project to this subdomain

Add it as a service in `docker-compose.yml` and give it a sibling `location` block. Reach it by
**compose service name**, not localhost — inside the nginx container, `127.0.0.1` is the
container itself:

```nginx
location /someproject/ {
    proxy_pass http://someproject:3011;
    # ...same proxy_set_header lines
}
```

Each app scopes its session cookie to its own prefix, so they cannot read each other's sessions.

## If a host nginx is ever added to this box

Then this stack's nginx would conflict with it on 80/443. In that case:

- start the app alone: `docker compose up -d --build app`
- copy `nginx/conf.d/alienworld.conf` into the host nginx as a server block, changing
  `proxy_pass` to `http://127.0.0.1:3010` (the app publishes on localhost)
- use `sudo certbot --nginx -d hobbies.seekschool.nz` for TLS instead of the certbot container,
  and drop the renewal cron in favour of the host's certbot timer

Nothing in the application changes — only who terminates TLS.
