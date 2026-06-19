import { useState } from "react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturnType } from "@mantine/form";
import { t } from "@lingui/core/macro";
import { authApi } from "@/shared/api/auth";
import type { SignInResponse } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";

// ─── Schema factory ───────────────────────────────────────────────────────────
// Schema is created inside the hook so that `t` is called at render time,
// picking up the active locale rather than the module-load locale.

function buildSignInSchema() {
  return z.object({
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
    password: z.string().min(1, t`Password is required`),
  });
}

type SignInSchema = ReturnType<typeof buildSignInSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignInFormValues = z.infer<SignInSchema>;

export interface UseSignInReturn {
  form: UseFormReturnType<SignInFormValues>;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: SignInFormValues) => Promise<void>;
}

// ─── MFA placeholder ──────────────────────────────────────────────────────────

/**
 * Reserved MFA step — no-op in this release.
 *
 * Future MFA implementation replaces this function without restructuring the
 * sign-in sequence.
 */
async function runMfaStep(_response: SignInResponse): Promise<void> {
  // no-op: MFA is not implemented in this release
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 401:
      return t`Invalid email or password`;
    case 403:
      return t`Your account does not have admin access`;
    case 429:
      return t`Too many sign-in attempts. Please try again later.`;
    default:
      return t`Sign-in failed. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates the sign-in form logic.
 *
 * @param redirectTo - Path to navigate to after successful sign-in.
 *                     Defaults to "/admin" if not provided (Requirement 1.6).
 */
export function useSignIn(redirectTo?: string): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignInFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zodResolver(buildSignInSchema()),
  });

  const onSubmit = async (values: SignInFormValues): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.signIn({ email: values.email, password: values.password });

      // MFA placeholder — no-op in this release
      await runMfaStep(response);

      // Store both tokens in memory only
      setTokens(response.accessToken, response.refreshToken);

      // Navigate to the redirect target or default admin route
      void navigate({ to: redirectTo ?? "/admin" });
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      const message = mapHttpErrorToMessage(status);
      setErrorMessage(message);

      // On 401: preserve email, clear only the password field
      if (status === 401) {
        form.setFieldValue("password", "");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, errorMessage, onSubmit };
}
