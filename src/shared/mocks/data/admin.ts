/**
 * Mock admin account fixture — mirrors the seed data in
 * 20260517000004-demo-e2e-users.xml.
 */
export const MOCK_ACCESS_TOKEN =
  "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDMiLCJleHAiOjk5OTk5OTk5OTl9.mock";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token-admin";

export const MOCK_SIGN_IN_RESPONSE = {
  accessToken: MOCK_ACCESS_TOKEN,
  refreshToken: MOCK_REFRESH_TOKEN,
};

export const MOCK_ADMIN_ACCOUNT = {
  id: "00000000-0000-0000-0000-000000000003",
  email: "jonathan.pierce@demo.iqkv.com",
  firstName: "Jonathan",
  lastName: "Pierce",
  status: "ACTIVE",
  emailVerified: true,
  locale: "en-US",
  avatarUrl: null,
  platformAuthorities: ["PLATFORM_ADMIN"],
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};

export const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "margaret.hayes@demo.iqkv.com",
  firstName: "Margaret",
  lastName: "Hayes",
  status: "ACTIVE",
  emailVerified: true,
  locale: "en-US",
  avatarUrl: null,
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};

export const MOCK_TENANT = {
  id: "00000000-0000-0000-0000-000000000002",
  tenantKey: "demo0001",
  name: "Demo Organisation",
  status: "ACTIVE",
  isPersonal: false,
  isInternal: false,
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};
