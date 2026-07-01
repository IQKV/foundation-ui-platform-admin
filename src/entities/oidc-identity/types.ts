export interface AdminLinkedOidcIdentity {
  id: string;
  userId: string;
  provider: string;
  providerSub: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string | null;
  lastUsedAt: string | null;
}
