import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection, CountResponse } from "./iam";

function adminTenantBillingSettingsPath(tenantKey: string): string {
  return `/v1/billing/admin/tenants/${encodeURIComponent(tenantKey)}/billing-settings`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "unpaid";

export type SubscriptionSortField = "tenantKey" | "planId" | "status" | "updatedAt" | "createdAt";

export interface Subscription {
  id: string;
  tenantKey: string;
  externalSubscriptionId: string;
  status: string;
  planId: string;
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
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
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

// ─── API ──────────────────────────────────────────────────────────────────────

export const billingApi = {
  countSubscriptions: () =>
    httpClient.get<CountResponse>("/v1/billing/admin/subscriptions/count").then((r) => r.data),

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

  deleteSubscription: (id: string) => httpClient.delete(`/v1/billing/admin/subscriptions/${id}`),

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
};
