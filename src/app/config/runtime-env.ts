const readRuntimeEnv = (key: string): string | undefined => {
  const w: any = typeof window !== "undefined" ? (window as any) : undefined;
  return (w && w[key]) ?? (import.meta as any).env?.[key];
};

const ENV_KEYS = [
  "VITE_API_SERVER_URL",
  "VITE_LOG_LEVEL",
  "VITE_DEMO_MODE",
  "VITE_APP_TITLE",
  "VITE_APP_BRAND_NAME",
  "VITE_APP_BRAND_TAGLINE",
  "VITE_APP_AUTH_SECTION_LABEL",
  "VITE_APP_AUTH_BADGES",
  "VITE_APP_AUTH_HEADLINE_1",
  "VITE_APP_AUTH_HEADLINE_2",
  "VITE_APP_AUTH_TAGLINE",
  "VITE_APP_VENDOR_NAME",
  "VITE_APP_NAV_VARIANT",
] as const;

export const clientBuildEnv: Record<string, string | undefined> = Object.fromEntries(
  ENV_KEYS.map((k) => [k, readRuntimeEnv(k)]),
) as Record<string, string | undefined>;

export const getConfig = (key: string, fallback?: string): string | undefined => {
  return clientBuildEnv[key] ?? fallback;
};

export const isDemoMode = getConfig("VITE_DEMO_MODE", "false") === "true";

export const appTitle = getConfig("VITE_APP_TITLE", "Key Value Admin")!;

export const appBrandName = getConfig("VITE_APP_BRAND_NAME", "Key Value")!;

export const appBrandTagline = getConfig("VITE_APP_BRAND_TAGLINE", "Admin")!;

export const authSectionLabel = getConfig("VITE_APP_AUTH_SECTION_LABEL", "Operator access only")!;

export const authBadges = getConfig("VITE_APP_AUTH_BADGES", "SOC 2 Type II,GDPR Ready")!
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

export const authHeadline1 = getConfig("VITE_APP_AUTH_HEADLINE_1", "Platform control,")!;

export const authHeadline2 = getConfig("VITE_APP_AUTH_HEADLINE_2", "fully in your hands.")!;

export const authTagline = getConfig(
  "VITE_APP_AUTH_TAGLINE",
  "Manage users, organizations, and subscriptions across all tenants — secured by platform-level authentication.",
)!;

export const vendorName = getConfig("VITE_APP_VENDOR_NAME", "iQKV Foundation Team")!;

/**
 * Navigation layout variant.
 *
 * "sidebar"  — original left sidebar with section groups (default).
 * "topbar"   — two-level horizontal top navigation (L1 section tabs + L2 item strip).
 *
 * Set via VITE_APP_NAV_VARIANT env var or window.VITE_APP_NAV_VARIANT at runtime.
 */
export type NavVariant = "sidebar" | "topbar";

export const navVariant: NavVariant =
  getConfig("VITE_APP_NAV_VARIANT", "sidebar") === "topbar" ? "topbar" : "sidebar";
