import { test, expect } from "@playwright/test";
import { AuthPage } from "../../shared/utils/auth-page.js";
import { AUTH_CONFIG } from "../../app/config/auth.js";
import { TestSelectors, byTestId } from "../../shared/selectors/test-selectors.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Sign-in flow tests — unauthenticated context, no stored session.
 *
 * The platform-admin app uses a single-step sign-in via
 * POST /v1/iam/auth/admin/signin (no X-Tenant-ID / tenant picker).
 */
test.describe("Sign-In Flow", () => {
  let auth: AuthPage;

  test.beforeEach(async ({ page }) => {
    auth = new AuthPage(page);
    await auth.goToSignIn();
  });

  test("sign-in page renders all required elements", async () => {
    await auth.expectSignInPageVisible();
  });

  test("unauthenticated navigation to / redirects to sign-in", async ({ page }) => {
    await page.goto("/");
    await auth.expectRedirectedToSignIn();
  });

  test("email and password inputs accept text", async () => {
    await auth.emailInput.fill("test@example.com");
    await auth.passwordInput.fill("password");
    await expect(auth.emailInput).toHaveValue("test@example.com");
    await expect(auth.passwordInput).toHaveValue("password");
  });

  test("password field masks input", async () => {
    await expect(auth.passwordInput).toHaveAttribute("type", "password");
  });

  test("submit button is enabled with credentials", async () => {
    await auth.fillSignInForm("test@example.com", "password");
    await expect(auth.submitButton).toBeEnabled();
  });

  test("locale switcher is present on the sign-in page", async () => {
    await expect(auth.localeSwitcher).toBeVisible();
  });

  test("sign-in with valid credentials redirects to admin dashboard", async ({ page }) => {
    const { email, password } = AUTH_CONFIG.ADMIN_CREDENTIALS;
    await auth.signIn(email, password);

    await expect(page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible({
      timeout: TIMEOUTS.SLOW,
    });
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test("sign-in with invalid credentials shows an error", async ({ page }) => {
    await auth.signIn("notanadmin@example.com", "WrongPass123!");
    // Should remain on sign-in page
    await expect(page).toHaveURL(/sign-in/);
    await expect(auth.signInForm).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  });

  test("empty form submission stays on sign-in page", async ({ page }) => {
    await auth.submitSignIn();
    await expect(page).toHaveURL(/sign-in/);
    await expect(auth.signInForm).toBeVisible();
  });
});
