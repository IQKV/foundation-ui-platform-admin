export const TEST_CONFIG = {
  DEFAULT_TIMEOUT: 10_000,
  NAVIGATION_TIMEOUT: 15_000,

  VIEWPORTS: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },

  ROUTES: {
    HOME: "/",
    SIGN_IN: "/sign-in",
    ADMIN: "/admin",
    ADMIN_USERS: "/admin/users",
    ADMIN_TENANTS: "/admin/organizations",
    ADMIN_INVITATIONS: "/admin/invitations",
    ADMIN_PLANS: "/admin/plans",
    ADMIN_ACCOUNT: "/admin/account",
    NOT_FOUND: "/404",
    UNAUTHORIZED: "/unauthorized",
    UNKNOWN: "/this-page-does-not-exist",
  },

  /**
   * Platform admin credentials — the only account type that can sign in to
   * this app.  Seeded by migration 20260517000004-demo-e2e-users.xml.
   * Read from process.env so CI secrets override the .env.e2e defaults.
   */
  PLATFORM_ADMIN: {
    email: process.env["E2E_PLATFORM_ADMIN_EMAIL"] ?? "jonathan.pierce@iqkv.com",
    password: process.env["E2E_PLATFORM_ADMIN_PASSWORD"] ?? "TenantAdmin123!",
  },

  /** Path where Playwright stores the authenticated browser state. */
  STORAGE_STATE: ".playwright/auth/platform-admin.json",
} as const;
