import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection, CountResponse } from "./iam";
import type {
  Subscription,
  SubscriptionStatus,
  Plan,
  AdminBillingSettings,
  Refund,
} from "../../entities";

function adminTenantBillingSettingsPath(tenantKey: string): string {
  return `/v1/billing/admin/tenants/${encodeURIComponent(tenantKey)}/billing-settings`;
}

// ─── API-specific types ───────────────────────────────────────────────────────

export type SubscriptionSortField = "tenantKey" | "planId" | "status" | "updatedAt" | "createdAt";

export type RefundSortField =
  | "tenantKey"
  | "amount"
  | "currency"
  | "status"
  | "occurredAt"
  | "createdAt"
  | "updatedAt";

export interface ListSubscriptionsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  tenantKey?: string;
  sortBy?: SubscriptionSortField;
  sortDir?: SortDirection;
}

export interface UpdateSubscriptionRequest {
  status?: string;
  quantity?: number;
  trialStart?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface ListRefundsParams {
  page?: number;
  size?: number;
  tenantKey?: string;
  sortBy?: RefundSortField;
  sortDir?: SortDirection;
}

export interface AdminCreateBillingSettingsRequest {
  externalCustomerId: string;
  billingEmail: string;
  companyName?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  taxIdType?: string | null;
  currency: string;
  profileOwnerId?: string | null;
}

export interface AdminReplaceBillingSettingsRequest {
  externalCustomerId: string;
  billingEmail: string;
  companyName?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  taxIdType?: string | null;
  currency: string;
  profileOwnerId?: string | null;
}

export interface AdminPatchBillingSettingsRequest {
  externalCustomerId?: string | null;
  billingEmail?: string | null;
  companyName?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  taxIdType?: string | null;
  currency?: string | null;
  profileOwnerId?: string | null;
}

export interface PortalSessionResponse {
  url: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const billingApi = {
  countSubscriptions: () =>
    httpClient.get<CountResponse>("/v1/billing/admin/subscriptions/count").then((r) => r.data),

  countSubscriptionsByStatus: (status: SubscriptionStatus) =>
    httpClient
      .get<CountResponse>("/v1/billing/admin/subscriptions/count", { params: { status } })
      .then((r) => r.data),

  listSubscriptionsByStatus: (status: SubscriptionStatus, size = 1) =>
    httpClient
      .get<PagedResponse<Subscription>>("/v1/billing/admin/subscriptions", {
        params: { status, page: 0, size },
      })
      .then((r) => r.data),

  listSubscriptions: (params: ListSubscriptionsParams = {}) =>
    httpClient
      .get<PagedResponse<Subscription>>("/v1/billing/admin/subscriptions", { params })
      .then((r) => r.data),

  getSubscription: (id: string) =>
    httpClient.get<Subscription>(`/v1/billing/admin/subscriptions/${id}`).then((r) => r.data),

  updateSubscription: (id: string, data: UpdateSubscriptionRequest) =>
    httpClient
      .patch<Subscription>(`/v1/billing/admin/subscriptions/${id}`, data)
      .then((r) => r.data),

  cancelSubscription: (id: string, cancelAtPeriodEnd = true) =>
    httpClient
      .post<Subscription>(`/v1/billing/admin/subscriptions/${id}/cancel`, null, {
        params: { cancelAtPeriodEnd },
      })
      .then((r) => r.data),

  pauseSubscription: (id: string) =>
    httpClient
      .post<Subscription>(`/v1/billing/admin/subscriptions/${id}/pause`)
      .then((r) => r.data),

  reactivateSubscription: (id: string) =>
    httpClient
      .post<Subscription>(`/v1/billing/admin/subscriptions/${id}/reactivate`)
      .then((r) => r.data),

  deleteSubscription: (id: string) => httpClient.delete(`/v1/billing/admin/subscriptions/${id}`),

  listRefunds: (params: ListRefundsParams = {}) =>
    httpClient
      .get<PagedResponse<Refund>>("/v1/billing/admin/refunds", { params })
      .then((r) => r.data),

  getRefund: (id: string) =>
    httpClient.get<Refund>(`/v1/billing/admin/refunds/${id}`).then((r) => r.data),

  listPlans: () => httpClient.get<Plan[]>("/v1/billing/admin/plans").then((r) => r.data),

  getPlan: (planCode: string) =>
    httpClient
      .get<Plan>(`/v1/billing/admin/plans/${encodeURIComponent(planCode)}`)
      .then((r) => r.data),

  getAdminTenantBillingSettings: (tenantKey: string) =>
    httpClient
      .get<AdminBillingSettings>(adminTenantBillingSettingsPath(tenantKey))
      .then((r) => r.data),

  createAdminTenantBillingSettings: (tenantKey: string, body: AdminCreateBillingSettingsRequest) =>
    httpClient
      .post<AdminBillingSettings>(adminTenantBillingSettingsPath(tenantKey), body)
      .then((r) => r.data),

  replaceAdminTenantBillingSettings: (
    tenantKey: string,
    body: AdminReplaceBillingSettingsRequest,
  ) =>
    httpClient
      .put<AdminBillingSettings>(adminTenantBillingSettingsPath(tenantKey), body)
      .then((r) => r.data),

  patchAdminTenantBillingSettings: (tenantKey: string, body: AdminPatchBillingSettingsRequest) =>
    httpClient
      .patch<AdminBillingSettings>(adminTenantBillingSettingsPath(tenantKey), body)
      .then((r) => r.data),

  deleteAdminTenantBillingSettings: (tenantKey: string) =>
    httpClient.delete(adminTenantBillingSettingsPath(tenantKey)),

  createPortalSession: (tenantKey: string) =>
    httpClient
      .post<PortalSessionResponse>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}/portal`)
      .then((r) => r.data),
};
