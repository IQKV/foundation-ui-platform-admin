import { test, expect } from "../../app/fixtures/index.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";

/**
 * Sign-out flow tests — authenticated context (adminPage fixture).
 */
test.describe("Sign-Out Flow", () => {
  test("sign-out button is accessible from the header user menu", async ({ adminPage }) => {
    await adminPage.page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await adminPage.page
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    const signOutButton = adminPage.page.locator(byTestId(TestSelectors.BUTTON.SIGN_OUT));
    await expect(signOutButton).toBeVisible();
    await expect(signOutButton).toBeEnabled();
  });

  test("clicking sign-out redirects to sign-in page", async ({ adminPage }) => {
    await adminPage.page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await adminPage.page
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    await adminPage.page.locator(byTestId(TestSelectors.BUTTON.SIGN_OUT)).click();

    await expect(adminPage.page).toHaveURL(/sign-in/, { timeout: 15_000 });
    await expect(adminPage.page.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
  });

  test("after sign-out, navigating to /admin redirects to sign-in", async ({ adminPage }) => {
    // Sign out first
    await adminPage.page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await adminPage.page
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });
    await adminPage.page.locator(byTestId(TestSelectors.BUTTON.SIGN_OUT)).click();
    await expect(adminPage.page).toHaveURL(/sign-in/, { timeout: 15_000 });

    // Attempt direct navigation — route guard should redirect
    await adminPage.page.goto("/admin");
    await expect(adminPage.page).toHaveURL(/sign-in/);
  });
});
