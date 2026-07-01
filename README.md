# Foundation UI Platform Admin

Platform administration SPA for the Key Value Platform. Operators with `PLATFORM_ADMIN` authority manage users, organizations, invitations, subscriptions, and billing plans across all tenants.

## About

This repository is the **platform admin surface only** (not the tenant-facing app). Unauthenticated visitors are redirected to sign-in; authenticated platform admins use `/admin/*`.

### Implemented today

- **Sign-in** — Platform admin credentials via `POST /v1/iam/auth/admin/signin`; forbidden users see `/unauthorized`
- **Session** — Access token in memory; refresh token in `sessionStorage` (survives reload within the tab); silent refresh on `/v1/iam/auth/admin/refresh`; inactivity timeout signs out
- **Dashboard** — Parallel count cards for total users, organizations, and active subscriptions (with per-card loading/error states)
- **Users** — Paginated, sortable, filterable list; detail view with Overview, Organizations, Platform Authority, and OIDC Identities tabs; edit profile; set password; ban/unban/unlock users; grant/revoke `PLATFORM_ADMIN`; force-unmerge linked OIDC identities
- **Organizations** — Paginated list with status filter; detail layout with Overview, Members, Billing settings, Subscriptions, and Refunds tabs; edit organization metadata; manage member tenant authorities (TENANT_OWNER, ADMIN, MEMBER)
- **Invitations** — List with filters; propose, edit, and revoke invitations
- **Subscriptions** — Global list with search, status filter, and sorting; lifecycle actions (cancel, pause, reactivate), and quantity update; detail view
- **Plans** — Plan catalog list; create plan; plan detail with edit and delete
- **Announcements** — Create, edit, publish, delete announcements with translation support
- **Audit Logs** — Global audit log view
- **Notifications** — In-app notifications with WebSocket support; notification bell UI
- **Refunds** — Refund list and detail views
- **My account** — View/edit operator profile; change password
- **i18n** — Lingui with English catalog; locale switcher UI (additional locales can be added in `lingui.config.ts`)
- **Runtime config** — Override `VITE_*` via `public/config.js` without rebuilding

### Not implemented yet

Platform actions (impersonation), system health/jobs, advanced dashboard metrics (MRR/ARR, trends), and additional admin remediation flows described in product specs.

## Feature Status

| Area                       | Status  | Notes                                                           |
| -------------------------- | ------- | --------------------------------------------------------------- |
| Sign-in & session guards   | Done    | `PLATFORM_ADMIN` on `/admin/*`                                  |
| Dashboard (count cards)    | Done    | Users, orgs, subscriptions                                      |
| User list & detail         | Done    | List + edit/set password; authority + OIDC identities tabs      |
| Organization list & detail | Done    | List + edit; overview, members, billing, subscriptions, refunds |
| Invitations                | Done    | Propose, edit, revoke                                           |
| Subscriptions              | Done    | List + detail; cancel/pause/reactivate; update quantity         |
| Plan catalog               | Done    | Create, edit, delete                                            |
| Announcements              | Done    | Create, edit, publish, delete                                   |
| Audit Logs                 | Done    | Global audit log view                                           |
| Notifications              | Done    | In-app + WebSocket                                              |
| Refunds                    | Done    | Refund list + detail                                            |
| Operator account           | Done    | Profile + password                                              |
| OIDC admin remediation     | Done    | View user identities + force-unmerge                            |
| Platform actions           | Partial | Ban/unban/unlock done; impersonation, etc. planned              |
| System administration      | Partial | Audit log implemented; health/jobs planned                      |
| Advanced metrics           | Planned | MRR/ARR, growth charts                                          |

## Quick Links

- [Architecture Overview](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)

## Tech Stack

- React 19 + TypeScript
- Mantine UI 9 + mantine-datatable
- TanStack Router + TanStack Query
- Zustand (session store)
- Lingui i18n
- Zod + Mantine Form
- Vite + SWC
- Vitest + Playwright
- OxLint / OxFmt

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

| Variable              | Example                       | Description                                          |
| --------------------- | ----------------------------- | ---------------------------------------------------- |
| `VITE_API_SERVER_URL` | `https://api.example.com/api` | API base URL (production build)                      |
| `VITE_LOG_LEVEL`      | `info`                        | Client log level: `silent`, `info`, `debug`          |
| `VITE_DEMO_MODE`      | `false`                       | Show demo sign-in helper UI (non-production only)    |

