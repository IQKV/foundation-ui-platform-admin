import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection, CountResponse } from "./iam";

function adminTenantBillingSettingsPath(tenantKey: string): string {
  return `/v1/billing/admin/tenants/${encodeURIComponent(tenantKey)}/billing-settings`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused";

export type SubscriptionSortField = "tenantKey" | "planId" | "status" | "updatedAt" | "createdAt";

export type RefundSortField =
  | "tenantKey"
  | "amount"
  | "currency"
  | "status"
  | "occurredAt"
  | "createdAt"
  | "updatedAt";

export interface Subscription {
  id: string;
  tenantKey: string;
  externalSubscriptionId: string;
  status: SubscriptionStatus;
  planId: string;
  quantity: number;
  trialStart: string | null;
  trialEnd: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  subjectType: string | null;
  subjectKey: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface AdminRefund {
  id: string;
  tenantKey: string;
  externalRefundId: string;
  externalPaymentId: string;
  externalCustomerId: string;
  amount: number;
  currency: string;
  status: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListRefundsParams {
  page?: number;
  size?: number;
  tenantKey?: string;
  sortBy?: RefundSortField;
  sortDir?: SortDirection;
}

/** Subscription plan catalog entry (admin list includes inactive). */
export interface Plan {
  id: string;
  planCode: string;
  displayName: string;
  billingPeriod: string;
  priceMinor: number;
  currency: string;
  featureSet: string | null;
  scope: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST create and PUT full replace (planCode in path wins on PUT). */
export interface PlanRequest {
  planCode: string;
  displayName: string;
  billingPeriod: string;
  priceMinor: number;
  currency: string;
  featureSet: string | null;
  scope: string;
  active: boolean;
}

/** Partial update — only non-null fields are sent. */
export interface PlanPatchRequest {
  displayName?: string | null;
  billingPeriod?: string | null;
  priceMinor?: number | null;
  currency?: string | null;
  featureSet?: string | null;
  scope?: string | null;
  active?: boolean | null;
}

/** Admin GET response — includes gateway customer id and profile owner. */
export interface AdminBillingSettings {
  id: string;
  tenantKey: string;
  externalCustomerId: string;
  billingEmail: string;
  companyName: string | null;
  billingAddress: string | null;
  taxId: string | null;
  taxIdType: string | null;
  currency: string;
  profileOwnerId: string | null;
  createdAt: string;
  updatedAt: string;
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

  /** Count subscriptions by a specific status — uses the new ?status= param on /count. */
  countSubscriptionsByStatus: (status: SubscriptionStatus) =>
    httpClient
      .get<CountResponse>("/v1/billing/admin/subscriptions/count", { params: { status } })
      .then((r) => r.data),

  /** Returns subscriptions filtered by status, used as fallback when size info is needed. */
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
      .get<PagedResponse<AdminRefund>>("/v1/billing/admin/refunds", { params })
      .then((r) => r.data),

  getRefund: (id: string) =>
    httpClient.get<AdminRefund>(`/v1/billing/admin/refunds/${id}`).then((r) => r.data),

  listPlans: () => httpClient.get<Plan[]>("/v1/billing/admin/plans").then((r) => r.data),

  getPlan: (planCode: string) =>
    httpClient
      .get<Plan>(`/v1/billing/admin/plans/${encodeURIComponent(planCode)}`)
      .then((r) => r.data),

  createPlan: (body: PlanRequest) =>
    httpClient.post<Plan>("/v1/billing/admin/plans", body).then((r) => r.data),

  replacePlan: (planCode: string, body: PlanRequest) =>
    httpClient
      .put<Plan>(`/v1/billing/admin/plans/${encodeURIComponent(planCode)}`, body)
      .then((r) => r.data),

  patchPlan: (planCode: string, body: PlanPatchRequest) =>
    httpClient
      .patch<Plan>(`/v1/billing/admin/plans/${encodeURIComponent(planCode)}`, body)
      .then((r) => r.data),

  deactivatePlan: (planCode: string) =>
    httpClient.delete(`/v1/billing/admin/plans/${encodeURIComponent(planCode)}`),

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
