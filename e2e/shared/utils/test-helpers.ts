import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { TEST_CONFIG } from "../../app/config/test-config.js";

export class AppPage {
  constructor(readonly page: Page) {}

  async goToHome() {
    await this.page.goto(TEST_CONFIG.ROUTES.HOME);
    await this.page.waitForLoadState("networkidle");
  }

  async goTo404() {
    await this.page.goto(TEST_CONFIG.ROUTES.NOT_FOUND);
    await this.page.waitForLoadState("networkidle");
  }

  async goToSignIn() {
    await this.page.goto(TEST_CONFIG.ROUTES.SIGN_IN);
    await this.page.waitForLoadState("networkidle");
  }

  async expectHomePageVisible() {
    // The home page (/) redirects to /admin, so we expect admin layout
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
  }

  async expect404PageVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "404" })).toBeVisible();
  }

  // Helper methods for common test operations
  async getByTestId(testId: string): Promise<Locator> {
    return this.page.locator(byTestId(testId));
  }

  async clickByTestId(testId: string) {
    const element = await this.getByTestId(testId);
    await element.click();
  }

  async waitForTestId(testId: string, options?: { state?: "attached" | "visible" | "hidden" }) {
    const element = await this.getByTestId(testId);
    await element.waitFor(options);
  }
}

export class AdminPage extends AppPage {
  constructor(page: Page) {
    super(page);
  }

  async goToUsers() {
    await this.page.goto(TEST_CONFIG.ROUTES.ADMIN_USERS);
    await this.page.waitForLoadState("networkidle");
  }

  async goToTenants() {
    await this.page.goto(TEST_CONFIG.ROUTES.ADMIN_TENANTS);
    await this.page.waitForLoadState("networkidle");
  }

  async goToInvitations() {
    await this.page.goto(TEST_CONFIG.ROUTES.ADMIN_INVITATIONS);
    await this.page.waitForLoadState("networkidle");
  }

  async goToPlans() {
    await this.page.goto(TEST_CONFIG.ROUTES.ADMIN_PLANS);
    await this.page.waitForLoadState("networkidle");
  }

  async goToAccount() {
    await this.page.goto(TEST_CONFIG.ROUTES.ADMIN_ACCOUNT);
    await this.page.waitForLoadState("networkidle");
  }

  async expectAdminLayoutVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT))).toBeVisible();
    await expect(this.page.locator(byTestId(TestSelectors.ADMIN_HEADER))).toBeVisible();
  }

  async toggleColorScheme() {
    await this.clickByTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE);
  }

  async toggleMobileMenu() {
    await this.clickByTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE);
  }
}

export const testUtils = {
  async waitForPageReady(page: Page) {
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState("domcontentloaded");
  },

  async testResponsiveDesign(page: Page, testCallback: (page: Page) => Promise<void>) {
    const viewports = Object.values(TEST_CONFIG.VIEWPORTS);
    for (const viewport of viewports) {
      await page.setViewportSize(viewport as { width: number; height: number });
      await testCallback(page);
    }
  },

  // Test ID utilities
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
