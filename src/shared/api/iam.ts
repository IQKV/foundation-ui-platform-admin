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
  platformAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminAccountRequest {
  firstName: string;
  lastName: string;
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

// ─── API ──────────────────────────────────────────────────────────────────────

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
