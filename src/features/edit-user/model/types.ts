import type { UserStatus } from "@/entities";
import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildEditUserSchema() {
  return z.object({
    firstName: z.string().min(1, t`First name is required`),
    lastName: z.string().min(1, t`Last name is required`),
    status: z.string() as z.ZodType<UserStatus>,
  });
}

export type EditUserFormValues = z.infer<ReturnType<typeof buildEditUserSchema>>;

/** Returns translated status options. Call inside a component or hook. */
export function getStatusOptions(): { value: UserStatus; label: string }[] {
  return [
    { value: "ACTIVE", label: t`Active` },
    { value: "LOCKED", label: t`Locked` },
    { value: "SUSPENDED", label: t`Suspended` },
  ];
}

/** @deprecated Use `getStatusOptions()` for translated labels. */
export const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "LOCKED", label: "Locked" },
  { value: "SUSPENDED", label: "Suspended" },
];
