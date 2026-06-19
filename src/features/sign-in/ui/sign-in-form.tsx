import { Alert, Button, Stack, TextInput, PasswordInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { isDemoMode } from "@/app/config/runtime-env";
import { useSignIn } from "../model/use-sign-in";
import { DemoCredentialsHint } from "./demo-credentials-hint";

interface SignInFormProps {
  /** Path to redirect to after successful sign-in. Defaults to "/admin". */
  redirectTo?: string;
}

/**
 * Sign-in form component.
 *
 * Renders email input, password input, and a submit button using Mantine v8
 * components (Requirement 8.1). Each input has a visible label with a for/id
 * relationship for screen reader accessibility (Requirement 8.4). Error
 * messages are rendered in an aria-live="polite" region (Requirement 8.5).
 */
export function SignInForm({ redirectTo }: SignInFormProps) {
  const { t } = useLingui();
  const { form, isLoading, errorMessage, onSubmit } = useSignIn(redirectTo);

  const handleFormSubmit = form.onSubmit(onSubmit);

  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="sign-in-form">
      <Stack gap="md">
        {/* Demo credentials hint — visible only in demo environments */}
        {isDemoMode && <DemoCredentialsHint />}

        {/* ARIA live region for server-side error messages (Requirement 8.5) */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="sign-in-error-alert"
            >
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Email field — label/id relationship satisfies Requirement 8.4 */}
        <TextInput
          id="sign-in-email"
          data-testid="sign-in-email-input"
          label={t`Email`}
          type="email"
          placeholder={t`you@example.com`}
          autoComplete="email"
          inputMode="email"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("email")}
        />

        {/* Password field — label/id relationship satisfies Requirement 8.4 */}
        <PasswordInput
          id="sign-in-password"
          data-testid="sign-in-password-input"
          label={t`Password`}
          placeholder={t`Your password`}
          autoComplete="current-password"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("password")}
        />

        {/* Submit button — disabled and shows loading indicator while in flight (Requirement 1.11) */}
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          data-testid="sign-in-submit-button"
        >
          <Trans>Sign in</Trans>
        </Button>
      </Stack>
    </form>
  );
}
