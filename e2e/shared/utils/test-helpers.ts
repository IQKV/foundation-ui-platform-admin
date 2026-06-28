import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";
import { VIEWPORTS } from "../../app/config/viewports.js";

export class AppPage {
  constructor(readonly page: Page) {}

  async goToHome() {
    await this.page.goto(ROUTES.HOME);
    // Wait for the admin layout (authenticated) or the sign-in form (unauthenticated)
    await this.page
      .locator(`${byTestId(TestSelectors.ADMIN_LAYOUT)}, ${byTestId(TestSelectors.SIGN_IN_FORM)}`)
      .first()
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goTo404() {
    await this.page.goto(ROUTES.NOT_FOUND);
    await this.page
      .locator(byTestId(TestSelectors.PAGE_404))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToSignIn() {
    await this.page.goto(ROUTES.SIGN_IN);
    await this.page
      .locator(byTestId(TestSelectors.SIGN_IN_FORM))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async expectHomePageVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
  }

  async expect404PageVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "404" })).toBeVisible();
  }

  getByTestId(testId: string): Locator {
    return this.page.locator(byTestId(testId));
  }

  async clickByTestId(testId: string) {
    await this.getByTestId(testId).click();
  }

  async waitForTestId(testId: string, options?: { state?: "attached" | "visible" | "hidden" }) {
    await this.getByTestId(testId).waitFor(options);
  }
}

export class AdminPage extends AppPage {
  constructor(page: Page) {
    super(page);
  }

  async goToUsers() {
    await this.page.goto(ROUTES.ADMIN_USERS);
    await this.page
      .locator(byTestId(TestSelectors.ADMIN_LAYOUT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToTenants() {
    await this.page.goto(ROUTES.ADMIN_TENANTS);
    await this.page
      .locator(byTestId(TestSelectors.ADMIN_LAYOUT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToInvitations() {
    await this.page.goto(ROUTES.ADMIN_INVITATIONS);
    await this.page
      .locator(byTestId(TestSelectors.ADMIN_LAYOUT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToPlans() {
    await this.page.goto(ROUTES.ADMIN_PLANS);
    await this.page
      .locator(byTestId(TestSelectors.ADMIN_LAYOUT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToAccount() {
    await this.page.goto(ROUTES.ADMIN_ACCOUNT);
    await this.page
      .locator(byTestId(TestSelectors.PAGE_ACCOUNT))
      .waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async expectAdminLayoutVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();
  }

  async toggleColorScheme() {
    const htmlEl = this.page.locator("html");
    const before = await htmlEl.getAttribute("data-mantine-color-scheme");
    await this.clickByTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE);
    await expect(htmlEl).not.toHaveAttribute("data-mantine-color-scheme", before ?? "");
  }

  async toggleMobileMenu() {
    await this.clickByTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE);
  }
}

export const testUtils = {
  /**
   * Waits for the page to be interactive without networkidle.
   * networkidle is unreliable when the app holds open WS/SSE connections.
   */
  async waitForPageReady(page: Page) {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("load");
  },

  async waitForAdminShell(page: Page) {
    await expect(page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible({
      timeout: TIMEOUTS.NAVIGATION,
    });
  },

  async testResponsiveDesign(page: Page, testCallback: (page: Page) => Promise<void>) {
    for (const viewport of Object.values(VIEWPORTS)) {
      await page.setViewportSize(viewport as { width: number; height: number });
      await testCallback(page);
    }
  },

  byTestId,

  async expectVisibleByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeVisible();
  },

  async expectHiddenByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeHidden();
  },

  async expectAttachedByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeAttached();
  },
};
