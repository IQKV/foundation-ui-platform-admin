// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";
export { iamApi } from "./iam";
export type {
  IamUser,
  IamUserStatus,
  IamUserSortField,
  IamTenant,
  IamTenantStatus,
  IamTenantSortField,
  SortDirection,
  PagedResponse,
  CountResponse,
  ListIamUsersParams,
  ListIamTenantsParams,
  ListTenantMembersParams,
  IamInvitation,
  IamInvitationStatus,
  IamInvitationAuthority,
  IamInvitationSortField,
  ListIamInvitationsParams,
  ProposeIamInvitationRequest,
  AdminAccount,
  UpdateAdminAccountRequest,
  SiteAnnouncement,
  SiteAnnouncementStatus,
  SiteAnnouncementTranslation,
  SiteAnnouncementListResponse,
  CreateSiteAnnouncementRequest,
  UpdateSiteAnnouncementRequest,
} from "./iam";
export { adminAccountApi } from "./iam";
export { localesApi } from "./iam";
export type { IamLocale } from "./iam";
export { authApi } from "./auth";
export type { SignInRequest, SignInResponse } from "./auth";
export { billingApi } from "./billing";
export type {
  Subscription,
  SubscriptionStatus,
  SubscriptionSortField,
  ListSubscriptionsParams,
  UpdateSubscriptionRequest,
  AdminRefund,
  RefundSortField,
  ListRefundsParams,
  Plan,
  PlanRequest,
  PlanPatchRequest,
  AdminBillingSettings,
  AdminCreateBillingSettingsRequest,
  AdminReplaceBillingSettingsRequest,
  AdminPatchBillingSettingsRequest,
} from "./billing";
export { useDashboardCounts } from "./use-dashboard-counts";
export type { UseDashboardCountsResult, DashboardCountResult } from "./use-dashboard-counts";

export { auditApi } from "./audit";
export type { AuditRecord, AuditActionCount, ListAuditRecordsParams } from "./audit";

export { notificationApi } from "./iam";
export type {
  UserNotification,
  UserNotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
} from "./iam";
