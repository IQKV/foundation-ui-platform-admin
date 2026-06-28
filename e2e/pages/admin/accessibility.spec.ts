import { test } from "@playwright/test";
import { test as authTest } from "../../app/fixtures/index.js";
import { checkA11y } from "../../shared/utils/a11y.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Accessibility tests using axe-core.
 *
 * These are structural checks — they catch missing ARIA roles, colour
 * contrast failures, missing form labels, etc.
 * They do NOT replace manual testing with assistive technologies.
 */

// ─── Unauthenticated pages ────────────────────────────────────────────────────

test.describe("A11y — Unauthenticated pages", () => {
  test("sign-in page has no violations", async ({ page }) => {
    await page.goto(ROUTES.SIGN_IN);
    await page.locator(byTestId(TestSelectors.SIGN_IN_FORM)).waitFor({ state: "visible" });
    await checkA11y(page);
  });

  test("404 error page has no violations", async ({ page }) => {
    await page.goto(ROUTES.NOT_FOUND);
    await page.locator(byTestId(TestSelectors.PAGE_404)).waitFor({ state: "visible" });
    await checkA11y(page);
  });
});

// ─── Authenticated pages ──────────────────────────────────────────────────────

authTest.describe("A11y — Authenticated pages", () => {
  authTest("admin dashboard has no violations", async ({ adminPage }) => {
    await checkA11y(adminPage.page);
  });

  authTest("admin header has no violations", async ({ adminPage }) => {
    await checkA11y(adminPage.page, {
      include: byTestId(TestSelectors.ADMIN_HEADER),
    });
  });

  authTest("admin navigation has no violations", async ({ adminPage }) => {
    await checkA11y(adminPage.page, {
      include: byTestId(TestSelectors.ADMIN_NAV),
    });
  });

  authTest("users page has no violations", async ({ adminPage }) => {
    await adminPage.goToUsers();
    await checkA11y(adminPage.page);
  });

  authTest("organisations page has no violations", async ({ adminPage }) => {
    await adminPage.goToTenants();
    await checkA11y(adminPage.page);
  });

  authTest("account page has no violations", async ({ adminPage }) => {
    await adminPage.goToAccount();
    await adminPage.page
      .locator(byTestId(TestSelectors.PAGE_ACCOUNT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
    await checkA11y(adminPage.page);
  });

  authTest("user menu has no violations when open", async ({ adminPage }) => {
    await adminPage.page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await adminPage.page
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });
    await checkA11y(adminPage.page, {
      include: byTestId(TestSelectors.HEADER_USER_MENU),
    });
  });
});
