import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IamUserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

// ─── Platform admin account ───────────────────────────────────────────────────

export interface AdminAccount {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: IamUserStatus;
  emailVerified: boolean;
  /** BCP 47 locale tag (e.g. "en-US"). Null when not yet set. */
  locale: string | null;
  platformAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminAccountRequest {
  firstName: string;
  lastName: string;
  /** BCP 47 locale tag. Optional — omit to leave unchanged. */
  locale?: string | null;
}
export type IamTenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type IamUserSortField = "email" | "firstName" | "lastName" | "updatedAt" | "createdAt";
export type IamTenantSortField = "name" | "tenantKey" | "updatedAt" | "createdAt";
export type IamInvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type IamInvitationAuthority = "ADMIN" | "MEMBER";
export type IamInvitationSortField =
  | "email"
  | "tenantKey"
  | "status"
  | "expiresAt"
  | "createdAt"
  | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface CountResponse {
  total: number;
}

export interface IamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: IamUserStatus;
  emailVerified: boolean;
  tenantAuthorities?: string[];
  organizations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListIamUsersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamUserStatus;
  sortBy?: IamUserSortField;
  sortDir?: SortDirection;
}

export interface IamTenant {
  id: string;
  tenantKey: string;
  name: string;
  status: IamTenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListIamTenantsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamTenantStatus;
  sortBy?: IamTenantSortField;
  sortDir?: SortDirection;
}

export interface IamInvitation {
  invitationId: string;
  tenantKey: string;
  email: string;
  authority: IamInvitationAuthority;
  status: IamInvitationStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListIamInvitationsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamInvitationStatus;
  tenantKey?: string;
  sortBy?: IamInvitationSortField;
  sortDir?: SortDirection;
}

export interface ProposeIamInvitationRequest {
  tenantKey: string;
  email: string;
  authority?: IamInvitationAuthority;
}

export interface ListTenantMembersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: IamUserStatus;
  sortBy?: IamUserSortField;
  sortDir?: SortDirection;
}

// ─── Announcement types ───────────────────────────────────────────────────────

export type SiteAnnouncementStatus = "DRAFT" | "PENDING" | "PUBLISHING" | "PUBLISHED" | "FAILED";

export interface SiteAnnouncementTranslation {
  locale: string;
  title: string;
  message: string;
}

export interface SiteAnnouncement {
  id: string;
  type: string;
  status: SiteAnnouncementStatus;
  createdAt: string;
  translations: SiteAnnouncementTranslation[];
}

export interface SiteAnnouncementListResponse {
  items: SiteAnnouncement[];
  totalElements: number;
}

export interface CreateSiteAnnouncementRequest {
  type: string;
  status: SiteAnnouncementStatus;
  translations: SiteAnnouncementTranslation[];
}

