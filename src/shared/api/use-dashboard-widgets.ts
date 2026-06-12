import { useQueries } from "@tanstack/react-query";
import { iamApi } from "./iam";
import { billingApi } from "./billing";
import { auditApi } from "./audit";
import { useSessionStore } from "@/processes/session";
import type { AuditRecord } from "./audit";
import type { IamTenant } from "./iam";
import type { AdminRefund } from "./billing";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const dashboardWidgetKeys = {
  lockedUsers: ["admin", "dashboard", "locked-users"] as const,
  suspendedUsers: ["admin", "dashboard", "suspended-users"] as const,
  pendingInvitations: ["admin", "dashboard", "pending-invitations"] as const,
  pastDueSubscriptions: ["admin", "dashboard", "past-due-subscriptions"] as const,
  trialingSubscriptions: ["admin", "dashboard", "trialing-subscriptions"] as const,
  subscriptionBreakdown: ["admin", "dashboard", "subscription-breakdown"] as const,
  recentCriticalAudit: ["admin", "dashboard", "recent-critical-audit"] as const,
  failedTenants: ["admin", "dashboard", "failed-tenants"] as const,
  recentRefunds: ["admin", "dashboard", "recent-refunds"] as const,
};

// ─── Result shapes ────────────────────────────────────────────────────────────

export interface WidgetCountResult {
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface SubscriptionBreakdownItem {
  status: string;
  count: number;
  color: string;
}

export interface SubscriptionBreakdownResult {
  data: SubscriptionBreakdownItem[];
  isLoading: boolean;
  isError: boolean;
}

export interface RecentAuditResult {
  records: AuditRecord[];
  isLoading: boolean;
  isError: boolean;
}

export interface FailedTenantsResult {
  tenants: IamTenant[];
  isLoading: boolean;
  isError: boolean;
}

export interface RecentRefundsResult {
  refunds: AdminRefund[];
  isLoading: boolean;
  isError: boolean;
}

export interface UseDashboardWidgetsResult {
  lockedUsers: WidgetCountResult;
  suspendedUsers: WidgetCountResult;
  pendingInvitations: WidgetCountResult;
  pastDueSubscriptions: WidgetCountResult;
  trialingSubscriptions: WidgetCountResult;
  subscriptionBreakdown: SubscriptionBreakdownResult;
  recentCriticalAudit: RecentAuditResult;
  failedTenants: FailedTenantsResult;
  recentRefunds: RecentRefundsResult;
}

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  trialing: "blue",
  past_due: "orange",
  paused: "yellow",
  canceled: "gray",
  unpaid: "red",
};

/**
 * Fires all dashboard widget data requests in parallel via useQueries.
 * Each widget has independent loading/error state.
 * All queries are disabled until the access token is present to avoid 401s.
 */
