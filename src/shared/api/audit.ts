import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection } from "./iam";

export interface AuditRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorType: string;
  actorEmail: string;
  actorIp: string;
  actorUa: string;
  impersonatorId: string;
  tenantKey: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: Record<string, any>;
  occurredAt: string;
  correlationId: string;
}

export interface AuditActionCount {
  action: string;
  count: number;
}

export interface ListAuditRecordsParams {
  page?: number;
  size?: number;
  tenantKey?: string;
  sortBy?: string;
  sortDir?: SortDirection;
}

export const auditApi = {
  listRecords: async (params: ListAuditRecordsParams) => {
    const { page, size, tenantKey, sortBy, sortDir } = params;
    const response = await httpClient.get<PagedResponse<AuditRecord>>("/v1/audit/admin/logs", {
      params: {
        page,
        size,
        tenantKey,
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
};
