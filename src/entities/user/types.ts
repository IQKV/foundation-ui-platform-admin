// Types for user entity
export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  locale: string | null;
  avatarUrl: string | null;
  firstSignInAt: string | null;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  tenantAuthorities?: string[];
  organizations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccount {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  locale: string | null;
  platformAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}
