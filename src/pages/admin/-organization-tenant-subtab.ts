/**
 * Derives which organization detail tab matches the current URL.
 * Paths: `/admin/organizations/{tenantKey}`, `.../members`, `.../billing`.
 */
export function organizationTenantSubtab(
  pathname: string,
): "overview" | "members" | "billing" | "subscriptions" | "refunds" {
  const m = pathname.match(
    /\/admin\/organizations\/[a-z0-9]{8}\/(members|billing|subscriptions|refunds)\/?$/,
  );
  if (m?.[1] === "members") return "members";
  if (m?.[1] === "billing") return "billing";
  if (m?.[1] === "subscriptions") return "subscriptions";
  if (m?.[1] === "refunds") return "refunds";
  return "overview";
}
