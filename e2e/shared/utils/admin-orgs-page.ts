import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Page Object for the Admin Organisations page (/admin/organizations).
 *
 * Covers:
 *   - Organisations table with search and status filter
 *   - Org detail view (via button-org-view)
 *   - Edit org modal
 */
export class AdminOrgsPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.ADMIN_TENANTS);
    await this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT)).waitFor({
      state: "visible",
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  // ─── Toolbar locators ─────────────────────────────────────────────────────

  get searchInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.INPUT.ORGS_SEARCH));
  }

  get statusFilter(): Locator {
    return this.page.locator(byTestId(TestSelectors.SELECT.ORGS_STATUS_FILTER));
  }

  get refreshButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.ORGS_REFRESH));
  }

  get clearFiltersButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.ORGS_CLEAR_FILTERS));
  }

  get totalCountBadge(): Locator {
    return this.page.locator(byTestId(TestSelectors.BADGE.ORGS_TOTAL_COUNT));
  }

  get tabCountBadge(): Locator {
    return this.page.locator(byTestId(TestSelectors.BADGE.ORGS_TAB_COUNT));
  }

  // ─── Org action locators ──────────────────────────────────────────────────

  orgViewButton(tenantKey: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.ORG_VIEW(tenantKey)));
  }

  orgEditButton(tenantKey: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.ORG_EDIT(tenantKey)));
  }

  // ─── Modal locators ───────────────────────────────────────────────────────

  get editTenantModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.EDIT_TENANT));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async searchOrgs(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.page.locator(byTestId(TestSelectors.BUTTON.ORGS_SEARCH_CLEAR)).click();
  }

  async waitForOrgsLoaded() {
    await expect(this.totalCountBadge).toBeVisible({ timeout: TIMEOUTS.SLOW });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
  }
}
