import { test as base, expect, type Page } from "@playwright/test";
import { TEST_CONFIG } from "../config/test-config";
import { TestSelectors } from "../utils/test-selectors";
import { byTestId } from "../utils/test-selectors";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** Page pre-authenticated as the platform admin. Navigated to /admin on setup. */
  adminPage: Page;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs in via the UI form and waits until the admin layout is visible.
 * Used by global-setup to pre-authenticate and persist browser storage state.
 */
export async function signInAsPlatformAdmin(page: Page): Promise<void> {
  const { email, password } = TEST_CONFIG.PLATFORM_ADMIN;

  await page.goto(TEST_CONFIG.ROUTES.SIGN_IN);
  await page.waitForLoadState("networkidle");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

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
 * ```ts
 * import { test, expect } from "../fixtures";
 *
 * test("admin dashboard loads", async ({ adminPage }) => {
 *   await expect(adminPage.locator("[data-testid='admin-layout']")).toBeVisible();
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_CONFIG.STORAGE_STATE,
    });
    const page = await context.newPage();
    await restoreAdminSession(page);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
