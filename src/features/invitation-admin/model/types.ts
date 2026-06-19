import type { IamInvitationAuthority } from "@/shared/api";
import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildProposeInvitationSchema() {
  return z.object({
    tenantKey: z.string().min(1, t`Organization is required`),
    email: z.string().email(t`Must be a valid email address`),
    authority: z.string() as z.ZodType<IamInvitationAuthority>,
  });
}

export type ProposeInvitationFormValues = z.infer<ReturnType<typeof buildProposeInvitationSchema>>;

export function getAuthorityOptions(): { value: IamInvitationAuthority; label: string }[] {
  return [
    { value: "MEMBER", label: "Member" },
    { value: "ADMIN", label: "Admin" },
  ];
}