export function useDashboardWidgets(): UseDashboardWidgetsResult {
  const accessToken = useSessionStore((s) => s.accessToken);
  const isAuthenticated = !!accessToken;

  const [
    lockedUsersQuery,
    suspendedUsersQuery,
    pendingInvitationsQuery,
    pastDueQuery,
    trialingQuery,
    breakdownActiveQuery,
    breakdownTrialingQuery,
    breakdownPastDueQuery,
    breakdownPausedQuery,
    breakdownCanceledQuery,
    breakdownUnpaidQuery,
    criticalAuditQuery,
    failedTenantsQuery,
    recentRefundsQuery,
  ] = useQueries({
    queries: [
      // ── Locked users count ──────────────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.lockedUsers,
        queryFn: () => iamApi.listUsers({ status: "LOCKED", page: 0, size: 1 }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof iamApi.listUsers>>) => data.totalElements,
      },
      // ── Suspended users count ───────────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.suspendedUsers,
        queryFn: () => iamApi.listUsers({ status: "SUSPENDED", page: 0, size: 1 }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof iamApi.listUsers>>) => data.totalElements,
      },
      // ── Pending invitations count ───────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.pendingInvitations,
        queryFn: () => iamApi.countInvitations({ status: "PENDING" }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof iamApi.countInvitations>>) => data.total,
      },
      // ── Past-due subscriptions count ────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.pastDueSubscriptions,
        queryFn: () => billingApi.listSubscriptionsByStatus("past_due", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      // ── Trialing subscriptions count ────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.trialingSubscriptions,
        queryFn: () => billingApi.listSubscriptionsByStatus("trialing", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      // ── Subscription breakdown (one query per status) ───────────────────────
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "active"],
        queryFn: () => billingApi.listSubscriptionsByStatus("active", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "trialing"],
        queryFn: () => billingApi.listSubscriptionsByStatus("trialing", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "past_due"],
        queryFn: () => billingApi.listSubscriptionsByStatus("past_due", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "paused"],
        queryFn: () => billingApi.listSubscriptionsByStatus("paused", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "canceled"],
        queryFn: () => billingApi.listSubscriptionsByStatus("canceled", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      {
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, "unpaid"],
        queryFn: () => billingApi.listSubscriptionsByStatus("unpaid", 1),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listSubscriptionsByStatus>>) =>
          data.totalElements,
      },
      // ── Recent HIGH/CRITICAL audit events ───────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.recentCriticalAudit,
        queryFn: () =>
          auditApi.listRecords({ page: 0, size: 8, sortBy: "occurredAt", sortDir: "desc" }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof auditApi.listRecords>>) =>
          data.content
            .filter((r) => r.severity === "HIGH" || r.severity === "CRITICAL")
            .slice(0, 6),
      },
      // ── Orgs in bad state (PROVISIONING_FAILED / SUSPENDED) ────────────────
      {
        queryKey: dashboardWidgetKeys.failedTenants,
        queryFn: () => iamApi.listTenants({ status: "SUSPENDED", page: 0, size: 10 }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof iamApi.listTenants>>) => data.content,
      },
      // ── Recent refunds ──────────────────────────────────────────────────────
      {
        queryKey: dashboardWidgetKeys.recentRefunds,
        queryFn: () =>
          billingApi.listRefunds({ page: 0, size: 5, sortBy: "occurredAt", sortDir: "desc" }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.listRefunds>>) => data.content,
      },
    ],
  });

  // Build breakdown array from individual status queries
  const breakdownStatuses = ["active", "trialing", "past_due", "paused", "canceled", "unpaid"];
  const breakdownQueries = [
    breakdownActiveQuery,
    breakdownTrialingQuery,
    breakdownPastDueQuery,
    breakdownPausedQuery,
    breakdownCanceledQuery,
    breakdownUnpaidQuery,
  ];
  const breakdownData: SubscriptionBreakdownItem[] = breakdownStatuses
    .map((status, i) => ({
      status,
      count: (breakdownQueries[i]?.data as number | undefined) ?? 0,
      color: STATUS_COLORS[status] ?? "gray",
    }))
    .filter((item) => item.count > 0);

  const isBreakdownLoading = breakdownQueries.some((q) => q.isLoading);
  const isBreakdownError = breakdownQueries.some((q) => q.isError);

  return {
    lockedUsers: {
      value: lockedUsersQuery.data as number | undefined,
      isLoading: lockedUsersQuery.isLoading,
      isError: lockedUsersQuery.isError,
    },
    suspendedUsers: {
      value: suspendedUsersQuery.data as number | undefined,
      isLoading: suspendedUsersQuery.isLoading,
      isError: suspendedUsersQuery.isError,
    },
    pendingInvitations: {
      value: pendingInvitationsQuery.data as number | undefined,
      isLoading: pendingInvitationsQuery.isLoading,
      isError: pendingInvitationsQuery.isError,
    },
    pastDueSubscriptions: {
      value: pastDueQuery.data as number | undefined,
      isLoading: pastDueQuery.isLoading,
      isError: pastDueQuery.isError,
    },
    trialingSubscriptions: {
      value: trialingQuery.data as number | undefined,
      isLoading: trialingQuery.isLoading,
      isError: trialingQuery.isError,
    },
    subscriptionBreakdown: {
      data: breakdownData,
      isLoading: isBreakdownLoading,
      isError: isBreakdownError,
    },
    recentCriticalAudit: {
      records: (criticalAuditQuery.data as AuditRecord[] | undefined) ?? [],
      isLoading: criticalAuditQuery.isLoading,
      isError: criticalAuditQuery.isError,
    },
    failedTenants: {
      tenants: (failedTenantsQuery.data as IamTenant[] | undefined) ?? [],
      isLoading: failedTenantsQuery.isLoading,
      isError: failedTenantsQuery.isError,
    },
    recentRefunds: {
      refunds: (recentRefundsQuery.data as AdminRefund[] | undefined) ?? [],
      isLoading: recentRefundsQuery.isLoading,
      isError: recentRefundsQuery.isError,
    },
  };
}
