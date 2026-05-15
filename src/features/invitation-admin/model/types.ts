import type { IamInvitationAuthority } from "@/shared/api";

export interface ProposeInvitationFormValues {
  tenantKey: string;
  email: string;
  authority: IamInvitationAuthority;
}

export function getAuthorityOptions(): { value: IamInvitationAuthority; label: string }[] {
  return [
    { value: "MEMBER", label: "Member" },
    { value: "ADMIN", label: "Admin" },
  ];
}
