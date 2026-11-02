import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Page Object for the Admin Master Catalog page (/admin/master-catalog).
 *
 * Covers:
 *   - Master venues table with search and city filter
 *   - Create venue modal (button-master-catalog-create)
 *   - Edit venue modal (button--edit-venue)
 *   - Delete venue modal (button--delete-venue)
 *   - Venue detail navigation (button-master-venue-view)
 */
export class AdminMasterCatalogPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.ADMIN_MASTER_CATALOG);
    await this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT)).waitFor({
      state: "visible",
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  // ─── Toolbar locators ─────────────────────────────────────────────────────

  get searchInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.INPUT.MASTER_CATALOG_SEARCH));
  }

  get cityFilter(): Locator {
    return this.page.locator(byTestId(TestSelectors.SELECT.MASTER_CATALOG_CITY_FILTER));
  }

  get createButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_CATALOG_CREATE));
  }

  get refreshButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_CATALOG_REFRESH));
  }

  get clearFiltersButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_CATALOG_CLEAR_FILTERS));
  }

  get totalCountBadge(): Locator {
    return this.page.locator(byTestId(TestSelectors.BADGE.MASTER_CATALOG_TOTAL_COUNT));
  }

  // ─── Venue action locators ────────────────────────────────────────────────

  venueViewButton(venueId: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_VENUE_VIEW(venueId)));
  }

  venueEditButton(venueId: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_VENUE_EDIT(venueId)));
  }

  venueDeleteButton(venueId: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_VENUE_DELETE(venueId)));
  }

  // ─── Modal locators ───────────────────────────────────────────────────────

  get createVenueModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.CREATE_MASTER_VENUE));
  }

  get editVenueModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.EDIT_MASTER_VENUE));
  }

  get deleteVenueModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.DELETE_MASTER_VENUE));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async searchVenues(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.page.locator(byTestId(TestSelectors.BUTTON.MASTER_CATALOG_SEARCH_CLEAR)).click();
  }

  async waitForMasterCatalogLoaded() {
    await expect(this.totalCountBadge).toBeVisible({ timeout: TIMEOUTS.SLOW });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
  }
}
