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

// Subscription statuses tracked in the breakdown chart
const BREAKDOWN_STATUSES = ["active", "trialing", "past_due", "paused", "canceled", "unpaid"] as const;
type BreakdownStatus = (typeof BREAKDOWN_STATUSES)[number];

/**
 * Fires all dashboard widget data requests in parallel via useQueries.
 *
 * Each widget has independent loading/error state so a single failure does not
 * block the rest. All queries gate on the access token to avoid 401s during the
 * silent-refresh window on page reload.
 *
 * Subscription breakdown and KPI counts now use the dedicated
 * GET /v1/billing/admin/subscriptions/count?status=<status> endpoint instead of
 * fetching a page of size=1 — one lightweight COUNT(*) per status at the DB level.
 *
 * The recent-critical-audit feed now passes severity=HIGH to the backend so the
 * API returns only HIGH/CRITICAL records directly, eliminating the previous
 * client-side post-filter that could miss events beyond the first page.
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
    ...rest
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
      // ── Past-due subscriptions count ── uses new /count?status= endpoint ────
      {
        queryKey: dashboardWidgetKeys.pastDueSubscriptions,
        queryFn: () => billingApi.countSubscriptionsByStatus("past_due"),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.countSubscriptionsByStatus>>) =>
          data.total,
      },
      // ── Trialing subscriptions count ── uses new /count?status= endpoint ────
      {
        queryKey: dashboardWidgetKeys.trialingSubscriptions,
        queryFn: () => billingApi.countSubscriptionsByStatus("trialing"),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.countSubscriptionsByStatus>>) =>
          data.total,
      },
      // ── Subscription breakdown (one COUNT per status) ───────────────────────
      ...BREAKDOWN_STATUSES.map((status) => ({
        queryKey: [...dashboardWidgetKeys.subscriptionBreakdown, status] as const,
        queryFn: () => billingApi.countSubscriptionsByStatus(status as BreakdownStatus),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof billingApi.countSubscriptionsByStatus>>) =>
          data.total,
      })),
      // ── Recent HIGH/CRITICAL audit events — server-side severity filter ─────
      {
        queryKey: dashboardWidgetKeys.recentCriticalAudit,
        queryFn: () =>
          auditApi.listRecords({
            page: 0,
            size: 6,
            severity: "HIGH",
            sortBy: "occurredAt",
            sortDir: "desc",
          }),
        enabled: isAuthenticated,
        select: (data: Awaited<ReturnType<typeof auditApi.listRecords>>) => data.content,
      },
      // ── Suspended / failed organisations ────────────────────────────────────
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

  // rest[] = [breakdown×6, criticalAudit, failedTenants, recentRefunds]
  const breakdownQueries = rest.slice(0, BREAKDOWN_STATUSES.length);
  const criticalAuditQuery = rest[BREAKDOWN_STATUSES.length];
  const failedTenantsQuery = rest[BREAKDOWN_STATUSES.length + 1];
  const recentRefundsQuery = rest[BREAKDOWN_STATUSES.length + 2];

  const breakdownData: SubscriptionBreakdownItem[] = BREAKDOWN_STATUSES.map((status, i) => ({
    status,
    count: (breakdownQueries[i]?.data as number | undefined) ?? 0,
    color: STATUS_COLORS[status] ?? "gray",
  })).filter((item) => item.count > 0);

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
      records: (criticalAuditQuery?.data as AuditRecord[] | undefined) ?? [],
      isLoading: criticalAuditQuery?.isLoading ?? false,
      isError: criticalAuditQuery?.isError ?? false,
    },
    failedTenants: {
      tenants: (failedTenantsQuery?.data as IamTenant[] | undefined) ?? [],
      isLoading: failedTenantsQuery?.isLoading ?? false,
      isError: failedTenantsQuery?.isError ?? false,
    },
    recentRefunds: {
      refunds: (recentRefundsQuery?.data as AdminRefund[] | undefined) ?? [],
      isLoading: recentRefundsQuery?.isLoading ?? false,
      isError: recentRefundsQuery?.isError ?? false,
    },
  };
}
