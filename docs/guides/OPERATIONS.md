# Operating your sites on Coolify — cheat sheet

Day-to-day running of the storefronts you host on **one VPS + Coolify** (see
[DEPLOY_VPS.md](DEPLOY_VPS.md) for the first-time setup). This is the "how do I…?"
and "why did it break?" reference. No secrets live here — your IPs, passwords and
connection strings stay in each project's gitignored `.env`.

---

## Where things live

| Thing | Location |
|---|---|
| Coolify dashboard | `http://<DROPLET_IP>:8000` |
| A site (public) | its domain, e.g. `http://<something>.sslip.io` (or your real domain) |
| A site's admin | `<site>/admin` — password = that site's `ADMIN_PASSWORD_HASH` source password |
| A site's health | `<site>/api/health` → `{"ok":true,"db":true}` when healthy |
| Server shell | DigitalOcean → droplet → **Web Console** (root shell, has `docker`) |

Coolify names containers after the resource's short id: the **app** container looks
like `n12623cs3r0nb4a3d792utk5-<timestamp>`, the **Postgres** like
`og710nyhzu5lhvmgr6p0uh80-<timestamp>`. Find them with `docker ps`.

---

## Day-to-day tasks

- **Ship a code update:** `git push` to `main` → Coolify auto-deploys (the GitHub
  App added a webhook). Or open the app → **Deploy** to redeploy manually.
- **See logs:** app → **Logs** tab (or `docker logs <container>` from the Web Console).
- **Restart / stop:** buttons top-right on the app page.
- **Change a setting/secret:** app → **Environment Variables** → edit → **Deploy**
  (env changes only take effect on a redeploy).
- **Run a command in a container** (migrations, seed, one-offs): use the
  DigitalOcean **Web Console** + `docker exec` (reliable, avoids the flaky in-browser
  terminal):
  ```sh
  docker exec $(docker ps -q -f name=<app-id>) node backend/scripts/seed.js
  ```

---

## Monitoring & capacity (your $18 box, flat-priced)

The droplet is a **flat $18/mo** — you don't get billed by usage, you just have a
fixed **2 vCPU / 2 GB RAM / 60 GB disk**. "Staying in budget" = fitting your sites
in that RAM/disk, not watching a meter.

- **Whole box:** Coolify → **Servers → localhost**, or DigitalOcean → droplet →
  **Graphs**. Watch **Memory**.