Copy `.env.example` to `.env.local` for local overrides. For runtime overrides without a rebuild, use `public/config.js` (see below).

## Runtime Configuration

```bash
cp public/config.js.example public/config.js
# Edit window.VITE_API_SERVER_URL and window.VITE_LOG_LEVEL
```

Values on `window.*` take precedence over build-time `VITE_*` variables. Do not commit secrets.

## Routes

| Path                                            | Description                           |
| ----------------------------------------------- | ------------------------------------- |
| `/`                                             | Redirects to `/admin`                 |
| `/sign-in`                                      | Platform admin sign-in                |
| `/unauthorized`                                 | Shown when JWT lacks `PLATFORM_ADMIN` |
| `/admin`                                        | Dashboard (count cards)               |
| `/admin/users`                                  | User list                             |
| `/admin/users/:userId`                          | User detail (overview, orgs, authority, OIDC identities) |
| `/admin/organizations`                          | Organization list                     |
| `/admin/organizations/:tenantKey`               | Organization overview                 |
| `/admin/organizations/:tenantKey/members`       | Organization members                  |
| `/admin/organizations/:tenantKey/billing`       | Tenant billing settings               |
| `/admin/organizations/:tenantKey/subscriptions` | Tenant subscriptions                  |
| `/admin/organizations/:tenantKey/refunds`       | Tenant refunds                        |
| `/admin/invitations`                            | Invitation list                       |
| `/admin/subscriptions`                          | Subscription list (read-only)         |
| `/admin/subscriptions/:subscriptionId`          | Subscription detail                   |
| `/admin/plans`                                  | Plan catalog                          |
| `/admin/plans/:planCode`                        | Plan detail / edit                    |
| `/admin/announcements`                          | Announcements list                    |
| `/admin/audit-logs`                             | Global audit logs                     |
| `/admin/notifications`                          | Notifications list                    |
| `/admin/refunds`                                | Refunds list                          |
| `/admin/refunds/:refundId`                      | Refund detail                         |
| `/admin/account`                                | Signed-in operator profile            |

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

Default locale: `en` (`lingui.config.ts`).

To add a locale: add it to `locales` in `lingui.config.ts`, run `pnpm messages:extract`, translate files under `locales/{locale}/`, then `pnpm messages:compile`.

## Project Structure

```
src/
├── app/          # Providers, router bootstrap, runtime env
├── processes/    # Session store, inactivity timer, theme
├── pages/        # File-based routes (TanStack Router)
├── features/     # User scenarios (sign-in, edit-user, invitations, …)
├── shared/       # API clients, UI kit, utilities, locales
└── types/        # Global TypeScript declarations
```

UI for admin screens lives primarily in `pages/admin/*` with supporting logic in `features/*` and `shared/api/*`.

## Authorization Model

JWT authorities include `PLATFORM_ADMIN` for full platform access. Tenant-scoped roles (`TENANT_OWNER`, `ADMIN`, `MEMBER`) exist on the platform but this app only admits users with `PLATFORM_ADMIN`.

```
PLATFORM_ADMIN  — required for all /admin/* routes
```

**Route guard** (`src/pages/admin.tsx`): If no access token, attempts refresh with the stored refresh token; on success checks `PLATFORM_ADMIN`. If a token exists, decodes it client-side and redirects to `/unauthorized` when the authority is missing.

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

- **FSD-style layers**: `app → processes → pages → features → shared` with public `index.ts` barrels; `pnpm test:arch` enforces boundaries
- **Routing**: TanStack Router file-based routes under `src/pages/`
- **Data**: TanStack Query for server state; IAM and billing HTTP clients in `shared/api/`
- **Tables**: `mantine-datatable` with client-side pagination/filter patterns on list pages
- **Quality**: OxLint, OxFmt, Stylelint, Vitest, Playwright, Knip

See [AGENTS.md](AGENTS.md) for contributor and agent conventions.

## License

MIT — see [LICENSE](LICENSE).

## Contributing

[Contributing Guidelines](.github/CONTRIBUTING.md) · [Code of Conduct](.github/CODE_OF_CONDUCT.md)
