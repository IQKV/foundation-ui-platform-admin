import { iamApi } from "@/shared/api";
import type { Tenant } from "@/entities";
import type { ListTenantsParams } from "@/shared/api";

const PAGE_SIZE = 100;

/**
 * Loads every tenant page from {@link iamApi.listTenants} (admin API, max 100 per page).
 */
export async function fetchAllTenants(
  params: Omit<ListTenantsParams, "page" | "size"> = {},
): Promise<Tenant[]> {
  const tenants: Tenant[] = [];
  let page = 0;

  while (true) {
    const response = await iamApi.listTenants({
      ...params,
      page,
      size: PAGE_SIZE,
    });
    tenants.push(...response.content);
    if (page + 1 >= response.totalPages) {
      break;
    }
    page += 1;
  }

  return tenants;
}