- **Per site:** app → **Metrics** tab (that container's CPU/RAM).
- **Rule of thumb:** Coolify itself uses ~1 GB; each site ~0.2–0.3 GB → about
  **4–5 small sites** on 2 GB. When **Memory** sits above **~85%**, resize the
  droplet to 4 GB ($24) — a couple of clicks, no rebuild.
- **Cap a site** so it can't hog the box: app → **Resource Limits** → set a Memory
  Limit (e.g. `384M`) and CPU (e.g. `0.5`).

---

## Gotchas cheat-sheet (you WILL hit these on each new site)

**Creating the app**
- Server type = **This Machine**. Build Pack = **Dockerfile** (not Nixpacks — we
  need the `CLIENT` build arg). **Ports Exposes = 3001**. Mount a persistent volume
  at **`/app/backend/uploads`**. After first deploy, run `seed.js` once.
- `DATABASE_SSL=off` — the in-box Postgres has no TLS ("auto" would try TLS on a
  non-localhost host and fail).
- sslip.io works over **http only** (Let's Encrypt rate-limits sslip.io). Use a real
  domain for https.

**`$` in env values gets eaten (bcrypt admin hash login fails)**
Coolify interpolates `$…` in env values, so `ADMIN_PASSWORD_HASH=$2a$10$sf20…`
loses the `$sf20…` chunk → "Wrong password".
- Fix: turn on the per-variable **"Is Literal?"** toggle (or double every `$`→`$$`),
  then redeploy.
- Verify: `docker exec $(docker ps -q -f name=<app-id>) printenv ADMIN_PASSWORD_HASH`
  → should show the full `$2a$10$sf20…`.

**"password authentication failed for user postgres" (even when passwords look equal)**
Coolify's one-click Postgres password can drift from the one the container was
actually initialized with; long random passwords also hide look-alike chars (l vs I).
Reset to a **simple, unambiguous** password and sync it everywhere:
```sh
# 1) set a clean password on the running DB (local socket = trust, no pw needed)
docker exec $(docker ps -q -f name=<db-id>) psql -U postgres -c "ALTER USER postgres PASSWORD 'SimplePass2468';"
# 2) prove it works over the network
docker exec $(docker ps -q -f name=<db-id>) psql "postgresql://postgres:SimplePass2468@127.0.0.1:5432/postgres" -c "SELECT 'DB-OK';"
# 3) run migrations + seed with the new password inline
docker exec $(docker ps -q -f name=<app-id>) env DATABASE_URL="postgres://postgres:SimplePass2468@<db-id>:5432/postgres" DATABASE_SSL=off node backend/scripts/migrate.js
docker exec $(docker ps -q -f name=<app-id>) env DATABASE_URL="postgres://postgres:SimplePass2468@<db-id>:5432/postgres" DATABASE_SSL=off node backend/scripts/seed.js
```
Then set that same password in **both** the app's `DATABASE_URL` **and** the Coolify
Postgres **General → Password** field, and **redeploy** the app.

> **Keep that database internal-only.** A simple password is a fine trade *only* because
> nothing outside the app container can reach the DB. Never flip Coolify's "Make it
> publicly available" toggle on a storefront Postgres just to run a query — use
> `docker exec … psql` from the Web Console. See [SECURITY.md](SECURITY.md) §S6.

**"Cannot connect to real-time service" popup**
Cosmetic (Coolify dashboard live-updates). Run container commands from the
DigitalOcean **Web Console** with `docker exec …` instead of the in-browser terminal.

---

## Add a new client site (repeatable checklist)

1. Make sure that client's **repo** has the deploy files (`Dockerfile`, `deploy/`).
   A repo cloned before they existed needs them synced in from the backbone.
2. Coolify → **new Project** (e.g. "Acme").
3. **+ New Resource → PostgreSQL** → Deploy → note its internal URL → turn on
   scheduled backups. (Set a simple password up front to dodge the drift gotcha.)
4. **+ New Resource → Application → the client's repo**, branch `main`,
   Build Pack = **Dockerfile**, build arg `CLIENT=<client>`, Port `3001`.
5. Env vars: `DATABASE_URL` (internal), `DATABASE_SSL=off`, `STORAGE_PROVIDER=local`,
   `PORT=3001`, `JWT_SECRET` (`npm run gen-secret`), `ADMIN_PASSWORD_HASH`
   (`npm run hash-password`, **"Is Literal?"** on).
6. **Storage** → volume at `/app/backend/uploads`.
7. **Domains** → the site's domain (real domain for https).
8. **Deploy** → then run `seed.js` once. Verify with the checklist below.

---

## Verify a site (trust checklist)

1. `<site>` loads the storefront with products.
2. `<site>/api/health` → `{"ok":true,"db":true}`.
3. `<site>/admin` → login works, Products tab lists products (no "Server error").
4. Upload an image in admin → redeploy → image still loads (volume works).
5. Coolify shows the app **Healthy**.

The deeper app-behaviour checks (orders transactional, overselling blocked, etc.)
and known limits are in [DEPLOY.md](DEPLOY.md) §3 and §5.

---

## Backups & https (don't forget)

- **Database:** Coolify scheduled Postgres backups (per DB). **Images:**
  `deploy/backup.sh` on a cron. Optionally DigitalOcean weekly droplet snapshots.
- **HTTPS:** point a real domain at the droplet IP, set the site's domain to
  `https://…` in Coolify → automatic Let's Encrypt cert. (Only sslip.io can't.)
  An http-only site sends the **admin password in cleartext** — demos only.
- **Security:** the droplet needs a one-time hardening pass (firewall, fail2ban,
  key-only SSH, locking down the `:8000` dashboard — it controls *every* client
  site). Steps and the per-site pre-launch checklist: [SECURITY.md](SECURITY.md).
