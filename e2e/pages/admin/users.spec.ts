import { expect } from "@playwright/test";
import { test } from "../../app/fixtures/index.js";
import { AdminUsersPage } from "../../shared/utils/index.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

test.describe("Admin Users Page", () => {
  let usersPage: AdminUsersPage;

  test.beforeEach(async ({ adminPage }) => {
    usersPage = new AdminUsersPage(adminPage.page);
    await usersPage.goto();
  });

  test("page renders search and filter controls", async () => {
    await usersPage.expectPageVisible();
  });

  test("search input accepts text", async () => {
    await usersPage.searchUsers("margaret");
    await expect(usersPage.searchInput).toHaveValue("margaret");
  });

  test("status filter is visible", async () => {
    await expect(usersPage.statusFilter).toBeVisible();
  });

  test("refresh button is visible and enabled", async () => {
    await expect(usersPage.refreshButton).toBeVisible();
    await expect(usersPage.refreshButton).toBeEnabled();
  });

  test("total count badge appears after data loads", async () => {
    await usersPage.waitForUsersLoaded();
    await expect(usersPage.totalCountBadge).toBeVisible();
  });

  test("navigating directly to /admin/users works when authenticated", async ({ adminPage }) => {
    await adminPage.page.goto(ROUTES.ADMIN_USERS);
    await expect(adminPage.page.locator(`[data-testid="admin-layout"]`)).toBeVisible({
      timeout: TIMEOUTS.NAVIGATION,
    });
  });
});
