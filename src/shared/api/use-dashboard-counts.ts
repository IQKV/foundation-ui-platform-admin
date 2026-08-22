import { useQueries } from "@tanstack/react-query";
import { iamApi } from "./iam";
import { billingApi } from "./billing";
import { useSessionStore } from "@/processes/session";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const dashboardCountKeys = {
  users: ["admin", "count", "users"] as const,
  tenants: ["admin", "count", "tenants"] as const,
  subscriptions: ["admin", "count", "subscriptions"] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface DashboardCountResult {
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface UseDashboardCountsResult {
  users: DashboardCountResult;
  tenants: DashboardCountResult;
  subscriptions: DashboardCountResult;
}

/**
 * Fires all three /count requests in parallel via useQueries.
 *
 * Each card gets its own independent loading/error state so a failure in one
 * does not block the others. Results are cached by TanStack Query and reused
 * on subsequent renders without re-fetching (staleTime inherited from the
 * global QueryClient default of 60 s).
 *
 * All queries are disabled until the access token is present in memory to
 * prevent 400/401s during the silent-refresh window on page reload.
 */
export function useDashboardCounts(): UseDashboardCountsResult {
  const accessToken = useSessionStore((s) => s.accessToken);
  const isAuthenticated = !!accessToken;

  const [usersQuery, tenantsQuery, subscriptionsQuery] = useQueries({
    queries: [
      {
        queryKey: dashboardCountKeys.users,
        queryFn: iamApi.countUsers,
        enabled: isAuthenticated,
      },
      {
        queryKey: dashboardCountKeys.tenants,
        queryFn: iamApi.countTenants,
        enabled: isAuthenticated,
      },
      {
        queryKey: dashboardCountKeys.subscriptions,
        queryFn: billingApi.countSubscriptions,
        enabled: isAuthenticated,
      },
    ],
  });

  return {
    users: {
      value: usersQuery.data?.total,
      isLoading: usersQuery.isLoading,
      isError: usersQuery.isError,
    },
    tenants: {
      value: tenantsQuery.data?.total,
      isLoading: tenantsQuery.isLoading,
      isError: tenantsQuery.isError,
    },
    subscriptions: {
      value: subscriptionsQuery.data?.total,
      isLoading: subscriptionsQuery.isLoading,
      isError: subscriptionsQuery.isError,
    },
  };
}
