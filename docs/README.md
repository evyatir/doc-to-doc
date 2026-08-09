# Docs

Everything written about this storefront backbone. The project [README](../README.md)
at the repo root is the quick-start; the files here go deeper.

## Guides — how to use it

| Doc | Read it when you want to… |
|---|---|
| [guides/CLIENT_MANUAL.md](guides/CLIENT_MANUAL.md) | Stand up a **new client storefront** end to end — fork, fill the config, add photos, QA, deliver. *For you, the developer.* |
| [guides/STORE_OWNER_MANUAL.md](guides/STORE_OWNER_MANUAL.md) | **Hand this to the client at delivery.** Non-technical walkthrough of `/admin`: adding & editing products, stock and sold-out, photos, product order, orders, messages — plus what they must ask you for. Fill in the details table at the top before sending it. |
| [guides/CONFIG_MANUAL.md](guides/CONFIG_MANUAL.md) | Know **which config field controls what on screen** — the nav options, the footer columns, every `BRAND`/`THEME`/`CATEGORIES`/… export mapped to where it renders. |
| [guides/DEPLOY_VPS.md](guides/DEPLOY_VPS.md) | **Deploy it** — the recommended one-VPS + Coolify setup that hosts all your client sites (each from its own repo): the *why* (drops Vercel/Render/Neon/Cloudinary) **and** the step-by-step runbook. **Start here.** |
| [guides/DEPLOY.md](guides/DEPLOY.md) | The general **deployment manual** — folder map, the run modes (static-only / degraded / full-stack), the post-deploy trust checklist, and known limits. Also documents the split-host option (separate frontend/API/DB providers). |
| [guides/OPERATIONS.md](guides/OPERATIONS.md) | **Run the live sites** on Coolify day-to-day — deploy updates, monitor the box's memory/capacity, the deploy gotchas cheat-sheet (`$`-hash "Is Literal", Postgres password reset), and the repeatable "add a new client site" checklist. |
| [guides/SECURITY.md](guides/SECURITY.md) | **Harden it before a real client goes live** — the register of known security issues (each with severity + fix), what's already solid, and the per-site pre-launch checklist. |
| [guides/SCALING.md](guides/SCALING.md) | **Scale & monitor** — why a flat-priced VPS is watched differently than a metered PaaS, how to read per-site CPU/RAM/**storage** usage, and the growth ladder (resize → add a box → split a site). Pairs with `deploy/usage.sh`. |

## Reference — why it's built this way

| Doc | What it is |
|---|---|
| [reference/BUILD_SPEC.md](reference/BUILD_SPEC.md) | The build specification the frontend was written against — the design decisions and structure, derived from the audit. |
| [reference/SITE_AUDIT.md](reference/SITE_AUDIT.md) | The measured headless-Chrome audit of the reference site (`saltyhairswimwear.com`) — fonts, colors, spacing, page-by-page. Ground truth for the design. |
| [reference/CHROME_AUDIT_PROMPT.md](reference/CHROME_AUDIT_PROMPT.md) | The prompt used to produce that audit — kept only so the same method can re-audit another reference site later. |

## Where the rest lives (not in this folder)

- **The admin panel + API** are documented in the project [README](../README.md)
  (API reference table + "Admin usage").
- **Per-client content** is `clients/<name>/config.js` — every field is
  commented in `clients/_template/config.js`, and mapped in the Config Manual above.
