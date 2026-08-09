# Deploy on a VPS with Coolify

**One DigitalOcean VPS + Coolify hosts all your client storefronts.** Each site is
one container with its own Postgres, its own domain, and its own uploaded-images
volume — deployed from **its own repo**. This guide is both the *why* and the
step-by-step *how*. Nothing here needs you to touch code — the deploy files already
exist in the repo (`Dockerfile`, `deploy/`).

---

## Why this setup

The old way rented **four managed services per site** (Vercel + Render + Neon +
Cloudinary). Fine for one site; for five it's ~20 accounts, dashboards and bills —
that sprawl was the "mess". Instead: **one server hosts them all**, each site still
fully isolated.

Two layers people confuse — they work *together*, not alternatives:

- **VPS provider = the landlord.** Rents the Linux box, billed monthly.
  **DigitalOcean** to start (friendliest UI + best tutorials); **Hetzner** later
  (~half the cost — a painless move, since everything is a container).
- **Coolify = software you install on that box.** A Vercel-like dashboard: connect
  a repo, click deploy, automatic HTTPS. Free and open-source.

Because this backbone's backend also serves its own built frontend, each site is
just **1 app + 1 Postgres + 1 domain** — no separate frontend host, no CORS.

### One repo per client (important)

Your client sites are **not** all in one repo. Each client is its **own private
repo** — a copy of this backbone template (see [CLIENT_MANUAL.md](CLIENT_MANUAL.md)).
Coolify connects to **each repo separately** and runs it on the same box:

```
  website-backbone (this template repo)
        │  clone per client
        ├──▶ client-acme    (private repo)  ─┐
        ├──▶ client-zuck     (private repo)  │  Coolify connects to each repo
        └──▶ client-…         (private repo) ─┘  as its own app…

              ┌──────────────── one DigitalOcean VPS ────────────────┐
              │  Coolify ─ Traefik proxy (auto-HTTPS per domain)      │
              │   acme.com ─▶ [ app ] ─▶ [ postgres ] + uploads-vol   │
              │   zuck.com ─▶ [ app ] ─▶ [ postgres ] + uploads-vol   │
              │   …                                                   │
              └────────────────────────────────────────────────────────┘
```

So: **different repos, one box.** Each repo builds with its own `CLIENT` (the
`clients/<name>/config.js` inside that repo) and is otherwise independent — separate
database, images, domain, and deploys. The `demo` client is just the template's
example; you rarely deploy the backbone itself.

### Cost

| Item                          | Cost                       |
|-------------------------------|----------------------------|
| DigitalOcean droplet (all sites) | ~$12–24/mo total        |
| Hetzner alternative           | ~€4.5–8/mo total           |
| Coolify                       | free (open-source)         |
| Postgres + images             | included (on the box)      |
| Cloudinary + Neon             | **$0 — removed**           |

### It still scales

- Busy box → **resize the droplet** (more CPU/RAM) in a couple of clicks.
- One site blows up → **move just that container to its own box** — it's portable.
- Sites share the box's CPU/RAM/disk, which is a non-issue for small storefronts;
  containers keep the processes and databases isolated.

---

## 0. What each site is made of

| Piece            | How it's provided                                              |
|------------------|----------------------------------------------------------------|
| App (API + site) | that client's repo, built by the `Dockerfile` with `CLIENT=<name>` |
| Database         | one Postgres per site (Coolify one-click)                      |
| Images           | saved to disk on a **persistent volume** at `backend/uploads`  |
| Domain + HTTPS   | set in Coolify; Let's Encrypt certificate is automatic         |

---

## 1. Create the DigitalOcean droplet

1. DigitalOcean → **Create → Droplet**.
2. **Ubuntu 24.04 LTS** (22.04 is fine too).
3. Size: **2 GB RAM minimum** ($12/mo) for a few small sites; **4 GB** ($24/mo) is
   comfortable for ~5. You can resize later.
4. Region: closest to your customers. Add your SSH key. Create.
5. Note the droplet's **public IP**.

## 2. Install Coolify

SSH in and run the official installer:

```sh
ssh root@YOUR_DROPLET_IP
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

When it finishes, open `http://YOUR_DROPLET_IP:8000`, create the admin account, and
you're in. (First run also sets up the built-in Docker + Traefik proxy that
terminates HTTPS for every site.)

## 3. Point your domains at the droplet

### 3a. You need a real domain — the free default will not do

Coolify hands every new app a free hostname like `http://<droplet-ip>.sslip.io`.
It is fine for a first smoke-test and **useless past that**, because it can never
have HTTPS: `sslip.io` is one domain shared by everyone on the internet using that
trick, so it sits permanently at Let's Encrypt's rate limit. Coolify itself warns
you if you try. See the "http-only looks broken on phones" trap in 3d.

**Buy one domain for yourself, not one per client demo.** A single domain gives
unlimited subdomains for free:

