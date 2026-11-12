# Foundation UI Platform Admin

Platform administration SPA for the Key Value platform. Operators holding `PLATFORM_ADMIN` manage users, organizations, invitations, subscriptions and billing, announcements/CMS content, the master venue catalog and per-tenant venues — across every tenant.

## About

This repository is the **platform admin surface only** (not the tenant-facing app). Every `/admin/*` route is guarded: unauthenticated visitors are redirected to `/sign-in`, and authenticated users without `PLATFORM_ADMIN` land on `/unauthorized`.

### Implemented

- **Sign-in & session** — admin credentials via `POST /v1/iam/auth/admin/signin`; forbidden users see `/unauthorized`. Access token in memory, refresh token in `sessionStorage` (survives reload within the tab), silent refresh on `/v1/iam/auth/admin/refresh`, inactivity timeout signs out.
- **Dashboard** (`/admin`) — parallel count cards (total users, organizations, active subscriptions) with per-card loading/error states; "attention required" tiles (locked users, suspended users, past-due subscriptions, pending invitations); subscription-breakdown and recent-activity widgets; addon widget slot.
- **Users** — paginated, sortable, filterable list; detail with Overview, Organizations, Platform Authority and OIDC Identities tabs; edit profile, set password, ban/unban/unlock users, grant/revoke `PLATFORM_ADMIN`, force-unmerge linked OIDC identities.
- **Organizations** — paginated list with status filter; detail with Overview, Members, Billing, Subscriptions and Refunds tabs; edit organization metadata; manage member tenant authorities (`TENANT_OWNER`, `ADMIN`, `MEMBER`).
- **Invitations** — list with filters; propose, edit and revoke invitations.
- **Audit Logs** — global audit log view.
- **Plans** — plan catalog; create plan; plan detail with edit and delete.
- **Subscriptions** — global list with search, status filter and sorting; lifecycle actions (cancel, pause, reactivate) and quantity update; detail view.
- **Refunds** — refund list and detail views.
- **Master Venue** — paginated master venue catalog with keyword search and city filter; detail with Overview, Photos and Assets tabs; create, edit (full replace) and delete venues. Assets and photos are read-only (written by the ingestion worker).
- **Venues (tenant)** — per-tenant venue browse with grid/list views, filters and semantic search; create, edit and delete venues; detail view.
- **Announcements** — create, edit, publish and delete announcements with translation support.
- **CMS Pages** — per-tenant page list; create and edit pages (rich content + translation fields); delete.
- **Webhook Logs** — platform-wide webhook log list (search, tenant key filter, status filter, sort) and detail view.
- **Notifications** — in-app notification list with mark-read/delete; WebSocket-driven notification bell in the app shell.
- **My account** — view/edit operator profile; change password.
- **Addons** — runtime-enabled UI addons register nav items, dashboard widgets and pages under `/admin/addons/*`. Bundled: `platform-health-notes`, `platform-ai-chat-sessions`.
- **i18n** — Lingui with source locale `en-US` and catalogs for `bg-BG`, `de-DE`, `fr-FR`.
- **Runtime config** — override `VITE_*` via `public/config.js` without rebuilding.

### Not implemented yet

Platform actions (impersonation), system health/jobs screens, advanced dashboard metrics (MRR/ARR, trends), and additional admin remediation flows described in product specs.

## Feature Status

| Area                       | Status  | Notes                                                             |
| -------------------------- | ------- | ----------------------------------------------------------------- |
| Sign-in & session guards   | Done    | `PLATFORM_ADMIN` required on `/admin/*`                           |
| Dashboard (count cards)    | Done    | Users, orgs, subscriptions + attention widgets                    |
| User list & detail         | Done    | List + edit/set password; authority + OIDC identities tabs        |
| Organization list & detail | Done    | List + edit; overview, members, billing, subscriptions, refunds   |
| Invitations                | Done    | Propose, edit, revoke                                             |
| Subscriptions              | Done    | List + detail; cancel/pause/reactivate; update quantity           |
| Plan catalog               | Done    | Create, edit, delete                                              |
| Refunds                    | Done    | Refund list + detail                                              |
| Master venue               | Done    | List + detail (photos/assets); create, edit, delete               |
| Tenant venues              | Done    | List + detail; semantic search; create, edit, delete              |
| Announcements              | Done    | Create, edit, publish, delete                                     |
| CMS Pages                  | Done    | Per-tenant list; create/edit with rich content; delete            |
| Webhook Logs               | Done    | Platform-wide list (search, tenant filter, status, sort) + detail |
| Audit Logs                 | Done    | Global audit log view                                             |
| Notifications              | Done    | In-app + WebSocket                                                |
| Operator account           | Done    | Profile + password                                                |
| OIDC admin remediation     | Done    | View user identities + force-unmerge                              |
| UI addons                  | Done    | Health Notes, AI Chat Sessions (runtime-enabled)                  |
| Platform actions           | Partial | Ban/unban/unlock done; impersonation, etc. planned                |
| System administration      | Partial | Audit log implemented; health/jobs planned                        |
| Advanced metrics           | Planned | MRR/ARR, growth charts                                            |

