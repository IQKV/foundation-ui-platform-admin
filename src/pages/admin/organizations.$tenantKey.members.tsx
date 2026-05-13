import { createFileRoute } from "@tanstack/react-router";
import { MembersTab } from "./-organization-tenant-panels";

export const Route = createFileRoute("/admin/organizations/$tenantKey/members")({
  component: OrganizationMembersChild,
});

function OrganizationMembersChild() {
  const { tenantKey } = Route.useParams();
  return <MembersTab tenantKey={tenantKey} />;
}
