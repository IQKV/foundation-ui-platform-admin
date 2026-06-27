export interface Refund {
  id: string;
  tenantKey: string;
  externalRefundId: string;
  externalPaymentId: string;
  externalCustomerId: string;
  amount: number;
  currency: string;
  status: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}
