import { useQuery } from "@tanstack/react-query";
import { fetchAllTenants } from "./fetch-all-tenants";

export interface TenantSelectOption {
  value: string;
  label: string;
}

function toSelectOptions(
  tenants: Awaited<ReturnType<typeof fetchAllTenants>>,
): TenantSelectOption[] {
  return tenants.map((tenant) => ({
    value: tenant.tenantKey,
    label: `${tenant.name} (${tenant.tenantKey})`,
  }));
}

/**
 * Active organizations for admin dropdowns (e.g. propose invitation).
 * Uses GET /v1/iam/admin/tenants with status=ACTIVE, sorted by name.
 */
export function useActiveTenantOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "tenants", "options", "ACTIVE"],
    queryFn: async () => {
      const tenants = await fetchAllTenants({
        status: "ACTIVE",
        sortBy: "name",
        sortDir: "asc",
      });
      return toSelectOptions(tenants);
    },
    enabled,
    staleTime: 60_000,
  });
}
