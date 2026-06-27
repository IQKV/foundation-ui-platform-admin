import { httpClient } from "./http-client";
import type {
  User,
  UserStatus,
  AdminAccount,
  Tenant,
  TenantStatus,
  Subscription,
  SubscriptionStatus,
  Plan,
  AdminBillingSettings,
  Refund,
  Notification,
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  CmsPage,
  CmsPageStatus,
  CmsPageTranslation,
  CmsPageSummary,
  CmsPageHierarchyItem,
  AuditRecord,
  AuditSeverity,
  AuditActionCount,
  Announcement,
  AnnouncementStatus,
  AnnouncementTranslation,
} from "../../entities";

// ─── Shared API types ─────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface CountResponse {
  total: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── IAM-specific API types ───────────────────────────────────────────────────

export type UserSortField = "email" | "firstName" | "lastName" | "updatedAt" | "createdAt";
export type TenantSortField = "name" | "tenantKey" | "updatedAt" | "createdAt";
export type InvitationSortField =
  | "email"
  | "tenantKey"
  | "status"
  | "expiresAt"
  | "createdAt"
  | "updatedAt";

export interface ListUsersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
}

export interface ListTenantsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: TenantStatus;
  sortBy?: TenantSortField;
  sortDir?: SortDirection;
}

export interface ListInvitationsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: InvitationStatus;
  tenantKey?: string;
  sortBy?: InvitationSortField;
  sortDir?: SortDirection;
}

export interface ProposeInvitationRequest {
  tenantKey: string;
  email: string;
  authority?: InvitationAuthority;
}

export interface ListTenantMembersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: UserSortField;
  sortDir?: SortDirection;
}

export interface UpdateAdminAccountRequest {
  firstName: string;
  lastName: string;
  locale?: string | null;
}

// ─── Announcement API types ───────────────────────────────────────────────────

export interface AnnouncementListResponse {
  items: Announcement[];
  totalElements: number;
}

export interface CreateAnnouncementRequest {
  type: string;
  status: AnnouncementStatus;
  translations: AnnouncementTranslation[];
}

export interface UpdateAnnouncementRequest {
  type: string;
  status: AnnouncementStatus;
  translations: AnnouncementTranslation[];
}

// ─── Ban API types ────────────────────────────────────────────────────────────

export interface BanUserRequest {
  reason?: string;
  expiresAt?: string;
}

