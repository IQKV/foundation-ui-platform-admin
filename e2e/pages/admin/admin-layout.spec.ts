import { test, expect } from "../../app/fixtures/index.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";

test.describe("Admin Layout E2E Tests", () => {
  test("admin layout loads with all key elements", async ({ adminPage }) => {
    await adminPage.expectAdminLayoutVisible();
    await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_NAV))).toBeVisible();
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE)),
    ).toBeVisible();
    // Mobile hamburger is hidden on desktop viewport
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeHidden();
  });

  test("color scheme toggle flips the scheme", async ({ adminPage }) => {
    // toggleColorScheme now waits for the html attribute to change — no arbitrary sleep
    await adminPage.toggleColorScheme();
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE)),
    ).toBeVisible();
  });

  test("mobile menu toggle appears on small screens", async ({ adminPage }) => {
    await adminPage.page.setViewportSize({ width: 375, height: 667 });
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeVisible();
    await adminPage.toggleMobileMenu();
    await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_NAV))).toBeVisible();
  });

  test("unknown route shows 404 page", async ({ adminPage }) => {
    await adminPage.page.goto("/non-existent-route");
    await expect(adminPage.page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(adminPage.page.locator(byTestId(TestSelectors.BUTTON.GO_HOME))).toBeVisible();
  });

  test("loading overlay is hidden after page loads", async ({ adminPage }) => {
    await expect(adminPage.page.locator(byTestId(TestSelectors.LOADING_OVERLAY))).toBeHidden();
  });

  test("error boundary is hidden when no render error has occurred", async ({ adminPage }) => {
    await expect(adminPage.page.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).toBeHidden();
  });

  test("app is accessible with keyboard navigation", async ({ adminPage }) => {
    await adminPage.page.locator("body").click();
    await adminPage.page.keyboard.press("Tab");
    const hasFocus = await adminPage.page.evaluate(
      () => document.activeElement !== null && document.activeElement !== document.body,
    );
    expect(hasFocus).toBe(true);
  });

  test("responsive layout across breakpoints", async ({ adminPage }) => {
    const viewports = [
      { width: 375, height: 667, mobile: true },
      { width: 768, height: 1024, mobile: false },
      { width: 1024, height: 768, mobile: false },
      { width: 1920, height: 1080, mobile: false },
    ];

    for (const { width, height, mobile } of viewports) {
      await adminPage.page.setViewportSize({ width, height });

      const mobileToggle = adminPage.page.locator(
        byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE),
      );

      if (mobile) {
        await expect(mobileToggle).toBeVisible();
      } else {
        await expect(mobileToggle).toBeHidden();
      }

      await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
      await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();
    }
  });
});

test.describe("Error Handling", () => {
  test("error boundary is hidden with no active errors", async ({ adminPage }) => {
    await expect(adminPage.page.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).toBeHidden();
  });
});
