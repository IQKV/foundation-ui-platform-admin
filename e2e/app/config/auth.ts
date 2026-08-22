/**
 * Authentication configuration for E2E tests.
 *
 * Credentials are read from environment variables so CI secrets take
 * precedence over the committed .env.e2e defaults (demo/staging only).
 */
export const AUTH_CONFIG = {
  /**
   * Platform admin user seeded by 20260517000004-demo-e2e-users.xml.
   * Authenticates via POST /v1/iam/auth/admin/signin (no X-Tenant-ID).
   */
  ADMIN_CREDENTIALS: {
    email: process.env["E2E_PLATFORM_ADMIN_EMAIL"] ?? "jonathan.pierce@demo.iqkv.com",
    password: process.env["E2E_PLATFORM_ADMIN_PASSWORD"] ?? "ChangeMePass123!",
  },

  /** Path where Playwright stores the pre-authenticated browser storage state. */
  STORAGE_STATE: ".playwright/auth/platform-admin.json",
} as const;
