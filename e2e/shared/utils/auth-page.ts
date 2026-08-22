import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Page Object for the platform-admin sign-in flow.
 *
 * The admin app uses a single-step sign-in (email + password, no tenant picker)
 * against POST /v1/iam/auth/admin/signin.
 */
export class AuthPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goToSignIn() {
    await this.page.goto(ROUTES.SIGN_IN);
    await this.signInForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  // ─── Locators ─────────────────────────────────────────────────────────────

  get authLayout(): Locator {
    return this.page.locator(byTestId(TestSelectors.AUTH_LAYOUT));
  }

  get signInForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_FORM));
  }

  get emailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT));
  }

  get passwordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT));
  }

  get submitButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON));
  }

  get errorAlert(): Locator {
    return this.page.locator(byTestId(TestSelectors.ALERT.SIGN_IN_ERROR));
  }

  get localeSwitcher(): Locator {
    return this.page.locator(byTestId(TestSelectors.LOCALE_SWITCHER));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillSignInForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitSignIn() {
    await this.submitButton.click();
  }

  async signIn(email: string, password: string) {
    await this.fillSignInForm(email, password);
    await this.submitSignIn();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectSignInPageVisible() {
    await expect(this.signInForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectRedirectedToSignIn() {
    await expect(this.page).toHaveURL(/sign-in/);
    await expect(this.signInForm).toBeVisible();
  }

  async expectSignInError() {
    await expect(this.errorAlert).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  }
}
