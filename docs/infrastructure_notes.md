# Infrastructure Notes — seekschool.nz

Mapped 2026-08-11 while planning the alienworld deployment. Reference material; the
step-by-step is in `docs/deployment_guide.md`.

Most of this was **not obvious from the DNS zone alone** and took probing to establish, so it is
recorded to avoid re-deriving it.

## Two independent hosting environments

The `seekschool.nz` zone spans two unrelated providers:

| Environment | Serves | Evidence |
|---|---|---|
| **1stDomains Plesk** (NZ, `210.5.50.144`) | `seekschool.nz`, `www`, `ftp`, and all mail (`MX`, SPF, DMARC, `webmail`, `autodiscover`) | reverse DNS → `plesk-lnx11.1stdomains.net.nz` |
| **Tencent Cloud** | `app`, `preprod`, `sandbox` — all CNAMEs to `*.eo.dnse5.com` (EdgeOne) | `Server: tencent-cos` in responses |

`210.5.50.144` is the **root website's** IP. It is *not* the CVM.

## The surprise: every EdgeOne subdomain is backed by COS, not the CVM

`app`, `preprod`, and `sandbox` all return `Server: tencent-cos` with `x-cos-request-id` —
they are **EdgeOne → COS** (object storage) static sites.

**The CVM is currently the origin for nothing.** Consequences:

- The CVM's public IP had never appeared in public DNS until `hobbies` was added.
- Its 80/443 answer **Connection refused** — but *not* because of the firewall. Security group
  `sg-89tmzt27` has allowed `TCP:80` and `TCP:443` from `0.0.0.0/0` and `::/0` since the
  instance was created. Nothing is **bound** to those ports, so the host returns a TCP RST.
  (A firewall block drops packets and the client times out; a refusal proves the packet
  arrived. The distinction is worth remembering — it was initially misdiagnosed as a
  security-group problem.)
- Exposing the CVM therefore exposes **only** the alienworld app — it is not shielding
  `app`/`preprod`/`sandbox`, because those never touch it.

That last point corrected an earlier assumption that opening the CVM would weaken the other
sites. It would not.

### Why alienworld cannot follow the COS pattern

COS serves **static files only**. alienworld-web is dynamic — Express, SQLite, sessions, admin
auth — so it needs the CVM. Copying the `preprod` pattern is not an option; the choice is
between *direct to CVM* and *EdgeOne → CVM origin*.

## The CVM

| | |
|---|---|
| Name / ID | `seekschool-app-hk` / `ins-o2071wyw` |
| Region | Hong Kong Zone 3 → **no ICP filing needed** |
| Public IPv4 | **119.28.71.31** |
| Private IPv4 | `172.19.0.10` (`vpc-5l87q0k2` / `subnet-k1pgpuzx`) |
| Spec | SA2.MEDIUM2 — 2 vCPU, **2 GiB RAM**, 30 GiB SSD |
| Bandwidth | 10 Mbps, billed by traffic |
| OS | Ubuntu Server 22.04 LTS |
| Docker | 28.2.2 (Ubuntu `docker.io` build) |
| Compose | **v2.40.3 as the standalone `docker-compose` binary at `/usr/local/bin/docker-compose`** (manually installed, not an apt package) — `docker compose` (plugin form) is *not* available. Cron jobs must use the full path; cron's `PATH` does not include `/usr/local/bin` |
| Billing | **Monthly subscription**, expiry `2026-08-19`, auto-renew on |
| Ports in use | Confirmed 2026-08-11 via `docker ps -a`: **3000** seekschool-backend-prod, **3001** seekschool-backend-preprod *(stopped for now)*, **3002** seekspot-backend-sandbox, **3003** seekspot-backend-demo. All published on `0.0.0.0` — only the 80/443-scoped security group keeps them off the internet. alienworld uses **3010** on `127.0.0.1` only; 3011+ left free for future hobby projects |
| Security group | `sg-89tmzt27` — `TCP:80` + `TCP:443` from `0.0.0.0/0` and `::/0`; plus an ALL-ports rule for `192.168.0.0/16`, which is a **no-op** since this VPC subnet is `172.19.x` |
| DNS | `hobbies.seekschool.nz` → `A` → `119.28.71.31`, created and propagated 2026-08-11 |

**Memory headroom is adequate.** Measured on the box: 1.2 GiB available plus 1.7 GiB free swap
(2 GiB swap already configured — no need to add any). A `docker compose up -d --build` running
`npm ci` + a Vite build fits comfortably; the client bundle is only ~110 KB.

⚠️ **The monthly subscription is a data-loss path.** A lapsed renewal means the instance stops
and is eventually reclaimed, taking the `app-data` volume — and every user account — with it.
See `docs/todo/future_work.md` §3.

## Decision: direct A record (decided 2026-08-11)

**`hobbies.seekschool.nz` → `A` → `119.28.71.31`, no CDN.** EdgeOne was considered and rejected.

| | Direct `A` → `119.28.71.31` | EdgeOne → CVM origin |
|---|---|---|
| Security group | needs `0.0.0.0/0` on 80/443 | needs EdgeOne origin-pull ranges |
| TLS | `certbot --nginx` on the host | EdgeOne-managed certificate |
| nginx config | as written in the repo | no TLS block, no HTTP→HTTPS redirect, must forward `X-Forwarded-Proto` |
| Cache risk | none — no cache layer | **must exclude `/alienworld/api/*`** or admin content leaks |
| `trust proxy` | `1` is correct | two hops — must be revisited |
| Gains | simplicity | DDoS absorption, WAF, mainland acceleration |

### Why direct won

1. **Mainland acceleration — EdgeOne's main structural advantage — does not apply.** It is why
   `preprod`/`sandbox` use it, but this site's audience is NZ/international recruiters.
2. **A cache in front of an authenticated app is a new leak path** for exactly the data that
   matters (`/api/protected/*`). Adding a CDN *for* safety would have introduced a risk that
   does not exist today.
3. **The origin-exposure argument was wrong.** Opening this CVM exposes only this app — the
   other subdomains are COS-backed.
4. **Fewer failure modes**: `trust proxy: 1` stays correct, no `X-Forwarded-Proto` trap, no
   cache rules to misconfigure.

### What direct gives up, and the cheaper mitigations

| Given up | Mitigation |
|---|---|
| DDoS absorption at the edge | Tencent's free Anti-DDoS Basic covers CVM public IPs; **set a billing alert** — the instance is billed *by traffic* |
| WAF in front of login | Rate limiting already caps `/login` at 20 per 15 min |
| Origin IP hidden | Open **only** 80/443 in the security group, and keep a catch-all nginx block returning `444` for unknown `Host` headers |
| Mainland speed | Not a target audience |

**Reversible**: switching to EdgeOne later is DNS + certificate + an nginx tweak, with **no code
changes**. See `docs/security_model.md` for the two mandatory CDN requirements if that day comes.

## Verification method

Findings above came from outside the CVM:

```bash
nslookup 210.5.50.144                       # -> plesk-lnx11.1stdomains.net.nz
curl -sI https://preprod.seekschool.nz/     # -> Server: tencent-cos
curl --max-time 12 http://119.28.71.31/     # -> no connection (control hosts succeed)
```

The control test matters: `example.com`, `seekschool.nz`, and `preprod.seekschool.nz` all
responded from the same machine, so the CVM failure is real and not a local network limitation.
