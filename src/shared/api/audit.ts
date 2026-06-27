import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection } from "./iam";
import type { AuditRecord, AuditSeverity, AuditActionCount } from "../../entities";

export interface ListAuditRecordsParams {
  page?: number;
  size?: number;
  tenantKey?: string;
  action?: string;
  severity?: AuditSeverity;
  sortBy?: string;
  sortDir?: SortDirection;
}

// Signin-specific types for better type safety
export interface SigninAttemptDetails {
  email: string;
  userId?: string;
  tenantKey?: string;
  result: "SUCCESS" | "FAILURE";
  failureReason?:
    | "INVALID_CREDENTIALS"
    | "ACCOUNT_LOCKED"
    | "ACCOUNT_NOT_ACTIVE"
    | "TENANT_SUSPENDED"
    | "TENANT_NOT_AVAILABLE"
    | "EMAIL_NOT_VERIFIED"
    | "UNKNOWN";
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string;
}

export interface SigninAttemptRecord extends AuditRecord {
  action: "auth.signin.attempt";
  entityType: "AUTHENTICATION";
  details: SigninAttemptDetails;
}

export const auditApi = {
  listRecords: async (params: ListAuditRecordsParams) => {
    const { page, size, tenantKey, action, severity, sortBy, sortDir } = params;
    const response = await httpClient.get<PagedResponse<AuditRecord>>("/v1/audit/admin/logs", {
      params: {
        page,
        size,
        tenantKey,
        action,
        severity,
        sort: sortBy ? `${sortBy},${sortDir || "desc"}` : undefined,
      },
    });
    return response.data;
  },

  getRecordDetails: async (id: string) => {
    const response = await httpClient.get<AuditRecord>(`/v1/audit/admin/logs/${id}`);
    return response.data;
  },

  getActionStats: async (tenantKey?: string) => {
    const response = await httpClient.get<AuditActionCount[]>(
      "/v1/audit/admin/logs/stats/actions",
      {
        params: { tenantKey },
      },
    );
    return response.data;
  },

  listSigninAttempts: async (params: Omit<ListAuditRecordsParams, "action">) => {
    return auditApi.listRecords({ ...params, action: "auth.signin.attempt" });
  },
};
