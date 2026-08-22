/**
 * App route constants used in navigation helpers and test assertions.
 * Keep in sync with the TanStack Router route tree in src/pages/.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_TENANTS: "/admin/organizations",
  ADMIN_INVITATIONS: "/admin/invitations",
  ADMIN_PLANS: "/admin/plans",
  ADMIN_ACCOUNT: "/admin/account",
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
  UNAUTHORIZED: "/unauthorized",
  UNKNOWN: "/this-page-does-not-exist",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
