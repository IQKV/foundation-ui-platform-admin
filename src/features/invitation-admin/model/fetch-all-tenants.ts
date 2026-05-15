import { iamApi } from "@/shared/api";
import type { IamTenant, ListIamTenantsParams } from "@/shared/api";

const PAGE_SIZE = 100;

/**
 * Loads every tenant page from {@link iamApi.listTenants} (admin API, max 100 per page).
 */
export async function fetchAllTenants(
  params: Omit<ListIamTenantsParams, "page" | "size"> = {},
): Promise<IamTenant[]> {
  const tenants: IamTenant[] = [];
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