| Subdomain                        | Used for                         |
|----------------------------------|----------------------------------|
| `demo.yourdomain.com`            | the backbone/template demo       |
| `acme.yourdomain.com`            | Acme's pre-signature demo        |
| `<next-prospect>.yourdomain.com` | every future pitch               |

When a client signs, **they** buy their own domain (`acme.com`) and you point their
site at it; your demo subdomain is recycled for the next prospect.

Registrar: Namecheap or Porkbun, ~$10-15/yr for a `.com`. At checkout **decline
PremiumDNS, the SSL certificate, and the hosting trial** — the SSL one especially,
since Let's Encrypt gives you certificates free through Coolify (step 5d). Keep the
free WHOIS privacy. Check the **renewal** price, not the first-year promo price.

### 3b. The two A records

At the registrar's DNS panel (Namecheap: **Domain List → Manage → Advanced DNS**),
first **delete the default parking records** — a `CNAME www → parkingpage...` and a
`URL Redirect @` — then add:

| Type     | Host | Value            | TTL       |
|----------|------|------------------|-----------|
| A Record | `@`  | `YOUR_DROPLET_IP`| Automatic |
| A Record | `*`  | `YOUR_DROPLET_IP`| Automatic |

- `@` means **the bare domain itself** → `yourdomain.com`
- `*` is a **wildcard**: it means *any subdomain you haven't listed explicitly* →
  `demo.yourdomain.com`, `acme.yourdomain.com`, anything.

The wildcard is the whole trick behind the one-domain-many-demos table above.
Without it, every new client demo means another trip to the registrar and another
propagation wait. With it you invent the subdomain **in Coolify only** (step 5d)
and it resolves instantly, because DNS already answers for every name.

On Namecheap the row is not saved until you click the **green checkmark** at the end
of it. This is the most common place to get stuck.

### 3c. Wait for propagation, and verify before touching Coolify

Existing domain, changed record: a few minutes. **Brand-new registration: 5-30
minutes or more**, because the registry has to publish the domain to the world's
nameservers before anything can resolve it.

```sh
# Does the world see it yet?   (Windows PowerShell)
Resolve-DnsName yourdomain.com -Type A -Server 8.8.8.8
```

If that says **"DNS name does not exist"**, ask whether your records are even
saved by querying the registrar's own nameserver directly:

```sh
Resolve-DnsName yourdomain.com -Type A -Server dns1.registrar-servers.com
```

- Registrar answers with your IP, but `8.8.8.8` says no → **records are correct,
  the registry just hasn't published yet. Wait.**
- Registrar also says no → the records really are missing or unsaved. Go fix 3b.

**Do not run step 5d until `8.8.8.8` resolves.** Let's Encrypt validates by fetching
your domain over the public internet; if DNS isn't live, the certificate fails and
it looks like a Coolify bug when it isn't.

### 3d. Trap: an `http://` domain looks *completely broken* on phones

Publish a site as `http://…` in Coolify and it will work perfectly on your desktop
and appear **dead** on every iPhone — a blank page reading `no available server`.

Why: iOS Safari auto-upgrades links to HTTPS (a link tapped from WhatsApp too).
Coolify only created a Traefik router on port 80, so the port-443 request matches no
site and falls through to Traefik's empty fallback service, which replies `503 no
available server`. Safari's usual "https failed, retry http" rescue does **not**
kick in, because a 503 is a valid response, not a connection failure.

Diagnose it in ten seconds from any machine:

```sh
curl -s -o /dev/null -w "http  %{http_code}\n"  http://yoursite.com/
curl -sk -o /dev/null -w "https %{http_code}\n" https://yoursite.com/
```

A healthy `200` on http next to `503` on https means **"no TLS configured"** — not
"the app is down". Fix it in step 5d, not by redeploying the app.

## 4. Connect your GitHub repos

In Coolify: **Sources / Keys → GitHub** → install the Coolify GitHub App and give it
access to **each client's private repo** (and this backbone if you deploy the demo).
Coolify can then pull each repo and auto-deploy on every push.

## 5. Deploy a site (repeat this per client)

Create a **Project** (e.g. "Acme"), then add resources to it:

### 5a. The database
- **+ New Resource → Database → PostgreSQL** (v16).
- Coolify generates a strong password. Note the **internal connection string** it
  shows (like `postgres://postgres:...@<service>:5432/postgres`) — you'll paste it
  into the app.
- Turn on **Scheduled Backups** for this database (daily).

### 5b. The app
- **+ New Resource → Application → from that client's GitHub repo**, pick the branch
  (`main`).
