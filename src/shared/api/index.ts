// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";
export { iamApi } from "./iam";
export type {
  SortDirection,
  PagedResponse,
  CountResponse,
  UserSortField,
  TenantSortField,
  InvitationSortField,
  ListUsersParams,
  ListTenantsParams,
  ListTenantMembersParams,
  ListInvitationsParams,
  ProposeInvitationRequest,
  UpdateAdminAccountRequest,
  AnnouncementListResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  BanUserRequest,
  BanResponse,
  TenantMemberAuthoritiesResponse,
  UserAuthoritiesResponse,
  AdminUpdateMemberAuthoritiesRequest,
  UserSignupSeriesPoint,
  TenantUserStatsResponse,
  TenantUserStatsParams,
  NotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
  IamLocale,
} from "./iam";
export { adminAccountApi } from "./iam";
export { localesApi } from "./iam";
export { authApi } from "./auth";
export type { SignInRequest, SignInResponse } from "./auth";
export { billingApi } from "./billing";
export type {
  SubscriptionSortField,
  ListSubscriptionsParams,
  UpdateSubscriptionRequest,
  RefundSortField,
  ListRefundsParams,
  WebhookLogSortField,
  ListWebhookLogsParams,
  AdminCreateBillingSettingsRequest,
  AdminReplaceBillingSettingsRequest,
  AdminPatchBillingSettingsRequest,
  PortalSessionResponse,
} from "./billing";
export { useDashboardCounts } from "./use-dashboard-counts";
export type { UseDashboardCountsResult, DashboardCountResult } from "./use-dashboard-counts";
export { useDashboardWidgets } from "./use-dashboard-widgets";
export type {
  UseDashboardWidgetsResult,
  WidgetCountResult,
  SubscriptionBreakdownItem,
  SubscriptionBreakdownResult,
  RecentAuditResult,
  FailedTenantsResult,
  RecentRefundsResult,
} from "./use-dashboard-widgets";

export { auditApi } from "./audit";
export type { ListAuditRecordsParams, SigninAttemptRecord, SigninAttemptDetails } from "./audit";

export { cmsApi } from "./cms";
export type {
  CmsPageSummaryListResponse,
  CmsPageTranslationRequest,
  CreateCmsPageRequest,
  UpdateCmsPageRequest,
  ListCmsPageParams,
} from "./cms";

export { notificationApi } from "./iam";

// Re-export all entity types for convenience
export type {
  User,
  UserStatus,
  AdminAccount,
  Tenant,
  TenantStatus,
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  Subscription,
  SubscriptionStatus,
  Plan,
  AdminBillingSettings,
  Refund,
  Notification,
  Announcement,
  AnnouncementStatus,
  AnnouncementTranslation,
  CmsPage,
  CmsPageStatus,
  CmsPageTranslation,
  CmsPageSummary,
  CmsPageHierarchyItem,
  AuditRecord,
  AuditSeverity,
  AuditActionCount,
  WebhookLog,
} from "../../entities";