export interface BanResponse {
  id: string;
  userId: string;
  initiatorId: string;
  type: "PLATFORM" | "TENANT";
  tenantKey?: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMemberAuthoritiesResponse {
  userId: string;
  tenantKey: string;
  authorities: string[];
}

export interface UserAuthoritiesResponse {
  userId: string;
  authorities: string[];
}

export interface AdminUpdateMemberAuthoritiesRequest {
  authorities: string[];
}

// ─── Tenant user stats types ──────────────────────────────────────────────────

export interface UserSignupSeriesPoint {
  period: string;
  signups: number;
}

export interface TenantUserStatsResponse {
  tenantKey: string;
  totalMembers: number;
  activeMembers: number;
  lockedMembers: number;
  suspendedMembers: number;
  emailVerifiedCount: number;
  signupSeries: UserSignupSeriesPoint[];
  periodFrom: string;
  periodTo: string;
  granularity: "day" | "month";
}

export interface TenantUserStatsParams {
  from?: string;
  to?: string;
  granularity?: "day" | "month";
}

// ─── Notification API types ───────────────────────────────────────────────────

export interface NotificationListResponse {
  items: Notification[];
  totalElements: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPatchRequest {
  isRead: boolean;
}

// ─── Locales API types ────────────────────────────────────────────────────────

export interface IamLocale {
  code: string;
  name: string;
  nativeName: string | null;
  isDefault: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const iamApi = {
  countUsers: () => httpClient.get<CountResponse>("/v1/iam/admin/users/count").then((r) => r.data),

  listUsers: (params: ListUsersParams = {}) =>
    httpClient.get<PagedResponse<User>>("/v1/iam/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) => httpClient.get<User>(`/v1/iam/admin/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: Partial<Pick<User, "firstName" | "lastName" | "status">>) =>
    httpClient.patch<User>(`/v1/iam/admin/users/${id}`, data).then((r) => r.data),

  setUserPassword: (id: string, newPassword: string) =>
    httpClient.post(`/v1/iam/admin/users/${id}/password`, { newPassword }),

  deleteUser: (id: string) => httpClient.delete(`/v1/iam/admin/users/${id}`),

  banUser: (id: string, data: BanUserRequest) =>
    httpClient.post<BanResponse>(`/v1/iam/admin/users/${id}/ban`, data).then((r) => r.data),

  unbanUser: (id: string) => httpClient.post(`/v1/iam/admin/users/${id}/unban`),

  unlockUser: (id: string) => httpClient.post(`/v1/iam/admin/users/${id}/unlock`),

  getUserPlatformAuthorities: (id: string) =>
    httpClient
      .get<UserAuthoritiesResponse>(`/v1/iam/admin/users/${id}/authorities`)
      .then((r) => r.data),

  updateUserPlatformAuthorities: (id: string, authorities: string[]) =>
    httpClient
      .put<UserAuthoritiesResponse>(`/v1/iam/admin/users/${id}/authorities`, { authorities })
      .then((r) => r.data),

  countTenants: () =>
    httpClient.get<CountResponse>("/v1/iam/admin/tenants/count").then((r) => r.data),

  listTenants: (params: ListTenantsParams = {}) =>
    httpClient.get<PagedResponse<Tenant>>("/v1/iam/admin/tenants", { params }).then((r) => r.data),

  getTenant: (tenantKey: string) =>
    httpClient.get<Tenant>(`/v1/iam/admin/tenants/${tenantKey}`).then((r) => r.data),

  countTenantMembers: (tenantKey: string) =>
    httpClient
      .get<CountResponse>(`/v1/iam/admin/tenants/${tenantKey}/members/count`)
      .then((r) => r.data),

  listTenantMembers: (tenantKey: string, params: ListTenantMembersParams = {}) =>
    httpClient
      .get<PagedResponse<User>>(`/v1/iam/admin/tenants/${tenantKey}/members`, { params })
      .then((r) => r.data),

  getTenantMemberAuthorities: (tenantKey: string, userId: string) =>
    httpClient
      .get<TenantMemberAuthoritiesResponse>(
        `/v1/iam/admin/tenants/${tenantKey}/members/${userId}/authorities`,
      )
      .then((r) => r.data),

  updateTenantMemberAuthorities: (
    tenantKey: string,
    userId: string,
    data: AdminUpdateMemberAuthoritiesRequest,
  ) =>
    httpClient
      .put<TenantMemberAuthoritiesResponse>(
        `/v1/iam/admin/tenants/${tenantKey}/members/${userId}/authorities`,
        data,
      )
      .then((r) => r.data),

  updateTenant: (tenantKey: string, data: Partial<Pick<Tenant, "name" | "status">>) =>
    httpClient.patch<Tenant>(`/v1/iam/admin/tenants/${tenantKey}`, data).then((r) => r.data),

  deleteTenant: (tenantKey: string) => httpClient.delete(`/v1/iam/admin/tenants/${tenantKey}`),

  countInvitations: (
    params: Omit<ListInvitationsParams, "page" | "size" | "sortBy" | "sortDir"> = {},
  ) =>
    httpClient
      .get<CountResponse>("/v1/iam/admin/invitations/count", { params })
      .then((r) => r.data),

  listInvitations: (params: ListInvitationsParams = {}) =>
    httpClient
      .get<PagedResponse<Invitation>>("/v1/iam/admin/invitations", { params })
      .then((r) => r.data),

  getInvitation: (id: string) =>
    httpClient.get<Invitation>(`/v1/iam/admin/invitations/${id}`).then((r) => r.data),

  proposeInvitation: (data: ProposeInvitationRequest) =>
    httpClient.post<Invitation>("/v1/iam/admin/invitations", data).then((r) => r.data),

  revokeInvitation: (id: string) => httpClient.delete(`/v1/iam/admin/invitations/${id}`),

  // ─── Announcements ──────────────────────────────────────────────────────────

  listAnnouncements: (params: { limit?: number; offset?: number } = {}) =>
    httpClient
      .get<AnnouncementListResponse>("/v1/iam/admin/announcements", { params })
      .then((r) => r.data),

  getAnnouncement: (id: string) =>
    httpClient.get<Announcement>(`/v1/iam/admin/announcements/${id}`).then((r) => r.data),

  createAnnouncement: (data: CreateAnnouncementRequest) =>
    httpClient.post<Announcement>("/v1/iam/admin/announcements", data).then((r) => r.data),

  updateAnnouncement: (id: string, data: UpdateAnnouncementRequest) =>
    httpClient.put<Announcement>(`/v1/iam/admin/announcements/${id}`, data).then((r) => r.data),

  deleteAnnouncement: (id: string) => httpClient.delete(`/v1/iam/admin/announcements/${id}`),

  publishAnnouncement: (id: string) => httpClient.post(`/v1/iam/admin/announcements/${id}/publish`),

  // ── Tenant user stats (PLATFORM_ADMIN) ────────────────────────────────────

  getTenantUserStats: (tenantKey: string, params: TenantUserStatsParams = {}) =>
    httpClient
      .get<TenantUserStatsResponse>(
        `/v1/iam/admin/tenants/${encodeURIComponent(tenantKey)}/members/stats`,
        { params },
      )
      .then((r) => r.data),
};

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  list: (params: { limit?: number; offset?: number; isRead?: boolean } = {}) =>
    httpClient
      .get<NotificationListResponse>("/v1/iam/users/notifications", { params })
      .then((r) => r.data),

  unreadCount: () =>
    httpClient
      .get<UnreadCountResponse>("/v1/iam/users/notifications/unread/count")
      .then((r) => r.data),

  patch: (id: string, data: NotificationPatchRequest) =>
    httpClient.patch(`/v1/iam/users/notifications/${id}`, data),

  patchAll: (data: NotificationPatchRequest) =>
    httpClient.patch("/v1/iam/users/notifications", data),

  deleteOne: (id: string) => httpClient.delete(`/v1/iam/users/notifications/${id}`),

  deleteAll: () => httpClient.delete("/v1/iam/users/notifications"),
};

// ─── Platform admin self-service account API ──────────────────────────────────

export const adminAccountApi = {
  getAccount: (): Promise<AdminAccount> =>
    httpClient.get<AdminAccount>("/v1/iam/auth/admin/me").then((r) => r.data),

  updateAccount: (data: UpdateAdminAccountRequest): Promise<AdminAccount> =>
    httpClient.patch<AdminAccount>("/v1/iam/auth/admin/me", data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> =>
    httpClient.post("/v1/iam/auth/admin/me/password", data).then(() => undefined),
};

// ─── Locales API ──────────────────────────────────────────────────────────────

export const localesApi = {
  list: () => httpClient.get<IamLocale[]>("/v1/iam/locales").then((r) => r.data),
};
