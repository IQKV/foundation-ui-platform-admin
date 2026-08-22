import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { OverviewTab } from "./-organization-tenant-panels";
import { iamApi, billingApi } from "@/shared/api";

export const Route = createFileRoute("/admin/organizations/$tenantKey/")({
  component: OrganizationOverviewChild,
});

/**
 * Overview tab — uses the same query keys as the parent layout so TanStack Query serves cache hits.
 */
function OrganizationOverviewChild() {
  const { tenantKey } = Route.useParams();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["admin", "tenants", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey),
  });

  const { data: subscriptionsPage, isLoading: subsLoading } = useQuery({
    queryKey: ["admin", "subscriptions", "byTenant", tenantKey],
    queryFn: () => billingApi.listSubscriptions({ tenantKey, size: 100 }),
    enabled: !!tenant,
  });

  const { data: memberCountData, isLoading: membersLoading } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", "count"],
    queryFn: () => iamApi.countTenantMembers(tenantKey),
    enabled: !!tenant,
  });

  const subscriptionCount = subscriptionsPage?.totalElements ?? 0;
  const memberCount = memberCountData?.total ?? 0;

  return (
    <OverviewTab
      subsLoading={subsLoading}
      subscriptionsPage={subscriptionsPage}
      subscriptionCount={subscriptionCount}
      memberCount={memberCount}
      membersLoading={membersLoading}
      isLoading={isLoading}
      tenant={tenant}
    />
  );
}
