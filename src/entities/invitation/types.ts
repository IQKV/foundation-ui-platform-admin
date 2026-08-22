export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type InvitationAuthority = "ADMIN" | "MEMBER";

export interface Invitation {
  invitationId: string;
  tenantKey: string;
  email: string;
  authority: InvitationAuthority;
  status: InvitationStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
