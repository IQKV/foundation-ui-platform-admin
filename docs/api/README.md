## 📜 API Documentation

The admin UI reaches the backend exclusively through the HTTP clients in [`src/shared/api`](../../src/shared/api). Every client shares the single Axios instance exported from `http-client.ts`.

- **Development** — requests target `/api/*` and are proxied by the Vite dev server to `VITE_API_SERVER_URL`.
- **Production** — requests target `VITE_API_SERVER_URL` directly (see [Runtime Configuration](../../README.md#runtime-configuration)).
- **Auth** — `auth-interceptor.ts` attaches `Authorization: Bearer <accessToken>`, and on a `401` performs a silent refresh on `/v1/iam/auth/admin/refresh` before retrying the original request.

All paths below are the frontend-facing `/v1/*` paths. The backend mounts them under `/api/v1/*`; the proxy (dev) or gateway (prod) bridges the prefix.

### Clients

| Module                   | Client              | Base path                       | Covers                                                  |
| ------------------------ | ------------------- | ------------------------------- | ------------------------------------------------------- |
| auth.ts                  | authApi             | /v1/iam/auth                    | Admin sign-in, sign-out                                 |
| iam.ts                   | iamApi              | /v1/iam/admin                   | Users, organizations, invitations, announcements, OIDC  |
| iam.ts                   | adminAccountApi     | /v1/iam/auth/admin/me           | Signed-in operator profile and password                 |
| iam.ts                   | notificationApi     | /v1/iam/users/notifications     | In-app notifications                                    |
| iam.ts                   | localesApi          | /v1/iam/locales                 | Available locales                                       |
| billing.ts               | billingApi          | /v1/billing/admin               | Subscriptions, refunds, plans, gateway config, webhooks |
| catalog.ts               | catalogApi          | /v1/catalog/admin/master-venues | Master venue catalog (platform admin)                   |
| cms.ts                   | cmsApi              | /v1/cms/admin/{tenantKey}/pages | Tenant CMS pages                                        |
| audit.ts                 | auditApi            | /v1/audit/admin/logs            | Global audit log list and action stats                  |
| use-dashboard-counts.ts  | useDashboardCounts  | n/a                             | Dashboard count cards                                   |
| use-dashboard-widgets.ts | useDashboardWidgets | n/a                             | Dashboard widgets                                       |

### Master venue catalog

Backed by the `docintelligence-catalog-service` admin resource. All endpoints require the `PLATFORM_ADMIN` authority and operate on platform-owned reference data (the `public` schema), not tenant-scoped rows.

| Method   | Path                                          | Description                                                                                                               |
| -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/v1/catalog/admin/master-venues`             | Search venues — `search` (free-text over name/address/city), `city` (exact, case-insensitive), `limit` (20), `offset` (0) |
| `GET`    | `/v1/catalog/admin/master-venues/{id}`        | Full venue record; `404` when missing                                                                                     |
| `GET`    | `/v1/catalog/admin/master-venues/{id}/assets` | Assets (photos and attachments) ordered by display order; `404` when missing                                              |
| `GET`    | `/v1/catalog/admin/master-venues/{id}/photos` | The `PHOTO` subset of assets; `404` when missing                                                                          |
| `POST`   | `/v1/catalog/admin/master-venues`             | Create a venue — `201` on success, `400` on validation failure                                                            |
| `PUT`    | `/v1/catalog/admin/master-venues/{id}`        | Full replace of every writable field; `404` when missing                                                                  |
| `PATCH`  | `/v1/catalog/admin/master-venues/{id}`        | Partial update of the supplied fields; `404` when missing                                                                 |
| `DELETE` | `/v1/catalog/admin/master-venues/{id}`        | Delete a venue; `204` on success, `404` when missing                                                                      |

Assets and photos are **read-only** in the UI — the ingestion worker is their sole writer.

### Related documentation

- [Architecture Overview](../architecture/README.md)
- [Deployment Guide](../deployment/README.md)