export interface UpdateSiteAnnouncementRequest {
  type: string;
  status: SiteAnnouncementStatus;
  translations: SiteAnnouncementTranslation[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

// ─── Ban types ─────────────────────────────────────────────────────────────────

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

export interface AdminUpdateMemberAuthoritiesRequest {
  authorities: string[];
}

export const iamApi = {
  countUsers: () => httpClient.get<CountResponse>("/v1/iam/admin/users/count").then((r) => r.data),

  listUsers: (params: ListIamUsersParams = {}) =>
    httpClient.get<PagedResponse<IamUser>>("/v1/iam/admin/users", { params }).then((r) => r.data),

  getUser: (id: string) => httpClient.get<IamUser>(`/v1/iam/admin/users/${id}`).then((r) => r.data),

  updateUser: (id: string, data: Partial<Pick<IamUser, "firstName" | "lastName" | "status">>) =>
    httpClient.patch<IamUser>(`/v1/iam/admin/users/${id}`, data).then((r) => r.data),

  setUserPassword: (id: string, newPassword: string) =>
    httpClient.post(`/v1/iam/admin/users/${id}/password`, { newPassword }),

  deleteUser: (id: string) => httpClient.delete(`/v1/iam/admin/users/${id}`),

  banUser: (id: string, data: BanUserRequest) =>
    httpClient.post<BanResponse>(`/v1/iam/admin/users/${id}/ban`, data).then((r) => r.data),

  unbanUser: (id: string) => httpClient.post(`/v1/iam/admin/users/${id}/unban`),

  unlockUser: (id: string) => httpClient.post(`/v1/iam/admin/users/${id}/unlock`),

  countTenants: () =>
    httpClient.get<CountResponse>("/v1/iam/admin/tenants/count").then((r) => r.data),

  listTenants: (params: ListIamTenantsParams = {}) =>
    httpClient
      .get<PagedResponse<IamTenant>>("/v1/iam/admin/tenants", { params })
      .then((r) => r.data),

  getTenant: (tenantKey: string) =>
    httpClient.get<IamTenant>(`/v1/iam/admin/tenants/${tenantKey}`).then((r) => r.data),

  countTenantMembers: (tenantKey: string) =>
    httpClient
      .get<CountResponse>(`/v1/iam/admin/tenants/${tenantKey}/members/count`)
      .then((r) => r.data),

  listTenantMembers: (tenantKey: string, params: ListTenantMembersParams = {}) =>
    httpClient
      .get<PagedResponse<IamUser>>(`/v1/iam/admin/tenants/${tenantKey}/members`, { params })
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

  updateTenant: (tenantKey: string, data: Partial<Pick<IamTenant, "name" | "status">>) =>
    httpClient.patch<IamTenant>(`/v1/iam/admin/tenants/${tenantKey}`, data).then((r) => r.data),

  deleteTenant: (tenantKey: string) => httpClient.delete(`/v1/iam/admin/tenants/${tenantKey}`),

  countInvitations: (
    params: Omit<ListIamInvitationsParams, "page" | "size" | "sortBy" | "sortDir"> = {},
  ) =>
    httpClient
      .get<CountResponse>("/v1/iam/admin/invitations/count", { params })
      .then((r) => r.data),

  listInvitations: (params: ListIamInvitationsParams = {}) =>
    httpClient
      .get<PagedResponse<IamInvitation>>("/v1/iam/admin/invitations", { params })
      .then((r) => r.data),

  getInvitation: (id: string) =>
    httpClient.get<IamInvitation>(`/v1/iam/admin/invitations/${id}`).then((r) => r.data),

  proposeInvitation: (data: ProposeIamInvitationRequest) =>
    httpClient.post<IamInvitation>("/v1/iam/admin/invitations", data).then((r) => r.data),

  revokeInvitation: (id: string) => httpClient.delete(`/v1/iam/admin/invitations/${id}`),

  // ─── Announcements ──────────────────────────────────────────────────────────

  listAnnouncements: (params: { limit?: number; offset?: number } = {}) =>
    httpClient
      .get<SiteAnnouncementListResponse>("/v1/iam/admin/announcements", { params })
      .then((r) => r.data),

  getAnnouncement: (id: string) =>
    httpClient.get<SiteAnnouncement>(`/v1/iam/admin/announcements/${id}`).then((r) => r.data),

  createAnnouncement: (data: CreateSiteAnnouncementRequest) =>
    httpClient.post<SiteAnnouncement>("/v1/iam/admin/announcements", data).then((r) => r.data),

  updateAnnouncement: (id: string, data: UpdateSiteAnnouncementRequest) =>
    httpClient.put<SiteAnnouncement>(`/v1/iam/admin/announcements/${id}`, data).then((r) => r.data),

  deleteAnnouncement: (id: string) => httpClient.delete(`/v1/iam/admin/announcements/${id}`),

  publishAnnouncement: (id: string) => httpClient.post(`/v1/iam/admin/announcements/${id}/publish`),
};

// ─── Notification types ───────────────────────────────────────────────────────

export interface UserNotification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  /** Raw JSON string — use JSON.parse if you need the object. */
  payload: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UserNotificationListResponse {
  items: UserNotification[];
  totalElements: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPatchRequest {
  isRead: boolean;
}

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  /** GET /v1/iam/users/notifications — paginated list with optional isRead filter. */
  list: (params: { limit?: number; offset?: number; isRead?: boolean } = {}) =>
    httpClient
      .get<UserNotificationListResponse>("/v1/iam/users/notifications", { params })
      .then((r) => r.data),

  /** GET /v1/iam/users/notifications/unread/count — badge count. */
  unreadCount: () =>
    httpClient
      .get<UnreadCountResponse>("/v1/iam/users/notifications/unread/count")
      .then((r) => r.data),

  /** PATCH /v1/iam/users/notifications/{id} — mark single as read. */
  patch: (id: string, data: NotificationPatchRequest) =>
    httpClient.patch(`/v1/iam/users/notifications/${id}`, data),

  /** PATCH /v1/iam/users/notifications — bulk update (mark all as read). */
  patchAll: (data: NotificationPatchRequest) =>
    httpClient.patch("/v1/iam/users/notifications", data),

  /** DELETE /v1/iam/users/notifications/{id} — delete single. */
  deleteOne: (id: string) => httpClient.delete(`/v1/iam/users/notifications/${id}`),

  /** DELETE /v1/iam/users/notifications — delete all. */
  deleteAll: () => httpClient.delete("/v1/iam/users/notifications"),
};

// ─── Platform admin self-service account API ──────────────────────────────────

export const adminAccountApi = {
  /** GET /v1/iam/auth/admin/me — fetch the authenticated platform operator's profile. */
  getAccount: (): Promise<AdminAccount> =>
    httpClient.get<AdminAccount>("/v1/iam/auth/admin/me").then((r) => r.data),

  /** PATCH /v1/iam/auth/admin/me — update firstName and lastName. */
  updateAccount: (data: UpdateAdminAccountRequest): Promise<AdminAccount> =>
    httpClient.patch<AdminAccount>("/v1/iam/auth/admin/me", data).then((r) => r.data),

  /** POST /v1/iam/auth/admin/me/password — change own password (requires current password). */
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> =>
    httpClient.post("/v1/iam/auth/admin/me/password", data).then(() => undefined),
};

// ─── Locales ──────────────────────────────────────────────────────────────────

export interface IamLocale {
  code: string;
  name: string;
  nativeName: string | null;
  isDefault: boolean;
}

/** GET /v1/iam/locales — public, returns all active locales ordered by default first. */
export const localesApi = {
  list: () => httpClient.get<IamLocale[]>("/v1/iam/locales").then((r) => r.data),
};
