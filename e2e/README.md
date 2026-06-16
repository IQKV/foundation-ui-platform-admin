# E2E Tests — Platform Admin UI

End-to-end tests for `foundation-ui-platform-admin` using [Playwright](https://playwright.dev/).

## Directory structure (FSD-aligned)

```
e2e/
├── app/                    # Test app configuration and global setup
│   ├── config/
│   │   └── test-config.ts  # Centralised constants: routes, users, viewports, storage paths
│   ├── fixtures/
│   │   ├── auth.fixture.ts # Extended test object with authenticated page fixtures
│   │   └── index.ts        # Re-exports test + expect for use in specs
│   └── setup/
│       └── global-setup.ts # Runs once before the suite: verifies host, pre-authenticates admins
├── pages/                  # Page Object Models (POMs) organized by app pages
│   ├── admin/
│   │   ├── admin-layout.spec.ts
│   │   └── index.ts
│   └── index.ts
├── features/               # Feature-specific tests, matching src/features
│   ├── sign-in/
│   │   └── index.ts
│   └── sign-out/
│       └── index.ts
├── smoke/                  # Smoke tests (unauthenticated, quick checks)
│   └── smoke.spec.ts
├── shared/                 # Shared utilities, selectors, helpers
│   ├── selectors/
│   │   ├── test-selectors.ts
│   │   └── index.ts
│   └── utils/
│       ├── test-helpers.ts
│       └── index.ts
├── .gitignore
├── README.md
└── tsconfig.json
```

## Target host

Tests run against `https://admin.iqkv.site` by default (set in `.env.e2e`).

```bash
# Remote staging host (default)
pnpm e2e:remote

# Local dev server (starts pnpm dev automatically)
pnpm e2e

# Override host ad-hoc
BASE_URL=https://staging.iqkv.site pnpm e2e
```

## Authentication

Only users with `PLATFORM_ADMIN` authority can sign in to this app.
Tenant-scoped users (TENANT_OWNER, ADMIN, MEMBER) are rejected with 403.

Global setup pre-authenticates two platform admins and saves their browser
storage state to `.playwright/auth/` (gitignored). Individual tests load
the saved state via the `adminPage` / `adminPage2` fixtures — no per-test
sign-in network call needed.

### Demo accounts (staging only)

| Account        | Email                           | Password           |
| -------------- | ------------------------------- | ------------------ |
| Platform admin | `jonathan.pierce@demo.iqkv.com` | `ChangeMePass123!` |

Credentials are committed in `.env.e2e` — they exist only in the demo/staging
database and carry no production access.

## Running tests

```bash
# All tests against remote host
pnpm e2e:remote

# All tests against local dev server
pnpm e2e

# Chromium only
pnpm e2e:chrome

# Headed (watch the browser)
pnpm e2e:headed

# Interactive UI mode
pnpm e2e:ui

# Debug mode (step through)
pnpm e2e:debug

# Smoke tests only
pnpm e2e:smoke

# All browsers (CI mode)
ALL_BROWSERS=true pnpm e2e

# Show last HTML report
pnpm e2e:report
```

## Writing tests

### Unauthenticated test

```ts
import { test, expect } from "@playwright/test";

test("404 page loads", async ({ page }) => {
  await page.goto("/404");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
```

### Authenticated test

```ts
import { test, expect } from "../../app/fixtures";
import { TestSelectors, byTestId } from "../../shared/selectors";

test("admin dashboard is visible", async ({ adminPage }) => {
  await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
});
```

## Configuration

| Variable                      | Default                         | Description                                          |
| ----------------------------- | ------------------------------- | ---------------------------------------------------- |
| `BASE_URL`                    | `https://admin.iqkv.site`       | Target host                                          |
| `CI`                          | —                               | Enables sequential workers, retries, GitHub reporter |
| `ALL_BROWSERS`                | —                               | Adds Firefox + WebKit projects                       |
| `E2E_PLATFORM_ADMIN_EMAIL`    | `jonathan.pierce@demo.iqkv.com` | Override admin email                                 |
| `E2E_PLATFORM_ADMIN_PASSWORD` | `ChangeMePass123!`              | Override admin password                              |

All `E2E_*` variables can be set as CI secrets to override the `.env.e2e` defaults.
