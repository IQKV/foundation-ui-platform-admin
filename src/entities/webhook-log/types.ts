export interface WebhookLog {
  id: string;
  externalEventId: string;
  eventType: string;
  tenantKey: string;
  status: string;
  errorMessage: string | null;
  receivedAt: string;
  processedAt: string | null;
}