## Tech Stack

- React 19 + TypeScript
- Mantine UI 9 + mantine-datatable + Tabler Icons
- TanStack Router + TanStack Query
- Zustand (session store)
- Lingui i18n
- Zod + Mantine Form + Axios
- Vite + SWC
- Vitest + Playwright
- OxLint / OxFmt

Architecture follows [Feature-Sliced Design](AGENTS.md).

## Prerequisites

- Node.js `^20.19.0` or `^22.12.0` or `>=24.0.0` (see Vite engine requirements)
- pnpm `>=10.33.2`

## Quick Start

```bash
git clone https://github.com/IQKV/foundation-ui-platform-admin.git
cd foundation-ui-platform-admin

pnpm install

cp .env.example .env.local
# Set VITE_API_SERVER_URL to your API gateway (see Environment Variables)

pnpm dev
# → http://localhost:5173 (redirects to /admin when signed in)
```

In development, the Vite dev server proxies `/api` to the configured backend so cookies/CORS behave predictably.

## Environment Variables

| Variable                 | Example                       | Description                                       |
| ------------------------ | ----------------------------- | ------------------------------------------------- |
| `VITE_API_SERVER_URL`    | `https://api.example.com/api` | API base URL (production build)                   |
| `VITE_LOG_LEVEL`         | `info`                        | Client log level: `silent`, `info`, `debug`       |
| `VITE_DEMO_MODE`         | `false`                       | Show demo sign-in helper UI (non-production only) |
| `VITE_ENABLED_UI_ADDONS` | `platform-health-notes`       | Comma-separated addon IDs to enable at runtime    |
| `VITE_APP_NAV_VARIANT`   | `sidebar`                     | Shell layout: `sidebar` (default) or `topbar`     |

Copy `.env.example` to `.env.local` for local overrides.

## Runtime Configuration

```bash
cp public/config.js.example public/config.js
# Edit window.VITE_API_SERVER_URL and window.VITE_LOG_LEVEL
```

Values on `window.*` take precedence over build-time `VITE_*` variables. Do not commit secrets.

### Branding / Whitelabeling

`VITE_APP_TITLE` is the only branding value truly required; the rest (`VITE_APP_BRAND_NAME`, `VITE_APP_BRAND_TAGLINE`, `VITE_APP_AUTH_*`, `VITE_APP_VENDOR_NAME`) fall back to sensible defaults. See `src/app/config/runtime-env.ts`.

## Routes

| Path                                            | Description                                              |
| ----------------------------------------------- | -------------------------------------------------------- |
| `/`                                             | Redirects to `/admin`                                    |
| `/sign-in`                                      | Platform admin sign-in                                   |
| `/unauthorized`                                 | Shown when JWT lacks `PLATFORM_ADMIN`                    |
| `/admin`                                        | Dashboard (count cards)                                  |
| `/admin/users`                                  | User list                                                |
| `/admin/users/:userId`                          | User detail (overview, orgs, authority, OIDC identities) |
| `/admin/organizations`                          | Organization list                                        |
| `/admin/organizations/:tenantKey`               | Organization overview                                    |
| `/admin/organizations/:tenantKey/members`       | Organization members                                     |
| `/admin/organizations/:tenantKey/billing`       | Tenant billing settings                                  |
| `/admin/organizations/:tenantKey/subscriptions` | Tenant subscriptions                                     |
| `/admin/organizations/:tenantKey/refunds`       | Tenant refunds                                           |
| `/admin/invitations`                            | Invitation list                                          |
| `/admin/audit-logs`                             | Global audit logs                                        |
| `/admin/plans`                                  | Plan catalog                                             |
| `/admin/plans/:planCode`                        | Plan detail / edit                                       |
| `/admin/subscriptions`                          | Subscription list                                        |
| `/admin/subscriptions/:subscriptionId`          | Subscription detail                                      |
| `/admin/refunds`                                | Refunds list                                             |
| `/admin/refunds/:refundId`                      | Refund detail                                            |
| `/admin/master-venue`                           | Master venue catalog list                                |
| `/admin/master-venue/:venueId`                  | Master venue detail (overview, photos, assets)           |
| `/admin/venues`                                 | Tenant venue list                                        |
| `/admin/venues/:tenantKey/:venueId`             | Tenant venue detail                                      |
| `/admin/announcements`                          | Announcements list                                       |
| `/admin/cms-pages`                              | CMS page list                                            |
| `/admin/cms-pages/:tenantKey/create`            | Create CMS page                                          |
| `/admin/cms-pages/:tenantKey/:pageId`           | Edit CMS page                                            |
| `/admin/webhook-logs`                           | Webhook log list                                         |
| `/admin/webhook-logs/:webhookLogId`             | Webhook log detail                                       |
| `/admin/notifications`                          | Notifications list                                       |
| `/admin/account`                                | Signed-in operator profile                               |
| `/admin/addons/*`                               | Addon pages (health notes, AI chat sessions)             |

