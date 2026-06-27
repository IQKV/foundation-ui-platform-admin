import type { TenantStatus } from "@/entities";
import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildEditTenantSchema() {
  return z.object({
    name: z.string().min(1, t`Organization name is required`),
    status: z.string() as z.ZodType<TenantStatus>,
  });
}

export type EditTenantFormValues = z.infer<ReturnType<typeof buildEditTenantSchema>>;

/** Returns translated status options. Call inside a component or hook. */
export function getStatusOptions(): { value: TenantStatus; label: string }[] {
  return [
    { value: "ACTIVE", label: t`Active` },
    { value: "SUSPENDED", label: t`Suspended` },
  ];
}

/** @deprecated Use `getStatusOptions()` for translated labels. */
export const STATUS_OPTIONS: { value: TenantStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];