- **Build Pack: Dockerfile** (NOT Nixpacks — we need the `CLIENT` build arg).
- **Build argument:** `CLIENT` = the client folder inside that repo, e.g. `acme`.
- **Port:** `3001`.
- **Environment variables** (Coolify → the app → Environment):

  | Variable              | Value                                                        |
  |-----------------------|--------------------------------------------------------------|
  | `DATABASE_URL`        | the internal connection string from 5a                       |
  | `DATABASE_SSL`        | `off`  ← required; the in-box Postgres has no TLS             |
  | `STORAGE_PROVIDER`    | `local`                                                      |
  | `JWT_SECRET`          | output of `npm run gen-secret`                                |
  | `ADMIN_PASSWORD_HASH` | output of `npm run hash-password`                            |
  | `PORT`                | `3001`                                                       |
  | `CORS_ORIGIN`         | leave empty (single origin)                                  |
  | `PUBLIC_BASE_URL`     | leave empty (single origin)                                  |

  (Generate the two secrets from that repo on your own machine: `npm install` once,
  then `npm run gen-secret` and `npm run hash-password`.)

### 5c. Persist the images
- App → **Storage → Add Persistent Storage**.
- Mount path: **`/app/backend/uploads`**. Keeps uploaded product photos across
  redeploys. (Name the volume per-site, e.g. `acme-uploads`.)

### 5d. Domain + automatic SSL
- App → **Configuration → General → Domains** → enter `https://acme.com`.
  For a not-yet-signed prospect, use a subdomain of your own domain instead —
  `acme.yourdomain.com` — which already resolves thanks to the `*` record in 3b.
- **Always type the `https://` prefix. Never `http://`.** That prefix is the entire
  instruction to Coolify: it is what makes Traefik create a port-443 router and ask
  Let's Encrypt for a certificate. An `http://` domain produces a site that works on
  your desktop and looks dead on every phone (trap 3d).
- Turn on **Force HTTPS** if the toggle is present, so http visitors are redirected
  up instead of you having two versions of the site.
- Save, then **Redeploy** — the proxy rules are regenerated on deploy, so a Save
  alone can leave the old routing in place.
- Coolify requests the **Let's Encrypt** certificate automatically (this is why
  step 3's DNS must already resolve publicly). HTTPS + renewal are hands-off.
- Verify from your own machine, not from your phone — Safari caches certificates and
  will keep showing you a stale result:
  ```sh
  curl -s -o /dev/null -w "%{http_code}\n" https://acme.com/   # 200, no -k needed
  ```
  Needing `-k` to get a 200 means the certificate is self-signed — Let's Encrypt
  failed. Check the deployment logs; the usual cause is DNS not resolving yet (3c).

### 5e. Deploy + seed once
- Click **Deploy**. Coolify builds the image and starts the container; migrations
  run automatically on start.
- Load products once (from that client's config into its DB). App → **Terminal**:
  ```sh
  node backend/scripts/seed.js
  ```
- Live at `https://acme.com`.

## 6. Repeat for every client

Same steps per client: its own repo → new Project → its own Postgres → its own app
(its `CLIENT` build arg + its own domain) → its own uploads volume → deploy → seed.
Each site is fully isolated: own repo, own DB, own images, own domain.

## 7. Backups (do this once)

- **Database:** Coolify's scheduled Postgres backups (5a) cover it.
- **Images:** copy `deploy/backup.sh` onto the droplet and add a cron entry so the
  uploaded photos are archived too:
  ```sh
  crontab -e
  # add (one line per site):
  0 3 * * *  DB_CONTAINER=<db> UPLOADS_VOLUME=<vol> /opt/backups/backup.sh
  ```
  (`docker ps` / `docker volume ls` give the real container and volume names.)
- **Whole box:** optionally enable **DigitalOcean weekly droplet backups** for a
  belt-and-suspenders snapshot.

---

## Verify with your own eyes

For each site, after deploy:

1. `https://acme.com` loads the storefront over HTTPS (padlock, valid cert).
2. `https://acme.com/api/health` returns `{"ok":true,"db":true}` (`db:true` proves
   the database is connected; `false` means `DATABASE_URL` is wrong).
3. Log in at `https://acme.com/admin`.
4. Upload a product image, then **redeploy** the app — the image still loads (proves
   the persistent volume works).
5. Coolify shows the container **Healthy** (that's the `/api/health` HEALTHCHECK).

The full app-behavior checklist (orders transactional, overselling impossible,
failure-safe, etc.) and the known limits live in [DEPLOY.md](DEPLOY.md) §3 and §5.

---

## Alternative: raw Docker Compose (no Coolify)

To skip Coolify on a plain VPS, each client repo ships a ready stack:

```sh
git clone https://github.com/idobadash-dev/<client-repo>.git
cd <client-repo>/deploy
cp .env.site.example .env      # fill in CLIENT, JWT_SECRET, ADMIN_PASSWORD_HASH, DB_PASSWORD
docker compose up -d --build
docker compose exec app node backend/scripts/seed.js   # one-time
```

You'd then put a reverse proxy (Caddy/Traefik/Nginx) in front for domains + HTTPS —
which Coolify does for you, which is why it's the recommended path.
