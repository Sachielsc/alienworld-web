# Deployment Guide — Tencent Cloud CVM (Hong Kong)

How to deploy alienworld-web to the existing CVM (`seekschool-app-hk`) at

**https://hobbies.seekschool.nz/alienworld/**

The CVM's **host nginx already owns ports 80/443** for seekschool.nz and its subdomains, so
it terminates TLS and reverse-proxies this app. Only the `app` container is started here; the
`nginx` and `certbot` services in `docker-compose.yml` are for a bare host and stay switched
off behind the `standalone` profile.

```
browser ──► host nginx :443 ──────────► alienworld app :3010 (127.0.0.1, container)
            hobbies.seekschool.nz       Express + built Vue client
              /alienworld/
```

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

1. **DNS**: create an `A` record for `hobbies.seekschool.nz` pointing to the CVM's public IP.
   Wait until `nslookup hobbies.seekschool.nz` resolves.
   (CVM is in Hong Kong → no ICP filing needed.)
2. **Tencent security group**: 80 and 443 are already open for the existing sites.
3. **Confirm the host nginx owns 80/443**:
   ```bash
   sudo ss -tlnp | grep -E ':80 |:443 '
   ```
   Expect an `nginx` master process. If nothing is listening, you have a bare host — use the
   *Bare-host alternative* section at the bottom instead.

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
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: your admin login. **Do not reuse the old site password
  (`scsgdtcy3`) — it is public in git history.** The admin account is (re)seeded from these values
  on every container start, so changing the password here + restarting also rotates it.

`chmod 600 .env` is a good habit.

## 3. Start the app container

```bash
docker compose up -d --build                  # starts `app` only; nginx/certbot are profiled off
curl -s localhost:3010/alienworld/api/health  # {"status":"ok"}
```

The container binds to `127.0.0.1:3010`, so it is not reachable from the internet until nginx
proxies to it.

## 4. Add the server block to the host nginx

`nginx/conf.d/alienworld.conf` in this repo is the reference. If `hobbies.seekschool.nz` has no
server block yet, copy the whole file; if it already has one, copy just the two `location` blocks
into it.

```bash
sudo cp nginx/conf.d/alienworld.conf /etc/nginx/conf.d/hobbies.seekschool.nz.conf
```

nginx will not start with `ssl_certificate` pointing at a file that does not exist yet, so
comment out the whole port-443 block for now, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 5. TLS certificate

Use the **host** certbot — the certbot container shares no state with the host nginx:

```bash
sudo certbot --nginx -d hobbies.seekschool.nz
```

certbot writes the `ssl_certificate` lines and the port-443 block itself. Re-add anything from
the reference config it did not create (the two `location` blocks, the HSTS header), then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Renewal is already handled by the system certbot timer serving the other subdomains — confirm
with `systemctl list-timers | grep certbot`. No extra cron needed.

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

Give it its own port and its own `location` block beside `/alienworld/`:

```nginx
location /someproject/ {
    proxy_pass http://127.0.0.1:3011;
    # ...same proxy_set_header lines
}
```

Each app scopes its session cookie to its own prefix, so they cannot read each other's sessions.

## Bare-host alternative: no host nginx

If nothing owns 80/443, this repo can run its own nginx + certbot. Point `proxy_pass` at the
container (`http://app:3010`) instead of localhost, then:

```bash
# comment out the port-443 block for the first run - no certificate exists yet
docker compose --profile standalone up -d --build

docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d hobbies.seekschool.nz --email sachielsc@gmail.com --agree-tos --no-eff-email

# restore the 443 block, then:
docker compose exec nginx nginx -s reload
```

Add a renewal cron, since there is no system certbot timer in this setup:

```bash
0 4 1 * * cd ~/alienworld-web && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```
