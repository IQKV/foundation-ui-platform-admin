import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../selectors/test-selectors.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

/**
 * Page Object for the Admin Users page (/admin/users).
 *
 * Covers:
 *   - Users table with search and status filter
 *   - User detail view (via button-user-view)
 *   - User action menu (edit, ban, set-password, unlock)
 */
export class AdminUsersPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.ADMIN_USERS);
    await this.page.locator(byTestId(TestSelectors.ADMIN_LAYOUT)).waitFor({
      state: "visible",
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  // ─── Toolbar locators ─────────────────────────────────────────────────────

  get searchInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.INPUT.USERS_SEARCH));
  }

  get statusFilter(): Locator {
    return this.page.locator(byTestId(TestSelectors.SELECT.USERS_STATUS_FILTER));
  }

  get refreshButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.USERS_REFRESH));
  }

  get clearFiltersButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.USERS_CLEAR_FILTERS));
  }

  get totalCountBadge(): Locator {
    return this.page.locator(byTestId(TestSelectors.BADGE.USERS_TOTAL_COUNT));
  }

  // ─── User action locators ─────────────────────────────────────────────────

  userViewButton(userId: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.USER_VIEW(userId)));
  }

  userMenuButton(userId: string): Locator {
    return this.page.locator(byTestId(TestSelectors.BUTTON.USER_MENU(userId)));
  }

  // ─── Modal locators ───────────────────────────────────────────────────────

  get editUserModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.EDIT_USER));
  }

  get banUserModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.BAN_USER));
  }

  get setPasswordModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.MODAL.SET_PASSWORD));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.page.locator(byTestId(TestSelectors.BUTTON.USERS_SEARCH_CLEAR)).click();
  }

  async waitForUsersLoaded() {
    // Wait for loading spinner to disappear and total count badge to appear
    await expect(this.totalCountBadge).toBeVisible({ timeout: TIMEOUTS.SLOW });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
  }
}
