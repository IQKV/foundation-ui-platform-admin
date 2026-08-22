# Project Name

<!-- TEMPLATE: Replace the title above. Remove this comment block when done. -->

<details>
  <summary><strong>How to use this template (click to expand)</strong></summary>

1. Replace the title with your app name.
2. Update the short description below.
3. Add CI/coverage/license badges after the title.
4. Fill in each section with real content; remove placeholder text.
5. Delete this guidance block when finished.

</details>

Short description of what this admin app does and who it is for.

<!-- Badge examples (optional):
![CI](https://img.shields.io/github/actions/workflow/status/ORG/REPO/ci.yml?label=CI)
![License](https://img.shields.io/github/license/ORG/REPO)
-->

## About

Describe the purpose of the app, the platform surface it covers, and the authority required to access it.

### Implemented

- List of implemented areas / modules

### Not Implemented Yet

- List of planned areas

## Feature Status

| Area | Status | Notes |
| ---- | ------ | ----- |
|      |        |       |

## Tech Stack

- React 19 · TypeScript · Vite (SWC)
- Mantine UI 9 · mantine-datatable · Tabler Icons
- TanStack Router · TanStack Query · Zustand
- Lingui · Zod · Mantine Form · Axios
- Vitest · Playwright · OxLint · OxFmt

Architecture follows [Feature-Sliced Design](AGENTS.md).

## Prerequisites

- Node.js `^20.19.0` or `^22.12.0` or `>=24.0.0`
- pnpm `>=10.33.2`

## Quick Start

```bash
git clone https://github.com/IQKV/<repo>.git
cd <repo>

pnpm install

cp .env.example .env.local
# Set VITE_API_SERVER_URL to your API gateway

pnpm dev
# → http://localhost:5173
```

## Environment Variables

| Variable              | Example                       | Description                                    |
| --------------------- | ----------------------------- | ---------------------------------------------- |
| `VITE_API_SERVER_URL` | `https://api.example.com/api` | API base URL (production build)                |
| `VITE_LOG_LEVEL`      | `info`                        | Client log level: `silent`, `info`, `debug`    |
| `VITE_DEMO_MODE`      | `false`                       | Show demo sign-in helper (non-production only) |

Copy `.env.example` to `.env.local`. For runtime overrides without a rebuild copy `public/config.js.example` to `public/config.js` and set `window.VITE_*` values.

## Scripts

```bash
pnpm dev                  # Vite dev server
pnpm build                # Type-check + i18n compile + Vite build
pnpm type-check           # TypeScript only
pnpm lint                 # OxLint
pnpm lint:fix             # OxLint --fix + OxFmt
pnpm test                 # Vitest
pnpm test:arch            # FSD architecture tests
pnpm e2e                  # Playwright
pnpm messages:extract     # Extract i18n strings
pnpm messages:compile     # Compile PO catalogs
```

## Project Structure

```
src/
├── app/          # Providers, router bootstrap, runtime env
├── processes/    # Session store, inactivity timer, theme
├── pages/        # File-based routes (TanStack Router)
├── widgets/      # Complex UI blocks
├── features/     # User scenarios and business logic
├── entities/     # Business entities and data models
├── shared/       # API clients, UI kit, utilities, locales
└── architecture.test.ts
```

## Authorization Model

Describe the authority required and the route guard behavior.

```
PLATFORM_ADMIN  — required for all /admin/* routes
```

## Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Agent / FSD guide](./AGENTS.md)

## License

MIT — see [LICENSE](LICENSE).

## Contributing

[Contributing Guidelines](.github/CONTRIBUTING.md) · [Code of Conduct](.github/CODE_OF_CONDUCT.md)

---

<details>
  <summary><strong>Pre-publish checklist (remove before merging)</strong></summary>

- [ ] Title and description updated
- [ ] Badges added
- [ ] Implemented / Not Implemented sections filled
- [ ] Feature Status table populated
- [ ] Environment variables documented
- [ ] Authorization model reflects actual roles
- [ ] Links verified

</details>
