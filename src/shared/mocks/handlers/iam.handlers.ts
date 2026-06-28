import { http, HttpResponse } from "msw";
import { MOCK_ADMIN_ACCOUNT, MOCK_USER, MOCK_TENANT } from "../data/admin";

const EMPTY_PAGE = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };

export const iamHandlers = [
  // ── Platform admin self-service ──────────────────────────────────────────

  // GET /v1/iam/auth/admin/me
  http.get("*/v1/iam/auth/admin/me", () => {
    return HttpResponse.json(MOCK_ADMIN_ACCOUNT, { status: 200 });
  }),

  // PATCH /v1/iam/auth/admin/me
  http.patch("*/v1/iam/auth/admin/me", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { ...MOCK_ADMIN_ACCOUNT, ...body, updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }),

  // POST /v1/iam/auth/admin/me/password
  http.post("*/v1/iam/auth/admin/me/password", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // ── Users ─────────────────────────────────────────────────────────────────

  // GET /v1/iam/admin/users/count
  http.get("*/v1/iam/admin/users/count", () => {
    return HttpResponse.json({ total: 1 }, { status: 200 });
  }),

  // GET /v1/iam/admin/users
  http.get("*/v1/iam/admin/users", () => {
    return HttpResponse.json(
      { content: [MOCK_USER], page: 0, size: 20, totalElements: 1, totalPages: 1 },
      { status: 200 },
    );
  }),

  // GET /v1/iam/admin/users/:id
  http.get("*/v1/iam/admin/users/:id", ({ params }) => {
    return HttpResponse.json({ ...MOCK_USER, id: params["id"] }, { status: 200 });
  }),

  // PATCH /v1/iam/admin/users/:id
  http.patch("*/v1/iam/admin/users/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { ...MOCK_USER, id: params["id"], ...body, updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }),

  // POST /v1/iam/admin/users/:id/ban
  http.post("*/v1/iam/admin/users/:id/ban", ({ params }) => {
    return HttpResponse.json(
      {
        id: "00000000-0000-0000-0000-000000000099",
        userId: params["id"],
        initiatorId: MOCK_ADMIN_ACCOUNT.id,
        type: "PLATFORM",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // POST /v1/iam/admin/users/:id/unban
  http.post("*/v1/iam/admin/users/:id/unban", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/admin/users/:id/unlock
  http.post("*/v1/iam/admin/users/:id/unlock", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/admin/users/:id/password
  http.post("*/v1/iam/admin/users/:id/password", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET/PUT /v1/iam/admin/users/:id/authorities
  http.get("*/v1/iam/admin/users/:id/authorities", ({ params }) => {
    return HttpResponse.json({ userId: params["id"], authorities: [] }, { status: 200 });
  }),

  http.put("*/v1/iam/admin/users/:id/authorities", async ({ params, request }) => {
    const body = (await request.json()) as { authorities: string[] };
    return HttpResponse.json(
      { userId: params["id"], authorities: body.authorities },
      { status: 200 },
    );
  }),

  // ── Tenants ───────────────────────────────────────────────────────────────

  // GET /v1/iam/admin/tenants/count
  http.get("*/v1/iam/admin/tenants/count", () => {
    return HttpResponse.json({ total: 1 }, { status: 200 });
  }),

  // GET /v1/iam/admin/tenants
  http.get("*/v1/iam/admin/tenants", () => {
    return HttpResponse.json(
      { content: [MOCK_TENANT], page: 0, size: 20, totalElements: 1, totalPages: 1 },
      { status: 200 },
    );
  }),

  // GET /v1/iam/admin/tenants/:tenantKey
  http.get("*/v1/iam/admin/tenants/:tenantKey", ({ params }) => {
    return HttpResponse.json({ ...MOCK_TENANT, tenantKey: params["tenantKey"] }, { status: 200 });
  }),

  // PATCH /v1/iam/admin/tenants/:tenantKey
  http.patch("*/v1/iam/admin/tenants/:tenantKey", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...MOCK_TENANT,
        tenantKey: params["tenantKey"],
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // GET /v1/iam/admin/tenants/:tenantKey/members
  http.get("*/v1/iam/admin/tenants/:tenantKey/members", () => {
    return HttpResponse.json(
      { content: [MOCK_USER], page: 0, size: 20, totalElements: 1, totalPages: 1 },
      { status: 200 },
    );
  }),

  // GET /v1/iam/admin/tenants/:tenantKey/members/count
  http.get("*/v1/iam/admin/tenants/:tenantKey/members/count", () => {
    return HttpResponse.json({ total: 1 }, { status: 200 });
  }),

  // GET /v1/iam/admin/tenants/:tenantKey/members/stats
  http.get("*/v1/iam/admin/tenants/:tenantKey/members/stats", ({ params }) => {
    return HttpResponse.json(
      {
        tenantKey: params["tenantKey"],
        totalMembers: 1,
        activeMembers: 1,
        lockedMembers: 0,
        suspendedMembers: 0,
        emailVerifiedCount: 1,
        signupSeries: [],
        periodFrom: "2026-01-01T00:00:00.000Z",
        periodTo: new Date().toISOString(),
        granularity: "day",
      },
      { status: 200 },
    );
  }),

  // ── Invitations ───────────────────────────────────────────────────────────

  http.get("*/v1/iam/admin/invitations/count", () => {
    return HttpResponse.json({ total: 0 }, { status: 200 });
  }),

  http.get("*/v1/iam/admin/invitations", () => {
    return HttpResponse.json(EMPTY_PAGE, { status: 200 });
  }),

  // ── Announcements ─────────────────────────────────────────────────────────

  http.get("*/v1/iam/admin/announcements", () => {
    return HttpResponse.json({ items: [], totalElements: 0 }, { status: 200 });
  }),

  // ── Notifications ─────────────────────────────────────────────────────────

  http.get("*/v1/iam/users/notifications/unread/count", () => {
    return HttpResponse.json({ unreadCount: 0 }, { status: 200 });
  }),

  http.get("*/v1/iam/users/notifications", () => {
    return HttpResponse.json({ items: [], totalElements: 0, unreadCount: 0 }, { status: 200 });
  }),

  // ── Locales ───────────────────────────────────────────────────────────────

  http.get("*/v1/iam/locales", () => {
    return HttpResponse.json(
      [
        { code: "en-US", name: "English (US)", nativeName: "English", isDefault: true },
        { code: "ru-RU", name: "Russian", nativeName: "Русский", isDefault: false },
        { code: "it-IT", name: "Italian", nativeName: "Italiano", isDefault: false },
      ],
      { status: 200 },
    );
  }),
];
