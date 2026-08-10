# Deployment Guide — Tencent Cloud CVM (Hong Kong)

How to deploy alienworld-web v4 to the existing CVM (`seekschool-app-hk`). The stack is
Docker Compose: `app` (Node/Express serving the built Vue client on internal port **3010**)
+ `nginx` (ports 80/443, TLS) + `certbot` (on-demand, certificate issue/renew).

Port 3010 was chosen because 3000–3002 are already taken by the seekschool/seekspot containers.

## 0. One-time prerequisites

1. **DNS**: create an `A` record for your domain (e.g. `alienworld.your-domain.nz`) pointing to the
   CVM's public IP. Wait until `nslookup alienworld.your-domain.nz` resolves.
   (CVM is in Hong Kong → no ICP filing needed.)
2. **Tencent security group**: allow inbound TCP **80** and **443**.
3. **Check nothing on the host uses 80/443** (containers don't, we saw; this checks the host too):
   ```bash
   sudo ss -tlnp | grep -E ':80 |:443 '
   ```
   No output → free, continue. If a host nginx shows up, use the "Existing host nginx" section at the bottom instead of the nginx container.

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

## 3. Set the domain in nginx config

```bash
sed -i 's/YOUR_DOMAIN/alienworld.your-domain.nz/g' nginx/conf.d/alienworld.conf
```

## 4. First start + TLS certificate (bootstrap order matters)

nginx can't start its 443 block before a certificate exists, so first boot runs HTTP-only:

```bash
# temporarily disable the 443 server block (first run only)
sed -i 's/^server {$/#server {/2' nginx/conf.d/alienworld.conf   # or comment the 443 block by hand

docker compose up -d --build          # starts app + nginx (HTTP only)

# issue the certificate via the ACME webroot
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d alienworld.your-domain.nz --email sachielsc@gmail.com --agree-tos --no-eff-email

# restore the 443 block (undo the comment), then:
docker compose exec nginx nginx -s reload
```

Easier alternative for the comment/uncomment dance: keep a copy of the full config
(`cp nginx/conf.d/alienworld.conf /tmp/full.conf`) before commenting, restore it after certbot.

## 5. Verify

```bash
curl -I https://alienworld.your-domain.nz            # 200, HTTP redirects to HTTPS
curl https://alienworld.your-domain.nz/api/health     # {"status":"ok"}
```

In a browser: click through the site, **Sign In** (secret-icon menu → Sign In) with the admin
account, confirm Cover Letter and Work Log render; sign out and confirm they show the
authorization prompt instead.

## 6. Certificate renewal (cron)

Let's Encrypt certs last 90 days. Add a monthly renewal:

```bash
crontab -e
# add:
0 4 1 * * cd ~/alienworld-web && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```

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

## Alternative: existing host nginx on 80/443

If the host already runs nginx, skip the `nginx`/`certbot` containers
(`docker compose up -d --build app` only — the app listens on `127.0.0.1:3010`) and add a
server block to the host nginx that proxies to `http://127.0.0.1:3010` with the same
`proxy_set_header` lines as in `nginx/conf.d/alienworld.conf`, using `certbot --nginx` on the
host for TLS.
