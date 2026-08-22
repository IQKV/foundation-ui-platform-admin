import { createFileRoute } from "@tanstack/react-router";
import { TenantBillingSettingsTab } from "@/features/tenant-billing-settings";

export const Route = createFileRoute("/admin/organizations/$tenantKey/billing")({
  component: OrganizationBillingChild,
});

function OrganizationBillingChild() {
  const { tenantKey } = Route.useParams();
  return <TenantBillingSettingsTab tenantKey={tenantKey} />;
}