## pnpm Scripts

```bash
# Development
pnpm dev                  # Vite dev server
pnpm preview              # Preview production build

# Build
pnpm build                # Type-check + i18n extract/compile + Vite build
pnpm type-check           # TypeScript only

# Lint & format
pnpm lint                 # OxLint (type-aware)
pnpm lint:fix             # OxLint --fix + OxFmt write
pnpm formatter:check      # OxFmt check
pnpm formatter:write      # OxFmt write

# Tests
pnpm test                 # Vitest
pnpm test:coverage        # Vitest + coverage
pnpm test:arch            # FSD architecture tests

# E2E
pnpm e2e                  # Playwright (all projects)
pnpm e2e:chrome           # Chromium only
pnpm e2e:smoke            # Smoke suite (Chromium)
pnpm playwright:install   # Install browsers (first time)

# i18n
pnpm messages:extract     # Extract strings to locales/
pnpm messages:compile     # Compile .po catalogs
```

## Internationalization

Source locale: `en-US`; catalogs exist for `bg-BG`, `de-DE`, `fr-FR` (`lingui.config.ts`).

To add a locale: add it to `locales` in `lingui.config.ts`, run `pnpm messages:extract`, translate files under `locales/{locale}/`, then `pnpm messages:compile`.

## Project Structure

```
src/
├── app/          # Providers, router bootstrap, runtime env, addon host
├── processes/    # Session store, inactivity timer, theme
├── pages/        # File-based routes (TanStack Router)
├── widgets/      # Complex UI blocks (dashboard cards, charts)
├── features/     # User scenarios (sign-in, edit-user, invitations, …)
├── entities/     # Business entities and data models
├── addons/       # Runtime-enabled UI addons
├── shared/       # API clients, UI kit, utilities, locales
└── types/        # Global TypeScript declarations
```

UI for admin screens lives primarily in `pages/admin/*`, with supporting logic in `features/*` and `shared/api/*`.

## Authorization Model

JWT authorities include `PLATFORM_ADMIN` for full platform access. Tenant-scoped roles (`TENANT_OWNER`, `ADMIN`, `MEMBER`) exist on the platform but this app only admits users with `PLATFORM_ADMIN`.

```
PLATFORM_ADMIN  — required for all /admin/* routes
```

**Route guard** (`src/pages/admin.tsx`): if no access token, attempts refresh with the stored refresh token; on success checks `PLATFORM_ADMIN`. If a token exists, decodes it client-side and redirects to `/unauthorized` when the authority is missing.

**Token storage**

- Access token: Zustand store (memory only; cleared on full page reload)
- Refresh token: `sessionStorage` (persists across reload within the same tab)
- API calls: `Authorization: Bearer <accessToken>` via Axios interceptor; 401 triggers silent refresh, then retries the request

Admin auth endpoints: `POST /v1/iam/auth/admin/signin`, `POST /v1/iam/auth/admin/refresh`, `POST /v1/iam/auth/signout`.

### OIDC Admin Remediation

The user detail screen includes an **OIDC Identities** tab for platform operators:

- List linked identities: `GET /v1/iam/admin/oidc/users/{userId}/identities`
- Force-unmerge identity: `DELETE /v1/iam/admin/oidc/users/{userId}/identities/{identityId}`

These endpoints require `PLATFORM_ADMIN` and are intended for account recovery / remediation.

## Architecture Notes

- **FSD-style layers**: `app → processes → pages → widgets → features → entities → shared` with public `index.ts` barrels; `pnpm test:arch` enforces boundaries
- **Routing**: TanStack Router file-based routes under `src/pages/`
- **Data**: TanStack Query for server state; IAM, billing and catalog HTTP clients in `shared/api/`
- **Tables**: `mantine-datatable` with client-side pagination/filter patterns on list pages
- **Quality**: OxLint, OxFmt, Stylelint, Vitest, Playwright, Knip

See [AGENTS.md](AGENTS.md) for contributor and agent conventions.

## Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Agent / FSD guide](./AGENTS.md)

## License

MIT — see [LICENSE](LICENSE).

## Contributing

[Contributing Guidelines](.github/CONTRIBUTING.md) · [Code of Conduct](.github/CODE_OF_CONDUCT.md)
