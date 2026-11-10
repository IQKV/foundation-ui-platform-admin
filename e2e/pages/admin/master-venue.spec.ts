import { expect } from "@playwright/test";
import { test } from "../../app/fixtures/index.js";
import { AdminMasterCatalogPage } from "../../shared/utils/index.js";
import { ROUTES } from "../../app/config/routes.js";
import { TIMEOUTS } from "../../app/config/timeouts.js";

test.describe("Admin Master Venue Page", () => {
  let catalogPage: AdminMasterCatalogPage;

  test.beforeEach(async ({ adminPage }) => {
    catalogPage = new AdminMasterCatalogPage(adminPage.page);
    await catalogPage.goto();
  });

  test("page renders search, city filter and create controls", async () => {
    await catalogPage.expectPageVisible();
  });

  test("search input accepts text", async () => {
    await catalogPage.searchVenues("hurghada");
    await expect(catalogPage.searchInput).toHaveValue("hurghada");
  });

  test("city filter is visible", async () => {
    await expect(catalogPage.cityFilter).toBeVisible();
  });

  test("create button opens the create venue modal", async () => {
    await catalogPage.createButton.click();
    await expect(catalogPage.createVenueModal).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  });

  test("refresh button is visible and enabled", async () => {
    await expect(catalogPage.refreshButton).toBeVisible();
    await expect(catalogPage.refreshButton).toBeEnabled();
  });

  test("total count badge appears after data loads", async () => {
    await catalogPage.waitForMasterCatalogLoaded();
    await expect(catalogPage.totalCountBadge).toBeVisible();
  });

  test("navigating directly to /admin/master-venue works when authenticated", async ({
    adminPage,
  }) => {
    await adminPage.page.goto(ROUTES.ADMIN_MASTER_VENUE);
    await expect(adminPage.page.locator(`[data-testid="admin-layout"]`)).toBeVisible({
      timeout: TIMEOUTS.NAVIGATION,
    });
  });
});
