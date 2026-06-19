import { t } from "@lingui/core/macro";
import { z } from "zod";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export function buildSetPasswordSchema() {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t`Password must be at least 8 characters`)
        .max(128, t`Password must be at most 128 characters`)
        .refine(
          (v) => PASSWORD_PATTERN.test(v),
          t`Password must contain uppercase, lowercase, digit, and special character`,
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t`Passwords do not match`,
      path: ["confirmPassword"],
    });
}

export type SetPasswordFormValues = z.infer<ReturnType<typeof buildSetPasswordSchema>>;
