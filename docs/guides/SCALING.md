# Scaling & resource monitoring — a VPS is not a metered PaaS

How to watch your server, understand per-site usage, and grow when you outgrow the
box. This is the "will it hold?" and "what do I do when it won't?" guide. For
day-to-day operations see [OPERATIONS.md](OPERATIONS.md); for first-time setup see
[DEPLOY_VPS.md](DEPLOY_VPS.md).

---

## 1. The mindset shift (why this matters)

On **Vercel / Render / Neon** you are billed **per usage** — requests, bandwidth,
compute-seconds, rows. So you track each project's metrics to control the **bill**,
and a traffic spike can cost you money.

On **your own VPS** you pay a **flat price** (currently $18/mo) for fixed hardware.
There is **no per-site bill**. The box costs the same whether it's idle or maxed
out. That changes what you monitor:

| | Metered PaaS (Vercel/Render) | Your VPS |
|---|---|---|
| Why you watch usage | to control the **bill** | to avoid **running out of hardware** |
| Per-site tracking | essential (per-project billing) | useful for **capacity + debugging**, not money |
| A traffic spike means | a bigger invoice | the box works harder (free), until it's full |
| "Scaling" means | pay for a higher tier | resize the box, or add a box |

**Bottom line:** your main dial is the **box's CPU / memory / disk** (exactly your
instinct). Per-site numbers are a secondary tool for "which site is heavy?" and
"which site's data is growing?" — not a bill to manage.

---

## 2. The box's four resources

| Resource | What runs out means | The limit on your box |
|---|---|---|
| **Memory (RAM)** | sites slow down, then get killed (OOM) — **the first thing to watch** | 2 GB |
| **CPU** | requests get slow under load | 2 vCPU |
| **Disk** | uploads/DB can't write, things break | 60 GB |
| **Bandwidth** | (rarely hit) overage billed ~$0.01/GB | 3 TB/mo included |

For small storefronts, **memory is the binding constraint** — you'll resize for RAM
long before CPU, disk, or bandwidth become an issue.

---

## 3. Monitoring the box (the main thing)

- **Coolify → Servers → localhost** — CPU, memory, disk at a glance.
- **DigitalOcean → droplet → Graphs** — CPU, memory, disk, bandwidth over time.
- **On the box** (Web Console): `free -h` (memory), `df -h /` (disk),
  `docker stats` (live per-container).
- **One command for everything:** `sh deploy/usage.sh` — box totals + per-container
  CPU/RAM + per-volume disk + per-database size, in one report.

**Rules of thumb:** resize when **memory** regularly sits above **~85%** (or it's
using swap), or **disk** above **~80%**.

---

## 4. Per-site usage — yes, you can see it (and here's what for)

Each site is isolated: its own **app container**, its own **Postgres container**,
its own **uploads volume**. So per-site numbers are easy to get. Use them to (a)
spot a runaway/heavy site, (b) set per-site limits, (c) watch which site's **data**
is growing — not to bill anyone.

- **CPU / RAM per site:** Coolify app → **Metrics** tab, or `docker stats`.
- **Disk per site — this is the "storage from each" you asked about:**
  - *Uploaded images:* the site's `uploads` volume — see it in
    `docker system df -v` (VOLUMES table) or via `usage.sh`.
  - *Database size:* `docker exec <db-container> psql -U postgres -c
    "SELECT pg_size_pretty(pg_database_size('postgres'));"`.
  - What grows over time: uploaded product photos (biggest), then orders and
    contact messages. Product/config data is tiny.
- **Cap a site** so one can't starve the others: app → **Resource Limits** →
  Memory Limit (e.g. `384M`) + CPU (e.g. `0.5`).

---

## 5. Scaling paths — what to do when it's getting full

### A. Vertical — make the box bigger (first + easiest)
DigitalOcean → droplet → **Resize**. Options:
- **CPU/RAM resize** (power off ~1 min, resize, power on) — reversible, disk
  unchanged. This is your normal move: 2 GB → 4 GB ($24) → 8 GB ($48)…
- **Disk resize** (grow the SSD) — permanent (can't shrink), do it if disk (not RAM)
  is the constraint.
No rebuild, no redeploy — the containers come back as they were. **Do this first**;
one 4 GB box comfortably holds ~8–10 small sites.

### B. Per-site limits — divide the box you have
Set Memory/CPU limits per app (§4) so the box's RAM is shared predictably and a
spike in one site can't take down the others. Cheapest "scaling" — no new spend.

### C. Horizontal — add a second box (when one isn't enough)
Coolify manages **multiple servers**. Add another droplet under **Servers → + Add**,
connect it, then create/move resources onto it. Your sites are just containers, so
spreading them across two boxes is straightforward. Do this when a single resize
gets expensive or you want isolation.

### D. Move one heavy site to its own box
If a single site outgrows the shared box (lots of traffic/data), give **just that
site** its own droplet — it's portable (a container + a DB + a volume). The other
sites stay put and cheap. This is the honest fix for the "sites share the box, so a
runaway neighbour affects others" trade-off.

### E. Graduate a piece to managed (only if you truly need it)
Rarely necessary at this scale, but the door stays open because everything is
standard:
- **Database** getting big/critical → point `DATABASE_URL` at a managed Postgres
  (Neon/DO Managed) — no code change (it's just a connection string).
- **Images** piling up / want a CDN → implement the reserved `s3`/`cloudinary`
  storage adapter and flip `STORAGE_PROVIDER`. Local-disk-on-a-volume is fine until
  then.

---

## 6. The growth ladder (at a glance)

```
1 cheap box, ~4–5 sites          ← you are here (2 GB, $18)
        │  memory > 85%?
        ▼
Resize the box (4 GB $24 → 8 GB $48), ~8–10+ sites
        │  one box getting pricey / want isolation?
        ▼
Add a 2nd box in Coolify, spread the sites
        │  one single site is a hit?
        ▼
That site → its own box (+ maybe managed DB / object storage)
```

You never rewrite anything to move up a rung — it's resize or re-place containers.
That portability is the real scalability story of this setup.

---

## 7. Command quick-reference (run on the droplet)

```sh
sh deploy/usage.sh          # full box + per-site report (best single command)
free -h                     # memory
df -h /                     # disk
docker stats                # live CPU/RAM per container (Ctrl-C to stop)
docker system df -v         # disk per image / container / VOLUME (per-site storage)
# one site's DB size:
docker exec $(docker ps -q -f name=<db-id>) psql -U postgres -c \
  "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

**Watch memory. Resize when it's tight. Everything else is portable.** That's the
whole scaling story.
