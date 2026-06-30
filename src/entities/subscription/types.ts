export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused";

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
  gatewayType: string | null;
  createdAt: string;
  updatedAt: string;
}
