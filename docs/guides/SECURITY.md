# Security — open issues & hardening

The security state of this backbone as built, and what to do about it. Written as a
**register**: every known issue has an id, a severity, and a concrete fix. Nothing here
is theoretical hand-wringing — each item names the file or the Coolify setting.

Read this **before putting a real client's orders behind a deploy**. The app code is in
good shape (see §4); most of the exposure is in *how the box is run*, not in the routes.

**Severity means "what happens when it's exploited":**

| | Meaning |
|---|---|
| **Critical** | Store or server taken over; customer PII leaks. |
| **High** | Business damage without takeover — catalogue trashed, site down, inbox buried. |
| **Medium** | Real weakness, needs another mistake to become damage. |
| **Low** | Hardening / defence-in-depth. |

---

## Status at a glance

| id | Issue | Severity | Where |
|---|---|---|---|
| [S1](#s1--admin-panel-over-plain-http) | Admin panel served over plain HTTP | **Critical** *(demo only)* | Coolify → Domains |
| [S2](#s2--coolify-dashboard-open-to-the-internet) | Coolify dashboard open on `:8000`, no VPS hardening | **Critical** | droplet |
| [S3](#s3--no-rate-limiting-anywhere) | No rate limiting anywhere | **High** | `backend/index.js` |
| [S4](#s4--no-security-headers) | No security headers (no `helmet`) | **Medium** | `backend/index.js` |
| [S5](#s5--rotating-the-admin-password-doesnt-revoke-live-tokens) | Password rotation doesn't revoke live tokens | **Medium** | `backend/auth.js` |
| [S6](#s6--the-deliberately-weak-postgres-password) | Deliberately weak Postgres password | **Medium** | [OPERATIONS.md](OPERATIONS.md) |
| [S7](#s7--container-runs-as-root) | Container runs as root | **Low** | `Dockerfile` |
| [S8](#s8--react-router-advisories) | 2 moderate `react-router` advisories | **Low** | `package.json` |
| [S9](#s9--upload-bytes-arent-validated-as-images) | Upload bytes aren't validated as images | **Low** | `backend/storage/local.js` |

---

## 1. Infrastructure — the live box

### S1 — Admin panel over plain HTTP

**Severity: Critical** (on any http-only deploy; currently the sslip.io demo)

The demo is reachable only over `http://`, because Let's Encrypt rate-limits sslip.io
and won't issue for it ([OPERATIONS.md](OPERATIONS.md) gotchas). That means the login
POST carries **the admin password in cleartext**, and every request after it carries the
Bearer JWT in cleartext. Anyone on the network path — shared wifi, the ISP, the hosting
LAN — reads both and owns the store.

Acceptable for a throwaway demo with a throwaway password. **Not** acceptable the moment
a site holds real orders, because those rows are customer PII (name, phone, email).

**Fix:** point a real domain at the droplet IP, set the site's domain to `https://…` in
Coolify → Domains. Cert issue and renewal are automatic. Then add HSTS via S4.

**Rule:** no client site goes live on an http-only hostname. sslip.io is for demos.

### S2 — Coolify dashboard open to the internet

**Severity: Critical**

[DEPLOY_VPS.md](DEPLOY_VPS.md) §2 has you browse to `http://YOUR_DROPLET_IP:8000` and
stops there. That dashboard controls **every client site on the box** — env vars,
secrets, database credentials, deploy hooks. It is a far bigger prize than any single
storefront, and it's currently addressable by the whole internet. The same section goes
straight from `ssh root@IP` to "you're in": no firewall, no fail2ban, no key-only SSH,
no automatic security updates.

This is the widest gap between what the docs cover and what a public box needs.

**Fix — run once per droplet:**

```sh
# Firewall: public web only; SSH and the Coolify dashboard restricted to you.
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from <YOUR_HOME_IP> to any port 22 proto tcp
ufw allow from <YOUR_HOME_IP> to any port 8000 proto tcp
ufw enable

# Brute-force protection on SSH
apt install -y fail2ban && systemctl enable --now fail2ban

# Unattended security updates
apt install -y unattended-upgrades && dpkg-reconfigure -plow unattended-upgrades
```

Then in `/etc/ssh/sshd_config` set `PasswordAuthentication no` and
`PermitRootLogin prohibit-password`, and `systemctl restart ssh` — **after** confirming
your key works, or you lock yourself out. Turn on 2FA for the Coolify admin account, and
keep Coolify itself updated (its own updater, in Settings).

If your home IP is dynamic, use a VPN/bastion or accept `ufw allow 22` + fail2ban, but
keep `:8000` restricted regardless.

**Blast radius note:** one box hosts *all* clients. A compromise there is a compromise of
every client at once. That's the accepted trade of the one-VPS model — it's the reason
this section isn't optional.

---

## 2. Application code

### S3 — No rate limiting anywhere

**Severity: High** — the top item to fix *in code*.

Nothing throttles any endpoint. Three separate consequences, and the third is the one
that bites first:

**a) Admin login brute force + CPU DoS.** `/api/admin/login`
([admin.js:26](../../backend/routes/admin.js#L26)) can be hammered without limit.
`bcryptjs` is pure JavaScript and CPU-bound, so each attempt **blocks the event loop** —
this is a cheap denial-of-service on a 2 GB droplet, not just a password risk.

**b) Spam floods.** `/api/contact` and `/api/newsletter`
([public.js:119](../../backend/routes/public.js#L119),
[public.js:139](../../backend/routes/public.js#L139)) are unauthenticated database
writes. A bot fills Postgres and buries the client's real messages under junk.

**c) Stock drain — the sleeper.** `POST /api/orders`
([public.js:63](../../backend/routes/public.js#L63)) **decrements stock with no payment
and no verification** — that's by design, since checkout hands off to WhatsApp. But it
means a twenty-line script can walk every product/size and order it to zero. The
storefront then shows "Out of stock" across the entire catalogue, and the client's real
customers can't buy anything. This is a business-level attack, and it works on any
deployed site today regardless of HTTPS.

**Fix:** `npm i express-rate-limit`, then in [index.js](../../backend/index.js) before the
routes:

```js
import rateLimit from 'express-rate-limit';

// Strictest: login is both a credential guess and a CPU burn.
app.use('/api/admin/login', rateLimit({ windowMs: 15 * 60_000, max: 10 }));
// Stock-affecting and inbox-affecting public writes.
app.use('/api/orders',     rateLimit({ windowMs: 60 * 60_000, max: 20 }));
app.use(['/api/contact', '/api/newsletter'],
                           rateLimit({ windowMs: 60 * 60_000, max: 10 }));
```

Behind Coolify's Traefik proxy set `app.set('trust proxy', 1)` as well, or every request
looks like it comes from the proxy and the limiter buckets them all together.

Longer term, if a client gets targeted: a CAPTCHA on the contact form, and requiring a
confirmed WhatsApp handoff before stock is decremented.

### S4 — No security headers

**Severity: Medium**

`helmet` isn't installed, so responses carry no `Strict-Transport-Security` (once S1 is
fixed, HSTS is what stops an attacker downgrading a visitor back to http), no
`X-Content-Type-Options: nosniff`, no frame-ancestors — meaning `/admin` can be framed
for clickjacking — and no `Referrer-Policy` or CSP.

**Fix:** `npm i helmet`, then in [index.js](../../backend/index.js):

```js
import helmet from 'helmet';
app.use(helmet({
  // The SPA and Google Fonts need a CSP tuned to this app — start with
  // contentSecurityPolicy: false, then add a policy and test /admin + fonts.
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));
```

Enable HSTS only once the site actually serves https (helmet does this by default —
which is another reason S1 comes first).

### S5 — Rotating the admin password doesn't revoke live tokens

**Severity: Medium**

[DEPLOY.md](DEPLOY.md) §5 says to rotate the admin password by re-running
`hash-password` and updating the env var. That changes what *new* logins check against —
it does **not** invalidate tokens already issued, because `requireAdmin`
([auth.js:12](../../backend/auth.js#L12)) only verifies the signature against
`JWT_SECRET`. A stolen token stays valid for its full 24h.

**Fix (procedure, no code change):** when rotating because you believe the password
leaked, rotate **`JWT_SECRET` too** (`npm run gen-secret`) and redeploy. That invalidates
every outstanding token immediately. Rotating for hygiene only? Password alone is fine.

### S6 — The deliberately weak Postgres password

**Severity: Medium**

[OPERATIONS.md](OPERATIONS.md) documents resetting Postgres to a *simple, unambiguous*
password (`SimplePass2468`) to dodge Coolify's password-drift gotcha. That's a sensible
trade **only while the database is internal-only** — reachable from the app container and
nothing else.

The risk: Coolify has a "Make it publicly available" toggle on databases. Flip that on a
DB with a guessable password and the box is gone.

**Fix:** keep every storefront Postgres **internal-only** — never enable public access
just to run a query; use `docker exec … psql` from the Web Console instead. If a DB must
be exposed temporarily, set a long random password first and turn it off after.

### S7 — Container runs as root

**Severity: Low**

The [Dockerfile](../../Dockerfile) never drops privileges, so the app runs as root inside
the container. Combined with a container escape it widens the damage; on its own it isn't
exploitable.

**Fix:** before `CMD`, add:

```dockerfile
RUN mkdir -p backend/uploads && chown -R node:node /app
USER node
```

(The `node` user ships with the `node:20-slim` base image. Verify uploads still write
after the change — that's what the `chown` is for.)

### S8 — react-router advisories

**Severity: Low**

`npm audit` reports 2 moderate advisories against `react-router` / `react-router-dom`.
Assessed:

- **Arbitrary constructor injection via `deserializeErrors()`** — SSR hydration only. This
  is a client-rendered SPA with no SSR. **Not applicable.**
- **Open redirect via backslash in `<Link>` / `useNavigate`** — needs user-controlled
  navigation targets. This app only ever navigates to its own static routes and product
  ids. **Not reachable today**, but it's a footgun if a future feature ever routes to a
  URL from a query string.

**Fix:** `npm audit fix` — it's a non-breaking bump. Low urgency, zero cost.

### S9 — Upload bytes aren't validated as images

**Severity: Low**

`/api/admin/upload` picks the file extension from the client-sent `Content-Type` header
([local.js:27-33](../../backend/storage/local.js#L27-L33)) and never inspects the actual
bytes. An admin could store arbitrary content as `.png`.

Impact is genuinely small: the endpoint is behind `requireAdmin`, `express.static` serves
the file with a `Content-Type` derived from that image extension, and SVG — the classic
stored-XSS upload vector — is deliberately **not** in the allowlist. So a stored payload
isn't executed by the browser.

**Fix (optional):** sniff magic bytes on upload and reject mismatches. Only worth doing if
admin access is ever shared with someone less trusted. Adding `nosniff` via S4 also helps
here.

---

## 3. Not an issue (correcting the older docs)

**CSRF protection is not a TODO.** [DEPLOY.md](DEPLOY.md) §5 and the root README both
list "no CSRF protection" as a deploy-time gap. It isn't one for this design: admin auth
is a **Bearer token read from `localStorage`**
([adminApi.js:9](../../frontend/src/pages/admin/adminApi.js#L9)), not a cookie, so there
is no ambient credential a cross-site request could ride. The public endpoints are
unauthenticated anyway. The real item hiding behind that TODO is **rate limiting (S3)**.

*(Storing the JWT in `localStorage` trades CSRF exposure for XSS exposure. That's the
right trade here — there is no XSS surface: no `dangerouslySetInnerHTML` anywhere in
`frontend/src`, React escapes all product/order text, and SVG uploads are blocked. It
stops being the right trade if user-supplied HTML is ever rendered.)*

---

## 4. What's already solid

Worth knowing so the list above reads in proportion — these are load-bearing and should
not be "refactored" away:

- **No SQL injection surface.** Every query is parameterized, including the dynamic
  status filter in [admin.js:209-230](../../backend/routes/admin.js#L209-L230), which
  pushes the value as `$1` rather than interpolating it.
- **Prices can't be tampered with.** The client sends only `productId`/`size`/`qty`; unit
  price and subtotal are read from the database server-side
  ([public.js:85](../../backend/routes/public.js#L85),
  [public.js:93](../../backend/routes/public.js#L93)). A forged cart can't set a price.
- **No oversell race.** Stock check, decrement, and order insert run in one transaction
  with `FOR UPDATE OF v` ([public.js:63-108](../../backend/routes/public.js#L63-L108)).
- **Every write body is validated** with zod schemas before it reaches SQL.
- **Passwords are bcrypt hashes in env** — the plaintext never lives on the server, and
  `gen-secret` / `hash-password` keep it that way.
- **Errors never leak stack traces** ([index.js:65-74](../../backend/index.js#L65-L74));
  5xx bodies are a flat `{"error":"Server error"}`.
- **Body size limits**: 1 MB JSON, 5 MB upload.
- **Upload filenames are regenerated** as `timestamp-random-slug.ext`
  ([local.js:36-39](../../backend/storage/local.js#L36-L39)) — path traversal is
  impossible — and `image/svg+xml` is deliberately absent from the allowlist
  ([local.js:14-20](../../backend/storage/local.js#L14-L20)), closing the most common
  stored-XSS-via-upload hole.
- **CORS is an explicit allowlist, never `*`**, and is only enabled when `CORS_ORIGIN` is
  set ([index.js:19-21](../../backend/index.js#L19-L21)); the single-container deploy
  avoids CORS entirely.
- **Secrets are gitignored** — only `.env.example` and `deploy/.env.site.example` are
  tracked.
- **Backups exist and are documented** — Coolify scheduled Postgres backups plus
  [deploy/backup.sh](../../deploy/backup.sh) on a cron for the images volume.

---

## 5. Pre-launch security checklist (per client site)

Run alongside the functional trust checklist in [DEPLOY.md](DEPLOY.md) §3.

1. **HTTPS is live** — the domain loads with a valid padlock, and `http://` redirects to
   `https://`. No client site launches on sslip.io. *(S1)*
2. **The droplet is firewalled** — `ufw status` shows 80/443 open to all, 22 and 8000
   restricted; fail2ban is running; SSH password auth is off. *(S2)*
3. **Rate limits are deployed** — 12 rapid wrong-password POSTs to
   `/api/admin/login` return `429`. *(S3)*
4. **Security headers present** — `curl -sI https://<site> | grep -i strict-transport`
   returns an HSTS header. *(S4)*
5. **Admin is locked** — `curl https://<site>/api/admin/orders` with no token returns
   `{"error":"Unauthorized"}` (401).
6. **The database is not publicly available** in Coolify, and its scheduled backups are
   on. *(S6)*
7. **This site's secrets are unique** — `JWT_SECRET` and `ADMIN_PASSWORD_HASH` are
   generated fresh per client, never copied between sites. A leak at one client must not
   unlock another.
8. **A restore has been tested at least once** — take a backup, restore it into a scratch
   database, confirm the products come back. An untested backup isn't a backup.
