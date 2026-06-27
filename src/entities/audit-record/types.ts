export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorId: string | null;
  actorType: string | null;
  actorEmail: string | null;
  actorIp: string | null;
  actorUa: string | null;
  impersonatorId: string | null;
  tenantKey: string | null;
  severity: AuditSeverity;
  details: Record<string, any>;
  occurredAt: string;
  correlationId: string | null;
}

export interface AuditActionCount {
  action: string;
  count: number;
}
