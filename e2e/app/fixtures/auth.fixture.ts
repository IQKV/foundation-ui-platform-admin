import { test as base, expect, type Page } from "@playwright/test";
import { TEST_CONFIG } from "../config/test-config.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";
import { AdminPage, AppPage } from "../../shared/utils/test-helpers.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** Page pre-authenticated as the platform admin. Navigated to /admin on setup. */
  adminPage: AdminPage;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs in via the UI form and waits until the admin layout is visible.
 * Used by global-setup to pre-authenticate and persist browser storage state.
 */
export async function signInAsPlatformAdmin(page: Page): Promise<void> {
  const admin = TEST_CONFIG.ADMIN_CREDENTIALS;
  if (!admin) {
    throw new Error("TEST_CONFIG.ADMIN_CREDENTIALS is undefined");
  }
  const { email, password } = admin;

  await page.goto(TEST_CONFIG.ROUTES.SIGN_IN);
  await page.waitForLoadState("networkidle");

  await page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT)).fill(email);
  await page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT)).fill(password);
  await page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON)).click();

  await page.waitForURL(`**${TEST_CONFIG.ROUTES.ADMIN}**`, {
    timeout: TEST_CONFIG.NAVIGATION_TIMEOUT,
  });

  await expect(page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible({
    timeout: TEST_CONFIG.DEFAULT_TIMEOUT,
  });
}

/**
 * Navigates to /admin and falls back to a fresh sign-in if the stored session
 * has expired (route guard redirects to /sign-in).
 */
export async function restoreAdminSession(page: Page): Promise<void> {
  await page.goto(TEST_CONFIG.ROUTES.ADMIN);
  await page.waitForLoadState("networkidle");

  if (page.url().includes(TEST_CONFIG.ROUTES.SIGN_IN)) {
    await signInAsPlatformAdmin(page);
  }
}

// ─── Extended test fixture ────────────────────────────────────────────────────

/**
 * Extended Playwright `test` that provides an `adminPage` fixture.
 *
 * Reuses the storage state saved by global-setup so no per-test sign-in
 * network call is needed.  Falls back to a fresh sign-in if the session
 * has expired.
 *
 * Usage:
 * ```
 * import { test, expect } from "../fixtures";
 *
 * test("admin dashboard loads", async ({ adminPage }) => {
 *   await adminPage.expectAdminLayoutVisible();
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_CONFIG.STORAGE_STATE,
    });
    const page = await context.newPage();
    const adminPage = new AdminPage(page);
    await restoreAdminSession(page);
    await use(adminPage);
    await context.close();
  },
});

export { expect } from "@playwright/test";
