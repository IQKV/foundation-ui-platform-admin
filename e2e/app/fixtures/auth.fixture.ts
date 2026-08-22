import { test as base, expect, type Page } from "@playwright/test";
import { AUTH_CONFIG } from "../config/auth.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";
import { AdminPage } from "../../shared/utils/test-helpers.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** AdminPage pre-authenticated as the platform admin. Navigated to /admin on setup. */
  adminPage: AdminPage;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs in via the UI form and waits until the admin layout is visible.
 * Used by global-setup to pre-authenticate and persist browser storage state.
 */
export async function signInAsPlatformAdmin(page: Page): Promise<void> {
  const { email, password } = AUTH_CONFIG.ADMIN_CREDENTIALS;

  await page.goto(ROUTES.SIGN_IN);

  // Wait for the sign-in form — no networkidle needed
  await page.locator(byTestId(TestSelectors.SIGN_IN_FORM)).waitFor({
    state: "visible",
    timeout: TIMEOUTS.NAVIGATION,
  });

  await page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT)).fill(email);
  await page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT)).fill(password);
  await page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON)).click();

  // Wait for URL to move away from sign-in
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: TIMEOUTS.NAVIGATION,
  });

  // Confirm the admin shell has rendered
  await expect(page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible({
    timeout: TIMEOUTS.DEFAULT,
  });
}

/**
 * Navigates to /admin and falls back to a fresh sign-in if the stored session
 * has expired (route guard redirects to /sign-in).
 *
 * Uses Promise.race on admin-layout vs sign-in form instead of URL string
 * matching so WS/SSE connections don't interfere.
 */
export async function restoreAdminSession(page: Page): Promise<void> {
  await page.goto(ROUTES.ADMIN);

  const adminLayout = page.locator(byTestId(TestSelectors.ADMIN_LAYOUT));
  const signInForm = page.locator(byTestId(TestSelectors.SIGN_IN_FORM));

  const landed = await Promise.race([
    adminLayout.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION }).then(() => "admin"),
    signInForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION }).then(() => "signin"),
  ]).catch(() => "timeout");

  if (landed === "signin") {
    await signInAsPlatformAdmin(page);
    return;
  }

  if (landed === "timeout") {
    throw new Error("restoreAdminSession: neither admin-layout nor sign-in form appeared in time");
  }
}

// ─── Extended test fixture ────────────────────────────────────────────────────

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_CONFIG.STORAGE_STATE,
    });
    const page = await context.newPage();
    const adminPage = new AdminPage(page);
    await restoreAdminSession(page);
    await use(adminPage);
    await context.close();
  },
});

export { expect } from "@playwright/test";
