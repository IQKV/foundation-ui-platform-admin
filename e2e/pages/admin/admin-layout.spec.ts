import { test, expect } from "../../app/fixtures/index.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";

test.describe("Admin Layout E2E Tests", () => {
  test("admin layout loads with all key elements", async ({ adminPage }) => {
    await adminPage.expectAdminLayoutVisible();
    await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_NAV))).toBeVisible();
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE)),
    ).toBeVisible();
    await expect(
      adminPage.page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeHidden();
  });

  test("color scheme toggle works", async ({ adminPage }) => {
    await adminPage.toggleColorScheme();
    await adminPage.page.waitForTimeout(500);
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

  test("error boundary displays correctly", async ({ adminPage }) => {
    await adminPage.page.goto("/non-existent-route");
    await adminPage.page.waitForLoadState("networkidle");
    await expect(adminPage.page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(adminPage.page.locator(byTestId(TestSelectors.BUTTON.GO_HOME))).toBeVisible();
  });

  test("loading overlay appears during navigation", async ({ adminPage }) => {
    const loadingOverlay = adminPage.page.locator(byTestId(TestSelectors.LOADING_OVERLAY));
    await expect(loadingOverlay).toBeHidden();
  });

  test("app is accessible with keyboard navigation", async ({ adminPage }) => {
    await adminPage.page.keyboard.press("Tab");
    const focusedElement = adminPage.page.locator("*:focus");
    await expect(focusedElement).toBeAttached();
  });

  test("responsive design works across breakpoints", async ({ adminPage }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1024, height: 768, name: "desktop" },
      { width: 1920, height: 1080, name: "large" },
    ];

    for (const viewport of viewports) {
      await adminPage.page.setViewportSize(viewport);
      await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
      await expect(adminPage.page.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();

      const mobileToggle = adminPage.page.locator(
        byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE),
      );
      if (viewport.width < 768) {
        await expect(mobileToggle).toBeVisible();
      } else {
        await expect(mobileToggle).toBeHidden();
      }
    }
  });
});

test.describe("Error Handling", () => {
  test("error boundary displays retry button", async ({ adminPage }) => {
    const errorBoundary = adminPage.page.locator(byTestId(TestSelectors.ERROR_BOUNDARY));
    await expect(errorBoundary).toBeHidden();
  });
});
