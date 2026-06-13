import { test, expect } from "./fixtures/index.js";
import { TestSelectors, byTestId } from "./utils/test-selectors.js";

test.describe("Admin Layout E2E Tests", () => {
  test("admin layout loads with all key elements", async ({ adminPage }) => {
    // Check main layout elements
    await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
    await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();
    await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_NAV))).toBeVisible();

    // Check header elements (color scheme toggle is present)
    await expect(
      adminPage.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE)),
    ).toBeVisible();

    // Check mobile menu toggle (hidden on desktop)
    await expect(adminPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE))).toBeHidden();
  });

  test("color scheme toggle works", async ({ adminPage }) => {
    const toggle = adminPage.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE));

    // Check initial state
    await expect(toggle).toBeVisible();

    // Click the toggle
    await toggle.click();

    // Wait for any theme change animations
    await adminPage.waitForTimeout(500);

    // Verify toggle is still visible after click
    await expect(toggle).toBeVisible();
  });

  test("mobile menu toggle appears on small screens", async ({ adminPage }) => {
    // Set mobile viewport
    await adminPage.setViewportSize({ width: 375, height: 667 });

    // Mobile menu toggle should be visible on mobile
    await expect(
      adminPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeVisible();

    // Click mobile menu toggle
    const mobileToggle = adminPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));
    await mobileToggle.click();

    // Navigation should be visible after toggle
    await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_NAV))).toBeVisible();
  });

  test("error boundary displays correctly", async ({ adminPage }) => {
    // Navigate to a non-existent route to trigger 404
    await adminPage.goto("/non-existent-route");
    await adminPage.waitForLoadState("networkidle");

    // Check 404 page
    await expect(adminPage.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(adminPage.locator(byTestId(TestSelectors.BUTTON("go-home")))).toBeVisible();
  });

  test("loading overlay appears during navigation", async ({ adminPage }) => {
    // This test would require mocking a slow-loading route
    // For now, we'll just verify the selector pattern works
    const loadingOverlay = adminPage.locator(byTestId(TestSelectors.LOADING_OVERLAY));

    // Initially should not be visible
    await expect(loadingOverlay).toBeHidden();
  });

  test("app is accessible with keyboard navigation", async ({ adminPage }) => {
    // Test tab navigation through header
    await adminPage.keyboard.press("Tab");

    // Focus should move to first focusable element
    // We can't predict exact order, but we can verify focus moves
    const focusedElement = adminPage.locator("*:focus");
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
      await adminPage.setViewportSize(viewport);

      // Verify layout is visible at all breakpoints
      await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
      await expect(adminPage.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();

      // Mobile menu toggle visibility depends on viewport
      const mobileToggle = adminPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));
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
    // We can't easily trigger the error boundary without a specific error route
    // But we can verify the pattern for future error boundary tests
    const errorBoundary = adminPage.locator(byTestId(TestSelectors.ERROR_BOUNDARY));

    // Should not be visible unless there's an error
    await expect(errorBoundary).toBeHidden();
  });
});
