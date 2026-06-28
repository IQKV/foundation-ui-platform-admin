import { expect } from "@playwright/test";
import { test } from "../../app/fixtures/index.js";
import { AdminOrgsPage } from "../../shared/utils/index.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

test.describe("Admin Organisations Page", () => {
  let orgsPage: AdminOrgsPage;

  test.beforeEach(async ({ adminPage }) => {
    orgsPage = new AdminOrgsPage(adminPage.page);
    await orgsPage.goto();
  });

  test("page renders search and filter controls", async () => {
    await orgsPage.expectPageVisible();
  });

  test("search input accepts text", async () => {
    await orgsPage.searchOrgs("demo");
    await expect(orgsPage.searchInput).toHaveValue("demo");
  });

  test("status filter is visible", async () => {
    await expect(orgsPage.statusFilter).toBeVisible();
  });

  test("refresh button is visible and enabled", async () => {
    await expect(orgsPage.refreshButton).toBeVisible();
    await expect(orgsPage.refreshButton).toBeEnabled();
  });

  test("total count badge appears after data loads", async () => {
    await orgsPage.waitForOrgsLoaded();
    await expect(orgsPage.totalCountBadge).toBeVisible();
  });

  test("navigating directly to /admin/organizations works when authenticated", async ({
    adminPage,
  }) => {
    await adminPage.page.goto(ROUTES.ADMIN_TENANTS);
    await expect(adminPage.page.locator(`[data-testid="admin-layout"]`)).toBeVisible({
      timeout: TIMEOUTS.NAVIGATION,
    });
  });
});
